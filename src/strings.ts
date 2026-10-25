import { getLanguage } from 'obsidian';

/**
 * The dialog's words — PureWrite's own export strings wherever the two say the
 * same thing (src/i18n/locales in the app), so the dialog reads as the app's.
 * Hebrew when Obsidian is in Hebrew, English otherwise.
 */

const en = {
    titleFolder: 'Export folder',
    titleNote: 'Export note',
    documentTitle: 'Document title',
    chapters: 'Chapters, in this order ({count}):',
    orderByName: 'By name — number the notes (01, 02, …) to order them, or drag them into order in PureWrite.',
    orderSaved: 'The order saved in PureWrite. New notes come after it, by name.',
    format: 'Format',
    pageBreaks: 'Start each chapter on a new page',
    firstLineIndent: 'First-line indent, as in a book',
    privacy: 'The document is made on this device. Nothing is uploaded.',
    progress: 'Reading {file} ({done} of {total})…',
    writing: 'Writing the document…',
    layingOut: 'Laying out the pages… {count}',
    save: 'Export as {format}…',
    saved: 'Exported.',
    hidden: 'Obsidian’s file list shows Word and EPUB files only with Settings → Files and links → Detect all file extensions.',
    open: 'Open',
    reveal: 'Show in folder',
    done: 'Done',
    failed: 'The export failed: {message}',
    noNotes: 'This folder has no notes to export.',
    menuFolder: 'Export as a book (Word / PDF / EPUB)',
    menuNote: 'Export as Word / PDF / EPUB',
    commandFolder: "Export the current note's folder as a book",
    commandNote: 'Export the current note',
    about: 'Exports are built by the export engine of PureWrite, a focused Markdown writer for Mac, iPhone and iPad. A folder exported here and in PureWrite is the same document, and the two share its settings (.purewrite-book.json in the folder).',
    aboutLink: 'About PureWrite',
    credit: 'Made with the export engine of {app}',
    cardText: 'A focused writer for Mac, iPhone and iPad, in Hebrew and English. It opens this folder as it is, exports the same book, and keeps its settings.',
    cardLink: 'Learn more',
};

const he: typeof en = {
    titleFolder: 'ייצוא התיקייה',
    titleNote: 'ייצוא הפתק',
    documentTitle: 'כותרת המסמך',
    chapters: 'הפרקים, בסדר הזה ({count}):',
    orderByName: 'לפי השם — ממספרים את הפתקים (01, 02, …) כדי לסדר אותם, או גוררים אותם לסדר ב־PureWrite.',
    orderSaved: 'הסדר שנשמר ב־PureWrite. פתקים חדשים באים אחריו, לפי השם.',
    format: 'פורמט',
    pageBreaks: 'כל פרק מתחיל בעמוד חדש',
    firstLineIndent: 'הזחת שורה ראשונה, כמו בספר',
    privacy: 'המסמך נוצר על המכשיר. שום דבר לא עולה לרשת.',
    progress: 'קורא את {file} ({done} מתוך {total})…',
    writing: 'כותב את המסמך…',
    layingOut: 'מעמד את העמודים… {count}',
    save: 'ייצוא כקובץ {format}…',
    saved: 'הייצוא הושלם.',
    hidden: 'רשימת הקבצים של Obsidian מציגה קובצי Word ו־EPUB רק כשמופעל Settings ← Files and links ← Detect all file extensions.',
    open: 'פתיחה',
    reveal: 'הצג בתיקייה',
    done: 'סגירה',
    failed: 'הייצוא נכשל: {message}',
    noNotes: 'אין בתיקייה הזו פתקים לייצוא.',
    menuFolder: 'ייצוא כספר (Word / PDF / EPUB)',
    menuNote: 'ייצוא כ־Word / PDF / EPUB',
    commandFolder: 'ייצוא התיקייה של הפתק הנוכחי כספר',
    commandNote: 'ייצוא הפתק הנוכחי',
    about: 'הייצוא נבנה במנוע הייצוא של PureWrite, עורך Markdown ממוקד ל־Mac, ל־iPhone ול־iPad. תיקייה שמיוצאת כאן וב־PureWrite היא אותו מסמך, ושניהם חולקים את ההגדרות שלה (‎.purewrite-book.json בתיקייה).',
    aboutLink: 'על PureWrite',
    credit: 'נוצר במנוע הייצוא של {app}',
    cardText: 'עורך כתיבה ממוקד ל־Mac, ל־iPhone ול־iPad, בעברית ובאנגלית. הוא פותח את התיקייה הזו כמו שהיא, מייצא את אותו ספר ושומר את ההגדרות שלה.',
    cardLink: 'לפרטים',
};

export type StringKey = keyof typeof en;

function language(): string {
    try {
        return getLanguage();
    } catch {
        return 'en';
    }
}

export const isHebrew = () => language().startsWith('he');

export function t(key: StringKey, values: Record<string, string | number> = {}): string {
    const text = (isHebrew() ? he : en)[key];
    return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}
