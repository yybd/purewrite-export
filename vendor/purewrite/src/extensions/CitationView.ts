import { Extension } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { bibliography, formatCitation, isNoteStyle, parseCitation, plainRuns, type SourceLibrary } from '../services/sources';
import { CITATION } from './TextWithCitations';

/**
 * A citation as it reads, on screen only: the text stays [@cohen2019, 12], in
 * the file and in the document, and over it the editor draws (כהן, 2019, עמ' 12).
 * With the cursor in it the citation shows as written, to edit like any text.
 * Decorations only, and none without a library, so nothing changes for a
 * document with no sources.
 */

const key = new PluginKey<DecorationSet>('citationView');

export interface CitationViewStorage {
    library: SourceLibrary | null;
    /** A click on a citation: open its source. */
    onOpen: ((sourceKey: string) => void) | null;
    /** The keys of the list offered on typing [@, in the writer's language. */
    completeHint: string;
}

declare module '@tiptap/core' {
    interface Storage {
        citationView: CitationViewStorage;
    }
    interface Commands<ReturnType> {
        citationView: {
            setCitationLibrary: (library: SourceLibrary | null) => ReturnType;
        };
    }
}

/** What a reader sees on resting over a citation: the source, and the passage kept from that page. */
function tooltip(raw: string, library: SourceLibrary): string {
    const parts = parseCitation(raw) ?? [];
    return parts.map(({ key: sourceKey, locator }) => {
        const source = library.entries.find((e) => e.key === sourceKey);
        if (!source) return '';
        const line = plainRuns(bibliography({ ...library, entries: [source] }, null, 'ltr')[0] ?? []);
        const passage = source.passages.find((p) => locator && p.page === locator);
        return passage ? `${line}\n\n${passage.text}` : line;
    }).filter(Boolean).join('\n\n');
}

function build(doc: PMNode, state: Pick<EditorState, 'selection'>, library: SourceLibrary | null): DecorationSet {
    if (!library) return DecorationSet.empty;
    const decorations: Decoration[] = [];
    const { from, to } = state.selection;
    const noteStyle = isNoteStyle(library.style);
    // The numbered styles number by first citation, and notes count the writer's own too.
    const cited = new Set<string>();
    let note = 0;
    doc.descendants((node, pos, parent) => {
        if (node.type.name === 'footnoteReference') note++;
        if (!node.isText || parent?.type.spec.code || node.marks.some((m) => m.type.name === 'code')) return;
        for (const match of (node.text ?? '').matchAll(CITATION)) {
            const start = pos + match.index;
            const end = start + match[0].length;
            const parts = parseCitation(match[0]) ?? [];
            for (const part of parts) cited.add(part.key);
            const formatted = formatCitation(match[0], { ...library, style: noteStyle ? 'apa' : library.style }, [...cited]);
            if (formatted === null) {
                decorations.push(Decoration.inline(start, end, { class: 'cite-missing' }));
                continue;
            }
            if (noteStyle) note++;
            // The cursor inside it, or at its edge: as written.
            if (from <= end && to >= start) {
                decorations.push(Decoration.inline(start, end, { class: 'cite-editing' }));
                continue;
            }
            decorations.push(Decoration.inline(start, end, { class: 'cite-raw' }));
            const first = parts[0]?.key ?? '';
            const shown = noteStyle ? String(note) : formatted;
            decorations.push(Decoration.widget(start, () => {
                const span = document.createElement(noteStyle ? 'sup' : 'span');
                span.className = 'cite';
                span.contentEditable = 'false';
                span.dataset.citeKey = first;
                span.title = tooltip(match[0], library);
                span.textContent = shown;
                return span;
            }, { side: -1, ignoreSelection: true, key: `cite:${shown}:${first}` }));
        }
    });
    return DecorationSet.create(doc, decorations);
}

export const CitationView = Extension.create<Record<string, never>, CitationViewStorage>({
    name: 'citationView',

    addStorage() {
        return { library: null, onOpen: null, completeHint: '' };
    },

    addCommands() {
        return {
            setCitationLibrary: (library) => ({ tr, dispatch }) => {
                this.storage.library = library;
                if (dispatch) dispatch(tr.setMeta(key, true).setMeta('addToHistory', false));
                return true;
            },
        };
    },

    addProseMirrorPlugins() {
        const storage = this.storage;
        return [new Plugin<DecorationSet>({
            key,
            state: {
                init: (_, state) => build(state.doc, state, storage.library),
                apply: (tr, old, _oldState, newState) => (tr.docChanged || tr.selectionSet || tr.getMeta(key) ? build(newState.doc, newState, storage.library) : old),
            },
            props: {
                decorations: (state) => key.getState(state),
                handleDOMEvents: {
                    mousedown: (_view, event) => {
                        const cite = (event.target as Element | null)?.closest?.<HTMLElement>('.cite');
                        if (!cite || !storage.onOpen) return false;
                        event.preventDefault();
                        storage.onOpen(cite.dataset.citeKey ?? '');
                        return true;
                    },
                },
            },
        })];
    },
});
