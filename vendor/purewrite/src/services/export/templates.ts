/**
 * How an exported document looks: fonts, sizes, page and spacing. Sizes are
 * Word's units — font sizes in half-points, lengths in twentieths of a point
 * (twips; 1440 to the inch, 567 to the centimetre).
 *
 * The fonts are ones with Hebrew and Latin both, present on macOS, iOS and
 * Windows, so a document written on a Mac opens the same on a publisher's PC.
 */
export interface ExportTemplate {
    id: string;
    bodyFont: string;
    headingFont: string;
    monoFont: string;
    bodySize: number;
    /** Heading 1 to 6. */
    headingSizes: [number, number, number, number, number, number];
    codeSize: number;
    footnoteSize: number;
    /** 240 is single spacing. */
    lineSpacing: number;
    spaceAfter: number;
    firstLineIndent: number;
    headingSpaceBefore: number;
    headingSpaceAfter: number;
    page: { width: number; height: number; margin: number };
}

const A4 = { width: 11906, height: 16838 };

/**
 * The first-line indent setting's step, in twips: 18pt, 1.5em of 12pt body
 * type — the same 1.5em the editor indents by. Unlike the template's
 * `firstLineIndent`, which would indent every paragraph, it is applied only
 * to a paragraph that follows another.
 */
export const FIRST_LINE_INDENT = 360;

export const DEFAULT_TEMPLATE: ExportTemplate = {
    id: 'manuscript',
    bodyFont: 'Times New Roman',
    headingFont: 'Times New Roman',
    monoFont: 'Courier New',
    bodySize: 24,
    headingSizes: [36, 30, 26, 24, 24, 24],
    codeSize: 20,
    footnoteSize: 20,
    lineSpacing: 360,
    spaceAfter: 120,
    firstLineIndent: 0,
    headingSpaceBefore: 240,
    headingSpaceAfter: 120,
    page: { ...A4, margin: 1418 },
};
