/**
 * A book's export settings, kept in the book's own folder so that every tool
 * exporting it starts from the same place: PureWrite's export dialog, and the
 * PureWrite Export plugin for Obsidian, which runs this same engine over the
 * same folder (an Obsidian vault and a PureWrite folder are one folder).
 *
 *   <book folder>/.purewrite-book.json
 *   { "version": 1, "title": "הספר שלי", "chapterPageBreak": true,
 *     "firstLineIndent": true, "chapters": ["01 פתיחה.md", "חלק ב/02.md"] }
 *
 * The leading dot keeps it out of both apps' file lists.
 *
 * Who writes what:
 * - The title and the two switches are written by whichever app exported
 *   last, and read by both as the dialog's starting values.
 * - `chapters` is written only by PureWrite, and only when the sidebar holds
 *   an order the user dragged (sortBy "custom"): that is where a book's order
 *   is edited. A sidebar sorted by date is no order worth handing on.
 *   Without `chapters` a reader orders by name, which is Obsidian's
 *   convention (01, 02, …) and what PureWrite's "name" sort gives too.
 *
 * Every field is optional, and a field this version does not know is kept
 * on write: a newer app's settings survive an export from an older one.
 */

export const BOOK_FILE = '.purewrite-book.json';
const VERSION = 1;

export interface BookSettings {
    title?: string;
    chapterPageBreak?: boolean;
    firstLineIndent?: boolean;
    /** Paths relative to the book folder, '/'-separated, in reading order. */
    chapters?: string[];
}

function asObject(text: string | null | undefined): Record<string, unknown> {
    if (!text) return {};
    try {
        const parsed: unknown = JSON.parse(text);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
        return {};
    }
}

/**
 * The settings in a book file. A field of the wrong type is ignored rather
 * than failing the whole file: it may have been edited by hand, or mangled by
 * a sync, and the export should still open.
 */
export function parseBook(text: string | null | undefined): BookSettings {
    const raw = asObject(text);
    const book: BookSettings = {};
    if (typeof raw.title === 'string' && raw.title.trim()) book.title = raw.title;
    if (typeof raw.chapterPageBreak === 'boolean') book.chapterPageBreak = raw.chapterPageBreak;
    if (typeof raw.firstLineIndent === 'boolean') book.firstLineIndent = raw.firstLineIndent;
    if (Array.isArray(raw.chapters)) {
        const chapters = raw.chapters.filter((c): c is string => typeof c === 'string' && c.length > 0);
        if (chapters.length) book.chapters = chapters;
    }
    return book;
}

/**
 * The file's new text: `changes` over what `previous` held, unknown fields
 * included. A field set to undefined in `changes` is left as it was; to drop
 * `chapters`, pass an empty array.
 */
export function serializeBook(changes: BookSettings, previous?: string | null): string {
    const out: Record<string, unknown> = { ...asObject(previous), version: VERSION };
    for (const [key, value] of Object.entries(changes)) {
        if (value === undefined) continue;
        if (key === 'chapters' && Array.isArray(value) && value.length === 0) delete out.chapters;
        else out[key] = value;
    }
    return JSON.stringify(out, null, 2) + '\n';
}

/**
 * `items` in the book's order: those `chapters` names first, as listed; the
 * rest after them in the order they came. A listed file that is gone is
 * skipped — a chapter deleted or renamed since must not stop the export.
 */
export function orderByBook<T>(items: readonly T[], relPath: (item: T) => string, chapters?: readonly string[]): T[] {
    if (!chapters?.length) return [...items];
    const byPath = new Map(items.map((item) => [relPath(item).normalize('NFC'), item]));
    const ordered: T[] = [];
    for (const path of chapters) {
        const key = path.normalize('NFC');
        const item = byPath.get(key);
        if (item !== undefined) {
            ordered.push(item);
            byPath.delete(key);
        }
    }
    return [...ordered, ...byPath.values()];
}
