import { Editor, type JSONContent } from '@tiptap/core';
import { editorExtensions } from '../../extensions/editorExtensions';
import { buildDocx, type ExportChapter, type ExportImage } from './docx';
import { buildEpub } from './epub';
import { buildPrintDocument, printPage } from './html';
import { DEFAULT_TEMPLATE } from './templates';

/**
 * The export engine with nothing of the app in it: Markdown in, the bytes of
 * a Word or EPUB file out. It needs a DOM (the editor parses through one, and
 * images are decoded by the browser) and nothing else — no Tauri, no file
 * system. Reading the files is the caller's: exportFolder.ts reads them
 * through the app, the Obsidian plugin through the vault, and both hand the
 * same text to the same parser, so a book exported from either is the same
 * document. A PDF is the one format the engine cannot finish alone: it builds
 * the page (buildPrintPage) and the caller's browser draws it — the app's
 * WebKit (pdf.ts), Obsidian's Chromium on the desktop.
 */

export type EngineFormat = 'docx' | 'epub';

export interface EngineInput {
    title: string;
    chapters: ExportChapter[];
    defaultDirection: 'rtl' | 'ltr';
    chapterPageBreak?: boolean;
    firstLineIndent?: boolean;
}

/** Markdown through the editor's whole schema — what the editor would show. */
export function parseMarkdown(markdown: string): JSONContent {
    const editor = new Editor({
        extensions: editorExtensions({ loadImage: async () => null, saveImage: async () => null, onSaveError: () => {} }),
        content: markdown,
    });
    const doc = editor.getJSON();
    editor.destroy();
    return doc;
}

/** Every image `src` in a parsed chapter, as written. */
export function imageSources(node: JSONContent, out: Set<string> = new Set()): Set<string> {
    if (node.type === 'image' && node.attrs?.src) out.add(String(node.attrs.src));
    for (const child of node.content ?? []) imageSources(child, out);
    return out;
}

/** A remote or inline image, which the export never fetches. */
export const isRemoteImage = (src: string) => /^(https?:|data:|blob:)/i.test(src);

function sniff(bytes: Uint8Array): ExportImage['type'] | null {
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg';
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'gif';
    return null;
}

function decode(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image could not be decoded'));
        img.src = url;
    });
}

/**
 * An image file's bytes as Word takes them. PNG, JPEG and GIF go in as they
 * are; anything else the browser can show (WebP, HEIC, SVG) is drawn once
 * and goes in as PNG. Null when it can't be decoded — the alt text stands in.
 */
export async function imageFromBytes(bytes: Uint8Array): Promise<ExportImage | null> {
    const type = sniff(bytes);
    const img = await decode(new Blob([bytes as Uint8Array<ArrayBuffer>]));
    URL.revokeObjectURL(img.src);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) return null;
    if (type) return { data: bytes, type, width, height };

    // createElementNS, not createElement: the same <canvas>, and the one
    // spelling Obsidian's review accepts without its own createEl, which the
    // app does not have (and OffscreenCanvas is not on macOS 11 / iOS 14).
    const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(img, 0, 0);
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!png) return null;
    return { data: new Uint8Array(await png.arrayBuffer()), type: 'png', width, height };
}

/** The file name for an export: the title, made safe. */
export function exportFileName(title: string, format: string): string {
    // eslint-disable-next-line no-control-regex -- control characters are not allowed in a file name
    const base = title.replace(/[/\\:*?"<>|\u0000-\u001F]/g, '-').trim().replace(/^\.+/, '') || 'PureWrite';
    return `${base}.${format}`;
}

/** A print-ready page and its paper size, in points. */
export interface PrintPage {
    html: string;
    width: number;
    height: number;
}

/**
 * The book as one HTML page that lays itself out with paged.js (`pagedJs` is
 * the library's source, which the caller bundles). When it is done it sets
 * `window.__pwPageCount`, or `window.__pwError`; each `.pagedjs_page` is then
 * one sheet of `width` × `height` points.
 */
export function buildPrintPage(input: EngineInput, pagedJs: string): PrintPage {
    const template = DEFAULT_TEMPLATE;
    return {
        html: printPage(buildPrintDocument({ ...input, template }), pagedJs),
        // The template measures in twentieths of a point (Word's twips).
        width: template.page.width / 20,
        height: template.page.height / 20,
    };
}

export function buildBook(format: EngineFormat, input: EngineInput): Uint8Array {
    return format === 'epub' ? buildEpub(input) : buildDocx(input);
}

export type { ExportChapter, ExportImage };
