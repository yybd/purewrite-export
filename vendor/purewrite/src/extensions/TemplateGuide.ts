import { Extension } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { matchHeadings } from '../templates/project';
import { nodeText, templateDirection, type TemplateDef, type TemplateLanguage } from '../templates/types';

/**
 * A template's guidance, drawn under each heading it matches: what the part
 * is for, and — while the cursor is in that part — what a reader would ask of
 * it. Decorations only. None of it is in the document, so none of it is saved,
 * copied or exported, and the file stays what the writer wrote.
 *
 * The guidance takes its direction from the project's language, not from the
 * paragraph it sits under: a Hebrew prompt under a heading typed in English
 * still reads right to left.
 */

export interface TemplateGuideOptions {
    template: TemplateDef;
    language: TemplateLanguage;
    /** Parts the writer linked to a heading of their own (ProjectState.links). */
    links?: Record<string, string>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        templateGuide: {
            /** Show a template's guidance, or none with null. */
            setTemplateGuide: (guide: TemplateGuideOptions | null) => ReturnType;
        };
    }
}

interface TemplateGuideStorage {
    guide: TemplateGuideOptions | null;
}

const key = new PluginKey<DecorationSet>('templateGuide');

function build(state: EditorState, guide: TemplateGuideOptions | null): DecorationSet {
    if (!guide) return DecorationSet.empty;
    const { template, language, links } = guide;
    const headings = matchHeadings(state.doc, template, links);
    const cursor = state.selection.from;
    const dir = templateDirection(language);
    const decorations: Decoration[] = [];
    headings.forEach((h, i) => {
        if (!h.node) return;
        const text = nodeText(h.node, language);
        const after = h.pos + (state.doc.nodeAt(h.pos)?.nodeSize ?? 0);
        // The part runs to the next heading at its level or above.
        let end = state.doc.content.size;
        for (let j = i + 1; j < headings.length; j++) {
            if (headings[j].level <= h.level) { end = headings[j].pos; break; }
        }
        const next = headings[i + 1]?.pos ?? state.doc.content.size;
        const active = cursor > h.pos && cursor <= Math.min(end, next);
        const empty = next === after;
        decorations.push(Decoration.widget(after, () => {
            const box = document.createElement('div');
            box.className = `tg-prompt${active ? ' tg-active' : ''}${empty ? ' tg-empty' : ''}`;
            box.contentEditable = 'false';
            box.dir = dir;
            box.lang = language;
            const prompt = document.createElement('div');
            prompt.className = 'tg-text';
            prompt.textContent = text.prompt;
            box.appendChild(prompt);
            if (active && text.questions?.length) {
                const list = document.createElement('ul');
                list.className = 'tg-questions';
                for (const q of text.questions) {
                    const li = document.createElement('li');
                    li.textContent = q;
                    list.appendChild(li);
                }
                box.appendChild(list);
            }
            return box;
        }, {
            side: -1,
            ignoreSelection: true,
            // Redrawn only when what it shows changes.
            key: `${h.node.id}:${language}:${active ? 1 : 0}:${empty ? 1 : 0}`,
        }));
    });
    return DecorationSet.create(state.doc, decorations);
}

/**
 * Put the caret where the writer writes below the block ending at `pos`: in
 * the paragraph there, or in a new one when the next thing is a heading or
 * the end, as it is in a part or a question not yet written.
 */
export function writeBelow(view: EditorView, pos: number): void {
    const { state } = view;
    const tr = state.tr;
    if (state.doc.nodeAt(pos)?.type.name !== 'paragraph') tr.insert(pos, state.schema.nodes.paragraph.create());
    view.dispatch(tr.setSelection(TextSelection.create(tr.doc, pos + 1)).scrollIntoView());
    view.focus();
}

export const TemplateGuide = Extension.create<Record<string, never>, TemplateGuideStorage>({
    name: 'templateGuide',

    addStorage() {
        return { guide: null };
    },

    addCommands() {
        return {
            setTemplateGuide: (guide) => ({ tr, dispatch }) => {
                this.storage.guide = guide;
                if (dispatch) dispatch(tr.setMeta(key, true));
                return true;
            },
        };
    },

    addProseMirrorPlugins() {
        const storage = this.storage;
        return [
            new Plugin<DecorationSet>({
                key,
                state: {
                    init: (_, state) => build(state, storage.guide),
                    apply: (tr, old, _oldState, newState) =>
                        tr.docChanged || tr.selectionSet || tr.getMeta(key) ? build(newState, storage.guide) : old,
                },
                props: {
                    decorations: (state) => key.getState(state),
                    handleDOMEvents: {
                        // A click on the guidance is a writer going to write there.
                        mousedown: (view, event) => {
                            const box = (event.target as Element | null)?.closest?.('.tg-prompt');
                            if (!box || !view.editable) return false;
                            event.preventDefault();
                            writeBelow(view, view.posAtDOM(box, 0));
                            return true;
                        },
                    },
                },
            }),
        ];
    },
});
