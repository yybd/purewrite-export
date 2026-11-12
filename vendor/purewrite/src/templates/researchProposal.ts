import type { TemplateDef } from './types';

/**
 * A research proposal, for a master's or a doctorate. The core is the same
 * from Tel Aviv to Toronto — question, what is known, how it will be found
 * out, why it matters — and the word counts are the common ones (an abstract
 * of up to 300 words, a proposal of ten to fifteen pages). A department's own
 * guide wins wherever it differs.
 */
export const researchProposal: TemplateDef = {
    schema: 1,
    id: 'acad.proposal',
    version: '1.0.0',
    source: 'bundled',
    family: 'academic',
    info: {
        en: {
            title: 'Research proposal',
            description: 'Question, literature, method, significance — the sections a committee reads, with the word counts they expect.',
            file: 'Research proposal',
        },
        he: {
            title: 'הצעת מחקר',
            description: 'שאלה, ספרות, שיטה, חשיבות — הפרקים שהוועדה קוראת, באורך שהיא מצפה לו.',
            file: 'הצעת מחקר',
        },
        ar: {
            title: 'خطة بحث',
            description: 'السؤال، والدراسات السابقة، والمنهجية، والأهمية — الأقسام التي تقرؤها لجنة الدراسات العليا، بالطول الذي تتوقعه.',
            file: 'خطة بحث',
        },
        de: {
            title: 'Exposé',
            description: 'Fragestellung, Forschungsstand, Methodik, Relevanz – die Abschnitte eines Exposés, jeweils im üblichen Umfang.',
            file: 'Exposé',
        },
        fr: {
            title: 'Projet de recherche',
            description: 'Problématique, revue de littérature, méthodologie, intérêt — les parties qu’examine un jury, avec la longueur attendue.',
            file: 'Projet de recherche',
        },
        es: {
            title: 'Propuesta de investigación',
            description: 'Pregunta, estado de la cuestión, metodología y relevancia: las secciones que lee un comité, con la extensión que espera de cada una.',
            file: 'Propuesta de investigación',
        },
        ja: {
            title: '研究計画書',
            description: '研究の背景、先行研究、研究方法、研究の意義など、審査で読まれる各節を、求められる分量の目安とともに。',
            file: '研究計画書',
        },
    },
    nodes: [
        {
            id: 'abstract',
            level: 2,
            target: { max: 300, hard: true },
            text: {
                en: {
                    heading: 'Abstract',
                    prompt: 'The whole proposal in one paragraph: the question, why it is open, how you will answer it, and what the answer will add. Write it last.',
                    questions: ['Could someone outside your field say what you are asking after reading this?', 'Is the method named, not only the topic?'],
                },
                he: {
                    heading: 'תקציר',
                    prompt: 'ההצעה כולה בפסקה אחת: השאלה, למה היא פתוחה, איך תענה עליה, ומה התשובה תוסיף. כותבים אותו בסוף.',
                    questions: ['האם מי שלא מהתחום יוכל לומר מה אתה שואל אחרי שקרא?', 'האם השיטה מוזכרת, ולא רק הנושא?'],
                },
                ar: {
                    heading: 'الملخص',
                    prompt: 'الخطة كلها في فقرة واحدة: السؤال، ولماذا لا يزال مفتوحًا، وكيف ستجيب عنه، وما الذي ستضيفه الإجابة. اكتبه في النهاية.',
                    questions: ['هل يستطيع قارئ من خارج تخصصك، بعد قراءته، أن يعرف عمّ تسأل؟', 'هل ذكرت المنهج، لا الموضوع وحده؟'],
                },
                de: {
                    heading: 'Zusammenfassung',
                    prompt: 'Das ganze Exposé in einem Absatz: die Fragestellung, warum sie noch offen ist, wie Sie sie beantworten wollen und was die Antwort beiträgt. Schreiben Sie die Zusammenfassung zuletzt.',
                    questions: ['Könnte eine fachfremde Person danach sagen, welcher Frage Sie nachgehen?', 'Ist die Methode genannt, nicht nur das Thema?'],
                },
                fr: {
                    heading: 'Résumé',
                    prompt: 'Tout le projet en un paragraphe\u00a0: la question, pourquoi elle reste ouverte, comment vous y répondrez et ce que la réponse apportera. Rédigez-le en dernier.',
                    questions: ['Quelqu’un d’extérieur à votre discipline pourrait-il dire, après lecture, ce que vous cherchez\u00a0?', 'La méthode est-elle nommée, et pas seulement le sujet\u00a0?'],
                },
                es: {
                    heading: 'Resumen',
                    prompt: 'Toda la propuesta en un párrafo: la pregunta, por qué sigue abierta, cómo la responderás y qué aportará la respuesta. Escríbelo al final.',
                    questions: ['¿Sabría alguien ajeno a tu área decir, después de leerlo, cuál es tu pregunta?', '¿Se nombra el método, y no solo el tema?'],
                },
                ja: {
                    heading: '研究概要',
                    prompt: '計画全体を一段落で。問い、それがなぜ未解決なのか、どう答えるのか、その答えが何をもたらすのか。最後に書きます。',
                    questions: ['分野外の人が読んで、何を問う研究なのか説明できますか？', 'テーマだけでなく、方法も書かれていますか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: 'Within 300 words', he: 'עד 300 מילים', ar: 'لا يتجاوز 300 كلمة', de: 'Höchstens 300 Wörter', fr: '300 mots au maximum', es: 'Máximo 300 palabras', ja: '600字以内' },
                },
                {
                    id: 'question',
                    text: { en: 'States the research question', he: 'שאלת המחקר מנוסחת בו', ar: 'يصوغ سؤال البحث', de: 'Nennt die Forschungsfrage', fr: 'Formule la problématique', es: 'Plantea la pregunta de investigación', ja: '研究課題が明示されている' },
                },
                {
                    id: 'contribution',
                    text: { en: 'Says what the study adds', he: 'כתוב בו מה המחקר מוסיף', ar: 'يبيّن ما تضيفه الدراسة', de: 'Sagt, was die Arbeit beiträgt', fr: 'Dit ce que l’étude apporte', es: 'Indica qué aporta el estudio', ja: '研究の貢献が書かれている' },
                },
            ],
        },
        {
            id: 'intro',
            level: 2,
            target: { min: 400, max: 800 },
            text: {
                en: {
                    heading: 'Introduction',
                    prompt: 'Lead from the field to the gap. Open with the problem as people meet it, narrow to what is not yet known, and end on the question.',
                    questions: ['Why now — what changed that makes this worth asking?', 'Where exactly does the known end and your question begin?'],
                },
                he: {
                    heading: 'מבוא',
                    prompt: 'להוביל מהתחום אל הפער. לפתוח בבעיה כפי שהיא נראית בעולם, לצמצם אל מה שעוד לא ידוע, ולסיים בשאלה.',
                    questions: ['למה עכשיו — מה השתנה שבגללו שווה לשאול את זה?', 'איפה בדיוק נגמר הידוע ומתחילה השאלה שלך?'],
                },
                ar: {
                    heading: 'المقدمة',
                    prompt: 'تدرّج من المجال العام إلى الفجوة البحثية: ابدأ بالمشكلة كما تظهر في الواقع، ثم ضيّق نطاقها حتى تبلغ ما لم يُعرف بعد، واختم بسؤال الدراسة.',
                    questions: ['لماذا الآن — ما الذي تغيّر فجعل هذا السؤال جديرًا بالطرح؟', 'أين ينتهي المعروف بالضبط ويبدأ سؤالك؟'],
                },
                de: {
                    heading: 'Einleitung',
                    prompt: 'Führen Sie vom Thema zur Forschungslücke hin. Beginnen Sie mit dem Problem, wie es sich in der Praxis zeigt, grenzen Sie es auf das noch Unbekannte ein und enden Sie mit Ihrer Fragestellung.',
                    questions: ['Warum gerade jetzt – was hat sich verändert, dass sich diese Frage heute stellt?', 'Wo genau endet das Bekannte und beginnt Ihre Frage?'],
                },
                fr: {
                    heading: 'Introduction',
                    prompt: 'Conduisez le lecteur du champ d’étude à la lacune\u00a0: partez du problème tel qu’on le rencontre, resserrez sur ce que l’on ne sait pas encore, et terminez sur la problématique.',
                    questions: ['Pourquoi maintenant — qu’est-ce qui a changé pour que la question mérite d’être posée\u00a0?', 'Où s’arrête exactement le connu, et où commence votre question\u00a0?'],
                },
                es: {
                    heading: 'Introducción',
                    prompt: 'Avanza de lo general del campo al vacío de conocimiento. Empieza por el problema tal como se presenta en la realidad, acota hasta lo que aún no se sabe y termina con la pregunta.',
                    questions: ['¿Por qué ahora? ¿Qué ha cambiado para que valga la pena preguntarlo?', '¿Dónde termina exactamente lo conocido y empieza tu pregunta?'],
                },
                ja: {
                    heading: '研究の背景',
                    prompt: '分野全体から研究の空白へと読み手を導きます。現実に起きている問題から書き始め、まだ分かっていないことへと絞り込み、問いで締めくくります。',
                    questions: ['なぜ今この問いなのですか？　何が変わって、問う価値が生まれたのでしょうか？', '既知の範囲はどこで終わり、本研究の問いはどこから始まりますか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: '400–800 words', he: '400-800 מילים', ar: '400-800 كلمة', de: '400–800 Wörter', fr: '400 à 800 mots', es: '400–800 palabras', ja: '800〜1,600字' },
                },
                {
                    id: 'gap',
                    text: { en: 'Names the gap in what is known', he: 'הפער בידע מוצג במפורש', ar: 'تحدد الفجوة المعرفية صراحةً', de: 'Benennt die Forschungslücke', fr: 'Nomme la lacune dans les connaissances', es: 'Señala el vacío en el conocimiento', ja: '研究の空白を明示している' },
                },
            ],
        },
        {
            id: 'lit',
            level: 2,
            target: { min: 1200, max: 2500 },
            text: {
                en: {
                    heading: 'Literature review',
                    prompt: 'Map the conversation you are joining, by school or by question — not one source after another. Every strand should lead to why your question is still open.',
                    questions: ['What do the main positions disagree about?', 'Which study is closest to yours, and how is yours different?', 'Is anything here older than it should be?'],
                },
                he: {
                    heading: 'סקירת ספרות',
                    prompt: 'למפות את השיח שאתה מצטרף אליו, לפי אסכולות או לפי שאלות — לא מקור אחרי מקור. כל חוט צריך להוביל אל הסיבה שהשאלה שלך עדיין פתוחה.',
                    questions: ['על מה העמדות המרכזיות חלוקות?', 'איזה מחקר הכי קרוב לשלך, ובמה שלך שונה?', 'יש כאן משהו ישן ממה שצריך?'],
                },
                ar: {
                    heading: 'الدراسات السابقة',
                    prompt: 'اعرض ملامح النقاش العلمي الذي تدخل فيه، مصنّفًا حسب المدارس أو حسب الأسئلة، لا مصدرًا تلو آخر. وليُفضِ كل محور إلى بيان سبب بقاء سؤالك دون إجابة.',
                    questions: ['فيمَ تختلف الآراء الرئيسية؟', 'أي دراسة هي الأقرب إلى دراستك، وبمَ تختلف دراستك عنها؟', 'هل بين المصادر هنا ما تجاوزه الزمن؟'],
                },
                de: {
                    heading: 'Forschungsstand',
                    prompt: 'Zeichnen Sie die Debatte nach, an der Sie sich beteiligen, geordnet nach Schulen oder Fragen – nicht eine Quelle nach der anderen. Jeder Strang sollte zeigen, warum Ihre Frage noch offen ist.',
                    questions: ['Worin sind sich die wichtigsten Positionen uneinig?', 'Welche Studie steht Ihrer am nächsten, und was unterscheidet Ihre?', 'Ist etwas davon veraltet – fehlen neuere Arbeiten?'],
                },
                fr: {
                    heading: 'Revue de littérature',
                    prompt: 'Cartographiez le débat auquel vous prenez part, par courant ou par question — pas une source après l’autre. Chaque fil doit montrer pourquoi votre question reste ouverte.',
                    questions: ['Sur quoi les principales positions divergent-elles\u00a0?', 'Quelle étude est la plus proche de la vôtre, et en quoi la vôtre s’en distingue-t-elle\u00a0?', 'Certaines références sont-elles plus anciennes qu’elles ne devraient l’être\u00a0?'],
                },
                es: {
                    heading: 'Estado de la cuestión',
                    prompt: 'Traza un mapa del debate en el que se inscribe tu trabajo, organizado por escuelas o por preguntas, no fuente tras fuente. Cada línea debe conducir a por qué tu pregunta sigue abierta.',
                    questions: ['¿En qué discrepan las posturas principales?', '¿Qué estudio es el más cercano al tuyo y en qué se diferencia el tuyo?', '¿Hay fuentes desactualizadas, o falta la literatura más reciente?'],
                },
                ja: {
                    heading: '先行研究',
                    prompt: '本研究が加わる議論の見取り図を、学派ごと、あるいは問いごとに描きます。文献を一つずつ紹介するのではありません。どの流れも、本研究の問いがなぜまだ解かれていないのかにつながるようにします。',
                    questions: ['主要な立場は何をめぐって対立していますか？', '本研究に最も近い先行研究はどれで、どこが違いますか？', '古い文献に頼りすぎて、最近の研究を見落としていませんか？'],
                },
            },
            checks: [
                {
                    id: 'citations',
                    auto: { rule: 'min-citations', count: 10 },
                    text: { en: 'At least 10 citations', he: 'לפחות 10 הפניות', ar: '10 استشهادات على الأقل', de: 'Mindestens 10 zitierte Quellen', fr: 'Au moins 10 références', es: 'Al menos 10 citas', ja: '引用文献10件以上' },
                },
                {
                    id: 'themes',
                    text: { en: 'Organised by theme, not by source', he: 'מאורגנת לפי נושאים, לא לפי מקורות', ar: 'مرتّبة حسب المحاور، لا حسب المصادر', de: 'Nach Themen gegliedert, nicht nach Quellen', fr: 'Organisée par thème, non par source', es: 'Organizado por temas, no por fuentes', ja: '文献ごとではなくテーマごとに整理されている' },
                },
                {
                    id: 'leads',
                    text: { en: 'Ends on the gap your question fills', he: 'מסתיימת בפער שהשאלה שלך ממלאת', ar: 'تنتهي بالفجوة التي يسدّها سؤالك', de: 'Endet mit der Lücke, die Ihre Frage schließen soll', fr: 'Aboutit à la lacune que comble votre question', es: 'Termina con el vacío que cubre tu pregunta', ja: '本研究の問いが埋める空白で締めくくっている' },
                },
            ],
        },
        {
            id: 'rq',
            level: 2,
            target: { min: 100, max: 400 },
            text: {
                en: {
                    heading: 'Research questions and hypotheses',
                    prompt: 'One main question, and two or three that follow from it. For each hypothesis, say what result would prove it wrong.',
                    questions: ['Can each question be answered by the method below?', 'Is the main question one question, or two joined by "and"?'],
                },
                he: {
                    heading: 'שאלות המחקר והשערותיו',
                    prompt: 'שאלה מרכזית אחת, ושתיים־שלוש שנגזרות ממנה. לכל השערה — איזו תוצאה תפריך אותה.',
                    questions: ['האם השיטה שלמטה יכולה לענות על כל שאלה?', 'השאלה המרכזית היא שאלה אחת, או שתיים שמחוברות ב"ו"?'],
                },
                ar: {
                    heading: 'أسئلة الدراسة وفرضياتها',
                    prompt: 'سؤال رئيس واحد، يتفرّع عنه سؤالان أو ثلاثة أسئلة فرعية. ولكل فرضية، بيّن النتيجة التي تدحضها لو ظهرت.',
                    questions: ['هل يستطيع المنهج الوارد أدناه أن يجيب عن كل سؤال؟', 'هل السؤال الرئيس سؤال واحد، أم سؤالان تربط بينهما «و»؟'],
                },
                de: {
                    heading: 'Forschungsfragen und Hypothesen',
                    prompt: 'Eine zentrale Forschungsfrage und zwei oder drei Unterfragen, die sich daraus ergeben. Geben Sie zu jeder Hypothese an, welches Ergebnis sie widerlegen würde.',
                    questions: ['Lässt sich jede Frage mit der unten beschriebenen Methode beantworten?', 'Ist die Hauptfrage eine Frage – oder zwei, verbunden durch „und“?'],
                },
                fr: {
                    heading: 'Problématique et hypothèses',
                    prompt: 'Une question centrale — votre problématique —, et deux ou trois questions secondaires qui en découlent. Pour chaque hypothèse, dites quel résultat la réfuterait.',
                    questions: ['Chaque question peut-elle trouver réponse avec la méthode décrite plus bas\u00a0?', 'La question principale est-elle une seule question, ou deux reliées par «\u00a0et\u00a0»\u00a0?'],
                },
                es: {
                    heading: 'Preguntas de investigación e hipótesis',
                    prompt: 'Una pregunta principal y dos o tres que se derivan de ella. Para cada hipótesis, di qué resultado la refutaría.',
                    questions: ['¿Puede responderse cada pregunta con el método que se describe a continuación?', '¿La pregunta principal es una sola, o son dos unidas por una «y»?'],
                },
                ja: {
                    heading: '研究課題と仮説',
                    prompt: '中心となる問いを一つ、そこから導かれる問いを二つか三つ。仮説ごとに、どんな結果が出ればそれが否定されるのかを書きます。',
                    questions: ['次節の研究方法で、どの問いにも答えられますか？', '中心となる問いは一つですか？　「と」でつないだ二つの問いになっていませんか？'],
                },
            },
            checks: [
                {
                    id: 'one-main',
                    text: { en: 'One main question', he: 'שאלה מרכזית אחת', ar: 'سؤال رئيس واحد', de: 'Eine zentrale Frage', fr: 'Une seule question principale', es: 'Una sola pregunta principal', ja: '中心となる問いが一つに絞られている' },
                },
                {
                    id: 'falsifiable',
                    text: { en: 'Each hypothesis can be proved wrong', he: 'כל השערה ניתנת להפרכה', ar: 'كل فرضية قابلة للدحض', de: 'Jede Hypothese ist widerlegbar', fr: 'Chaque hypothèse est réfutable', es: 'Cada hipótesis es refutable', ja: 'どの仮説も反証可能である' },
                },
            ],
        },
        {
            // An Arab خطة بحث has its objectives, limits and terms as parts of their own.
            id: 'objectives',
            level: 2,
            only: ['ar'],
            target: { min: 80, max: 300 },
            text: {
                ar: {
                    heading: 'أهداف الدراسة',
                    prompt: 'ما تسعى الدراسة إلى تحقيقه، في أهداف محددة يمكن قياسها، يقابل كلٌّ منها سؤالًا من أسئلة الدراسة.',
                    questions: ['هل لكل سؤال هدف يقابله؟'],
                },
            },
            checks: [{ id: 'match', text: { ar: 'لكل سؤال هدف يقابله' } }],
        },
        {
            id: 'method',
            level: 2,
            target: { min: 800, max: 1500 },
            text: {
                en: {
                    heading: 'Method',
                    prompt: 'Who or what you will study, how you will collect it, and how you will analyse it — in enough detail that someone else could repeat it.',
                    questions: ['Why this method and not the obvious other one?', 'What would you do if access or recruitment falls short?', 'Is there anything that needs ethics approval?'],
                },
                he: {
                    heading: 'שיטת המחקר',
                    prompt: 'את מי או את מה תחקור, איך תאסוף, ואיך תנתח — בפירוט שיאפשר למישהו אחר לחזור על זה.',
                    questions: ['למה השיטה הזאת ולא האחרת המתבקשת?', 'מה תעשה אם הגישה לשדה או הגיוס לא יספיקו?', 'יש משהו שדורש אישור ועדת אתיקה?'],
                },
                ar: {
                    heading: 'منهجية الدراسة',
                    prompt: 'مَن أو ما الذي ستدرسه، وكيف ستجمع بياناتك، وكيف ستحللها — بتفصيل يتيح لباحث آخر أن يكرر العمل.',
                    questions: ['لماذا هذا المنهج دون البديل الأقرب إلى الذهن؟', 'ماذا ستفعل إن تعذّر الوصول إلى الميدان أو لم يكفِ عدد المشاركين؟', 'هل في بحثك ما يتطلب موافقة لجنة أخلاقيات البحث؟'],
                },
                de: {
                    heading: 'Methodik',
                    prompt: 'Wen oder was Sie untersuchen, wie Sie die Daten erheben und wie Sie sie auswerten – so genau, dass jemand anderes die Studie wiederholen könnte.',
                    questions: ['Warum diese Methode und nicht die naheliegende andere?', 'Was tun Sie, wenn der Feldzugang scheitert oder sich zu wenige Teilnehmende finden?', 'Benötigen Sie für einen Teil davon ein Ethikvotum?'],
                },
                fr: {
                    heading: 'Méthodologie',
                    prompt: 'Ce que vous étudierez et auprès de qui, comment vous recueillerez les données et comment vous les analyserez — avec assez de précision pour que quelqu’un d’autre puisse refaire l’étude.',
                    questions: ['Pourquoi cette méthode plutôt que celle qui viendrait d’abord à l’esprit\u00a0?', 'Que ferez-vous si l’accès au terrain ou le recrutement se révèle insuffisant\u00a0?', 'Un aspect de l’étude requiert-il l’avis d’un comité d’éthique\u00a0?'],
                },
                es: {
                    heading: 'Metodología',
                    prompt: 'A quién o qué estudiarás, cómo recopilarás los datos y cómo los analizarás, con el detalle suficiente para que otra persona pueda replicar el estudio.',
                    questions: ['¿Por qué este método y no la alternativa más evidente?', '¿Qué harás si no consigues acceso al campo o el número de participantes previsto?', '¿Hay algo que requiera la aprobación de un comité de ética?'],
                },
                ja: {
                    heading: '研究方法',
                    prompt: '誰を、あるいは何を対象とし、どうデータを集め、どう分析するのか。他の研究者が同じ手順で再現できるほど詳しく書きます。',
                    questions: ['すぐに思いつく別の方法ではなく、この方法を選ぶ理由は何ですか？', '調査先の協力が得られない、参加者が集まらないといった場合は、どうしますか？', '倫理審査委員会の承認が必要な手続きはありますか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: { en: '800–1,500 words', he: '800-1,500 מילים', ar: '800-1500 كلمة', de: '800–1.500 Wörter', fr: '800 à 1 500 mots', es: '800–1500 palabras', ja: '1,600〜3,000字' },
                },
                {
                    id: 'sample',
                    text: { en: 'Population and sample described', he: 'האוכלוסייה והמדגם מתוארים', ar: 'مجتمع الدراسة وعينتها موصوفان', de: 'Grundgesamtheit und Stichprobe beschrieben', fr: 'Population et échantillon décrits', es: 'Población y muestra descritas', ja: '母集団とサンプルが記述されている' },
                },
                {
                    id: 'analysis',
                    text: { en: 'Analysis plan, not only collection', he: 'תוכנית ניתוח, לא רק איסוף', ar: 'خطة للتحليل، لا للجمع فقط', de: 'Auswertungsplan, nicht nur Erhebung', fr: 'Plan d’analyse, pas seulement de collecte', es: 'Plan de análisis, no solo de recopilación', ja: '収集だけでなく分析の計画もある' },
                },
                {
                    id: 'ethics',
                    text: { en: 'Ethics addressed', he: 'התייחסות לאתיקה', ar: 'الاعتبارات الأخلاقية مذكورة', de: 'Ethische Fragen behandelt', fr: 'Questions éthiques abordées', es: 'Se abordan los aspectos éticos', ja: '倫理的配慮に触れている' },
                },
            ],
        },
        {
            id: 'significance',
            level: 2,
            target: { min: 200, max: 500 },
            text: {
                en: {
                    heading: 'Significance',
                    prompt: 'What changes if you are right — for the field, and for anyone outside it. Keep it to what the study can actually show.',
                    questions: ['Who would cite this, and for what?'],
                },
                he: {
                    heading: 'חשיבות המחקר ותרומתו',
                    prompt: 'מה משתנה אם אתה צודק — לתחום, ולמי שמחוצה לו. רק מה שהמחקר באמת יכול להראות.',
                    questions: ['מי יצטט את זה, ולשם מה?'],
                },
                ar: {
                    heading: 'أهمية الدراسة',
                    prompt: 'ما الذي يتغيّر إن صحّ ما تذهب إليه: في مجال تخصصك (الأهمية النظرية)، ولمن هم خارجه (الأهمية التطبيقية). واقتصر على ما تستطيع الدراسة أن تبيّنه فعلًا.',
                    questions: ['من سيستشهد بهذه الدراسة، ولأي غرض؟'],
                },
                de: {
                    heading: 'Relevanz',
                    prompt: 'Was ändert sich, wenn Sie recht behalten – für das Fach und darüber hinaus? Bleiben Sie bei dem, was die Studie tatsächlich zeigen kann.',
                    questions: ['Wer würde diese Arbeit zitieren, und wofür?'],
                },
                fr: {
                    heading: 'Intérêt de la recherche',
                    prompt: 'Ce qui change si vous avez raison — pour la discipline, et au-delà. Tenez-vous-en à ce que l’étude peut réellement montrer.',
                    questions: ['Qui citerait ce travail, et pour quoi faire\u00a0?'],
                },
                es: {
                    heading: 'Justificación y relevancia',
                    prompt: 'Qué cambia si tienes razón, para el campo y para quienes están fuera de él. Limítate a lo que el estudio puede mostrar de verdad.',
                    questions: ['¿Quién citaría esto, y para qué?'],
                },
                ja: {
                    heading: '研究の意義',
                    prompt: '仮説が正しければ何が変わるのか。その分野にとって、そして分野の外の人々にとって。ただし、本研究で実際に示せることに限って書きます。',
                    questions: ['誰が、何のために本研究を引用するでしょうか？'],
                },
            },
        },
        {
            id: 'limits',
            level: 2,
            only: ['ar'],
            target: { max: 250 },
            text: {
                ar: {
                    heading: 'حدود الدراسة',
                    prompt: 'الحدود الموضوعية والمكانية والزمانية والبشرية للدراسة: ما تشمله وما لا تشمله.',
                },
            },
            checks: [{ id: 'all', text: { ar: 'الحدود الموضوعية والمكانية والزمانية والبشرية مذكورة' } }],
        },
        {
            id: 'terms',
            level: 2,
            only: ['ar'],
            target: { max: 400 },
            text: {
                ar: {
                    heading: 'مصطلحات الدراسة',
                    prompt: 'تعريف المصطلحات الأساسية تعريفًا نظريًا وإجرائيًا، كما تستخدمها الدراسة.',
                },
            },
            checks: [{ id: 'operational', text: { ar: 'لكل مصطلح تعريف إجرائي' } }],
        },
        {
            // A German Exposé usually carries the planned table of contents.
            id: 'outline',
            level: 2,
            only: ['de'],
            text: {
                de: {
                    heading: 'Vorläufige Gliederung',
                    prompt: 'Ein Entwurf des Inhaltsverzeichnisses der späteren Arbeit: Kapitel und Unterkapitel, so wie Sie sie heute sehen. Sie darf sich noch ändern.',
                },
            },
        },
        {
            id: 'timeline',
            level: 2,
            target: { max: 300 },
            text: {
                en: {
                    heading: 'Timeline',
                    prompt: 'The stages, in months, from approval to submission. A table is fine.',
                },
                he: {
                    heading: 'לוח זמנים',
                    prompt: 'השלבים, בחודשים, מהאישור ועד ההגשה. טבלה מתאימה כאן.',
                },
                ar: {
                    heading: 'الجدول الزمني',
                    prompt: 'مراحل العمل بالأشهر، من إقرار الخطة حتى تسليم الرسالة. ويمكن عرضها في جدول.',
                },
                de: {
                    heading: 'Arbeits- und Zeitplan',
                    prompt: 'Die Arbeitsschritte in Monaten, von der Annahme des Exposés bis zur Abgabe. Eine Tabelle genügt.',
                },
                fr: {
                    heading: 'Calendrier',
                    prompt: 'Les étapes, en mois, de la validation du projet au dépôt. Un tableau convient très bien.',
                },
                es: {
                    heading: 'Cronograma',
                    prompt: 'Las etapas, en meses, desde la aprobación hasta la entrega. Puedes usar una tabla.',
                },
                ja: {
                    heading: '研究スケジュール',
                    prompt: '計画の承認から論文提出までの各段階を、月単位で。表にしてもかまいません。',
                },
            },
        },
        {
            id: 'refs',
            level: 2,
            text: {
                en: {
                    heading: 'References',
                    prompt: 'Every source cited above, in your department\'s style, and nothing that is not.',
                },
                he: {
                    heading: 'ביבליוגרפיה',
                    prompt: 'כל מקור שמוזכר למעלה, בסגנון שהחוג דורש, ושום דבר שלא.',
                },
                ar: {
                    heading: 'المراجع',
                    prompt: 'كل مصدر ذُكر أعلاه، بأسلوب التوثيق الذي يعتمده قسمك، ولا شيء غيره.',
                },
                de: {
                    heading: 'Literaturverzeichnis',
                    prompt: 'Jede oben zitierte Quelle, im Zitierstil Ihres Instituts – und keine, die nicht zitiert wird.',
                },
                fr: {
                    heading: 'Bibliographie',
                    prompt: 'Toutes les sources citées plus haut, selon les normes bibliographiques de votre discipline ou de votre établissement, et aucune autre.',
                },
                es: {
                    heading: 'Referencias',
                    prompt: 'Todas las fuentes citadas en el texto, con el estilo de citación que pida tu departamento, y ninguna más.',
                },
                ja: {
                    heading: '参考文献',
                    prompt: '本文で引用したすべての文献を、提出先が指定する引用スタイルで。引用していない文献は含めません。',
                },
            },
        },
    ],
};
