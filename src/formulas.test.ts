// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { buildBook, parseMarkdown } from '../vendor/purewrite/src/services/export/engine';
import { unzip } from '../vendor/purewrite/src/services/export/zip';
import { withFormulas } from './formulas';
import { toCommonMark, type Formula } from './obsidianMarkdown';

const resolver = { resolve: () => null };

function book(markdown: string, format: 'docx' | 'epub' | 'html') {
    const formulas: Formula[] = [];
    const doc = withFormulas(parseMarkdown(toCommonMark(markdown, resolver, { formulas })), formulas);
    return buildBook(format, { title: 't', chapters: [{ name: 'a.md', doc }], defaultDirection: 'ltr' });
}

const NOTE = 'The roots of $ax^2+bx+c$ are\n\n$$\nx = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$\n\nand $a_1 * b_1$ stays whole; $\\frac{$ is broken.';

describe('formulas in the book', () => {
    it('reach Word as equations: inline in the line, display on its own and centred', () => {
        const files = unzip(book(NOTE, 'docx'));
        const xml = new TextDecoder().decode(files.get('word/document.xml')!);
        expect(xml).toContain('xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"');
        expect((xml.match(/<m:oMath>/g) ?? []).length).toBe(3);
        expect(xml).toMatch(/<w:jc w:val="center"\/>(?:(?!<\/w:p>).)*<m:oMathPara><m:oMath>(?:(?!<\/w:p>).)*<m:rad>/);
        expect(xml).toContain('<m:f><m:num>');
        // `_` and `*` in TeX never become emphasis.
        expect(xml).not.toContain('<w:i/>');
        // KaTeX cannot read it: the TeX, as written.
        expect(xml).toContain('\\frac{</w:t>');
    });

    it('reach EPUB and HTML as MathML', () => {
        const files = unzip(book(NOTE, 'epub'));
        const chapter = new TextDecoder().decode(files.get('OEBPS/chapter-001.xhtml')!);
        expect(chapter).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">');
        expect(new TextDecoder().decode(files.get('OEBPS/content.opf')!)).toContain('properties="mathml"');
        const html = new TextDecoder().decode(book(NOTE, 'html'));
        expect(html).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">');
        expect(html).not.toContain('annotation encoding="application/x-tex">\\frac{-b');
    });
});
