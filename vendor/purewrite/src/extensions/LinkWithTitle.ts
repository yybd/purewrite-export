import Link from '@tiptap/extension-link';

/**
 * The link mark, plus the one thing tiptap's own leaves behind: the title.
 *
 * `[text](url "the title")` reaches the DOM as `<a title="the title">`, and
 * tiptap's Link keeps only href/target/rel/class — so the title was dropped on
 * load and gone from the file at the next save. prosemirror-markdown already
 * writes a title back out when the mark carries one; it just needs somewhere
 * to survive the round trip.
 */
export const LinkWithTitle = Link.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            title: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('title'),
                renderHTML: (attributes: Record<string, any>) =>
                    attributes.title ? { title: attributes.title } : {},
            },
        };
    },
});
