import { Extension } from '@tiptap/core';
import type MarkdownIt from 'markdown-it';
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs';
import type Token from 'markdown-it/lib/token.mjs';

/**
 * Task lists that survive a round-trip.
 *
 * 1. Tight or loose. tiptap-markdown keeps a `tight` attribute on bullet and
 *    ordered lists only, so a task list had nothing to remember it by and was
 *    always written loose: "- [ ] a\n- [ ] b" came back with a blank line
 *    between the items.
 * 2. A bullet list followed by a task list. "- a\n\n- [ ] b" is one list to
 *    markdown (same marker, a blank line only loosens it), and the editor has
 *    no node for a list whose items are part plain, part task: the parse
 *    produced an empty task item, the plain items and the tasks, and the save
 *    wrote the empty task back. Before rendering, such a list is split into
 *    its runs of plain and task items, each tight or loose by its own lines —
 *    which is also how the editor writes the two lists back.
 */

const SPLIT_RULE = 'purewrite-split-mixed-lists';

/** The one part of markdown-it's Ruler its typings leave out: the rule list. */
interface RulerInternals {
    __rules__: Array<{ name: string }>;
}

function isTaskItem(token: Token): boolean {
    return (token.attrGet('class') ?? '').split(' ').includes('task-list-item');
}

/** Index of the token closing the one opened at `open`. */
function closingIndex(tokens: Token[], open: number): number {
    const closeType = tokens[open].type.replace(/_open$/, '_close');
    for (let i = open + 1; i < tokens.length; i += 1) {
        if (tokens[i].type === closeType && tokens[i].level === tokens[open].level) return i;
    }
    return tokens.length - 1;
}

function splitMixedLists(state: StateCore) {
    const tokens = state.tokens;
    const lines: string[] = state.src.split('\n');
    const isBlank = (line: number) => line >= 0 && (lines[line] ?? '').trim() === '';

    // From the end, so splicing a list never shifts one not yet visited.
    for (let open = tokens.length - 1; open >= 0; open -= 1) {
        if (tokens[open].type !== 'bullet_list_open') continue;
        const close = closingIndex(tokens, open);
        const level = tokens[open].level;

        const items: Array<{ start: number; end: number; task: boolean }> = [];
        for (let i = open + 1; i < close; i += 1) {
            if (tokens[i].type === 'list_item_open' && tokens[i].level === level + 1) {
                const end = closingIndex(tokens, i);
                items.push({ start: i, end, task: isTaskItem(tokens[i]) });
                i = end;
            }
        }
        if (items.every((item) => item.task === items[0].task)) continue;

        const runs: Array<typeof items> = [];
        for (const item of items) {
            const run = runs[runs.length - 1];
            if (run && run[0].task === item.task) run.push(item);
            else runs.push([item]);
        }

        const MarkdownToken = tokens[open].constructor as typeof Token;
        const rebuilt: Token[] = [];
        for (const run of runs) {
            const listOpen = new MarkdownToken('bullet_list_open', 'ul', 1);
            listOpen.markup = tokens[open].markup;
            listOpen.level = level;
            listOpen.block = true;
            if (run[0].task) listOpen.attrSet('class', 'contains-task-list');
            const listClose = new MarkdownToken('bullet_list_close', 'ul', -1);
            listClose.markup = tokens[close].markup;
            listClose.level = level;
            listClose.block = true;

            // A run is tight when no blank line sits between its items and
            // none of them holds a second paragraph.
            const tight = run.every((item, k) => {
                const paragraphs = tokens
                    .slice(item.start, item.end)
                    .filter((t) => t.type === 'paragraph_open' && t.level === level + 2).length;
                return paragraphs <= 1 && (k === 0 || !isBlank(tokens[item.start].map![0] - 1));
            });

            rebuilt.push(listOpen);
            for (const item of run) {
                const itemTokens = tokens.slice(item.start, item.end + 1);
                for (const t of itemTokens) {
                    if ((t.type === 'paragraph_open' || t.type === 'paragraph_close') && t.level === level + 2) {
                        t.hidden = tight;
                    }
                }
                rebuilt.push(...itemTokens);
            }
            rebuilt.push(listClose);
        }
        tokens.splice(open, close - open + 1, ...rebuilt);
    }
}

export const TaskListMarkdown = Extension.create({
    name: 'taskListMarkdown',

    addGlobalAttributes() {
        return [
            {
                types: ['taskList'],
                attributes: {
                    // Same rule tiptap-markdown uses for bullet lists: markdown-it
                    // wraps a loose list's items in <p>, a tight list's not.
                    tight: {
                        default: true,
                        parseHTML: (element: HTMLElement) =>
                            element.getAttribute('data-tight') === 'true' || !element.querySelector('p'),
                        renderHTML: (attributes: { tight?: boolean }) =>
                            attributes.tight ? { 'data-tight': 'true' } : {},
                    },
                },
            },
        ];
    },

    addStorage() {
        return {
            markdown: {
                parse: {
                    // Called before every parse; the rule goes in once, at the
                    // end of the core chain — after the task-list plugin has
                    // marked which items are tasks.
                    setup(markdownit: MarkdownIt) {
                        const ruler = markdownit.core.ruler as typeof markdownit.core.ruler & RulerInternals;
                        if (ruler.__rules__.some((rule) => rule.name === SPLIT_RULE)) return;
                        markdownit.core.ruler.push(SPLIT_RULE, splitMixedLists);
                    },
                },
            },
        };
    },
});
