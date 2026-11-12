/**
 * Words in a text, as the status bar and the templates count them. Kept out
 * of the React hook (useDocumentStats) so the export engine, which the
 * Obsidian plugin copies, can count words without React.
 */

// Intl.Segmenter splits Japanese, which has no spaces, into real words;
// splitting on whitespace would count a whole Japanese paragraph as one.
const segmenter: Intl.Segmenter | null =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'word' }) : null;

export function countWords(text: string): number {
    if (!segmenter) return text.split(/\s+/).filter(Boolean).length;
    let n = 0;
    for (const s of segmenter.segment(text)) {
        if (s.isWordLike) n++;
    }
    return n;
}
