// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { detectDirection, toCommonMark } from './obsidianMarkdown';
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

describe('detectDirection', () => {
    it('follows the first strong letter', () => {
        expect(detectDirection('# 1. פרק ראשון')).toBe('rtl');
        expect(detectDirection('12 Chapter')).toBe('ltr');
        expect(detectDirection('123')).toBe('ltr');
    });
});
