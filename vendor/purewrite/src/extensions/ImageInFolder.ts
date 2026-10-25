import Image, { ImageOptions } from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

/** Reads an image file and returns a URL the webview can show, or null. */
export type ImageLoader = (absolutePath: string) => Promise<string | null>;

/** Writes an image into `dir`; returns the file name used, or null. */
export type ImageSaver = (dir: string, name: string, bytes: Uint8Array) => Promise<string | null>;

interface ImageInFolderOptions extends ImageOptions {
    loadImage: ImageLoader;
    saveImage: ImageSaver;
    /** Called when a dropped or pasted image could not be saved. */
    onSaveError: (error: unknown) => void;
}

/** Dropped or pasted images go here, beside the document. */
export const IMAGE_FOLDER = 'images';

export function imageFiles(list: FileList | null | undefined): File[] {
    return Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
}

/**
 * A file name for a dropped or pasted image. A screenshot pasted from the
 * clipboard arrives as plain `image.png`, so it gets a dated name instead —
 * twenty of them would otherwise be image, image-2… image-20.
 */
export function imageFileName(file: File, now: Date = new Date()): string {
    const ext = (file.type.split('/')[1] ?? 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    if (!file.name || /^image\.\w+$/i.test(file.name)) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        return `pasted ${stamp}.${ext}`;
    }
    return file.name.replace(/[/\\]/g, '-').replace(/^\.+/, '');
}

/**
 * The Markdown link to a saved image. Only what would break the link is
 * encoded — spaces and brackets — so a Hebrew file name stays readable in
 * the file.
 */
export function imageMarkdownPath(name: string): string {
    const escapes: Record<string, string> = { ' ': '%20', '%': '%25', '(': '%28', ')': '%29', '<': '%3C', '>': '%3E' };
    return `${IMAGE_FOLDER}/${name.replace(/[ %()<>]/g, (c) => escapes[c])}`;
}

const EXTERNAL = /^(https?:|data:|blob:)/i;

/**
 * Where `src` points, on disk, for a document in `baseDir`. Markdown image
 * paths are relative to the file and URL-encoded (`my%20photo.png`).
 */
export function resolveImagePath(src: string, baseDir: string): string {
    const clean = decodeURI(src.split(/[?#]/)[0]);
    if (clean.startsWith('/')) return clean;
    const parts = baseDir.split('/');
    for (const segment of clean.split('/')) {
        if (segment === '..') parts.pop();
        else if (segment && segment !== '.') parts.push(segment);
    }
    return parts.join('/');
}

/**
 * `![alt](path "title")`, kept and shown.
 *
 * Without an image node the schema dropped every image on load, and the next
 * save wrote the file back without them — the image lines were deleted from
 * the user's file. The node keeps `src` exactly as written, so the file
 * round-trips; only the displayed <img> gets a resolved URL, read through
 * the workspace-scoped Rust side (images live beside the document, which the
 * webview cannot load by path).
 *
 * Inline, because Markdown images are inline: a block image would split the
 * paragraph around it.
 */
export const ImageInFolder = Image.extend<ImageInFolderOptions>({
    inline: true,
    group: 'inline',

    addOptions() {
        return {
            inline: true,
            allowBase64: false,
            HTMLAttributes: {},
            loadImage: async () => null,
            saveImage: async () => null,
            onSaveError: () => {},
        };
    },

    addStorage() {
        return {
            ...this.parent?.(),
            markdown: {
                parse: {
                    setup(markdownit: { normalizeLink: (url: string) => string }) {
                        // markdown-it percent-encodes every non-ASCII character
                        // of a link or image path, so `![](מפה.jpg)` came back
                        // from a save as `![](%D7%9E%D7%A4%D7%94.jpg)` — and
                        // `[x](עמוד.md)` the same. Keep paths as written; only
                        // a space is encoded, because a bare one would end the
                        // path when the file is read back.
                        markdownit.normalizeLink = (url) => url.replace(/ /g, '%20');
                    },
                },
            },
            // The open document's folder. Set before the document's content
            // is, so each node view resolves against the right place.
            baseDir: '' as string,
        };
    },

    addProseMirrorPlugins() {
        const extension = this;

        // Save each file beside the document, then insert it where it was
        // dropped (or at the cursor). The file goes to disk first: an image
        // node pointing at a file that failed to save would be a broken
        // link written into the document.
        const insertImages = async (files: File[], pos: number) => {
            const baseDir: string = extension.storage.baseDir;
            let at = pos;
            for (const file of files) {
                try {
                    const bytes = new Uint8Array(await file.arrayBuffer());
                    const saved = await extension.options.saveImage(`${baseDir}/${IMAGE_FOLDER}`, imageFileName(file), bytes);
                    if (!saved) throw new Error('Images cannot be saved here');
                    extension.editor
                        .chain()
                        .insertContentAt(at, { type: extension.name, attrs: { src: imageMarkdownPath(saved), alt: '' } })
                        .run();
                    at = extension.editor.state.selection.to;
                } catch (e) {
                    extension.options.onSaveError(e);
                    return;
                }
            }
        };

        return [
            new Plugin({
                key: new PluginKey('imageDropPaste'),
                props: {
                    handleDrop(view: EditorView, event: DragEvent, _slice, moved: boolean) {
                        // `moved` is a drag inside the document — ProseMirror's.
                        if (moved || !extension.storage.baseDir) return false;
                        const files = imageFiles(event.dataTransfer?.files);
                        if (!files.length) return false;
                        event.preventDefault();
                        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
                        void insertImages(files, at?.pos ?? view.state.selection.from);
                        return true;
                    },
                    handlePaste(view: EditorView, event: ClipboardEvent) {
                        if (!extension.storage.baseDir) return false;
                        const files = imageFiles(event.clipboardData?.files);
                        if (!files.length) return false;
                        // Word and many apps put a picture of the copied text
                        // on the clipboard beside the text itself. When there
                        // is text, the user copied text.
                        if (event.clipboardData?.getData('text/plain').trim()) return false;
                        event.preventDefault();
                        void insertImages(files, view.state.selection.from);
                        return true;
                    },
                },
            }),
        ];
    },

    addNodeView() {
        return ({ node }) => {
            const img = document.createElement('img');
            img.alt = node.attrs.alt ?? '';
            if (node.attrs.title) img.title = node.attrs.title;
            img.className = 'md-image';
            const src: string = node.attrs.src ?? '';
            const baseDir: string = this.storage.baseDir;
            if (EXTERNAL.test(src)) {
                img.src = src;
            } else if (src && baseDir) {
                img.dataset.loading = 'true';
                void this.options.loadImage(resolveImagePath(src, baseDir)).then((url: string | null) => {
                    delete img.dataset.loading;
                    if (url) img.src = url;
                    else img.dataset.missing = 'true';
                });
            }
            return { dom: img };
        };
    },
});
