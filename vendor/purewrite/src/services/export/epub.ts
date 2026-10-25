import { escapeHtml, firstLineIndentCss, HtmlWriter, type HtmlInput, type TocEntry } from './html';
import { zip, type ZipEntry } from './zip';

/**
 * A folder of chapters as an EPUB 3 book: each chapter an XHTML file written
 * by the same HtmlWriter as the PDF (the same blocks, the same direction per
 * block), footnotes as EPUB notes that reading apps show as popups, a table
 * of contents from the chapters' headings, and images as files of their own.
 *
 * A right-to-left book says so twice: `dir` on each chapter's <html>, and
 * `page-progression-direction="rtl"` on the spine, so a Hebrew book turns
 * its pages from right to left.
 */

export interface EpubInput extends HtmlInput {
    /** For dc:identifier; fixed in tests. */
    id?: string;
    /** For dcterms:modified; fixed in tests. */
    date?: Date;
}

const CSS = `
html { font-family: serif; line-height: 1.5; }
body { margin: 0 5%; }
p { margin: 0 0 0.6em; text-align: start; }
p.figure { text-align: center; }
h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.2em 0 0.5em; text-align: start; }
section.chapter > h1:first-child { margin-top: 0.5em; }
blockquote { margin: 0 0 0.8em; padding-inline-start: 0.9em; border-inline-start: 0.15em solid #bbb; color: #444; }
ul, ol { margin: 0 0 0.8em; padding-inline-start: 1.8em; }
li p { margin: 0 0 0.2em; }
ul.tasks { list-style: none; padding-inline-start: 0.3em; }
ul.tasks .box { margin-inline-end: 0.3em; }
ul.tasks li p { display: inline; }
pre { white-space: pre-wrap; background: #f2f2f2; padding: 0.5em 0.7em; text-align: left; font-size: 0.85em; }
code { font-family: monospace; }
table { border-collapse: collapse; margin: 0 0 0.8em; }
th, td { border: 1px solid #888; padding: 0.2em 0.4em; vertical-align: top; text-align: start; }
th p, td p { margin: 0; text-align: inherit; }
img { max-width: 100%; height: auto; }
hr { border: 0; border-top: 1px solid #999; margin: 1em 0; }
.fn-call { font-size: 0.7em; line-height: 0; }
.fn-call a { text-decoration: none; }
section.footnotes { margin-top: 2em; border-top: 1px solid #999; padding-top: 0.5em; font-size: 0.85em; }
section.footnotes aside p { margin: 0 0 0.3em; }
.fn-back { text-decoration: none; }
`;

const XHTML_HEAD = '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n';

function xhtml(title: string, lang: string, dir: string, body: string): string {
    return `${XHTML_HEAD}<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}" xml:lang="${lang}" dir="${dir}">
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><link rel="stylesheet" type="text/css" href="style.css" /></head>
<body>${body}</body>
</html>`;
}

/** A random v4 UUID, without relying on crypto.randomUUID (iOS 15.4+). */
function uuid(): string {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

interface Chapter {
    file: string;
    title: string;
    headings: TocEntry[];
}

/** The table of contents: each chapter by its first heading, its second-level headings under it. */
function navList(chapters: Chapter[]): string {
    const items = chapters.map((c) => {
        const top = Math.min(...c.headings.map((h) => h.level), 99);
        const subs = c.headings.filter((h, i) => h.level === top + 1 && !(i === 0 && h.level === top));
        const sub = subs.length
            ? `<ol>${subs.map((h) => `<li><a href="${c.file}#${h.id}">${escapeHtml(h.text)}</a></li>`).join('')}</ol>`
            : '';
        return `<li><a href="${c.file}">${escapeHtml(c.title)}</a>${sub}</li>`;
    });
    return `<ol>${items.join('')}</ol>`;
}

export function buildEpub(input: EpubInput): Uint8Array {
    const writer = new HtmlWriter(input.defaultDirection, 'epub');
    const bodies = input.chapters.map((chapter, i) => {
        const before = { rtl: writer.rtlBlocks, ltr: writer.ltrBlocks };
        const body = writer.chapter(chapter);
        const rtl = writer.rtlBlocks - before.rtl > writer.ltrBlocks - before.ltr;
        const headings = writer.headings;
        const first = headings[0]?.text.trim();
        return {
            file: `chapter-${String(i + 1).padStart(3, '0')}.xhtml`,
            title: first || chapter.name.replace(/\.md$/i, ''),
            headings,
            body,
            dir: rtl ? 'rtl' : 'ltr',
        };
    });
    // A tie goes to the direction the app would give a new document.
    const bookRtl = writer.rtlBlocks > writer.ltrBlocks || (writer.rtlBlocks === writer.ltrBlocks && input.defaultDirection === 'rtl');
    const lang = bookRtl ? 'he' : 'en';
    const dir = bookRtl ? 'rtl' : 'ltr';
    const id = input.id ?? `urn:uuid:${uuid()}`;
    const modified = (input.date ?? new Date()).toISOString().replace(/\.\d{3}Z$/, 'Z');

    const entries: ZipEntry[] = [
        // First and stored — the one hard rule of the container format.
        { name: 'mimetype', data: 'application/epub+zip' },
        {
            name: 'META-INF/container.xml',
            data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
        },
        // A reader's own settings may override the indent; that is the reader's call.
        { name: 'OEBPS/style.css', data: input.firstLineIndent ? `${CSS}${firstLineIndentCss('1.5em', '0.6em')}\n` : CSS },
        {
            name: 'OEBPS/nav.xhtml',
            data: xhtml(input.title, lang, dir, `<nav epub:type="toc" id="toc"><h1>${escapeHtml(input.title)}</h1>${navList(bodies)}</nav>`),
        },
        ...bodies.map((c) => ({
            name: `OEBPS/${c.file}`,
            // Each chapter keeps the language of its own text.
            data: xhtml(c.title, c.dir === 'rtl' ? 'he' : 'en', c.dir, c.body),
        })),
        ...writer.media.map((m) => ({ name: `OEBPS/${m.path}`, data: m.image.data })),
    ];

    const mediaType = (path: string) => (path.endsWith('.jpg') ? 'image/jpeg' : `image/${path.split('.').pop()}`);
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${lang}" dir="${dir}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="book-id">${escapeHtml(id)}</dc:identifier>
<dc:title>${escapeHtml(input.title)}</dc:title>
<dc:language>${lang}</dc:language>
<meta property="dcterms:modified">${modified}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="css" href="style.css" media-type="text/css"/>
${bodies.map((c, i) => `<item id="c${i + 1}" href="${c.file}" media-type="application/xhtml+xml"/>`).join('\n')}
${writer.media.map((m, i) => `<item id="img${i + 1}" href="${m.path}" media-type="${mediaType(m.path)}"/>`).join('\n')}
</manifest>
<spine page-progression-direction="${dir}">
${bodies.map((_, i) => `<itemref idref="c${i + 1}"/>`).join('\n')}
</spine>
</package>`;
    entries.splice(2, 0, { name: 'OEBPS/content.opf', data: opf });
    return zip(entries);
}
