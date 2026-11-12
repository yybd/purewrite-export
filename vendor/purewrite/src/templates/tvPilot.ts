import type { Localized, NodeDef, NodeText, TemplateDef } from './types';

/**
 * The outline of a one-hour drama pilot: what the series is, then a teaser,
 * five acts and a tag, each ending on its act-out. The landing pages are a
 * network hour of about 55 pages and are provisional — a streaming hour runs
 * without act breaks, and these should be checked against real pilots before
 * the template is sold on them.
 */

function act(id: string, position: number, text: Localized<NodeText>): NodeDef {
    return {
        id,
        level: 2,
        position,
        target: { min: 100, max: 600 },
        text,
        checks: [{
            id: 'act-out',
            text: {
                en: 'Ends on a turn that makes us stay',
                he: 'נגמר בתפנית שמשאירה אותנו',
                ar: 'ينتهي بمنعطف يشدّنا إلى ما بعده',
                de: 'Endet mit einer Wendung, die uns dranbleiben lässt',
                fr: 'Se termine sur un retournement qui nous retient',
                es: 'Termina con un giro que nos obliga a seguir viendo',
                ja: '視聴者を次へ引っぱる「引き」で終わっている',
            },
        }],
    };
}

export const tvPilot: TemplateDef = {
    schema: 1,
    id: 'screen.tv-pilot',
    version: '1.0.0',
    source: 'bundled',
    family: 'screenplay',
    info: {
        en: {
            title: 'TV drama pilot — US network hour',
            description: 'The American network hour, built around ad breaks: the series in a page, then a teaser, five acts and a tag, and the page each act usually breaks on.',
            file: 'Pilot outline',
        },
        he: {
            title: 'פיילוט לדרמה — שעה ברשת אמריקאית',
            description: 'השעה של רשת אמריקאית, הבנויה סביב הפסקות פרסומות: הסדרה בעמוד, ואז טיזר, חמש מערכות ותג, והעמוד שבו כל מערכה נשברת בדרך כלל.',
            file: 'מתווה פיילוט',
        },
        ar: {
            title: 'حلقة تجريبية لمسلسل درامي — ساعة على الطريقة الأمريكية',
            description: 'ساعة الشبكات الأمريكية المبنية حول الفواصل الإعلانية: المسلسل في صفحة، ثم المقدمة التشويقية وخمسة فصول ومشهد ختامي، والصفحة التي ينتهي عندها كل فصل عادةً.',
            file: 'مخطط الحلقة التجريبية',
        },
        de: {
            title: 'Pilotfolge einer Dramaserie – US-Network, 60 Minuten',
            description: 'Die Stunde des US-Networkfernsehens, um Werbepausen gebaut: die Serie auf einer Seite, dann Teaser, fünf Akte und Tag, und die Seite, auf der jeder Akt meist endet.',
            file: 'Pilot-Outline',
        },
        fr: {
            title: 'Pilote de série dramatique — format network américain',
            description: 'L’heure des networks américains, construite autour des coupures publicitaires\u00a0: la série en une page, puis un teaser, cinq actes et un tag, et la page où chaque acte se termine d’habitude.',
            file: 'Séquencier du pilote',
        },
        es: {
            title: 'Piloto de serie dramática — formato de cadena estadounidense',
            description: 'La hora de las cadenas estadounidenses, construida en torno a las pausas publicitarias: la serie en una página; luego el teaser, cinco actos y el epílogo, y la página en la que suele cortar cada acto.',
            file: 'Escaleta del piloto',
        },
        ja: {
            title: '連続ドラマのパイロット版（米国ネットワーク型・1時間）',
            description: 'CM枠を軸に組み立てる米国ネットワークの1時間ドラマ。シリーズの全体像を1ページで。続いてアバン、五つの幕、エピローグと、各幕が切れるおおよそのページ。',
            file: 'パイロット構成案',
        },
    },
    total: { value: 55, unit: 'pages' },
    nodes: [
        {
            id: 'logline',
            level: 2,
            target: { max: 50, hard: true },
            text: {
                en: {
                    heading: 'Logline',
                    prompt: 'One sentence for the series, not the episode: who, in what world, wanting what, against what.',
                    questions: ['Does it promise a hundred episodes, or one?'],
                },
                he: {
                    heading: 'משפט מפתח',
                    prompt: 'משפט אחד לסדרה, לא לפרק: מי, באיזה עולם, רוצה מה, מול מה.',
                    questions: ['הוא מבטיח מאה פרקים, או אחד?'],
                },
                ar: {
                    heading: 'الفكرة في جملة واحدة',
                    prompt: 'جملة واحدة (وتُسمّى «لوغلاين») عن المسلسل لا عن الحلقة: مَن، في أي عالم، يريد ماذا، وفي مواجهة ماذا.',
                    questions: ['هل تَعِد بمئة حلقة، أم بحلقة واحدة؟'],
                },
                de: {
                    heading: 'Logline',
                    prompt: 'Ein Satz zur Serie, nicht zur Folge: wer, in welcher Welt, will was, gegen welchen Widerstand.',
                    questions: ['Verspricht sie hundert Folgen – oder nur eine?'],
                },
                fr: {
                    heading: 'Logline',
                    prompt: 'Une phrase pour la série, pas pour l’épisode\u00a0: qui, dans quel monde, veut quoi, face à quoi.',
                    questions: ['Promet-elle cent épisodes, ou un seul\u00a0?'],
                },
                es: {
                    heading: 'Logline',
                    prompt: 'Una frase para la serie, no para el episodio: quién, en qué mundo, quiere qué y contra qué.',
                    questions: ['¿Promete cien episodios o solo uno?'],
                },
                ja: {
                    heading: 'ログライン',
                    prompt: 'エピソードではなくシリーズを一文で。誰が、どんな世界で、何を求め、何に立ち向かうのか。',
                    questions: ['シリーズ全体を支えられる話ですか？　それとも一話で終わる話ですか？'],
                },
            },
            checks: [
                {
                    id: 'length',
                    auto: { rule: 'within-target' },
                    text: {
                        en: 'One sentence, under 50 words',
                        he: 'משפט אחד, עד 50 מילים',
                        ar: 'جملة واحدة، في أقل من 50 كلمة',
                        de: 'Ein Satz, unter 50 Wörtern',
                        fr: 'Une phrase, moins de 50 mots',
                        es: 'Una sola frase, de menos de 50 palabras',
                        ja: '一文、100字以内',
                    },
                },
            ],
        },
        {
            id: 'engine',
            level: 2,
            target: { min: 150, max: 500 },
            text: {
                en: {
                    heading: 'The series engine',
                    prompt: 'What makes a new story every week: the situation that keeps producing conflict, and what the main character wants across the season.',
                    questions: ['What happens in episode seven?', 'Why can\'t the main character just walk away?'],
                },
                he: {
                    heading: 'המנוע של הסדרה',
                    prompt: 'מה מייצר סיפור חדש כל שבוע: המצב שממשיך להוליד קונפליקט, ומה הדמות הראשית רוצה לאורך העונה.',
                    questions: ['מה קורה בפרק השביעי?', 'למה הדמות הראשית לא יכולה פשוט ללכת?'],
                },
                ar: {
                    heading: 'محرّك المسلسل',
                    prompt: 'ما الذي يولّد قصة جديدة في كل حلقة: الوضع الذي لا يكفّ عن إنتاج الصراع، وما تريده الشخصية الرئيسية على امتداد الموسم.',
                    questions: ['ماذا يحدث في الحلقة السابعة؟', 'لماذا لا تستطيع الشخصية الرئيسية أن تنسحب ببساطة؟'],
                },
                de: {
                    heading: 'Der Serienmotor',
                    prompt: 'Was jede Woche eine neue Geschichte hervorbringt: die Ausgangslage, die immer wieder Konflikte erzeugt, und was die Hauptfigur über die ganze Staffel will.',
                    questions: ['Was passiert in Folge sieben?', 'Warum kann die Hauptfigur nicht einfach gehen?'],
                },
                fr: {
                    heading: 'Le moteur de la série',
                    prompt: 'Ce qui fabrique une nouvelle histoire chaque semaine\u00a0: la situation qui ne cesse de produire du conflit, et ce que veut le personnage principal sur toute la saison.',
                    questions: ['Que se passe-t-il dans l’épisode sept\u00a0?', 'Pourquoi le personnage principal ne peut-il pas simplement partir\u00a0?'],
                },
                es: {
                    heading: 'El motor de la serie',
                    prompt: 'Lo que genera una historia nueva cada semana: la situación que no deja de producir conflicto y lo que quiere el protagonista a lo largo de la temporada.',
                    questions: ['¿Qué pasa en el episodio siete?', '¿Por qué el protagonista no puede simplemente marcharse?'],
                },
                ja: {
                    heading: 'シリーズの仕掛け',
                    prompt: '毎週新しい物語を生み出すもの。葛藤を生み続ける状況と、シーズンを通して主人公が求めるもの。',
                    questions: ['第7話では何が起きますか？', '主人公はなぜ、ただ立ち去ることができないのですか？'],
                },
            },
            checks: [
                {
                    id: 'repeatable',
                    text: {
                        en: 'The engine repeats without the pilot\'s events',
                        he: 'המנוע חוזר גם בלי האירועים של הפיילוט',
                        ar: 'يدور المحرّك من جديد حتى من دون أحداث الحلقة التجريبية',
                        de: 'Der Motor läuft auch ohne die Ereignisse des Pilots weiter',
                        fr: 'Le moteur tourne encore sans les événements du pilote',
                        es: 'El motor funciona sin depender de los hechos del piloto',
                        ja: '第1話の出来事がなくても、毎回の物語が生まれ続けている',
                    },
                },
            ],
        },
        {
            id: 'characters',
            level: 2,
            target: { min: 150, max: 600 },
            text: {
                en: {
                    heading: 'Main characters',
                    prompt: 'A short paragraph for each regular: what they want, what they hide, and who they clash with.',
                    questions: ['Does every regular pull against at least one other?'],
                },
                he: {
                    heading: 'הדמויות הראשיות',
                    prompt: 'פסקה קצרה לכל דמות קבועה: מה היא רוצה, מה היא מסתירה, ועם מי היא מתנגשת.',
                    questions: ['כל דמות קבועה מושכת נגד לפחות אחת אחרת?'],
                },
                ar: {
                    heading: 'الشخصيات الرئيسية',
                    prompt: 'فقرة قصيرة لكل شخصية دائمة: ماذا تريد، وماذا تخفي، ومع مَن تصطدم.',
                    questions: ['هل تشدّ كل شخصية دائمة في اتجاه معاكس لشخصية أخرى على الأقل؟'],
                },
                de: {
                    heading: 'Hauptfiguren',
                    prompt: 'Ein kurzer Absatz zu jeder festen Figur: was sie will, was sie verbirgt und mit wem sie aneinandergerät.',
                    questions: ['Steht jede feste Figur mit mindestens einer anderen im Konflikt?'],
                },
                fr: {
                    heading: 'Personnages principaux',
                    prompt: 'Un court paragraphe pour chaque personnage récurrent\u00a0: ce qu’il veut, ce qu’il cache, et avec qui il entre en conflit.',
                    questions: ['Chaque personnage récurrent est-il en tension avec au moins un autre\u00a0?'],
                },
                es: {
                    heading: 'Personajes principales',
                    prompt: 'Un párrafo breve por cada personaje fijo: qué quiere, qué oculta y con quién choca.',
                    questions: ['¿Cada personaje fijo está enfrentado al menos con otro?'],
                },
                ja: {
                    heading: '主要人物',
                    prompt: 'レギュラー一人ひとりについて短い段落を。何を求め、何を隠し、誰とぶつかるのか。',
                    questions: ['どのレギュラーも、少なくとも一人とは対立していますか？'],
                },
            },
        },
        act('teaser', 0, {
            en: { heading: 'Teaser', prompt: 'The hook before the titles: the world and its tone in a few pages, ending on a question.', questions: ['Would you keep watching after this alone?'] },
            he: { heading: 'טיזר', prompt: 'הפיתיון לפני הכותרות: העולם והטון שלו בכמה עמודים, עד שאלה.', questions: ['היית ממשיך לצפות רק בזכות זה?'] },
            ar: { heading: 'المقدمة التشويقية', prompt: 'ما يشدّ المشاهد قبل الشارة: العالم ونبرته في صفحات قليلة، وينتهي بسؤال.', questions: ['هل يكفي هذا وحده لتواصل المشاهدة؟'] },
            de: { heading: 'Teaser', prompt: 'Der Aufhänger vor dem Vorspann: die Welt und ihr Ton auf wenigen Seiten, am Ende eine offene Frage.', questions: ['Würdest du allein deswegen weiterschauen?'] },
            fr: { heading: 'Teaser', prompt: 'L’accroche avant le générique\u00a0: le monde et son ton en quelques pages, pour finir sur une question.', questions: ['Rien qu’avec cette scène, auriez-vous envie de voir la suite\u00a0?'] },
            es: { heading: 'Teaser', prompt: 'El gancho antes de los créditos: el mundo y su tono en pocas páginas, y una pregunta abierta al final.', questions: ['¿Seguirías viendo solo por esto?'] },
            ja: { heading: 'アバン', prompt: 'タイトル前のつかみ。数ページで世界観とトーンを見せ、問いを残して終える。', questions: ['これだけで続きを見たくなりますか？'] },
        }),
        act('act1', 0.07, {
            en: { heading: 'Act One', prompt: 'The main character\'s normal, and the problem of this episode landing in it.', questions: ['Do we know what the episode is about by the act-out?'] },
            he: { heading: 'מערכה ראשונה', prompt: 'השגרה של הדמות הראשית, והבעיה של הפרק הזה שנוחתת לתוכה.', questions: ['ביציאה מהמערכה כבר ברור על מה הפרק?'] },
            ar: { heading: 'الفصل الأول', prompt: 'الحياة المعتادة للشخصية الرئيسية، ومشكلة هذه الحلقة وهي تقتحمها.', questions: ['هل نعرف عند نهاية الفصل عمّ تدور الحلقة؟'] },
            de: { heading: 'Erster Akt', prompt: 'Der Alltag der Hauptfigur – und das Problem dieser Folge, das darin einschlägt.', questions: ['Wissen wir am Aktende, worum es in der Folge geht?'] },
            fr: { heading: 'Acte un', prompt: 'Le quotidien du personnage principal, et le problème de cet épisode qui vient s’y abattre.', questions: ['À la fin de l’acte, sait-on de quoi parle l’épisode\u00a0?'] },
            es: { heading: 'Primer acto', prompt: 'La rutina del protagonista y el problema de este episodio, que irrumpe en ella.', questions: ['Al cierre del acto, ¿sabemos de qué trata el episodio?'] },
            ja: { heading: '第一幕', prompt: '主人公の日常と、そこに降りかかるこのエピソードの問題。', questions: ['幕切れまでに、このエピソードが何の話か分かりますか？'] },
        }),
        act('act2', 0.27, {
            en: { heading: 'Act Two', prompt: 'The first attempt, and why it does not work.', questions: ['Is a second story line started here?'] },
            he: { heading: 'מערכה שנייה', prompt: 'הניסיון הראשון, ולמה הוא לא מצליח.', questions: ['קו עלילה שני מתחיל כאן?'] },
            ar: { heading: 'الفصل الثاني', prompt: 'المحاولة الأولى، ولماذا لا تنجح.', questions: ['هل يبدأ هنا خط قصصي ثانٍ؟'] },
            de: { heading: 'Zweiter Akt', prompt: 'Der erste Versuch – und warum er scheitert.', questions: ['Beginnt hier ein zweiter Handlungsstrang?'] },
            fr: { heading: 'Acte deux', prompt: 'La première tentative, et pourquoi elle échoue.', questions: ['Une intrigue secondaire démarre-t-elle ici\u00a0?'] },
            es: { heading: 'Segundo acto', prompt: 'El primer intento y por qué no funciona.', questions: ['¿Arranca aquí una segunda trama?'] },
            ja: { heading: '第二幕', prompt: '最初の試みと、それがうまくいかない理由。', questions: ['ここで二本目の筋（サブプロット）が動き出しますか？'] },
        }),
        act('act3', 0.45, {
            en: { heading: 'Act Three', prompt: 'The middle turn: something revealed that changes what the episode is about.', questions: ['What does the audience know now that the characters do not?'] },
            he: { heading: 'מערכה שלישית', prompt: 'התפנית באמצע: משהו נחשף ומשנה על מה הפרק.', questions: ['מה הצופה יודע עכשיו שהדמויות לא?'] },
            ar: { heading: 'الفصل الثالث', prompt: 'التحوّل في المنتصف: شيء يُكشف فيغيّر ما تدور حوله الحلقة.', questions: ['ماذا يعرف المشاهد الآن ولا تعرفه الشخصيات؟'] },
            de: { heading: 'Dritter Akt', prompt: 'Die Wende in der Mitte: Etwas kommt ans Licht und verändert, worum es in der Folge geht.', questions: ['Was weiß das Publikum jetzt, was die Figuren nicht wissen?'] },
            fr: { heading: 'Acte trois', prompt: 'Le retournement du milieu\u00a0: une révélation qui change le sujet de l’épisode.', questions: ['Que sait maintenant le public que les personnages ignorent\u00a0?'] },
            es: { heading: 'Tercer acto', prompt: 'El giro central: algo sale a la luz y cambia de qué trata el episodio.', questions: ['¿Qué sabe ahora el público que los personajes no saben?'] },
            ja: { heading: '第三幕', prompt: '中盤の転換。何かが明かされ、このエピソードが何の話なのかが変わる。', questions: ['登場人物は知らず、視聴者だけが今知っていることは何ですか？'] },
        }),
        act('act4', 0.64, {
            en: { heading: 'Act Four', prompt: 'Everything goes wrong; the lines of the episode collide.', questions: ['Is the main character choosing, or only reacting?'] },
            he: { heading: 'מערכה רביעית', prompt: 'הכול משתבש; קווי העלילה של הפרק מתנגשים.', questions: ['הדמות הראשית בוחרת, או רק מגיבה?'] },
            ar: { heading: 'الفصل الرابع', prompt: 'كل شيء يسوء، وتتصادم الخطوط القصصية للحلقة.', questions: ['هل تختار الشخصية الرئيسية، أم تكتفي بردّ الفعل؟'] },
            de: { heading: 'Vierter Akt', prompt: 'Alles geht schief; die Handlungsstränge der Folge prallen aufeinander.', questions: ['Trifft die Hauptfigur Entscheidungen, oder reagiert sie nur?'] },
            fr: { heading: 'Acte quatre', prompt: 'Tout dérape\u00a0; les intrigues de l’épisode entrent en collision.', questions: ['Le personnage principal choisit-il, ou ne fait-il que réagir\u00a0?'] },
            es: { heading: 'Cuarto acto', prompt: 'Todo sale mal; las tramas del episodio chocan entre sí.', questions: ['¿El protagonista elige o solo reacciona?'] },
            ja: { heading: '第四幕', prompt: 'すべてが裏目に出て、エピソードの筋同士がぶつかり合う。', questions: ['主人公は自ら選んでいますか？　それとも、反応しているだけですか？'] },
        }),
        act('act5', 0.82, {
            en: { heading: 'Act Five', prompt: 'The episode\'s problem resolved — and the series\' problem opened wider.', questions: ['What is settled, and what is left for next week?'] },
            he: { heading: 'מערכה חמישית', prompt: 'הבעיה של הפרק נפתרת — והבעיה של הסדרה נפתחת רחב יותר.', questions: ['מה נסגר, ומה נשאר לשבוע הבא?'] },
            ar: { heading: 'الفصل الخامس', prompt: 'تُحلّ مشكلة الحلقة — وتتّسع مشكلة المسلسل أكثر.', questions: ['ما الذي حُسم، وما الذي بقي للحلقة القادمة؟'] },
            de: { heading: 'Fünfter Akt', prompt: 'Das Problem der Folge ist gelöst – und das der Serie reißt weiter auf.', questions: ['Was ist geklärt, und was bleibt für nächste Woche?'] },
            fr: { heading: 'Acte cinq', prompt: 'Le problème de l’épisode se résout — et celui de la série prend de l’ampleur.', questions: ['Qu’est-ce qui est réglé, et que reste-t-il pour la semaine prochaine\u00a0?'] },
            es: { heading: 'Quinto acto', prompt: 'El problema del episodio se resuelve, y el de la serie se abre todavía más.', questions: ['¿Qué queda resuelto y qué se deja para la semana que viene?'] },
            ja: { heading: '第五幕', prompt: 'エピソードの問題は解決し、シリーズの問題はさらに大きく開く。', questions: ['何が決着し、何が次回に持ち越されますか？'] },
        }),
        {
            id: 'tag',
            level: 2,
            position: 0.98,
            target: { max: 200 },
            text: {
                en: {
                    heading: 'Tag',
                    prompt: 'A last short scene: the twist, the cliffhanger or the quiet image that sends us to episode two.',
                },
                he: {
                    heading: 'תג',
                    prompt: 'סצנה קצרה אחרונה: הטוויסט, הצוק או התמונה השקטה ששולחים אותנו לפרק השני.',
                },
                ar: {
                    heading: 'المشهد الختامي',
                    prompt: 'مشهد قصير أخير: المفاجأة، أو النهاية المعلّقة، أو الصورة الهادئة التي تأخذنا إلى الحلقة الثانية.',
                },
                de: {
                    heading: 'Tag',
                    prompt: 'Eine letzte kurze Szene: der Twist, der Cliffhanger oder das stille Bild, das Lust auf Folge zwei macht.',
                },
                fr: {
                    heading: 'Tag',
                    prompt: 'Une dernière scène courte\u00a0: le rebondissement, le cliffhanger ou l’image tout en retenue qui nous mène à l’épisode deux.',
                },
                es: {
                    heading: 'Epílogo (tag)',
                    prompt: 'Una última escena breve: el giro, el cliffhanger o la imagen serena que nos lleva al segundo episodio.',
                },
                ja: {
                    heading: 'エピローグ',
                    prompt: '最後の短いシーン。どんでん返し、クリフハンガー、あるいは第2話へと誘う静かな画。',
                },
            },
        },
    ],
};
