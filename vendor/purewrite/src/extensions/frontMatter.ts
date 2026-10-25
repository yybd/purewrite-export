/**
 * YAML front matter, kept out of the editor and put back on save byte for byte.
 *
 * The block at the top of a file — `---`, properties, `---` — is how Obsidian,
 * Jekyll, Hugo and Pandoc keep a note's title, tags and dates. Markdown has no
 * such thing, so the editor read it as a horizontal rule and a heading, and the
 * save that follows every open wrote that back: the properties were gone from
 * the file the moment it was opened. Now the block never enters the editor;
 * the document below it does, and the save writes the block back unchanged.
 */

// From the first line of the file to the closing `---` (or YAML's `...`), and
// the blank lines after it — the editor drops leading blank lines from the
// document, so they belong to the part that is kept aside. As in Pandoc and
// Obsidian, the line after the opening `---` must not be blank: a file that
// opens with a horizontal rule and a paragraph is a document, not properties.
const FRONT_MATTER = /^---[ \t]*\r?\n(?:(?![ \t]*\r?\n)[\s\S]*?\r?\n)?(?:---|\.\.\.)[ \t]*(?:\r?\n|$)(?:[ \t]*\r?\n)*/;

export interface SplitMarkdown {
    /** The front matter as written, with the blank lines after it; '' when there is none. */
    frontMatter: string;
    /** Everything after it — what the editor shows. */
    body: string;
}

export function splitFrontMatter(markdown: string): SplitMarkdown {
    const match = FRONT_MATTER.exec(markdown);
    if (!match) return { frontMatter: '', body: markdown };
    return { frontMatter: match[0], body: markdown.slice(match[0].length) };
}

/** The file to save: the front matter as it was, then the editor's document. */
export function joinFrontMatter(frontMatter: string, body: string): string {
    return frontMatter + body;
}
