import katex from 'katex';

/**
 * A formula as a Word equation (Office Math, OMML), editable in Word.
 *
 * KaTeX writes the formula as MathML; this turns the MathML KaTeX produces
 * into OMML. It covers what KaTeX emits: identifiers, numbers, operators and
 * text; rows; super- and subscripts; fractions; roots; big operators with
 * limits (∑ ∫ ∏ …); accents and over/under marks; matrices. Anything else
 * keeps its text, so nothing of a formula is lost.
 *
 * The same converter as PureOpen's (src/services/docx/omml.ts).
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const NARY = new Set(['∑', '∏', '∐', '∫', '∬', '∭', '∮', '⋃', '⋂', '⋁', '⋀', '⨁', '⨂', '⨀']);

function run(text: string, plain: boolean): string {
    if (!text) return '';
    const rPr = plain ? '<m:rPr><m:sty m:val="p"/></m:rPr>' : '';
    return `<m:r>${rPr}<m:t xml:space="preserve">${esc(text)}</m:t></m:r>`;
}

function kids(el: Element): Element[] {
    return [...el.children];
}

/** The element's children as one OMML argument. */
function seq(nodes: Element[]): string {
    return nodes.map(convert).join('');
}

function arg(tag: string, el: Element | undefined): string {
    return `<m:${tag}>${el ? convert(el) : ''}</m:${tag}>`;
}

/** The text of a big-operator base, if the base is one. */
function naryChar(el: Element | undefined): string | null {
    if (!el) return null;
    const t = (el.textContent ?? '').trim();
    return el.localName === 'mo' && NARY.has(t) ? t : null;
}

function nary(chr: string, sub: Element | undefined, sup: Element | undefined, rest: string): string {
    const pr = `<m:naryPr><m:chr m:val="${esc(chr)}"/><m:limLoc m:val="${chr.startsWith('∫') || chr === '∬' || chr === '∭' || chr === '∮' ? 'subSup' : 'undOvr'}"/>${sub ? '' : '<m:subHide m:val="1"/>'}${sup ? '' : '<m:supHide m:val="1"/>'}</m:naryPr>`;
    return `<m:nary>${pr}<m:sub>${sub ? convert(sub) : ''}</m:sub><m:sup>${sup ? convert(sup) : ''}</m:sup><m:e>${rest}</m:e></m:nary>`;
}

const isFence = (el: Element | undefined): el is Element => el?.localName === 'mo' && el.getAttribute('fence') === 'true';

function convert(el: Element): string {
    const c = kids(el);
    switch (el.localName) {
        case 'mrow': {
            // \left( … \right) and a matrix's brackets: a Word delimiter,
            // which grows with what it holds (a plain ( stays one line high).
            const first = c[0];
            const last = c[c.length - 1];
            // KaTeX leaves out an empty side (\right.), so one fence is enough:
            // each \left…\right has a row of its own.
            const open = isFence(first);
            const close = c.length > 1 && isFence(last);
            if (open || close) {
                const beg = open ? (first.textContent ?? '').trim() : '';
                const end = close ? (last.textContent ?? '').trim() : '';
                const inner = c.slice(open ? 1 : 0, close ? -1 : undefined);
                return `<m:d><m:dPr><m:begChr m:val="${esc(beg)}"/><m:endChr m:val="${esc(end)}"/></m:dPr><m:e>${seq(inner)}</m:e></m:d>`;
            }
            return seq(c);
        }
        case 'math':
        case 'mstyle':
        case 'mpadded':
        case 'mphantom':
        case 'menclose':
            return seq(c);
        case 'semantics':
            // The rendering, not the TeX annotation beside it.
            return seq(c.filter((k) => k.localName !== 'annotation' && k.localName !== 'annotation-xml'));
        case 'mi': {
            const t = el.textContent ?? '';
            // A single letter is italic in math; a word (sin, log) and an
            // explicit normal variant are upright.
            return run(t, t.length > 1 || el.getAttribute('mathvariant') === 'normal');
        }
        case 'mn':
        case 'mo':
        case 'mtext':
        case 'ms':
            return run(el.textContent ?? '', true);
        case 'mspace':
            return '';
        case 'msup': {
            const chr = naryChar(c[0]);
            if (chr) return nary(chr, undefined, c[1], '');
            return `<m:sSup>${arg('e', c[0])}${arg('sup', c[1])}</m:sSup>`;
        }
        case 'msub': {
            const chr = naryChar(c[0]);
            if (chr) return nary(chr, c[1], undefined, '');
            return `<m:sSub>${arg('e', c[0])}${arg('sub', c[1])}</m:sSub>`;
        }
        case 'msubsup': {
            const chr = naryChar(c[0]);
            if (chr) return nary(chr, c[1], c[2], '');
            return `<m:sSubSup>${arg('e', c[0])}${arg('sub', c[1])}${arg('sup', c[2])}</m:sSubSup>`;
        }
        case 'mfrac': {
            const noBar = el.getAttribute('linethickness') === '0px' || el.getAttribute('linethickness') === '0';
            return `<m:f>${noBar ? '<m:fPr><m:type m:val="noBar"/></m:fPr>' : ''}${arg('num', c[0])}${arg('den', c[1])}</m:f>`;
        }
        case 'msqrt':
            return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${seq(c)}</m:e></m:rad>`;
        case 'mroot':
            return `<m:rad>${arg('deg', c[1])}${arg('e', c[0])}</m:rad>`;
        case 'munderover': {
            const chr = naryChar(c[0]);
            if (chr) return nary(chr, c[1], c[2], '');
            return `<m:limUpp><m:e><m:limLow>${arg('e', c[0])}${arg('lim', c[1])}</m:limLow></m:e>${arg('lim', c[2])}</m:limUpp>`;
        }
        case 'munder': {
            const chr = naryChar(c[0]);
            if (chr) return nary(chr, c[1], undefined, '');
            return `<m:limLow>${arg('e', c[0])}${arg('lim', c[1])}</m:limLow>`;
        }
        case 'mover': {
            const chr = naryChar(c[0]);
            if (chr) return nary(chr, undefined, c[1], '');
            // An accent (hat, bar, vector arrow, dot) sits on its base.
            if (el.getAttribute('accent') === 'true' && c[1]?.localName === 'mo') {
                return `<m:acc><m:accPr><m:chr m:val="${esc((c[1].textContent ?? '').trim())}"/></m:accPr>${arg('e', c[0])}</m:acc>`;
            }
            return `<m:limUpp>${arg('e', c[0])}${arg('lim', c[1])}</m:limUpp>`;
        }
        case 'mtable':
            return `<m:m>${c.map((row) => `<m:mr>${kids(row).map((cell) => `<m:e>${seq(kids(cell))}</m:e>`).join('')}</m:mr>`).join('')}</m:m>`;
        default:
            return c.length ? seq(c) : run(el.textContent ?? '', true);
    }
}

/**
 * A big operator followed by its body: KaTeX writes ∑ᵢ x as the operator
 * with its limits and then x beside it; Word wants x inside the operator.
 */
function foldNary(xml: string): string {
    // Each empty <m:e></m:e> of an n-ary takes everything after it in the row.
    return xml.replace(/<m:e><\/m:e><\/m:nary>([\s\S]*)$/, (_m, rest: string) => `<m:e>${rest}</m:e></m:nary>`);
}

/** TeX as OMML: `<m:oMath>` inline, `<m:oMathPara>` on its own line. Null if KaTeX cannot read it. */
export function texToOmml(tex: string, display: boolean): string | null {
    let mathml: string;
    try {
        mathml = katex.renderToString(tex, { output: 'mathml', displayMode: display, throwOnError: true });
    } catch {
        return null;
    }
    const doc = new DOMParser().parseFromString(mathml, 'text/html');
    const math = doc.querySelector('math');
    if (!math) return null;
    const body = foldNary(convert(math));
    const omath = `<m:oMath>${body}</m:oMath>`;
    return display ? `<m:oMathPara>${omath}</m:oMathPara>` : omath;
}
