import type { NodeDef, NodeText, TemplateDef } from './types';

/**
 * An Arabic drama series of thirty episodes: the Ramadan series, aired a
 * day at a time, or a season dropped whole on a platform. There is no pilot
 * to sell on its own; what a producer reads is the idea, the characters,
 * the line of the season across its thirty episodes, and the first episode
 * — the one that decides whether the viewer comes back tomorrow. Arabic only.
 */

function step(id: string, ar: NodeText, position?: number): NodeDef {
    return { id, level: 3, ...(position !== undefined ? { position } : {}), target: { min: 100, max: 600 }, text: { ar } };
}

export const arSeries30: TemplateDef = {
    schema: 1,
    id: 'screen.ar-series-30',
    version: '1.0.0',
    source: 'bundled',
    family: 'screenplay',
    info: {
        ar: {
            title: 'مسلسل درامي من 30 حلقة',
            description: 'المسلسل الرمضاني أو موسم المنصّات: فكرة المسلسل، والشخصيات، وخط الموسم في ثلاث مراحل، والحلقة الأولى من افتتاحيتها إلى نهايتها المعلّقة.',
            file: 'مخطط المسلسل',
        },
    },
    nodes: [
        {
            id: 'logline',
            level: 2,
            target: { max: 50, hard: true },
            text: { ar: { heading: 'الفكرة في جملة واحدة', prompt: 'المسلسل في جملة: مَن، في أي عالم، يريد ماذا، وما الذي يقف في طريقه.', questions: ['هل تَعِد الجملة بثلاثين حلقة لا بحلقة واحدة؟'] } },
            checks: [{ id: 'length', auto: { rule: 'within-target' }, text: { ar: 'جملة واحدة لا تتجاوز 50 كلمة' } }],
        },
        {
            id: 'premise',
            level: 2,
            target: { min: 150, max: 500 },
            text: { ar: { heading: 'فكرة المسلسل', prompt: 'عمّ يدور المسلسل، ونبرته، ولماذا يُروى الآن، ولمن.', questions: ['لماذا هذه الحكاية الآن؟', 'لماذا تحتاج إلى ثلاثين حلقة؟'] } },
        },
        {
            id: 'characters',
            level: 2,
            target: { min: 150, max: 800 },
            text: { ar: { heading: 'الشخصيات الرئيسية', prompt: 'فقرة قصيرة لكل شخصية رئيسية: ما الذي تريده، وما الذي تخفيه، ومع مَن تتصادم.', questions: ['هل تتغيّر كل شخصية رئيسية حتى الحلقة الأخيرة؟'] } },
        },
        {
            id: 'arc',
            level: 2,
            text: { ar: { heading: 'خط الموسم', prompt: 'مسار الحكاية على امتداد الحلقات الثلاثين، في ثلاث مراحل.' } },
            checks: [{ id: 'turns', text: { ar: 'لكل مرحلة منعطف ينقل الحكاية إلى التالية' } }],
            children: [
                step('arc1', { heading: 'الحلقات 1-10: التأسيس', prompt: 'العالم والشخصيات والصراع الذي يطلق الحكاية، حتى المنعطف الأول.' }),
                step('arc2', { heading: 'الحلقات 11-20: التعقيد', prompt: 'تتشابك الخطوط وترتفع المخاطر وتنكشف الأسرار، حتى منعطف منتصف الموسم.' }),
                step('arc3', { heading: 'الحلقات 21-30: الحسم', prompt: 'تتسارع الأحداث نحو المواجهة الكبرى وحلّ العُقد، ونهاية تبقى في الذاكرة.' }),
            ],
        },
        {
            id: 'ep1',
            level: 2,
            text: { ar: { heading: 'الحلقة الأولى', prompt: 'مخطط الحلقة الأولى، التي تقرّر إن كان المشاهد سيعود في اليوم التالي.' } },
            children: [
                step('ep1-open', { heading: 'الافتتاحية', prompt: 'المشاهد الأولى: العالم ونبرته، وشخصية نريد أن نتابعها.', questions: ['هل نعرف نوع المسلسل من المشهد الأول؟'] }, 0),
                step('ep1-rise', { heading: 'تصاعد الأحداث', prompt: 'الحدث الذي يقلب حياة الشخصية الرئيسية، وأول محاولة للتعامل معه.', questions: ['ما الذي تخاطر به الشخصية هنا؟'] }, 0.3),
                {
                    ...step('ep1-end', { heading: 'النهاية المعلّقة', prompt: 'تنتهي الحلقة على سؤال أو مفاجأة تجعل المشاهد ينتظر الحلقة التالية.', questions: ['ما الذي سيعيد المشاهد غدًا؟'] }, 0.9),
                    checks: [{ id: 'hook', text: { ar: 'تنتهي الحلقة بما يدفع إلى مشاهدة التالية' } }],
                },
            ],
        },
    ],
};
