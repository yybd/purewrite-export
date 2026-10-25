import { Text } from '@tiptap/extension-text';
import type { MarkdownSerializerState } from 'prosemirror-markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

/**
 * Plain text, saved the way tiptap-markdown saves it — except a Pandoc
 * citation, which is written back as typed.
 *
 * markdown-it reads `[@smith2020, p. 4]` as ordinary text, and the serializer
 * escapes every bracket in text, so the save wrote `\[@smith2020, p. 4\]` —
 * which Pandoc no longer reads as a citation. A bracketed run holding an
 * `@key` (Pandoc's `[@a; @b]`, `[see @a, p. 4]`, `[-@a]`) now goes out as it
 * came in; everything else is escaped exactly as before.
 */
export const CITATION = /\[[^[\]\n]*?-?@[\p{L}\p{N}_][^[\]\n]*\]/gu;

// tiptap-markdown's own escapeHTML: with html off, markup in the text is text.
const escapeHTML = (value: string) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const TextWithCitations = Text.extend({
    addStorage() {
        return {
            markdown: {
                serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
                    const text = escapeHTML(node.text ?? '');
                    let at = 0;
                    for (const match of text.matchAll(CITATION)) {
                        if (match.index > at) state.text(text.slice(at, match.index));
                        state.text(match[0], false);
                        at = match.index + match[0].length;
                    }
                    if (at < text.length) state.text(text.slice(at));
                },
            },
        };
    },
});
