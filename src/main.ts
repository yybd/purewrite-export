import { App, Modal, Notice, Platform, Plugin, PluginSettingTab, Setting, TFile, TFolder, normalizePath, type TAbstractFile } from 'obsidian';
import {
    buildBook,
    exportFileName,
    imageFromBytes,
    imageSources,
    isRemoteImage,
    parseMarkdown,
    type EngineFormat,
    type ExportChapter,
    type ExportImage,
} from '../vendor/purewrite/src/services/export/engine';
import { BOOK_FILE, orderByBook, parseBook, serializeBook, type BookSettings } from '../vendor/purewrite/src/services/export/book';
import { detectDirection, toCommonMark } from './obsidianMarkdown';

/**
 * PureWrite Export: a note, or a folder of chapters, as one Word or EPUB
 * file — built by PureWrite's own export engine (vendor/purewrite, copied
 * from the app by scripts/sync-engine.mjs), so a book exported here is the
 * document the app would make from the same folder.
 *
 * The folder's settings live in the folder (.purewrite-book.json, see
 * book.ts): the title and switches this export used are written back for the
 * next one, here or in PureWrite, and the chapter order PureWrite saved there
 * is followed here.
 *
 * Everything runs on the device: nothing is uploaded, and the file is written
 * into the vault, beside what it was made from — which also makes it work on
 * a phone or tablet, where there is no save dialog.
 */

const FORMAT_LABELS: Record<EngineFormat, string> = { docx: 'Word', epub: 'EPUB' };
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
            name: "Export the current note's folder as a book",
            checkCallback: (checking) => {
                const parent = this.app.workspace.getActiveFile()?.parent;
                if (!parent) return false;
                if (!checking) void this.openFolder(parent);
                return true;
            },
        });
        this.addCommand({
            id: 'export-note',
            name: 'Export the current note',
            checkCallback: (checking) => {
                const file = this.app.workspace.getActiveFile();
                if (file?.extension !== 'md') return false;
                if (!checking) void this.openNote(file);
                return true;
            },
        });
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file: TAbstractFile) => {
                if (file instanceof TFolder) {
                    menu.addItem((item) => item.setTitle('Export as a book (Word / EPUB)').setIcon('book-open').onClick(() => void this.openFolder(file)));
                } else if (file instanceof TFile && file.extension === 'md') {
                    menu.addItem((item) => item.setTitle('Export as Word / EPUB').setIcon('file-output').onClick(() => void this.openNote(file)));
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
            new Notice('This folder has no notes to export.');
            return;
        }
        new ExportModal(this.app, this, { folder, files, bookPath, book, outDir: folderPath(folder) }).open();
    }

    private async openNote(file: TFile) {
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

    /** An image file as Word takes it; null when it can't be read or decoded. */
    private async image(file: TFile): Promise<ExportImage | null> {
        try {
            return await imageFromBytes(new Uint8Array(await this.app.vault.readBinary(file)));
        } catch {
            return null;
        }
    }

    async export(job: Job, format: EngineFormat, settings: Required<Omit<BookSettings, 'chapters'>>, onProgress: (text: string) => void): Promise<string> {
        const cache = new Map<string, Promise<ExportImage | null>>();
        const chapters: ExportChapter[] = [];
        for (let i = 0; i < job.files.length; i++) {
            onProgress(`Reading ${i + 1} of ${job.files.length}: ${job.files[i].basename}`);
            chapters.push(await this.chapter(job.files[i], cache));
        }
        onProgress('Writing…');
        const firstText = await this.app.vault.cachedRead(job.files[0]);
        const bytes = buildBook(format, {
            title: settings.title,
            chapters,
            defaultDirection: detectDirection(toCommonMark(firstText, { resolve: () => null })),
            chapterPageBreak: settings.chapterPageBreak,
            firstLineIndent: settings.firstLineIndent,
        });

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

class ExportModal extends Modal {
    private format: EngineFormat = 'docx';
    private title: string;
    private chapterPageBreak: boolean;
    private firstLineIndent: boolean;
    private running = false;

    constructor(
        app: App,
        private plugin: PureWriteExport,
        private job: Job,
    ) {
        super(app);
        this.title = job.book.title ?? (job.folder ? (job.folder.isRoot() ? app.vault.getName() : job.folder.name) : job.files[0].basename);
        this.chapterPageBreak = job.book.chapterPageBreak ?? true;
        this.firstLineIndent = job.book.firstLineIndent ?? false;
    }

    onOpen() {
        this.render();
    }

    private render() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('purewrite-export');
        this.setTitle(this.job.folder ? 'Export as a book' : 'Export note');

        new Setting(contentEl).setName('Title').addText((text) => {
            text.setValue(this.title).onChange((v) => (this.title = v));
            text.inputEl.dir = 'auto';
        });

        if (this.job.folder) {
            const count = this.job.files.length;
            contentEl.createDiv({ cls: 'setting-item-description', text: `${count} chapter${count === 1 ? '' : 's'}, in this order:` });
            const list = contentEl.createEl('ol', { cls: 'purewrite-export-chapters' });
            for (const file of this.job.files) {
                const li = list.createEl('li', { text: file.basename });
                li.dir = 'auto';
            }
            contentEl.createDiv({
                cls: 'setting-item-description',
                text: this.job.book.chapters
                    ? 'The order saved by PureWrite. New notes come after it, by name.'
                    : 'By name. Number the notes (01, 02, …) to order them, or drag them into order in PureWrite.',
            });
        }

        new Setting(contentEl).setName('Format').addDropdown((dd) =>
            dd
                .addOptions(FORMAT_LABELS)
                .setValue(this.format)
                .onChange((v) => {
                    this.format = v as EngineFormat;
                    this.render();
                }),
        );
        // An EPUB has no pages to break: every chapter is a file of its own.
        if (this.job.folder && this.format !== 'epub') {
            new Setting(contentEl)
                .setName('Each chapter on a new page')
                .addToggle((t) => t.setValue(this.chapterPageBreak).onChange((v) => (this.chapterPageBreak = v)));
        }
        new Setting(contentEl)
            .setName('Indent paragraphs')
            .setDesc('A book’s first-line indent, with no blank line between paragraphs.')
            .addToggle((t) => t.setValue(this.firstLineIndent).onChange((v) => (this.firstLineIndent = v)));

        const status = contentEl.createDiv({ cls: 'setting-item-description purewrite-export-status' });
        new Setting(contentEl).addButton((b) =>
            b
                .setButtonText(`Export ${FORMAT_LABELS[this.format]}`)
                .setCta()
                .onClick(async () => {
                    if (this.running) return;
                    this.running = true;
                    b.setDisabled(true);
                    try {
                        const title = this.title.trim() || this.job.files[0].basename;
                        const path = await this.plugin.export(
                            this.job,
                            this.format,
                            { title, chapterPageBreak: this.chapterPageBreak, firstLineIndent: this.firstLineIndent },
                            (text) => status.setText(text),
                        );
                        this.showDone(path);
                    } catch (e) {
                        console.error('PureWrite Export failed', e);
                        status.setText(`Export failed: ${(e as Error)?.message ?? e}`);
                        this.running = false;
                        b.setDisabled(false);
                    }
                }),
        );
    }

    /**
     * The export's result, in the dialog. Closing it with a Notice was too
     * quiet: Obsidian's file list hides .docx and .epub unless "Detect all
     * file extensions" is on, so the file appeared nowhere and the export
     * looked as if it had done nothing.
     */
    private showDone(path: string) {
        const { contentEl } = this;
        contentEl.empty();
        this.setTitle('Exported');
        contentEl.createDiv({ cls: 'setting-item-description', text: 'Saved to' });
        const where = contentEl.createDiv({ cls: 'purewrite-export-path', text: path });
        where.dir = 'auto';

        const desktop = this.app as unknown as DesktopApp;
        const shown = (this.app.vault as unknown as VaultConfig).getConfig?.('showUnsupportedFiles');
        if (shown === false) {
            contentEl.createDiv({
                cls: 'setting-item-description',
                text: 'Obsidian’s file list shows Word and EPUB files only with Settings → Files and links → Detect all file extensions.',
            });
        }

        const buttons = new Setting(contentEl);
        if (Platform.isDesktopApp && desktop.showInFolder) {
            buttons.addButton((b) => b.setButtonText('Show in folder').onClick(() => desktop.showInFolder!(path)));
        }
        if (Platform.isDesktopApp && desktop.openWithDefaultApp) {
            buttons.addButton((b) =>
                b
                    .setButtonText('Open')
                    .setCta()
                    .onClick(() => {
                        desktop.openWithDefaultApp!(path);
                        this.close();
                    }),
            );
        }
        buttons.addButton((b) => b.setButtonText('Done').onClick(() => this.close()));
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
        containerEl.createEl('p', {
            text: 'Exports are built by the export engine of PureWrite, a focused Markdown writer for Mac, iPhone and iPad. A folder exported here and in PureWrite is the same document, and the two share its settings (.purewrite-book.json in the folder).',
        });
        const p = containerEl.createEl('p');
        p.createEl('a', { text: 'About PureWrite', href: PUREWRITE_URL });
    }
}
