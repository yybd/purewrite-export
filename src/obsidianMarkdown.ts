/**
 * Obsidian's own Markdown, turned into the CommonMark the engine reads. The
 * engine is PureWrite's and knows nothing of wikilinks or callouts; without
 * this, `![[cover.png]]` would print as text and front matter as a rule
 * followed by YAML. Everything here only rewrites syntax — what the reader
 * sees in Obsidian's Reading view is what goes into the book.
 *
 * Code blocks and inline code are left exactly as written.
 */

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|heic|avif|bmp)$/i;

export interface Resolver {
    /** The vault path of a link target as written in this note, or null. */
    resolve(target: string): string | null;
}

/** A formula as written: `$…$` inline, `$$…$$` on its own. */
export interface Formula {
    tex: string;
    display: boolean;
}

/** What the engine's Markdown cannot carry, taken out before it parses. */
export interface Extract {
    /**
     * Formulas, in the order found; each is left in the text as a
     * placeholder (FORMULA_MARK) for the parsed document to swap back.
     * Without this list, `$…$` stays as written.
     */
    formulas?: Formula[];
    /** The image `src` that stands for a mermaid diagram; null keeps the code. */
    diagram?: (source: string) => string | null;
}

/**
 * Where formula `n` was: two private-use characters around its number,
 * which no Markdown rule reads — so `_` and `*` in TeX are never taken for
 * emphasis, and the number comes through the parser as plain text.
 */
export const formulaMark = (n: number) => `\uE000${n}\uE001`;
export const FORMULA_MARK = /\uE000(\d+)\uE001/g;

/** The pieces of a note that are code, which nothing below may touch. */
function splitCode(text: string): { code: boolean; text: string }[] {
    const parts: { code: boolean; text: string }[] = [];
    // Fenced blocks first, then inline spans in what is left.
    const fence = /^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm;
    let last = 0;
    const pushProse = (prose: string) => {
        const inline = /(`+)[^`]*?\1/g;
        let at = 0;
        for (const m of prose.matchAll(inline)) {
            parts.push({ code: false, text: prose.slice(at, m.index) });
            parts.push({ code: true, text: m[0] });
            at = m.index + m[0].length;
        }
        parts.push({ code: false, text: prose.slice(at) });
    };
    for (const m of text.matchAll(fence)) {
        pushProse(text.slice(last, m.index));
        parts.push({ code: true, text: m[0] });
        last = m.index + m[0].length;
    }
    pushProse(text.slice(last));
    return parts;
}

export function stripFrontMatter(text: string): string {
    return text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
}

/** A path as a Markdown link destination: spaces and parentheses are safe in <…>. */
const destination = (path: string) => `<${path.replace(/[<>]/g, (c) => encodeURIComponent(c))}>`;

function displayName(target: string): string {
    const [file, sub] = target.split('#');
    const base = file.split('/').pop()!.replace(/\.md$/i, '');
    return sub && !base ? sub.replace(/^\^/, '') : base || target;
}

/** `$$…$$`, over lines, then `$…$` on one: Obsidian's rules (no space inside the `$`, no digit after). */
const DISPLAY_MATH = /(?<!\\)\$\$([\s\S]+?)\$\$/g;
const INLINE_MATH = /(?<![\\$])\$(?=[^\s$])([^$\n]*?[^\s\\$])\$(?!\d)/g;

function formulas(text: string, found: Formula[] | undefined): string {
    if (!found) return text;
    const keep = (tex: string, display: boolean) => {
        found.push({ tex, display });
        return formulaMark(found.length - 1);
    };
    return text
        .replace(DISPLAY_MATH, (whole, tex: string) =>
            // Inside a quote or callout, each line of the TeX starts with `>`.
            keep(tex.replace(/\n[ \t]*(?:>[ \t]?)+/g, '\n').trim(), true),
        )
        .replace(INLINE_MATH, (whole, tex: string) => keep(tex, false));
}

/**
 * <details><summary>Title</summary> … </details> → the title in bold and
 * the content open beneath it: a page has no button to open it with.
 */
function details(text: string): string {
    return text
        .replace(/<details\b[^>]*>\s*(?:<summary\b[^>]*>([\s\S]*?)<\/summary>\s*)?/gi, (whole, summary?: string) => {
            const title = (summary ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            return title ? `**${title}**\n\n` : '';
        })
        .replace(/[ \t]*<\/details>[ \t]*/gi, '');
}

function prose(text: string, resolver: Resolver, extract: Extract): string {
    return (
        details(formulas(text, extract.formulas))
            // %% comments %% — Obsidian hides them in Reading view.
            .replace(/%%[\s\S]*?%%/g, '')
            // ![[image.png|alt]] and ![[image.png|300]] → a Markdown image.
            .replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (whole, target: string, alias?: string) => {
                const clean = target.trim();
                if (!IMAGE_EXT.test(clean.split('#')[0])) return displayName(clean); // a note embed: its name
                const path = resolver.resolve(clean.split('#')[0]) ?? clean;
                const alt = alias && !/^\d+(x\d+)?$/.test(alias.trim()) ? alias.trim() : '';
                return `![${alt}](${destination(path)})`;
            })
            // ![alt](relative/or/vault/path.png) → the vault path it resolves to.
            .replace(/!\[([^\]]*)\]\((<[^>]+>|[^)\s]+)(\s+"[^"]*")?\)/g, (whole, alt: string, dest: string, title = '') => {
                const raw = dest.startsWith('<') ? dest.slice(1, -1) : dest;
                if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return whole; // http:, data:, …
                let decoded = raw;
                try {
                    decoded = decodeURI(raw);
                } catch {
                    /* written unencoded with a literal % */
                }
                const path = resolver.resolve(decoded);
                return path ? `![${alt}](${destination(path)}${title})` : whole;
            })
            // [[note|alias]], [[note#heading]] → the text a reader sees.
            .replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (whole, target: string, alias?: string) =>
                alias?.trim() ? alias.trim() : displayName(target.trim()),
            )
            // ==highlight== → the text.
            .replace(/==([^=\n]+)==/g, '$1')
            // > [!note] Title → a quote that starts with the title in bold, as
            // a paragraph of its own (the empty `>` line ends it; without it
            // the title runs into the callout's first line).
            .replace(/^(\s*>\s*)\[![\w-]+\][+-]?[ \t]*(.*)$/gm, (whole, quote: string, title: string) =>
                title.trim() ? `${quote}**${title.trim()}**\n${quote.trimEnd()}` : quote.trimEnd(),
            )
            // ^block-id at the end of a line.
            .replace(/[ \t]+\^[\w-]+[ \t]*$/gm, '')
    );
}

const MERMAID = /^(```|~~~)[ \t]*mermaid[ \t]*\n([\s\S]*?)\n?\1[^\n]*$/i;

/** The source of every mermaid diagram in a note, in order. */
export function mermaidSources(text: string): string[] {
    return splitCode(stripFrontMatter(text)).flatMap((part) => {
        const m = part.code ? MERMAID.exec(part.text) : null;
        return m ? [m[2]] : [];
    });
}

function code(text: string, extract: Extract): string {
    const m = extract.diagram ? MERMAID.exec(text) : null;
    const src = m && extract.diagram!(m[2]);
    return src ? `![](${src})` : text;
}

/** A note's text as the engine should read it. */
export function toCommonMark(text: string, resolver: Resolver, extract: Extract = {}): string {
    return splitCode(stripFrontMatter(text))
        .map((part) => (part.code ? code(part.text, extract) : prose(part.text, resolver, extract)))
        .join('');
}

const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LTR = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/;

/** The book's default direction: that of its first strong letter. */
export function detectDirection(text: string): 'rtl' | 'ltr' {
    for (const ch of text) {
        if (RTL.test(ch)) return 'rtl';
        if (LTR.test(ch)) return 'ltr';
    }
    return 'ltr';
}
