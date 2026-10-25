import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TableRow from '@tiptap/extension-table-row';
import type { AnyExtension } from '@tiptap/core';
import { ParagraphDirection } from './ParagraphDirection';
import { TaskListMarkdown } from './TaskListMarkdown';
import { TableWithAlignment, TableHeaderWithAlignment, TableCellWithAlignment } from './TableMarkdown';
import { LinkWithTitle } from './LinkWithTitle';
import { FootnoteReference, FootnoteDefinition } from './Footnotes';
import { ImageInFolder, ImageLoader, ImageSaver } from './ImageInFolder';
import { SearchHighlight } from './SearchHighlight';
import { FocusMode } from './FocusMode';

export interface ImageIO {
    loadImage: ImageLoader;
    saveImage: ImageSaver;
    onSaveError: (error: unknown) => void;
}

/**
 * The editor's whole schema, in one place. The editor builds from this and so
 * do the round-trip tests: two extensions can claim the same HTML (Superscript
 * and footnote references both parse <sup>), and a test with a smaller list
 * passed while the app deleted footnotes on save.
 */
export function editorExtensions(images: ImageIO): AnyExtension[] {
    return [
    StarterKit,
    // html:false — don't parse raw HTML embedded in markdown files
    // (keeps saved markdown clean, and defense-in-depth for a webview
    // whose IPC can touch the filesystem).
    Markdown.configure({ html: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
    // Keeps a task list tight or loose as written, and a bullet list
    // directly followed by a task list as two lists (see TaskListMarkdown.ts).
    TaskListMarkdown,
    // StarterKit does not bundle Link, and without the mark the schema
    // has nowhere to keep an href: `[text](url)` opened as bare text
    // and the next autosave wrote it back with the URL deleted — the
    // link target was lost from the file, not just from the screen.
    //
    // openOnClick stays off, but not because links shouldn't open —
    // tiptap's own handler navigates the *webview*, and the webview is
    // the app, so it would replace the editor with a web page and no
    // way back. handleClick below opens the URL through the OS instead.
    //
    // autolink is off to keep the file as written. With it on, a bare
    // URL sitting in the text gains a link mark on load, and the save
    // that follows rewrites the line as `<url>` — a change the user
    // never made.
    LinkWithTitle.configure({ openOnClick: false, autolink: false }),
    // Without these four nodes the schema has nowhere to put a table,
    // so a GFM table in the file collapses into a run of loose text on
    // open — and is saved back that way. The alignment-aware variants
    // additionally keep `:---:` markers across a round-trip (see
    // TableMarkdown.ts).
    //
    // resizable stays off: a column width is a colwidth attribute with
    // no markdown representation, so dragging one would look like an
    // edit that then vanishes on the next load.
    TableWithAlignment.configure({ resizable: false }),
    TableRow,
    TableHeaderWithAlignment,
    TableCellWithAlignment,
    // `[^1]` and `[^1]: note`. Without them the save escaped every
    // footnote to `\[^1\]` (see Footnotes.ts).
    FootnoteReference,
    FootnoteDefinition,
    // `![alt](path)`. Without it every image was deleted from the file
    // on the next save (see ImageInFolder.ts).
    // Dropped or pasted images are saved to images/ beside the file.
    ImageInFolder.configure(images),
    SearchHighlight,
    FocusMode,
    ParagraphDirection,
    ];
}
