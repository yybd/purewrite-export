/**
 * A writing template: the structure of a kind of document, and what to write
 * in each part of it. Data only — no code, never fetched from anywhere.
 *
 * A template is not a look. Word's templates set fonts and margins; this sets
 * the sections a research proposal has, the fifteen points a feature script
 * turns on, how long each part should run, and the questions a supervisor or
 * a script reader would ask of it. What the writer writes goes to an ordinary
 * Markdown file; the guidance is drawn over it and is never saved into it.
 */

/**
 * The languages a template can be written in. A template is written in some
 * of them — a bundled one in English and Hebrew today, a writer's own in the
 * one they wrote it in — and the writer picks among those, apart from the
 * language of the app's own UI.
 */
export type TemplateLanguage = 'en' | 'he' | 'ar' | 'de' | 'fr' | 'es' | 'ja';
export const TEMPLATE_LANGUAGES: readonly TemplateLanguage[] = ['en', 'he', 'ar', 'de', 'fr', 'es', 'ja'];

/** Each language by its own name, as a language menu shows it. */
export const TEMPLATE_LANGUAGE_NAMES: Record<TemplateLanguage, string> = {
    en: 'English',
    he: 'עברית',
    ar: 'العربية',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    ja: '日本語',
};

export function isTemplateLanguage(value: unknown): value is TemplateLanguage {
    return typeof value === 'string' && (TEMPLATE_LANGUAGES as readonly string[]).includes(value);
}

export function templateDirection(language: TemplateLanguage): 'rtl' | 'ltr' {
    return language === 'he' || language === 'ar' ? 'rtl' : 'ltr';
}

/** The same text in the languages a template is written in. */
export type Localized<T = string> = Partial<Record<TemplateLanguage, T>>;

export interface NodeText {
    /** The heading the scaffold writes, and the one the document is matched by. */
    heading: string;
    /** What this part is for, in a sentence or two. */
    prompt: string;
    /** What a reader would ask of this part; shown while writing in it. */
    questions?: string[];
}

/** A check the writer ticks off — or one PureWrite works out from the text. */
export interface CheckDef {
    /** Stable for good: the sidecar keeps ticks by it. */
    id: string;
    text: Localized;
    auto?: { rule: 'within-target' } | { rule: 'min-citations'; count: number };
    /** A check only some writing cultures ask for (see NodeDef.only). */
    only?: TemplateLanguage[];
}

export interface NodeDef {
    /** Stable for good: the sidecar and every check are keyed by it. */
    id: string;
    level: 1 | 2 | 3;
    /** Words this part should run to; `hard` for a limit that may not be passed. */
    target?: { min?: number; max?: number; hard?: boolean };
    /** Where in the finished work this point lands, as a share of the whole (0–1). */
    position?: number;
    text: Localized<NodeText>;
    checks?: CheckDef[];
    children?: NodeDef[];
    /**
     * A part only some writing cultures have: a German thesis ends with an
     * Eidesstattliche Erklärung, an Arabic one with التوصيات. The template has
     * it only when written in these languages (templateFor).
     */
    only?: TemplateLanguage[];
}

/**
 * What kind of writing a template guides: academic work, a screenplay,
 * fiction, a life story, Torah writing (a dvar Torah, a drasha, a sugya).
 * The picker labels a template by it.
 */
export type TemplateFamily = 'academic' | 'screenplay' | 'fiction' | 'life' | 'torah';
export const TEMPLATE_FAMILIES: readonly TemplateFamily[] = ['academic', 'screenplay', 'fiction', 'life', 'torah'];

export interface TemplateDef {
    schema: 1;
    id: string;
    /** Minor: text only. Major: ids changed. */
    version: string;
    source: 'bundled' | 'user';
    /** A writer's template made from another: the id of the one it was copied from. */
    basedOn?: string;
    family: TemplateFamily;
    info: Localized<{ title: string; description: string; file: string }>;
    /** The finished work's length, for `position` (a feature runs about 110 pages). */
    total?: { value: number; unit: 'pages' };
    /** A file for each part, rather than one file with a heading for each (a question a week). */
    perFile?: boolean;
    /** Parts to answer a week: the goal a project starts with. */
    weekly?: number;
    nodes: NodeDef[];
}

/** Every node, parents before their children. */
export function flattenNodes(nodes: readonly NodeDef[]): NodeDef[] {
    return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])]);
}

/** The languages a template is written in: those it has a title in, in menu order. */
export function templateLanguages(template: TemplateDef): TemplateLanguage[] {
    return TEMPLATE_LANGUAGES.filter((l) => template.info[l]?.title);
}

/**
 * The language to offer first: the UI's if the template is written in it,
 * else the first it is written in.
 */
export function defaultTemplateLanguage(template: TemplateDef, uiLanguage: string): TemplateLanguage {
    const languages = templateLanguages(template);
    return languages.find((l) => l === uiLanguage) ?? languages[0] ?? 'en';
}

// The value in `language`, else in the first language that has one.
function pick<T>(loc: Localized<T>, language: TemplateLanguage, has: (v: T) => boolean): T | undefined {
    const own = loc[language];
    if (own !== undefined && has(own)) return own;
    for (const l of TEMPLATE_LANGUAGES) {
        const v = loc[l];
        if (v !== undefined && has(v)) return v;
    }
    return undefined;
}

/**
 * A part's text in a language, field by field: what the language lacks is
 * taken from another the template is written in, so a part half translated
 * still says everything.
 */
export function nodeText(node: NodeDef, language: TemplateLanguage): NodeText {
    const own = node.text[language];
    const heading = own?.heading || pick(node.text, language, (t) => !!t.heading)?.heading || '';
    const prompt = own?.prompt || pick(node.text, language, (t) => !!t.prompt)?.prompt || '';
    const questions = own?.questions?.length ? own.questions : pick(node.text, language, (t) => !!t.questions?.length)?.questions;
    return { heading, prompt, ...(questions?.length ? { questions } : {}) };
}

export function templateInfo(template: TemplateDef, language: TemplateLanguage): { title: string; description: string; file: string } {
    const own = template.info[language];
    const title = own?.title || pick(template.info, language, (i) => !!i.title)?.title || '';
    return {
        title,
        description: own?.description || pick(template.info, language, (i) => !!i.description)?.description || '',
        file: own?.file || pick(template.info, language, (i) => !!i.file)?.file || title,
    };
}

export function checkText(check: CheckDef, language: TemplateLanguage): string {
    return check.text[language] || pick(check.text, language, Boolean) || '';
}

/** Every heading a part may carry, in any language it is written in. */
export function nodeHeadings(node: NodeDef): string[] {
    return TEMPLATE_LANGUAGES.map((l) => node.text[l]?.heading).filter((h): h is string => !!h);
}

/**
 * What a part's length is counted in. Japanese writing is measured in
 * characters (字): every limit a Japanese writer meets — 要旨400字以内, a
 * thesis of 40,000字 — is one, and there are no spaces to count words by.
 * Every other template language counts words.
 */
export type LengthUnit = 'words' | 'chars';

export function lengthUnit(language: TemplateLanguage): LengthUnit {
    return language === 'ja' ? 'chars' : 'words';
}

/**
 * Japanese characters to an English word, for targets written in words: an
 * English abstract of 250 words is a Japanese one of about 500字.
 */
export const CHARS_PER_WORD = 2;

/** A part's target in the unit its language counts in. */
export function targetIn(target: NodeDef['target'], unit: LengthUnit): NodeDef['target'] {
    if (!target || unit === 'words') return target;
    const scale = (v: number | undefined) => (v === undefined ? undefined : v * CHARS_PER_WORD);
    return {
        ...(target.min !== undefined ? { min: scale(target.min) } : {}),
        ...(target.max !== undefined ? { max: scale(target.max) } : {}),
        ...(target.hard ? { hard: true } : {}),
    };
}

/**
 * The template as a project in `language` has it: without the parts and
 * checks that belong to other languages only.
 */
export function templateFor(template: TemplateDef, language: TemplateLanguage): TemplateDef {
    const keep = (only: TemplateLanguage[] | undefined) => !only?.length || only.includes(language);
    const nodes = (list: readonly NodeDef[]): NodeDef[] => list.filter((n) => keep(n.only)).map((n) => ({
        ...n,
        ...(n.checks ? { checks: n.checks.filter((c) => keep(c.only)) } : {}),
        ...(n.children ? { children: nodes(n.children) } : {}),
    }));
    return { ...template, nodes: nodes(template.nodes) };
}
