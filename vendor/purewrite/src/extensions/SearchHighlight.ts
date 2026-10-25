import { Extension } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

export interface Match {
    from: number;
    to: number;
}

/**
 * Case-insensitive matches of `query`, one text node at a time — a match does
 * not cross a change of formatting. Matches do not overlap, so what is
 * highlighted is exactly what Replace all replaces.
 */
export function findMatches(doc: PMNode, query: string): Match[] {
    const matches: Match[] = [];
    if (!query) return matches;
    const lowerQuery = query.toLowerCase();
    doc.descendants((node, pos) => {
        if (!node.isText || !node.text) return;
        const text = node.text.toLowerCase();
        let index = text.indexOf(lowerQuery);
        while (index !== -1) {
            matches.push({ from: pos + index, to: pos + index + query.length });
            index = text.indexOf(lowerQuery, index + query.length);
        }
    });
    return matches;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        searchHighlight: {
            setSearchQuery: (query: string) => ReturnType;
            /** Replace the first match at or after the cursor, wrapping to the top. */
            replaceNext: (replacement: string) => ReturnType;
            replaceAll: (replacement: string) => ReturnType;
        };
    }
}

export const SearchHighlight = Extension.create({
    name: 'searchHighlight',

    addOptions() {
        return {
            className: 'bg-yellow-200 dark:bg-yellow-900/50',
        };
    },

    addStorage() {
        return {
            searchQuery: '',
        };
    },

    addCommands() {
        return {
            setSearchQuery: (query: string) => ({ tr, dispatch }) => {
                this.storage.searchQuery = query;
                if (dispatch) {
                    dispatch(tr.setMeta('searchHighlightUpdate', true));
                }
                return true;
            },
            replaceNext: (replacement: string) => ({ state, tr, dispatch }) => {
                const matches = findMatches(state.doc, this.storage.searchQuery);
                if (!matches.length) return false;
                const match = matches.find((m) => m.from >= state.selection.from) ?? matches[0];
                if (dispatch) {
                    tr.insertText(replacement, match.from, match.to);
                    // After the replaced text, so the next call takes the next match.
                    tr.setSelection(TextSelection.create(tr.doc, match.from + replacement.length));
                    dispatch(tr);
                }
                return true;
            },
            replaceAll: (replacement: string) => ({ state, tr, dispatch }) => {
                const matches = findMatches(state.doc, this.storage.searchQuery);
                if (!matches.length) return false;
                if (dispatch) {
                    // Back to front, so earlier positions stay valid. One
                    // transaction: a single undo brings everything back.
                    for (let i = matches.length - 1; i >= 0; i--) {
                        tr.insertText(replacement, matches[i].from, matches[i].to);
                    }
                    dispatch(tr);
                }
                return true;
            },
        };
    },

    addProseMirrorPlugins() {
        const extension = this;

        return [
            new Plugin({
                key: new PluginKey('searchHighlight'),
                props: {
                    decorations(state) {
                        const { searchQuery } = extension.storage;
                        const { className } = extension.options;
                        const matches = findMatches(state.doc, searchQuery);
                        if (!matches.length) return DecorationSet.empty;
                        return DecorationSet.create(
                            state.doc,
                            matches.map((m) => Decoration.inline(m.from, m.to, { class: className })),
                        );
                    },
                },
            }),
        ];
    },
});
