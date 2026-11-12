import StarterKit from '@tiptap/starter-kit';
import { Markdown, type MarkdownStorage } from 'tiptap-markdown';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { TableRow } from '@tiptap/extension-table';
import type { AnyExtension } from '@tiptap/core';
import { ParagraphDirection } from './ParagraphDirection';
import { TaskListMarkdown } from './TaskListMarkdown';
import { TableWithAlignment, TableHeaderWithAlignment, TableCellWithAlignment } from './TableMarkdown';
import { LinkWithTitle } from './LinkWithTitle';
import { FootnoteReference, FootnoteDefinition } from './Footnotes';
import { ImageInFolder, ImageLoader, ImageSaver } from './ImageInFolder';
import { SearchHighlight } from './SearchHighlight';
import { FocusMode } from './FocusMode';
import { TextWithCitations } from './TextWithCitations';
import { HtmlComment } from './HtmlComment';
import { MarkdownFidelity, RawHtml, RawMarkdown } from './MarkdownFidelity';
import { TemplateGuide } from './TemplateGuide';
import { CitationView } from './CitationView';
import { CitationComplete } from './CitationComplete';

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
    // tiptap 3's kit grew four extensions 2 did not have. Link and Underline
    // are registered below, in the order they always were (the order of
    // marks decides how overlapping ones are nested on save). TrailingNode
    // would add an empty paragraph after a closing table or list, and
    // ListKeymap changes what Backspace and Delete do at a list's edge —
    // both new behaviour nobody asked for, so they stay off.
    StarterKit.configure({ link: false, underline: false, trailingNode: false, listKeymap: false, text: false }),
    // The kit's text node, saved without escaping a Pandoc citation
    // (`[@key]` came back as `\[@key\]`; see TextWithCitations.ts).
    TextWithCitations,
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
    //
    // View: null keeps the bare <table> tiptap 2 drew. tiptap 3 otherwise
    // wraps every table in a <div>, and the block direction (and the CSS
    // that places a Hebrew table on the right) would land on the wrapper.
    TableWithAlignment.configure({ resizable: false, View: null }),
    TableRow,
    TableHeaderWithAlignment,
    TableCellWithAlignment,
    // `[^1]` and `[^1]: note`. Without them the save escaped every
    // footnote to `\[^1\]` (see Footnotes.ts).
    FootnoteReference,
    FootnoteDefinition,
    // `<!-- a note -->` on lines of its own, kept as written and left out of
    // the export. Without it the save escaped it to a visible
    // `&lt;!-- … --&gt;` (see HtmlComment.ts).
    HtmlComment,
    // Raw HTML, link definitions and display math, kept as written and shown
    // as their source; reference links, wikilinks, math and the writer's own
    // markers (`*` bullets, `_em_`, setext headings…) kept as written too.
    // Without them the first keystroke rewrote all of it (see MarkdownFidelity.ts).
    RawMarkdown,
    RawHtml,
    MarkdownFidelity,
    // `![alt](path)`. Without it every image was deleted from the file
    // on the next save (see ImageInFolder.ts).
    // Dropped or pasted images are saved to images/ beside the file.
    ImageInFolder.configure(images),
    SearchHighlight,
    FocusMode,
    ParagraphDirection,
    // A writing template's guidance under its headings — drawn, never saved
    // (see TemplateGuide.ts).
    TemplateGuide,
    // A citation as it reads, over its [@key] (see CitationView.ts).
    CitationView,
    CitationComplete,
    ];
}

// tiptap 3 types `editor.storage` from what each extension declares here;
// tiptap-markdown does not declare its own.
declare module '@tiptap/core' {
    interface Storage {
        markdown: MarkdownStorage;
    }
}
