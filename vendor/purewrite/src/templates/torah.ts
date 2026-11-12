import type { Localized, NodeDef, NodeText, TemplateDef } from './types';

/**
 * Torah writing: the dvar Torah said at a table or in a synagogue, the bar
 * or bat mitzvah drasha, the summary of a sugya, and a responsum. The
 * shape is the one teachers give: open with a question that makes the
 * listener wonder, bring the sources, then say something of your own —
 * the chiddush — and tie it to the people in the room. In Hebrew and
 * English; the writing is the writer's, PureWrite only asks.
 */

const OWN_WORDS: Localized = { en: 'In my own words, not quoted', he: 'במילים שלי, לא מצוטט' };
const SOURCE_MARKED: Localized = { en: 'Every source named where it is from', he: 'לכל מקור יש מראה מקום' };

function section(id: string, max: number, text: Localized<NodeText>, extra: Partial<NodeDef> = {}): NodeDef {
    return { id, level: 2, target: { max }, text, ...extra };
}

export const dvarTorah: TemplateDef = {
    schema: 1,
    id: 'torah.dvar-torah',
    version: '1.0.0',
    source: 'bundled',
    family: 'torah',
    info: {
        he: { title: 'דבר תורה', description: 'דבר תורה לשולחן שבת או לבית הכנסת, כחמש דקות: שאלה שמעוררת, המקורות, החידוש שלך, והקשר לשומעים.', file: 'דבר תורה' },
        en: { title: 'Dvar Torah', description: 'A five-minute dvar Torah for the Shabbat table or the synagogue: a question that wakes the listener, the sources, your own insight, and its tie to the people listening.', file: 'Dvar Torah' },
    },
    nodes: [
        section('opening', 100, {
            he: { heading: 'פתיחה', prompt: 'משפט או שניים שתופסים: סיפור קצר, שאלה, או משהו מוכר מהחיים.', questions: ['האם מי שלא מכיר את הפרשה ירצה לשמוע את ההמשך?'] },
            en: { heading: 'Opening', prompt: 'A sentence or two that catches: a short story, a question, something familiar from life.', questions: ['Would someone who does not know the parsha want to hear more?'] },
        }),
        section('text', 150, {
            he: { heading: 'הפסוק', prompt: 'הפסוק או המקום בפרשה שעליו מדברים, ומה כתוב בו בפשטות.' },
            en: { heading: 'The verse', prompt: 'The verse or passage you are speaking on, and what it plainly says.' },
        }, { checks: [{ id: 'source', text: SOURCE_MARKED }] }),
        section('question', 120, {
            he: { heading: 'הקושיה', prompt: 'מה קשה כאן: מילה מיותרת, סתירה, שינוי סדר — "כיצד ייתכן?"', questions: ['הקושיה מרגישה אמיתית, או מאולצת?'] },
            en: { heading: 'The difficulty', prompt: 'What is hard here: an extra word, a contradiction, a change of order — "how can that be?"', questions: ['Does the question feel real, or forced?'] },
        }),
        section('sources', 300, {
            he: { heading: 'המקורות', prompt: 'מה אמרו המפרשים: רש"י, רמב"ן, מדרש — אחד או שניים, לא יותר.' },
            en: { heading: 'The sources', prompt: 'What the commentators said: Rashi, Ramban, a midrash — one or two, no more.' },
        }, { checks: [{ id: 'source', text: SOURCE_MARKED }] }),
        section('chiddush', 300, {
            he: { heading: 'החידוש', prompt: 'מה אתם אומרים — הרעיון שלכם, שעונה על הקושיה.', questions: ['אפשר לומר אותו במשפט אחד?'] },
            en: { heading: 'The insight', prompt: 'What you say — your own idea, the one that answers the difficulty.', questions: ['Can you say it in one sentence?'] },
        }, { checks: [{ id: 'own', text: OWN_WORDS }] }),
        section('lesson', 200, {
            he: { heading: 'הקשר אלינו', prompt: 'מה זה אומר לנו, לשבת הזאת, לאנשים שסביב השולחן.' },
            en: { heading: 'For us', prompt: 'What it says to us — this Shabbat, the people around the table.' },
        }),
        section('closing', 80, {
            he: { heading: 'סיום', prompt: 'משפט סיום וברכה.' },
            en: { heading: 'Closing', prompt: 'A closing line and a blessing.' },
        }),
    ],
};

export const barMitzvahDrasha: TemplateDef = {
    schema: 1,
    id: 'torah.bar-mitzvah',
    version: '1.0.0',
    source: 'bundled',
    family: 'torah',
    info: {
        he: { title: 'דרשת בר או בת מצווה', description: 'הדרשה של היום הגדול, כשבע דקות: הפרשה, שאלה ותשובה, משהו משלך — ותודות למשפחה.', file: 'דרשה' },
        en: { title: 'Bar or bat mitzvah speech', description: 'The speech for the big day, about seven minutes: the parsha, a question and its answer, something of your own — and thanks to the family.', file: 'Speech' },
    },
    nodes: [
        section('welcome', 100, {
            he: { heading: 'פתיחה', prompt: 'ברכת שלום לאורחים, ומה הפרשה שלך.' },
            en: { heading: 'Welcome', prompt: 'Greet the guests, and say which parsha is yours.' },
        }),
        section('parsha', 200, {
            he: { heading: 'הפרשה בקצרה', prompt: 'על מה הפרשה, בשלושה או ארבעה משפטים.', questions: ['סבתא שלך תבין?'] },
            en: { heading: 'The parsha in brief', prompt: 'What the parsha is about, in three or four sentences.', questions: ['Would your grandmother follow it?'] },
        }),
        section('question', 150, {
            he: { heading: 'השאלה', prompt: 'שאלה אחת מהפרשה שעניינה אותך.' },
            en: { heading: 'The question', prompt: 'One question from the parsha that interested you.' },
        }),
        section('answers', 300, {
            he: { heading: 'מה ענו', prompt: 'איך ענו על זה המפרשים — אחד או שניים.' },
            en: { heading: 'What the commentators answered', prompt: 'How the commentators answered it — one or two.' },
        }, { checks: [{ id: 'source', text: SOURCE_MARKED }] }),
        section('mine', 300, {
            he: { heading: 'מה דעתי', prompt: 'התשובה שלך, או מה למדת מזה — במילים שלך.' },
            en: { heading: 'What I think', prompt: 'Your own answer, or what you learned from it — in your own words.' },
        }, { checks: [{ id: 'own', text: OWN_WORDS }] }),
        section('mitzvot', 200, {
            he: { heading: 'מה זה אומר לי היום', prompt: 'הקשר לבר או לבת המצווה: מה מתחיל היום, ומה לוקחים מהפרשה.' },
            en: { heading: 'What it means to me today', prompt: 'The tie to becoming bar or bat mitzvah: what begins today, and what you take from the parsha.' },
        }),
        section('thanks', 250, {
            he: { heading: 'תודות', prompt: 'להורים, לאחים, לסבים ולסבתות, למורים שלימדו אותך — לכל אחד משפט אישי.', questions: ['שכחת מישהו?'] },
            en: { heading: 'Thanks', prompt: 'To parents, siblings, grandparents, the teacher who taught you — a personal line for each.', questions: ['Did you forget anyone?'] },
        }),
        section('closing', 60, {
            he: { heading: 'סיום', prompt: 'ברכה ותודה לכל הבאים.' },
            en: { heading: 'Closing', prompt: 'A blessing, and thanks to everyone for coming.' },
        }),
    ],
};

export const sugyaSummary: TemplateDef = {
    schema: 1,
    id: 'torah.sugya',
    version: '1.0.0',
    source: 'bundled',
    family: 'torah',
    info: {
        he: { title: 'סיכום סוגיא', description: 'סוגיא אחת, מסודרת סביב השאלה שלה: המקור, מהלך הגמרא, שיטות הראשונים, ההלכה, ומה נשאר לעיון.', file: 'סיכום סוגיא' },
        en: { title: 'Sugya summary', description: 'One sugya, laid out around its question: the source, the course of the Gemara, the Rishonim, the halacha, and what is left to think about.', file: 'Sugya summary' },
    },
    nodes: [
        section('location', 60, {
            he: { heading: 'מראה מקום', prompt: 'מסכת, דף, ועד היכן.' },
            en: { heading: 'Where', prompt: 'Tractate, page, and how far.' },
        }),
        section('axis', 120, {
            he: { heading: 'השאלה המרכזית', prompt: 'השאלה שהסוגיא כולה סובבת סביבה — הציר.', questions: ['כל שלב בהמשך עונה עליה?'] },
            en: { heading: 'The central question', prompt: 'The question the whole sugya turns on — its axis.', questions: ['Does every step below answer to it?'] },
        }),
        section('source', 300, {
            he: { heading: 'המקור', prompt: 'המשנה או הברייתא שממנה יוצאים, ופשוטה.' },
            en: { heading: 'The source', prompt: 'The Mishnah or baraita it starts from, and its plain sense.' },
        }, { checks: [{ id: 'source', text: SOURCE_MARKED }] }),
        section('flow', 800, {
            he: { heading: 'מהלך הסוגיא', prompt: 'שלב אחרי שלב: קושיה, תירוץ, דחייה — בקיצור, ומה כל שלב מחדש.' },
            en: { heading: 'The course of the sugya', prompt: 'Step by step: question, answer, rejection — briefly, and what each step adds.' },
        }),
        section('rishonim', 600, {
            he: { heading: 'שיטות הראשונים', prompt: 'איך הבינו את הסוגיא רש"י, תוספות, הרמב"ם ואחרים, ובמה הם נחלקים.', questions: ['מה שורש המחלוקת ביניהם?'] },
            en: { heading: 'The Rishonim', prompt: 'How Rashi, Tosafot, the Rambam and others read the sugya, and where they part.', questions: ['What is the root of their disagreement?'] },
        }, { checks: [{ id: 'source', text: SOURCE_MARKED }] }),
        section('halacha', 300, {
            he: { heading: 'להלכה', prompt: 'איך נפסק: שולחן ערוך, נושאי כליו, פוסקים מאוחרים.' },
            en: { heading: 'The halacha', prompt: 'How it was ruled: the Shulchan Aruch, its commentaries, later authorities.' },
        }),
        section('iyun', 300, {
            he: { heading: 'לעיון', prompt: 'מה עוד לא מובן, ומה כדאי לבדוק.' },
            en: { heading: 'To think about', prompt: 'What is still unclear, and what is worth checking.' },
        }),
    ],
};

export const responsum: TemplateDef = {
    schema: 1,
    id: 'torah.responsum',
    version: '1.0.0',
    source: 'bundled',
    family: 'torah',
    info: {
        he: { title: 'תשובה (שו"ת)', description: 'תשובה לשאלה הלכתית בסדר המקובל: השאלה, היסודות, הדיון, ההכרעה והסייגים.', file: 'תשובה' },
        en: { title: 'Responsum', description: 'An answer to a halachic question in the customary order: the question, the foundations, the discussion, the ruling and its limits.', file: 'Responsum' },
    },
    nodes: [
        section('question', 300, {
            he: { heading: 'השאלה', prompt: 'המקרה כפי שנשאל, בפרטיו — מה בדיוק קרה ומה רוצים לדעת.', questions: ['חסר פרט שעשוי לשנות את התשובה?'] },
            en: { heading: 'The question', prompt: 'The case as asked, in its details — what exactly happened and what is being asked.', questions: ['Is a detail missing that could change the answer?'] },
        }),
        section('topic', 200, {
            he: { heading: 'גדר הנושא', prompt: 'לאיזה תחום הלכתי השאלה שייכת, ומה השאלות שבתוכה.' },
            en: { heading: 'The issue', prompt: 'Which area of halacha the question belongs to, and the questions within it.' },
        }),
        section('foundations', 800, {
            he: { heading: 'היסודות', prompt: 'המקורות בגמרא ובראשונים שעליהם הדיון נשען.' },
            en: { heading: 'The foundations', prompt: 'The sources in the Gemara and the Rishonim the discussion rests on.' },
        }, { checks: [{ id: 'source', text: SOURCE_MARKED }] }),
        section('discussion', 1500, {
            he: { heading: 'הדיון', prompt: 'השיטות, הצדדים, והשאלה איך הם חלים על המקרה הזה.' },
            en: { heading: 'The discussion', prompt: 'The views, the sides, and how they apply to this case.' },
        }),
        section('ruling', 300, {
            he: { heading: 'ההכרעה', prompt: 'המסקנה למעשה, בבירור.', questions: ['השואל יידע מה לעשות?'] },
            en: { heading: 'The ruling', prompt: 'The practical conclusion, plainly.', questions: ['Will the asker know what to do?'] },
        }),
        section('limits', 200, {
            he: { heading: 'סייגים', prompt: 'מתי התשובה לא חלה, ומה מחייב לשאול שוב.' },
            en: { heading: 'Limits', prompt: 'When the answer does not apply, and what calls for asking again.' },
        }),
    ],
};
