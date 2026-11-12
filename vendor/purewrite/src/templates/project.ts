import type { Node as PMNode } from '@tiptap/pm/model';
import { countWords } from '../services/wordCount';
import { CITATION } from '../extensions/TextWithCitations';
import { flattenNodes, isTemplateLanguage, nodeHeadings, nodeText, targetIn, templateFor, templateInfo, type LengthUnit, type CheckDef, type NodeDef, type TemplateDef, type TemplateLanguage } from './types';
import { researchProposal } from './researchProposal';
import { featureBeats } from './featureBeats';
import { thesis } from './thesis';
import { imrad } from './imrad';
import { tvPilot } from './tvPilot';
import { seriesPilot } from './seriesPilot';
import { jpRenzoku } from './jpRenzoku';
import { arSeries30 } from './arSeries30';
import { grantProposal } from './grantProposal';
import { lifeStory, lifeStoryWeekly } from './lifeStory';
import { characterCard, novelEightSequences, novelHeroJourney, novelThreeActs, sceneCard } from './novel';
import { shortStory } from './shortStory';
import { barMitzvahDrasha, dvarTorah, responsum, sugyaSummary } from './torah';
import { emptyNode, validateTemplate } from './templateFile';

/** Every template the app ships, in the order the picker shows them. */
export const BUNDLED_TEMPLATES: readonly TemplateDef[] = [
    researchProposal, thesis, imrad, grantProposal,
    lifeStory, lifeStoryWeekly,
    novelThreeActs, novelEightSequences, novelHeroJourney, shortStory, sceneCard, characterCard,
    dvarTorah, barMitzvahDrasha, sugyaSummary, responsum,
    featureBeats, tvPilot, seriesPilot, jpRenzoku, arSeries30,
];

export function findTemplate(id: string): TemplateDef | undefined {
    return BUNDLED_TEMPLATES.find((t) => t.id === id);
}

/**
 * A project's state, kept beside its files so it travels with the folder —
 * to iCloud, to another Mac, to Obsidian, which never shows it:
 *
 *   <project folder>/.purewrite-project.json
 *   { "version": 1, "template": { "id": "acad.proposal", "version": "1.0.0", "language": "he" },
 *     "files": ["הצעת מחקר.md"], "showGuide": true,
 *     "checks": { "abstract/question": { "done": true, "at": "2026-11-03T09:12:00Z" } },
 *     "links": { "lit": "the state of the art" } }
 *
 * A project made from one of the writer's own templates also keeps a copy of
 * it (`snapshot`): the project then works on any device and in any copy of
 * the folder without the library, and editing the template later does not
 * quietly change a project already under way.
 *
 * The leading dot keeps it out of the sidebar, as `.purewrite-book.json`.
 * Nothing about the template goes into the Markdown files themselves: they
 * stay plain text any editor reads the same way.
 *
 * A field this version does not know is kept on write.
 */
export const PROJECT_FILE = '.purewrite-project.json';
const VERSION = 1;

export interface ProjectState {
    template: { id: string; version: string; language: TemplateLanguage };
    /** The files the template's guidance applies to, relative to the folder. */
    files: string[];
    showGuide: boolean;
    checks: Record<string, { done: boolean; at: string }>;
    /**
     * Parts the writer tied to a heading of their own by hand, by node id: the
     * heading as `normalizeHeading` gives it. Wins over the template's heading.
     */
    links: Record<string, string>;
    /** A project written a question a file: when each file was first answered. */
    answered?: Record<string, string>;
    /** The writer's own weekly goal, over the template's. */
    weeklyGoal?: number;
    /** The writer's template this project was made from, as it was then. */
    snapshot?: TemplateDef;
    /** The template before the last switch, with its ticks and links: one step of undo. */
    previous?: PreviousTemplate;
}

export type PreviousTemplate = Pick<ProjectState, 'template' | 'checks' | 'links' | 'snapshot'> & { at: string };

/**
 * The template a project runs on — its own copy, or the bundled one it names
 * — with the parts of the project's language (templateFor).
 */
export function projectTemplate(state: ProjectState): TemplateDef | undefined {
    const template = state.snapshot ?? findTemplate(state.template.id);
    return template && templateFor(template, state.template.language);
}

function asObject(text: string | null | undefined): Record<string, unknown> {
    if (!text) return {};
    try {
        const parsed: unknown = JSON.parse(text);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
        return {};
    }
}

/** The project in a sidecar's text, or null if it names no template this app knows. */
export function parseProject(text: string | null | undefined): ProjectState | null {
    const raw = asObject(text);
    const tpl = raw.template as Record<string, unknown> | undefined;
    if (!tpl || typeof tpl.id !== 'string') return null;
    const snapshot = raw.snapshot !== undefined ? validateTemplate(raw.snapshot).template ?? undefined : undefined;
    if (!snapshot && !findTemplate(tpl.id)) return null;
    const language = isTemplateLanguage(tpl.language) ? tpl.language : 'en';
    const checks: ProjectState['checks'] = {};
    if (raw.checks && typeof raw.checks === 'object') {
        for (const [key, value] of Object.entries(raw.checks as Record<string, unknown>)) {
            const v = value as { done?: unknown; at?: unknown };
            if (typeof v?.done === 'boolean') checks[key] = { done: v.done, at: typeof v.at === 'string' ? v.at : '' };
        }
    }
    const links: ProjectState['links'] = {};
    if (raw.links && typeof raw.links === 'object') {
        for (const [key, value] of Object.entries(raw.links as Record<string, unknown>)) {
            if (typeof value === 'string' && value) links[key] = value;
        }
    }
    let previous: PreviousTemplate | undefined;
    const prev = raw.previous as Record<string, unknown> | undefined;
    if (prev && typeof prev === 'object' && !Array.isArray(prev) && prev.previous === undefined) {
        const read = parseProject(JSON.stringify({ ...prev, files: [] }));
        if (read) previous = { template: read.template, checks: read.checks, links: read.links, ...(read.snapshot ? { snapshot: read.snapshot } : {}), at: typeof prev.at === 'string' ? prev.at : '' };
    }
    return {
        template: { id: tpl.id, version: typeof tpl.version === 'string' ? tpl.version : '1.0.0', language },
        files: Array.isArray(raw.files) ? raw.files.filter((f): f is string => typeof f === 'string') : [],
        showGuide: raw.showGuide !== false,
        checks,
        links,
        ...(raw.answered && typeof raw.answered === 'object' && !Array.isArray(raw.answered)
            ? { answered: Object.fromEntries(Object.entries(raw.answered as Record<string, unknown>).filter((e): e is [string, string] => typeof e[1] === 'string')) }
            : {}),
        ...(typeof raw.weeklyGoal === 'number' && raw.weeklyGoal > 0 ? { weeklyGoal: raw.weeklyGoal } : {}),
        ...(snapshot ? { snapshot } : {}),
        ...(previous ? { previous } : {}),
    };
}

export function serializeProject(project: ProjectState, previous?: string | null): string {
    const merged: Record<string, unknown> = { ...asObject(previous), version: VERSION, ...project };
    // Fields this version owns are dropped when the project no longer has
    // them — a switch away from the writer's template drops its copy.
    for (const key of ['snapshot', 'previous'] as const) if (project[key] === undefined) delete merged[key];
    return JSON.stringify(merged, null, 2) + '\n';
}

/** A file name the template suggests, safe on every system it syncs to. */
export function safeFileName(name: string): string {
    return name.replace(/[/\\:*?"<>|]/g, '-').trim();
}

/** The Markdown a new project starts with: the title, then every heading. */
export function buildScaffold(template: TemplateDef, language: TemplateLanguage, title: string): string {
    const lines = [`# ${title}`];
    for (const node of flattenNodes(templateFor(template, language).nodes)) {
        lines.push(`${'#'.repeat(node.level)} ${nodeText(node, language).heading}`);
    }
    return lines.join('\n\n');
}

/** What a new project writes: its file, and the sidecar that names it. */
export function newProjectFiles(template: TemplateDef, language: TemplateLanguage, title: string): { name: string; content: string }[] {
    if (template.perFile) {
        // A file for each part, numbered to keep their order: the part's heading asks its question.
        const parts = flattenNodes(templateFor(template, language).nodes).map((node, i) => {
            const heading = nodeText(node, language).heading;
            const words = safeFileName(heading).replace(/[-.!؟。、\s]+$/u, '');
            const short = words.length > 50 ? words.slice(0, 50).replace(/\s+\S*$/u, '') : words;
            return { name: `${String(i + 1).padStart(2, '0')} ${short}.md`, content: `# ${heading}` };
        });
        const project: ProjectState = {
            template: { id: template.id, version: template.version, language },
            files: parts.map((p) => p.name),
            showGuide: true,
            checks: {},
            links: {},
            answered: {},
            ...(template.source === 'user' ? { snapshot: template } : {}),
        };
        return [...parts, { name: PROJECT_FILE, content: serializeProject(project) }];
    }
    const file = `${safeFileName(templateInfo(template, language).file)}.md`;
    const project: ProjectState = {
        template: { id: template.id, version: template.version, language },
        files: [file],
        showGuide: true,
        checks: {},
        links: {},
        ...(template.source === 'user' ? { snapshot: template } : {}),
    };
    return [
        { name: file, content: buildScaffold(template, language, title) },
        { name: PROJECT_FILE, content: serializeProject(project) },
    ];
}

/**
 * A heading, compared the way a writer would: without niqqud, case or a
 * leading number ("1.", "א.", "3.2"), so a heading the writer renumbered or
 * typed in the other language still finds its part.
 */
export function normalizeHeading(text: string): string {
    return text
        .normalize('NFC')
        .replace(/[֑-ׇ]/g, '')
        .toLocaleLowerCase()
        .replace(/^\s*(?:\d+(?:\.\d+)*|[א-ת])[.)]\s+/u, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** A heading in the document, and the part of the template it was matched to. */
export interface Section {
    /** Position of the heading in the document. */
    pos: number;
    level: number;
    heading: string;
    node?: NodeDef;
    /** Where its text ends: the next heading at its level or above. */
    end: number;
    /** How long its own text is, in `unit`. */
    length: number;
    unit: LengthUnit;
    citations: number;
}

/** A heading of the document's, and the template part it carries the heading of. */
export interface MatchedHeading {
    pos: number;
    level: number;
    text: string;
    node?: NodeDef;
}

/**
 * The document's headings, each matched to the template part whose heading it
 * carries, in any of the template's languages — or to the part the writer
 * linked it to (`links`). Each part is matched once; a heading that matches
 * none is the writer's own and is not an error.
 */
export function matchHeadings(doc: PMNode, template: TemplateDef, links: Record<string, string> = {}): MatchedHeading[] {
    const nodes = new Map(flattenNodes(template.nodes).map((n) => [n.id, n]));
    const linked = new Map<string, NodeDef>();
    for (const [id, heading] of Object.entries(links)) {
        const node = nodes.get(id);
        if (node) linked.set(heading, node);
    }
    const byHeading = new Map<string, NodeDef>();
    for (const node of flattenNodes(template.nodes)) {
        for (const heading of nodeHeadings(node)) {
            const key = normalizeHeading(heading);
            if (!byHeading.has(key)) byHeading.set(key, node);
        }
    }
    const used = new Set<string>();
    const headings: MatchedHeading[] = [];
    doc.forEach((child, offset) => {
        if (child.type.name !== 'heading') return;
        const key = normalizeHeading(child.textContent);
        // A linked part is found by its link alone, not by its own heading too.
        const byText = byHeading.get(key);
        let node = linked.get(key) ?? (byText && !links[byText.id] ? byText : undefined);
        if (node && used.has(node.id)) node = undefined;
        if (node) used.add(node.id);
        headings.push({ pos: offset, level: child.attrs.level, text: child.textContent, node });
    });
    return headings;
}

/**
 * Every heading with its part, and the length and citations under it —
 * counted in words, or in characters for a language that counts those.
 */
export function readSections(doc: PMNode, template: TemplateDef, links: Record<string, string> = {}, unit: LengthUnit = 'words'): Section[] {
    const headings = matchHeadings(doc, template, links);
    return headings.map((h, i) => {
        let end = doc.content.size;
        for (let j = i + 1; j < headings.length; j++) {
            if (headings[j].level <= h.level) { end = headings[j].pos; break; }
        }
        const bodyFrom = h.pos + (doc.nodeAt(h.pos)?.nodeSize ?? 0);
        const body = bodyFrom < end ? doc.textBetween(bodyFrom, end, '\n', ' ') : '';
        return {
            pos: h.pos,
            level: h.level,
            heading: h.text,
            node: h.node,
            end,
            // A part's own text: its sub-parts are counted under them.
            ...measure(ownText(doc, bodyFrom, end, headings, i), unit),
            citations: body.match(CITATION)?.length ?? 0,
        };
    });
}

/**
 * A part's length in the project's unit — except a part written in another
 * script: the English abstract of a Japanese thesis is counted in words, and
 * held to the target in words.
 */
function measure(text: string, unit: LengthUnit): { length: number; unit: LengthUnit } {
    const own = unit === 'chars' && /[A-Za-z]/.test(text) && !/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text) ? 'words' : unit;
    return { length: countIn(text, own), unit: own };
}

/** Text's length in a unit: words, or characters with spaces left out (字数). */
export function countIn(text: string, unit: LengthUnit): number {
    return unit === 'chars' ? [...text.replace(/\s+/g, '')].length : countWords(text);
}

// The text between a heading and its first sub-heading — for a part with
// sub-parts (an act and its beats), the act's own lines and not its beats'.
function ownText(doc: PMNode, from: number, end: number, headings: { pos: number }[], i: number): string {
    const next = headings[i + 1]?.pos ?? doc.content.size;
    const to = Math.min(end, next);
    return from < to ? doc.textBetween(from, to, '\n', ' ') : '';
}

/** Whether a section is within its part's word target, and how. */
export function targetState(section: Section): 'none' | 'under' | 'ok' | 'over' {
    const target = targetIn(section.node?.target, section.unit);
    if (!target) return 'none';
    if (target.max !== undefined && section.length > target.max) return 'over';
    if (target.min !== undefined && section.length < target.min) return 'under';
    return 'ok';
}

/** A check PureWrite works out itself, or null if the writer ticks it. */
export function autoCheck(check: CheckDef, section: Section | undefined): boolean | null {
    if (!check.auto) return null;
    if (!section) return false;
    if (check.auto.rule === 'within-target') return section.length > 0 && targetState(section) === 'ok';
    return section.citations >= check.auto.count;
}

export const checkKey = (node: NodeDef, check: CheckDef) => `${node.id}/${check.id}`;

/**
 * Where a part missing from the document goes: before the first heading of a
 * part that comes after it in the template, or at the end of the document.
 */
export function insertPosFor(sections: readonly Section[], template: TemplateDef, node: NodeDef, docSize: number): number {
    const order = new Map(flattenNodes(template.nodes).map((n, i) => [n.id, i]));
    const at = order.get(node.id) ?? Infinity;
    const next = sections.find((s) => s.node && (order.get(s.node.id) ?? -1) > at);
    return next ? next.pos : docSize;
}

/** The innermost section the position is in, or undefined before the first heading. */
export function sectionAt(sections: readonly Section[], pos: number): Section | undefined {
    let found: Section | undefined;
    for (const s of sections) {
        if (s.pos <= pos && pos < s.end) found = s;
    }
    return found;
}

/** What is still open in a project: unticked checks, parts over a hard limit, parts not in the document. */
export function summarize(sections: readonly Section[], template: TemplateDef, state: ProjectState, language: TemplateLanguage): { openChecks: number; overLimit: string[]; missing: number } {
    // A file holds one of its parts; the others are in their own files, not missing.
    if (template.perFile) return { openChecks: 0, overLimit: [], missing: 0 };
    const byNode = new Map(sections.filter((s) => s.node).map((s) => [s.node!.id, s]));
    let openChecks = 0;
    let missing = 0;
    const overLimit: string[] = [];
    for (const node of flattenNodes(template.nodes)) {
        const section = byNode.get(node.id);
        if (!section) missing++;
        else if (node.target?.hard && targetState(section) === 'over') overLimit.push(nodeText(node, language).heading);
        for (const check of node.checks ?? []) {
            if (!(autoCheck(check, section) ?? state.checks[checkKey(node, check)]?.done)) openChecks++;
        }
    }
    return { openChecks, overLimit, missing };
}

/** The sidecar after one of its files was renamed, or null if it does not name the file. */
export function renameInProject(raw: string, oldName: string, newName: string): string | null {
    const project = parseProject(raw);
    if (!project) return null;
    const old = oldName.normalize('NFC');
    if (!project.files.some((f) => f.normalize('NFC') === old)) return null;
    const files = project.files.map((f) => (f.normalize('NFC') === old ? newName : f));
    return serializeProject({ ...project, files }, raw);
}

/**
 * A template made from a project's structure as it stands: the parts it was
 * matched to keep their guidance, targets and checks; a heading the writer
 * added becomes a part of its own with no guidance yet. Only the headings
 * leave the project — never a word of its text.
 */
export function templateFromProject(sections: readonly Section[], language: TemplateLanguage): NodeDef[] {
    const rows: NodeDef[] = [];
    for (const section of sections) {
        if (section.level < 2) continue;
        const level = section.level === 2 ? 2 : 3;
        if (section.node) {
            const { children: _children, ...node } = JSON.parse(JSON.stringify(section.node)) as NodeDef;
            rows.push({ ...node, level });
        } else {
            const node = emptyNode(level, language, section.heading.trim().slice(0, 200));
            rows.push(node);
        }
    }
    return rows;
}

/**
 * The project moved onto another template. Nothing in its files changes:
 * the headings stay as the writer wrote them and are matched afresh. A part
 * the new template shares with the old one by id (a copy of it) keeps its
 * ticks, and stays tied to the heading it was on even if the new template
 * calls it something else. The template it left is kept for one undo.
 */
export function switchTemplate(state: ProjectState, to: TemplateDef, sections: readonly Section[]): ProjectState {
    const ids = new Map(flattenNodes(to.nodes).map((n) => [n.id, n]));
    const checks: ProjectState['checks'] = {};
    for (const [key, value] of Object.entries(state.checks)) {
        const [nodeId, checkId] = key.split('/');
        if (ids.get(nodeId)?.checks?.some((c) => c.id === checkId)) checks[key] = value;
    }
    const links: ProjectState['links'] = {};
    const matchedByText = new Set(readMatchIds(sections, to));
    for (const section of sections) {
        const id = section.node?.id;
        if (id && ids.has(id) && !matchedByText.has(id)) links[id] = normalizeHeading(section.heading);
    }
    const { previous: _previous, snapshot: _snapshot, ...rest } = state;
    return {
        ...rest,
        template: { id: to.id, version: to.version, language: state.template.language },
        checks,
        links,
        ...(to.source === 'user' ? { snapshot: to } : {}),
        previous: { template: state.template, checks: state.checks, links: state.links, ...(state.snapshot ? { snapshot: state.snapshot } : {}), at: new Date().toISOString() },
    };
}

// The parts of `template` the sections' headings carry by their own text.
function readMatchIds(sections: readonly Section[], template: TemplateDef): string[] {
    const keys = new Map<string, string>();
    for (const node of flattenNodes(template.nodes)) {
        for (const heading of nodeHeadings(node)) keys.set(normalizeHeading(heading), node.id);
    }
    return sections.map((s) => keys.get(normalizeHeading(s.heading))).filter((id): id is string => !!id);
}

/** The project back on the template it was on before the last switch. */
export function undoSwitch(state: ProjectState): ProjectState {
    if (!state.previous) return state;
    const { previous, snapshot: _snapshot, ...rest } = state;
    const { at: _at, ...back } = previous;
    return { ...rest, ...back };
}
