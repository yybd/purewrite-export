import type { Localized, NodeDef, NodeText, TemplateDef, TemplateLanguage } from './types';

/**
 * A life story told by answering questions, a period of life at a time —
 * the way the memoir services and the life-story workshops do it: nobody
 * sits down to "write their life", but anyone can answer what their
 * grandmother's kitchen smelled like. Each chapter is a period; its
 * questions are the way in, not a form to fill: answer one, three, or a
 * different one. A chapter of a few pages is plenty.
 */

const STORY: Localized = {
    en: 'At least one story — a moment, not a summary',
    he: 'לפחות סיפור אחד — רגע, לא סיכום',
    ar: 'قصة واحدة على الأقل — لحظة بعينها، لا تلخيص',
    de: 'Mindestens eine Geschichte – ein Moment, keine Zusammenfassung',
    fr: 'Au moins une histoire — un moment, pas un résumé',
    es: 'Al menos una historia: un momento, no un resumen',
    ja: '要約ではなく、ある瞬間を描いた話がひとつはある',
};
const NAMES: Localized = {
    en: 'The people in it have names and faces',
    he: 'לאנשים יש שמות ופנים',
    ar: 'للأشخاص فيها أسماء ووجوه',
    de: 'Die Menschen darin haben Namen und Gesichter',
    fr: 'Les personnes ont un nom et un visage',
    es: 'Las personas tienen nombre y cara',
    ja: '登場する人に名前と顔がある',
};

function chapter(id: string, text: Localized<NodeText>): NodeDef {
    return { id, level: 2, target: { min: 300, max: 3000 }, text, checks: [{ id: 'story', text: STORY }, { id: 'names', text: NAMES }] };
}

export const lifeStory: TemplateDef = {
    schema: 1,
    id: 'life.story',
    version: '1.0.0',
    source: 'bundled',
    family: 'life',
    info: {
        en: {
            title: 'A life story, in questions',
            description: 'Your life, a period at a time: a chapter for each, and the questions that open it — for yourself, for your children and grandchildren.',
            file: 'My story',
        },
        he: {
            title: 'סיפור חיים בשאלות',
            description: 'החיים שלכם, תקופה אחרי תקופה: פרק לכל אחת, והשאלות שפותחות אותו — בשבילכם, בשביל הילדים והנכדים.',
            file: 'הסיפור שלי',
        },
        ar: {
            title: 'قصة حياة في أسئلة',
            description: 'حياتك مرحلةً بعد مرحلة: فصل لكل مرحلة، والأسئلة التي تفتحه — لنفسك، ولأبنائك وأحفادك.',
            file: 'قصتي',
        },
        de: {
            title: 'Lebensgeschichte in Fragen',
            description: 'Ihr Leben, ein Abschnitt nach dem anderen: ein Kapitel für jeden und die Fragen, die ihn öffnen – für Sie selbst, für Ihre Kinder und Enkel.',
            file: 'Meine Geschichte',
        },
        fr: {
            title: 'Récit de vie, en questions',
            description: 'Votre vie, une période après l’autre : un chapitre pour chacune, et les questions qui l’ouvrent — pour vous-même, pour vos enfants et petits-enfants.',
            file: 'Mon histoire',
        },
        es: {
            title: 'Tu historia de vida, en preguntas',
            description: 'Tu vida, etapa por etapa: un capítulo para cada una y las preguntas que lo abren, para ti, para tus hijos y tus nietos.',
            file: 'Mi historia',
        },
        ja: {
            title: '問いに答えて綴る自分史',
            description: 'これまでの人生を時期ごとに。章ごとに、書き出すきっかけになる問いがあります。ご自身のために、お子さんやお孫さんのために。',
            file: '自分史',
        },
    },
    nodes: [
        {
            id: 'why',
            level: 2,
            target: { max: 300 },
            text: {
                en: { heading: 'Why I am writing this', prompt: 'A few lines to whoever will read this one day: who you are writing for, and why now.', questions: ['Who do you picture reading it?', 'What do you want them to know that they could not know otherwise?'] },
                he: { heading: 'למה הספר הזה', prompt: 'כמה שורות למי שיקרא את זה יום אחד: בשביל מי אתם כותבים, ולמה עכשיו.', questions: ['את מי אתם רואים קוראים את זה?', 'מה תרצו שידעו, שלא היו יכולים לדעת אחרת?'] },
                ar: { heading: 'لماذا أكتب هذا', prompt: 'بضعة أسطر لمن سيقرأ هذا يومًا ما: لمن هذه الصفحات، ولماذا الآن.', questions: ['من هو القارئ الذي يخطر ببالك؟', 'ما الذي ينبغي أن يعرفه، ولن يعرفه إلا منك؟'] },
                de: { heading: 'Warum ich das schreibe', prompt: 'Ein paar Zeilen an alle, die dies eines Tages lesen: für wen Sie schreiben und warum gerade jetzt.', questions: ['Wen haben Sie beim Schreiben vor Augen?', 'Was sollen diese Menschen wissen, das sie sonst nie erfahren würden?'] },
                fr: { heading: 'Pourquoi j’écris', prompt: 'Quelques lignes à celui ou celle qui vous lira un jour : pour qui vous écrivez, et pourquoi maintenant.', questions: ['Qui imaginez-vous en train de vous lire ?', 'Que voulez-vous lui transmettre, qu’il ne pourrait apprendre autrement ?'] },
                es: { heading: 'Por qué escribo esto', prompt: 'Unas líneas para quien lea esto algún día: para quién escribes y por qué ahora.', questions: ['¿A quién te imaginas leyéndolo?', '¿Qué quieres que sepa y que de otro modo nunca sabría?'] },
                ja: { heading: 'なぜ書くのか', prompt: 'いつかこれを読む人への短い言葉を。誰のために書くのか、なぜ今なのか。', questions: ['どなたが読む姿を思い浮かべていますか？', 'ほかでは知りようのないことで、伝えておきたいことは何ですか？'] },
            },
        },
        chapter('roots', {
            en: { heading: 'Where I come from', prompt: 'The family before you: parents, grandparents, the places they came from and what they brought with them.', questions: ['What do you know about how your parents met?', 'Which of your grandparents do you remember best — and what one thing about them?', 'Is there a family story everyone tells? Tell it the way you heard it.', 'What did your family bring from the place it came from: a dish, a saying, a habit?'] },
            he: { heading: 'מאיפה באתי', prompt: 'המשפחה שלפניך: הורים, סבים וסבתות, המקומות שמהם באו ומה הביאו איתם.', questions: ['מה ידוע לך על איך ההורים שלך הכירו?', 'את מי מהסבים והסבתות אתם זוכרים הכי טוב — ודבר אחד עליהם?', 'יש סיפור משפחתי שכולם מספרים? ספרו אותו כמו ששמעתם.', 'מה המשפחה הביאה מהמקום שממנו באה: מאכל, אמרה, מנהג?'] },
            ar: { heading: 'من أين جئت', prompt: 'العائلة التي سبقتك: الوالدان والأجداد، والأماكن التي جاؤوا منها وما حملوه معهم.', questions: ['ما الذي بلغك عن تعارف والديك؟', 'من بين أجدادك وجدّاتك، من بقي في ذاكرتك أكثر — وما الذي بقي منه؟', 'هل في العائلة حكاية يرويها الجميع؟ احكِها كما سمعتها.', 'ما الذي حملته العائلة من موطنها الأول: طبق، أو مثل، أو عادة؟'] },
            de: { heading: 'Woher ich komme', prompt: 'Die Familie vor Ihnen: Eltern, Großeltern, die Orte, aus denen sie kamen, und was sie von dort mitbrachten.', questions: ['Was wissen Sie darüber, wie Ihre Eltern sich kennengelernt haben?', 'An wen von Ihren Großeltern erinnern Sie sich am besten – und was fällt Ihnen als Erstes zu ihm oder ihr ein?', 'Gibt es eine Familiengeschichte, die alle erzählen? Erzählen Sie sie so, wie Sie sie gehört haben.', 'Was hat Ihre Familie von dort mitgebracht, wo sie herkam: ein Gericht, eine Redensart, eine Gewohnheit?'] },
            fr: { heading: 'D’où je viens', prompt: 'La famille avant vous : vos parents, vos grands-parents, les lieux d’où ils venaient et ce qu’ils en ont rapporté.', questions: ['Que savez-vous de la rencontre de vos parents ?', 'De quel grand-parent vous souvenez-vous le mieux — et que retenez-vous de lui ou d’elle ?', 'Y a-t-il une histoire de famille que tout le monde raconte ? Racontez-la comme vous l’avez entendue.', 'Qu’est-ce que votre famille a rapporté de là d’où elle venait : un plat, un dicton, une habitude ?'] },
            es: { heading: 'De dónde vengo', prompt: 'La familia que vino antes de ti: padres, abuelos, los lugares de donde venían y lo que trajeron consigo.', questions: ['¿Qué sabes de cómo se conocieron tus padres?', '¿A cuál de tus abuelos recuerdas mejor, y qué es lo primero que te viene a la memoria?', '¿Hay una historia familiar que todos cuentan? Cuéntala como la oíste.', '¿Qué trajo tu familia del lugar de donde venía: un plato, un dicho, una costumbre?'] },
            ja: { heading: '家族のルーツ', prompt: 'ご自身より前の世代のこと。ご両親や祖父母、その人たちが生まれ育った土地、そこから受け継いだもの。', questions: ['ご両親の出会いについて、何か聞いていますか？', '祖父母のなかで、いちばんよく覚えているのはどなたですか？　その方について、ひとつ書くとしたら？', '家族のあいだで必ず語られる話はありますか？　聞いたとおりに書いてみてください。', '故郷から受け継いだものはありますか？　料理、言い回し、習慣など。'] },
        }),
        chapter('childhood', {
            en: { heading: 'Childhood', prompt: 'The home you grew up in, the street, the first friends — through a child\'s eyes, with a child\'s details.', questions: ['Walk through the house you grew up in, room by room. What do you see?', 'What did a Friday, or a Sunday, look like?', 'Who was your best friend, and what did you do together?', 'What were you afraid of? What made you laugh?', 'What is your very first memory?'] },
            he: { heading: 'ילדות', prompt: 'הבית שבו גדלת, הרחוב, החברים הראשונים — בעיני ילד, עם הפרטים שילד רואה.', questions: ['עברו בבית שבו גדלתם, חדר אחרי חדר. מה רואים?', 'איך נראה יום שישי?', 'מי היו החברים הכי טובים שלכם, ומה עשיתם יחד?', 'ממה פחדתם? מה הצחיק אתכם?', 'מה הזיכרון הכי ראשון שלכם?'] },
            ar: { heading: 'الطفولة', prompt: 'البيت الذي نشأت فيه، والحيّ، والأصدقاء الأوائل — بعين طفل، وبالتفاصيل التي يراها الطفل.', questions: ['تجوّل في البيت الذي نشأت فيه، غرفةً غرفة. ماذا ترى؟', 'كيف كان يوم الجمعة، أو الأحد، في بيتكم؟', 'من كان أقرب أصدقائك، وماذا كنتما تفعلان معًا؟', 'ما الذي كان يخيفك؟ وما الذي كان يضحكك؟', 'ما أول ذكرى في حياتك؟'] },
            de: { heading: 'Kindheit', prompt: 'Das Zuhause, in dem Sie aufgewachsen sind, die Straße, die ersten Freunde – mit den Augen eines Kindes, mit den Einzelheiten, die ein Kind sieht.', questions: ['Gehen Sie durch das Haus oder die Wohnung Ihrer Kindheit, Zimmer für Zimmer. Was sehen Sie?', 'Wie sah bei Ihnen zu Hause ein Sonntag aus?', 'Wer war Ihr bester Freund oder Ihre beste Freundin, und was haben Sie zusammen gemacht?', 'Wovor hatten Sie Angst? Worüber haben Sie gelacht?', 'Was ist Ihre allererste Erinnerung?'] },
            fr: { heading: 'L’enfance', prompt: 'La maison de votre enfance, la rue, les premiers amis — avec les yeux d’un enfant, et les détails qu’il remarque.', questions: ['Parcourez la maison où vous avez grandi, pièce par pièce. Que voyez-vous ?', 'À quoi ressemblait un dimanche chez vous ?', 'Qui était votre meilleur ami ou votre meilleure amie, et que faisiez-vous ensemble ?', 'De quoi aviez-vous peur ? Qu’est-ce qui vous faisait rire ?', 'Quel est votre tout premier souvenir ?'] },
            es: { heading: 'Infancia', prompt: 'La casa donde creciste, la calle, los primeros amigos: con los ojos de un niño y los detalles que ve un niño.', questions: ['Recorre la casa donde creciste, habitación por habitación. ¿Qué ves?', '¿Cómo era un domingo en tu casa?', '¿Quién fue tu mejor amigo o amiga, y qué recuerdas haber hecho juntos?', '¿Qué te daba miedo? ¿Qué te hacía reír?', '¿Cuál es tu primer recuerdo?'] },
            ja: { heading: '子どものころ', prompt: '育った家、近所の道、最初の友だち。子どもの目で、子どもが見ていた細かなところまで。', questions: ['育った家を、部屋ごとに歩いてみてください。何が見えますか？', '日曜日やお正月は、どんなふうに過ごしていましたか？', '仲のよかった友だちは誰で、一緒に何をしていましたか？', '何が怖かったですか？　何がおかしくて笑いましたか？', 'いちばん古い記憶は何ですか？'] },
        }),
        chapter('school', {
            en: { heading: 'School years', prompt: 'Teachers, classmates, what you were good at and what you were not; the years you learned who you were.', questions: ['Which teacher do you still remember, and why?', 'What did you want to be when you grew up?', 'Was there a day at school you never forgot?', 'What did you do after school?'] },
            he: { heading: 'שנות בית הספר', prompt: 'מורים, חברים לכיתה, במה הייתם טובים ובמה לא; השנים שבהן למדתם מי אתם.', questions: ['איזה מורה אתם עדיין זוכרים, ולמה?', 'מה רציתם להיות כשתגדלו?', 'היה יום בבית הספר שלא שכחתם?', 'מה עשיתם אחרי הלימודים?'] },
            ar: { heading: 'سنوات المدرسة', prompt: 'المعلّمون، وزملاء الصف، وما برعت فيه وما لم تبرع فيه؛ السنوات التي عرفت فيها من تكون.', questions: ['أيّ معلّم أو معلّمة بقي في ذاكرتك، ولماذا؟', 'ماذا كنت تحلم أن تصبح حين تكبر؟', 'هل هناك يوم في المدرسة لم تنسه قط؟', 'كيف كنت تقضي وقتك بعد المدرسة؟'] },
            de: { heading: 'Schulzeit', prompt: 'Lehrer, Mitschüler, was Ihnen lag und was nicht – die Jahre, in denen Sie lernten, wer Sie sind.', questions: ['An welchen Lehrer oder welche Lehrerin erinnern Sie sich noch, und warum?', 'Was wollten Sie werden, wenn Sie groß sind?', 'Gab es einen Schultag, den Sie nie vergessen haben?', 'Was haben Sie nachmittags nach der Schule gemacht?'] },
            fr: { heading: 'Les années d’école', prompt: 'Les maîtres et les professeurs, les camarades, ce qui vous réussissait et ce qui ne vous réussissait pas ; les années où vous avez appris qui vous étiez.', questions: ['De quel maître ou professeur vous souvenez-vous encore, et pourquoi ?', 'Que rêviez-vous de devenir plus tard ?', 'Y a-t-il un jour d’école que vous n’avez jamais oublié ?', 'Que faisiez-vous après la classe ?'] },
            es: { heading: 'Años de escuela', prompt: 'Maestros, compañeros de clase, lo que se te daba bien y lo que no; los años en que aprendiste quién eras.', questions: ['¿Qué maestro o profesora recuerdas todavía, y por qué?', '¿Qué soñabas con ser cuando crecieras?', '¿Hubo un día de escuela que nunca olvidaste?', '¿Qué hacías al salir de la escuela?'] },
            ja: { heading: '学校時代', prompt: '小学校から高校まで。先生、同級生、得意だったことと苦手だったこと。自分がどんな人間かを知っていった年月です。', questions: ['今でも覚えている先生はいますか？　なぜでしょう？', '大きくなったら何になりたいと思っていましたか？', '学校で、忘れられない一日はありますか？', '放課後は何をしていましたか？　部活動や習いごとは？'] },
        }),
        chapter('youth', {
            en: { heading: 'Growing up', prompt: 'Leaving home, first independence, service or studies, the friends who became family — the years things started to be your own choice.', questions: ['When did you first feel grown up?', 'Where did you go when you left home, and what was it like the first night?', 'Who did you become friends with then, and are you still?', 'What decision from those years shaped everything after?'] },
            he: { heading: 'התבגרות', prompt: 'היציאה מהבית, העצמאות הראשונה, השירות או הלימודים, החברים שנהיו משפחה — השנים שבהן הדברים התחילו להיות בחירה שלכם.', questions: ['מתי הרגשתם לראשונה מבוגרים?', 'לאן הלכתם כשיצאתם מהבית, ואיך היה הלילה הראשון?', 'עם מי התיידדתם אז, ואתם עדיין בקשר?', 'איזו החלטה מאותן שנים עיצבה את כל מה שבא אחריה?'] },
            ar: { heading: 'سنوات الشباب', prompt: 'مغادرة البيت، والاستقلال الأول، والخدمة العسكرية أو الجامعة أو العمل، والأصدقاء الذين صاروا أهلًا — السنوات التي بدأت فيها الأمور تصير اختيارك أنت.', questions: ['متى شعرت لأول مرة أنك كبرت؟', 'إلى أين ذهبت حين غادرت بيت أهلك، وكيف كانت الليلة الأولى؟', 'من صادقت في تلك الأيام، وهل ما زلتما على تواصل؟', 'أيّ قرار من تلك السنوات رسم كل ما جاء بعده؟'] },
            de: { heading: 'Erwachsenwerden', prompt: 'Von zu Hause weggehen, die erste Selbstständigkeit, Lehre oder Studium, Wehr- oder Zivildienst, die Freunde, die zur Familie wurden – die Jahre, in denen die Dinge allmählich Ihre eigene Entscheidung wurden.', questions: ['Wann haben Sie sich zum ersten Mal erwachsen gefühlt?', 'Wohin sind Sie gegangen, als Sie von zu Hause auszogen, und wie war die erste Nacht dort?', 'Mit wem haben Sie sich damals angefreundet, und haben Sie noch Kontakt?', 'Welche Entscheidung aus diesen Jahren hat alles Spätere geprägt?'] },
            fr: { heading: 'Devenir adulte', prompt: 'Quitter la maison, la première indépendance, le service militaire, l’apprentissage ou les études, les amis devenus une famille — les années où les choses ont commencé à être votre propre choix.', questions: ['Quand avez-vous eu pour la première fois le sentiment d’être adulte ?', 'Quel a été votre premier toit en quittant la maison, et comment s’est passée la première nuit ?', 'Quelles amitiés sont nées à cette époque, et durent-elles encore ?', 'Quelle décision de ces années-là a façonné tout ce qui a suivi ?'] },
            es: { heading: 'Juventud', prompt: 'Dejar la casa familiar, la primera independencia, el servicio militar o los estudios, los amigos que se volvieron familia: los años en que las cosas empezaron a ser decisión tuya.', questions: ['¿Cuándo sentiste por primera vez que ya eras una persona adulta?', '¿Adónde fuiste al dejar tu casa, y cómo fue la primera noche?', '¿Con quién hiciste amistad entonces, y sigues en contacto?', '¿Qué decisión de aquellos años marcó todo lo que vino después?'] },
            ja: { heading: '青春時代', prompt: '親元を離れたこと、初めての自立、進学や就職、家族のようになった友人たち。自分で選ぶことが増えていった年月です。', questions: ['はじめて「大人になった」と感じたのはいつですか？', '家を出て、どこへ行きましたか？　最初の夜はどんなふうでしたか？', 'そのころ親しくなったのは誰ですか？　今もつきあいはありますか？', 'あのころの決断で、その後のすべてを形づくったものは何ですか？'] },
        }),
        chapter('love', {
            en: { heading: 'Love and family', prompt: 'How you met the person you built a life with, the home you made, the children — or the family you chose.', questions: ['How did you meet? What did you think the first time?', 'What was your wedding day like — the part nobody photographed?', 'What do you remember of the day your first child was born?', 'What did you want your home to be like, and was it?'] },
            he: { heading: 'אהבה ומשפחה', prompt: 'איך הכרתם את מי שאיתו בניתם חיים, הבית שהקמתם, הילדים — או המשפחה שבחרתם.', questions: ['איך הכרתם? מה חשבתם בפעם הראשונה?', 'איך היה יום החתונה — החלק שאף אחד לא צילם?', 'מה אתם זוכרים מהיום שבו נולד הילד הראשון?', 'איך רציתם שהבית שלכם ייראה, וזה הצליח?'] },
            ar: { heading: 'الحب والعائلة', prompt: 'كيف التقيت بمن بنيت معه حياتك، والبيت الذي أسستماه، والأبناء — أو العائلة التي اخترتها.', questions: ['كيف تعارفتما؟ وماذا خطر ببالك في المرة الأولى؟', 'كيف كان يوم زفافك — ذلك الجزء الذي لم تلتقطه أي صورة؟', 'ماذا بقي في ذاكرتك من يوم ولادة طفلك الأول؟', 'كيف أردت أن يكون بيتك، وهل كان كذلك؟'] },
            de: { heading: 'Liebe und Familie', prompt: 'Wie Sie dem Menschen begegnet sind, mit dem Sie Ihr Leben aufgebaut haben, das Zuhause, das Sie geschaffen haben, die Kinder – oder die Familie, die Sie sich ausgesucht haben.', questions: ['Wie haben Sie sich kennengelernt? Was haben Sie beim ersten Mal gedacht?', 'Wie war Ihr Hochzeitstag – der Teil, den niemand fotografiert hat?', 'Was wissen Sie noch vom Tag, an dem Ihr erstes Kind geboren wurde?', 'Wie sollte Ihr Zuhause sein, und ist es so geworden?'] },
            fr: { heading: 'L’amour et la famille', prompt: 'Comment vous avez rencontré la personne avec qui vous avez construit votre vie, le foyer que vous avez fondé, les enfants — ou la famille que vous vous êtes choisie.', questions: ['Comment vous êtes-vous rencontrés ? Qu’avez-vous pensé la première fois ?', 'Comment s’est passé votre mariage — ce que personne n’a photographié ?', 'Que vous reste-t-il du jour où votre premier enfant est né ?', 'Comment vouliez-vous que soit votre foyer, et l’a-t-il été ?'] },
            es: { heading: 'Amor y familia', prompt: 'Cómo conociste a la persona con quien construiste tu vida, el hogar que formaste, los hijos, o la familia que elegiste.', questions: ['¿Cómo fue el primer encuentro? ¿Qué pensaste aquella vez?', '¿Cómo fue el día de tu boda: la parte que nadie fotografió?', '¿Qué recuerdas del día en que nació tu primer hijo?', '¿Cómo querías que fuera tu hogar, y lo fue?'] },
            ja: { heading: '出会いと家族', prompt: '人生をともにした方との出会い、築いた家庭、お子さんのこと。あるいは、自分で選びとった家族のこと。', questions: ['どのように出会いましたか？　お見合いでも、恋愛でも。第一印象はどうでしたか？', '結婚式の日はどんな一日でしたか？　写真に残っていない部分を。', '最初のお子さんが生まれた日のことで、覚えていることは？', 'どんな家庭を築きたいと思っていましたか？　そうなりましたか？'] },
        }),
        chapter('work', {
            en: { heading: 'Work', prompt: 'What you did for a living, what you were proud of, and what you learned from it.', questions: ['What was your first job, and your first pay?', 'What were you best at?', 'Who taught you the most at work?', 'Is there something you made or did that is still there today?'] },
            he: { heading: 'עבודה', prompt: 'במה עבדתם, במה התגאיתם, ומה למדתם מזה.', questions: ['מה הייתה העבודה הראשונה שלכם, והמשכורת הראשונה?', 'במה הייתם הכי טובים?', 'מי לימד אתכם הכי הרבה בעבודה?', 'יש משהו שבניתם או עשיתם שעדיין קיים היום?'] },
            ar: { heading: 'العمل', prompt: 'ماذا كان عملك، وما الذي اعتززت به، وما الذي تعلمته منه.', questions: ['ما أول عمل لك، وأول أجر قبضته؟', 'في أي شيء كنت الأبرع؟', 'من علّمك أكثر من غيره في العمل؟', 'هل هناك شيء صنعته أو أنجزته ما زال قائمًا إلى اليوم؟'] },
            de: { heading: 'Arbeitsleben', prompt: 'Womit Sie Ihren Lebensunterhalt verdient haben, worauf Sie stolz waren und was Sie dabei gelernt haben.', questions: ['Was war Ihre erste Arbeit, und wie hoch war Ihr erster Lohn?', 'Was konnten Sie am besten?', 'Wer hat Ihnen bei der Arbeit am meisten beigebracht?', 'Gibt es etwas, das Sie geschaffen oder getan haben und das es heute noch gibt?'] },
            fr: { heading: 'Le travail', prompt: 'Ce que vous avez fait pour gagner votre vie, ce qui a fait votre fierté, et ce que cela vous a appris.', questions: ['Quel a été votre premier emploi, et votre première paye ?', 'Dans quoi excelliez-vous ?', 'Qui vous a le plus appris au travail ?', 'Avez-vous fait ou bâti quelque chose qui existe encore aujourd’hui ?'] },
            es: { heading: 'Trabajo', prompt: 'En qué trabajaste, lo que te llenó de orgullo y lo que aprendiste.', questions: ['¿Cuál fue tu primer trabajo, y tu primer sueldo?', '¿Qué hacías mejor que nadie?', '¿Quién te enseñó más en el trabajo?', '¿Hay algo que hiciste o construiste que siga ahí hoy?'] },
            ja: { heading: '仕事', prompt: '生業としてきたこと、誇りに思っていること、そこから学んだこと。', questions: ['最初の仕事は何でしたか？　初めてのお給料は？', 'いちばん得意だったことは何ですか？', '仕事で、いちばん多くを教えてくれた人は誰ですか？', '手がけたもので、今も残っているものはありますか？'] },
        }),
        chapter('places', {
            en: { heading: 'Homes and places', prompt: 'The places you lived and the journeys you made — and the one that felt most like home.', questions: ['Which place felt most like home, and why?', 'What journey changed the way you saw things?', 'Is there a place you would go back to tomorrow?'] },
            he: { heading: 'בתים ומקומות', prompt: 'המקומות שבהם גרתם והמסעות שעשיתם — וזה שהכי הרגיש בית.', questions: ['איזה מקום הכי הרגיש בית, ולמה?', 'איזה מסע שינה את הדרך שבה ראיתם דברים?', 'יש מקום שהייתם חוזרים אליו מחר?'] },
            ar: { heading: 'البيوت والأماكن', prompt: 'الأماكن التي عشت فيها والرحلات التي قمت بها — وأيّها كان الأقرب إلى معنى البيت.', questions: ['أيّ مكان كان الأقرب إلى معنى البيت، ولماذا؟', 'أيّ رحلة غيّرت نظرتك إلى الأمور؟', 'هل هناك مكان تعود إليه غدًا لو استطعت؟'] },
            de: { heading: 'Orte meines Lebens', prompt: 'Die Orte, an denen Sie gelebt haben, und die Reisen, die Sie gemacht haben – und der Ort, der sich am meisten nach Zuhause anfühlte.', questions: ['Welcher Ort war am meisten ein Zuhause, und warum?', 'Welche Reise hat Ihren Blick auf die Dinge verändert?', 'Gibt es einen Ort, an den Sie morgen zurückkehren würden?'] },
            fr: { heading: 'Les lieux de ma vie', prompt: 'Les lieux où vous avez vécu, les voyages que vous avez faits — et celui qui a été le plus un chez-vous.', questions: ['Quel lieu a été le plus un chez-vous, et pourquoi ?', 'Quel voyage a changé votre regard sur les choses ?', 'Y a-t-il un endroit où vous retourneriez dès demain ?'] },
            es: { heading: 'Casas y lugares', prompt: 'Los lugares donde viviste y los viajes que hiciste, y aquel que más sentiste como tu hogar.', questions: ['¿Qué lugar sentiste más como tu hogar, y por qué?', '¿Qué viaje cambió tu manera de ver las cosas?', '¿Hay algún lugar al que volverías mañana mismo?'] },
            ja: { heading: '暮らした場所', prompt: '暮らした土地、出かけた旅。そして、いちばん「わが家」と感じた場所。', questions: ['いちばん「わが家」と感じたのはどこですか？　なぜでしょう？', 'ものの見方を変えた旅はありますか？', '明日にでも戻りたい場所はありますか？'] },
        }),
        chapter('hard', {
            en: { heading: 'Hard times', prompt: 'Losses, wars, illness, failures — whatever you are willing to tell, and what carried you through. Skip this chapter if you wish.', questions: ['What was the hardest time of your life?', 'Who stood by you then?', 'What did it teach you that you could not have learned otherwise?'] },
            he: { heading: 'תקופות קשות', prompt: 'אובדן, מלחמות, מחלה, כישלונות — מה שאתם מוכנים לספר, ומה החזיק אתכם. אפשר לדלג על הפרק הזה.', questions: ['מה הייתה התקופה הכי קשה בחייכם?', 'מי עמד לצדכם אז?', 'מה זה לימד אתכם, שלא הייתם לומדים אחרת?'] },
            ar: { heading: 'الأوقات الصعبة', prompt: 'الفقد والحروب والمرض والإخفاقات — ما تقبل أن ترويه منها، وما الذي أعانك على تجاوزها. يمكنك تخطّي هذا الفصل إن شئت.', questions: ['ما أصعب فترة مرت بك في حياتك؟', 'من وقف إلى جانبك حينها؟', 'ماذا علّمتك مما لم تكن لتتعلمه بطريقة أخرى؟'] },
            de: { heading: 'Schwere Zeiten', prompt: 'Verluste, Kriege, Krankheit, Scheitern – was immer Sie erzählen möchten, und was Sie getragen hat. Wenn Sie möchten, überspringen Sie dieses Kapitel.', questions: ['Was war die schwerste Zeit Ihres Lebens?', 'Wer stand Ihnen damals zur Seite?', 'Was hat Sie diese Zeit gelehrt, das Sie anders nicht hätten lernen können?'] },
            fr: { heading: 'Les épreuves', prompt: 'Deuils, guerres, maladie, échecs — ce que vous voulez bien raconter, et ce qui vous a permis de tenir. Passez ce chapitre si vous le souhaitez.', questions: ['Quelle a été la période la plus dure de votre vie ?', 'Qui a été là pour vous à ce moment-là ?', 'Qu’est-ce que cela vous a appris, que vous n’auriez pas pu apprendre autrement ?'] },
            es: { heading: 'Tiempos difíciles', prompt: 'Pérdidas, guerras, enfermedad, fracasos: lo que quieras contar, y lo que te sostuvo. Si lo prefieres, salta este capítulo.', questions: ['¿Cuál fue la época más dura de tu vida?', '¿Quién estuvo a tu lado entonces?', '¿Qué te enseñó que no habrías podido aprender de otro modo?'] },
            ja: { heading: 'つらかった時期', prompt: '大切な人との別れ、戦争や災害、病気、挫折。書いてもよいと思えることだけを。そして、何が支えになったのかを。この章は飛ばしてもかまいません。', questions: ['人生でいちばんつらかったのはいつですか？', 'そのとき、そばにいてくれたのは誰ですか？', 'その経験でしか学べなかったことは何ですか？'] },
        }),
        chapter('values', {
            en: { heading: 'What I believe', prompt: 'Faith, values, the things you hold to and the things you changed your mind about.', questions: ['What do you believe today that you did not believe at twenty?', 'Which tradition from home do you keep, and why?', 'What would you never compromise on?'] },
            he: { heading: 'האמונות שלי', prompt: 'אמונה, ערכים, הדברים שאתם מחזיקים בהם והדברים שעליהם שיניתם את דעתכם.', questions: ['במה אתם מאמינים היום שלא האמנתם בו בגיל עשרים?', 'איזה מנהג מהבית אתם שומרים, ולמה?', 'על מה לא הייתם מוותרים לעולם?'] },
            ar: { heading: 'ما أؤمن به', prompt: 'الإيمان والقيم، وما تمسكت به وما غيّرت رأيك فيه.', questions: ['بماذا تؤمن اليوم ولم تكن تؤمن به في العشرين؟', 'أيّ عادة من بيت أهلك ما زلت تحافظ عليها، ولماذا؟', 'ما الذي لا تقبل المساومة عليه أبدًا؟'] },
            de: { heading: 'Woran ich glaube', prompt: 'Glaube, Werte, woran Sie festhalten und worüber Sie Ihre Meinung geändert haben.', questions: ['Was glauben Sie heute, das Sie mit zwanzig nicht geglaubt haben?', 'Welche Tradition aus Ihrem Elternhaus pflegen Sie noch, und warum?', 'Worin würden Sie niemals Kompromisse machen?'] },
            fr: { heading: 'Ce que je crois', prompt: 'La foi, les valeurs, ce à quoi vous tenez et ce sur quoi vous avez changé d’avis.', questions: ['Que croyez-vous aujourd’hui que vous ne croyiez pas à vingt ans ?', 'Quelle tradition de la maison gardez-vous, et pourquoi ?', 'Sur quoi ne transigeriez-vous jamais ?'] },
            es: { heading: 'En qué creo', prompt: 'La fe, los valores, aquello a lo que te aferras y aquello sobre lo que cambiaste de opinión.', questions: ['¿Qué crees hoy que no creías a los veinte años?', '¿Qué tradición de tu casa conservas, y por qué?', '¿En qué no cederías nunca?'] },
            ja: { heading: '大切にしていること', prompt: '信仰や信条、価値観。持ち続けてきたことと、考えが変わったこと。', questions: ['二十歳のころは信じていなかったのに、今は信じていることは何ですか？', '家から受け継いだしきたりで、今も続けているものはありますか？　なぜでしょう？', 'これだけは譲れないということは何ですか？'] },
        }),
        chapter('today', {
            en: { heading: 'Today', prompt: 'Your life now: a day in it, the people around you, what gives it meaning.', questions: ['What does an ordinary day look like now?', 'What are you most grateful for?', 'What do you still want to do?'] },
            he: { heading: 'היום', prompt: 'החיים שלכם עכשיו: יום אחד מהם, האנשים סביבכם, מה נותן להם משמעות.', questions: ['איך נראה יום רגיל עכשיו?', 'על מה אתם הכי אסירי תודה?', 'מה עוד הייתם רוצים לעשות?'] },
            ar: { heading: 'اليوم', prompt: 'حياتك الآن: يوم منها، والناس من حولك، وما يمنحها معنى.', questions: ['كيف يبدو يوم عادي الآن؟', 'ما أكثر ما يملؤك امتنانًا؟', 'ما الذي ما زال في نفسك أن تفعله؟'] },
            de: { heading: 'Heute', prompt: 'Ihr Leben jetzt: ein Tag daraus, die Menschen um Sie herum, was ihm Sinn gibt.', questions: ['Wie sieht ein ganz gewöhnlicher Tag jetzt aus?', 'Wofür sind Sie am dankbarsten?', 'Was möchten Sie noch tun?'] },
            fr: { heading: 'Aujourd’hui', prompt: 'Votre vie maintenant : une journée, les gens autour de vous, ce qui lui donne un sens.', questions: ['À quoi ressemble une journée ordinaire aujourd’hui ?', 'Qu’est-ce qui vous inspire le plus de gratitude ?', 'Que voulez-vous faire encore ?'] },
            es: { heading: 'Hoy', prompt: 'Tu vida ahora: un día cualquiera, la gente que te rodea, lo que le da sentido.', questions: ['¿Cómo es ahora un día normal?', '¿Qué es lo que más agradeces?', '¿Qué quieres hacer todavía?'] },
            ja: { heading: 'いま', prompt: '今の暮らし。ある一日のこと、まわりの人たち、生きがいになっていること。', questions: ['ふだんの一日はどんなふうですか？', 'いちばんありがたいと感じているのは何ですか？', 'これからまだやってみたいことは何ですか？'] },
        }),
        {
            id: 'letter',
            level: 2,
            target: { min: 100, max: 1000 },
            text: {
                en: { heading: 'A letter to those who come after me', prompt: 'Speak to them directly: your children, grandchildren, the ones you will not meet.', questions: ['What do you hope they will take from your life?', 'What do you want to say that you have never said aloud?'] },
                he: { heading: 'מכתב לבאים אחריי', prompt: 'דברו אליהם ישירות: הילדים, הנכדים, אלה שלא תפגשו.', questions: ['מה הייתם רוצים שייקחו מהחיים שלכם?', 'מה תרצו לומר שמעולם לא אמרתם בקול?'] },
                ar: { heading: 'رسالة إلى من يأتون بعدي', prompt: 'خاطبهم مباشرة: أبناءك وأحفادك، ومن لن تلتقي بهم.', questions: ['ماذا تأمل أن يأخذوا من حياتك؟', 'ما الذي تود أن تقوله ولم تقله بصوت عالٍ قط؟'] },
                de: { heading: 'Brief an die, die nach mir kommen', prompt: 'Sprechen Sie sie direkt an: Ihre Kinder, Ihre Enkel, die, denen Sie nicht mehr begegnen werden.', questions: ['Was sollen sie aus Ihrem Leben mitnehmen?', 'Was möchten Sie sagen, das Sie noch nie laut ausgesprochen haben?'] },
                fr: { heading: 'Lettre à ceux qui viendront après moi', prompt: 'Adressez-vous directement à eux : vos enfants, vos petits-enfants, ceux que vous ne connaîtrez pas.', questions: ['Qu’espérez-vous qu’ils retiendront de votre vie ?', 'Que voudriez-vous dire, que vous n’avez jamais dit à voix haute ?'] },
                es: { heading: 'Carta a quienes vendrán después', prompt: 'Háblales directamente: tus hijos, tus nietos, quienes no llegarás a conocer.', questions: ['¿Qué esperas que se lleven de tu vida?', '¿Qué quieres decir que nunca hayas dicho en voz alta?'] },
                ja: { heading: 'あとに続く人たちへの手紙', prompt: '語りかけるように書いてみてください。お子さん、お孫さん、会うことのない人たちへ。', questions: ['ご自身の人生から、何を受け取ってほしいですか？', 'これまで口に出して言えなかったことで、伝えたいことは何ですか？'] },
            },
        },
    ],
};

const LANGUAGES: TemplateLanguage[] = ['en', 'he', 'ar', 'de', 'fr', 'es', 'ja'];

/**
 * The same life story a question at a time: a file for each question, and a
 * weekly goal — nobody has to sit down to a chapter, only to this week's
 * question. Made from the chapters above, so it says what they say.
 */
function questionNodes(chapter: NodeDef): NodeDef[] {
    const count = chapter.text.en?.questions?.length ?? 0;
    if (!count) return [{ ...chapter, id: chapter.id }];
    return Array.from({ length: count }, (_, k) => {
        const text: Localized<NodeText> = {};
        for (const language of LANGUAGES) {
            const own = chapter.text[language];
            if (own?.questions?.[k]) text[language] = { heading: own.questions[k], prompt: `${own.heading}: ${own.prompt}` };
        }
        return { id: `${chapter.id}-${k + 1}`, level: 2 as const, target: { min: 50, max: 1500 }, text, checks: chapter.checks };
    });
}

export const lifeStoryWeekly: TemplateDef = {
    schema: 1,
    id: 'life.weekly',
    version: '1.0.0',
    source: 'bundled',
    family: 'life',
    perFile: true,
    weekly: 1,
    info: {
        en: { title: 'A life story, a question a week', description: 'One question, one file, one week at a time: the panel keeps count and takes you to the next question. Short answers are fine; in a year it is a book.', file: 'My story' },
        he: { title: 'סיפור חיים, שאלה בשבוע', description: 'שאלה אחת, קובץ אחד, שבוע אחד בכל פעם: הלוח סופר ומוביל לשאלה הבאה. תשובות קצרות זה בסדר; בתוך שנה זה ספר.', file: 'הסיפור שלי' },
        ar: { title: 'قصة حياة، سؤال كل أسبوع', description: 'سؤال واحد وملف واحد وأسبوع واحد في كل مرة: تتولى اللوحة العدّ وتأخذك إلى السؤال التالي. الإجابات القصيرة لا بأس بها؛ وبعد عام يصبح لديك كتاب.', file: 'قصتي' },
        de: { title: 'Lebensgeschichte, eine Frage pro Woche', description: 'Eine Frage, eine Datei, eine Woche nach der anderen: Die Leiste zählt mit und führt Sie zur nächsten Frage. Kurze Antworten genügen; nach einem Jahr ist es ein Buch.', file: 'Meine Geschichte' },
        fr: { title: 'Récit de vie, une question par semaine', description: 'Une question, un fichier, une semaine à la fois : le panneau tient le compte et vous mène à la question suivante. Les réponses courtes suffisent ; en un an, c’est un livre.', file: 'Mon histoire' },
        es: { title: 'Tu historia de vida, una pregunta por semana', description: 'Una pregunta, un archivo, una semana cada vez: el panel lleva la cuenta y te lleva a la siguiente pregunta. Bastan respuestas cortas; en un año es un libro.', file: 'Mi historia' },
        ja: { title: '自分史、週にひとつの問い', description: '一つの問いに一つのファイル、一週間に一つずつ。パネルが数を記録し、次の問いへ案内します。短い答えで構いません。一年で一冊の本になります。', file: '自分史' },
    },
    nodes: lifeStory.nodes.flatMap(questionNodes),
};
