import type { JSONContent } from '@tiptap/core';
import { firstStrongDirection } from '../../extensions/ParagraphDirection';
import { DirectionTracker, plainText, splitByDirection } from './direction';
import { DEFAULT_TEMPLATE, FIRST_LINE_INDENT, type ExportTemplate } from './templates';
import { zip, type ZipEntry } from './zip';

/**
 * A folder of chapters as one Word document.
 *
 * The input is each chapter as the editor's own document (`editor.getJSON()`
 * over the app's schema), so the export shows what the editor shows: the same
 * footnotes, tables, task lists and images, parsed by the same rules. The
 * output is a .docx written here by hand — it is zipped XML, and the parts
 * PureWrite needs are a few hundred lines, against a library many times the
 * size of the app.
 *
 * What the editor does with direction, Word is told explicitly: every
 * paragraph resolves its direction from its first strong letter, an empty one
 * inherits the one above (ParagraphDirection.ts), and a right-to-left one is a
 * bidi paragraph (`w:bidi`) whose Hebrew runs are `w:rtl` (direction.ts).
 * Footnotes become real Word footnotes, numbered by Word across the whole
 * document; a definition no reference points at is dropped, as the editor's
 * reader shows it nowhere either.
 */

type Dir = 'rtl' | 'ltr';

export interface ExportImage {
    data: Uint8Array;
    type: 'png' | 'jpeg' | 'gif';
    /** Pixels; the image is placed at 96 dpi, shrunk to fit the text width. */
    width: number;
    height: number;
}

export interface ExportChapter {
    /** The file name, for nothing but error messages and tests. */
    name: string;
    doc: JSONContent;
    /** Images by their `src` as written in this chapter. Missing → the alt text is shown. */
    images?: Map<string, ExportImage>;
}

export interface DocxInput {
    title: string;
    chapters: ExportChapter[];
    /** For blocks with nothing to resolve from at the top of the document. */
    defaultDirection: Dir;
    template?: ExportTemplate;
    /** Each chapter after the first starts on a new page. */
    chapterPageBreak?: boolean;
    /** Indent each paragraph that follows another, as the editor shows it. */
    firstLineIndent?: boolean;
    /** For docProps/core.xml; fixed in tests. */
    date?: Date;
}

// ── XML helpers ─────────────────────────────────────────────────────────────

// Characters XML 1.0 does not allow at all (control characters other than
// tab, newline and return). One stray \u000B from a paste would make Word
// refuse the whole file.
// eslint-disable-next-line no-control-regex -- control characters are what this pattern removes
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

export function xmlEscape(s: string): string {
    return s
        .replace(INVALID_XML, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
const NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const NS_PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture';
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const EMU_PER_PX = 9525; // 914400 EMU per inch / 96 px per inch
const EMU_PER_TWIP = 635;

// ── Runs ────────────────────────────────────────────────────────────────────

interface RunStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    sup?: boolean;
    sub?: boolean;
    charStyle?: string;
}

function marksToStyle(marks: JSONContent['marks']): RunStyle {
    const style: RunStyle = {};
    for (const mark of marks ?? []) {
        switch (mark.type) {
            case 'bold': style.bold = true; break;
            case 'italic': style.italic = true; break;
            case 'underline': style.underline = true; break;
            case 'strike': style.strike = true; break;
            case 'code': style.code = true; break;
            case 'superscript': style.sup = true; break;
            case 'subscript': style.sub = true; break;
        }
    }
    return style;
}

function runProperties(style: RunStyle, rtl: boolean, template: ExportTemplate): string {
    let p = '';
    if (style.charStyle) p += `<w:rStyle w:val="${style.charStyle}"/>`;
    if (style.code) {
        const f = xmlEscape(template.monoFont);
        p += `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:cs="${f}"/>`;
    }
    // Both the Latin and the complex-script switch: Word formats a w:rtl run
    // with the *Cs properties and everything else with the plain ones.
    if (style.bold) p += '<w:b/><w:bCs/>';
    if (style.italic) p += '<w:i/><w:iCs/>';
    if (style.strike) p += '<w:strike/>';
    if (style.code) p += `<w:sz w:val="${template.codeSize}"/><w:szCs w:val="${template.codeSize}"/>`;
    if (style.underline) p += '<w:u w:val="single"/>';
    if (style.sup) p += '<w:vertAlign w:val="superscript"/>';
    else if (style.sub) p += '<w:vertAlign w:val="subscript"/>';
    if (rtl) p += '<w:rtl/>';
    return p ? `<w:rPr>${p}</w:rPr>` : '';
}

/** Text as run content: tabs and line breaks are elements, not characters. */
function textContent(text: string): string {
    return text
        .split(/(\t|\n)/)
        .map((part) => {
            if (part === '\t') return '<w:tab/>';
            if (part === '\n') return '<w:br/>';
            if (!part) return '';
            return `<w:t xml:space="preserve">${xmlEscape(part)}</w:t>`;
        })
        .join('');
}

function run(text: string, style: RunStyle, rtl: boolean, template: ExportTemplate): string {
    return `<w:r>${runProperties(style, rtl, template)}${textContent(text)}</w:r>`;
}

// ── The document ────────────────────────────────────────────────────────────

interface ListContext {
    numId: number;
    level: number;
}

interface BlockContext {
    /** Direction forced on the block by its container (list, quote, footnote). */
    dir?: Dir;
    list?: ListContext;
    /** Not the first paragraph of a list item: indented, without a marker. */
    continuation?: boolean;
    quote?: number;
    /** Paragraph style other than Normal. */
    style?: string;
    /** Physical alignment from a table column. */
    align?: string | null;
    /** Indent of a task item, in levels. */
    taskLevel?: number;
    taskChecked?: boolean;
    /** A body paragraph that follows another: indented, as in a book. */
    firstLine?: boolean;
    /** With the indent on: no space between body paragraphs (contextual
     *  spacing), as print does — the indent marks the paragraph instead. */
    tight?: boolean;
}

interface Relationship {
    id: string;
    type: string;
    target: string;
    external?: boolean;
}

const REL_IMAGE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
const REL_LINK = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink';

const isExternalLink = (href: string) => /^(https?:|mailto:)/i.test(href);

class DocxWriter {
    private body: string[] = [];
    private footnotes: string[] = [];
    private nextFootnoteId = 1;
    private rels: Relationship[] = [];
    private media: ZipEntry[] = [];
    private mediaIds = new Map<ExportImage, string>();
    private linkIds = new Map<string, string>();
    private nextDrawingId = 1;
    // One numbering instance per list, so every list starts counting afresh.
    private nums: { numId: number; ordered: boolean; start: number; level: number }[] = [];
    private directions: DirectionTracker;
    private pendingPageBreak = false;
    private rtlParagraphs = 0;
    private ltrParagraphs = 0;

    // Per chapter: footnote definitions by label.
    private definitions = new Map<string, JSONContent>();
    private images = new Map<string, ExportImage>();
    private inFootnote = false;

    constructor(private template: ExportTemplate, defaultDirection: Dir, private firstLineIndent = false) {
        this.directions = new DirectionTracker(defaultDirection);
        // rId1–rId6 are the fixed parts (styles, settings, numbering, footnotes, footer, font table).
        this.rels.push(
            { id: 'rId1', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles', target: 'styles.xml' },
            { id: 'rId2', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings', target: 'settings.xml' },
            { id: 'rId3', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering', target: 'numbering.xml' },
            { id: 'rId4', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes', target: 'footnotes.xml' },
            { id: 'rId5', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer', target: 'footer1.xml' },
        );
    }

    addChapter(chapter: ExportChapter, pageBreak: boolean) {
        this.definitions = new Map();
        this.images = chapter.images ?? new Map();
        for (const node of chapter.doc.content ?? []) {
            if (node.type === 'footnoteDefinition') this.definitions.set(String(node.attrs?.label), node);
        }
        this.pendingPageBreak = pageBreak;
        // The first-line indent's book rule, as in the editor and the PDF: only
        // a paragraph that follows a paragraph, never one after a heading, a
        // list, a quote or a picture.
        let previous: JSONContent | null = null;
        for (const node of chapter.doc.content ?? []) {
            if (node.type === 'footnoteDefinition') continue;
            const firstLine = this.firstLineIndent && isTextParagraph(node) && previous !== null && isTextParagraph(previous);
            const tight = this.firstLineIndent && isTextParagraph(node);
            this.block(node, tight ? { firstLine, tight } : {}, this.body);
            previous = node;
        }
    }

    // ── Blocks ──

    private block(node: JSONContent, ctx: BlockContext, out: string[]) {
        switch (node.type) {
            case 'paragraph':
                this.paragraph(node, ctx, out);
                break;
            case 'heading':
                this.paragraph(node, { ...ctx, style: `Heading${Math.min(6, Number(node.attrs?.level) || 1)}` }, out);
                break;
            case 'blockquote': {
                const dir = this.containerDirection(node, ctx);
                for (const child of node.content ?? []) this.block(child, { ...ctx, dir, quote: (ctx.quote ?? 0) + 1 }, out);
                break;
            }
            case 'bulletList':
            case 'orderedList':
                this.list(node, ctx, out);
                break;
            case 'taskList': {
                const dir = this.containerDirection(node, ctx);
                const level = ctx.list ? ctx.list.level + 1 : (ctx.taskLevel ?? -1) + 1;
                for (const item of node.content ?? []) {
                    (item.content ?? []).forEach((child, i) => {
                        const isText = child.type === 'paragraph';
                        this.block(child, {
                            dir,
                            quote: ctx.quote,
                            taskLevel: level,
                            taskChecked: isText && i === 0 ? Boolean(item.attrs?.checked) : undefined,
                            continuation: i > 0,
                        }, out);
                    });
                }
                break;
            }
            case 'codeBlock':
                this.codeBlock(node, ctx, out);
                break;
            case 'horizontalRule':
                out.push(`<w:p><w:pPr>${this.takePageBreak()}<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="999999"/></w:pBdr><w:spacing w:after="240"/></w:pPr></w:p>`);
                break;
            case 'table':
                this.table(node, ctx, out);
                break;
            case 'footnoteDefinition':
                // Inside another block — rare, but not lost: rendered as a footnote only via its reference.
                break;
            case 'image':
                this.paragraph({ type: 'paragraph', content: [node] }, ctx, out);
                break;
            default:
                // An unknown block with text in it: keep the text.
                if (node.content) for (const child of node.content) this.block(child, ctx, out);
                else if (node.text) this.paragraph({ type: 'paragraph', content: [node] }, ctx, out);
        }
    }

    /** A list, quote, table or footnote: resolved once, from all its text (as in the editor). */
    private containerDirection(node: JSONContent, ctx: BlockContext): Dir {
        return this.directions.container(node, ctx.dir);
    }

    private list(node: JSONContent, ctx: BlockContext, out: string[]) {
        const dir = this.containerDirection(node, ctx);
        const ordered = node.type === 'orderedList';
        const level = ctx.list ? ctx.list.level + 1 : (ctx.taskLevel ?? -1) + 1;
        const numId = this.nums.length + 1;
        this.nums.push({ numId, ordered, start: Number(node.attrs?.start) || 1, level: Math.min(level, 8) });
        const list = { numId, level: Math.min(level, 8) };
        for (const item of node.content ?? []) {
            (item.content ?? []).forEach((child, i) => {
                this.block(child, { dir, quote: ctx.quote, list, continuation: i > 0 && child.type === 'paragraph' }, out);
            });
        }
    }

    private takePageBreak(): string {
        if (!this.pendingPageBreak) return '';
        this.pendingPageBreak = false;
        return '<w:pageBreakBefore/>';
    }

    private paragraphDirection(node: JSONContent, ctx: BlockContext): Dir {
        return this.directions.block(node, ctx.dir);
    }

    private paragraph(node: JSONContent, ctx: BlockContext, out: string[]) {
        const dir = this.paragraphDirection(node, ctx);
        const rtl = dir === 'rtl';
        if (!this.inFootnote) {
            if (rtl) this.rtlParagraphs++;
            else this.ltrParagraphs++;
        }
        const t = this.template;

        let pPr = '';
        const style = this.inFootnote ? 'FootnoteText' : ctx.style ?? (ctx.list || ctx.taskLevel !== undefined ? 'ListParagraph' : ctx.quote ? 'Quote' : undefined);
        if (style) pPr += `<w:pStyle w:val="${style}"/>`;
        pPr += this.takePageBreak();
        if (ctx.list && !ctx.continuation) pPr += `<w:numPr><w:ilvl w:val="${ctx.list.level}"/><w:numId w:val="${ctx.list.numId}"/></w:numPr>`;
        if (ctx.quote && !this.inFootnote) {
            // The quote's rule on its start side: physical sides, so a Hebrew quote's is on the right.
            pPr += `<w:pBdr><w:${rtl ? 'right' : 'left'} w:val="single" w:sz="18" w:space="8" w:color="BBBBBB"/></w:pBdr>`;
        }
        if (rtl) pPr += '<w:bidi/>';
        const indent = this.indentFor(ctx) ?? (ctx.firstLine ? `<w:ind w:firstLine="${FIRST_LINE_INDENT}"/>` : null);
        if (indent !== null) pPr += indent;
        if (ctx.tight) pPr += '<w:contextualSpacing/>';
        const jc = this.justification(node.attrs?.textAlign ?? ctx.align ?? null, rtl, isImageOnly(node));
        if (jc) pPr += `<w:jc w:val="${jc}"/>`;

        let runs = '';
        if (ctx.taskLevel !== undefined && ctx.taskChecked !== undefined) {
            runs += run(ctx.taskChecked ? '☒ ' : '☐ ', {}, rtl, t);
        }
        runs += this.inlines(node.content ?? [], dir, {});
        out.push(`<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}${runs}</w:p>`);
    }

    private indentFor(ctx: BlockContext): string | null {
        const step = 720;
        if (ctx.list && ctx.continuation) return `<w:ind w:left="${step * (ctx.list.level + 1)}"/>`;
        if (ctx.taskLevel !== undefined) {
            const left = step * ctx.taskLevel + (ctx.quote ? step * ctx.quote : 0) + 360;
            return ctx.continuation ? `<w:ind w:left="${left + 360}"/>` : `<w:ind w:left="${left + 360}" w:hanging="360"/>`;
        }
        if (ctx.quote && !ctx.list && !this.inFootnote) return `<w:ind w:left="${step * ctx.quote}" w:right="${step * ctx.quote}"/>`;
        return null;
    }

    /**
     * `w:jc` for a physical alignment. In a bidi paragraph Word reads left and
     * right from the paragraph's start (ECMA-376 §17.3.1.6), so the editor's
     * physical `text-align: right` is "left" in a Hebrew paragraph.
     */
    private justification(align: string | null, rtl: boolean, imageOnly: boolean): string | null {
        if (align === 'center') return 'center';
        if (align === 'justify') return 'both';
        if (align === 'left') return rtl ? 'right' : 'left';
        if (align === 'right') return rtl ? 'left' : 'right';
        if (imageOnly) return 'center';
        return null;
    }

    private codeBlock(node: JSONContent, ctx: BlockContext, out: string[]) {
        const text = (node.content ?? []).map((c) => c.text ?? '').join('');
        const indent = ctx.list ? `<w:ind w:left="${720 * (ctx.list.level + 1)}"/>` : ctx.quote ? `<w:ind w:left="${720 * ctx.quote}"/>` : '';
        // Code is a left-to-right paragraph, whatever the paragraphs around
        // it — but Hebrew inside it still needs w:rtl runs: Word shows the
        // letters of a Hebrew word in a plain run in reverse.
        const runs = splitByDirection([text], 'ltr')[0].map((piece) => run(piece.text, { code: true }, piece.rtl, this.template)).join('');
        out.push(`<w:p><w:pPr><w:pStyle w:val="Code"/>${this.takePageBreak()}${indent}</w:pPr>${runs}</w:p>`);
    }

    private table(node: JSONContent, ctx: BlockContext, out: string[]) {
        const dir = this.containerDirection(node, ctx);
        if (this.pendingPageBreak) out.push(`<w:p><w:pPr>${this.takePageBreak()}</w:pPr></w:p>`);
        const rows = node.content ?? [];
        const columns = Math.max(1, ...rows.map((r) => (r.content ?? []).reduce((n, c) => n + (Number(c.attrs?.colspan) || 1), 0)));
        const textWidth = this.template.page.width - 2 * this.template.page.margin;
        const colWidth = Math.floor(textWidth / columns);

        let xml = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/>';
        if (dir === 'rtl') xml += '<w:bidiVisual/>';
        xml += `<w:tblW w:w="${colWidth * columns}" w:type="dxa"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>`;
        xml += `<w:tblGrid>${`<w:gridCol w:w="${colWidth}"/>`.repeat(columns)}</w:tblGrid>`;
        for (const row of rows) {
            const isHeader = (row.content ?? []).every((c) => c.type === 'tableHeader');
            xml += `<w:tr>${isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}`;
            for (const cell of row.content ?? []) {
                const span = Number(cell.attrs?.colspan) || 1;
                xml += `<w:tc><w:tcPr><w:tcW w:w="${colWidth * span}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ''}</w:tcPr>`;
                const cellOut: string[] = [];
                for (const child of cell.content ?? []) {
                    // Cells resolve their own direction: an English cell in a Hebrew table stays left-to-right.
                    const content = isHeader ? boldAll(child) : child;
                    this.block(content, { align: cell.attrs?.alignment ?? null, style: 'TableText' }, cellOut);
                }
                // A cell must end in a paragraph.
                if (!cellOut.length || !cellOut[cellOut.length - 1].startsWith('<w:p>')) cellOut.push('<w:p/>');
                xml += cellOut.join('') + '</w:tc>';
            }
            xml += '</w:tr>';
        }
        xml += '</w:tbl>';
        out.push(xml);
        // Word joins two tables in a row into one; a paragraph keeps them apart.
        out.push('<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>');
    }

    // ── Inline content ──

    private inlines(nodes: JSONContent[], dir: Dir, outer: RunStyle): string {
        const rtlParagraph = dir === 'rtl';
        // Resolve direction over the whole paragraph, then split per node.
        const pieces = nodes.map((n) => (n.type === 'text' ? n.text ?? '' : null));
        const directed = splitByDirection(pieces, dir);
        let xml = '';
        let openLink: string | null = null;
        const closeLink = () => {
            if (openLink !== null) xml += '</w:hyperlink>';
            openLink = null;
        };

        nodes.forEach((node, i) => {
            const href = linkHref(node);
            if (href !== openLink) {
                closeLink();
                if (href && isExternalLink(href)) {
                    xml += `<w:hyperlink r:id="${this.linkId(href)}" w:history="1">`;
                    openLink = href;
                }
            }
            const style: RunStyle = { ...outer, ...marksToStyle(node.marks) };
            if (openLink) style.charStyle = 'Hyperlink';

            switch (node.type) {
                case 'text':
                    for (const piece of directed[i]) xml += run(piece.text, style, piece.rtl, this.template);
                    break;
                case 'hardBreak':
                    xml += '<w:r><w:br/></w:r>';
                    break;
                case 'footnoteReference':
                    xml += this.footnoteReference(String(node.attrs?.label), rtlParagraph);
                    break;
                case 'image':
                    xml += this.image(node, rtlParagraph);
                    break;
                default:
                    if (node.text) xml += run(node.text, style, rtlParagraph, this.template);
            }
        });
        closeLink();
        return xml;
    }

    private linkId(href: string): string {
        let id = this.linkIds.get(href);
        if (!id) {
            id = `rId${this.rels.length + 1}`;
            this.rels.push({ id, type: REL_LINK, target: href, external: true });
            this.linkIds.set(href, id);
        }
        return id;
    }

    private footnoteReference(label: string, rtl: boolean): string {
        const definition = this.definitions.get(label);
        // A reference without a note, or a note inside a note: keep the mark as text.
        if (!definition || this.inFootnote) return run(`[^${label}]`, {}, false, this.template);

        const id = this.nextFootnoteId++;
        this.inFootnote = true;
        const dir = firstStrongDirection(plainText(definition)) ?? (rtl ? 'rtl' : 'ltr');
        const paragraphs: string[] = [];
        this.directions.aside(() => {
            for (const child of definition.content ?? []) this.block(child, { dir }, paragraphs);
        });
        this.inFootnote = false;

        // Word's own shape: the note's first paragraph opens with its number.
        const mark = `<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/>${dir === 'rtl' ? '<w:rtl/>' : ''}</w:rPr><w:footnoteRef/></w:r><w:r>${dir === 'rtl' ? '<w:rPr><w:rtl/></w:rPr>' : ''}<w:t xml:space="preserve"> </w:t></w:r>`;
        if (!paragraphs.length) paragraphs.push('<w:p><w:pPr><w:pStyle w:val="FootnoteText"/></w:pPr></w:p>');
        paragraphs[0] = insertAfterPPr(paragraphs[0], mark);
        this.footnotes.push(`<w:footnote w:id="${id}">${paragraphs.join('')}</w:footnote>`);

        return `<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/>${rtl ? '<w:rtl/>' : ''}</w:rPr><w:footnoteReference w:id="${id}"/></w:r>`;
    }

    private image(node: JSONContent, rtl: boolean): string {
        const src = String(node.attrs?.src ?? '');
        const alt = String(node.attrs?.alt ?? '');
        const image = this.images.get(src);
        if (!image || !image.width || !image.height) {
            return alt ? run(`[${alt}]`, { italic: true }, rtl, this.template) : '';
        }

        let relId = this.mediaIds.get(image);
        if (!relId) {
            const n = this.media.length + 1;
            const file = `image${n}.${image.type === 'jpeg' ? 'jpeg' : image.type}`;
            this.media.push({ name: `word/media/${file}`, data: image.data });
            relId = `rId${this.rels.length + 1}`;
            this.rels.push({ id: relId, type: REL_IMAGE, target: `media/${file}` });
            this.mediaIds.set(image, relId);
        }

        const maxWidth = (this.template.page.width - 2 * this.template.page.margin) * EMU_PER_TWIP;
        let cx = image.width * EMU_PER_PX;
        let cy = image.height * EMU_PER_PX;
        if (cx > maxWidth) {
            cy = Math.round((cy * maxWidth) / cx);
            cx = maxWidth;
        }
        const id = this.nextDrawingId++;
        const descr = xmlEscape(alt);
        return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Picture ${id}" descr="${descr}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${NS_A}" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="${NS_A}"><a:graphicData uri="${NS_PIC}"><pic:pic xmlns:pic="${NS_PIC}"><pic:nvPicPr><pic:cNvPr id="${id}" name="Picture ${id}" descr="${descr}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
    }

    // ── Parts ──

    finish(input: DocxInput): Uint8Array {
        const t = this.template;
        const documentRtl = this.rtlParagraphs > this.ltrParagraphs;
        const sectPr = `<w:sectPr><w:footerReference w:type="default" r:id="rId5"/><w:pgSz w:w="${t.page.width}" w:h="${t.page.height}"/><w:pgMar w:top="${t.page.margin}" w:right="${t.page.margin}" w:bottom="${t.page.margin}" w:left="${t.page.margin}" w:header="708" w:footer="708" w:gutter="0"/>${documentRtl ? '<w:bidi/>' : ''}</w:sectPr>`;
        if (!this.body.length) this.body.push('<w:p/>');

        const document = `${XML_HEAD}<w:document xmlns:w="${NS_W}" xmlns:r="${NS_R}" xmlns:wp="${NS_WP}" xmlns:a="${NS_A}" xmlns:pic="${NS_PIC}"><w:body>${this.body.join('')}${sectPr}</w:body></w:document>`;

        const footnotes = `${XML_HEAD}<w:footnotes xmlns:w="${NS_W}" xmlns:r="${NS_R}" xmlns:wp="${NS_WP}" xmlns:a="${NS_A}" xmlns:pic="${NS_PIC}">`
            + '<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p></w:footnote>'
            + '<w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>'
            + this.footnotes.join('')
            + '</w:footnotes>';

        const rels = `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${this.rels
            .map((r) => `<Relationship Id="${r.id}" Type="${r.type}" Target="${xmlEscape(r.target)}"${r.external ? ' TargetMode="External"' : ''}/>`)
            .join('')}</Relationships>`;

        const footer = `${XML_HEAD}<w:ftr xmlns:w="${NS_W}" xmlns:r="${NS_R}"><w:p><w:pPr><w:pStyle w:val="Footer"/><w:jc w:val="center"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

        const date = (input.date ?? new Date()).toISOString().replace(/\.\d{3}Z$/, 'Z');
        const core = `${XML_HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEscape(input.title)}</dc:title><dcterms:created xsi:type="dcterms:W3CDTF">${date}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${date}</dcterms:modified></cp:coreProperties>`;
        const app = `${XML_HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>PureWrite</Application></Properties>`;

        const mediaTypes = new Set(this.media.map((m) => m.name.split('.').pop()!));
        const contentTypes = `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
            + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            + '<Default Extension="xml" ContentType="application/xml"/>'
            + [...mediaTypes].map((ext) => `<Default Extension="${ext}" ContentType="image/${ext}"/>`).join('')
            + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
            + '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
            + '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>'
            + '<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>'
            + '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
            + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            + '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
            + '</Types>';

        const packageRels = `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
            + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            + '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            + '</Relationships>';

        return zip([
            { name: '[Content_Types].xml', data: contentTypes },
            { name: '_rels/.rels', data: packageRels },
            { name: 'docProps/core.xml', data: core },
            { name: 'docProps/app.xml', data: app },
            { name: 'word/document.xml', data: document },
            { name: 'word/styles.xml', data: stylesXml(t, documentRtl) },
            { name: 'word/settings.xml', data: settingsXml() },
            { name: 'word/numbering.xml', data: numberingXml(this.nums) },
            { name: 'word/footnotes.xml', data: footnotes },
            { name: 'word/footer1.xml', data: footer },
            { name: 'word/_rels/document.xml.rels', data: rels },
            ...this.media,
        ]);
    }
}

// ── Node helpers ────────────────────────────────────────────────────────────

export { plainText };

function linkHref(node: JSONContent): string | null {
    const link = (node.marks ?? []).find((m) => m.type === 'link');
    return link ? String(link.attrs?.href ?? '') : null;
}

function isTextParagraph(node: JSONContent): boolean {
    return node.type === 'paragraph' && !isImageOnly(node);
}

function isImageOnly(node: JSONContent): boolean {
    const content = node.content ?? [];
    return content.length > 0 && content.every((c) => c.type === 'image');
}

function boldAll(node: JSONContent): JSONContent {
    if (node.type === 'text') return { ...node, marks: [...(node.marks ?? []), { type: 'bold' }] };
    return node.content ? { ...node, content: node.content.map(boldAll) } : node;
}

function insertAfterPPr(paragraph: string, runs: string): string {
    const end = paragraph.indexOf('</w:pPr>');
    if (end >= 0) return paragraph.slice(0, end + 8) + runs + paragraph.slice(end + 8);
    if (paragraph === '<w:p/>') return `<w:p>${runs}</w:p>`;
    return paragraph.replace(/^<w:p>/, `<w:p>${runs}`);
}

// ── Fixed parts ─────────────────────────────────────────────────────────────

function fonts(font: string): string {
    const f = xmlEscape(font);
    return `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:eastAsia="${f}" w:cs="${f}"/>`;
}

function size(halfPoints: number): string {
    return `<w:sz w:val="${halfPoints}"/><w:szCs w:val="${halfPoints}"/>`;
}

function stylesXml(t: ExportTemplate, rtl: boolean): string {
    const headings = t.headingSizes
        .map((sz, i) => {
            const level = i + 1;
            return `<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:uiPriority w:val="9"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="${level === 1 ? t.headingSpaceBefore * 2 : t.headingSpaceBefore}" w:after="${t.headingSpaceAfter}" w:line="240" w:lineRule="auto"/><w:outlineLvl w:val="${i}"/></w:pPr><w:rPr>${fonts(t.headingFont)}<w:b/><w:bCs/>${size(sz)}</w:rPr></w:style>`;
        })
        .join('');
    return `${XML_HEAD}<w:styles xmlns:w="${NS_W}">`
        + `<w:docDefaults><w:rPrDefault><w:rPr>${fonts(t.bodyFont)}${size(t.bodySize)}<w:lang w:val="${rtl ? 'he-IL' : 'en-US'}" w:eastAsia="en-US" w:bidi="he-IL"/></w:rPr></w:rPrDefault>`
        + `<w:pPrDefault><w:pPr><w:spacing w:after="${t.spaceAfter}" w:line="${t.lineSpacing}" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
        + `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/>${t.firstLineIndent ? `<w:pPr><w:ind w:firstLine="${t.firstLineIndent}"/></w:pPr>` : ''}</w:style>`
        + '<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/></w:style>'
        + headings
        + `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:after="480"/><w:ind w:firstLine="0"/></w:pPr><w:rPr>${fonts(t.headingFont)}${size(t.headingSizes[0] + 12)}</w:rPr></w:style>`
        + '<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:color w:val="404040"/></w:rPr></w:style>'
        + '<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/><w:ind w:firstLine="0"/><w:contextualSpacing/></w:pPr></w:style>'
        + '<w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/></w:pPr></w:style>'
        + `<w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/><w:spacing w:after="${t.spaceAfter}" w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/></w:pPr><w:rPr>${fonts(t.monoFont)}${size(t.codeSize)}</w:rPr></w:style>`
        + `<w:style w:type="paragraph" w:styleId="FootnoteText"><w:name w:val="footnote text"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="99"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:firstLine="0"/></w:pPr><w:rPr>${size(t.footnoteSize)}</w:rPr></w:style>`
        + '<w:style w:type="character" w:styleId="FootnoteReference"><w:name w:val="footnote reference"/><w:uiPriority w:val="99"/><w:rPr><w:vertAlign w:val="superscript"/></w:rPr></w:style>'
        + '<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:uiPriority w:val="99"/><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style>'
        + `<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0"/><w:ind w:firstLine="0"/></w:pPr><w:rPr>${size(t.footnoteSize)}</w:rPr></w:style>`
        + '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>'
        + '<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr></w:style>'
        + '</w:styles>';
}

function settingsXml(): string {
    return `${XML_HEAD}<w:settings xmlns:w="${NS_W}"><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/>`
        + '<w:footnotePr><w:footnote w:id="-1"/><w:footnote w:id="0"/></w:footnotePr>'
        + '<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat>'
        + '</w:settings>';
}

const BULLETS = ['•', '◦', '▪'];
const ORDERED = ['decimal', 'lowerLetter', 'lowerRoman'];

function numberingXml(nums: { numId: number; ordered: boolean; start: number; level: number }[]): string {
    const levels = (ordered: boolean) =>
        Array.from({ length: 9 }, (_, i) => {
            const indent = `<w:pPr><w:ind w:left="${720 * (i + 1)}" w:hanging="360"/></w:pPr>`;
            if (ordered) {
                return `<w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="${ORDERED[i % 3]}"/><w:lvlText w:val="%${i + 1}."/><w:lvlJc w:val="left"/>${indent}</w:lvl>`;
            }
            return `<w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="${BULLETS[i % 3]}"/><w:lvlJc w:val="left"/>${indent}</w:lvl>`;
        }).join('');
    return `${XML_HEAD}<w:numbering xmlns:w="${NS_W}">`
        + `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${levels(false)}</w:abstractNum>`
        + `<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${levels(true)}</w:abstractNum>`
        + nums
            .map((n) => `<w:num w:numId="${n.numId}"><w:abstractNumId w:val="${n.ordered ? 1 : 0}"/><w:lvlOverride w:ilvl="${n.level}"><w:startOverride w:val="${n.start}"/></w:lvlOverride></w:num>`)
            .join('')
        + '</w:numbering>';
}

// ── Entry point ─────────────────────────────────────────────────────────────

export function buildDocx(input: DocxInput): Uint8Array {
    const writer = new DocxWriter(input.template ?? DEFAULT_TEMPLATE, input.defaultDirection, input.firstLineIndent === true);
    input.chapters.forEach((chapter, i) => writer.addChapter(chapter, i > 0 && input.chapterPageBreak !== false));
    return writer.finish(input);
}
