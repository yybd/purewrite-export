// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { detectDirection, formulaMark, mermaidSources, toCommonMark, type Formula } from './obsidianMarkdown';
import { parseMarkdown } from '../vendor/purewrite/src/services/export/engine';

const vault: Record<string, string> = { 'cover.png': 'img/cover.png', 'img/map 1.png': 'img/map 1.png', 'Other note': 'Other note.md' };
const resolver = { resolve: (t: string) => vault[t] ?? null };

describe('toCommonMark', () => {
    it('drops front matter and comments', () => {
        expect(toCommonMark('---\ntags: [a]\n---\nשלום %%hidden%%עולם', resolver)).toBe('שלום עולם');
    });

    it('turns image embeds into Markdown images at their vault path', () => {
        expect(toCommonMark('![[cover.png]] ![[cover.png|300]] ![[cover.png|The cover]]', resolver)).toBe(
            '![](<img/cover.png>) ![](<img/cover.png>) ![The cover](<img/cover.png>)',
        );
    });

    it('resolves a relative Markdown image, spaces and all', () => {
        expect(toCommonMark('![map](img/map%201.png)', resolver)).toBe('![map](<img/map 1.png>)');
        expect(toCommonMark('![x](https://e.com/a.png)', resolver)).toBe('![x](https://e.com/a.png)');
    });

    it('shows a wikilink as the text a reader sees', () => {
        expect(toCommonMark('ראה [[Other note]], [[Other note|כאן]] ו-[[Other note#Part]]', resolver)).toBe('ראה Other note, כאן ו-Other note');
        expect(toCommonMark('![[Other note]]', resolver)).toBe('Other note');
    });

    it('keeps a callout as a quote with its title, and drops highlights and block ids', () => {
        expect(toCommonMark('> [!note] שים לב\n> גוף', resolver)).toBe('> **שים לב**\n>\n> גוף');
        const quote = parseMarkdown(toCommonMark('> [!tip]- כותרת\n> גוף', resolver)).content![0];
        expect(quote.type).toBe('blockquote');
        expect(quote.content?.length).toBe(2);
        expect(toCommonMark('a ==b== c ^abc-1', resolver)).toBe('a b c');
    });

    it('leaves code alone', () => {
        const code = '```\n[[not a link]] ==x==\n```\nand `![[x.png]]`';
        expect(toCommonMark(code, resolver)).toBe(code);
    });

    it('reaches the engine as an image and a footnote', () => {
        const doc = parseMarkdown(toCommonMark('טקסט[^1] ![[cover.png]]\n\n[^1]: הערה.', resolver));
        const types = JSON.stringify(doc);
        expect(types).toContain('"type":"image"');
        expect(types).toContain('"src":"img/cover.png"');
        expect(doc.content?.map((n) => n.type)).toEqual(['paragraph', 'footnoteDefinition']);
    });
});

describe('formulas, details and diagrams', () => {
    it('takes formulas out as placeholders, by Obsidian\'s rules', () => {
        const formulas: Formula[] = [];
        const out = toCommonMark('Area $\\pi r^2$, cost $5 and $10, \\$x$, `$code$`\n\n$$\n\\frac{a_1}{b_1}\n$$', resolver, { formulas });
        expect(formulas).toEqual([
            { tex: '\\pi r^2', display: false },
            { tex: '\\frac{a_1}{b_1}', display: true },
        ]);
        expect(out).toBe(`Area ${formulaMark(0)}, cost $5 and $10, \\$x$, \`$code$\`\n\n${formulaMark(1)}`);
        // Without a list to take them, formulas stay as written.
        expect(toCommonMark('$x$', resolver)).toBe('$x$');
    });

    it('reads a formula inside a callout without its quote marks', () => {
        const formulas: Formula[] = [];
        toCommonMark('> [!info] Law\n> $$\n> E = mc^2\n> $$', resolver, { formulas });
        expect(formulas).toEqual([{ tex: 'E = mc^2', display: true }]);
    });

    it('opens a details block under its summary in bold', () => {
        expect(toCommonMark('<details>\n<summary>More <b>here</b></summary>\n\nHidden text.\n</details>', resolver)).toBe('**More here**\n\nHidden text.\n');
    });

    it('puts a drawn diagram in place of its code, and keeps the code of one it could not draw', () => {
        const note = '```mermaid\ngraph TD; A-->B\n```\n\n~~~mermaid\nbad\n~~~';
        expect(mermaidSources(note)).toEqual(['graph TD; A-->B', 'bad']);
        const out = toCommonMark(note, resolver, { diagram: (s) => (s === 'bad' ? null : 'pwx-diagram:1') });
        expect(out).toBe('![](pwx-diagram:1)\n\n~~~mermaid\nbad\n~~~');
        expect(JSON.stringify(parseMarkdown(out))).toContain('"src":"pwx-diagram:1"');
    });
});

describe('detectDirection', () => {
    it('follows the first strong letter', () => {
        expect(detectDirection('# 1. פרק ראשון')).toBe('rtl');
        expect(detectDirection('12 Chapter')).toBe('ltr');
        expect(detectDirection('123')).toBe('ltr');
    });
});
