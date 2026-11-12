import type { JSONContent } from '@tiptap/core';
import { firstStrongDirection } from '../extensions/ParagraphDirection';
import { CITATION } from '../extensions/TextWithCitations';

/**
 * The sources desk: a writer's references and the passages kept from them, in
 * one plain BibTeX file (sources.bib) that Zotero, Mendeley and Pandoc read too.
 * A document holds only a short citation, in Pandoc's own form, [@cohen2019, 12];
 * the editor and the exports show it in the chosen style, and the file stays
 * plain Markdown. A passage is an ordinary field of its entry (quote1, quote1page),
 * which the other tools carry and ignore.
 *
 * This file has nothing of the app in it: text in, text out. The formatting is
 * our own and small rather than citeproc: a few styles, Hebrew as well as
 * English, a language worked out per entry, so one list can hold both.
 */

/** The Torah source type and its Sefaria lookup are offered in these interface languages only. */
export const showsTorahSources = (language: string): boolean => language === 'he' || language === 'en';

export type CitationStyle = 'apa' | 'chicago' | 'mla' | 'notes' | 'legal' | 'ieee' | 'vancouver';
export const CITATION_STYLES: readonly CitationStyle[] = ['apa', 'chicago', 'mla', 'notes', 'legal', 'ieee', 'vancouver'];
/** Styles that cite in a footnote: an export turns the citation into a real note. */
export const isNoteStyle = (style: CitationStyle) => style === 'notes' || style === 'legal';
const isNumeric = (style: CitationStyle) => style === 'ieee' || style === 'vancouver';
/** A Torah source is cited by book and place: no year, no page word, no "above". */
export const isTorah = (source: { type: string }) => source.type === 'torah';

export interface Passage {
    text: string;
    page: string;
}

export interface Source {
    key: string;
    /** BibTeX's entry type, lower case: article, book, incollection, misc… */
    type: string;
    fields: Record<string, string>;
    passages: Passage[];
}

/** How a Hebrew title stands out. Most Israeli guides say bold; some, Haifa's among them, italic. */
export type TitleStyle = 'bold' | 'italic';

export interface SourceLibrary {
    style: CitationStyle;
    /** Absent means bold. */
    titles?: TitleStyle;
    entries: Source[];
    /** What is in the file and is no entry of ours (@string, @comment): kept as written. */
    rest: string[];
}

export const emptyLibrary = (): SourceLibrary => ({ style: 'apa', entries: [], rest: [] });

// ------------------------------------------------------------------ BibTeX

const COMBINING: Record<string, string> = { '"': '̈', "'": '́', '`': '̀', '^': '̂', '~': '̃' };

/** A BibTeX value as text: its protective braces and the commonest LaTeX gone. */
/** `verbatim` is for a passage: the writer's own text, with its line breaks and dashes. */
function fromBib(value: string, verbatim = false): string {
    const text = value
        .replace(/\\(["'`^~])\{?([A-Za-z])\}?/g, (_, mark: string, letter: string) => `${letter}${COMBINING[mark]}`.normalize('NFC'))
        .replace(/\\\{/g, '\uE000')
        .replace(/\\\}/g, '\uE001')
        .replace(/\\([&%_$#])/g, '$1')
        .replace(/[{}]/g, '')
        .replace(/\uE000/g, '{')
        .replace(/\uE001/g, '}');
    if (verbatim) return text.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).join('\n').trim();
    return text
        .replace(/---/g, '—')
        .replace(/--/g, '–')
        .replace(/~/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const toBib = (value: string) => value.replace(/\\/g, '').replace(/([{}&%_$#])/g, '\\$1');

/** Reads a whole file. What it cannot read as an entry it keeps, and writes back. */
export function parseBib(text: string): SourceLibrary {
    const library = emptyLibrary();
    let i = 0;
    const n = text.length;
    const skipSpace = () => { while (i < n && /\s/.test(text[i])) i++; };

    /** From an opening brace or bracket to its match; the position after it. */
    const balanced = (from: number, open: string, close: string): number => {
        let depth = 0;
        for (let p = from; p < n; p++) {
            if (text[p] === '\\') { p++; continue; }
            if (text[p] === open) depth++;
            else if (text[p] === close && --depth === 0) return p + 1;
        }
        return -1;
    };

    const value = (close: string): string => {
        let out = '';
        for (;;) {
            skipSpace();
            if (text[i] === '{') {
                const end = balanced(i, '{', '}');
                if (end < 0) { i = n; return out; }
                out += text.slice(i + 1, end - 1);
                i = end;
            } else if (text[i] === '"') {
                let end = i + 1;
                let depth = 0;
                for (; end < n; end++) {
                    if (text[end] === '\\') { end++; continue; }
                    if (text[end] === '{') depth++;
                    else if (text[end] === '}') depth--;
                    else if (text[end] === '"' && depth === 0) break;
                }
                out += text.slice(i + 1, end);
                i = end + 1;
            } else {
                const start = i;
                while (i < n && text[i] !== ',' && text[i] !== close && text[i] !== '#' && !/\s/.test(text[i])) i++;
                out += text.slice(start, i);
            }
            skipSpace();
            if (text[i] === '#') { i++; continue; }
            return out;
        }
    };

    while (i < n) {
        const at = text.indexOf('@', i);
        if (at < 0) break;
        i = at + 1;
        const name = /^[A-Za-z]+/.exec(text.slice(i, i + 40))?.[0] ?? '';
        i += name.length;
        skipSpace();
        const open = text[i];
        if (!name || (open !== '{' && open !== '(')) continue;
        const close = open === '{' ? '}' : ')';
        const type = name.toLowerCase();
        if (type === 'comment' || type === 'string' || type === 'preamble') {
            const end = balanced(i, open, close);
            if (end < 0) break;
            const body = text.slice(i + 1, end - 1).trim();
            const style = /^purewrite-style:\s*(\w+)$/.exec(body)?.[1] as CitationStyle | undefined;
            if (style && CITATION_STYLES.includes(style)) library.style = style;
            else if (/^purewrite-titles:\s*italic$/.test(body)) library.titles = 'italic';
            else library.rest.push(text.slice(at, end));
            i = end;
            continue;
        }
        i++;
        const keyStart = i;
        while (i < n && text[i] !== ',' && text[i] !== close) i++;
        const key = text.slice(keyStart, i).trim();
        const fields: Record<string, string> = {};
        const quotes = new Map<number, Passage>();
        while (i < n && text[i] !== close) {
            if (text[i] === ',') i++;
            skipSpace();
            if (text[i] === close) break;
            const nameStart = i;
            while (i < n && text[i] !== '=' && text[i] !== close && text[i] !== ',') i++;
            if (text[i] !== '=') continue;
            const field = text.slice(nameStart, i).trim().toLowerCase();
            i++;
            const q = /^quote(\d+)(page)?$/.exec(field);
            const raw = fromBib(value(close), !!q && !q[2]);
            if (q) {
                const passage = quotes.get(Number(q[1])) ?? { text: '', page: '' };
                if (q[2]) passage.page = raw; else passage.text = raw;
                quotes.set(Number(q[1]), passage);
            } else {
                fields[field] = raw;
            }
        }
        i++;
        if (key) {
            library.entries.push({
                key, type, fields,
                passages: [...quotes.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p).filter((p) => p.text),
            });
        }
    }
    return library;
}

export function serializeBib(library: SourceLibrary): string {
    const entry = (source: Source) => {
        const lines = Object.entries(source.fields)
            .filter(([, v]) => v.trim())
            .map(([k, v]) => `  ${k} = {${toBib(v)}}`);
        source.passages.forEach((p, i) => {
            lines.push(`  quote${i + 1} = {${toBib(p.text)}}`);
            if (p.page.trim()) lines.push(`  quote${i + 1}page = {${toBib(p.page)}}`);
        });
        return `@${source.type}{${source.key},\n${lines.join(',\n')}\n}`;
    };
    return `${[`@comment{purewrite-style: ${library.style}}`, ...(library.titles === 'italic' ? ['@comment{purewrite-titles: italic}'] : []), ...library.rest, ...library.entries.map(entry)].join('\n\n')}\n`;
}

/** A source nothing was ever written in. */
export const isEmptySource = (source: Source) => !source.passages.length && !Object.values(source.fields).some((value) => value.trim());

/** The library without its empty sources, but for the one still being filled in. */
export function withoutEmptySources(library: SourceLibrary, keep?: string | null): SourceLibrary {
    const entries = library.entries.filter((e) => e.key === keep || !isEmptySource(e));
    return entries.length === library.entries.length ? library : { ...library, entries };
}

/** A key for a new entry, from its first author and year, not one already taken. */
export function newKey(fields: Record<string, string>, taken: ReadonlySet<string>): string {
    const last = authorsOf(fields.author ?? '')[0]?.last ?? '';
    const stem = `${last}${yearOf(fields)}`.replace(/[^\p{L}\p{N}_]/gu, '') || 'source';
    let key = stem;
    for (let n = 0; taken.has(key); n++) key = `${stem}${String.fromCharCode(97 + (n % 26))}${n >= 26 ? n : ''}`;
    return key;
}

/** Entries from another file, added; a key already here stays as it is. */
export function mergeLibrary(into: SourceLibrary, other: SourceLibrary): { library: SourceLibrary; added: number } {
    const taken = new Set(into.entries.map((e) => e.key));
    const fresh = other.entries.filter((e) => !taken.has(e.key));
    return { library: { ...into, entries: [...into.entries, ...fresh] }, added: fresh.length };
}

// ------------------------------------------------------------------ people and dates

interface Person { last: string; first: string }

export function authorsOf(value: string): Person[] {
    return value.split(/\s+and\s+/).map((raw) => raw.trim()).filter(Boolean).map((name) => {
        const comma = name.indexOf(',');
        if (comma >= 0) return { last: name.slice(0, comma).trim(), first: name.slice(comma + 1).trim() };
        const words = name.split(/\s+/);
        return { last: words[words.length - 1], first: words.slice(0, -1).join(' ') };
    });
}

const yearOf = (fields: Record<string, string>) => fields.year || /\d{4}/.exec(fields.date ?? '')?.[0] || '';

/** The language an entry is cited in: Hebrew by its own letters, whatever the document is in. */
const hebrew = (source: Source) => /[֐-׿]/.test(`${source.fields.title ?? ''}${source.fields.author ?? ''}`);

const WORDS = {
    he: { and: 'ו', etAl: 'ואחרים', page: "עמ'", pages: "עמ'", noDate: 'ללא תאריך', in: 'בתוך', editedBy: 'בעריכת', ed: '(עורך)', eds: '(עורכים)', vol: 'כרך', no: 'גיליון' },
    en: { and: 'and', etAl: 'et al.', page: 'p.', pages: 'pp.', noDate: 'n.d.', in: 'In', editedBy: 'edited by', ed: '(Ed.)', eds: '(Eds.)', vol: 'vol.', no: 'no.' },
};
const wordsFor = (source: Source) => WORDS[hebrew(source) ? 'he' : 'en'];

/**
 * A range of pages as the source's language reads it. Israeli guides set the low
 * number on the right, and a hyphen between digits holds them in one left-to-right
 * run whatever the paragraph, so in Hebrew the high number is written first.
 */
export function pageRange(pages: string, he: boolean): string {
    const m = /^\s*(\d+)\s*[-–—]+\s*(\d+)\s*$/.exec(pages);
    if (!he || !m) return pages;
    // 365-8 is a shortened range: it cannot be told which way it runs.
    if (m[2].length < m[1].length) return pages;
    const [low, high] = Number(m[1]) <= Number(m[2]) ? [m[1], m[2]] : [m[2], m[1]];
    return `${high}-${low}`;
}

/** Hebrew joins "and" to the next word; English sets it apart. */
const joined = (source: Source, a: string, b: string, amp = false) => (hebrew(source) ? `${a} ו${b}` : `${a} ${amp ? '&' : 'and'} ${b}`);

function shortAuthors(source: Source, style: CitationStyle): string {
    const people = authorsOf(source.fields.author ?? source.fields.editor ?? '');
    const w = wordsFor(source);
    if (!people.length) return source.fields.title ?? source.key;
    const [a, b, c] = people.map((p) => p.last);
    if (people.length === 1) return a;
    if (people.length === 2) return joined(source, a, b, style === 'apa');
    if (style === 'chicago' && people.length === 3) return hebrew(source) ? `${a}, ${b} ו${c}` : `${a}, ${b}, and ${c}`;
    return `${a} ${w.etAl}`;
}

const HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

/** Works by the same people in the same year are told apart: 2019a, 2019b; in Hebrew 2019א, 2019ב. */
function yearLetters(library: SourceLibrary): Map<string, string> {
    const groups = new Map<string, Source[]>();
    for (const source of library.entries) {
        if (isTorah(source)) continue;
        const id = `${authorsOf(source.fields.author ?? '').map((p) => p.last).join('|')}#${yearOf(source.fields)}`;
        groups.set(id, [...(groups.get(id) ?? []), source]);
    }
    const out = new Map<string, string>();
    for (const group of groups.values()) {
        if (group.length < 2) continue;
        [...group].sort((a, b) => (a.fields.title ?? '').localeCompare(b.fields.title ?? '')).forEach((s, i) => out.set(s.key, hebrew(s) ? HEBREW_LETTERS[i % HEBREW_LETTERS.length] : String.fromCharCode(97 + i)));
    }
    return out;
}

// ------------------------------------------------------------------ citations in the text

const torahPlace = (source: Source, locator: string) => [source.fields.title ?? source.key, locator].filter(Boolean).join(' ');

export interface CitationPart { key: string; locator: string; noAuthor: boolean }

/** The parts of [@a, 12; @b], or null if it holds anything else ([see @a]). */
export function parseCitation(raw: string): CitationPart[] | null {
    const parts: CitationPart[] = [];
    for (const piece of raw.slice(1, -1).split(';')) {
        const m = /^\s*(-?)@([\p{L}\p{N}_][^\s,;]*)\s*(?:,\s*(.*?))?\s*$/u.exec(piece);
        if (!m) return null;
        parts.push({ noAuthor: m[1] === '-', key: m[2], locator: (m[3] ?? '').replace(/^(?:pp?\.|עמ['׳]?|עמודים)\s*/u, '') });
    }
    return parts.length ? parts : null;
}

/** A citation as the writer asks for it: a page, or none. */
export function citationText(key: string, page = ''): string {
    return page.trim() ? `[@${key}, ${page.trim()}]` : `[@${key}]`;
}

/** The part of a key being typed at the end of this text, as in "see [@coh", or null if no citation is open there. */
export function completionQuery(before: string): string | null {
    const m = /\[[^[\]\n]*?-?@([\p{L}\p{N}_:.-]*)$/u.exec(before);
    return m ? m[1] : null;
}

/** The sources a typed part of a key could mean: those a key starts with first, then any word of the entry. */
export function matchSources(library: SourceLibrary, query: string, limit = 6): Source[] {
    const q = query.toLowerCase();
    const starts = (s: Source) => s.key.toLowerCase().startsWith(q);
    const has = (s: Source) => `${s.key} ${s.fields.author ?? ''} ${s.fields.title ?? ''} ${s.fields.year ?? ''}`.toLowerCase().includes(q);
    return [...library.entries.filter(starts), ...library.entries.filter((s) => !starts(s) && has(s))].slice(0, limit);
}

/**
 * The citation as it reads in the chosen style, or null if it names a source not
 * in the library. `order` is the sources in the order the document first cites
 * them, for the numbered styles. A note style is drawn by its caller.
 */
export function formatCitation(raw: string, library: SourceLibrary, order?: readonly string[]): string | null {
    const parts = parseCitation(raw);
    if (!parts) return null;
    const byKey = new Map(library.entries.map((e) => [e.key, e]));
    if (parts.some((p) => !byKey.has(p.key))) return null;
    if (isNumeric(library.style)) {
        const numbers = order ?? library.entries.map((e) => e.key);
        const one = ({ key, locator }: CitationPart) => {
            const source = byKey.get(key)!;
            if (isTorah(source)) return `${numbers.indexOf(key) + 1}${locator ? `, ${locator}` : ''}`;
            const w = wordsFor(source);
            const range = pageRange(locator, hebrew(source));
            return `${numbers.indexOf(key) + 1}${locator ? `, ${/[-–]/.test(locator) ? w.pages : w.page} ${range}` : ''}`;
        };
        return library.style === 'ieee' ? parts.map((p) => `[${one(p)}]`).join(', ') : `(${parts.map(one).join('; ')})`;
    }
    const letters = yearLetters(library);
    const one = ({ key, locator, noAuthor }: CitationPart) => {
        const source = byKey.get(key)!;
        if (isTorah(source)) return torahPlace(source, locator);
        const w = wordsFor(source);
        const range = pageRange(locator, hebrew(source));
        const author = noAuthor ? '' : shortAuthors(source, library.style);
        const year = `${yearOf(source.fields) || w.noDate}${letters.get(key) ?? ''}`;
        if (library.style === 'mla') return [author, range].filter(Boolean).join(' ');
        if (library.style === 'chicago') return `${[author, year].filter(Boolean).join(' ')}${range ? `, ${range}` : ''}`;
        const label = /[-–]/.test(locator) ? w.pages : w.page;
        return [author, year, range && `${label} ${range}`].filter(Boolean).join(', ');
    };
    return `(${parts.map(one).join('; ')})`;
}

// ------------------------------------------------------------------ the list of sources

export interface Run { text: string; italic?: boolean; bold?: boolean }

const initialOf = (name: string, he: boolean) => name.split(/[\s-]+/).filter(Boolean).map((word) => `${word[0]}${he ? "'" : '.'}`).join(' ');

function listAuthors(source: Source, style: CitationStyle, field = 'author'): string {
    const people = authorsOf(source.fields[field] ?? '');
    const he = hebrew(source);
    const w = wordsFor(source);
    if (!people.length) return '';
    if (style === 'apa') {
        const names = people.map((p) => (p.first ? `${p.last}, ${initialOf(p.first, he)}` : p.last));
        if (names.length === 1) return names[0];
        const head = names.slice(0, -1).join(', ');
        return he ? `${head} ו${names[names.length - 1]}` : `${head}, & ${names[names.length - 1]}`;
    }
    const full = (p: Person, inverted: boolean) => (!p.first ? p.last : inverted ? `${p.last}, ${p.first}` : `${p.first} ${p.last}`);
    if (style === 'mla' && people.length > 2) return `${full(people[0], true)}, ${w.etAl}`;
    const names = people.map((p, i) => full(p, i === 0));
    if (names.length === 1) return names[0];
    const head = names.slice(0, -1).join(', ');
    if (he) return `${head}${style === 'mla' ? ',' : ''} ו${names[names.length - 1]}`;
    return `${head}${names.length > 2 ? ',' : ''} and ${names[names.length - 1]}`;
}

const editorsInline = (source: Source) => authorsOf(source.fields.editor ?? '').map((p) => (p.first ? `${p.first} ${p.last}` : p.last));

/** APA's editors: the initial first, then the surname. */
const editorsInitial = (source: Source) => authorsOf(source.fields.editor ?? '').map((p) => (p.first ? `${initialOf(p.first, hebrew(source))} ${p.last}` : p.last));

/** עורך or עורכת cannot be told from a name, so the writer's own word comes first. */
const editorWord = (source: Source, w: typeof WORDS.he | typeof WORDS.en) => {
    const count = authorsOf(source.fields.editor ?? '').length;
    const own = source.fields.editorrole?.trim();
    return own ? `(${own})` : count > 1 ? w.eds : w.ed;
};

/** IEEE's and Vancouver's names: J. Smith and A. Roe; Smith J, Roe A. */
function shortList(source: Source, style: 'ieee' | 'vancouver'): string {
    const he = hebrew(source);
    const people = authorsOf(source.fields.author ?? '');
    if (style === 'vancouver') return people.map((p) => `${p.last}${p.first ? ` ${p.first.split(/[\s-]+/).filter(Boolean).map((n) => n[0]).join('')}` : ''}`).join(', ');
    const names = people.map((p) => (p.first ? `${initialOf(p.first, he)} ${p.last}` : p.last));
    if (names.length < 2) return names[0] ?? '';
    const head = names.slice(0, -1).join(', ');
    return he ? `${head} ו${names[names.length - 1]}` : `${head}${names.length > 2 ? ',' : ''} and ${names[names.length - 1]}`;
}

const stop = (s: string) => (s && !/[.!?…؟'׳]$/.test(s) ? `${s}.` : s);

/** One entry of the list, in the style. A field the entry lacks leaves no gap. */
export function bibliographyEntry(source: Source, style: CitationStyle, letter = '', titles: TitleStyle = 'bold'): Run[] {
    const f = source.fields;
    const he = hebrew(source);
    const w = wordsFor(source);
    const year = `${yearOf(f) || w.noDate}${letter}`;
    const title = f.title ?? source.key;
    const container = f.journal ?? f.journaltitle ?? f.booktitle ?? '';
    const isArticle = source.type === 'article';
    const isChapter = source.type === 'incollection' || source.type === 'inbook' || source.type === 'inproceedings';
    const place = f.address ?? f.location ?? '';
    const pages = pageRange(f.pages ?? '', he);
    const link = f.doi ? `https://doi.org/${f.doi.replace(/^https?:\/\/doi\.org\//, '')}` : f.url ?? '';
    const editors = editorsInline(source);
    const editorList = editors.length ? (he ? editors.join(' ו') : editors.join(', ')) : '';
    const editorsApa = he ? editorsInitial(source).join(' ו') : editorsInitial(source).join(', ');
    const out: Run[] = [];
    // Hebrew has no true italics, and most Israeli guides that say set titles in bold.
    const add = (text: string, emphasis = false) => { if (text) out.push(!emphasis ? { text } : he && titles !== 'italic' ? { text, bold: true } : { text, italic: true }); };
    const authors = listAuthors(source, style);

    if (isTorah(source)) {
        add(f.author ? `${f.author}, ` : '');
        add(title, true);
        add(`${f.edition ? `, ${f.edition}` : ''}.`);
        return out;
    }

    if (style === 'apa') {
        add(`${stop(authors)}${authors ? ' ' : ''}(${year}). `);
        if (isArticle) {
            add(`${stop(title)} `);
            add(container, true);
            if (f.volume) { add(', '); add(f.volume, true); }
            if (f.number) add(`(${f.number})`);
            if (pages) add(`, ${pages}`);
            add('. ');
        } else if (isChapter) {
            add(`${stop(title)} ${w.in} `);
            if (editorsApa) add(`${editorsApa} ${editorWord(source, w)}, `);
            add(container, true);
            if (pages) add(` (${w.pages} ${pages})`);
            add('. ');
            if (f.publisher) add(`${stop(f.publisher)} `);
        } else {
            add(stop(title), true);
            add(' ');
            if (f.publisher) add(`${stop(f.publisher)} `);
        }
        add(link);
    } else if (style === 'chicago') {
        add(`${stop(authors)}${authors ? ' ' : ''}${year}. `);
        if (isArticle) {
            add(`"${stop(title)}" `);
            add(container, true);
            add(`${f.volume ? ` ${f.volume}` : ''}${f.number ? ` (${f.number})` : ''}${pages ? `: ${pages}` : ''}. `);
        } else if (isChapter) {
            add(`"${stop(title)}" ${w.in} `);
            add(container, true);
            add(`${editorList ? `, ${w.editedBy} ${editorList}` : ''}${pages ? `, ${pages}` : ''}. `);
            add(`${stop([place, f.publisher].filter(Boolean).join(': '))} `);
        } else {
            add(stop(title), true);
            add(` ${stop([place, f.publisher].filter(Boolean).join(': '))} `);
        }
        add(link);
    } else if (style === 'ieee') {
        add(`${shortList(source, 'ieee')}, `);
        if (isArticle) {
            add(`"${title}," `);
            add(container, true);
            add(`${f.volume ? `, ${w.vol} ${f.volume}` : ''}${f.number ? `, ${w.no} ${f.number}` : ''}${pages ? `, ${w.pages} ${pages}` : ''}, ${yearOf(f)}. `);
        } else if (isChapter) {
            add(`"${title}," ${w.in} `);
            add(container, true);
            add(`${editorsApa ? `, ${editorsApa} ${editorWord(source, w)}` : ''}. ${[place, f.publisher].filter(Boolean).join(': ')}, ${yearOf(f)}${pages ? `, ${w.pages} ${pages}` : ''}. `);
        } else {
            add(title, true);
            add(`. ${[place, f.publisher].filter(Boolean).join(': ')}, ${yearOf(f)}. `);
        }
        add(link);
    } else if (style === 'vancouver') {
        add(`${stop(shortList(source, 'vancouver'))} ${stop(title)} `);
        if (isArticle) {
            add(`${container}. ${yearOf(f)}${f.volume ? `;${f.volume}` : ''}${f.number ? `(${f.number})` : ''}${pages ? `:${pages}` : ''}. `);
        } else if (isChapter) {
            add(`${w.in}: ${editorsApa ? `${editorsApa} ${editorWord(source, w)}. ` : ''}${container}. ${[place, f.publisher].filter(Boolean).join(': ')}; ${yearOf(f)}${pages ? `. ${w.page} ${pages}` : ''}. `);
        } else {
            add(`${[place, f.publisher].filter(Boolean).join(': ')}; ${yearOf(f)}. `);
        }
        add(link);
    } else if (style === 'notes' || style === 'legal') {
        // The list at the end of a book in notes: the note's own form, surname first.
        if (source.type === 'legislation' || source.type === 'jurisdiction') {
            add(`${[title, f.reporter, yearOf(f)].filter(Boolean).join(', ')}.`);
        } else {
            if (authors) add(`${authors}, `);
            const published = [place, f.publisher].filter(Boolean).join(': ');
            if (isArticle || isChapter) {
                add(`"${title}", `);
                add(container, true);
                add(`${f.volume ? ` ${f.volume}` : ''}${yearOf(f) ? ` (${yearOf(f)})` : ''}${pages ? `, ${w.pages} ${pages}` : ''}.`);
            } else {
                add(title, true);
                add(`${[published, yearOf(f)].filter(Boolean).map((part) => `, ${part}`).join('')}.`);
            }
        }
    } else {
        if (authors) add(`${stop(authors)} `);
        if (isArticle || isChapter) {
            add(`"${stop(title)}" `);
            add(container, true);
            const details = [
                isChapter && editorList ? `${he ? 'ערך' : w.editedBy} ${editorList}` : '',
                f.volume ? `${w.vol} ${f.volume}` : '',
                f.number ? `${w.no} ${f.number}` : '',
                isChapter ? f.publisher ?? '' : '',
                yearOf(f),
                pages ? `${/[-–]/.test(pages) ? w.pages : w.page} ${pages}` : '',
            ].filter(Boolean);
            if (details.length) add(`, ${details.join(', ')}`);
            add('. ');
        } else {
            add(stop(title), true);
            add(` ${[f.publisher, yearOf(f)].filter(Boolean).join(', ')}. `);
        }
        add(link);
    }
    return out.map((r, i) => (i === out.length - 1 ? { ...r, text: r.text.trimEnd() } : r)).filter((r) => r.text);
}

/** Sorted by surname; with no author, by title, leaving aside the definite article. */
const sortName = (s: Source) => authorsOf(s.fields.author ?? '')[0]?.last ?? (s.fields.title ?? s.key).replace(/^ה(?=[֐-׿])/, '');

/** The list, ordered: by author and year, the document's own script first; in a numbered style, by number. */
export function bibliography(library: SourceLibrary, keys: ReadonlySet<string> | null, direction: 'rtl' | 'ltr'): Run[][] {
    const letters = yearLetters(library);
    const entry = (s: Source) => bibliographyEntry(s, library.style, letters.get(s.key) ?? '', library.titles);
    if (isNumeric(library.style)) {
        const byKey = new Map(library.entries.map((e) => [e.key, e]));
        const order = keys ? [...keys].map((k) => byKey.get(k)).filter((s): s is Source => !!s) : library.entries;
        return order.map((s, i) => [{ text: library.style === 'ieee' ? `[${i + 1}] ` : `${i + 1}. ` }, ...entry(s)]);
    }
    const used = library.entries.filter((e) => !keys || keys.has(e.key));
    const rank = (s: Source) => (hebrew(s) === (direction === 'rtl') ? 0 : 1);
    return [...used]
        .sort((a, b) => rank(a) - rank(b)
            || sortName(a).localeCompare(sortName(b), hebrew(a) ? 'he' : 'en')
            || authorsOf(a.fields.author ?? '').length - authorsOf(b.fields.author ?? '').length
            || yearOf(a.fields).localeCompare(yearOf(b.fields))
            || (a.fields.title ?? '').localeCompare(b.fields.title ?? ''))
        .map(entry);
}

export const plainRuns = (runs: readonly Run[]) => runs.map((r) => r.text).join('');

/** The heading above the list, in the document's language. */
export function bibliographyTitle(style: CitationStyle, direction: 'rtl' | 'ltr'): string {
    if (direction === 'rtl') return 'רשימת מקורות';
    return style === 'mla' ? 'Works Cited' : 'References';
}

// ------------------------------------------------------------------ in an export

/** Where a book's notes have got to: a repeat refers back to the note that first gave the source. */
export interface NoteState {
    /** Footnotes so far, the writer's own among them. */
    count: number;
    first: Map<string, number>;
    /** The source of the last citation note, for "ibid." */
    last: string | null;
}
export const newNoteState = (): NoteState => ({ count: 0, first: new Map(), last: null });

const fullName = (p: Person) => (p.first ? `${p.first} ${p.last}` : p.last);
const namesInFull = (value: string | undefined, he: boolean) => {
    const names = authorsOf(value ?? '').map(fullName);
    if (names.length < 2) return names[0] ?? '';
    return he ? `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}` : `${names.slice(0, -1).join(', ')}${names.length > 2 ? ',' : ''} and ${names[names.length - 1]}`;
};
const surname = (source: Source) => authorsOf(source.fields.author ?? '')[0]?.last ?? source.fields.title ?? source.key;

/** A source given in full in a note, the Hebrew humanities' form (Van Leer's guide), or English's Chicago note. */
function fullNote(source: Source, locator: string, style: 'notes' | 'legal', titles: TitleStyle | undefined): Run[] {
    if (isTorah(source)) return [{ text: `${source.fields.author ? `${source.fields.author}, ` : ''}${torahPlace(source, locator)}.` }];
    const f = source.fields;
    const he = hebrew(source);
    const w = wordsFor(source);
    const title = f.title ?? source.key;
    const year = yearOf(f);
    const container = f.journal ?? f.journaltitle ?? f.booktitle ?? '';
    const authors = namesInFull(f.author, he);
    const editors = namesInFull(f.editor, he);
    const place = [f.address ?? f.location, f.publisher].filter(Boolean).join(': ');
    const isArticle = source.type === 'article';
    const isChapter = source.type === 'incollection' || source.type === 'inbook' || source.type === 'inproceedings';
    const at = pageRange(locator, he);
    if (style === 'legal') {
        const by = authors ? `${authors} ` : '';
        const first = /\d+/.exec(f.pages ?? '')?.[0] ?? '';
        const pin = at ? `, ${at}` : '';
        if (source.type === 'jurisdiction') return [{ text: `${title}, ${f.reporter ?? ''}${pin}${year ? ` (${year})` : ''}.` }];
        if (source.type === 'legislation') return [{ text: `${at ? `סעיף ${at} ל` : ''}${title}${year ? `, ${year}` : ''}${f.reporter ? `, ${f.reporter}` : ''}.` }];
        if (isArticle) return [{ text: `${by}"${title}" ${container}${f.volume ? ` ${f.volume}` : ''}${first ? ` ${first}` : ''}${pin} (${year}).` }];
        if (isChapter) return [{ text: `${by}"${title}" ${container}${first ? ` ${first}` : ''}${pin} (${editors ? `${editors} ${f.editorrole?.trim() || (authorsOf(f.editor ?? '').length > 1 ? 'עורכים' : 'עורך')} ` : ''}${year}).` }];
        return [{ text: `${by}${title}${at ? ` ${at}` : ''} (${year}).` }];
    }
    const out: Run[] = [];
    const add = (text: string, emphasis = false) => { if (text) out.push(!emphasis ? { text } : he && titles !== 'italic' ? { text, bold: true } : { text, italic: true }); };
    const by = authors ? `${authors}, ` : '';
    if (he) {
        const pagesAt = at || pageRange(f.pages ?? '', true);
        const tail = pagesAt ? `, ${w.page} ${pagesAt}` : '';
        if (isArticle) {
            add(`${by}"${title}", `); add(container, true);
            add(`${f.volume ? ` ${f.volume}` : ''}${year ? ` (${year})` : ''}${tail}.`);
        } else if (isChapter) {
            add(`${by}"${title}", ${editors ? `${editors} ${editorWord(source, w)}, ` : ''}`); add(container, true);
            add(`${place ? `, ${place}` : ''}${year ? `, ${year}` : ''}${tail}.`);
        } else {
            add(by); add(title, true);
            add(`${place ? `, ${place}` : ''}${year ? `, ${year}` : ''}${at ? `, ${w.page} ${at}` : ''}.`);
        }
        return out;
    }
    if (isArticle) {
        add(`${by}"${title}," `); add(container, true);
        add(`${f.volume ? ` ${f.volume}` : ''}${f.number ? `, no. ${f.number}` : ''}${year ? ` (${year})` : ''}${at || f.pages ? `: ${at || f.pages}` : ''}.`);
    } else if (isChapter) {
        add(`${by}"${title}," in `); add(container, true);
        add(`${editors ? `, ed. ${editors}` : ''} (${[place, year].filter(Boolean).join(', ')})${at ? `, ${at}` : ''}.`);
    } else {
        add(by); add(title, true);
        add(` (${[place, year].filter(Boolean).join(', ')})${at ? `, ${at}` : ''}.`);
    }
    return out;
}

/** A source already given: back to its first note, or "ibid." when the last note gave it. */
function repeatNote(source: Source, locator: string, style: 'notes' | 'legal', firstNote: number, same: boolean): Run[] {
    if (isTorah(source)) return [{ text: same ? `שם${locator ? `, ${locator}` : ''}.` : `${torahPlace(source, locator)}.` }];
    const he = hebrew(source);
    const at = pageRange(locator, he);
    if (style === 'legal') {
        const pin = at ? `, בעמ' ${at}` : '';
        return [{ text: same ? `שם${pin}.` : `${surname(source)}, לעיל ה"ש ${firstNote}${pin}.` }];
    }
    if (he) {
        const pin = at ? `, ${WORDS.he.page} ${at}` : '';
        return [{ text: same ? `שם${pin}.` : `${surname(source)} (לעיל הערה ${firstNote})${pin}.` }];
    }
    const pin = at ? `, ${at}` : '';
    return [{ text: same ? `Ibid.${pin ? ` ${at}.` : ''}` : `${surname(source)} (above, n. ${firstNote})${pin}.` }];
}

/** The note of a citation, the next one in the book, in the style. */
export function citationNote(raw: string, library: SourceLibrary, state: NoteState): Run[] {
    const style = library.style === 'legal' ? 'legal' : 'notes';
    const parts = parseCitation(raw) ?? [];
    const byKey = new Map(library.entries.map((e) => [e.key, e]));
    const note = state.count;
    const runs: Run[] = [];
    parts.forEach((part, i) => {
        const source = byKey.get(part.key);
        if (!source) return;
        if (i) runs.push({ text: ' ' });
        const first = state.first.get(part.key);
        runs.push(...(first === undefined
            ? fullNote(source, part.locator, style, library.titles)
            : repeatNote(source, part.locator, style, first, state.last === part.key && parts.length === 1)));
        if (first === undefined) state.first.set(part.key, note);
    });
    state.last = parts.length === 1 ? parts[0].key : null;
    return runs;
}

const runNode = (r: Run): JSONContent => {
    const marks = [...(r.italic ? [{ type: 'italic' }] : []), ...(r.bold ? [{ type: 'bold' }] : [])];
    return { type: 'text', text: r.text, ...(marks.length ? { marks } : {}) };
};

/**
 * A mark on the written-out text, for an export whose format can keep a citation
 * alive: Word's fields. `raw` is the citation as the writer wrote it.
 */
export const CITATION_MARK = 'citationField';
/** Marks on the first and last text of the list, where Word's field around it opens and closes. */
export const LIST_START_MARK = 'bibliographyStart';
export const LIST_END_MARK = 'bibliographyEnd';

/**
 * Every citation in a parsed chapter written out in the style; the keys it used
 * added to `used`, in the order first cited. In a note style each becomes a real
 * footnote, numbered through the book by `notes`.
 */
export function applyCitations(node: JSONContent, library: SourceLibrary, used: Set<string>, live = false, notes: NoteState = newNoteState()): JSONContent {
    const definitions: JSONContent[] = [];
    const walk = (current: JSONContent, inNote: boolean): JSONContent[] => {
        if (current.type === 'codeBlock') return [current];
        if (current.type === 'footnoteReference' && !inNote) { notes.count++; notes.last = null; return [current]; }
        if (current.type !== 'text') {
            const within = inNote || current.type === 'footnoteDefinition';
            return [current.content ? { ...current, content: current.content.flatMap((child) => walk(child, within)) } : current];
        }
        if (!current.text || current.marks?.some((m) => m.type === 'code')) return [current];
        const out: JSONContent[] = [];
        let at = 0;
        const plain = (text: string) => { if (text) out.push({ ...current, text }); };
        for (const match of current.text.matchAll(CITATION)) {
            const parts = parseCitation(match[0]);
            if (!parts || parts.some((p) => !library.entries.some((e) => e.key === p.key))) continue;
            for (const part of parts) used.add(part.key);
            plain(current.text.slice(at, match.index));
            at = match.index + match[0].length;
            if (isNoteStyle(library.style)) {
                if (inNote) {
                    // A note inside a note cannot be: the source is written out where it stands.
                    plain(plainRuns(parts.flatMap((p) => fullNote(library.entries.find((e) => e.key === p.key)!, p.locator, library.style === 'legal' ? 'legal' : 'notes', library.titles))));
                } else {
                    notes.count++;
                    const label = `cite-${notes.count}`;
                    out.push({ type: 'footnoteReference', attrs: { label } });
                    definitions.push({ type: 'footnoteDefinition', attrs: { label }, content: [{ type: 'paragraph', content: citationNote(match[0], library, notes).map(runNode) }] });
                }
                continue;
            }
            const formatted = formatCitation(match[0], library, [...used])!;
            // Word has no form for a Torah source: a field it updated would add a year and a page word.
            if (live && !parts.some((p) => isTorah(library.entries.find((e) => e.key === p.key)!))) out.push({ ...current, text: formatted, marks: [...(current.marks ?? []), { type: CITATION_MARK, attrs: { raw: match[0] } }] });
            else plain(formatted);
        }
        plain(current.text.slice(at));
        // With nothing to keep apart, one text node, as it came.
        return !live && out.length && out.every((n) => n.type === 'text') ? [{ ...current, text: out.map((n) => n.text).join('') }] : out;
    };
    const content = (node.content ?? []).flatMap((child) => walk(child, false));
    return node.content ? { ...node, content: [...content, ...definitions] } : node;
}

/** The list as document nodes, ready to go at the end of a book. Null with nothing cited, and in legal writing, whose notes are all it has. */
export function bibliographyDoc(library: SourceLibrary, used: ReadonlySet<string>, direction: 'rtl' | 'ltr', live = false): JSONContent | null {
    if (!used.size || library.style === 'legal') return null;
    const entries = bibliography(library, used, direction);
    return {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: bibliographyTitle(library.style, direction) }] },
            ...entries.map((runs, i) => ({
                type: 'paragraph',
                content: runs.map((r, k) => {
                    const node = runNode(r);
                    const marks = [
                        ...(node.marks ?? []),
                        ...(live && i === 0 && k === 0 ? [{ type: LIST_START_MARK }] : []),
                        ...(live && i === entries.length - 1 && k === runs.length - 1 ? [{ type: LIST_END_MARK }] : []),
                    ];
                    return { ...node, ...(marks.length ? { marks } : {}) };
                }),
            })),
        ],
    };
}

/** The direction of a text's first strong letter: what the list's order goes by. */
export const textDirection = (text: string): 'rtl' | 'ltr' => (firstStrongDirection(text) === 'rtl' ? 'rtl' : 'ltr');

/** Which way a whole document mostly runs: an English title or citation doesn't turn a Hebrew text around. */
export const documentDirection = (text: string): 'rtl' | 'ltr' => {
    const rtl = text.match(/[\u0590-\u08FF]/g)?.length ?? 0;
    const ltr = text.match(/[A-Za-z\u00C0-\u024F]/g)?.length ?? 0;
    return rtl > ltr ? 'rtl' : 'ltr';
};
