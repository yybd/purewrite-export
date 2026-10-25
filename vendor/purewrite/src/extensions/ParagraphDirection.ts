import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';

/**
 * Per-block direction for mixed RTL/LTR documents.
 *
 * Every text block — and every container that draws its own decoration, a list
 * or a quote — gets an explicit `dir`, resolved from its own first strong
 * character. A block with no strong character yet —
 * an empty paragraph right after Enter, or a line of digits/punctuation —
 * has nothing to detect from, so it inherits the direction of the block above
 * it; at the top of the document it falls back to `defaultDirection` (the UI
 * language's direction: RTL for a Hebrew UI, LTR otherwise).
 *
 * This is only the *starting* direction of a block. As soon as the user types a
 * strong character the block flips to that character's direction, and explicit
 * per-block settings (text-align, a forced document direction) are untouched.
 *
 * Active only in 'auto' mode — a forced 'rtl'/'ltr' document sets the direction
 * on the editor container instead, and this extension stays out of the way.
 */

// First-strong-character detection, the same idea as HTML's `dir="auto"`, but
// computed here so we can decide what an *undetectable* block should do.
// Only letters count as strong: combining marks, digits, punctuation and emoji
// are neutral, so a block made only of them inherits instead of resolving.
const FIRST_LETTER = /\p{L}/u;
export const RTL_LETTER = /[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}]/u;

/** Direction of the first strong character, or null if the text has none. */
export function firstStrongDirection(text: string): 'rtl' | 'ltr' | null {
    const match = FIRST_LETTER.exec(text);
    if (!match) return null;
    return RTL_LETTER.test(match[0]) ? 'rtl' : 'ltr';
}

export const ParagraphDirection = Extension.create({
    name: 'paragraphDirection',

    addStorage() {
        return {
            autoDirection: true,
            defaultDirection: 'ltr' as 'rtl' | 'ltr',
        };
    },

    addCommands() {
        return {
            setAutoDirection: (enabled: boolean) => ({ tr, dispatch }: { tr: any, dispatch: any }) => {
                this.storage.autoDirection = enabled;
                if (dispatch) {
                    dispatch(tr.setMeta('autoDirectionUpdate', true));
                }
                return true;
            },
            // Direction for a block that has no previous block to inherit from
            // (i.e. the first block of the document).
            setDefaultDirection: (direction: 'rtl' | 'ltr') => ({ tr, dispatch }: { tr: any, dispatch: any }) => {
                this.storage.defaultDirection = direction;
                if (dispatch) {
                    dispatch(tr.setMeta('autoDirectionUpdate', true));
                }
                return true;
            },
        };
    },

    addProseMirrorPlugins() {
        const extension = this;

        return [
            new Plugin({
                key: new PluginKey('paragraphDirection'),
                props: {
                    decorations(state) {
                        if (!extension.storage.autoDirection) {
                            return DecorationSet.empty;
                        }

                        const decorations: Decoration[] = [];
                        const { doc } = state;
                        // Direction of the last block we resolved — what the
                        // next undetectable block inherits. Seeded with the UI
                        // language's direction for the top of the document.
                        let inherited: 'rtl' | 'ltr' = extension.storage.defaultDirection === 'rtl' ? 'rtl' : 'ltr';

                        doc.descendants((node, pos, parent) => {
                            const name = node.type.name;
                            // Stamp the direction on the CONTAINER itself so it resolves from
                            // its children's text. These wrap text blocks rather than being
                            // ones, so they'd otherwise never be stamped — and their decoration
                            // (a list's marker and indent, a quote's rule and padding) is drawn
                            // on the container, following the container's own direction. Setting
                            // it on the inner <p> alone leaves the rule on the wrong side of a
                            // Hebrew quote and the bullets on the wrong side of a Hebrew list.
                            // A table is the same case: which side its first
                            // column sits on follows the table's direction, not
                            // any one cell's. Its cells still resolve their own
                            // below, so an English cell in a Hebrew table stays
                            // aligned correctly. A footnote's label sits in its
                            // start margin, so it is the same case again.
                            if (
                                name === 'bulletList' ||
                                name === 'orderedList' ||
                                name === 'taskList' ||
                                name === 'blockquote' ||
                                name === 'table' ||
                                name === 'footnoteDefinition'
                            ) {
                                inherited = firstStrongDirection(node.textContent) ?? inherited;
                                decorations.push(
                                    Decoration.node(pos, pos + node.nodeSize, { dir: inherited })
                                );
                                return;
                            }
                            // Other text blocks resolve their own direction. Skip paragraphs
                            // inside a container handled above — they must inherit the
                            // container's direction; giving them their own dir would hide their
                            // text from the container's detection and push its marker or rule to
                            // the wrong side. Skip code blocks (stay LTR).
                            if (node.isTextblock && name !== 'codeBlock') {
                                const parentName = parent?.type?.name;
                                if (
                                    parentName === 'listItem' ||
                                    parentName === 'taskItem' ||
                                    parentName === 'blockquote' ||
                                    parentName === 'footnoteDefinition'
                                ) {
                                    return;
                                }
                                inherited = firstStrongDirection(node.textContent) ?? inherited;
                                decorations.push(
                                    Decoration.node(pos, pos + node.nodeSize, { dir: inherited })
                                );
                            }
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        paragraphDirection: {
            setAutoDirection: (enabled: boolean) => ReturnType;
            setDefaultDirection: (direction: 'rtl' | 'ltr') => ReturnType;
        }
    }
}
