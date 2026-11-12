import { Extension, Mark, Node, mergeAttributes, type Editor } from '@tiptap/core';
import type { MarkdownSerializerState } from 'prosemirror-markdown';
import type { Mark as ProseMirrorMark, Node as ProseMirrorNode } from '@tiptap/pm/model';
import type MarkdownIt from 'markdown-it';
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs';
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';
import type Token from 'markdown-it/lib/token.mjs';
import { HTML_TAG_RE } from 'markdown-it/lib/common/html_re.mjs';
import { INLINE_MATH, WIKILINK } from './TextWithCitations';

/**
 * A file comes back from the editor as it was written.
 *
 * The save writes the whole document through the serializer, so the first
 * keystroke anywhere rewrote everything the serializer spells its own way:
 *
 * 1. Raw HTML. With html off (kept off: the webview can reach the file
 *    system), `<details>…` and `<kbd>Ctrl</kbd>` opened as text and were saved
 *    escaped, `&lt;kbd&gt;` — broken for every other reader. A block of HTML is
 *    now a `rawMarkdown` node and a tag inside a line carries the `rawHtml`
 *    mark: both are shown as their source, editable, never rendered, and
 *    written back verbatim. Angle brackets the writer types are still text and
 *    still escaped.
 * 2. Reference links. markdown-it resolves `[docs][1]` against `[1]: url` and
 *    drops the definition, so the save inlined every link and deleted the
 *    definition lines. Definitions are now a `rawMarkdown` node, as written,
 *    and a link remembers its form; it is written `[text][label]` as long as
 *    that definition still gives its URL and title, and inline otherwise — a
 *    link is never left pointing at nothing.
 * 3. `$$` display math across lines, folded into one line by the paragraph,
 *    is a `rawMarkdown` node. (Inline math and `[[wikilinks]]` are text,
 *    written unescaped: see TextWithCitations.ts.)
 * 4. The writer's own spelling: `*` and `+` bullets, `_em_`, `__strong__`,
 *    setext headings and a two-space hard break each keep the marker they
 *    were written with. Something new follows the marker the file already
 *    uses most, and the serializer's own where the file has none.
 */

// ── The nodes ───────────────────────────────────────────────────────────────

/** What a `rawMarkdown` node holds: a block of HTML, link definitions or display math. */
export type RawKind = 'html' | 'definitions' | 'math';

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Lines of Markdown the editor has no node for, kept as typed. A text block
 * like a code block: the writer sees the source and can edit it.
 */
export const RawMarkdown = Node.create({
    name: 'rawMarkdown',
    group: 'block',
    content: 'text*',
    marks: '',
    code: true,
    defining: true,

    addAttributes() {
        return {
            kind: {
                default: 'html',
                parseHTML: (el: HTMLElement) => el.getAttribute('data-raw-markdown') || 'html',
                renderHTML: (attrs: { kind?: string }) => ({ 'data-raw-markdown': attrs.kind }),
            },
        };
    },

    parseHTML() {
        // Above the code block's plain `pre`.
        return [{ tag: 'pre[data-raw-markdown]', preserveWhitespace: 'full', priority: 100 }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['pre', mergeAttributes(HTMLAttributes, { class: 'raw-markdown', dir: 'auto', spellcheck: 'false' }), 0];
    },

    addKeyboardShortcuts() {
        // Link definitions usually close the file: without a way out, nothing
        // could be typed after them.
        const exitAtEnd = () => {
            const { $from, empty } = this.editor.state.selection;
            if (!empty || $from.parent.type.name !== this.name) return false;
            if ($from.parentOffset !== $from.parent.content.size) return false;
            if ($from.index($from.depth - 1) !== $from.node($from.depth - 1).childCount - 1) return false;
            return this.editor.commands.exitCode();
        };
        return { ArrowDown: exitAtEnd, ArrowRight: exitAtEnd, 'Mod-Enter': () => this.editor.commands.exitCode() };
    },

    addStorage() {
        return {
            markdown: {
                serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
                    if (node.textContent) state.text(node.textContent, false);
                    state.closeBlock(node);
                },
                parse: {
                    setup(markdownit: MarkdownIt) {
                        fidelityPlugin(markdownit);
                    },
                },
            },
        };
    },
});

/** An HTML tag inside a line — `<kbd>`, `</kbd>`, `<img src="a.png">` — as typed. */
export const RawHtml = Mark.create({
    name: 'rawHtml',
    inclusive: false,
    code: true,

    parseHTML() {
        return [{ tag: 'span[data-raw-html]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-raw-html': '', class: 'raw-html', dir: 'ltr' }), 0];
    },

    addStorage() {
        return {
            // The text inside is written as is by TextWithCitations.ts.
            markdown: { serialize: { open: '', close: '' }, parse: {} },
        };
    },
});

// ── Reading: markdown-it rules ──────────────────────────────────────────────

/** markdown-it's rule list, which its typings leave out. */
interface RulerInternals<T> {
    __rules__: Array<{ name: string; fn: T }>;
}

type BlockRule = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;
type InlineRule = (state: StateInline, silent: boolean) => boolean;

const installed = new WeakSet<MarkdownIt>();

function ruleFn<T>(ruler: unknown, name: string): T | undefined {
    return (ruler as RulerInternals<T>).__rules__.find((r) => r.name === name)?.fn;
}

/** The lines from `start` to `end`, inside whatever container they sit in, without the final newline. */
function linesOf(state: StateBlock, start: number, end: number): string {
    return state.getLines(start, end, state.blkIndent, false).replace(/\n$/, '');
}

function pushRaw(state: StateBlock, kind: RawKind, start: number, end: number): void {
    const token = state.push('raw_markdown', 'pre', 0);
    token.info = kind;
    token.content = linesOf(state, start, end);
    token.map = [start, end];
    token.block = true;
}

// `$$` on a line, the formula, and a line ending in `$$` — a block that may
// interrupt a paragraph, as in Obsidian and Pandoc. A blank line before the
// closing `$$` means it was not display math, and nothing is taken.
function mathBlock(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const first = state.src.slice(state.bMarks[startLine] + state.tShift[startLine], state.eMarks[startLine]).trimEnd();
    if (!first.startsWith('$$')) return false;
    // `$$ x $$` on one line is inline math (TextWithCitations.ts).
    if (first.length > 2 && first.endsWith('$$') && first.length >= 4) return false;

    let line = startLine + 1;
    for (; line < endLine; line++) {
        if (state.isEmpty(line) || state.sCount[line] < state.blkIndent) return false;
        const text = state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line]).trimEnd();
        if (text.endsWith('$$')) break;
    }
    if (line >= endLine) return false;
    if (silent) return true;

    pushRaw(state, 'math', startLine, line + 1);
    state.line = line + 1;
    return true;
}

// markdown-it's own `reference` rule — it still fills env.references, so the
// links resolve — but the definitions, and the ones right under them, are
// kept as one block of the document instead of vanishing.
function keepDefinitions(reference: BlockRule): BlockRule {
    return (state, startLine, endLine, silent) => {
        if (silent) return reference(state, startLine, endLine, true);
        if (!reference(state, startLine, endLine, false)) return false;
        while (state.line < endLine && !state.isEmpty(state.line) && reference(state, state.line, endLine, false)) {
            // the next definition is taken by the call itself
        }
        pushRaw(state, 'definitions', startLine, state.line);
        return true;
    };
}

// markdown-it's own `html_block` rule, run as if html were on; what it finds
// is kept as source, never handed to the DOM as markup.
function keepHtmlBlock(htmlBlock: BlockRule): BlockRule {
    return (state, startLine, endLine, silent) => {
        const options = state.md.options;
        const html = options.html;
        options.html = true;
        let found: boolean;
        try {
            found = htmlBlock(state, startLine, endLine, silent);
        } finally {
            options.html = html;
        }
        if (!found || silent) return found;
        const token = state.tokens[state.tokens.length - 1];
        token.type = 'raw_markdown';
        token.tag = 'pre';
        token.info = 'html';
        token.content = linesOf(state, startLine, state.line);
        return true;
    };
}

// A tag inside a line, as one token — before emphasis and links read inside it.
function htmlTag(state: StateInline, silent: boolean): boolean {
    if (state.src.charCodeAt(state.pos) !== 0x3c /* < */) return false;
    const match = HTML_TAG_RE.exec(state.src.slice(state.pos, state.posMax));
    if (!match) return false;
    if (!silent) state.push('raw_html_inline', '', 0).content = match[0];
    state.pos += match[0].length;
    return true;
}

// `[[note]]` and `![[embed]]`, and `$x$`: text, but read as one piece, so an
// underscore in a note name or a formula is not emphasis.
function sticky(pattern: RegExp): InlineRule {
    const re = new RegExp(pattern.source, 'yu');
    return (state, silent) => {
        re.lastIndex = state.pos;
        const match = re.exec(state.src);
        if (!match || state.pos + match[0].length > state.posMax) return false;
        if (!silent) state.push('text', '', 0).content = match[0];
        state.pos += match[0].length;
        return true;
    };
}

// The two spaces before a hard break, which the token does not keep: the
// `\` form comes from the escape rule, this one from the newline rule.
function keepBreakSpaces(newline: InlineRule): InlineRule {
    return (state, silent) => {
        const spaces = silent ? 0 : state.pending.length - state.pending.replace(/ +$/, '').length;
        if (!newline(state, silent)) return false;
        const last = state.tokens[state.tokens.length - 1];
        if (!silent && spaces >= 2 && last?.type === 'hardbreak') last.markup = ' '.repeat(spaces);
        return true;
    };
}

// The link's form — `[text][label]`, `[text][]`, `[text]` — which the token
// does not keep either.
function keepLinkForm(link: InlineRule): InlineRule {
    return (state, silent) => {
        const start = state.pos;
        const before = state.tokens.length;
        if (!link(state, silent)) return false;
        if (silent) return true;
        const open = state.tokens.slice(before).find((t) => t.type === 'link_open');
        const end = state.pos;
        const labelEnd = state.md.helpers.parseLinkLabel(state, start, true);
        state.pos = end;
        if (!open || labelEnd < 0) return true;
        const tail = state.src.slice(labelEnd + 1, end);
        if (tail.startsWith('(')) return true;
        const text = state.src.slice(start + 1, labelEnd);
        if (tail === '') open.attrSet('data-md-ref', `shortcut:${text}`);
        else if (tail === '[]') open.attrSet('data-md-ref', `collapsed:${text}`);
        else open.attrSet('data-md-ref', `full:${tail.slice(1, -1)}`);
        return true;
    };
}

// A setext heading's underline, from its last line.
function setextUnderlines(state: StateCore): void {
    let lines: string[] | null = null;
    for (const token of state.tokens) {
        if (token.type !== 'heading_open' || !/^[=-]$/.test(token.markup) || !token.map) continue;
        lines ??= state.src.split('\n');
        const underline = /([=-]+)[ \t]*$/.exec(lines[token.map[1] - 1] ?? '')?.[1];
        if (underline) token.attrSet('data-md', underline);
    }
}

type RenderRule = (tokens: Token[], idx: number, options: MarkdownIt['options'], env: unknown, self: MarkdownIt['renderer']) => string;

function withMarkup(): RenderRule {
    return (tokens, idx, options, _env, self) => {
        tokens[idx].attrSet('data-md', tokens[idx].markup);
        return self.renderToken(tokens, idx, options);
    };
}

export function fidelityPlugin(md: MarkdownIt): void {
    if (installed.has(md)) return;
    installed.add(md);

    md.block.ruler.before('fence', 'math_block', mathBlock, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
    const reference = ruleFn<BlockRule>(md.block.ruler, 'reference');
    if (reference) md.block.ruler.at('reference', keepDefinitions(reference));
    const htmlBlock = ruleFn<BlockRule>(md.block.ruler, 'html_block');
    if (htmlBlock) md.block.ruler.at('html_block', keepHtmlBlock(htmlBlock), { alt: ['paragraph', 'reference', 'blockquote'] });

    md.inline.ruler.before('escape', 'inline_math', sticky(INLINE_MATH));
    md.inline.ruler.before('link', 'wikilink', sticky(WIKILINK));
    md.inline.ruler.before('html_inline', 'raw_html_inline', htmlTag);
    const newline = ruleFn<InlineRule>(md.inline.ruler, 'newline');
    if (newline) md.inline.ruler.at('newline', keepBreakSpaces(newline));
    const link = ruleFn<InlineRule>(md.inline.ruler, 'link');
    if (link) md.inline.ruler.at('link', keepLinkForm(link));
    md.core.ruler.push('setext_underlines', setextUnderlines);

    md.renderer.rules.raw_markdown = (tokens, idx) =>
        `<pre data-raw-markdown="${escapeHtml(tokens[idx].info)}">${escapeHtml(tokens[idx].content)}</pre>\n`;
    md.renderer.rules.raw_html_inline = (tokens, idx) =>
        `<span data-raw-html="">${escapeHtml(tokens[idx].content)}</span>`;
    // tiptap-markdown's own, minus the newline it strips.
    // `data-md` is the number of spaces, 0 for a `\` break.
    md.renderer.rules.hardbreak = (tokens, idx) => `<br data-md="${tokens[idx].markup.length}">`;
    for (const type of ['bullet_list_open', 'em_open', 'strong_open']) md.renderer.rules[type] = withMarkup();
    // A line break inside a paragraph is a space to the editor. tiptap-markdown
    // strips a newline that follows an element (the one markdown-it puts after
    // a block), so after `**a**` or `<kbd>K</kbd>` the break vanished and
    // `**a**\nb` was saved as `**a**b` — two words made one. A space before it
    // survives, and collapses with it into the one space it always was.
    md.renderer.rules.softbreak = () => ' \n';
}

// ── Writing ─────────────────────────────────────────────────────────────────

type NodeSerializer = (state: MarkdownSerializerState, node: ProseMirrorNode, parent: ProseMirrorNode, index: number) => void;
type MarkString = string | ((state: MarkdownSerializerState, mark: ProseMirrorMark, parent: ProseMirrorNode, index: number) => string);
interface MarkSpec {
    open: MarkString;
    close: MarkString;
    mixable?: boolean;
    expelEnclosingWhitespace?: boolean;
    /** The delimiter for this mark, for open and close alike. */
    delimiter?: (state: MarkdownSerializerState, mark: ProseMirrorMark, parent: ProseMirrorNode, index: number) => string;
}

/** The serializer state as tiptap-markdown builds it, with its table flag. */
type State = MarkdownSerializerState & {
    inTable?: boolean;
    marks: Record<string, MarkSpec>;
    // prosemirror-markdown's own, which its typings leave out.
    out: string;
    closed: ProseMirrorNode | null;
    flushClose(size?: number): void;
};

/** What the file mostly uses, for something new; the serializer's own where it uses nothing. */
interface Defaults {
    bullet: string;
    em: string;
    strong: string;
    breakSpaces: number;
    setext: boolean;
}

function mostUsed<T>(counts: Map<T, number>, fallback: T): T {
    let best = fallback;
    let bestCount = 0;
    for (const [value, count] of counts) if (count > bestCount) [best, bestCount] = [value, count];
    return best;
}

function defaultsOf(doc: ProseMirrorNode): Defaults {
    const tally = () => new Map<string, number>();
    const bump = (map: Map<string, number>, key: unknown) => {
        if (key != null && key !== '') map.set(String(key), (map.get(String(key)) ?? 0) + 1);
    };
    const bullet = tally();
    const em = tally();
    const strong = tally();
    const breaks = tally();
    const headings = tally();
    doc.descendants((node) => {
        if (node.type.name === 'bulletList') bump(bullet, node.attrs.mdMarker);
        else if (node.type.name === 'heading' && node.attrs.level <= 2) bump(headings, node.attrs.mdSetext ? 'setext' : 'atx');
        else if (node.type.name === 'hardBreak') bump(breaks, node.attrs.mdSpaces);
        for (const mark of node.marks) {
            if (mark.type.name === 'italic') bump(em, mark.attrs.mdDelimiter);
            else if (mark.type.name === 'bold') bump(strong, mark.attrs.mdDelimiter);
        }
    });
    return {
        bullet: mostUsed(bullet, '-'),
        em: mostUsed(em, '*'),
        strong: mostUsed(strong, '**'),
        breakSpaces: Number(mostUsed(breaks, '0')),
        setext: mostUsed(headings, 'atx') === 'setext',
    };
}

const WORD = /[\p{L}\p{N}]/u;

/**
 * `_` cannot open or close emphasis inside a word (`a_em_` is not emphasis),
 * so where text now touches it, the star is written instead.
 */
function underscoreFits(state: MarkdownSerializerState, mark: ProseMirrorMark, parent: ProseMirrorNode, index: number): boolean {
    // A block still to be closed has not written its newlines yet: what the
    // output ends with then is the previous block, not this one.
    const { closed, out } = state as State;
    if (!closed && WORD.test(out.slice(-1))) return false;
    let next = index;
    while (next < parent.childCount && mark.isInSet(parent.child(next).marks)) next++;
    const last = next > index ? parent.child(next - 1) : null;
    // A space at the end of the run is written after the delimiter.
    if (last?.isText && /\s$/u.test(last.text ?? '')) return true;
    const after = next < parent.childCount ? parent.child(next) : null;
    return !(after?.isText && WORD.test(after.text?.[0] ?? ''));
}

/** The text of the run of `mark` that ends before child `index`. */
function runTextBefore(mark: ProseMirrorMark, parent: ProseMirrorNode, index: number): string {
    let text = '';
    for (let i = index - 1; i >= 0 && mark.isInSet(parent.child(i).marks); i--) text = parent.child(i).textContent + text;
    return text;
}

const PATCHED = Symbol('purewrite-markdown-fidelity');

/**
 * Lets a mark spec choose its delimiter per mark. tiptap-markdown's state
 * reads `open` as a string (it moves the delimiter past whitespace itself),
 * so the chosen delimiter is put in as a string for the length of the call.
 */
function patchState(state: State): void {
    const tagged = state as State & { [PATCHED]?: true };
    if (tagged[PATCHED]) return;
    tagged[PATCHED] = true;
    const markString = state.markString.bind(state);
    const chosen = new Map<ProseMirrorMark, string>();
    state.markString = (mark, open, parent, index) => {
        const spec = state.marks[mark.type.name];
        if (!spec?.delimiter) return markString(mark, open, parent, index);
        let delimiter = chosen.get(mark);
        if (open || delimiter === undefined) delimiter = spec.delimiter(state, mark, parent, index);
        if (open) chosen.set(mark, delimiter);
        else chosen.delete(mark);
        state.marks[mark.type.name] = { ...spec, open: delimiter, close: delimiter };
        try {
            return markString(mark, open, parent, index);
        } finally {
            state.marks[mark.type.name] = spec;
        }
    };
}

interface TiptapSerializer {
    editor: Editor;
    serialize(content: ProseMirrorNode): string;
    readonly nodes: Record<string, NodeSerializer>;
    readonly marks: Record<string, MarkSpec>;
}
type TiptapSerializerClass = new (editor: Editor) => TiptapSerializer;

function faithfulSerializer(Base: TiptapSerializerClass, editor: Editor, md: () => MarkdownIt): TiptapSerializer {
    let defaults: Defaults | null = null;
    let references: Record<string, { href: string; title?: string }> = {};

    const refersTo = (mark: ProseMirrorMark, parent: ProseMirrorNode, index: number): string | null => {
        const ref = String(mark.attrs.mdRef ?? '');
        const colon = ref.indexOf(':');
        if (colon < 0) return null;
        const form = ref.slice(0, colon);
        const label = ref.slice(colon + 1);
        const normalize = md().utils.normalizeReference;
        const target = references[normalize(label)];
        if (!target || target.href !== mark.attrs.href || (target.title || null) !== (mark.attrs.title || null)) return null;
        if (form === 'full') return `][${label}]`;
        if (normalize(runTextBefore(mark, parent, index)) !== normalize(label)) return null;
        return form === 'collapsed' ? '][]' : ']';
    };

    class Faithful extends Base {
        serialize(content: ProseMirrorNode): string {
            const doc = editor.state.doc;
            defaults = defaultsOf(doc);
            const definitions: string[] = [];
            doc.descendants((node) => {
                if (node.type.name === 'rawMarkdown' && node.attrs.kind === 'definitions') definitions.push(node.textContent);
                return true;
            });
            const env: { references?: typeof references } = {};
            if (definitions.length) md().parse(definitions.join('\n\n'), env);
            references = env.references ?? {};
            try {
                return super.serialize(content);
            } finally {
                defaults = null;
                references = {};
            }
        }

        get nodes(): Record<string, NodeSerializer> {
            const nodes: Record<string, NodeSerializer> = { ...super.nodes };
            const heading = nodes.heading;
            const hardBreak = nodes.hardBreak;
            const bulletList = nodes.bulletList;

            nodes.bulletList = (state, node, parent, index) => {
                const marker = node.attrs.mdMarker || defaults?.bullet;
                if (!marker || !bulletList) return bulletList?.(state, node, parent, index);
                // Two lists in a row are kept apart by an extra blank line, or
                // they would read back as one — unless their markers differ,
                // which already keeps them apart.
                const { closed } = state as State;
                if (closed?.type === node.type && (closed.attrs.mdMarker || defaults?.bullet) !== marker) {
                    (state as State).flushClose(2);
                }
                state.renderList(node, '  ', () => `${marker} `);
            };
            nodes.heading = (state, node, parent, index) => {
                const underline = node.attrs.level <= 2
                    ? node.attrs.mdSetext || (defaults?.setext ? (node.attrs.level === 1 ? '===' : '---') : null)
                    : null;
                // A level-1 underline is `=`, a level-2 one `-`: a heading moved
                // between the two gets the other character.
                if (!underline) return heading(state, node, parent, index);
                const char = node.attrs.level === 1 ? '=' : '-';
                state.renderInline(node);
                state.ensureNewLine();
                state.write(char.repeat(Math.max(underline.length, 3)));
                state.closeBlock(node);
            };
            nodes.hardBreak = (state, node, parent, index) => {
                const spaces = node.attrs.mdSpaces ?? defaults?.breakSpaces ?? 0;
                if (spaces < 2 || (state as State).inTable) return hardBreak(state, node, parent, index);
                // As tiptap-markdown does: a break with nothing after it is not written.
                for (let i = index + 1; i < parent.childCount; i++) {
                    if (parent.child(i).type !== node.type) {
                        state.write(`${' '.repeat(spaces)}\n`);
                        return;
                    }
                }
            };

            for (const [name, serialize] of Object.entries(nodes)) {
                nodes[name] = (state, node, parent, index) => {
                    patchState(state as State);
                    return serialize(state, node, parent, index);
                };
            }
            return nodes;
        }

        get marks(): Record<string, MarkSpec> {
            const marks: Record<string, MarkSpec> = { ...super.marks };
            const emphasis = (name: 'italic' | 'bold', fallback: () => string) => {
                if (!marks[name]) return;
                marks[name] = {
                    ...marks[name],
                    delimiter: (state, mark, parent, index) => {
                        const delimiter: string = mark.attrs.mdDelimiter || fallback();
                        if (delimiter.startsWith('_') && !underscoreFits(state, mark, parent, index)) return delimiter.replace(/_/g, '*');
                        return delimiter;
                    },
                };
            };
            emphasis('italic', () => defaults?.em ?? '*');
            emphasis('bold', () => defaults?.strong ?? '**');

            const link = marks.link;
            if (link && typeof link.close === 'function') {
                const close = link.close;
                marks.link = {
                    ...link,
                    close: (state, mark, parent, index) => {
                        const inline = close(state, mark, parent, index);
                        return inline.startsWith('](') ? (refersTo(mark, parent, index) ?? inline) : inline;
                    },
                };
            }
            return marks;
        }
    }
    return new Faithful(editor);
}

// ── The extension ───────────────────────────────────────────────────────────

const fromData = (name: string) => (el: HTMLElement) => el.getAttribute(name) || null;
const toData = (name: string, key: string) => (attrs: Record<string, unknown>) =>
    attrs[key] != null ? { [name]: String(attrs[key]) } : {};

export const MarkdownFidelity = Extension.create({
    name: 'markdownFidelity',
    // After tiptap-markdown (50), whose storage this replaces the serializer in.
    priority: 40,

    addGlobalAttributes() {
        return [
            {
                types: ['bulletList'],
                attributes: { mdMarker: { default: null, parseHTML: fromData('data-md'), renderHTML: toData('data-md', 'mdMarker') } },
            },
            {
                types: ['italic', 'bold'],
                attributes: { mdDelimiter: { default: null, parseHTML: fromData('data-md'), renderHTML: toData('data-md', 'mdDelimiter') } },
            },
            {
                types: ['heading'],
                attributes: { mdSetext: { default: null, parseHTML: fromData('data-md'), renderHTML: toData('data-md', 'mdSetext') } },
            },
            {
                types: ['hardBreak'],
                attributes: {
                    mdSpaces: {
                        default: null,
                        parseHTML: (el: HTMLElement) => (el.hasAttribute('data-md') ? Number(el.getAttribute('data-md')) : null),
                        renderHTML: toData('data-md', 'mdSpaces'),
                    },
                },
            },
            {
                types: ['link'],
                attributes: { mdRef: { default: null, parseHTML: fromData('data-md-ref'), renderHTML: toData('data-md-ref', 'mdRef') } },
            },
        ];
    },

    onBeforeCreate() {
        const markdown = this.editor.storage.markdown as unknown as { serializer: TiptapSerializer; parser: { md: MarkdownIt } };
        const Base = markdown.serializer.constructor as TiptapSerializerClass;
        markdown.serializer = faithfulSerializer(Base, this.editor, () => markdown.parser.md);
    },
});
