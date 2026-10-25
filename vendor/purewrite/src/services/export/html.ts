import type { JSONContent } from '@tiptap/core';
import { firstStrongDirection } from '../../extensions/ParagraphDirection';
import { DirectionTracker, plainText } from './direction';
import type { ExportChapter, ExportImage } from './docx';
import { DEFAULT_TEMPLATE, FIRST_LINE_INDENT, type ExportTemplate } from './templates';

/**
 * A folder of chapters as one HTML document laid out for print — what the
 * PDF is made from (pdf.ts lays it out into pages with paged.js; the system's
 * WebKit draws them). The same editor JSON as the Word export, the same
 * direction rule per block (DirectionTracker): every block carries its `dir`,
 * so WebKit's own bidi does the rest, exactly as in the editor.
 *
 * Footnotes are placed where they are referenced, as `float: footnote`
 * elements; paged.js moves each to the bottom of the page its reference
 * lands on and numbers them through the whole book.
 */

type Dir = 'rtl' | 'ltr';

export interface HtmlInput {
    title: string;
    chapters: ExportChapter[];
    defaultDirection: Dir;
    template?: ExportTemplate;
    chapterPageBreak?: boolean;
    /** Indent each paragraph that follows another, as the editor shows it. */
    firstLineIndent?: boolean;
}

/**
 * The book rule for the first-line indent setting, shared by the PDF and the
 * EPUB: a paragraph that follows a paragraph is indented; the first after a
 * heading, list, quote or picture is not. text-indent starts from the line's
 * own start, so a Hebrew paragraph is indented on the right.
 */
export function firstLineIndentCss(indent: string, gap: string): string {
    // An indent and a blank line both mark a new paragraph, and print uses
    // one of them: the negative top margin cancels the previous paragraph's
    // bottom margin (they collapse to zero), so indented paragraphs sit
    // together while headings, lists and quotes keep their space. A margin
    // rather than :has(), which not every EPUB reader knows.
    return `.chapter > p:not(.figure) + p:not(.figure) { text-indent: ${indent}; margin-top: -${gap}; }`;
}

// Characters XML forbids (control characters other than tab and newlines):
// one of them makes an EPUB chapter unreadable.
// eslint-disable-next-line no-control-regex -- control characters are what this pattern removes
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

export function escapeHtml(s: string): string {
    return s.replace(INVALID_XML, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function base64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}

const isExternalLink = (href: string) => /^(https?:|mailto:)/i.test(href);

const MARK_TAGS: Record<string, string> = {
    bold: 'strong',
    italic: 'em',
    underline: 'u',
    strike: 's',
    code: 'code',
    superscript: 'sup',
    subscript: 'sub',
};

/**
 * How the writer differs between the two books it makes. Print (the PDF):
 * footnotes float to the bottom of their page, images inline as data URLs.
 * EPUB: footnotes are EPUB 3 notes (a `noteref` link and an `aside` at the
 * end of the chapter, which Apple Books and others show as a popup), images
 * are files of their own, and headings carry ids for the table of contents.
 */
export type HtmlMode = 'print' | 'epub';

export interface TocEntry {
    level: number;
    id: string;
    text: string;
}

export class HtmlWriter {
    private directions: DirectionTracker;
    private definitions = new Map<string, JSONContent>();
    private images = new Map<string, ExportImage>();
    private imageUrls = new Map<ExportImage, string>();
    private inFootnote = false;
    private footnoteNumber = 0;
    private notes: string[] = [];
    private headingNumber = 0;
    rtlBlocks = 0;
    ltrBlocks = 0;
    /** EPUB: the image files, in the order first used. */
    media: { image: ExportImage; path: string }[] = [];
    /** EPUB: the headings of the last chapter written, for the table of contents. */
    headings: TocEntry[] = [];

    constructor(defaultDirection: Dir, private mode: HtmlMode = 'print') {
        this.directions = new DirectionTracker(defaultDirection);
    }

    chapter(chapter: ExportChapter): string {
        this.definitions = new Map();
        this.images = chapter.images ?? new Map();
        this.notes = [];
        this.headings = [];
        for (const node of chapter.doc.content ?? []) {
            if (node.type === 'footnoteDefinition') this.definitions.set(String(node.attrs?.label), node);
        }
        const body = (chapter.doc.content ?? [])
            .filter((n) => n.type !== 'footnoteDefinition')
            .map((n) => this.block(n))
            .join('');
        const notes = this.notes.length ? `<section class="footnotes" epub:type="footnotes">${this.notes.join('')}</section>` : '';
        return `<section class="chapter">${body}${notes}</section>`;
    }

    private count(dir: Dir) {
        if (this.inFootnote) return;
        if (dir === 'rtl') this.rtlBlocks++;
        else this.ltrBlocks++;
    }

    private block(node: JSONContent, forced?: Dir): string {
        switch (node.type) {
            case 'paragraph':
            case 'heading': {
                const dir = this.directions.block(node, forced);
                this.count(dir);
                const tag = node.type === 'heading' ? `h${Math.min(6, Number(node.attrs?.level) || 1)}` : 'p';
                const align = node.attrs?.textAlign ? ` style="text-align:${escapeHtml(String(node.attrs.textAlign))}"` : '';
                const imageOnly = (node.content ?? []).length > 0 && (node.content ?? []).every((c) => c.type === 'image');
                const cls = imageOnly ? ' class="figure"' : '';
                let id = '';
                if (node.type === 'heading' && this.mode === 'epub' && !this.inFootnote) {
                    const anchor = `h${++this.headingNumber}`;
                    id = ` id="${anchor}"`;
                    this.headings.push({ level: Number(node.attrs?.level) || 1, id: anchor, text: plainText(node) });
                }
                return `<${tag}${id} dir="${dir}"${cls}${align}>${this.inlines(node.content ?? [], dir)}</${tag}>`;
            }
            case 'blockquote': {
                const dir = this.directions.container(node, forced);
                return `<blockquote dir="${dir}">${(node.content ?? []).map((c) => this.block(c, dir)).join('')}</blockquote>`;
            }
            case 'bulletList':
            case 'orderedList': {
                const dir = this.directions.container(node, forced);
                const tag = node.type === 'orderedList' ? 'ol' : 'ul';
                const start = node.type === 'orderedList' && Number(node.attrs?.start) > 1 ? ` start="${Number(node.attrs?.start)}"` : '';
                const items = (node.content ?? [])
                    .map((item) => `<li>${(item.content ?? []).map((c) => this.block(c, dir)).join('')}</li>`)
                    .join('');
                return `<${tag} dir="${dir}"${start}>${items}</${tag}>`;
            }
            case 'taskList': {
                const dir = this.directions.container(node, forced);
                const items = (node.content ?? [])
                    .map((item) => {
                        const box = `<span class="box">${item.attrs?.checked ? '☒' : '☐'}</span>`;
                        return `<li>${box}${(item.content ?? []).map((c) => this.block(c, dir)).join('')}</li>`;
                    })
                    .join('');
                return `<ul class="tasks" dir="${dir}">${items}</ul>`;
            }
            case 'codeBlock': {
                const text = (node.content ?? []).map((c) => c.text ?? '').join('');
                return `<pre dir="ltr"><code>${escapeHtml(text)}</code></pre>`;
            }
            case 'horizontalRule':
                return '<hr />';
            case 'table':
                return this.table(node, forced);
            case 'image':
                return this.block({ type: 'paragraph', content: [node] }, forced);
            case 'footnoteDefinition':
                return '';
            default:
                if (node.content) return node.content.map((c) => this.block(c, forced)).join('');
                if (node.text) return this.block({ type: 'paragraph', content: [node] }, forced);
                return '';
        }
    }

    private table(node: JSONContent, forced?: Dir): string {
        const dir = this.directions.container(node, forced);
        const rows = (node.content ?? [])
            .map((row) => {
                const cells = (row.content ?? [])
                    .map((cell) => {
                        const tag = cell.type === 'tableHeader' ? 'th' : 'td';
                        const span = Number(cell.attrs?.colspan) > 1 ? ` colspan="${Number(cell.attrs?.colspan)}"` : '';
                        const align = cell.attrs?.alignment ? ` style="text-align:${escapeHtml(String(cell.attrs.alignment))}"` : '';
                        // Cells resolve their own direction, as in the editor.
                        return `<${tag}${span}${align}>${(cell.content ?? []).map((c) => this.block(c)).join('')}</${tag}>`;
                    })
                    .join('');
                return `<tr>${cells}</tr>`;
            })
            .join('');
        return `<table dir="${dir}">${rows}</table>`;
    }

    private inlines(nodes: JSONContent[], dir: Dir): string {
        return nodes
            .map((node) => {
                switch (node.type) {
                    case 'text':
                        return this.marked(node);
                    case 'hardBreak':
                        return '<br />';
                    case 'footnoteReference':
                        return this.footnote(String(node.attrs?.label), dir);
                    case 'image':
                        return this.image(node);
                    default:
                        return node.text ? escapeHtml(node.text) : '';
                }
            })
            .join('');
    }

    private marked(node: JSONContent): string {
        let html = escapeHtml(node.text ?? '');
        for (const mark of node.marks ?? []) {
            if (mark.type === 'link') {
                const href = String(mark.attrs?.href ?? '');
                if (isExternalLink(href)) html = `<a href="${escapeHtml(href)}">${html}</a>`;
                continue;
            }
            const tag = MARK_TAGS[mark.type];
            if (tag) html = `<${tag}>${html}</${tag}>`;
        }
        return html;
    }

    private footnote(label: string, dir: Dir): string {
        const definition = this.definitions.get(label);
        if (!definition || this.inFootnote) return escapeHtml(`[^${label}]`);
        const noteDir = firstStrongDirection(plainText(definition)) ?? dir;
        if (this.mode === 'epub') return this.epubNote(definition, noteDir);
        this.inFootnote = true;
        // Paragraphs of a note as spans: the note itself must stay an inline element for paged.js.
        const body = this.directions.aside(() =>
            (definition.content ?? [])
                .map((c) => {
                    const html = this.block(c, noteDir);
                    return html.replace(/^<p /, '<span class="fn-p" ').replace(/<\/p>$/, '</span>');
                })
                .join(''),
        );
        this.inFootnote = false;
        // Numbered here, through the whole book, rather than by paged.js's
        // counters: WebKit ignores `content` on ::marker, and the note came
        // out with a bullet instead of its number.
        const n = ++this.footnoteNumber;
        const number = `<span class="fn-num">${n}.</span> `;
        const numbered = body.startsWith('<span class="fn-p"')
            ? body.replace(/^(<span class="fn-p"[^>]*>)/, `$1${number}`)
            : number + body;
        return `<sup class="fn-call">${n}</sup><span class="footnote" dir="${noteDir}">${numbered}</span>`;
    }

    /** A noteref here, the note itself in an aside at the end of the chapter. */
    private epubNote(definition: JSONContent, noteDir: Dir): string {
        const n = ++this.footnoteNumber;
        this.inFootnote = true;
        const body = this.directions.aside(() => (definition.content ?? []).map((c) => this.block(c, noteDir)).join(''));
        this.inFootnote = false;
        const back = `<a class="fn-back" href="#fnref${n}">${n}.</a> `;
        const numbered = body.startsWith('<p ') ? body.replace(/^(<p [^>]*>)/, `$1${back}`) : back + body;
        this.notes.push(`<aside epub:type="footnote" id="fn${n}" dir="${noteDir}">${numbered}</aside>`);
        return `<sup class="fn-call"><a epub:type="noteref" id="fnref${n}" href="#fn${n}">${n}</a></sup>`;
    }

    private image(node: JSONContent): string {
        const src = String(node.attrs?.src ?? '');
        const alt = String(node.attrs?.alt ?? '');
        const image = this.images.get(src);
        if (!image) return alt ? `<em>[${escapeHtml(alt)}]</em>` : '';
        let url = this.imageUrls.get(image);
        if (!url) {
            if (this.mode === 'epub') {
                url = `images/image${this.media.length + 1}.${image.type === 'jpeg' ? 'jpg' : image.type}`;
                this.media.push({ image, path: url });
            } else {
                url = `data:image/${image.type};base64,${base64(image.data)}`;
            }
            this.imageUrls.set(image, url);
        }
        return `<img src="${url}" alt="${escapeHtml(alt)}" width="${image.width}" height="${image.height}" />`;
    }
}

// Points written as CSS px: WKWebView.createPDF draws one CSS px as one PDF
// point, so a 595px-wide page is a 595pt-wide (A4) PDF page and 12px type is
// 12pt type. Written in pt, everything came out a third too large.
const pt = (twips: number) => `${twips / 20}px`;
const size = (halfPoints: number) => `${halfPoints / 2}px`;
const fontStack = (font: string) => `"${font.replace(/"/g, '')}", "Times New Roman", serif`;

/** The print stylesheet, from the same template as the Word export. */
export function printCss(t: ExportTemplate, chapterPageBreak: boolean, firstLineIndent = false): string {
    const lineHeight = t.lineSpacing / 240;
    return `
@page {
    size: ${pt(t.page.width)} ${pt(t.page.height)};
    margin: ${pt(t.page.margin)};
    @bottom-center { content: counter(page); font-family: ${fontStack(t.bodyFont)}; font-size: ${size(t.footnoteSize)}; }
    @footnote { border-top: 0.75px solid #000; padding-top: 4px; margin-top: 8px; }
}
html { font-family: ${fontStack(t.bodyFont)}; font-size: ${size(t.bodySize)}; line-height: ${lineHeight}; color: #000; }
body { margin: 0; }
p { margin: 0 0 ${pt(t.spaceAfter)}; text-indent: ${pt(t.firstLineIndent)}; text-align: start; orphans: 2; widows: 2; }
p.figure { text-align: center; text-indent: 0; }
h1, h2, h3, h4, h5, h6 { font-family: ${fontStack(t.headingFont)}; line-height: 1.2; margin: ${pt(t.headingSpaceBefore)} 0 ${pt(t.headingSpaceAfter)}; break-after: avoid; text-align: start; }
${t.headingSizes.map((s, i) => `h${i + 1} { font-size: ${size(s)}; }`).join('\n')}
.chapter > h1:first-child { margin-top: 0; }
${chapterPageBreak ? '.chapter + .chapter { break-before: page; }' : ''}
${firstLineIndent ? firstLineIndentCss(pt(FIRST_LINE_INDENT), pt(t.spaceAfter)) : ''}
blockquote { margin: 0 0 ${pt(t.spaceAfter)}; padding-inline-start: 12px; border-inline-start: 2px solid #bbb; color: #404040; }
blockquote p { text-indent: 0; }
ul, ol { margin: 0 0 ${pt(t.spaceAfter)}; padding-inline-start: 24px; }
li p { margin: 0 0 2px; text-indent: 0; }
ul.tasks { list-style: none; padding-inline-start: 6px; }
ul.tasks li { display: flex; gap: 4px; }
ul.tasks .box { flex: none; }
pre { margin: 0 0 ${pt(t.spaceAfter)}; padding: 6px 8px; background: #f2f2f2; white-space: pre-wrap; text-align: left; line-height: 1.25; break-inside: avoid; }
code { font-family: "${t.monoFont}", Menlo, monospace; font-size: ${size(t.codeSize)}; }
table { border-collapse: collapse; width: 100%; margin: 0 0 ${pt(t.spaceAfter)}; line-height: 1.25; }
th, td { border: 1px solid #000; padding: 3px 5px; vertical-align: top; text-align: start; }
th p, td p { margin: 0; text-indent: 0; text-align: inherit; }
th { font-weight: bold; }
thead, tr:first-child { break-inside: avoid; }
img { max-width: 100%; height: auto; }
hr { border: 0; border-top: 0.75px solid #999; margin: 6px 0 12px; }
a { color: #0563c1; }
.footnote { float: footnote; font-size: ${size(t.footnoteSize)}; line-height: 1.2; text-indent: 0; text-align: start; }
.footnote .fn-p { display: block; }
.footnote { list-style: none; display: block; }
::footnote-call { content: none; }
::footnote-marker { content: none; }
.fn-call { font-size: 70%; line-height: 0; }
`;
}

export interface PrintDocument {
    /** The book's content, for paged.js to lay out. */
    content: string;
    css: string;
    dir: Dir;
    lang: string;
    title: string;
}

export function buildPrintDocument(input: HtmlInput): PrintDocument {
    const template = input.template ?? DEFAULT_TEMPLATE;
    const writer = new HtmlWriter(input.defaultDirection);
    const content = input.chapters.map((c) => writer.chapter(c)).join('');
    // A tie goes to the direction the app would give a new document.
    const rtl = writer.rtlBlocks > writer.ltrBlocks || (writer.rtlBlocks === writer.ltrBlocks && input.defaultDirection === 'rtl');
    return {
        content,
        css: printCss(template, input.chapterPageBreak !== false, input.firstLineIndent === true),
        dir: rtl ? 'rtl' : 'ltr',
        lang: rtl ? 'he' : 'en',
        title: input.title,
    };
}

/**
 * The page the native side loads: the content in a <template>, paged.js, and
 * a runner that lays the content out into pages and reports how many there
 * are (`window.__pwPageCount`), or what went wrong (`window.__pwError`).
 * `window.__pwPageTop(i)` is where page i starts, for the native side to
 * scroll to before it draws that page.
 */
export function printPage(doc: PrintDocument, pagedJs: string): string {
    // `</script>` inside the library or the CSS would end the script element early.
    const safe = (s: string) => s.replace(/<\/script/gi, '<\\/script');
    return `<!doctype html>
<html lang="${doc.lang}"><head><meta charset="utf-8"><title>${escapeHtml(doc.title)}</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } .pagedjs_page { margin: 0 !important; box-shadow: none !important; }</style>
</head><body>
<template id="pw-content">${doc.content}</template>
<script>
// paged.js schedules its work on animation frames, and a view that is not on
// screen gets none — the layout never finished. A message-channel queue runs
// the same callbacks without waiting for a frame (and timers are throttled
// off screen too). Must run before paged.js reads these at load.
(function () {
    var channel = new MessageChannel(), queue = [];
    channel.port1.onmessage = function () { var cb = queue.shift(); if (cb) cb(performance.now()); };
    window.requestAnimationFrame = function (cb) { queue.push(cb); channel.port2.postMessage(0); return queue.length; };
    window.cancelAnimationFrame = function () {};
    window.requestIdleCallback = function (cb) {
        return window.requestAnimationFrame(function () { cb({ didTimeout: false, timeRemaining: function () { return 50; } }); });
    };
})();
</script>
<script>${safe(pagedJs)}</script>
<script>
(function () {
    var css = ${safe(JSON.stringify(doc.css))};
    window.__pwPageTop = function (i) {
        var page = document.querySelectorAll('.pagedjs_page')[i];
        return page ? page.getBoundingClientRect().top + window.scrollY : -1;
    };
    // The page box is laid out left to right whatever the book's language:
    // each block carries its own direction, and a right-to-left root would
    // push the pages sideways out of the drawn rect.
    var content = document.getElementById('pw-content').content;
    new PagedModule.Previewer().preview(content, [{ 'book.css': css }], document.body)
        .then(function (flow) { window.__pwPageCount = flow.total; })
        .catch(function (e) { window.__pwError = String(e && e.stack || e); });
})();
</script>
</body></html>`;
}
