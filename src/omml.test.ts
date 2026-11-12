// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { texToOmml } from './omml';

describe('formulas as Word equations', () => {
    it('writes powers, fractions and roots as Word structures', () => {
        expect(texToOmml('x^2', false)).toContain('<m:sSup><m:e><m:r><m:t xml:space="preserve">x</m:t></m:r></m:e><m:sup>');
        expect(texToOmml('\\frac{a}{b}', false)).toContain('<m:f><m:num>');
        expect(texToOmml('\\sqrt{x}', false)).toContain('<m:rad><m:radPr><m:degHide m:val="1"/>');
        expect(texToOmml('\\sqrt[3]{x}', false)).toContain('<m:deg><m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t xml:space="preserve">3</m:t>');
    });

    it('puts a sum over its body, with its limits', () => {
        const xml = texToOmml('\\sum_{i=1}^{n} i', true)!;
        expect(xml.startsWith('<m:oMathPara><m:oMath><m:nary>')).toBe(true);
        expect(xml).toContain('<m:chr m:val="∑"/>');
        expect(xml).toMatch(/<m:e><m:r><m:t xml:space="preserve">i<\/m:t><\/m:r><\/m:e><\/m:nary>/);
    });

    it('keeps words upright and leaves no TeX annotation in', () => {
        const xml = texToOmml('\\sin x', false)!;
        expect(xml).toContain('<m:sty m:val="p"/></m:rPr><m:t xml:space="preserve">sin</m:t>');
        expect(xml).not.toContain('\\sin');
    });

    it('puts a matrix and \\left…\\right in brackets that grow with them', () => {
        const xml = texToOmml('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', false)!;
        expect(xml).toMatch(/^<m:oMath><m:d><m:dPr><m:begChr m:val="\("\/><m:endChr m:val="\)"\/><\/m:dPr><m:e><m:m>/);
        // An empty side (\right.) is an empty delimiter, not a stray dot.
        expect(texToOmml('\\left\\{ x \\right.', false)).toContain('<m:begChr m:val="{"/><m:endChr m:val=""/>');
    });

    it('returns null for TeX KaTeX cannot read', () => {
        expect(texToOmml('\\frac{', false)).toBeNull();
    });
});
