import { Node } from '@tiptap/core';
import type { MarkdownSerializerState } from 'prosemirror-markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type MarkdownIt from 'markdown-it';
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs';

/**
 * An HTML comment on lines of its own — `<!-- a note -->`, or one that runs
 * over several lines — kept as written and left out of the export.
 *
 * With html off, markdown-it read it as a paragraph: its line breaks were
 * folded into spaces and the save escaped it to `&lt;!-- … --&gt;`, a line
 * every other Markdown reader shows. It is a note to the writer, not text of
 * the document, so the editor shows it as one and Word, PDF and EPUB, which
 * build from the document, leave it out. A comment inside a line is text
 * (TextWithCitations.ts).
 */

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// From a line that starts with `<!--` to the line that ends with `-->`. A
// comment followed by more text on its closing line is left to the paragraph.
function htmlCommentBlock(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const start = state.bMarks[startLine] + state.tShift[startLine];
    if (!state.src.startsWith('<!--', start)) return false;

    let line = startLine;
    for (; line < endLine; line++) {
        const from = line === startLine ? start + 4 : state.bMarks[line];
        const close = state.src.indexOf('-->', from);
        if (close !== -1 && close < state.eMarks[line]) {
            if (state.src.slice(close + 3, state.eMarks[line]).trim() !== '') return false;
            break;
        }
        // A blank line ends the attempt: CommonMark's own comment block runs
        // on, but the paragraph rule that would otherwise read it does not.
        if (line > startLine && state.isEmpty(line)) return false;
    }
    if (line === endLine) return false;
    if (silent) return true;

    const token = state.push('html_comment_block', '', 0);
    token.content = state.src.slice(start, state.eMarks[line]).trimEnd();
    token.map = [startLine, line + 1];
    state.line = line + 1;
    return true;
}

export function htmlCommentPlugin(md: MarkdownIt): void {
    md.block.ruler.before('html_block', 'html_comment_block', htmlCommentBlock, {
        alt: ['paragraph', 'reference', 'blockquote'],
    });
    md.renderer.rules.html_comment_block = (tokens, idx) =>
        `<div data-html-comment="${escapeHtml(tokens[idx].content)}"></div>\n`;
}

export const HtmlComment = Node.create({
    name: 'htmlComment',
    group: 'block',
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            text: {
                default: '',
                parseHTML: (el: HTMLElement) => el.getAttribute('data-html-comment'),
                renderHTML: (attrs: { text?: string }) => ({ 'data-html-comment': attrs.text }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-html-comment]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        return ['div', { ...HTMLAttributes, class: 'html-comment', dir: 'auto' }, node.attrs.text];
    },

    addStorage() {
        return {
            markdown: {
                serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
                    state.write(node.attrs.text);
                    state.closeBlock(node);
                },
                parse: {
                    setup(markdownit: MarkdownIt) {
                        markdownit.use(htmlCommentPlugin);
                    },
                },
            },
        };
    },
});
