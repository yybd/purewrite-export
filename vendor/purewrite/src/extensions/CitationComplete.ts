import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection, type EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { completionQuery, matchSources, type Source, type SourceLibrary } from '../services/sources';

/**
 * Typing [@ offers the sources in the library, narrowed by what follows it.
 * Enter or a click writes the citation and moves past it; Tab leaves the cursor
 * inside it, after a comma, for the page. Nothing here runs without a library.
 */

interface Open {
    items: Source[];
    /** Where the typed part of the key starts and ends. */
    from: number;
    to: number;
}

function openAt(state: EditorState, library: SourceLibrary | null, dismissed: number | null): Open | null {
    const { selection } = state;
    if (!library || !selection.empty) return null;
    const { $from } = selection;
    if (!$from.parent.isTextblock || $from.parent.type.spec.code || $from.marks().some((m) => m.type.name === 'code')) return null;
    const query = completionQuery($from.parent.textBetween(0, $from.parentOffset, undefined, '￼'));
    if (query === null) return null;
    const from = selection.from - query.length;
    if (dismissed === from) return null;
    const items = matchSources(library, query);
    return items.length ? { items, from, to: selection.from } : null;
}

export const CitationComplete = Extension.create({
    name: 'citationComplete',
    // Ahead of the keymaps: while the list is open, Enter and Tab belong to it.
    priority: 200,

    addProseMirrorPlugins() {
        const storage = this.editor.storage.citationView;
        let open: Open | null = null;
        let index = 0;
        let dismissed: number | null = null;
        let menu: HTMLElement | null = null;
        let current: EditorView | null = null;

        const close = () => { open = null; menu?.remove(); menu = null; };

        const accept = (view: EditorView, source: Source, forPage: boolean) => {
            if (!open) return;
            const { from, to } = open;
            const closed = view.state.doc.textBetween(to, Math.min(to + 1, view.state.selection.$from.end())) === ']';
            const text = `${source.key}${forPage ? ', ' : ''}${closed ? '' : ']'}`;
            const tr = view.state.tr.insertText(text, from, to);
            // After the closing bracket, or for a page, just inside it.
            const inside = from + source.key.length + (forPage ? 2 : 0);
            tr.setSelection(TextSelection.create(tr.doc, forPage ? inside : inside + 1));
            view.dispatch(tr);
            close();
            view.focus();
        };

        const place = () => {
            if (!menu || !open || !current) return;
            // At the end of a line WebKit on iOS can answer with an empty rectangle at
            // the top of the page; the character before the cursor has a real one.
            let at: { left: number; top: number; bottom: number } | null = null;
            for (const pos of [open.to, open.to - 1, open.to - 2]) {
                try {
                    const found = current.coordsAtPos(pos);
                    if (found.bottom > 0) { at = found; break; }
                } catch { /* not a place in the text */ }
            }
            if (!at) return;
            // The room there is: under the status bar, and above the keyboard and its toolbar.
            const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0;
            const roof = safeTop + 8;
            const toolbar = document.querySelector<HTMLElement>('[data-editor-toolbar]')?.getBoundingClientRect().top;
            const floor = Math.min(window.visualViewport?.height ?? window.innerHeight, toolbar && toolbar > at.bottom ? toolbar : Infinity) - 8;
            const below = floor - at.bottom - 4;
            const above = at.top - 4 - roof;
            menu.style.maxHeight = 'none';
            const wanted = menu.offsetHeight;
            const goBelow = below >= wanted || below >= above;
            const room = Math.max(80, goBelow ? below : above);
            const height = Math.min(wanted, room);
            menu.style.maxHeight = `${room}px`;
            menu.style.left = `${Math.max(8, Math.min(at.left, window.innerWidth - menu.offsetWidth - 8))}px`;
            menu.style.top = `${goBelow ? at.bottom + 4 : at.top - 4 - height}px`;
        };

        const draw = (view: EditorView) => {
            if (!open) { menu?.remove(); menu = null; return; }
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'cite-menu';
                menu.setAttribute('role', 'listbox');
                document.body.appendChild(menu);
            }
            menu.replaceChildren(...open.items.map((source, i) => {
                const row = document.createElement('button');
                row.type = 'button';
                row.className = i === index ? 'cite-menu-row cite-menu-active' : 'cite-menu-row';
                row.setAttribute('role', 'option');
                row.setAttribute('aria-selected', String(i === index));
                const title = document.createElement('div');
                title.dir = 'auto';
                title.className = 'cite-menu-title';
                title.textContent = source.fields.title || source.key;
                const detail = document.createElement('div');
                detail.dir = 'auto';
                detail.className = 'cite-menu-detail';
                detail.textContent = [source.fields.author, source.fields.year].filter(Boolean).join(' · ') || `@${source.key}`;
                row.append(title, detail);
                // Not a click: the editor must keep the focus, and the cursor with it.
                row.addEventListener('mousedown', (event) => { event.preventDefault(); accept(view, source, false); });
                return row;
            }));
            // Enter and Tab mean nothing on a touch screen.
            if (storage.completeHint && !window.matchMedia?.('(pointer: coarse)').matches) {
                const hint = document.createElement('div');
                hint.className = 'cite-menu-hint';
                hint.textContent = storage.completeHint;
                menu.appendChild(hint);
            }
            place();
        };

        return [new Plugin({
            key: new PluginKey('citationComplete'),
            view: (view) => {
                current = view;
                window.addEventListener('scroll', place, true);
                return {
                    update: (updated, previous) => {
                        const unchanged = previous.doc.eq(updated.state.doc) && previous.selection.eq(updated.state.selection);
                        if (unchanged && !open) return;
                        const next = openAt(updated.state, storage.library, dismissed);
                        // The dismissal lasts as long as this citation is being typed.
                        if (!next && completionQuery(updated.state.selection.$from.parent.textBetween(0, updated.state.selection.$from.parentOffset, undefined, '￼')) === null) dismissed = null;
                        if (next?.from !== open?.from || next?.items.length !== open?.items.length) index = 0;
                        open = next;
                        draw(updated);
                    },
                    destroy: () => {
                        window.removeEventListener('scroll', place, true);
                        close();
                        current = null;
                    },
                };
            },
            props: {
                handleKeyDown: (view, event) => {
                    if (!open || event.isComposing) return false;
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        const step = event.key === 'ArrowDown' ? 1 : -1;
                        index = (index + step + open.items.length) % open.items.length;
                        draw(view);
                        return true;
                    }
                    if (event.key === 'Enter' || event.key === 'Tab') {
                        accept(view, open.items[index], event.key === 'Tab');
                        return true;
                    }
                    if (event.key === 'Escape') {
                        dismissed = open.from;
                        close();
                        return true;
                    }
                    return false;
                },
                handleDOMEvents: {
                    blur: () => { close(); return false; },
                },
            },
        })];
    },
});
