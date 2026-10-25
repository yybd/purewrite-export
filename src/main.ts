import { App, Modal, Notice, Platform, Plugin, PluginSettingTab, TFile, TFolder, normalizePath, setIcon, type TAbstractFile } from 'obsidian';
import {
    buildBook,
    buildPrintPage,
    exportFileName,
    imageFromBytes,
    imageSources,
    isRemoteImage,
    parseMarkdown,
    type EngineInput,
    type ExportChapter,
    type ExportImage,
} from '../vendor/purewrite/src/services/export/engine';
import { BOOK_FILE, orderByBook, parseBook, serializeBook, type BookSettings } from '../vendor/purewrite/src/services/export/book';
import { detectDirection, toCommonMark } from './obsidianMarkdown';
import { pagedJs, pdfAvailable, renderPdf } from './pdf';
import { isHebrew, t } from './strings';

/**
 * PureWrite Export: a note, or a folder of chapters, as one Word, PDF or EPUB
 * file — built by PureWrite's own export engine (vendor/purewrite, copied
 * from the app by scripts/sync-engine.mjs), so a book exported here is the
 * document the app would make from the same folder. The dialog is the app's
 * export dialog too: its layout, its words, its black-and-white controls.
 *
 * The folder's settings live in the folder (.purewrite-book.json, see
 * book.ts): the title and switches this export used are written back for the
 * next one, here or in PureWrite, and the chapter order PureWrite saved there
 * is followed here.
 *
 * Everything runs on the device: nothing is uploaded, and the file is written
 * into the vault, beside what it was made from — which also makes it work on
 * a phone or tablet, where there is no save dialog. PDF is desktop-only: it is
 * drawn by Chromium (pdf.ts), which a phone's Obsidian does not expose.
 */

type Format = 'docx' | 'pdf' | 'epub';
const FORMAT_LABELS: Record<Format, string> = { docx: 'Word', pdf: 'PDF', epub: 'EPUB' };
const PUREWRITE_URL = 'https://puretext.bdtech.app/purewrite';

interface Job {
    /** The folder being exported, or null for a single note. */
    folder: TFolder | null;
    files: TFile[];
    /** Where the book file is read from and written to; null for a note. */
    bookPath: string | null;
    book: BookSettings;
    /** Where the export is written. */
    outDir: string;
}

interface Settings {
    title: string;
    chapterPageBreak: boolean;
    firstLineIndent: boolean;
}

type Progress = { kind: 'reading'; done: number; total: number; file: string } | { kind: 'writing' } | { kind: 'layout'; pages: number };

/**
 * What the desktop app can do with a file it doesn't open itself. Not in the
 * public API, so each is looked up before it is offered; on a phone neither
 * exists and the dialog says where the file is.
 */
interface DesktopApp {
    openWithDefaultApp?(path: string): void;
    showInFolder?(path: string): void;
}
interface VaultConfig {
    getConfig?(key: string): unknown;
}

const folderPath = (folder: TFolder) => (folder.isRoot() ? '' : folder.path);
const relativeTo = (folder: TFolder, file: TFile) => (folder.isRoot() ? file.path : file.path.slice(folder.path.length + 1));

/** A folder's notes, folders first and then by name, as Obsidian lists them. */
function notesIn(folder: TFolder): TFile[] {
    const out: TFile[] = [];
    const visit = (dir: TFolder) => {
        const children = dir.children
            .filter((c) => !c.name.startsWith('.'))
            .sort((a, b) => {
                const da = a instanceof TFolder;
                if (da !== b instanceof TFolder) return da ? -1 : 1;
                return a.name.localeCompare(b.name, undefined, { numeric: true });
            });
        for (const child of children) {
            if (child instanceof TFolder) visit(child);
            else if (child instanceof TFile && child.extension === 'md') out.push(child);
        }
    };
    visit(folder);
    return out;
}

export default class PureWriteExport extends Plugin {
    async onload() {
        this.addCommand({
            id: 'export-folder',
            name: t('commandFolder'),
            checkCallback: (checking) => {
                const parent = this.app.workspace.getActiveFile()?.parent;
                if (!parent) return false;
                if (!checking) void this.openFolder(parent);
                return true;
            },
        });
        this.addCommand({
            id: 'export-note',
            name: t('commandNote'),
            checkCallback: (checking) => {
                const file = this.app.workspace.getActiveFile();
                if (file?.extension !== 'md') return false;
                if (!checking) this.openNote(file);
                return true;
            },
        });
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file: TAbstractFile) => {
                if (file instanceof TFolder) {
                    menu.addItem((item) => item.setTitle(t('menuFolder')).setIcon('book-open').onClick(() => void this.openFolder(file)));
                } else if (file instanceof TFile && file.extension === 'md') {
                    menu.addItem((item) => item.setTitle(t('menuNote')).setIcon('file-output').onClick(() => this.openNote(file)));
                }
            }),
        );
        this.addSettingTab(new AboutTab(this.app, this));
    }

    private async openFolder(folder: TFolder) {
        const bookPath = normalizePath(`${folderPath(folder)}/${BOOK_FILE}`);
        const book = parseBook(await this.readText(bookPath));
        const files = orderByBook(notesIn(folder), (f) => relativeTo(folder, f), book.chapters);
        if (!files.length) {
            new Notice(t('noNotes'));
            return;
        }
        new ExportModal(this.app, this, { folder, files, bookPath, book, outDir: folderPath(folder) }).open();
    }

    private openNote(file: TFile) {
        new ExportModal(this.app, this, { folder: null, files: [file], bookPath: null, book: {}, outDir: file.parent ? folderPath(file.parent) : '' }).open();
    }

    async readText(path: string): Promise<string | null> {
        // The adapter, not the vault: a dot-file is not in the vault's index.
        try {
            return (await this.app.vault.adapter.exists(path)) ? await this.app.vault.adapter.read(path) : null;
        } catch {
            return null;
        }
    }

    /** An image file as Word takes it; null when it can't be read or decoded. */
    private async image(file: TFile): Promise<ExportImage | null> {
        try {
            return await imageFromBytes(new Uint8Array(await this.app.vault.readBinary(file)));
        } catch {
            return null;
        }
    }

    /** One chapter, read, adapted and parsed, with its images. */
    private async chapter(file: TFile, cache: Map<string, Promise<ExportImage | null>>): Promise<ExportChapter> {
        const resolver = {
            resolve: (target: string) => this.app.metadataCache.getFirstLinkpathDest(target, file.path)?.path ?? null,
        };
        const doc = parseMarkdown(toCommonMark(await this.app.vault.cachedRead(file), resolver));
        const images = new Map<string, ExportImage>();
        for (const src of imageSources(doc)) {
            if (isRemoteImage(src)) continue; // no network
            let path = src;
            try {
                path = decodeURI(src);
            } catch {
                /* as written */
            }
            const image = this.app.vault.getFileByPath(path);
            if (!image) continue;
            if (!cache.has(path)) cache.set(path, this.image(image));
            const loaded = await cache.get(path)!;
            if (loaded) images.set(src, loaded);
        }
        return { name: file.name, doc, images };
    }

    async export(job: Job, format: Format, settings: Settings, onProgress: (p: Progress) => void): Promise<string> {
        const cache = new Map<string, Promise<ExportImage | null>>();
        const chapters: ExportChapter[] = [];
        for (let i = 0; i < job.files.length; i++) {
            onProgress({ kind: 'reading', done: i + 1, total: job.files.length, file: job.files[i].basename });
            chapters.push(await this.chapter(job.files[i], cache));
        }
        onProgress({ kind: 'writing' });
        const firstText = await this.app.vault.cachedRead(job.files[0]);
        const input: EngineInput = {
            title: settings.title,
            chapters,
            defaultDirection: detectDirection(toCommonMark(firstText, { resolve: () => null })),
            chapterPageBreak: settings.chapterPageBreak,
            firstLineIndent: settings.firstLineIndent,
        };
        const bytes =
            format === 'pdf'
                ? await renderPdf(buildPrintPage(input, pagedJs), (pages) => onProgress({ kind: 'layout', pages }))
                : buildBook(format, input);

        const out = normalizePath(`${job.outDir}/${exportFileName(settings.title, format)}`);
        const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const existing = this.app.vault.getFileByPath(out);
        if (existing) await this.app.vault.modifyBinary(existing, data);
        else await this.app.vault.createBinary(out, data);

        if (job.bookPath) {
            // As PureWrite does after an export (book.ts). The order is the
            // app's to write; an EPUB says nothing about page breaks.
            const changes: BookSettings = {
                title: settings.title,
                firstLineIndent: settings.firstLineIndent,
                chapterPageBreak: format === 'epub' ? undefined : settings.chapterPageBreak,
            };
            try {
                await this.app.vault.adapter.write(job.bookPath, serializeBook(changes, await this.readText(job.bookPath)));
            } catch (e) {
                console.error('PureWrite Export: could not save the book file', e);
            }
        }
        return out;
    }
}

/**
 * PureWrite's export dialog (src/components/ExportDialog.tsx in the app),
 * built from Obsidian's elements: title field, the numbered chapter list,
 * the format switch, the two book switches, the privacy line, and one wide
 * button. Black on white in a light theme, white on black in a dark one —
 * the app's colours, taken from the theme's text and background.
 */
class ExportModal extends Modal {
    private formats: Format[];
    private format: Format = 'docx';
    private settings: Settings;
    private running = false;

    constructor(
        app: App,
        private plugin: PureWriteExport,
        private job: Job,
    ) {
        super(app);
        this.formats = pdfAvailable() ? ['docx', 'pdf', 'epub'] : ['docx', 'epub'];
        this.settings = {
            title: job.book.title ?? (job.folder ? (job.folder.isRoot() ? app.vault.getName() : job.folder.name) : job.files[0].basename),
            chapterPageBreak: job.book.chapterPageBreak ?? true,
            firstLineIndent: job.book.firstLineIndent ?? false,
        };
    }

    onOpen() {
        this.modalEl.addClass('pwx-modal');
        if (isHebrew()) this.modalEl.dir = 'rtl';
        this.setTitle(t(this.job.folder ? 'titleFolder' : 'titleNote'));
        this.render();
    }

    private render() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('pwx');
        const body = contentEl.createDiv({ cls: 'pwx-body' });

        body.createEl('label', { cls: 'pwx-label', text: t('documentTitle') });
        const title = body.createEl('input', { cls: 'pwx-input', type: 'text', value: this.settings.title });
        title.dir = 'auto';
        title.spellcheck = false;
        title.addEventListener('input', () => (this.settings.title = title.value));

        if (this.job.folder) {
            body.createDiv({ cls: 'pwx-label pwx-gap', text: t('chapters', { count: this.job.files.length }) });
            const list = body.createEl('ol', { cls: 'pwx-chapters' });
            this.job.files.forEach((file, i) => {
                const li = list.createEl('li');
                li.createSpan({ cls: 'pwx-number', text: String(i + 1) });
                setIcon(li.createSpan({ cls: 'pwx-icon' }), 'file-text');
                const name = li.createSpan({ cls: 'pwx-name', text: file.basename });
                name.dir = 'auto';
                const sub = relativeTo(this.job.folder!, file);
                if (sub.includes('/')) {
                    const where = li.createSpan({ cls: 'pwx-sub', text: sub.slice(0, sub.lastIndexOf('/')) });
                    where.dir = 'auto';
                }
            });
            body.createEl('p', { cls: 'pwx-hint', text: t(this.job.book.chapters ? 'orderSaved' : 'orderByName') });
        }

        const formats = body.createDiv({ cls: 'pwx-formats', attr: { role: 'radiogroup', 'aria-label': t('format') } });
        for (const f of this.formats) {
            const button = formats.createEl('button', { cls: 'pwx-format', text: FORMAT_LABELS[f], attr: { role: 'radio', 'aria-checked': String(f === this.format) } });
            if (f === this.format) button.addClass('is-active');
            button.addEventListener('click', () => {
                if (this.running || f === this.format) return;
                this.format = f;
                this.render();
            });
        }

        // An EPUB has no pages to break: every chapter is a file of its own.
        const breaks = Boolean(this.job.folder) && this.format !== 'epub';
        if (breaks) {
            this.checkbox(body, t('pageBreaks'), this.settings.chapterPageBreak, (v) => (this.settings.chapterPageBreak = v)).addClass('pwx-gap');
        }
        this.checkbox(body, t('firstLineIndent'), this.settings.firstLineIndent, (v) => (this.settings.firstLineIndent = v)).addClass(breaks ? 'pwx-gap-s' : 'pwx-gap');
        body.createEl('p', { cls: 'pwx-hint pwx-privacy', text: t('privacy') });

        const footer = contentEl.createDiv({ cls: 'pwx-footer' });
        const status = footer.createDiv({ cls: 'pwx-status' });
        const save = footer.createEl('button', { cls: 'pwx-primary', text: t('save', { format: FORMAT_LABELS[this.format] }) });
        save.addEventListener('click', () => void this.start(save, status));
    }

    private checkbox(parent: HTMLElement, text: string, checked: boolean, onChange: (v: boolean) => void): HTMLElement {
        const label = parent.createEl('label', { cls: 'pwx-check' });
        const box = label.createEl('input', { type: 'checkbox' });
        box.checked = checked;
        box.addEventListener('change', () => onChange(box.checked));
        label.appendText(text);
        return label;
    }

    private async start(button: HTMLButtonElement, status: HTMLElement) {
        if (this.running) return;
        this.running = true;
        button.disabled = true;
        status.removeClass('is-error');
        try {
            const title = this.settings.title.trim() || this.job.files[0].basename;
            const path = await this.plugin.export(this.job, this.format, { ...this.settings, title }, (p) => {
                status.setText(
                    p.kind === 'reading'
                        ? t('progress', { file: p.file, done: p.done, total: p.total })
                        : p.kind === 'layout'
                          ? t('layingOut', { count: p.pages || '' }).trim()
                          : t('writing'),
                );
            });
            this.showDone(path);
        } catch (e) {
            console.error('PureWrite Export failed', e);
            status.addClass('is-error');
            status.setText(t('failed', { message: (e as Error)?.message ?? String(e) }));
            this.running = false;
            button.disabled = false;
        }
    }

    /**
     * The export's result, in the dialog. Closing it with a Notice was too
     * quiet: Obsidian's file list hides .docx and .epub unless "Detect all
     * file extensions" is on, so the file appeared nowhere and the export
     * looked as if it had done nothing. A PDF Obsidian opens itself.
     */
    private showDone(path: string) {
        const { contentEl } = this;
        contentEl.empty();
        const body = contentEl.createDiv({ cls: 'pwx-body' });
        body.createEl('p', { cls: 'pwx-saved', text: t('saved') });
        const where = body.createDiv({ cls: 'pwx-path', text: path });
        where.dir = 'auto';

        const isPdf = path.toLowerCase().endsWith('.pdf');
        const shown = (this.app.vault as unknown as VaultConfig).getConfig?.('showUnsupportedFiles');
        if (!isPdf && shown === false) body.createEl('p', { cls: 'pwx-hint', text: t('hidden') });

        const desktop = this.app as unknown as DesktopApp;
        const footer = contentEl.createDiv({ cls: 'pwx-footer pwx-actions' });
        if (Platform.isDesktopApp && desktop.showInFolder) {
            footer.createEl('button', { cls: 'pwx-secondary', text: t('reveal') }).addEventListener('click', () => desktop.showInFolder!(path));
        }
        const file = this.app.vault.getFileByPath(path);
        const canOpen = Boolean((isPdf && file) || (Platform.isDesktopApp && desktop.openWithDefaultApp));
        if (canOpen) {
            footer.createEl('button', { cls: 'pwx-primary', text: t('open') }).addEventListener('click', () => {
                if (isPdf && file) void this.app.workspace.getLeaf('tab').openFile(file);
                else desktop.openWithDefaultApp!(path);
                this.close();
            });
        }
        footer.createEl('button', { cls: canOpen ? 'pwx-secondary' : 'pwx-primary', text: t('done') }).addEventListener('click', () => this.close());
    }

    onClose() {
        this.contentEl.empty();
    }
}

/**
 * Nothing to set — every choice is made per export, and remembered in the
 * book's folder. The tab says where the engine comes from.
 */
class AboutTab extends PluginSettingTab {
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('p', { text: t('about') });
        const p = containerEl.createEl('p');
        p.createEl('a', { text: t('aboutLink'), href: PUREWRITE_URL });
    }
}
