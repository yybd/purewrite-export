import type { Localized, TemplateDef } from './types';

/**
 * A grant proposal, in the order foundations ask for it: the need, what the
 * project will change, how, by when, how it will be measured, who will do it
 * and what it costs. One of the "proposal" family, beside the research
 * proposal; a foundation's own form always wins over this order.
 */

const MEASURABLE: Localized = {
    en: 'Each objective can be measured',
    he: 'כל יעד אפשר למדוד',
    ar: 'كل هدف قابل للقياس',
    de: 'Jedes Teilziel ist messbar',
    fr: 'Chaque objectif est mesurable',
    es: 'Cada objetivo se puede medir',
    ja: 'どの目標も測定できる',
};

export const grantProposal: TemplateDef = {
    schema: 1,
    id: 'acad.grant',
    version: '1.0.0',
    source: 'bundled',
    family: 'academic',
    info: {
        en: { title: 'Grant proposal', description: 'For a foundation or a fund: the need, the goals, the plan, the measures, the team and the budget — in the order reviewers read them.', file: 'Grant proposal' },
        he: { title: 'הצעה לקרן', description: 'לקרן או לגוף מממן: הצורך, המטרות, התוכנית, המדדים, הצוות והתקציב — בסדר שבו הבודקים קוראים.', file: 'הצעה לקרן' },
        ar: { title: 'مقترح منحة', description: 'لمؤسسة أو صندوق مانح: الحاجة، والأهداف، والخطة، والمؤشرات، والفريق، والميزانية — بالترتيب الذي تقرؤها به لجان التقييم.', file: 'مقترح منحة' },
        de: { title: 'Förderantrag', description: 'Für eine Stiftung oder einen Förderfonds: Bedarf, Ziele, Maßnahmen, Indikatoren, Team und Finanzplan – in der Reihenfolge, in der Gutachterinnen und Gutachter lesen.', file: 'Förderantrag' },
        fr: { title: 'Dossier de subvention', description: 'Pour une fondation ou un fonds : le besoin, les objectifs, le plan d’action, les indicateurs, l’équipe et le budget — dans l’ordre où les évaluateurs les lisent.', file: 'Dossier de subvention' },
        es: { title: 'Solicitud de subvención', description: 'Para una fundación o un fondo: la necesidad, los objetivos, el plan, los indicadores, el equipo y el presupuesto, en el orden en que los leen los evaluadores.', file: 'Solicitud de subvención' },
        ja: { title: '助成金申請書', description: '財団や基金に提出する申請書。課題、目標、計画、評価指標、体制、予算を、審査員が読む順に。', file: '助成金申請書' },
    },
    nodes: [
        { id: 'summary', level: 2, target: { max: 250, hard: true }, text: {
            en: { heading: 'Summary', prompt: 'The whole proposal in a paragraph: the problem, what you will do, for whom, and how much you ask.', questions: ['Could a reviewer decide from this alone whether to read on?'] },
            he: { heading: 'תקציר', prompt: 'כל ההצעה בפסקה: הבעיה, מה תעשו, בשביל מי, וכמה מבקשים.', questions: ['בודק יכול להחליט מזה בלבד אם להמשיך לקרוא?'] },
            ar: { heading: 'الملخص التنفيذي', prompt: 'المقترح كله في فقرة: المشكلة، وما ستفعلونه، ولمن، وكم تطلبون.', questions: ['هل يستطيع المقيّم أن يقرر من هذا وحده هل يتابع القراءة؟'] },
            de: { heading: 'Zusammenfassung', prompt: 'Der ganze Antrag in einem Absatz: das Problem, was Sie vorhaben, für wen und welche Summe Sie beantragen.', questions: ['Könnte eine Gutachterin oder ein Gutachter allein danach entscheiden, ob es sich lohnt weiterzulesen?'] },
            fr: { heading: 'Résumé', prompt: 'Tout le dossier en un paragraphe : le problème, ce que vous ferez, pour qui, et le montant demandé.', questions: ['Un évaluateur pourrait-il décider, à partir de cela seul, de poursuivre sa lecture ?'] },
            es: { heading: 'Resumen', prompt: 'Toda la solicitud en un párrafo: el problema, qué harás, para quién y cuánto pides.', questions: ['¿Podría un evaluador decidir solo con esto si sigue leyendo?'] },
            ja: { heading: '申請概要', prompt: '申請全体を一段落で。課題、実施内容、対象者、申請額を示します。', questions: ['これだけを読んで、審査員は読み進めるかどうかを判断できますか？'] },
        }, checks: [{ id: 'length', auto: { rule: 'within-target' }, text: { en: 'Within 250 words', he: 'עד 250 מילים', ar: 'لا يتجاوز 250 كلمة', de: 'Höchstens 250 Wörter', fr: '250 mots au maximum', es: 'Máximo 250 palabras', ja: '500字以内' } }] },
        { id: 'need', level: 2, target: { min: 200, max: 800 }, text: {
            en: { heading: 'The need', prompt: 'The problem, with evidence: numbers, sources, the people affected.', questions: ['Why now, and why you?'] },
            he: { heading: 'הצורך', prompt: 'הבעיה, עם ראיות: נתונים, מקורות, מי נפגע ממנה.', questions: ['למה עכשיו, ולמה דווקא אתם?'] },
            ar: { heading: 'بيان الحاجة', prompt: 'المشكلة مدعومة بالأدلة: الأرقام، والمصادر، والمتضررون منها.', questions: ['لماذا الآن، ولماذا أنتم؟'] },
            de: { heading: 'Ausgangslage und Bedarf', prompt: 'Das Problem, mit Belegen: Zahlen, Quellen, die Betroffenen.', questions: ['Warum jetzt, und warum gerade Sie?'] },
            fr: { heading: 'Contexte et besoins', prompt: 'Le problème, preuves à l’appui : chiffres, sources, personnes concernées.', questions: ['Pourquoi maintenant, et pourquoi vous ?'] },
            es: { heading: 'Justificación', prompt: 'El problema, con pruebas: cifras, fuentes, las personas afectadas.', questions: ['¿Por qué ahora, y por qué tu organización?'] },
            ja: { heading: '背景と必要性', prompt: '課題を根拠とともに。データ、出典、影響を受ける人々。', questions: ['なぜ今、なぜ自分たちなのですか？'] },
        } },
        { id: 'goals', level: 2, target: { min: 100, max: 500 }, text: {
            en: { heading: 'Goals and objectives', prompt: 'The change you aim for, and the concrete objectives that show it happened.' },
            he: { heading: 'מטרות ויעדים', prompt: 'השינוי שאליו אתם חותרים, והיעדים המוחשיים שיראו שהוא קרה.' },
            ar: { heading: 'الغايات والأهداف', prompt: 'التغيير الذي تسعون إليه، والأهداف الملموسة التي تُظهر أنه تحقق.' },
            de: { heading: 'Ziele und Teilziele', prompt: 'Die Veränderung, die Sie anstreben, und die konkreten Teilziele, an denen sich zeigt, dass sie eingetreten ist.' },
            fr: { heading: 'Objectifs généraux et spécifiques', prompt: 'Le changement que vous visez, et les objectifs concrets qui montreront qu’il a eu lieu.' },
            es: { heading: 'Objetivos generales y específicos', prompt: 'El cambio que buscas y los objetivos concretos que demostrarán que se ha producido.' },
            ja: { heading: '目的と目標', prompt: '目指す変化と、それが実現したことを示す具体的な目標。' },
        }, checks: [{ id: 'measurable', text: MEASURABLE }] },
        { id: 'activities', level: 2, target: { min: 200, max: 1200 }, text: {
            en: { heading: 'Activities', prompt: 'What you will do, step by step, and how each step serves an objective.' },
            he: { heading: 'פעילויות', prompt: 'מה תעשו, צעד אחרי צעד, ואיך כל צעד משרת יעד.' },
            ar: { heading: 'الأنشطة', prompt: 'ما ستفعلونه، خطوة خطوة، وكيف تخدم كل خطوة هدفًا.' },
            de: { heading: 'Maßnahmen', prompt: 'Was Sie tun werden, Schritt für Schritt, und welchem Teilziel jeder Schritt dient.' },
            fr: { heading: 'Plan d’action', prompt: 'Ce que vous ferez, étape par étape, et comment chaque étape sert un objectif.' },
            es: { heading: 'Actividades', prompt: 'Qué harás, paso a paso, y cómo cada paso sirve a un objetivo.' },
            ja: { heading: '事業内容', prompt: '何を行うのかを段階ごとに示し、各段階がどの目標に結びつくのかを書きます。' },
        } },
        { id: 'timeline', level: 2, target: { max: 400 }, text: {
            en: { heading: 'Timeline', prompt: 'When each activity happens, and the milestones along the way.' },
            he: { heading: 'לוח זמנים', prompt: 'מתי כל פעילות קורית, ואבני הדרך בדרך.' },
            ar: { heading: 'الجدول الزمني', prompt: 'متى يجري كل نشاط، والمحطات الرئيسية على الطريق.' },
            de: { heading: 'Zeitplan', prompt: 'Wann welche Maßnahme stattfindet und welche Meilensteine es unterwegs gibt.' },
            fr: { heading: 'Calendrier', prompt: 'Quand chaque action a lieu, et les jalons en cours de route.' },
            es: { heading: 'Cronograma', prompt: 'Cuándo ocurre cada actividad y qué hitos hay por el camino.' },
            ja: { heading: '実施スケジュール', prompt: '各事業をいつ実施するのか、途中のマイルストーンとともに。' },
        } },
        { id: 'evaluation', level: 2, target: { min: 100, max: 600 }, text: {
            en: { heading: 'Evaluation', prompt: 'How you will know it worked: what you will measure, how, and when.' },
            he: { heading: 'הערכה', prompt: 'איך תדעו שזה הצליח: מה תמדדו, איך, ומתי.' },
            ar: { heading: 'التقييم', prompt: 'كيف ستعرفون أنه نجح: ما ستقيسونه، وكيف، ومتى.' },
            de: { heading: 'Evaluation', prompt: 'Woran Sie den Erfolg erkennen: was Sie messen, wie und wann.' },
            fr: { heading: 'Évaluation', prompt: 'Comment vous saurez que cela a fonctionné : ce que vous mesurerez, comment et quand.' },
            es: { heading: 'Evaluación', prompt: 'Cómo sabrás que ha funcionado: qué medirás, cómo y cuándo.' },
            ja: { heading: '評価方法', prompt: '成果をどう確かめるのか。何を、どのように、いつ測定するのか。' },
        } },
        { id: 'team', level: 2, target: { max: 500 }, text: {
            en: { heading: 'The organisation and the team', prompt: 'Who you are, what you have already done, and who will carry the project.' },
            he: { heading: 'הארגון והצוות', prompt: 'מי אתם, מה כבר עשיתם, ומי יוביל את הפרויקט.' },
            ar: { heading: 'المؤسسة والفريق', prompt: 'من أنتم، وما الذي أنجزتموه، ومن سيتولى تنفيذ المشروع.' },
            de: { heading: 'Organisation und Team', prompt: 'Wer Sie sind, was Sie bereits geleistet haben und wer das Projekt trägt.' },
            fr: { heading: 'Structure porteuse et équipe', prompt: 'Qui vous êtes, ce que vous avez déjà accompli et qui portera le projet.' },
            es: { heading: 'Entidad solicitante y equipo', prompt: 'Quién solicita, qué ha hecho ya y quién llevará adelante el proyecto.' },
            ja: { heading: '実施体制', prompt: '団体の概要、これまでの実績、事業の担い手。' },
        } },
        { id: 'budget', level: 2, target: { max: 600 }, text: {
            en: { heading: 'Budget', prompt: 'What it costs, line by line, and why each line is needed.', questions: ['Does every line tie to an activity?'] },
            he: { heading: 'תקציב', prompt: 'כמה זה עולה, שורה אחרי שורה, ולמה כל שורה נחוצה.', questions: ['כל שורה קשורה לפעילות?'] },
            ar: { heading: 'الميزانية', prompt: 'كم يكلف، بندًا بندًا، ولماذا كل بند ضروري.', questions: ['هل يرتبط كل بند بنشاط؟'] },
            de: { heading: 'Finanzplan', prompt: 'Was es kostet, Posten für Posten, und warum jeder Posten nötig ist.', questions: ['Gehört jeder Posten zu einer Maßnahme?'] },
            fr: { heading: 'Budget prévisionnel', prompt: 'Ce que cela coûte, poste par poste, et pourquoi chaque poste est nécessaire.', questions: ['Chaque poste se rattache-t-il à une action ?'] },
            es: { heading: 'Presupuesto', prompt: 'Cuánto cuesta, partida por partida, y por qué hace falta cada una.', questions: ['¿Cada partida corresponde a una actividad?'] },
            ja: { heading: '予算計画', prompt: '費用を項目ごとに示し、各項目が必要な理由を書きます。', questions: ['どの項目も事業内容に結びついていますか？'] },
        } },
        { id: 'sustainability', level: 2, target: { max: 400 }, text: {
            en: { heading: 'After the grant', prompt: 'What happens when the money ends: how the work goes on.' },
            he: { heading: 'אחרי המענק', prompt: 'מה קורה כשהכסף נגמר: איך העבודה ממשיכה.' },
            ar: { heading: 'ما بعد المنحة', prompt: 'ماذا يحدث حين ينتهي التمويل: كيف يستمر العمل.' },
            de: { heading: 'Verstetigung', prompt: 'Was geschieht, wenn die Förderung endet: wie die Arbeit weitergeht.' },
            fr: { heading: 'Pérennisation', prompt: 'Ce qui se passe quand le financement s’arrête : comment le travail se poursuit.' },
            es: { heading: 'Sostenibilidad', prompt: 'Qué pasa cuando se acaba el dinero: cómo continúa el trabajo.' },
            ja: { heading: '助成終了後の展開', prompt: '助成が終わったあと、活動をどう継続するのか。' },
        } },
    ],
};
