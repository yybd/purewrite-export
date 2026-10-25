import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import type { MarkdownSerializerState } from '@tiptap/pm/markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type MarkdownIt from 'markdown-it';
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';

/**
 * Markdown footnotes: `text[^1]` and, anywhere in the file, `[^1]: the note`.
 *
 * Without these nodes the schema had nowhere to keep a footnote, so `[^1]`
 * opened as plain text and the next save escaped it to `\[^1\]` — every
 * footnote in the file was broken for every other Markdown tool.
 *
 * Definitions stay where the author put them. markdown-it-footnote collects
 * them into a list at the end of the document, so a file with its notes
 * under each paragraph would have them all moved to the bottom on the first
 * save; the parser here keeps each one in place, and keeps its label as
 * written (`[^note]` stays `[^note]`, not `[^1]`).
 */

const OPEN_BRACKET = 0x5b; // [
const CARET = 0x5e; // ^
const CLOSE_BRACKET = 0x5d; // ]
const COLON = 0x3a; // :
const SPACE = 0x20;
const TAB = 0x09;

/** What a footnote token carries in `meta`. */
interface FootnoteMeta {
    label: string;
}

/**
 * The block state while a definition is parsed: markdown-it-footnote's own
 * parent type, which the typings' list of parent types does not name.
 */
type FootnoteStateBlock = Omit<StateBlock, 'parentType'> & { parentType: StateBlock['parentType'] | 'footnote' };

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// `[^label]: text` — continuation lines are indented four spaces. This is
// markdown-it-footnote's own block rule, minus the collecting.
function footnoteDefinition(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    if (start + 4 > max) return false;
    if (state.src.charCodeAt(start) !== OPEN_BRACKET || state.src.charCodeAt(start + 1) !== CARET) return false;

    let pos;
    for (pos = start + 2; pos < max; pos++) {
        const ch = state.src.charCodeAt(pos);
        if (ch === SPACE) return false;
        if (ch === CLOSE_BRACKET) break;
    }
    if (pos === start + 2 || pos + 1 >= max || state.src.charCodeAt(++pos) !== COLON) return false;
    if (silent) return true;
    pos++;

    const label = state.src.slice(start + 2, pos - 2);
    const open = state.push('footnote_def_open', 'div', 1);
    open.meta = { label };

    const oldBMark = state.bMarks[startLine];
    const oldTShift = state.tShift[startLine];
    const oldSCount = state.sCount[startLine];
    const oldParentType = state.parentType;

    const posAfterColon = pos;
    const initial = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
    let offset = initial;
    while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (ch === TAB) offset += 4 - (offset % 4);
        else if (ch === SPACE) offset++;
        else break;
        pos++;
    }

    state.tShift[startLine] = pos - posAfterColon;
    state.sCount[startLine] = offset - initial;
    state.bMarks[startLine] = posAfterColon;
    state.blkIndent += 4;
    (state as FootnoteStateBlock).parentType = 'footnote';
    if (state.sCount[startLine] < state.blkIndent) state.sCount[startLine] += state.blkIndent;

    state.md.block.tokenize(state, startLine, endLine);

    state.parentType = oldParentType;
    state.blkIndent -= 4;
    state.tShift[startLine] = oldTShift;
    state.sCount[startLine] = oldSCount;
    state.bMarks[startLine] = oldBMark;

    state.push('footnote_def_close', 'div', -1);
    return true;
}

// `[^label]` inside a line.
function footnoteReference(state: StateInline, silent: boolean): boolean {
    const start = state.pos;
    const max = state.posMax;
    if (start + 3 >= max) return false;
    if (state.src.charCodeAt(start) !== OPEN_BRACKET || state.src.charCodeAt(start + 1) !== CARET) return false;

    let pos;
    for (pos = start + 2; pos < max; pos++) {
        const ch = state.src.charCodeAt(pos);
        if (ch === SPACE || ch === 0x0a) return false;
        if (ch === CLOSE_BRACKET) break;
    }
    if (pos === start + 2 || pos >= max) return false;

    if (!silent) {
        const token = state.push('footnote_ref', '', 0);
        token.meta = { label: state.src.slice(start + 2, pos) };
    }
    state.pos = pos + 1;
    return true;
}

export function footnotePlugin(md: MarkdownIt): void {
    md.block.ruler.before('reference', 'footnote_def', footnoteDefinition, { alt: ['paragraph', 'reference'] });
    md.inline.ruler.before('link', 'footnote_ref', footnoteReference);
    md.renderer.rules.footnote_def_open = (tokens, idx) =>
        `<div data-footnote-def="${escapeHtml((tokens[idx].meta as FootnoteMeta).label)}">`;
    md.renderer.rules.footnote_def_close = () => '</div>\n';
    md.renderer.rules.footnote_ref = (tokens, idx) => {
        const label = escapeHtml((tokens[idx].meta as FootnoteMeta).label);
        return `<sup data-footnote-ref="${label}">${label}</sup>`;
    };
}

/** The next free numeric label — `1` in a document with none. */
export function nextFootnoteLabel(doc: ProseMirrorNode): string {
    let max = 0;
    doc.descendants((node) => {
        if (node.type.name === 'footnoteReference' || node.type.name === 'footnoteDefinition') {
            const n = Number(node.attrs.label);
            if (Number.isInteger(n) && n > max) max = n;
        }
    });
    return String(max + 1);
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        footnote: {
            /** A new note at the cursor, its definition at the end of the document. */
            insertFootnote: () => ReturnType;
        };
    }
}

export const FootnoteReference = Node.create({
    name: 'footnoteReference',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            label: {
                default: '1',
                parseHTML: (el: HTMLElement) => el.getAttribute('data-footnote-ref'),
                renderHTML: (attrs: { label?: string }) => ({ 'data-footnote-ref': attrs.label }),
            },
        };
    },

    parseHTML() {
        // Above the Superscript mark's plain `sup` rule (priority 50). At equal
        // priority the mark won: the reference loaded as a raised "1" and the
        // next save wrote it as a bare 1 — the footnote gone from the file.
        return [{ tag: 'sup[data-footnote-ref]', priority: 100 }];
    },

    renderHTML({ node, HTMLAttributes }) {
        return ['sup', mergeAttributes(HTMLAttributes, { class: 'footnote-ref' }), node.attrs.label];
    },

    addStorage() {
        return {
            markdown: {
                serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
                    state.write(`[^${node.attrs.label}]`);
                },
                parse: {
                    setup(markdownit: MarkdownIt) {
                        markdownit.use(footnotePlugin);
                    },
                },
            },
        };
    },

    addCommands() {
        return {
            insertFootnote: () => ({ state, tr, dispatch }) => {
                const definition = state.schema.nodes.footnoteDefinition;
                const paragraph = state.schema.nodes.paragraph;
                if (!definition || !paragraph) return false;
                if (dispatch) {
                    const label = nextFootnoteLabel(state.doc);
                    tr.replaceSelectionWith(this.type.create({ label }), false);
                    const end = tr.doc.content.size;
                    tr.insert(end, definition.create({ label }, paragraph.create()));
                    // Into the new, empty note, ready to type.
                    tr.setSelection(TextSelection.create(tr.doc, end + 2));
                    tr.scrollIntoView();
                    dispatch(tr);
                }
                return true;
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('footnoteJump'),
                props: {
                    // A click on a reference goes to its note.
                    handleClickOn(view, _pos, node) {
                        if (node.type.name !== 'footnoteReference') return false;
                        const label = node.attrs.label as string;
                        let target = -1;
                        view.state.doc.descendants((n, p) => {
                            if (target === -1 && n.type.name === 'footnoteDefinition' && n.attrs.label === label) target = p;
                            return target === -1;
                        });
                        if (target === -1) return false;
                        const dom = view.nodeDOM(target) as HTMLElement | null;
                        dom?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return true;
                    },
                },
            }),
        ];
    },
});

export const FootnoteDefinition = Node.create({
    name: 'footnoteDefinition',
    group: 'block',
    content: 'block+',
    defining: true,

    addAttributes() {
        return {
            label: {
                default: '1',
                parseHTML: (el: HTMLElement) => el.getAttribute('data-footnote-def'),
                renderHTML: (attrs: { label?: string }) => ({ 'data-footnote-def': attrs.label }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-footnote-def]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'footnote-def' }), 0];
    },

    addStorage() {
        return {
            markdown: {
                serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
                    state.wrapBlock('    ', `[^${node.attrs.label}]: `, node, () => state.renderContent(node));
                },
                parse: {
                    // handled by footnotePlugin, registered by FootnoteReference
                },
            },
        };
    },
});
