import type { JSONContent } from '@tiptap/core';
import katex from 'katex';
import { FORMULA_MARK, type Formula } from './obsidianMarkdown';
import { texToOmml } from './omml';

/**
 * Formulas back into the parsed note, as the engine's `formula` nodes: each
 * carries its TeX, a Word equation (OMML) and MathML for EPUB, PDF and HTML.
 * A formula KaTeX cannot read carries its TeX alone, which the engine prints
 * as code — nothing of it is lost.
 */

/** KaTeX's MathML, without the span KaTeX wraps it in. */
function mathml(tex: string, display: boolean): string | null {
    try {
        const html = katex.renderToString(tex, { output: 'mathml', displayMode: display, throwOnError: true });
        return /<math[\s\S]*<\/math>/.exec(html)?.[0] ?? null;
    } catch {
        return null;
    }
}

function formulaNode(f: Formula): JSONContent {
    const attrs: Record<string, unknown> = { tex: f.tex, display: f.display };
    const omml = texToOmml(f.tex, f.display);
    const ml = omml ? mathml(f.tex, f.display) : null;
    if (omml) attrs.omml = omml;
    if (ml) attrs.mathml = ml;
    return { type: 'formula', attrs };
}

function splitText(node: JSONContent, formulas: Formula[]): JSONContent[] {
    const text = node.text ?? '';
    const out: JSONContent[] = [];
    let at = 0;
    for (const m of text.matchAll(FORMULA_MARK)) {
        const f = formulas[Number(m[1])];
        if (!f) continue;
        if (m.index > at) out.push({ ...node, text: text.slice(at, m.index) });
        out.push(formulaNode(f));
        at = m.index + m[0].length;
    }
    if (!out.length) return [node];
    if (at < text.length) out.push({ ...node, text: text.slice(at) });
    return out;
}

/** The note with its formula placeholders (formulaMark) replaced by formulas. */
export function withFormulas(node: JSONContent, formulas: Formula[]): JSONContent {
    if (!formulas.length || !node.content) return node;
    const content = node.content.flatMap((child) =>
        child.type === 'text' ? splitText(child, formulas) : [withFormulas(child, formulas)],
    );
    // A paragraph that is one display formula is centred, as Obsidian shows it.
    const alone = node.type === 'paragraph' && content.length === 1 && content[0].type === 'formula' && content[0].attrs?.display === true;
    return { ...node, content, ...(alone ? { attrs: { ...node.attrs, textAlign: 'center' } } : {}) };
}
