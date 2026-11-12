import { Text } from '@tiptap/extension-text';
import type { MarkdownSerializerState } from 'prosemirror-markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type MarkdownIt from 'markdown-it';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';

/**
 * Plain text, saved the way tiptap-markdown saves it — except a Pandoc
 * citation and an HTML comment, which are written back as typed.
 *
 * markdown-it reads `[@smith2020, p. 4]` as ordinary text, and the serializer
 * escapes every bracket in text, so the save wrote `\[@smith2020, p. 4\]` —
 * which Pandoc no longer reads as a citation. A bracketed run holding an
 * `@key` (Pandoc's `[@a; @b]`, `[see @a, p. 4]`, `[-@a]`) now goes out as it
 * came in; everything else is escaped exactly as before.
 *
 * With html off, `<!-- a note -->` opens as text too, and the save wrote it
 * as `&lt;!-- a note --&gt;` — a visible line in Obsidian, GitHub and every
 * other reader, where it had been a hidden note. A comment is not markup the
 * webview runs, so it goes out as it came in; other HTML is still escaped.
 * It also opens as one run of text: read as Markdown, `<!-- *draft* -->`
 * came in with its stars turned to emphasis and could not be written back.
 *
 * `[[wikilinks]]` and `$math$` go out as they came in too: escaped, a note
 * link became `\[\[note\]\]` and `$\alpha$` became `$\\alpha$`. They are read
 * as one piece (MarkdownFidelity.ts), so the save finds them whole. So does
 * an HTML tag the file had inside a line (the rawHtml mark); one the writer
 * types is text, and still escaped.
 */
export const CITATION = /\[[^[\]\n]*?-?@[\p{L}\p{N}_][^[\]\n]*\]/gu;

/** `<!-- … -->`, on one line or across several. */
export const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** `[[note]]`, `[[note|shown]]`, `![[embed.png]]`. */
export const WIKILINK = /!?\[\[[^[\]\n]+\]\]/gu;

/**
 * `$x$` and `$$x$$` inside a line, Pandoc's way: no space inside the dollars,
 * and no digit right after the closing one — `$5 and $6` is two prices.
 */
export const INLINE_MATH = /\$\$(?:[^$\n]|\$(?!\$))+?\$\$|\$(?=[^\s$])(?:[^$\n\\]|\\[^\n])*?(?<=[^\s\\])\$(?!\d)/gu;

/** What is written as typed: comments, wikilinks and math. */
const KEPT = new RegExp(`${HTML_COMMENT.source}|${WIKILINK.source}|${INLINE_MATH.source}`, 'gu');

// `<!-- … -->` inside a line (or a paragraph's lines), as one text token —
// before emphasis, links and the rest can read the inside as Markdown.
function htmlComment(state: StateInline, silent: boolean): boolean {
    if (!state.src.startsWith('<!--', state.pos)) return false;
    const end = state.src.indexOf('-->', state.pos + 4);
    if (end === -1 || end + 3 > state.posMax) return false;
    if (!silent) state.push('text', '', 0).content = state.src.slice(state.pos, end + 3);
    state.pos = end + 3;
    return true;
}

// tiptap-markdown's own escapeHTML: with html off, markup in the text is text.
const escapeHTML = (value: string) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Text with its citations kept as typed.
function writeText(state: MarkdownSerializerState, raw: string) {
    const text = escapeHTML(raw);
    let at = 0;
    for (const match of text.matchAll(CITATION)) {
        if (match.index > at) state.text(text.slice(at, match.index));
        state.text(match[0], false);
        at = match.index + match[0].length;
    }
    if (at < text.length) state.text(text.slice(at));
}

export const TextWithCitations = Text.extend({
    addStorage() {
        return {
            markdown: {
                serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
                    const text = node.text ?? '';
                    if (node.marks.some((mark) => mark.type.name === 'rawHtml')) {
                        state.text(text, false);
                        return;
                    }
                    let at = 0;
                    for (const match of text.matchAll(KEPT)) {
                        if (match.index > at) writeText(state, text.slice(at, match.index));
                        state.text(match[0], false);
                        at = match.index + match[0].length;
                    }
                    if (at < text.length) writeText(state, text.slice(at));
                },
                parse: {
                    setup(markdownit: MarkdownIt) {
                        markdownit.inline.ruler.before('autolink', 'html_comment', htmlComment);
                    },
                },
            },
        };
    },
});
