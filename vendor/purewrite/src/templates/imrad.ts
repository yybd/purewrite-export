import type { TemplateDef } from './types';

/**
 * A research article in the IMRaD shape journals across the sciences ask for:
 * introduction, methods, results and discussion, under an abstract with a hard
 * limit. The lengths are a common full-length article of 4,000–6,000 words;
 * the journal's instructions for authors win wherever they differ.
 */
export const imrad: TemplateDef = {
    schema: 1,
    id: 'acad.imrad',
    version: '1.0.0',
    source: 'bundled',
    family: 'academic',
    info: {
        en: {
            title: 'Research article (IMRaD)',
            description: 'Introduction, methods, results, discussion — the journal article, with an abstract that may not run over.',
            file: 'Article',
        },
        he: {
            title: 'מאמר מחקר (IMRaD)',
            description: 'מבוא, שיטות, תוצאות, דיון — מאמר לכתב עת, עם תקציר שאסור לו לחרוג.',
            file: 'מאמר',
        },
        ar: {
            title: 'مقالة بحثية (IMRaD)',
            description: 'المقدمة والمنهجية والنتائج والمناقشة — بنية المقالة في المجلات العلمية المحكّمة، مع ملخص لا يتجاوز الحد المسموح.',
            file: 'مقالة',
        },
        de: {
            title: 'Forschungsartikel (IMRaD)',
            description: 'Einleitung, Methoden, Ergebnisse, Diskussion – der Zeitschriftenartikel, mit einer Zusammenfassung, die die Wortgrenze nicht überschreiten darf.',
            file: 'Artikel',
        },
        fr: {
            title: 'Article de recherche (IMRaD)',
            description: 'Introduction, méthodes, résultats, discussion — l’article scientifique, avec un résumé à la longueur strictement limitée.',
            file: 'Article',
        },
        es: {
            title: 'Artículo de investigación (IMRaD)',
            description: 'Introducción, métodos, resultados y discusión: el artículo de revista, con un resumen que no puede superar el límite de palabras.',
            file: 'Artículo',
        },
        ja: {
            title: '原著論文（IMRaD）',
            description: '緒言・方法・結果・考察で構成する学術誌の原著論文。抄録には字数の上限があります。',
            file: '論文',
        },
    },
    nodes: [
        {
            id: 'abstract',
            level: 2,
            target: { max: 250, hard: true },
            text: {
                en: {
                    heading: 'Abstract',
                    prompt: 'Background, aim, method, results with their numbers, and the conclusion — one sentence or two for each.',
                    questions: ['Is the main result there, with a number?', 'Does the conclusion claim more than the results show?'],
                },
                he: {
                    heading: 'תקציר',
                    prompt: 'רקע, מטרה, שיטה, תוצאות עם המספרים שלהן, ומסקנה — משפט או שניים לכל אחד.',
                    questions: ['התוצאה העיקרית שם, עם מספר?', 'המסקנה טוענת יותר ממה שהתוצאות מראות?'],
                },
                ar: {
                    heading: 'الملخص',
                    prompt: 'الخلفية، والهدف، والمنهج، والنتائج بأرقامها، والاستنتاج — جملة أو جملتان لكلٍّ منها.',
                    questions: ['هل النتيجة الرئيسية مذكورة، ومعها رقم؟', 'هل يدّعي الاستنتاج أكثر مما تُظهره النتائج؟'],
                },
                de: {
                    heading: 'Zusammenfassung',
                    prompt: 'Hintergrund, Ziel, Methode, Ergebnisse mit ihren Zahlen und Schlussfolgerung – je ein oder zwei Sätze.',
                    questions: ['Steht das Hauptergebnis darin, mit einer Zahl?', 'Behauptet die Schlussfolgerung mehr, als die Ergebnisse zeigen?'],
                },
                fr: {
                    heading: 'Résumé',
                    prompt: 'Contexte, objectif, méthode, résultats chiffrés et conclusion — une phrase ou deux pour chacun.',
                    questions: ['Le résultat principal y figure-t-il, avec un chiffre\u00a0?', 'La conclusion affirme-t-elle plus que ce que montrent les résultats\u00a0?'],
                },
                es: {
                    heading: 'Resumen',
                    prompt: 'Antecedentes, objetivo, método, resultados con sus cifras y conclusión: una o dos frases para cada uno.',
                    questions: ['¿Aparece el resultado principal, con una cifra?', '¿Afirma la conclusión más de lo que muestran los resultados?'],
                },
                ja: {
                    heading: '抄録',
                    prompt: '背景、目的、方法、数値を伴う結果、結論を、それぞれ1〜2文で書きます。',
                    questions: ['主な結果が数値とともに示されていますか？', '結論が結果の示す範囲を超えた主張をしていませんか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: 'Within 250 words', he: 'עד 250 מילים', ar: 'لا يتجاوز 250 كلمة', de: 'Höchstens 250 Wörter', fr: '250 mots au maximum', es: 'Máximo 250 palabras', ja: '500字以内' },
                },
                {
                    id: 'numbers',
                    text: { en: 'Results given with numbers', he: 'התוצאות מובאות עם מספרים', ar: 'النتائج مذكورة بالأرقام', de: 'Ergebnisse mit Zahlen angegeben', fr: 'Résultats chiffrés', es: 'Resultados expresados con cifras', ja: '結果を数値で示している' },
                },
            ],
        },
        {
            id: 'intro',
            level: 2,
            target: { min: 500, max: 1000 },
            text: {
                en: {
                    heading: 'Introduction',
                    prompt: 'What is known, what is not, and what this study set out to do — ending on the aim or the hypothesis.',
                    questions: ['Is the gap one a reviewer would accept as real?', 'Is the aim in the last paragraph?'],
                },
                he: {
                    heading: 'מבוא',
                    prompt: 'מה ידוע, מה לא, ומה המחקר הזה בא לעשות — עד המטרה או ההשערה בסוף.',
                    questions: ['הפער הוא כזה שסוקר יקבל כאמיתי?', 'המטרה כתובה בפסקה האחרונה?'],
                },
                ar: {
                    heading: 'المقدمة',
                    prompt: 'ما هو معروف، وما ليس معروفًا، وما الذي سعت إليه هذه الدراسة — واختم بالهدف أو الفرضية.',
                    questions: ['هل الفجوة البحثية مما يقبله المحكّم على أنها حقيقية؟', 'هل الهدف مذكور في الفقرة الأخيرة؟'],
                },
                de: {
                    heading: 'Einleitung',
                    prompt: 'Was bekannt ist, was nicht, und was diese Studie klären wollte – am Ende steht das Ziel oder die Hypothese.',
                    questions: ['Würde ein Gutachter die Forschungslücke als echt anerkennen?', 'Steht das Ziel im letzten Absatz?'],
                },
                fr: {
                    heading: 'Introduction',
                    prompt: 'Ce que l’on sait, ce que l’on ignore, et ce que cette étude a cherché à faire — en terminant sur l’objectif ou l’hypothèse.',
                    questions: ['Un évaluateur reconnaîtrait-il cette lacune comme réelle\u00a0?', 'L’objectif figure-t-il dans le dernier paragraphe\u00a0?'],
                },
                es: {
                    heading: 'Introducción',
                    prompt: 'Qué se sabe, qué no y qué se propuso este estudio, terminando con el objetivo o la hipótesis.',
                    questions: ['¿Aceptaría un revisor que ese vacío existe de verdad?', '¿Está el objetivo en el último párrafo?'],
                },
                ja: {
                    heading: '緒言',
                    prompt: '既に分かっていること、まだ分かっていないこと、本研究が何を目指したかを書き、最後を目的または仮説で締めくくります。',
                    questions: ['査読者も認める、本当に存在する研究の空白ですか？', '目的は最後の段落に書かれていますか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: '500–1,000 words', he: '500-1,000 מילים', ar: '500-1000 كلمة', de: '500–1.000 Wörter', fr: '500 à 1\u00a0000 mots', es: '500–1000 palabras', ja: '1,000〜2,000字' },
                },
                {
                    id: 'citations',
                    auto: { rule: 'min-citations', count: 10 },
                    text: { en: 'At least 10 citations', he: 'לפחות 10 הפניות', ar: '10 استشهادات على الأقل', de: 'Mindestens 10 zitierte Quellen', fr: 'Au moins 10 références', es: 'Al menos 10 citas', ja: '引用文献10件以上' },
                },
                {
                    id: 'aim',
                    text: { en: 'Ends on the aim or hypothesis', he: 'מסתיים במטרה או בהשערה', ar: 'تنتهي بالهدف أو الفرضية', de: 'Endet mit Ziel oder Hypothese', fr: 'Se termine sur l’objectif ou l’hypothèse', es: 'Termina con el objetivo o la hipótesis', ja: '目的または仮説で締めくくっている' },
                },
            ],
        },
        {
            id: 'methods',
            level: 2,
            target: { min: 800, max: 1500 },
            text: {
                en: {
                    heading: 'Methods',
                    prompt: 'Participants or materials, design, procedure, measures and statistics — enough for another lab to repeat it.',
                    questions: ['Is the sample size justified?', 'Are the statistical tests named, with the software?'],
                },
                he: {
                    heading: 'שיטות',
                    prompt: 'משתתפים או חומרים, מערך, הליך, מדדים וסטטיסטיקה — מספיק כדי שמעבדה אחרת תוכל לחזור על זה.',
                    questions: ['גודל המדגם מנומק?', 'המבחנים הסטטיסטיים מוזכרים בשמם, עם התוכנה?'],
                },
                ar: {
                    heading: 'المنهجية',
                    prompt: 'المشاركون أو المواد، وتصميم الدراسة، والإجراءات، والمقاييس، والتحليل الإحصائي — بتفصيل يكفي لأن يكررها فريق بحثي آخر.',
                    questions: ['هل حجم العينة مبرَّر؟', 'هل الاختبارات الإحصائية مذكورة بأسمائها، مع البرنامج المستخدم؟'],
                },
                de: {
                    heading: 'Methoden',
                    prompt: 'Teilnehmende oder Material, Design, Ablauf, Messinstrumente und Statistik – so genau, dass ein anderes Labor die Studie wiederholen kann.',
                    questions: ['Ist die Stichprobengröße begründet?', 'Sind die statistischen Tests benannt, mit der verwendeten Software?'],
                },
                fr: {
                    heading: 'Méthodes',
                    prompt: 'Participants ou matériel, plan d’étude, procédure, mesures et statistiques — assez pour qu’un autre laboratoire puisse reproduire l’étude.',
                    questions: ['La taille de l’échantillon est-elle justifiée\u00a0?', 'Les tests statistiques sont-ils nommés, avec le logiciel utilisé\u00a0?'],
                },
                es: {
                    heading: 'Métodos',
                    prompt: 'Participantes o materiales, diseño, procedimiento, instrumentos de medida y análisis estadístico: lo suficiente para que otro equipo pueda replicarlo.',
                    questions: ['¿Está justificado el tamaño muestral?', '¿Se nombran las pruebas estadísticas y el software utilizado?'],
                },
                ja: {
                    heading: '方法',
                    prompt: '対象者または材料、研究デザイン、手順、測定項目、統計解析を、他の研究室が追試できる程度に書きます。',
                    questions: ['サンプルサイズの根拠は示されていますか？', '統計手法の名称と使用したソフトウェアが書かれていますか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: '800–1,500 words', he: '800-1,500 מילים', ar: '800-1500 كلمة', de: '800–1.500 Wörter', fr: '800 à 1\u00a0500 mots', es: '800–1500 palabras', ja: '1,600〜3,000字' },
                },
                {
                    id: 'ethics',
                    text: { en: 'Ethics approval and consent stated', he: 'אישור אתיקה והסכמה מדעת מצוינים', ar: 'موافقة لجنة أخلاقيات البحث والموافقة المستنيرة مذكورتان', de: 'Ethikvotum und Einwilligung angegeben', fr: 'Avis du comité d’éthique et consentement mentionnés', es: 'Aprobación ética y consentimiento indicados', ja: '倫理審査委員会の承認とインフォームド・コンセントを記載している' },
                },
                {
                    id: 'stats',
                    text: { en: 'Statistical analysis described', he: 'הניתוח הסטטיסטי מתואר', ar: 'التحليل الإحصائي موصوف', de: 'Statistische Auswertung beschrieben', fr: 'Analyse statistique décrite', es: 'Análisis estadístico descrito', ja: '統計解析の方法を記述している' },
                },
            ],
        },
        {
            id: 'results',
            level: 2,
            target: { min: 800, max: 1500 },
            text: {
                en: {
                    heading: 'Results',
                    prompt: 'What was found, in the order of the methods, with effect sizes and not only p-values. No interpretation yet.',
                    questions: ['Does every table and figure get mentioned in the text?', 'Is anything here repeated in a table?'],
                },
                he: {
                    heading: 'תוצאות',
                    prompt: 'מה נמצא, לפי סדר השיטות, עם גודל אפקט ולא רק ערך p. עוד בלי פרשנות.',
                    questions: ['כל טבלה ותרשים מוזכרים בטקסט?', 'יש משהו שחוזר גם בטבלה?'],
                },
                ar: {
                    heading: 'النتائج',
                    prompt: 'ما الذي توصلت إليه الدراسة، بترتيب المنهجية نفسه، مع أحجام الأثر لا قيم p وحدها. دون تفسير بعد.',
                    questions: ['هل كل جدول وشكل مُشار إليه في النص؟', 'هل يتكرر هنا شيء موجود في جدول؟'],
                },
                de: {
                    heading: 'Ergebnisse',
                    prompt: 'Was gefunden wurde, in der Reihenfolge der Methoden, mit Effektstärken und nicht nur p-Werten. Noch keine Interpretation.',
                    questions: ['Wird jede Tabelle und Abbildung im Text erwähnt?', 'Wiederholt der Text, was schon in einer Tabelle steht?'],
                },
                fr: {
                    heading: 'Résultats',
                    prompt: 'Ce qui a été trouvé, dans l’ordre des méthodes, avec les tailles d’effet et pas seulement les valeurs de p. Pas encore d’interprétation.',
                    questions: ['Chaque tableau et chaque figure sont-ils cités dans le texte\u00a0?', 'Un passage fait-il double emploi avec un tableau\u00a0?'],
                },
                es: {
                    heading: 'Resultados',
                    prompt: 'Lo que se encontró, en el orden de los métodos, con tamaños del efecto y no solo valores de p. Todavía sin interpretación.',
                    questions: ['¿Se menciona en el texto cada tabla y cada figura?', '¿Se repite aquí algo que ya está en una tabla?'],
                },
                ja: {
                    heading: '結果',
                    prompt: '方法と同じ順序で、何が得られたかを書きます。p値だけでなく効果量も示します。解釈はまだ加えません。',
                    questions: ['すべての表と図が本文で言及されていますか？', '本文で表の内容をそのまま繰り返していませんか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: '800–1,500 words', he: '800-1,500 מילים', ar: '800-1500 كلمة', de: '800–1.500 Wörter', fr: '800 à 1\u00a0500 mots', es: '800–1500 palabras', ja: '1,600〜3,000字' },
                },
                {
                    id: 'effects',
                    text: { en: 'Effect sizes reported', he: 'מדווח גודל אפקט', ar: 'أحجام الأثر مذكورة', de: 'Effektstärken berichtet', fr: 'Tailles d’effet rapportées', es: 'Tamaños del efecto informados', ja: '効果量を報告している' },
                },
            ],
        },
        {
            id: 'discussion',
            level: 2,
            target: { min: 1000, max: 1500 },
            text: {
                en: {
                    heading: 'Discussion',
                    prompt: 'The main finding first, then how it fits what others found, the limitations, and what it means in practice.',
                    questions: ['Does the first paragraph answer the aim from the introduction?', 'Is any claim here not backed by a result above?'],
                },
                he: {
                    heading: 'דיון',
                    prompt: 'הממצא העיקרי קודם, אחר כך איך הוא מתיישב עם מה שאחרים מצאו, המגבלות, ומה המשמעות המעשית.',
                    questions: ['הפסקה הראשונה עונה על המטרה מהמבוא?', 'יש כאן טענה שאין לה תוצאה למעלה?'],
                },
                ar: {
                    heading: 'المناقشة',
                    prompt: 'ابدأ بالنتيجة الرئيسية، ثم بيّن موقعها مما توصلت إليه الدراسات الأخرى، ثم حدود الدراسة، وأخيرًا دلالاتها التطبيقية.',
                    questions: ['هل تجيب الفقرة الأولى عن الهدف المذكور في المقدمة؟', 'هل هناك ادعاء لا تسنده نتيجة مما سبق؟'],
                },
                de: {
                    heading: 'Diskussion',
                    prompt: 'Zuerst der Hauptbefund, dann wie er zu den Befunden anderer passt, die Limitationen und was er für die Praxis bedeutet.',
                    questions: ['Beantwortet der erste Absatz das Ziel aus der Einleitung?', 'Gibt es eine Aussage, die durch kein Ergebnis gestützt wird?'],
                },
                fr: {
                    heading: 'Discussion',
                    prompt: 'Le résultat principal d’abord, puis sa place parmi les travaux existants, les limites de l’étude et ses implications pratiques.',
                    questions: ['Le premier paragraphe répond-il à l’objectif posé dans l’introduction\u00a0?', 'Y a-t-il ici une affirmation qui ne s’appuie sur aucun résultat présenté plus haut\u00a0?'],
                },
                es: {
                    heading: 'Discusión',
                    prompt: 'Primero el hallazgo principal; después, cómo encaja con lo que encontraron otros, las limitaciones y lo que significa en la práctica.',
                    questions: ['¿Responde el primer párrafo al objetivo planteado en la introducción?', '¿Hay alguna afirmación que no esté respaldada por los resultados?'],
                },
                ja: {
                    heading: '考察',
                    prompt: 'まず主な知見を述べ、次に先行研究との整合性、本研究の限界、実践上の意義を書きます。',
                    questions: ['最初の段落は緒言で示した目的に答えていますか？', '結果の節で示していないことを根拠にした主張はありませんか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: '1,000–1,500 words', he: '1,000-1,500 מילים', ar: '1000-1500 كلمة', de: '1.000–1.500 Wörter', fr: '1\u00a0000 à 1\u00a0500 mots', es: '1000–1500 palabras', ja: '2,000〜3,000字' },
                },
                {
                    id: 'limits',
                    text: { en: 'Limitations stated', he: 'המגבלות מצוינות', ar: 'حدود الدراسة مذكورة', de: 'Limitationen genannt', fr: 'Limites mentionnées', es: 'Limitaciones señaladas', ja: '研究の限界を記載している' },
                },
            ],
        },
        {
            id: 'conclusion',
            level: 2,
            target: { max: 300 },
            text: {
                en: {
                    heading: 'Conclusion',
                    prompt: 'The take-home message in a short paragraph.',
                },
                he: {
                    heading: 'מסקנות',
                    prompt: 'המסר המרכזי, בפסקה קצרה.',
                },
                ar: {
                    heading: 'الاستنتاجات',
                    prompt: 'الخلاصة التي ينبغي أن يخرج بها القارئ، في فقرة قصيرة.',
                },
                de: {
                    heading: 'Schlussfolgerung',
                    prompt: 'Die Kernaussage in einem kurzen Absatz.',
                },
                fr: {
                    heading: 'Conclusion',
                    prompt: 'Le message essentiel, en un court paragraphe.',
                },
                es: {
                    heading: 'Conclusiones',
                    prompt: 'El mensaje principal, en un párrafo breve.',
                },
                ja: {
                    heading: '結論',
                    prompt: '伝えたい要点を短い段落でまとめます。',
                },
            },
        },
        {
            // Japanese journals ask for a conflict-of-interest statement.
            id: 'coi',
            level: 2,
            only: ['ja'],
            target: { max: 100 },
            text: {
                ja: {
                    heading: '利益相反',
                    prompt: '研究に関わる利益相反の有無と研究資金の出所を明記します。該当がなければ「開示すべき利益相反はない」と書きます。',
                },
            },
            checks: [{ id: 'stated', text: { ja: '利益相反の有無を記載' } }],
        },
        {
            id: 'refs',
            level: 2,
            text: {
                en: {
                    heading: 'References',
                    prompt: 'In the journal\'s style. Check every DOI.',
                },
                he: {
                    heading: 'מקורות',
                    prompt: 'בסגנון של כתב העת. לבדוק כל DOI.',
                },
                ar: {
                    heading: 'المراجع',
                    prompt: 'وفق أسلوب التوثيق الذي تعتمده المجلة. وتحقّق من المعرّف الرقمي (DOI) لكل مرجع.',
                },
                de: {
                    heading: 'Literatur',
                    prompt: 'Im Zitierstil der Zeitschrift. Prüfen Sie jede DOI.',
                },
                fr: {
                    heading: 'Références',
                    prompt: 'Selon le style de la revue. Vérifiez chaque DOI.',
                },
                es: {
                    heading: 'Referencias',
                    prompt: 'Con el estilo de la revista. Comprueba cada DOI.',
                },
                ja: {
                    heading: '参考文献',
                    prompt: '投稿先の投稿規定にある引用スタイルに従います。DOIはすべて確認します。',
                },
            },
        },
    ],
};
