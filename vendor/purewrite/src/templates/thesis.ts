import type { TemplateDef } from './types';

/**
 * A master's thesis. The chapters are the ones nearly every faculty asks for,
 * here and abroad — introduction, literature, method, findings, discussion —
 * with an abstract in the thesis language and another in a second one, as
 * Israeli universities require. The word counts are a middle-sized thesis of
 * about 25,000 words; they are a starting point, and the supervisor's word
 * beats the template's.
 */
export const thesis: TemplateDef = {
    schema: 1,
    id: 'acad.thesis',
    version: '1.0.0',
    source: 'bundled',
    family: 'academic',
    info: {
        en: {
            title: 'Thesis',
            description: 'The chapters of a master\'s thesis, two abstracts, and how far each chapter has got against its length.',
            file: 'Thesis',
        },
        he: {
            title: 'עבודת תזה',
            description: 'הפרקים של עבודת תואר שני, שני תקצירים, וכמה כל פרק התקדם מול האורך שלו.',
            file: 'עבודת תזה',
        },
        ar: {
            title: 'رسالة ماجستير',
            description: 'فصول رسالة الماجستير، وملخّصان بلغتين، ومدى تقدّم كل فصل مقارنةً بطوله المطلوب.',
            file: 'رسالة ماجستير',
        },
        de: {
            title: 'Masterarbeit',
            description: 'Die Kapitel einer Masterarbeit, Kurzfassung und englisches Abstract und wie weit jedes Kapitel im Verhältnis zum geplanten Umfang ist.',
            file: 'Masterarbeit',
        },
        fr: {
            title: 'Mémoire de master',
            description: 'Les chapitres d’un mémoire de master, deux résumés, et l’avancement de chaque chapitre par rapport à sa longueur prévue.',
            file: 'Mémoire de master',
        },
        es: {
            title: 'Tesis de maestría (TFM)',
            description: 'Los capítulos de una tesis de maestría o TFM, dos resúmenes y el avance de cada capítulo respecto a la extensión prevista.',
            file: 'Tesis de maestría',
        },
        ja: {
            title: '修士論文',
            description: '修士論文の各章と、和文・英文の要旨。各章が目標の分量に対してどこまで進んだかもわかります。',
            file: '修士論文',
        },
    },
    nodes: [
        {
            id: 'abstract',
            level: 2,
            target: { min: 300, max: 500, hard: true },
            text: {
                en: {
                    heading: 'Abstract',
                    prompt: 'The question, the method, the main findings and what they mean — the whole thesis in one page. Write it after the discussion.',
                    questions: ['Are the findings in it, or only what you set out to do?'],
                },
                he: {
                    heading: 'תקציר',
                    prompt: 'השאלה, השיטה, הממצאים העיקריים ומה הם אומרים — העבודה כולה בעמוד אחד. כותבים אותו אחרי הדיון.',
                    questions: ['הממצאים מופיעים בו, או רק מה שהתכוונת לעשות?'],
                },
                ar: {
                    heading: 'الملخص',
                    prompt: 'سؤال الدراسة، ومنهجيتها، وأهم النتائج وما تعنيه — الرسالة كلها في صفحة واحدة. اكتبه بعد المناقشة.',
                    questions: ['هل النتائج مذكورة فيه، أم فقط ما نويت أن تفعله؟'],
                },
                de: {
                    heading: 'Kurzfassung',
                    prompt: 'Fragestellung, Methode, die wichtigsten Ergebnisse und was sie bedeuten – die ganze Arbeit auf einer Seite. Schreiben Sie sie erst nach der Diskussion.',
                    questions: ['Stehen die Ergebnisse darin oder nur, was Sie vorhatten?'],
                },
                fr: {
                    heading: 'Résumé',
                    prompt: 'La question, la méthode, les principaux résultats et leur portée\u00a0: tout le mémoire en une page. Rédigez-le après la discussion.',
                    questions: ['Les résultats y figurent-ils, ou seulement ce que vous comptiez faire\u00a0?'],
                },
                es: {
                    heading: 'Resumen',
                    prompt: 'La pregunta, el método, los resultados principales y lo que significan: todo el trabajo en una página. Escríbelo después de la discusión.',
                    questions: ['¿Aparecen los resultados, o solo lo que pretendías hacer?'],
                },
                ja: {
                    heading: '要旨',
                    prompt: '研究課題、方法、主な結果とその意味を、1ページにまとめます。考察まで書き終えてから書きます。',
                    questions: ['結果が書かれていますか？　計画したことだけになっていませんか？'],
                },
            },
            checks: [
                { id: 'length', auto: { rule: 'within-target' }, text: { en: '300–500 words', he: '300-500 מילים', ar: '300-500 كلمة', de: '300–500 Wörter', fr: '300 à 500 mots', es: '300–500 palabras', ja: '600〜1,000字' } },
                { id: 'findings', text: { en: 'States the findings', he: 'הממצאים כתובים בו', ar: 'يذكر النتائج', de: 'Nennt die Ergebnisse', fr: 'Présente les résultats', es: 'Expone los resultados', ja: '結果が書かれている' } },
            ],
        },
        {
            id: 'abstract2',
            level: 2,
            target: { min: 300, max: 500, hard: true },
            text: {
                en: {
                    heading: 'Abstract in a second language',
                    prompt: 'The same abstract in the faculty\'s second language. Translate the final version, not a draft.',
                },
                he: {
                    heading: 'תקציר באנגלית',
                    prompt: 'אותו תקציר באנגלית. מתרגמים את הגרסה הסופית, לא טיוטה.',
                },
                ar: {
                    heading: 'الملخص باللغة الأجنبية',
                    prompt: 'الملخص نفسه باللغة الأجنبية التي تشترطها الكلية (الإنجليزية غالبًا، والفرنسية في كثير من جامعات المغرب العربي). ترجم النسخة النهائية، لا مسودة.',
                },
                de: {
                    heading: 'Abstract (Englisch)',
                    prompt: 'Dieselbe Kurzfassung auf Englisch. Übersetzen Sie die endgültige Fassung, keinen Entwurf.',
                },
                fr: {
                    heading: 'Résumé en anglais',
                    prompt: 'Le même résumé en anglais, ou dans la seconde langue exigée par votre établissement. Traduisez la version définitive, pas un brouillon.',
                },
                es: {
                    heading: 'Resumen en inglés',
                    prompt: 'El mismo resumen en inglés (abstract). Traduce la versión final, no un borrador.',
                },
                ja: {
                    heading: '英文要旨',
                    prompt: '和文要旨と同じ内容を英語で。下書きではなく、最終版を訳します。',
                },
            },
            checks: [
                { id: 'matches', text: { en: 'Matches the final abstract', he: 'תואם לתקציר הסופי', ar: 'مطابق للملخص النهائي', de: 'Entspricht der endgültigen Kurzfassung', fr: 'Conforme au résumé définitif', es: 'Coincide con el resumen final', ja: '和文要旨の最終版と一致している' } },
            ],
        },
        {
            id: 'intro',
            level: 2,
            target: { min: 1500, max: 3000 },
            text: {
                en: {
                    heading: 'Introduction',
                    prompt: 'The problem, why it matters, the question, and a map of the chapters that follow.',
                    questions: ['Could a reader stop here and know what the thesis claims?', 'Does it end with the plan of the thesis?'],
                },
                he: {
                    heading: 'מבוא',
                    prompt: 'הבעיה, למה היא חשובה, השאלה, ומפה של הפרקים שאחריו.',
                    questions: ['קורא שעוצר כאן יודע מה העבודה טוענת?', 'הוא מסתיים במבנה העבודה?'],
                },
                ar: {
                    heading: 'المقدمة',
                    prompt: 'مشكلة الدراسة، وأهميتها، وسؤالها، وعرض موجز لفصول الرسالة.',
                    questions: ['هل يستطيع قارئ يتوقف هنا أن يعرف ما تطرحه الرسالة؟', 'هل تنتهي بعرض لفصول الرسالة؟'],
                },
                de: {
                    heading: 'Einleitung',
                    prompt: 'Das Problem, warum es wichtig ist, die Forschungsfrage und ein Überblick über die folgenden Kapitel.',
                    questions: ['Wüsste jemand, der nur die Einleitung liest, welche These die Arbeit vertritt?', 'Endet sie mit einem Überblick über den Aufbau der Arbeit?'],
                },
                fr: {
                    heading: 'Introduction',
                    prompt: 'Le problème et ses enjeux, la problématique, et l’annonce du plan des chapitres suivants.',
                    questions: ['Un lecteur qui s’arrête ici sait-il ce que soutient le mémoire\u00a0?', 'Se termine-t-elle par l’annonce du plan\u00a0?'],
                },
                es: {
                    heading: 'Introducción',
                    prompt: 'El problema, por qué importa, la pregunta de investigación y la estructura del trabajo, capítulo por capítulo.',
                    questions: ['¿Un lector que se detuviera aquí sabría qué sostiene el trabajo?', '¿Termina con la estructura del trabajo?'],
                },
                ja: {
                    heading: '序論',
                    prompt: '問題、その重要性、研究課題、そして以降の章の構成。',
                    questions: ['ここで読むのをやめた読者にも、本論文の主張が伝わりますか？', '章構成の紹介で締めくくっていますか？'],
                },
            },
            checks: [
                { id: 'length', auto: { rule: 'within-target' }, text: { en: '1,500–3,000 words', he: '1,500-3,000 מילים', ar: '1,500-3,000 كلمة', de: '1.500–3.000 Wörter', fr: '1\u00a0500 à 3\u00a0000 mots', es: '1500–3000 palabras', ja: '3,000〜6,000字' } },
                { id: 'question', text: { en: 'States the research question', he: 'שאלת המחקר מנוסחת בו', ar: 'تصوغ سؤال الدراسة', de: 'Formuliert die Forschungsfrage', fr: 'Formule la problématique', es: 'Plantea la pregunta de investigación', ja: '研究課題が明示されている' } },
                { id: 'roadmap', text: { en: 'Ends with a map of the chapters', he: 'מסתיים במפת הפרקים', ar: 'تنتهي بعرض لفصول الرسالة', de: 'Endet mit dem Aufbau der Arbeit', fr: 'Se termine par l’annonce du plan', es: 'Termina presentando la estructura del trabajo', ja: '章構成の紹介で締めくくっている' } },
            ],
        },
        {
            id: 'lit',
            level: 2,
            target: { min: 4000, max: 8000 },
            text: {
                en: {
                    heading: 'Literature review',
                    prompt: 'The theory and the research your study stands on, organised by the questions it raises. Close with the gap and with the concepts the rest of the thesis uses.',
                    questions: ['Which concepts are defined here, and used the same way later?', 'Have the last few years been searched?'],
                },
                he: {
                    heading: 'סקירת ספרות',
                    prompt: 'התאוריה והמחקר שהעבודה עומדת עליהם, מאורגנים לפי השאלות שהם מעלים. לסיים בפער ובמושגים שבהם העבודה משתמשת בהמשך.',
                    questions: ['אילו מושגים מוגדרים כאן, והאם הם משמשים באותו מובן בהמשך?', 'חיפשת גם בשנים האחרונות?'],
                },
                ar: {
                    heading: 'الإطار النظري والدراسات السابقة',
                    prompt: 'النظرية والأبحاث التي تقوم عليها دراستك، مرتّبة حسب الأسئلة التي تثيرها. اختم بالفجوة البحثية وبالمفاهيم التي تستخدمها بقية الرسالة.',
                    questions: ['ما المفاهيم المعرَّفة هنا، وهل تُستخدم بالمعنى نفسه لاحقًا؟', 'هل بحثت في دراسات السنوات الأخيرة أيضًا؟'],
                },
                de: {
                    heading: 'Theoretischer Hintergrund und Forschungsstand',
                    prompt: 'Die Theorien und Studien, auf die sich Ihre Arbeit stützt, gegliedert nach den Fragen, die sie aufwerfen. Schließen Sie mit der Forschungslücke und den zentralen Begriffen, auf denen die weitere Arbeit aufbaut.',
                    questions: ['Welche Begriffe werden hier definiert – und später genauso verwendet?', 'Haben Sie auch die Literatur der letzten Jahre recherchiert?'],
                },
                fr: {
                    heading: 'Revue de littérature',
                    prompt: 'La théorie et les travaux sur lesquels repose votre étude, organisés selon les questions qu’ils soulèvent. Terminez par la lacune à combler et par les concepts que la suite du mémoire mobilise.',
                    questions: ['Quels concepts sont définis ici, et sont-ils employés dans le même sens ensuite\u00a0?', 'Avez-vous couvert les publications des dernières années\u00a0?'],
                },
                es: {
                    heading: 'Marco teórico',
                    prompt: 'La teoría y la investigación en las que se apoya tu estudio, organizadas según las preguntas que plantean. Cierra con el vacío que quieres cubrir y con los conceptos que usará el resto del trabajo.',
                    questions: ['¿Qué conceptos se definen aquí, y se usan igual más adelante?', '¿Has revisado también lo publicado en los últimos años?'],
                },
                ja: {
                    heading: '先行研究',
                    prompt: '本研究が依拠する理論と先行研究を、それらが提起する問いごとに整理します。最後に、残された課題と、以降の章で用いる概念を示します。',
                    questions: ['ここで定義した概念を、後の章でも同じ意味で使っていますか？', 'ここ数年の研究も調べましたか？'],
                },
            },
            checks: [
                { id: 'citations', auto: { rule: 'min-citations', count: 30 }, text: { en: 'At least 30 citations', he: 'לפחות 30 הפניות', ar: '30 استشهادًا على الأقل', de: 'Mindestens 30 zitierte Quellen', fr: 'Au moins 30 références', es: 'Al menos 30 citas', ja: '引用文献30件以上' } },
                { id: 'themes', text: { en: 'Organised by theme, not by source', he: 'מאורגנת לפי נושאים, לא לפי מקורות', ar: 'مرتّبة حسب المحاور، لا حسب المصادر', de: 'Nach Themen gegliedert, nicht nach Quellen', fr: 'Organisée par thème, non par source', es: 'Organizado por temas, no por fuentes', ja: '文献ごとではなくテーマごとに整理されている' } },
                { id: 'concepts', text: { en: 'Key concepts are defined', he: 'מושגי המפתח מוגדרים', ar: 'المفاهيم الأساسية معرَّفة', de: 'Zentrale Begriffe sind definiert', fr: 'Les concepts clés sont définis', es: 'Los conceptos clave están definidos', ja: '主要な概念が定義されている' } },
                { id: 'commentary', only: ['ar'], text: { ar: 'تنتهي بالتعقيب على الدراسات السابقة وموقع الدراسة منها' } },
            ],
        },
        {
            id: 'method',
            level: 2,
            target: { min: 2000, max: 4000 },
            text: {
                en: {
                    heading: 'Method',
                    prompt: 'The design, the participants or the corpus, the instruments, the procedure and the analysis — and why each was chosen.',
                    questions: ['Is every instrument described or cited, with its reliability?', 'What are the limits of this design, said plainly?'],
                },
                he: {
                    heading: 'שיטת המחקר',
                    prompt: 'מערך המחקר, המשתתפים או הקורפוס, הכלים, ההליך והניתוח — ולמה נבחר כל אחד.',
                    questions: ['כל כלי מתואר או מצוטט, עם המהימנות שלו?', 'מה המגבלות של המערך הזה, במפורש?'],
                },
                ar: {
                    heading: 'منهجية الدراسة',
                    prompt: 'تصميم الدراسة، ومجتمعها وعينتها أو المدوّنة، والأدوات، والإجراءات، والتحليل — ولماذا اخترت كلًّا منها.',
                    questions: ['هل كل أداة موصوفة أو موثّقة، مع دلالات صدقها وثباتها؟', 'ما حدود هذا التصميم، بصراحة؟'],
                },
                de: {
                    heading: 'Methodik',
                    prompt: 'Das Forschungsdesign, die Teilnehmenden oder das Korpus, die Instrumente, das Vorgehen und die Auswertung – und warum Sie sich jeweils dafür entschieden haben.',
                    questions: ['Ist jedes Instrument beschrieben oder belegt, mitsamt seiner Reliabilität?', 'Wo liegen die Grenzen dieses Designs – offen benannt?'],
                },
                fr: {
                    heading: 'Méthodologie',
                    prompt: 'Le dispositif, les participants ou le corpus, les instruments, la procédure et l’analyse — et pourquoi chacun a été choisi.',
                    questions: ['Chaque instrument est-il décrit ou accompagné de sa référence, avec sa fiabilité\u00a0?', 'Quelles sont, honnêtement, les limites de ce dispositif\u00a0?'],
                },
                es: {
                    heading: 'Metodología',
                    prompt: 'El diseño, los participantes o el corpus, los instrumentos, el procedimiento y el análisis, y por qué elegiste cada uno.',
                    questions: ['¿Se describe o se cita cada instrumento, con sus datos de fiabilidad?', '¿Se exponen con franqueza las limitaciones de este diseño?'],
                },
                ja: {
                    heading: '研究方法',
                    prompt: '研究デザイン、対象者またはコーパス、尺度や調査票などの測定用具、手続き、分析方法。そして、それぞれを選んだ理由。',
                    questions: ['使用した尺度や調査票は、いずれも信頼性を含めて説明するか、出典を示していますか？', 'この研究デザインの限界を、率直に書いていますか？'],
                },
            },
            checks: [
                { id: 'length', auto: { rule: 'within-target' }, text: { en: '2,000–4,000 words', he: '2,000-4,000 מילים', ar: '2,000-4,000 كلمة', de: '2.000–4.000 Wörter', fr: '2\u00a0000 à 4\u00a0000 mots', es: '2000–4000 palabras', ja: '4,000〜8,000字' } },
                { id: 'ethics', text: { en: 'Ethics approval noted', he: 'אישור ועדת אתיקה מוזכר', ar: 'موافقة لجنة أخلاقيات البحث مذكورة', de: 'Ethikvotum erwähnt', fr: 'Avis du comité d’éthique mentionné', es: 'Menciona la aprobación del comité de ética', ja: '倫理審査委員会の承認について記載している' } },
                { id: 'repeatable', text: { en: 'Could be repeated from this description', he: 'אפשר לחזור על המחקר לפי התיאור', ar: 'يمكن تكرار الدراسة وفق هذا الوصف', de: 'Nach dieser Beschreibung wiederholbar', fr: 'Reproductible à partir de cette description', es: 'Se podría replicar a partir de esta descripción', ja: 'この記述どおりに追試できる' } },
                { id: 'privacy', only: ['de'], text: { de: 'Datenschutz geklärt (DSGVO-konforme Einwilligung)' } },
            ],
        },
        {
            id: 'findings',
            level: 2,
            target: { min: 3000, max: 6000 },
            text: {
                en: {
                    heading: 'Findings',
                    prompt: 'What you found, in the order of the questions, without interpreting it yet. Tables and figures carry the numbers; the text says what to look at.',
                    questions: ['Is every question answered here, including the ones that came out unexpected?', 'Is any interpretation creeping in before the discussion?'],
                },
                he: {
                    heading: 'ממצאים',
                    prompt: 'מה נמצא, לפי סדר השאלות, עוד בלי לפרש. הטבלאות והתרשימים נושאים את המספרים; הטקסט אומר על מה להסתכל.',
                    questions: ['כל שאלה מקבלת כאן תשובה, גם אלה שיצאו לא כצפוי?', 'יש פרשנות שמתגנבת לפני הדיון?'],
                },
                ar: {
                    heading: 'النتائج',
                    prompt: 'ما توصّلت إليه، بترتيب الأسئلة، ودون تفسير بعد. الجداول والأشكال تحمل الأرقام، والنص يوجّه القارئ إلى ما ينبغي أن ينظر إليه.',
                    questions: ['هل يجد كل سؤال جوابه هنا، حتى ما جاءت نتيجته على غير المتوقع؟', 'هل يتسلّل أي تفسير قبل المناقشة؟'],
                },
                de: {
                    heading: 'Ergebnisse',
                    prompt: 'Was Sie herausgefunden haben, in der Reihenfolge der Fragen und noch ohne Interpretation. Die Zahlen stehen in Tabellen und Abbildungen; der Text sagt, worauf es ankommt.',
                    questions: ['Wird hier jede Frage beantwortet, auch die mit unerwarteten Ergebnissen?', 'Schleicht sich schon vor der Diskussion Interpretation ein?'],
                },
                fr: {
                    heading: 'Résultats',
                    prompt: 'Ce que vous avez trouvé, dans l’ordre des questions, sans l’interpréter encore. Les chiffres vont dans les tableaux et les figures\u00a0; le texte indique ce qu’il faut y regarder.',
                    questions: ['Chaque question trouve-t-elle ici sa réponse, y compris celles aux résultats inattendus\u00a0?', 'Une interprétation se glisse-t-elle avant la discussion\u00a0?'],
                },
                es: {
                    heading: 'Resultados',
                    prompt: 'Lo que encontraste, en el orden de las preguntas, todavía sin interpretarlo. Las tablas y figuras recogen las cifras; el texto indica en qué fijarse.',
                    questions: ['¿Se responde aquí cada pregunta, incluidas las que dieron resultados inesperados?', '¿Se cuela alguna interpretación antes de la discusión?'],
                },
                ja: {
                    heading: '結果',
                    prompt: 'わかったことを、研究課題の順に、まだ解釈を加えずに書きます。数値は図表に任せ、本文では読者が注目すべき点を示します。',
                    questions: ['予想外の結果になったものも含め、すべての研究課題にここで答えていますか？', '考察より前に、解釈が紛れ込んでいませんか？'],
                },
            },
            checks: [
                { id: 'length', auto: { rule: 'within-target' }, text: { en: '3,000–6,000 words', he: '3,000-6,000 מילים', ar: '3,000-6,000 كلمة', de: '3.000–6.000 Wörter', fr: '3\u00a0000 à 6\u00a0000 mots', es: '3000–6000 palabras', ja: '6,000〜12,000字' } },
                { id: 'every-question', text: { en: 'Every question has a finding', he: 'לכל שאלה יש ממצא', ar: 'لكل سؤال نتيجة', de: 'Zu jeder Frage gibt es ein Ergebnis', fr: 'Chaque question a son résultat', es: 'Cada pregunta tiene un resultado', ja: 'すべての研究課題に対応する結果がある' } },
            ],
        },
        {
            id: 'discussion',
            level: 2,
            target: { min: 3000, max: 5000 },
            text: {
                en: {
                    heading: 'Discussion',
                    prompt: 'What the findings mean, set against the literature from chapter two: where they agree, where they do not, and why. Then the limits, and what should be studied next.',
                    questions: ['Is each finding tied back to a study in the review?', 'Are the limits the real ones, or the safe ones?'],
                },
                he: {
                    heading: 'דיון',
                    prompt: 'מה הממצאים אומרים, מול הספרות מהפרק השני: איפה הם מסכימים, איפה לא, ולמה. אחר כך המגבלות, ומה כדאי לחקור בהמשך.',
                    questions: ['כל ממצא נקשר בחזרה למחקר מהסקירה?', 'המגבלות הן האמיתיות, או הבטוחות?'],
                },
                ar: {
                    heading: 'المناقشة',
                    prompt: 'ما تعنيه النتائج، في ضوء الدراسات السابقة في الفصل الثاني: أين تتفق معها، وأين تختلف، ولماذا. ثم حدود الدراسة، وما ينبغي بحثه لاحقًا.',
                    questions: ['هل رُبطت كل نتيجة بدراسة من الدراسات السابقة؟', 'هل الحدود المذكورة هي الحقيقية، أم حدود آمنة لا تمسّ جوهر الدراسة؟'],
                },
                de: {
                    heading: 'Diskussion',
                    prompt: 'Was die Ergebnisse bedeuten, gemessen am Forschungsstand aus Kapitel 2: wo sie übereinstimmen, wo nicht und warum. Danach die Grenzen der Arbeit und was als Nächstes untersucht werden sollte.',
                    questions: ['Wird jedes Ergebnis auf Studien aus dem Forschungsstand bezogen?', 'Sind die genannten Grenzen die echten – oder nur die unverfänglichen?'],
                },
                fr: {
                    heading: 'Discussion',
                    prompt: 'Ce que signifient les résultats, confrontés à la littérature présentée au chapitre 2\u00a0: où ils concordent, où ils divergent, et pourquoi. Puis les limites, et les pistes de recherche à venir.',
                    questions: ['Chaque résultat est-il rattaché à une étude de la revue de littérature\u00a0?', 'Les limites sont-elles les vraies, ou les plus confortables\u00a0?'],
                },
                es: {
                    heading: 'Discusión',
                    prompt: 'Qué significan los resultados frente a la literatura del capítulo dos: dónde coinciden, dónde no y por qué. Después, las limitaciones y lo que convendría investigar a continuación.',
                    questions: ['¿Cada resultado se vincula con un estudio del marco teórico?', '¿Las limitaciones son las reales, o las cómodas?'],
                },
                ja: {
                    heading: '考察',
                    prompt: '結果が何を意味するのかを、第2章の先行研究と照らし合わせて論じます。どこが一致し、どこが食い違い、それはなぜか。続いて本研究の限界と、今後の課題を述べます。',
                    questions: ['どの結果も、第2章で取り上げた先行研究に結びつけていますか？', '挙げた限界は本当の限界ですか？　無難なものを並べただけになっていませんか？'],
                },
            },
            checks: [
                { id: 'length', auto: { rule: 'within-target' }, text: { en: '3,000–5,000 words', he: '3,000-5,000 מילים', ar: '3,000-5,000 كلمة', de: '3.000–5.000 Wörter', fr: '3\u00a0000 à 5\u00a0000 mots', es: '3000–5000 palabras', ja: '6,000〜10,000字' } },
                { id: 'limits', text: { en: 'Limitations discussed', he: 'המגבלות נדונות', ar: 'تناقش حدود الدراسة', de: 'Grenzen werden diskutiert', fr: 'Les limites sont discutées', es: 'Se discuten las limitaciones', ja: '研究の限界を論じている' } },
                { id: 'future', text: { en: 'Suggests further research', he: 'מציע מחקר המשך', ar: 'تقترح أبحاثًا مستقبلية', de: 'Schlägt weitere Forschung vor', fr: 'Propose des pistes de recherche', es: 'Propone líneas de investigación futuras', ja: '今後の研究課題を示している' } },
            ],
        },
        {
            id: 'conclusion',
            level: 2,
            target: { min: 500, max: 1500 },
            text: {
                en: {
                    heading: 'Conclusion',
                    prompt: 'The answer to the question, in a few paragraphs, and what follows from it. Nothing new here.',
                },
                he: {
                    heading: 'סיכום ומסקנות',
                    prompt: 'התשובה לשאלה, בכמה פסקאות, ומה נובע ממנה. שום דבר חדש כאן.',
                },
                ar: {
                    heading: 'الخاتمة',
                    prompt: 'الجواب عن سؤال الدراسة في بضع فقرات، وما يترتّب عليه. ولا تُضِف هنا شيئًا جديدًا.',
                },
                de: {
                    heading: 'Fazit',
                    prompt: 'Die Antwort auf die Forschungsfrage in wenigen Absätzen und was daraus folgt. Hier kommt nichts Neues hinzu.',
                },
                fr: {
                    heading: 'Conclusion',
                    prompt: 'La réponse à la problématique, en quelques paragraphes, et ce qui en découle. Aucun élément nouveau ici.',
                },
                es: {
                    heading: 'Conclusiones',
                    prompt: 'La respuesta a la pregunta, en unos pocos párrafos, y lo que se deriva de ella. No introduzcas aquí nada nuevo.',
                },
                ja: {
                    heading: '結論',
                    prompt: '研究課題への答えを数段落で示し、そこから何が言えるかを述べます。新しい内容はここに入れません。',
                },
            },
            checks: [
                { id: 'answers', text: { en: 'Answers the question from the introduction', he: 'עונה על השאלה מהמבוא', ar: 'تجيب عن السؤال المطروح في المقدمة', de: 'Beantwortet die Frage aus der Einleitung', fr: 'Répond à la problématique posée en introduction', es: 'Responde a la pregunta de la introducción', ja: '序論で立てた問いに答えている' } },
                { id: 'regulations', only: ['es'], text: { es: 'Cumple la normativa de tu programa: formato, apartados obligatorios y declaración de originalidad' } },
            ],
        },
        {
            // Most Arab theses end on recommendations drawn from the findings.
            id: 'recommendations',
            level: 2,
            only: ['ar'],
            target: { min: 200, max: 800 },
            text: {
                ar: {
                    heading: 'التوصيات والمقترحات',
                    prompt: 'ما توصي به الدراسة في ضوء نتائجها: توصيات عملية لأصحاب القرار والممارسين، ومقترحات لدراسات لاحقة. تستند كل توصية إلى نتيجة بعينها.',
                    questions: ['هل تستند كل توصية إلى نتيجة من نتائج الدراسة؟', 'لمن توجَّه كل توصية، وهل يمكن تنفيذها؟'],
                },
            },
            checks: [
                { id: 'grounded', text: { ar: 'كل توصية مرتبطة بنتيجة' } },
                { id: 'further', text: { ar: 'مقترحات لدراسات لاحقة مذكورة' } },
            ],
        },
        {
            id: 'refs',
            level: 2,
            text: {
                en: {
                    heading: 'References',
                    prompt: 'Every source cited, in the faculty\'s style, and nothing that is not.',
                },
                he: {
                    heading: 'ביבליוגרפיה',
                    prompt: 'כל מקור שמוזכר, בסגנון שהפקולטה דורשת, ושום דבר שלא.',
                },
                ar: {
                    heading: 'المراجع',
                    prompt: 'كل مصدر استشهدت به، بأسلوب التوثيق الذي تعتمده الكلية، ولا شيء غيره.',
                },
                de: {
                    heading: 'Literaturverzeichnis',
                    prompt: 'Jede zitierte Quelle im Zitierstil Ihres Fachbereichs – und keine, die nicht zitiert wird.',
                },
                fr: {
                    heading: 'Bibliographie',
                    prompt: 'Toutes les sources citées, selon les normes bibliographiques de votre discipline ou de votre établissement, et aucune autre.',
                },
                es: {
                    heading: 'Referencias',
                    prompt: 'Todas las fuentes citadas en el texto, con el estilo de citación que exija la facultad, y ninguna más.',
                },
                ja: {
                    heading: '参考文献',
                    prompt: '本文で引用したすべての文献を、所属研究科が指定する引用スタイルで。引用していない文献は載せません。',
                },
            },
        },
        {
            id: 'appendices',
            level: 2,
            text: {
                en: {
                    heading: 'Appendices',
                    prompt: 'Questionnaires, interview guides, full tables — whatever the reader may want to check but does not need to read.',
                },
                he: {
                    heading: 'נספחים',
                    prompt: 'שאלונים, מדריכי ראיון, טבלאות מלאות — כל מה שהקורא אולי ירצה לבדוק אבל לא צריך לקרוא.',
                },
                ar: {
                    heading: 'الملاحق',
                    prompt: 'الاستبانات، وأدلة المقابلات، والجداول الكاملة — كل ما قد يرغب القارئ في التحقق منه دون أن يحتاج إلى قراءته.',
                },
                de: {
                    heading: 'Anhang',
                    prompt: 'Fragebögen, Interviewleitfäden, vollständige Tabellen – alles, was man vielleicht prüfen möchte, aber nicht lesen muss.',
                },
                fr: {
                    heading: 'Annexes',
                    prompt: 'Questionnaires, guides d’entretien, tableaux complets\u00a0: tout ce que le lecteur voudra peut-être vérifier sans avoir besoin de le lire.',
                },
                es: {
                    heading: 'Anexos',
                    prompt: 'Cuestionarios, guiones de entrevista, tablas completas: todo lo que el lector quizá quiera comprobar pero no necesita leer.',
                },
                ja: {
                    heading: '付録',
                    prompt: '質問紙、インタビューガイド、詳細な表など、読者が確認したくなるかもしれないが、読む必要はないもの。',
                },
            },
        },
        {
            // A German thesis closes with a sworn statement of authorship.
            id: 'declaration',
            level: 2,
            only: ['de'],
            text: {
                de: {
                    heading: 'Eidesstattliche Erklärung',
                    prompt: 'Die Versicherung, dass Sie die Arbeit selbstständig verfasst und nur die angegebenen Quellen und Hilfsmittel benutzt haben – im Wortlaut, den Ihre Prüfungsordnung vorgibt, mit Ort, Datum und Unterschrift.',
                    questions: ['Verlangt Ihre Hochschule zusätzlich eine Erklärung zur Nutzung von KI-Werkzeugen?'],
                },
            },
            checks: [
                { id: 'wording', text: { de: 'Wortlaut der Prüfungsordnung übernommen' } },
                { id: 'ai', text: { de: 'Erklärung zu KI-Werkzeugen beigefügt, falls verlangt' } },
                { id: 'signed', text: { de: 'Mit Ort, Datum und Unterschrift' } },
            ],
        },
    ],
};
