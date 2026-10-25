import type { JSONContent } from '@tiptap/core';
import { firstStrongDirection, RTL_LETTER } from '../../extensions/ParagraphDirection';

/**
 * Which characters of a paragraph Word should treat as right-to-left.
 *
 * Word does not run the whole Unicode bidi algorithm on what it is given: a
 * run marked `w:rtl` is right-to-left — its spaces, punctuation and digits
 * included — and a run without it is left-to-right. Hand it a Hebrew
 * sentence with an English word inside as one run and the punctuation lands
 * on the wrong side. So the export decides per character, the way the
 * browser does when it shows the editor: letters are strong, digits follow
 * the letter before them (W7), and neutrals between two letters of the same
 * direction take it, otherwise the paragraph's (N1/N2).
 */

type Dir = 'rtl' | 'ltr';

const LETTER = /\p{L}/u;
const DIGIT = /\p{Nd}/u;

/** One direction per code point of `chars`, in a paragraph of `paragraph` direction. */
export function resolveDirections(chars: readonly string[], paragraph: Dir): Dir[] {
    const out = new Array<Dir | null>(chars.length).fill(null);
    let previousStrong: Dir = paragraph;
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (RTL_LETTER.test(ch)) out[i] = previousStrong = 'rtl';
        else if (LETTER.test(ch)) out[i] = previousStrong = 'ltr';
        else if (DIGIT.test(ch)) out[i] = previousStrong === 'ltr' ? 'ltr' : 'rtl';
    }
    // Neutrals: the direction on both sides if they agree, else the paragraph's.
    let i = 0;
    while (i < chars.length) {
        if (out[i] !== null) {
            i++;
            continue;
        }
        let j = i;
        while (j < chars.length && out[j] === null) j++;
        const before = i > 0 ? (out[i - 1] as Dir) : paragraph;
        const after = j < chars.length ? (out[j] as Dir) : paragraph;
        const dir = before === after ? before : paragraph;
        for (let k = i; k < j; k++) out[k] = dir;
        i = j;
    }
    return out as Dir[];
}

export interface DirectedText {
    text: string;
    rtl: boolean;
}

/**
 * Splits each piece of a paragraph's text into runs of one direction. The
 * pieces are resolved together — a space at the end of a bold Hebrew word
 * looks at the plain word after it — but split apart, so each run keeps the
 * formatting of the piece it came from. A null piece (a footnote mark, an
 * image) is a neutral boundary and yields an empty list.
 */
export function splitByDirection(pieces: readonly (string | null)[], paragraph: Dir): DirectedText[][] {
    const chars: string[] = [];
    const ranges: [number, number][] = [];
    for (const piece of pieces) {
        const start = chars.length;
        if (piece === null) chars.push('￼');
        else chars.push(...Array.from(piece));
        ranges.push([start, chars.length]);
    }
    const dirs = resolveDirections(chars, paragraph);
    return pieces.map((piece, p) => {
        if (piece === null) return [];
        const [start, end] = ranges[p];
        const runs: DirectedText[] = [];
        for (let i = start; i < end; i++) {
            const rtl = dirs[i] === 'rtl';
            const last = runs[runs.length - 1];
            if (last && last.rtl === rtl) last.text += chars[i];
            else runs.push({ text: chars[i], rtl });
        }
        return runs;
    });
}

/** A node's text as the editor's `textContent` sees it — for direction. */
export function plainText(node: JSONContent): string {
    if (node.type === 'text') return node.text ?? '';
    // A nested footnote definition is not part of the text around it.
    return (node.content ?? []).map((child) => (child.type === 'footnoteDefinition' ? '' : plainText(child))).join('');
}

/**
 * The editor's per-block direction rule (ParagraphDirection.ts), walked in
 * document order by every exporter so Word, PDF and EPUB cannot disagree:
 * a block resolves from its first strong letter, one without inherits the
 * block before it. A list, quote, table or footnote resolves once from all
 * its text, and the paragraphs inside it take that direction.
 */
export class DirectionTracker {
    constructor(private inherited: Dir) {}

    /** A container: its own text first, then what its parent forces, then the block before. */
    container(node: JSONContent, forced?: Dir): Dir {
        const dir = firstStrongDirection(plainText(node)) ?? forced ?? this.inherited;
        this.inherited = dir;
        return dir;
    }

    /** A text block; `forced` is its container's direction. */
    block(node: JSONContent, forced?: Dir): Dir {
        if (forced) return forced;
        const dir = firstStrongDirection(plainText(node)) ?? this.inherited;
        this.inherited = dir;
        return dir;
    }

    /** For a detour (a footnote's text) that must not move the main flow's inheritance. */
    aside<T>(run: () => T): T {
        const saved = this.inherited;
        try {
            return run();
        } finally {
            this.inherited = saved;
        }
    }
}
