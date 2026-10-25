import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';

/**
 * Marks the top-level block holding the cursor with `has-focus`. On its own
 * it changes nothing on screen: the dimming of every other block lives in
 * CSS behind the editor's `focus-mode` class, which the setting toggles, so
 * turning focus mode on and off never touches the document.
 */
export const FocusMode = Extension.create({
    name: 'focusMode',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('focusMode'),
                props: {
                    decorations(state) {
                        const { $head } = state.selection;
                        if ($head.depth === 0) return DecorationSet.empty;
                        const from = $head.before(1);
                        const node = state.doc.nodeAt(from);
                        if (!node) return DecorationSet.empty;
                        return DecorationSet.create(state.doc, [
                            Decoration.node(from, from + node.nodeSize, { class: 'has-focus' }),
                        ]);
                    },
                },
            }),
        ];
    },
});
