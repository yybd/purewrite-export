import { checkText, flattenNodes, nodeHeadings, nodeText, templateFor, templateInfo, TEMPLATE_FAMILIES, TEMPLATE_LANGUAGES, type TemplateFamily, type CheckDef, type Localized, type NodeDef, type NodeText, type TemplateDef, type TemplateLanguage } from './types';

/**
 * A writing template as a file: the writer's own, or one shared with them.
 *
 *   <workspace>/.purewrite-templates/<id>.purewrite-template
 *
 * JSON, in the same shape the bundled templates are written in — one schema,
 * one engine, so a template the writer made behaves exactly as a bundled one
 * in the guidance, the Structure tab and the checks. The leading dot keeps
 * the library out of the sidebar and out of every export; it syncs to iCloud
 * with the rest of the folder.
 *
 * A template file is data, never code: it is read through a validator that
 * keeps only the fields below, as strings and numbers, and every string is
 * drawn with textContent, never as HTML. That is what keeps a shared template
 * content and not a program (App Store guideline 2.5.2).
 */
export const TEMPLATE_DIR = '.purewrite-templates';
export const TEMPLATE_EXT = '.purewrite-template';

const MAX_BYTES = 1_000_000;
const MAX_NODES = 300;
const MAX_TEXT = 4_000;
const MAX_LIST = 30;

export interface Validation {
    template: TemplateDef | null;
    /** Block saving: a template with these would not work. */
    errors: string[];
    /** Worth saying, but the template works. */
    warnings: string[];
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max = MAX_TEXT): string => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : undefined);

// Only the languages the data is written in: a language it lacks stays out.
function localized<T>(raw: unknown, read: (v: unknown) => T, present: (v: unknown) => boolean = isObject): Localized<T> {
    const obj = isObject(raw) ? raw : {};
    return Object.fromEntries(TEMPLATE_LANGUAGES.filter((l) => present(obj[l])).map((l) => [l, read(obj[l])])) as Localized<T>;
}

function readOnly(raw: unknown): TemplateLanguage[] | undefined {
    const list = Array.isArray(raw) ? TEMPLATE_LANGUAGES.filter((l) => raw.includes(l)) : [];
    return list.length ? list : undefined;
}

function readNodeText(raw: unknown): NodeText {
    const obj = isObject(raw) ? raw : {};
    const questions = Array.isArray(obj.questions) ? obj.questions.map((q) => str(q)).filter(Boolean).slice(0, MAX_LIST) : [];
    return { heading: str(obj.heading, 200).trim(), prompt: str(obj.prompt), ...(questions.length ? { questions } : {}) };
}

function readCheck(raw: unknown): CheckDef | null {
    if (!isObject(raw) || typeof raw.id !== 'string') return null;
    const check: CheckDef = { id: str(raw.id, 80), text: localized(raw.text, (v) => str(v, 300), (v) => typeof v === 'string') };
    const auto = isObject(raw.auto) ? raw.auto : null;
    if (auto?.rule === 'within-target') check.auto = { rule: 'within-target' };
    else if (auto?.rule === 'min-citations' && num(auto.count) !== undefined) check.auto = { rule: 'min-citations', count: Math.round(num(auto.count)!) };
    const only = readOnly(raw.only);
    if (only) check.only = only;
    return check;
}

function readNode(raw: unknown, depth: number, count: { n: number }): NodeDef | null {
    if (!isObject(raw) || typeof raw.id !== 'string' || ++count.n > MAX_NODES) return null;
    const level = raw.level === 1 || raw.level === 2 || raw.level === 3 ? raw.level : 2;
    const node: NodeDef = { id: str(raw.id, 80), level, text: localized(raw.text, readNodeText) };
    if (isObject(raw.target)) {
        const min = num(raw.target.min);
        const max = num(raw.target.max);
        if (min !== undefined || max !== undefined) {
            node.target = { ...(min !== undefined ? { min: Math.round(min) } : {}), ...(max !== undefined ? { max: Math.round(max) } : {}), ...(raw.target.hard === true ? { hard: true } : {}) };
        }
    }
    const only = readOnly(raw.only);
    if (only) node.only = only;
    const position = num(raw.position);
    if (position !== undefined && position <= 1) node.position = position;
    const checks = Array.isArray(raw.checks) ? raw.checks.slice(0, MAX_LIST).map(readCheck).filter((c): c is CheckDef => !!c) : [];
    if (checks.length) node.checks = checks;
    if (depth < 3 && Array.isArray(raw.children)) {
        const children = raw.children.map((c) => readNode(c, depth + 1, count)).filter((c): c is NodeDef => !!c);
        if (children.length) node.children = children;
    }
    return node;
}

/**
 * A template read from untrusted data: only the known fields, each as the
 * type it should be. Errors are what would break it; a language a part is
 * not written in is not one of them — it shows another's text.
 */
export function validateTemplate(raw: unknown): Validation {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!isObject(raw)) return { template: null, errors: ['not-a-template'], warnings };
    if (typeof raw.schema === 'number' && raw.schema > 1) return { template: null, errors: ['newer-schema'], warnings };
    if (typeof raw.id !== 'string' || !raw.id) errors.push('no-id');

    const count = { n: 0 };
    const nodes = Array.isArray(raw.nodes) ? raw.nodes.map((n) => readNode(n, 1, count)).filter((n): n is NodeDef => !!n) : [];
    if (count.n > MAX_NODES) errors.push('too-many-parts');
    const template: TemplateDef = {
        schema: 1,
        id: str(raw.id, 120),
        version: str(raw.version, 20) || '1.0.0',
        source: 'user',
        family: (TEMPLATE_FAMILIES as readonly unknown[]).includes(raw.family) ? raw.family as TemplateFamily : 'academic',
        info: localized(raw.info, (v) => {
            const o = isObject(v) ? v : {};
            return { title: str(o.title, 200).trim(), description: str(o.description, 600), file: str(o.file, 120).trim() };
        }),
        nodes,
        ...(typeof raw.basedOn === 'string' ? { basedOn: str(raw.basedOn, 120) } : {}),
        ...(raw.perFile === true ? { perFile: true } : {}),
        ...(num(raw.weekly) ? { weekly: Math.round(num(raw.weekly)!) } : {}),
    };
    const total = isObject(raw.total) ? num(raw.total.value) : undefined;
    if (total) template.total = { value: Math.round(total), unit: 'pages' };

    const flat = flattenNodes(nodes);
    if (!flat.length) errors.push('no-parts');
    if (!TEMPLATE_LANGUAGES.some((l) => template.info[l]?.title)) errors.push('no-title');
    const ids = new Set<string>();
    for (const node of flat) {
        if (ids.has(node.id)) errors.push('duplicate-id');
        ids.add(node.id);
        if (!nodeHeadings(node).length) errors.push('empty-heading');
        const checkIds = new Set<string>();
        for (const check of node.checks ?? []) {
            if (checkIds.has(check.id)) errors.push('duplicate-id');
            checkIds.add(check.id);
        }
        const target = node.target;
        if (target?.min !== undefined && target.max !== undefined && target.min > target.max) errors.push('target-range');
    }
    for (const language of TEMPLATE_LANGUAGES) {
        const headings = flattenNodes(templateFor(template, language).nodes).map((n) => nodeText(n, language).heading.toLocaleLowerCase()).filter(Boolean);
        if (new Set(headings).size !== headings.length) errors.push('duplicate-heading');
    }
    return { template: errors.length ? null : template, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

/** A template file's text, read as untrusted data. */
export function parseTemplateFile(text: string): Validation {
    if (text.length > MAX_BYTES) return { template: null, errors: ['too-large'], warnings: [] };
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch {
        return { template: null, errors: ['not-a-template'], warnings: [] };
    }
    return validateTemplate(raw);
}

export function serializeTemplate(template: TemplateDef): string {
    return JSON.stringify({ ...template, source: 'user' }, null, 2) + '\n';
}

/** The file a template is kept in: by its id, so renaming it moves nothing. */
export function templateFileName(template: TemplateDef): string {
    return `${template.id.replace(/[^A-Za-z0-9._-]/g, '-')}${TEMPLATE_EXT}`;
}

const shortId = () => Math.random().toString(36).slice(2, 8);
export const newNodeId = () => `n-${shortId()}`;
export const newCheckId = () => `c-${shortId()}`;
const newTemplateId = () => `user.${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${shortId()}`}`;

/** A new part, written in one language. */
export function emptyNode(level: 2 | 3, language: TemplateLanguage, heading = ''): NodeDef {
    return { id: newNodeId(), level, text: { [language]: { heading, prompt: '' } } };
}

/** A blank template in one language: a name and one part. */
export function blankTemplate(title: string, language: TemplateLanguage): TemplateDef {
    return {
        schema: 1,
        id: newTemplateId(),
        version: '1.0.0',
        source: 'user',
        family: 'academic',
        info: { [language]: { title, description: '', file: title } },
        nodes: [emptyNode(2, language)],
    };
}

/**
 * The writer's own copy of a template, to change as they like. It keeps the
 * part ids of the one it came from (`basedOn`), so ticks and links carry
 * over, and gets an id of its own.
 */
export function copyTemplate(template: TemplateDef, title: Localized): TemplateDef {
    const copy: TemplateDef = JSON.parse(JSON.stringify(template));
    return {
        ...copy,
        id: newTemplateId(),
        source: 'user',
        version: '1.0.0',
        basedOn: template.source === 'bundled' ? template.id : template.basedOn,
        info: Object.fromEntries(Object.entries(copy.info).map(([l, info]) => [l, { ...info, title: title[l as TemplateLanguage] ?? info.title }])),
    };
}

/** Each title the template has, with a suffix in its language ("(copy)"); the suffix in English where none is given. */
export function copyTitles(template: TemplateDef, suffix: Localized): Localized {
    return Object.fromEntries(Object.entries(template.info).map(([l, info]) => [l, info.title + (suffix[l as TemplateLanguage] ?? suffix.en ?? '')]));
}

/**
 * A template from an outline the writer pastes: Markdown headings, or a list
 * indented by spaces or tabs, or plain lines. The shallowest level becomes
 * the parts, the next their sub-parts; anything deeper joins the sub-parts.
 */
export function templateFromOutline(text: string, title: string, language: TemplateLanguage): TemplateDef {
    const items: { depth: number; heading: string }[] = [];
    for (const line of text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const heading = /^\s*(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
            items.push({ depth: heading[1].length * 10, heading: heading[2] });
            continue;
        }
        const indent = /^[ \t]*/.exec(line)![0].replace(/\t/g, '    ').length;
        const label = line.trim().replace(/^(?:[-*+•]|\d+[.)]|[א-ת][.)])\s+/u, '').trim();
        if (label) items.push({ depth: indent, heading: label });
    }
    const depths = [...new Set(items.map((i) => i.depth))].sort((a, b) => a - b);
    const template = blankTemplate(title, language);
    template.nodes = [];
    for (const item of items.slice(0, MAX_NODES)) {
        const node = emptyNode(depths.indexOf(item.depth) === 0 ? 2 : 3, language, item.heading.slice(0, 200));
        const parent = template.nodes[template.nodes.length - 1];
        if (node.level === 3 && parent) (parent.children ??= []).push(node);
        else template.nodes.push({ ...node, level: 2 });
    }
    if (!template.nodes.length) template.nodes = [emptyNode(2, language)];
    return template;
}

/**
 * A template tidied for saving: each language it is written in gets a title
 * and a file name (from another language if the writer gave none), and a
 * language with nothing written in it is dropped. Text a language lacks is
 * not copied in — it is read from another language when shown (nodeText).
 */
export function completeLanguages(template: TemplateDef): TemplateDef {
    const t: TemplateDef = JSON.parse(JSON.stringify(template));
    const written = (l: TemplateLanguage) => !!t.info[l]?.title || flattenNodes(t.nodes).some((n) => n.text[l]?.heading || n.text[l]?.prompt);
    const languages = TEMPLATE_LANGUAGES.filter(written);
    const info: TemplateDef['info'] = {};
    for (const l of languages) {
        const base = templateInfo(t, l);
        info[l] = { title: base.title, description: t.info[l]?.description ?? '', file: t.info[l]?.file || base.title };
    }
    t.info = info;
    for (const node of flattenNodes(t.nodes)) {
        for (const l of TEMPLATE_LANGUAGES) {
            const text = node.text[l];
            if (!text) continue;
            if (!languages.includes(l) || (!text.heading && !text.prompt && !text.questions?.length)) delete node.text[l];
            else if (text.questions) text.questions = text.questions.map((q) => q.trim()).filter(Boolean);
        }
        for (const check of node.checks ?? []) {
            for (const l of TEMPLATE_LANGUAGES) if (check.text[l] === '' || (check.text[l] && !languages.includes(l))) delete check.text[l];
        }
    }
    return t;
}

/** The template as a flat list of parts, the way the editor shows it. */
export function toRows(nodes: readonly NodeDef[]): NodeDef[] {
    return flattenNodes(nodes).map(({ children: _children, ...node }) => ({ ...node, level: node.level === 3 ? 3 : 2 }));
}

/** The flat list back into a tree: a sub-part belongs to the part above it. */
export function fromRows(rows: readonly NodeDef[]): NodeDef[] {
    const nodes: NodeDef[] = [];
    for (const row of rows) {
        const parent = nodes[nodes.length - 1];
        if (row.level === 3 && parent) parent.children = [...(parent.children ?? []), { ...row }];
        else nodes.push({ ...row, level: 2 });
    }
    return nodes;
}

/**
 * A template as Markdown a person reads: the parts as headings, the prompt
 * as a quote, the questions and checks as lists, the targets in braces. It
 * is what a suggestion shows and sends for reading; the JSON file is the one
 * that loses nothing.
 */
export function templateToMarkdown(template: TemplateDef, language: TemplateLanguage): string {
    const info = templateInfo(template, language);
    template = templateFor(template, language);
    const lines = [`# ${info.title}`];
    if (info.description) lines.push('', `> ${info.description}`);
    if (template.total) lines.push('', `{total=${template.total.value} pages}`);
    for (const node of flattenNodes(template.nodes)) {
        const text = nodeText(node, language);
        const attrs: string[] = [];
        const target = node.target;
        if (target?.min !== undefined || target?.max !== undefined) attrs.push(`words=${target.min ?? ''}–${target.max ?? ''}${target.hard ? ' hard' : ''}`);
        if (node.position !== undefined) attrs.push(`at=${Math.round(node.position * 100)}%`);
        lines.push('', `${'#'.repeat(node.level)} ${text.heading}${attrs.length ? ` {${attrs.join(' ')}}` : ''}`);
        if (text.prompt) lines.push('', `> ${text.prompt}`);
        const items = [
            ...(text.questions ?? []).map((q) => `- ? ${q}`),
            ...(node.checks ?? []).map((c) => `- [ ] ${checkText(c, language)}${c.auto ? (c.auto.rule === 'within-target' ? ' {auto}' : ` {auto citations≥${c.auto.count}}`) : ''}`),
        ];
        if (items.length) lines.push('', ...items);
    }
    return lines.join('\n') + '\n';
}

/**
 * A template brought in from a file: a new id when it would take the place
 * of a bundled template, or of one of the writer's when they chose to keep
 * both.
 */
export function importedTemplate(template: TemplateDef, opts: { bundledIds: readonly string[]; newId: boolean }): TemplateDef {
    if (!opts.newId && !opts.bundledIds.includes(template.id)) return template;
    return { ...template, id: newTemplateId(), basedOn: template.basedOn ?? template.id };
}

/** Where a template suggestion goes: the studio's one support inbox, shared by every app. */
export const SUGGEST_TO = 'support@bdtech.app';

/**
 * The mail a suggestion opens, addressed and filled in — nothing is sent
 * until the writer presses Send in their own mail app. A mailto: link carries
 * no attachment and has a practical length, so a long template goes on the
 * clipboard instead and the body says to paste it.
 */
export function suggestionMail(opts: {
    template: TemplateDef;
    language: TemplateLanguage;
    note: string;
    credit: string;
    version: string | null;
    labels: { subject: string; note: string; credit: string; version: string; rights: string; paste: string };
}): { url: string; body: string; markdown: string; onClipboard: boolean } {
    const markdown = templateToMarkdown(opts.template, opts.language);
    const head = [
        opts.note.trim() && `${opts.labels.note}: ${opts.note.trim()}`,
        opts.credit.trim() && `${opts.labels.credit}: ${opts.credit.trim()}`,
        opts.version && `${opts.labels.version}: ${opts.version}`,
        opts.labels.rights,
    ].filter(Boolean).join('\n');
    // The app's name first, in English in every language: the inbox is shared, and this is
    // how a message there says which app it came from.
    const subject = `PureWrite — ${opts.labels.subject}: ${templateInfo(opts.template, opts.language).title}`;
    const full = `${head}\n\n---\n\n${markdown}`;
    const build = (body: string) => `mailto:${SUGGEST_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const fits = build(full).length <= 8000;
    const body = fits ? full : `${head}\n\n---\n\n${opts.labels.paste}\n`;
    return { url: build(body), body, markdown, onClipboard: !fits };
}

/**
 * The language a Markdown template is written in, by its script: Hebrew,
 * Arabic or Japanese letters, else English. A language of the Latin script
 * other than English is the writer's to name.
 */
export function guessLanguage(text: string): TemplateLanguage {
    const counts: [TemplateLanguage, number][] = [
        ['he', (text.match(/[א-ת]/g) ?? []).length],
        ['ar', (text.match(/[\u0620-\u064A]/g) ?? []).length],
        ['ja', (text.match(/[\u3040-\u30FF\u4E00-\u9FFF]/g) ?? []).length],
        ['en', (text.match(/[A-Za-z]/g) ?? []).length],
    ];
    return counts.sort((a, b) => b[1] - a[1])[0][1] ? counts[0][0] : 'en';
}

/**
 * A template from its Markdown form (`templateToMarkdown`), in one language:
 * the first `#` heading is its name, `##` and `###` its parts and sub-parts,
 * a quote under a heading the prompt, `- ?` the questions, `- [ ]` the checks,
 * and `{words=400–800 hard at=50%}` after a heading its target and place.
 * Anything else — paragraphs, other lists — is not part of a template and is
 * left out. The other language is filled from this one.
 */
export function templateFromMarkdown(text: string, language: TemplateLanguage = guessLanguage(text)): Validation {
    if (text.length > MAX_BYTES) return { template: null, errors: ['too-large'], warnings: [] };
    const template = blankTemplate('', language);
    template.nodes = [];
    let current: NodeDef | null = null;
    let named = false;
    const attrs = /\s*\{([^{}]*)\}\s*$/;

    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trimEnd();
        const heading = /^(#{1,3})\s+(.*)$/.exec(line);
        if (heading) {
            const level = heading[1].length;
            let title = heading[2];
            const found = attrs.exec(title);
            const values = found ? found[1] : '';
            if (found) title = title.slice(0, found.index);
            if (level === 1 && !named) {
                const name = title.trim().slice(0, 200);
                template.info[language] = { title: name, description: '', file: name };
                named = true;
                current = null;
                continue;
            }
            const node = emptyNode(level === 3 ? 3 : 2, language, title.trim().slice(0, 200));
            const words = /words=(\d*)[–-](\d*)(\s+hard)?/.exec(values);
            if (words && (words[1] || words[2])) {
                node.target = {
                    ...(words[1] ? { min: Number(words[1]) } : {}),
                    ...(words[2] ? { max: Number(words[2]) } : {}),
                    ...(words[3] && words[2] ? { hard: true } : {}),
                };
            }
            const at = /at=(\d+(?:\.\d+)?)%/.exec(values);
            if (at) node.position = Math.min(100, Number(at[1])) / 100;
            const parent = template.nodes[template.nodes.length - 1];
            if (node.level === 3 && parent) (parent.children ??= []).push(node);
            else template.nodes.push({ ...node, level: 2 });
            current = node.level === 3 && parent ? node : template.nodes[template.nodes.length - 1];
            continue;
        }
        const total = /^\{total=(\d+)\s*pages?\}$/.exec(line.trim());
        if (total) {
            template.total = { value: Number(total[1]), unit: 'pages' };
            template.family = 'screenplay';
            continue;
        }
        const quote = /^>\s?(.*)$/.exec(line);
        if (quote) {
            const text = current?.text[language];
            const info = template.info[language];
            if (text) text.prompt = [text.prompt, quote[1]].filter(Boolean).join(' ').slice(0, MAX_TEXT);
            else if (named && info) info.description = [info.description, quote[1]].filter(Boolean).join(' ').slice(0, 600);
            continue;
        }
        const text = current?.text[language];
        if (!current || !text) continue;
        const question = /^\s*[-*]\s+\?\s+(.*)$/.exec(line);
        if (question) {
            (text.questions ??= []).push(question[1].trim());
            continue;
        }
        const check = /^\s*[-*]\s+\[[ xX]\]\s+(.*)$/.exec(line);
        if (check) {
            let label = check[1];
            const found = attrs.exec(label);
            const def: CheckDef = { id: newCheckId(), text: {} };
            if (found) {
                label = label.slice(0, found.index);
                const citations = /citations\D*(\d+)/.exec(found[1]);
                if (citations) def.auto = { rule: 'min-citations', count: Number(citations[1]) };
                else if (/\bauto\b/.test(found[1])) def.auto = { rule: 'within-target' };
            }
            def.text[language] = label.trim().slice(0, 300);
            (current.checks ??= []).push(def);
        }
    }
    if (template.nodes.some((n) => (n.children ?? []).some((c) => c.position !== undefined) || n.position !== undefined)) template.family = 'screenplay';
    return validateTemplate(completeLanguages(template));
}
