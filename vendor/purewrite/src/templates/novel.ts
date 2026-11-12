import type { Localized, NodeDef, NodeText, TemplateDef } from './types';

/**
 * A novel's structure, three ways — three acts, eight sequences, the hero's
 * journey — over the same kind of document, so a writer can move a project
 * from one to another (Structure ▸ switch) without touching what they wrote.
 * A novel has no set length in pages, so each beat says where it usually
 * lands as a share of the book. The beats are the common craft vocabulary
 * under plain names; none of them is anyone's trademark.
 *
 * Beside them, two small templates a novelist keeps many of: the scene card
 * (goal, conflict, outcome) and the character card.
 */

const PREMISE: Localized<NodeText> = {
    en: { heading: 'Premise', prompt: 'One or two sentences: who wants what, what stands in the way, and what it costs to fail.', questions: ['Is the main character active — do they choose?', 'Would a stranger know the genre from this alone?'] },
    he: { heading: 'הנחת היסוד', prompt: 'משפט או שניים: מי רוצה מה, מה עומד בדרכו, ומה המחיר אם ייכשל.', questions: ['הדמות הראשית פעילה — היא בוחרת?', 'האם זר ידע מה הז\'אנר רק מזה?'] },
    ar: { heading: 'الفكرة الأساسية', prompt: 'جملة أو جملتان: من يريد ماذا، وما الذي يقف في طريقه، وما الثمن إن فشل.', questions: ['هل الشخصية الرئيسية فاعلة — هل تختار بنفسها؟', 'هل يعرف غريبٌ نوع الرواية من هذا وحده؟'] },
    de: { heading: 'Prämisse', prompt: 'Ein oder zwei Sätze: Wer will was, was steht im Weg – und was steht auf dem Spiel, wenn die Figur scheitert?', questions: ['Ist die Hauptfigur aktiv – trifft sie eigene Entscheidungen?', 'Würde jemand, der das Projekt nicht kennt, allein daran das Genre erkennen?'] },
    fr: { heading: 'Concept', prompt: 'Une ou deux phrases : qui veut quoi, ce qui l’en empêche, et ce que l’échec lui coûterait.', questions: ['Le personnage principal est-il actif — fait-il des choix ?', 'Un inconnu devinerait-il le genre à partir de cela seul ?'] },
    es: { heading: 'Premisa', prompt: 'Una o dos frases: quién quiere qué, qué se lo impide y qué pierde si fracasa.', questions: ['¿Es activo el protagonista? ¿Toma sus propias decisiones?', '¿Un desconocido adivinaría el género solo con esto?'] },
    ja: { heading: 'コンセプト', prompt: '一、二文で。誰が何を望み、何がそれを阻み、失敗すれば何を失うのか。', questions: ['主人公は能動的ですか？　自分で選んでいますか？', 'これだけで、初めて読む人にジャンルが伝わりますか？'] },
};

const TURNS: Localized = {
    en: 'Something changes that cannot be undone',
    he: 'משהו משתנה ואי אפשר להחזיר אותו',
    ar: 'يتغيّر شيء لا رجعة فيه',
    de: 'Etwas ändert sich, das sich nicht rückgängig machen lässt',
    fr: 'Quelque chose change, et c’est irréversible',
    es: 'Algo cambia y ya no tiene vuelta atrás',
    ja: '取り返しのつかない変化が起きる',
};

function premise(): NodeDef {
    return { id: 'premise', level: 2, target: { max: 60, hard: true }, text: PREMISE };
}

function part(id: string, text: Localized<NodeText>): NodeDef {
    return { id, level: 2, text };
}

function beat(id: string, position: number, text: Localized<NodeText>, turn = false): NodeDef {
    return { id, level: 3, position, target: { min: 30, max: 400 }, text, ...(turn ? { checks: [{ id: 'turn', text: TURNS }] } : {}) };
}

export const novelThreeActs: TemplateDef = {
    schema: 1,
    id: 'fiction.novel-3-acts',
    version: '1.0.0',
    source: 'bundled',
    family: 'fiction',
    info: {
        en: { title: 'Novel — three acts', description: 'The classic shape: a beginning that sets up, a long middle that tests, an end that pays off — and the turns between them, with where each usually falls.', file: 'Novel outline' },
        he: { title: 'רומן — שלוש מערכות', description: 'הצורה הקלאסית: התחלה שמציגה, אמצע ארוך שבוחן, וסוף שפורע — והמפנים שביניהם, עם המקום שבו כל אחד נופל בדרך כלל.', file: 'מתווה רומן' },
        ar: { title: 'رواية — البنية ثلاثية الفصول', description: 'الشكل الكلاسيكي: بداية تمهّد، ووسط طويل يختبر، ونهاية تفي بالوعد — والمنعطفات بينها، مع الموضع الذي يقع فيه كل منها عادةً.', file: 'مخطط الرواية' },
        de: { title: 'Roman – drei Akte', description: 'Die klassische Form: ein Anfang, der aufbaut, eine lange Mitte, die prüft, ein Ende, das einlöst – und die Wendepunkte dazwischen, jeweils mit der Stelle, an der sie üblicherweise liegen.', file: 'Roman-Outline' },
        fr: { title: 'Roman — trois actes', description: 'La forme classique : un début qui installe, un long milieu qui met à l’épreuve, une fin qui tient ses promesses — et les retournements entre eux, avec l’endroit où chacun tombe d’ordinaire.', file: 'Plan du roman' },
        es: { title: 'Novela — tres actos', description: 'La forma clásica: un comienzo que plantea, un largo nudo que pone a prueba, un final que cumple lo prometido, y los giros entre ellos, con el lugar en el que suele caer cada uno.', file: 'Esquema de la novela' },
        ja: { title: '長編小説（三幕構成）', description: '古典的な形。物語を仕込む始まり、主人公を試す長い中盤、約束を果たす結末。そして、その間の転換点と、それぞれが置かれるおおよその位置。', file: '長編小説のプロット' },
    },
    nodes: [
        premise(),
        {
            ...part('act1', {
                en: { heading: 'Act one — setup', prompt: 'The world as it is, the main character in it, and what tips it over.' },
                he: { heading: 'מערכה ראשונה — הצגה', prompt: 'העולם כמו שהוא, הדמות הראשית בתוכו, ומה שמערער אותו.' },
                ar: { heading: 'الفصل الأول — التمهيد', prompt: 'العالم كما هو، والشخصية الرئيسية فيه، وما يُخلّ بتوازنه.' },
                de: { heading: 'Erster Akt – Exposition', prompt: 'Die Welt, wie sie ist, die Hauptfigur darin und das, was sie ins Wanken bringt.' },
                fr: { heading: 'Premier acte — exposition', prompt: 'Le monde tel qu’il est, le personnage principal en son sein, et ce qui fait tout basculer.' },
                es: { heading: 'Primer acto — planteamiento', prompt: 'El mundo tal como es, el protagonista en él y lo que lo desequilibra.' },
                ja: { heading: '第一幕（導入）', prompt: 'ありのままの世界、その中の主人公、そしてそれを揺るがすもの。' },
            }),
            children: [
                beat('opening', 0.01, {
                    en: { heading: 'Opening image', prompt: 'The first scene: the character in their ordinary life, and a hint of what is missing.', questions: ['What does the first page promise?'] },
                    he: { heading: 'תמונת פתיחה', prompt: 'הסצנה הראשונה: הדמות בחיים הרגילים שלה, ורמז למה שחסר.', questions: ['מה העמוד הראשון מבטיח?'] },
                    ar: { heading: 'صورة الافتتاح', prompt: 'المشهد الأول: الشخصية في حياتها المعتادة، وإشارة إلى ما ينقصها.', questions: ['بماذا تَعِد الصفحة الأولى؟'] },
                    de: { heading: 'Eröffnungsbild', prompt: 'Die erste Szene: die Figur in ihrem gewohnten Leben und ein Hinweis darauf, was ihr fehlt.', questions: ['Was verspricht die erste Seite?'] },
                    fr: { heading: 'Image d’ouverture', prompt: 'La première scène : le personnage dans sa vie ordinaire, et un indice de ce qui lui manque.', questions: ['Que promet la première page ?'] },
                    es: { heading: 'Imagen de apertura', prompt: 'La primera escena: el personaje en su vida cotidiana y un indicio de lo que le falta.', questions: ['¿Qué promete la primera página?'] },
                    ja: { heading: 'ファーストシーン', prompt: '最初の場面。日常を生きる主人公と、そこに欠けているものの気配。', questions: ['最初のページは何を約束していますか？'] },
                }),
                beat('inciting', 0.12, {
                    en: { heading: 'Inciting incident', prompt: 'The event that breaks the ordinary and starts the story.', questions: ['Could the story start without it?'] },
                    he: { heading: 'האירוע המחולל', prompt: 'האירוע ששובר את השגרה ומתחיל את הסיפור.', questions: ['הסיפור יכול היה להתחיל בלעדיו?'] },
                    ar: { heading: 'الحدث المحرّك', prompt: 'الحدث الذي يكسر المألوف ويُطلق القصة.', questions: ['هل يمكن أن تبدأ القصة من دونه؟'] },
                    de: { heading: 'Auslösendes Ereignis', prompt: 'Das Ereignis, das den Alltag durchbricht und die Geschichte in Gang setzt.', questions: ['Könnte die Geschichte auch ohne dieses Ereignis beginnen?'] },
                    fr: { heading: 'Élément déclencheur', prompt: 'L’événement qui rompt le quotidien et lance l’histoire.', questions: ['L’histoire pourrait-elle commencer sans lui ?'] },
                    es: { heading: 'Detonante', prompt: 'El suceso que rompe lo cotidiano y pone en marcha la historia.', questions: ['¿Podría empezar la historia sin él?'] },
                    ja: { heading: '発端', prompt: '日常を壊し、物語を始める出来事。', questions: ['この出来事がなくても、物語は始まりますか？'] },
                }, true),
                beat('plot1', 0.25, {
                    en: { heading: 'First turning point', prompt: 'The character commits; there is no going back to how things were.', questions: ['Is it the character\'s own choice?'] },
                    he: { heading: 'נקודת מפנה ראשונה', prompt: 'הדמות מתחייבת; אין חזרה למה שהיה.', questions: ['זו הבחירה של הדמות עצמה?'] },
                    ar: { heading: 'نقطة التحوّل الأولى', prompt: 'الشخصية تلتزم؛ لا عودة إلى ما كان.', questions: ['هل هو اختيار الشخصية نفسها؟'] },
                    de: { heading: 'Erster Wendepunkt', prompt: 'Die Figur legt sich fest; zurück zum alten Leben geht es nicht mehr.', questions: ['Ist es die eigene Entscheidung der Figur?'] },
                    fr: { heading: 'Premier retournement', prompt: 'Le personnage s’engage ; impossible de revenir à ce qui était.', questions: ['Est-ce le choix du personnage lui-même ?'] },
                    es: { heading: 'Primer punto de giro', prompt: 'El personaje se compromete; ya no hay vuelta a lo que era.', questions: ['¿Es una decisión del propio personaje?'] },
                    ja: { heading: '第一のターニングポイント', prompt: '主人公は腹を決める。もう元には戻れない。', questions: ['それは主人公自身の選択ですか？'] },
                }, true),
            ],
        },
        {
            ...part('act2', {
                en: { heading: 'Act two — confrontation', prompt: 'The long middle: attempts, setbacks, and a character slowly changing under pressure.' },
                he: { heading: 'מערכה שנייה — עימות', prompt: 'האמצע הארוך: ניסיונות, כישלונות, ודמות שמשתנה לאט תחת לחץ.' },
                ar: { heading: 'الفصل الثاني — المواجهة', prompt: 'الوسط الطويل: محاولات، وانتكاسات، وشخصية تتغيّر ببطء تحت الضغط.' },
                de: { heading: 'Zweiter Akt – Konfrontation', prompt: 'Die lange Mitte: Versuche, Rückschläge und eine Figur, die sich unter Druck langsam verändert.' },
                fr: { heading: 'Deuxième acte — confrontation', prompt: 'Le long milieu : tentatives, revers, et un personnage qui change peu à peu sous la pression.' },
                es: { heading: 'Segundo acto — confrontación', prompt: 'El largo nudo: intentos, reveses y un personaje que cambia poco a poco bajo presión.' },
                ja: { heading: '第二幕（対立）', prompt: '長い中盤。挑戦と挫折、そして圧力の中で少しずつ変わっていく主人公。' },
            }),
            children: [
                beat('pinch1', 0.375, {
                    en: { heading: 'First pressure', prompt: 'The opposing force shows its strength.' },
                    he: { heading: 'לחץ ראשון', prompt: 'הכוח שמנגד מראה את כוחו.' },
                    ar: { heading: 'الضغط الأول', prompt: 'القوة المعارضة تُظهر بأسها.' },
                    de: { heading: 'Erste Zuspitzung', prompt: 'Die Gegenkraft zeigt ihre Stärke.' },
                    fr: { heading: 'Première pression', prompt: 'La force adverse montre sa puissance.' },
                    es: { heading: 'Primera presión', prompt: 'La fuerza opositora muestra su poder.' },
                    ja: { heading: '第一の圧力', prompt: '敵対する力がその強さを見せつける。' },
                }),
                beat('midpoint', 0.5, {
                    en: { heading: 'Midpoint', prompt: 'A reversal or revelation that changes what the story is about — from running away to running toward.', questions: ['What does the character know now that they did not?'] },
                    he: { heading: 'נקודת האמצע', prompt: 'היפוך או גילוי שמשנה על מה הסיפור — מבריחה לרדיפה.', questions: ['מה הדמות יודעת עכשיו שלא ידעה?'] },
                    ar: { heading: 'نقطة المنتصف', prompt: 'انقلاب أو كشف يغيّر موضوع القصة — من الهرب إلى المطاردة.', questions: ['ما الذي تعرفه الشخصية الآن ولم تكن تعرفه؟'] },
                    de: { heading: 'Midpoint', prompt: 'Eine Umkehr oder Enthüllung, die verändert, wovon die Geschichte handelt – von der Flucht zur Verfolgung.', questions: ['Was weiß die Figur jetzt, was sie vorher nicht wusste?'] },
                    fr: { heading: 'Point médian', prompt: 'Un renversement ou une révélation qui change le sujet de l’histoire — de la fuite à la poursuite.', questions: ['Que sait maintenant le personnage qu’il ne savait pas ?'] },
                    es: { heading: 'Punto medio', prompt: 'Un giro o una revelación que cambia de qué trata la historia: de huir a perseguir.', questions: ['¿Qué sabe ahora el personaje que antes no sabía?'] },
                    ja: { heading: 'ミッドポイント', prompt: '物語の意味を変える逆転や発見。逃げる物語から、追う物語へ。', questions: ['主人公が今は知っていて、以前は知らなかったことは何ですか？'] },
                }, true),
                beat('pinch2', 0.625, {
                    en: { heading: 'Second pressure', prompt: 'The opposition tightens; the cost rises.' },
                    he: { heading: 'לחץ שני', prompt: 'ההתנגדות מתהדקת; המחיר עולה.' },
                    ar: { heading: 'الضغط الثاني', prompt: 'يشتدّ الخناق من الخصوم؛ ويرتفع الثمن.' },
                    de: { heading: 'Zweite Zuspitzung', prompt: 'Der Widerstand zieht sich enger zusammen; der Preis steigt.' },
                    fr: { heading: 'Deuxième pression', prompt: 'L’adversaire resserre l’étau ; le prix à payer augmente.' },
                    es: { heading: 'Segunda presión', prompt: 'La oposición aprieta; el coste aumenta.' },
                    ja: { heading: '第二の圧力', prompt: '敵対する力が締めつけを強め、代償が大きくなる。' },
                }),
                beat('crisis', 0.75, {
                    en: { heading: 'Lowest point', prompt: 'All seems lost. The character must face what they have avoided.', questions: ['What does the character lose here?'] },
                    he: { heading: 'נקודת השפל', prompt: 'הכול נראה אבוד. הדמות חייבת להתמודד עם מה שהתחמקה ממנו.', questions: ['מה הדמות מאבדת כאן?'] },
                    ar: { heading: 'القاع', prompt: 'يبدو كل شيء ضائعًا. على الشخصية أن تواجه ما تهرّبت منه.', questions: ['ما الذي تخسره الشخصية هنا؟'] },
                    de: { heading: 'Der Tiefpunkt', prompt: 'Alles scheint verloren. Die Figur muss sich dem stellen, dem sie ausgewichen ist.', questions: ['Was verliert die Figur hier?'] },
                    fr: { heading: 'Le point le plus bas', prompt: 'Tout semble perdu. Le personnage doit affronter ce qu’il a évité.', questions: ['Que perd le personnage ici ?'] },
                    es: { heading: 'El punto más bajo', prompt: 'Todo parece perdido. El personaje debe afrontar lo que ha evitado.', questions: ['¿Qué pierde aquí el personaje?'] },
                    ja: { heading: 'どん底', prompt: 'すべてを失ったかに見える。主人公は、避けてきたものと向き合わなければならない。', questions: ['主人公はここで何を失いますか？'] },
                }, true),
            ],
        },
        {
            ...part('act3', {
                en: { heading: 'Act three — resolution', prompt: 'The final confrontation and the world after it.' },
                he: { heading: 'מערכה שלישית — הכרעה', prompt: 'העימות האחרון והעולם שאחריו.' },
                ar: { heading: 'الفصل الثالث — الحسم', prompt: 'المواجهة الأخيرة والعالم من بعدها.' },
                de: { heading: 'Dritter Akt – Auflösung', prompt: 'Die letzte Konfrontation und die Welt danach.' },
                fr: { heading: 'Troisième acte — résolution', prompt: 'L’affrontement final et le monde qui le suit.' },
                es: { heading: 'Tercer acto — desenlace', prompt: 'La confrontación final y el mundo que queda después.' },
                ja: { heading: '第三幕（解決）', prompt: '最後の対決と、そのあとの世界。' },
            }),
            children: [
                beat('climax', 0.9, {
                    en: { heading: 'Climax', prompt: 'The character acts on what they have learned; the central question is answered.', questions: ['Does the character win, lose, or change — and is it earned?'] },
                    he: { heading: 'שיא', prompt: 'הדמות פועלת לפי מה שלמדה; השאלה המרכזית מקבלת תשובה.', questions: ['הדמות מנצחת, מפסידה או משתנה — וזה מוצדק?'] },
                    ar: { heading: 'الذروة', prompt: 'الشخصية تتصرّف بما تعلّمته؛ ويجد السؤال المركزي جوابه.', questions: ['هل تنتصر الشخصية أم تخسر أم تتغيّر — وهل جاء ذلك مستحقًّا؟'] },
                    de: { heading: 'Höhepunkt', prompt: 'Die Figur handelt nach dem, was sie gelernt hat; die zentrale Frage wird beantwortet.', questions: ['Gewinnt die Figur, verliert sie oder wandelt sie sich – und ist das verdient?'] },
                    fr: { heading: 'Climax', prompt: 'Le personnage agit selon ce qu’il a appris ; la question centrale trouve sa réponse.', questions: ['Le personnage gagne-t-il, perd-il ou change-t-il — et est-ce mérité ?'] },
                    es: { heading: 'Clímax', prompt: 'El personaje actúa según lo que ha aprendido; la pregunta central recibe respuesta.', questions: ['¿El personaje gana, pierde o cambia? ¿Y se lo ha ganado?'] },
                    ja: { heading: 'クライマックス', prompt: '主人公は学んだことをもとに行動し、物語の中心にある問いに答えが出る。', questions: ['主人公は勝ちますか、負けますか、変わりますか？　それは納得できる結果ですか？'] },
                }, true),
                beat('ending', 0.98, {
                    en: { heading: 'Closing image', prompt: 'The new ordinary — the mirror of the opening.', questions: ['Does it answer the first page?'] },
                    he: { heading: 'תמונת סיום', prompt: 'השגרה החדשה — תמונת הראי של הפתיחה.', questions: ['היא עונה לעמוד הראשון?'] },
                    ar: { heading: 'صورة الختام', prompt: 'المألوف الجديد — مرآة الافتتاح.', questions: ['هل تجيب عن الصفحة الأولى؟'] },
                    de: { heading: 'Schlussbild', prompt: 'Der neue Alltag – das Spiegelbild der Eröffnung.', questions: ['Antwortet es auf die erste Seite?'] },
                    fr: { heading: 'Image finale', prompt: 'Le nouveau quotidien — le miroir de l’ouverture.', questions: ['Répond-elle à la première page ?'] },
                    es: { heading: 'Imagen final', prompt: 'La nueva normalidad: el espejo de la apertura.', questions: ['¿Responde a la primera página?'] },
                    ja: { heading: 'ラストシーン', prompt: '新しい日常。ファーストシーンと対になる場面。', questions: ['最初のページへの答えになっていますか？'] },
                }),
            ],
        },
    ],
};

/** Eight sequences of about an eighth of the book each, two per quarter. */
const SEQUENCES: [string, Localized<NodeText>][] = [
    ['seq1', {
        en: { heading: 'Sequence 1 — the world and the want', prompt: 'The character, their world and what they want; ends on the event that disturbs it.' },
        he: { heading: 'סיקוונס 1 — העולם והרצון', prompt: 'הדמות, העולם שלה ומה היא רוצה; נגמר באירוע שמערער אותו.' },
        ar: { heading: 'المتتالية 1 — العالم والرغبة', prompt: 'الشخصية وعالمها وما تريده؛ وتنتهي بالحدث الذي يُخلّ به.' },
        de: { heading: 'Sequenz 1 – Welt und Wunsch', prompt: 'Die Figur, ihre Welt und was sie will; endet mit dem Ereignis, das all das stört.' },
        fr: { heading: 'Séquence 1 — le monde et le désir', prompt: 'Le personnage, son monde et ce qu’il veut ; se termine sur l’événement qui vient tout troubler.' },
        es: { heading: 'Secuencia 1 — el mundo y el deseo', prompt: 'El personaje, su mundo y lo que quiere; termina en el suceso que lo altera.' },
        ja: { heading: 'シークエンス1（世界と願い）', prompt: '主人公とその世界、そして望むもの。世界を揺るがす出来事で終わる。' },
    }],
    ['seq2', {
        en: { heading: 'Sequence 2 — the decision', prompt: 'The character weighs the problem and commits to a goal; ends at the end of the first act.' },
        he: { heading: 'סיקוונס 2 — ההחלטה', prompt: 'הדמות שוקלת את הבעיה ומתחייבת למטרה; נגמר בסוף המערכה הראשונה.' },
        ar: { heading: 'المتتالية 2 — القرار', prompt: 'الشخصية تزن المشكلة وتلتزم بهدف؛ وتنتهي عند نهاية الفصل الأول.' },
        de: { heading: 'Sequenz 2 – die Entscheidung', prompt: 'Die Figur wägt das Problem ab und legt sich auf ein Ziel fest; endet mit dem Ende des ersten Akts.' },
        fr: { heading: 'Séquence 2 — la décision', prompt: 'Le personnage pèse le problème et s’engage vers un objectif ; se termine à la fin du premier acte.' },
        es: { heading: 'Secuencia 2 — la decisión', prompt: 'El personaje sopesa el problema y se compromete con un objetivo; termina al final del primer acto.' },
        ja: { heading: 'シークエンス2（決断）', prompt: '主人公は問題を見極め、目標に向かうと決める。第一幕の終わりで終わる。' },
    }],
    ['seq3', {
        en: { heading: 'Sequence 3 — first attempt', prompt: 'The first, easiest way to the goal — and why it fails.' },
        he: { heading: 'סיקוונס 3 — ניסיון ראשון', prompt: 'הדרך הראשונה והקלה אל המטרה — ולמה היא נכשלת.' },
        ar: { heading: 'المتتالية 3 — المحاولة الأولى', prompt: 'الطريق الأول والأسهل إلى الهدف — ولماذا يفشل.' },
        de: { heading: 'Sequenz 3 – der erste Versuch', prompt: 'Der erste, einfachste Weg zum Ziel – und warum er scheitert.' },
        fr: { heading: 'Séquence 3 — première tentative', prompt: 'Le premier chemin vers l’objectif, le plus facile — et pourquoi il échoue.' },
        es: { heading: 'Secuencia 3 — primer intento', prompt: 'El primer camino hacia el objetivo, el más fácil, y por qué fracasa.' },
        ja: { heading: 'シークエンス3（最初の試み）', prompt: '目標への最初の、いちばん楽な道。そして、それが失敗する理由。' },
    }],
    ['seq4', {
        en: { heading: 'Sequence 4 — raising the stakes', prompt: 'Harder attempts; ends on the midpoint turn.' },
        he: { heading: 'סיקוונס 4 — העלאת הסיכון', prompt: 'ניסיונות קשים יותר; נגמר במפנה של האמצע.' },
        ar: { heading: 'المتتالية 4 — رفع ما على المحكّ', prompt: 'محاولات أصعب؛ وتنتهي عند انعطافة المنتصف.' },
        de: { heading: 'Sequenz 4 – mehr steht auf dem Spiel', prompt: 'Schwierigere Versuche; endet mit der Wende am Midpoint.' },
        fr: { heading: 'Séquence 4 — l’enjeu monte', prompt: 'Des tentatives plus difficiles ; se termine sur le retournement du point médian.' },
        es: { heading: 'Secuencia 4 — más en juego', prompt: 'Intentos más difíciles; termina en el giro del punto medio.' },
        ja: { heading: 'シークエンス4（大きくなる代償）', prompt: '難しさを増す挑戦。ミッドポイントの転換で終わる。' },
    }],
    ['seq5', {
        en: { heading: 'Sequence 5 — the new direction', prompt: 'After the midpoint the character pursues the goal differently; complications grow.' },
        he: { heading: 'סיקוונס 5 — הכיוון החדש', prompt: 'אחרי האמצע הדמות רודפת אחרי המטרה אחרת; הסיבוכים גדלים.' },
        ar: { heading: 'المتتالية 5 — الاتجاه الجديد', prompt: 'بعد المنتصف تسعى الشخصية إلى الهدف بطريقة مختلفة؛ وتتكاثر التعقيدات.' },
        de: { heading: 'Sequenz 5 – die neue Richtung', prompt: 'Nach dem Midpoint verfolgt die Figur ihr Ziel anders; die Komplikationen wachsen.' },
        fr: { heading: 'Séquence 5 — la nouvelle direction', prompt: 'Après le point médian, le personnage poursuit l’objectif autrement ; les complications s’accumulent.' },
        es: { heading: 'Secuencia 5 — el nuevo rumbo', prompt: 'Tras el punto medio, el personaje persigue el objetivo de otra manera; las complicaciones crecen.' },
        ja: { heading: 'シークエンス5（新しい方向）', prompt: 'ミッドポイントの後、主人公は別のやり方で目標を追う。厄介ごとが増えていく。' },
    }],
    ['seq6', {
        en: { heading: 'Sequence 6 — the low point', prompt: 'Everything falls apart; ends at the end of the second act.' },
        he: { heading: 'סיקוונס 6 — השפל', prompt: 'הכול מתפרק; נגמר בסוף המערכה השנייה.' },
        ar: { heading: 'المتتالية 6 — القاع', prompt: 'كل شيء ينهار؛ وتنتهي عند نهاية الفصل الثاني.' },
        de: { heading: 'Sequenz 6 – der Tiefpunkt', prompt: 'Alles bricht zusammen; endet mit dem Ende des zweiten Akts.' },
        fr: { heading: 'Séquence 6 — le point le plus bas', prompt: 'Tout s’écroule ; se termine à la fin du deuxième acte.' },
        es: { heading: 'Secuencia 6 — el punto más bajo', prompt: 'Todo se derrumba; termina al final del segundo acto.' },
        ja: { heading: 'シークエンス6（どん底）', prompt: 'すべてが崩れ落ちる。第二幕の終わりで終わる。' },
    }],
    ['seq7', {
        en: { heading: 'Sequence 7 — the final push', prompt: 'The character regroups and goes into the final confrontation.' },
        he: { heading: 'סיקוונס 7 — המאמץ האחרון', prompt: 'הדמות מתארגנת מחדש ונכנסת לעימות האחרון.' },
        ar: { heading: 'المتتالية 7 — الجهد الأخير', prompt: 'الشخصية تلملم شتاتها وتدخل المواجهة الأخيرة.' },
        de: { heading: 'Sequenz 7 – der letzte Anlauf', prompt: 'Die Figur sammelt sich und geht in die letzte Konfrontation.' },
        fr: { heading: 'Séquence 7 — l’ultime effort', prompt: 'Le personnage se ressaisit et entre dans l’affrontement final.' },
        es: { heading: 'Secuencia 7 — el último esfuerzo', prompt: 'El personaje se recompone y entra en la confrontación final.' },
        ja: { heading: 'シークエンス7（最後の奮起）', prompt: '主人公は態勢を立て直し、最後の対決に向かう。' },
    }],
    ['seq8', {
        en: { heading: 'Sequence 8 — resolution', prompt: 'The climax and its consequences; the new world.' },
        he: { heading: 'סיקוונס 8 — הכרעה', prompt: 'השיא ותוצאותיו; העולם החדש.' },
        ar: { heading: 'المتتالية 8 — الحسم', prompt: 'الذروة ونتائجها؛ والعالم الجديد.' },
        de: { heading: 'Sequenz 8 – Auflösung', prompt: 'Der Höhepunkt und seine Folgen; die neue Welt.' },
        fr: { heading: 'Séquence 8 — résolution', prompt: 'Le climax et ses conséquences ; le nouveau monde.' },
        es: { heading: 'Secuencia 8 — desenlace', prompt: 'El clímax y sus consecuencias; el mundo nuevo.' },
        ja: { heading: 'シークエンス8（解決）', prompt: 'クライマックスとその結果。新しい世界。' },
    }],
];

const SEQ_CHECKS = [{
    id: 'tension',
    text: {
        en: 'It has its own question, answered by its end',
        he: 'יש לו שאלה משלו, שנענית בסופו',
        ar: 'لها سؤالها الخاص، ويجد جوابه في نهايتها',
        de: 'Sie hat ihre eigene Frage, die am Ende beantwortet wird',
        fr: 'Elle a sa propre question, résolue à la fin',
        es: 'Tiene su propia pregunta, que se responde al final',
        ja: 'このシークエンス独自の問いがあり、終わりまでに答えが出る',
    } as Localized,
}];

export const novelEightSequences: TemplateDef = {
    schema: 1,
    id: 'fiction.novel-8-sequences',
    version: '1.0.0',
    source: 'bundled',
    family: 'fiction',
    info: {
        en: { title: 'Novel — eight sequences', description: 'The long story in eight movements of about an eighth each, every one with its own question — a way to keep the middle from sagging.', file: 'Novel outline' },
        he: { title: 'רומן — שמונה סיקוונסים', description: 'הסיפור הארוך בשמונה מהלכים של כשמינית כל אחד, ולכל אחד שאלה משלו — דרך לשמור שהאמצע לא ישקע.', file: 'מתווה רומן' },
        ar: { title: 'رواية — ثماني متتاليات', description: 'القصة الطويلة في ثماني حركات، كل منها نحو الثُّمن، ولكل منها سؤالها الخاص — طريقة تحول دون ترهّل الوسط.', file: 'مخطط الرواية' },
        de: { title: 'Roman – acht Sequenzen', description: 'Die lange Geschichte in acht Abschnitten von je etwa einem Achtel, jeder mit seiner eigenen Frage – so hängt die Mitte nicht durch.', file: 'Roman-Outline' },
        fr: { title: 'Roman — huit séquences', description: 'La longue histoire en huit mouvements d’environ un huitième chacun, tous porteurs de leur propre question — pour éviter que le milieu ne s’affaisse.', file: 'Plan du roman' },
        es: { title: 'Novela — ocho secuencias', description: 'La historia larga en ocho bloques de alrededor de un octavo cada uno, cada cual con su propia pregunta: una forma de que el nudo no decaiga.', file: 'Esquema de la novela' },
        ja: { title: '長編小説（八つのシークエンス）', description: '長い物語を、全体のおよそ八分の一ずつ、八つの流れに分ける。それぞれに独自の問いを持たせ、中だるみを防ぐ方法。', file: '長編小説のプロット' },
    },
    nodes: [
        premise(),
        ...SEQUENCES.map(([id, text], k): NodeDef => ({ id, level: 2, position: k / 8, target: { min: 50, max: 600 }, text, checks: SEQ_CHECKS })),
    ],
};

/** The twelve stages of the journey, in the common modern telling. */
const STAGES: [string, number, Localized<NodeText>][] = [
    ['ordinary', 0.02, {
        en: { heading: 'The ordinary world', prompt: 'The hero at home, before the story — and what is lacking.' },
        he: { heading: 'העולם הרגיל', prompt: 'הגיבור בבית, לפני הסיפור — ומה שחסר לו.' },
        ar: { heading: 'العالم العادي', prompt: 'البطل في بيته، قبل القصة — وما ينقصه.' },
        de: { heading: 'Die gewohnte Welt', prompt: 'Der Held zu Hause, vor der Geschichte – und was ihm fehlt.' },
        fr: { heading: 'Le monde ordinaire', prompt: 'Le héros chez lui, avant l’histoire — et ce qui lui manque.' },
        es: { heading: 'El mundo ordinario', prompt: 'El héroe en casa, antes de la historia, y lo que le falta.' },
        ja: { heading: '日常の世界', prompt: '物語が始まる前、自分の居場所にいる主人公。そして欠けているもの。' },
    }],
    ['call', 0.08, {
        en: { heading: 'The call', prompt: 'A problem, a message, a chance: something asks the hero to leave.' },
        he: { heading: 'הקריאה', prompt: 'בעיה, שליחות, הזדמנות: משהו קורא לגיבור לצאת.' },
        ar: { heading: 'النداء', prompt: 'مشكلة، رسالة، فرصة: شيء ما يدعو البطل إلى الرحيل.' },
        de: { heading: 'Der Ruf', prompt: 'Ein Problem, eine Botschaft, eine Chance: Etwas fordert den Helden auf, aufzubrechen.' },
        fr: { heading: 'L’appel', prompt: 'Un problème, un message, une occasion : quelque chose pousse le héros à partir.' },
        es: { heading: 'La llamada', prompt: 'Un problema, un mensaje, una oportunidad: algo le pide al héroe que se marche.' },
        ja: { heading: '冒険への誘い', prompt: '問題、知らせ、好機。何かが主人公に旅立ちを促す。' },
    }],
    ['refusal', 0.12, {
        en: { heading: 'The refusal', prompt: 'Fear or duty holds the hero back.' },
        he: { heading: 'הסירוב', prompt: 'פחד או חובה מעכבים את הגיבור.' },
        ar: { heading: 'الرفض', prompt: 'الخوف أو الواجب يعيقان البطل.' },
        de: { heading: 'Die Weigerung', prompt: 'Angst oder Pflicht halten den Helden zurück.' },
        fr: { heading: 'Le refus', prompt: 'La peur ou le devoir retient le héros.' },
        es: { heading: 'El rechazo', prompt: 'El miedo o el deber frenan al héroe.' },
        ja: { heading: '誘いの拒絶', prompt: '恐れや義務が主人公を引き止める。' },
    }],
    ['mentor', 0.17, {
        en: { heading: 'The mentor', prompt: 'Someone gives advice, a gift, or courage.' },
        he: { heading: 'המורה', prompt: 'מישהו נותן עצה, מתנה או אומץ.' },
        ar: { heading: 'المرشد', prompt: 'شخص يقدّم نصيحة أو هدية أو شجاعة.' },
        de: { heading: 'Der Mentor', prompt: 'Jemand gibt Rat, ein Geschenk oder Mut.' },
        fr: { heading: 'Le mentor', prompt: 'Quelqu’un offre un conseil, un don ou du courage.' },
        es: { heading: 'El mentor', prompt: 'Alguien da un consejo, un regalo o valor.' },
        ja: { heading: '師との出会い', prompt: '誰かが助言や贈り物、あるいは勇気を与える。' },
    }],
    ['threshold', 0.25, {
        en: { heading: 'Crossing the threshold', prompt: 'The hero commits and enters the unknown world.' },
        he: { heading: 'חציית הסף', prompt: 'הגיבור מתחייב ונכנס לעולם הלא נודע.' },
        ar: { heading: 'عبور العتبة', prompt: 'البطل يلتزم ويدخل العالم المجهول.' },
        de: { heading: 'Das Überschreiten der Schwelle', prompt: 'Der Held legt sich fest und betritt die unbekannte Welt.' },
        fr: { heading: 'Le passage du seuil', prompt: 'Le héros s’engage et entre dans le monde inconnu.' },
        es: { heading: 'El cruce del umbral', prompt: 'El héroe se compromete y entra en el mundo desconocido.' },
        ja: { heading: '境界を越える', prompt: '主人公は腹を決め、未知の世界に足を踏み入れる。' },
    }],
    ['tests', 0.35, {
        en: { heading: 'Tests, allies and enemies', prompt: 'The rules of the new world, learned the hard way; who is with the hero and who is against.' },
        he: { heading: 'מבחנים, בעלי ברית ואויבים', prompt: 'החוקים של העולם החדש, נלמדים בדרך הקשה; מי עם הגיבור ומי נגדו.' },
        ar: { heading: 'الاختبارات والحلفاء والأعداء', prompt: 'قواعد العالم الجديد، يتعلّمها بالطريقة الصعبة؛ ومن مع البطل ومن ضده.' },
        de: { heading: 'Prüfungen, Verbündete und Feinde', prompt: 'Die Regeln der neuen Welt, auf die harte Tour gelernt; wer zum Helden hält und wer gegen ihn ist.' },
        fr: { heading: 'Épreuves, alliés et ennemis', prompt: 'Les règles du nouveau monde, apprises à la dure ; qui est avec le héros et qui est contre lui.' },
        es: { heading: 'Pruebas, aliados y enemigos', prompt: 'Las reglas del mundo nuevo, aprendidas a las malas; quién está con el héroe y quién en su contra.' },
        ja: { heading: '試練、仲間、敵', prompt: '痛い目に遭いながら学ぶ新しい世界のルール。誰が味方で、誰が敵か。' },
    }],
    ['approach', 0.45, {
        en: { heading: 'The approach', prompt: 'Preparing for the central ordeal; the danger comes close.' },
        he: { heading: 'ההתקרבות', prompt: 'ההכנה למבחן המרכזי; הסכנה מתקרבת.' },
        ar: { heading: 'الاقتراب', prompt: 'الاستعداد للمحنة الكبرى؛ والخطر يقترب.' },
        de: { heading: 'Die Annäherung', prompt: 'Die Vorbereitung auf die zentrale Prüfung; die Gefahr rückt näher.' },
        fr: { heading: 'L’approche', prompt: 'La préparation à l’épreuve centrale ; le danger se rapproche.' },
        es: { heading: 'La aproximación', prompt: 'La preparación para la prueba central; el peligro se acerca.' },
        ja: { heading: '接近', prompt: '最大の試練への備え。危険が迫ってくる。' },
    }],
    ['ordeal', 0.5, {
        en: { heading: 'The ordeal', prompt: 'The hero faces the greatest fear — a death and a rebirth.' },
        he: { heading: 'המבחן הגדול', prompt: 'הגיבור עומד מול הפחד הגדול ביותר — מוות ולידה מחדש.' },
        ar: { heading: 'المحنة', prompt: 'البطل يواجه أعظم مخاوفه — موت وولادة جديدة.' },
        de: { heading: 'Die entscheidende Prüfung', prompt: 'Der Held stellt sich seiner größten Angst – ein Tod und eine Wiedergeburt.' },
        fr: { heading: 'L’épreuve suprême', prompt: 'Le héros affronte sa plus grande peur — une mort et une renaissance.' },
        es: { heading: 'La gran prueba', prompt: 'El héroe se enfrenta a su mayor miedo: una muerte y un renacimiento.' },
        ja: { heading: '最大の試練', prompt: '主人公は最大の恐怖に立ち向かう。死と再生。' },
    }],
    ['reward', 0.6, {
        en: { heading: 'The reward', prompt: 'What the hero takes from the ordeal: a treasure, knowledge, reconciliation.' },
        he: { heading: 'הגמול', prompt: 'מה שהגיבור לוקח מהמבחן: אוצר, ידע, פיוס.' },
        ar: { heading: 'الجائزة', prompt: 'ما يخرج به البطل من المحنة: كنز، أو معرفة، أو مصالحة.' },
        de: { heading: 'Die Belohnung', prompt: 'Was der Held aus der Prüfung mitnimmt: einen Schatz, Wissen, Versöhnung.' },
        fr: { heading: 'La récompense', prompt: 'Ce que le héros retire de l’épreuve : un trésor, un savoir, une réconciliation.' },
        es: { heading: 'La recompensa', prompt: 'Lo que el héroe obtiene de la prueba: un tesoro, un saber, una reconciliación.' },
        ja: { heading: '報酬', prompt: '主人公が試練から得るもの。宝、知識、和解。' },
    }],
    ['roadback', 0.75, {
        en: { heading: 'The road back', prompt: 'The hero sets out for home, and the danger follows.' },
        he: { heading: 'הדרך חזרה', prompt: 'הגיבור יוצא הביתה, והסכנה רודפת אחריו.' },
        ar: { heading: 'طريق العودة', prompt: 'ينطلق البطل عائدًا إلى بيته، والخطر يلاحقه.' },
        de: { heading: 'Der Rückweg', prompt: 'Der Held macht sich auf den Heimweg, und die Gefahr folgt ihm.' },
        fr: { heading: 'Le chemin du retour', prompt: 'Le héros repart vers chez lui, et le danger le suit.' },
        es: { heading: 'El camino de regreso', prompt: 'El héroe emprende la vuelta a casa, y el peligro lo persigue.' },
        ja: { heading: '帰路', prompt: '主人公は家路につき、危険がそのあとを追ってくる。' },
    }],
    ['resurrection', 0.9, {
        en: { heading: 'The final test', prompt: 'A last, harder test on the threshold of home; the hero is changed for good.' },
        he: { heading: 'המבחן האחרון', prompt: 'מבחן אחרון וקשה יותר על סף הבית; הגיבור משתנה לתמיד.' },
        ar: { heading: 'الاختبار الأخير', prompt: 'اختبار أخير وأصعب على عتبة البيت؛ ويتغيّر البطل إلى الأبد.' },
        de: { heading: 'Die letzte Prüfung', prompt: 'Eine letzte, härtere Prüfung an der Schwelle zur Heimat; der Held ist für immer verändert.' },
        fr: { heading: 'L’épreuve finale', prompt: 'Une dernière épreuve, plus dure, au seuil de la maison ; le héros en sort changé pour toujours.' },
        es: { heading: 'La prueba final', prompt: 'Una última prueba, más dura, en el umbral del hogar; el héroe cambia para siempre.' },
        ja: { heading: '最後の試練', prompt: '故郷を目前にした、さらに厳しい最後の試練。主人公は永遠に変わる。' },
    }],
    ['return', 0.98, {
        en: { heading: 'The return', prompt: 'Home again, with something that changes the ordinary world.' },
        he: { heading: 'השיבה', prompt: 'שוב בבית, עם משהו שמשנה את העולם הרגיל.' },
        ar: { heading: 'العودة', prompt: 'في البيت من جديد، ومعه ما يغيّر العالم العادي.' },
        de: { heading: 'Die Rückkehr', prompt: 'Wieder zu Hause, mit etwas, das die gewohnte Welt verändert.' },
        fr: { heading: 'Le retour', prompt: 'De retour chez lui, avec quelque chose qui change le monde ordinaire.' },
        es: { heading: 'El regreso', prompt: 'De nuevo en casa, con algo que cambia el mundo ordinario.' },
        ja: { heading: '帰還', prompt: '再び故郷へ。日常の世界を変える何かを携えて。' },
    }],
];

export const novelHeroJourney: TemplateDef = {
    schema: 1,
    id: 'fiction.novel-journey',
    version: '1.0.0',
    source: 'bundled',
    family: 'fiction',
    info: {
        en: { title: 'Novel — the hero\'s journey', description: 'Twelve stages from the ordinary world into the unknown and back — the shape of quests, coming-of-age stories and adventures.', file: 'Novel outline' },
        he: { title: 'רומן — מסע הגיבור', description: 'שתים עשרה תחנות מהעולם הרגיל אל הלא נודע ובחזרה — הצורה של סיפורי מסע, התבגרות והרפתקה.', file: 'מתווה רומן' },
        ar: { title: 'رواية — رحلة البطل', description: 'اثنتا عشرة محطة من العالم العادي إلى المجهول والعودة — شكل قصص الرحلات والنضوج والمغامرات.', file: 'مخطط الرواية' },
        de: { title: 'Roman – die Heldenreise', description: 'Zwölf Stationen von der gewohnten Welt ins Unbekannte und zurück – die Form von Quest-Geschichten, Coming-of-Age-Romanen und Abenteuern.', file: 'Roman-Outline' },
        fr: { title: 'Roman — le voyage du héros', description: 'Douze étapes du monde ordinaire vers l’inconnu, et retour — la forme des quêtes, des récits d’apprentissage et des aventures.', file: 'Plan du roman' },
        es: { title: 'Novela — el viaje del héroe', description: 'Doce etapas del mundo ordinario a lo desconocido y de vuelta: la forma de las búsquedas, las historias de iniciación y las aventuras.', file: 'Esquema de la novela' },
        ja: { title: '長編小説（ヒーローズ・ジャーニー）', description: '日常の世界から未知の世界へ行って帰る十二の段階。探求の物語、成長物語、冒険物語の形。', file: '長編小説のプロット' },
    },
    nodes: [
        premise(),
        ...STAGES.map(([id, position, text]): NodeDef => ({ id, level: 2, position, target: { min: 30, max: 500 }, text })),
    ],
};

export const sceneCard: TemplateDef = {
    schema: 1,
    id: 'fiction.scene-card',
    version: '1.0.0',
    source: 'bundled',
    family: 'fiction',
    info: {
        en: { title: 'Scene card', description: 'One scene, before it is written: whose it is, what they want, what stops them, and how it ends — worse, usually.', file: 'Scene' },
        he: { title: 'כרטיס סצנה', description: 'סצנה אחת, לפני שנכתבה: של מי היא, מה הדמות רוצה, מה עוצר אותה, ואיך זה נגמר — בדרך כלל, רע יותר.', file: 'סצנה' },
        ar: { title: 'بطاقة المشهد', description: 'مشهد واحد قبل كتابته: لمن هو، وماذا تريد الشخصية، وما الذي يوقفها، وكيف ينتهي — وغالبًا إلى الأسوأ.', file: 'مشهد' },
        de: { title: 'Szenenkarte', description: 'Eine Szene, bevor sie geschrieben ist: wessen Szene sie ist, was die Figur will, was sie aufhält und wie es ausgeht – meistens schlechter.', file: 'Szene' },
        fr: { title: 'Fiche de scène', description: 'Une scène, avant de l’écrire : à qui elle appartient, ce que veut le personnage, ce qui l’arrête, et comment elle finit — en général, plus mal encore.', file: 'Scène' },
        es: { title: 'Ficha de escena', description: 'Una escena, antes de escribirla: de quién es, qué quiere el personaje, qué se lo impide y cómo termina; normalmente, peor.', file: 'Escena' },
        ja: { title: 'シーンカード', description: '書く前の、一つのシーン。誰のシーンか、何を望むか、何が阻むか、どう終わるか。たいていは、悪い方へ。', file: 'シーン' },
    },
    nodes: [
        {
            id: 'pov',
            level: 2,
            target: { max: 60 },
            text: {
                en: { heading: 'Point of view, place and time', prompt: 'Whose eyes, where, when.' },
                he: { heading: 'נקודת מבט, מקום וזמן', prompt: 'דרך עיניים של מי, איפה, מתי.' },
                ar: { heading: 'وجهة النظر والمكان والزمان', prompt: 'بعيني من، وأين، ومتى.' },
                de: { heading: 'Perspektive, Ort und Zeit', prompt: 'Durch wessen Augen, wo, wann.' },
                fr: { heading: 'Point de vue, lieu et moment', prompt: 'Par quels yeux, où, quand.' },
                es: { heading: 'Punto de vista, lugar y tiempo', prompt: 'A través de qué ojos, dónde, cuándo.' },
                ja: { heading: '視点、場所、時間', prompt: '誰の目を通して、どこで、いつ。' },
            },
        },
        {
            id: 'goal',
            level: 2,
            target: { max: 80 },
            text: {
                en: { heading: 'Goal', prompt: 'What the point-of-view character wants in this scene — concrete, achievable now.', questions: ['Could an observer see whether they got it?'] },
                he: { heading: 'מטרה', prompt: 'מה דמות נקודת המבט רוצה בסצנה הזאת — מוחשי, אפשרי עכשיו.', questions: ['צופה מבחוץ היה יכול לראות אם השיגה את זה?'] },
                ar: { heading: 'الهدف', prompt: 'ما تريده شخصية وجهة النظر في هذا المشهد — ملموس، وقابل للتحقيق الآن.', questions: ['هل يستطيع مراقب أن يرى إن كانت قد حققته؟'] },
                de: { heading: 'Ziel', prompt: 'Was die Perspektivfigur in dieser Szene will – konkret und jetzt erreichbar.', questions: ['Könnte ein Beobachter sehen, ob sie es erreicht hat?'] },
                fr: { heading: 'Objectif', prompt: 'Ce que veut le personnage point de vue dans cette scène — concret, atteignable tout de suite.', questions: ['Un observateur pourrait-il voir s’il l’a obtenu ?'] },
                es: { heading: 'Objetivo', prompt: 'Lo que quiere el personaje del punto de vista en esta escena: algo concreto, alcanzable ahora.', questions: ['¿Podría un observador ver si lo ha conseguido?'] },
                ja: { heading: '目標', prompt: 'このシーンで視点人物が望むこと。具体的で、今すぐ達成できること。', questions: ['はた目にも、達成できたかどうかが分かりますか？'] },
            },
        },
        {
            id: 'conflict',
            level: 2,
            target: { max: 150 },
            text: {
                en: { heading: 'Conflict', prompt: 'Who or what stands in the way, and how it escalates.' },
                he: { heading: 'קונפליקט', prompt: 'מי או מה עומד בדרך, ואיך זה מסלים.' },
                ar: { heading: 'الصراع', prompt: 'من أو ما الذي يقف في الطريق، وكيف يتصاعد.' },
                de: { heading: 'Konflikt', prompt: 'Wer oder was im Weg steht und wie es sich zuspitzt.' },
                fr: { heading: 'Conflit', prompt: 'Qui ou quoi fait obstacle, et comment cela s’envenime.' },
                es: { heading: 'Conflicto', prompt: 'Quién o qué se interpone y cómo va a más.' },
                ja: { heading: '葛藤', prompt: '誰が、あるいは何が立ちはだかり、それがどう激しくなっていくか。' },
            },
        },
        {
            id: 'outcome',
            level: 2,
            target: { max: 80 },
            text: {
                en: { heading: 'Outcome', prompt: 'How it ends: no; yes, but; or no, and worse.', questions: ['Is the character worse off than at the start?'] },
                he: { heading: 'תוצאה', prompt: 'איך זה נגמר: לא; כן, אבל; או לא, וגרוע מזה.', questions: ['מצב הדמות גרוע יותר מבהתחלה?'] },
                ar: { heading: 'النتيجة', prompt: 'كيف ينتهي: لا؛ نعم، ولكن؛ أو لا، والأسوأ من ذلك.', questions: ['هل وضع الشخصية أسوأ مما كان في البداية؟'] },
                de: { heading: 'Ergebnis', prompt: 'Wie es ausgeht: nein; ja, aber; oder nein, und schlimmer noch.', questions: ['Steht die Figur schlechter da als am Anfang?'] },
                fr: { heading: 'Issue', prompt: 'Comment cela finit : non ; oui, mais ; ou non, et pire encore.', questions: ['Le personnage est-il en plus mauvaise posture qu’au début ?'] },
                es: { heading: 'Resultado', prompt: 'Cómo termina: no; sí, pero; o no, y además peor.', questions: ['¿Está el personaje peor que al principio?'] },
                ja: { heading: '結末', prompt: 'どう終わるか。「いいえ」「はい、ただし」「いいえ、しかもさらに悪い」のいずれか。', questions: ['視点人物の状況は、シーンの始まりより悪くなっていますか？'] },
            },
            checks: [{ id: 'change', text: TURNS }],
        },
        {
            id: 'next',
            level: 2,
            target: { max: 80 },
            text: {
                en: { heading: 'Reaction and next step', prompt: 'How the character takes it, and what they decide to do next — the goal of the next scene.' },
                he: { heading: 'תגובה והצעד הבא', prompt: 'איך הדמות מקבלת את זה, ומה היא מחליטה לעשות — המטרה של הסצנה הבאה.' },
                ar: { heading: 'ردّ الفعل والخطوة التالية', prompt: 'كيف تتلقّى الشخصية ذلك، وما الذي تقرّر فعله بعده — هدف المشهد التالي.' },
                de: { heading: 'Reaktion und nächster Schritt', prompt: 'Wie die Figur es aufnimmt und was sie als Nächstes beschließt – das Ziel der nächsten Szene.' },
                fr: { heading: 'Réaction et suite', prompt: 'Comment le personnage encaisse, et ce qu’il décide de faire ensuite — l’objectif de la scène suivante.' },
                es: { heading: 'Reacción y siguiente paso', prompt: 'Cómo se lo toma el personaje y qué decide hacer a continuación: el objetivo de la siguiente escena.' },
                ja: { heading: '反応と次の一手', prompt: '視点人物がそれをどう受け止め、次に何をすると決めるか。次のシーンの目標。' },
            },
        },
    ],
};

export const characterCard: TemplateDef = {
    schema: 1,
    id: 'fiction.character-card',
    version: '1.0.0',
    source: 'bundled',
    family: 'fiction',
    info: {
        en: { title: 'Character card', description: 'One character, from the inside: what they want, what they need, what hurt them, and how they will change.', file: 'Character' },
        he: { title: 'כרטיס דמות', description: 'דמות אחת, מבפנים: מה היא רוצה, מה היא צריכה, מה פגע בה, ואיך היא תשתנה.', file: 'דמות' },
        ar: { title: 'بطاقة الشخصية', description: 'شخصية واحدة من الداخل: ما تريده، وما تحتاج إليه، وما جرحها، وكيف ستتغيّر.', file: 'شخصية' },
        de: { title: 'Figurenkarte', description: 'Eine Figur, von innen: was sie will, was sie braucht, was sie verletzt hat und wie sie sich verändern wird.', file: 'Figur' },
        fr: { title: 'Fiche de personnage', description: 'Un personnage, vu de l’intérieur : ce qu’il veut, ce dont il a besoin, ce qui l’a blessé, et comment il va changer.', file: 'Personnage' },
        es: { title: 'Ficha de personaje', description: 'Un personaje, desde dentro: qué quiere, qué necesita, qué lo hirió y cómo cambiará.', file: 'Personaje' },
        ja: { title: 'キャラクターカード', description: '一人の人物を内側から。望むもの、必要なもの、傷ついた過去、そしてどう変わるか。', file: 'キャラクター' },
    },
    nodes: [
        {
            id: 'who',
            level: 2,
            target: { max: 120 },
            text: {
                en: { heading: 'Who they are', prompt: 'Name, age, what they do, their place in the story.' },
                he: { heading: 'מי היא', prompt: 'שם, גיל, במה היא עוסקת, המקום שלה בסיפור.' },
                ar: { heading: 'من هي', prompt: 'الاسم، والعمر، وما تعمله، ومكانها في القصة.' },
                de: { heading: 'Wer sie ist', prompt: 'Name, Alter, was sie tut, ihr Platz in der Geschichte.' },
                fr: { heading: 'Identité', prompt: 'Nom, âge, occupation, sa place dans l’histoire.' },
                es: { heading: 'Quién es', prompt: 'Nombre, edad, a qué se dedica, su lugar en la historia.' },
                ja: { heading: 'どんな人物か', prompt: '名前、年齢、仕事、物語の中での立ち位置。' },
            },
        },
        {
            id: 'want',
            level: 2,
            target: { max: 100 },
            text: {
                en: { heading: 'What they want', prompt: 'The outer goal they chase in the story.' },
                he: { heading: 'מה היא רוצה', prompt: 'המטרה החיצונית שהיא רודפת אחריה בסיפור.' },
                ar: { heading: 'ما تريده', prompt: 'الهدف الخارجي الذي تسعى إليه في القصة.' },
                de: { heading: 'Was sie will', prompt: 'Das äußere Ziel, das sie in der Geschichte verfolgt.' },
                fr: { heading: 'Désir', prompt: 'L’objectif extérieur qu’il poursuit dans l’histoire.' },
                es: { heading: 'Qué quiere', prompt: 'El objetivo externo que persigue en la historia.' },
                ja: { heading: '望むもの', prompt: '物語の中で追い求める、外的な目標。' },
            },
        },
        {
            id: 'need',
            level: 2,
            target: { max: 100 },
            text: {
                en: { heading: 'What they need', prompt: 'The inner change they do not know they need.', questions: ['Do the want and the need pull against each other?'] },
                he: { heading: 'מה היא צריכה', prompt: 'השינוי הפנימי שהיא לא יודעת שהיא צריכה.', questions: ['הרצון והצורך מושכים לכיוונים מנוגדים?'] },
                ar: { heading: 'ما تحتاج إليه', prompt: 'التغيير الداخلي الذي لا تعلم أنها تحتاج إليه.', questions: ['هل يتجاذب ما تريده وما تحتاج إليه في اتجاهين متعاكسين؟'] },
                de: { heading: 'Was sie braucht', prompt: 'Die innere Veränderung, von der sie nicht weiß, dass sie sie braucht.', questions: ['Ziehen Wunsch und Bedürfnis in entgegengesetzte Richtungen?'] },
                fr: { heading: 'Besoin', prompt: 'Le changement intérieur dont il ignore avoir besoin.', questions: ['Le désir et le besoin tirent-ils dans des sens opposés ?'] },
                es: { heading: 'Qué necesita', prompt: 'El cambio interior que no sabe que necesita.', questions: ['¿Tiran el deseo y la necesidad en direcciones opuestas?'] },
                ja: { heading: '必要なもの', prompt: '本人が必要だと気づいていない、内面の変化。', questions: ['望むものと必要なものは、互いに逆の方向へ引っ張り合っていますか？'] },
            },
        },
        {
            id: 'wound',
            level: 2,
            target: { max: 200 },
            text: {
                en: { heading: 'The wound', prompt: 'What happened before the story that still shapes them, and the false belief it left.' },
                he: { heading: 'הפצע', prompt: 'מה קרה לפני הסיפור ועדיין מעצב אותה, והאמונה השגויה שהשאיר.' },
                ar: { heading: 'الجرح', prompt: 'ما حدث قبل القصة وما زال يشكّلها، والاعتقاد الخاطئ الذي خلّفه.' },
                de: { heading: 'Die Wunde', prompt: 'Was vor der Geschichte geschah und sie bis heute prägt, und der Irrglaube, den es hinterlassen hat.' },
                fr: { heading: 'La blessure', prompt: 'Ce qui s’est passé avant l’histoire et le façonne encore, et la fausse croyance que cela a laissée.' },
                es: { heading: 'La herida', prompt: 'Lo que ocurrió antes de la historia y aún lo marca, y la falsa creencia que dejó.' },
                ja: { heading: '心の傷', prompt: '物語の前に起き、今もその人物を形づくっている出来事と、それが残した誤った思い込み。' },
            },
        },
        {
            id: 'flaw',
            level: 2,
            target: { max: 100 },
            text: {
                en: { heading: 'Strength and flaw', prompt: 'What they are good at, and what gets in their way.' },
                he: { heading: 'חוזקה ופגם', prompt: 'במה היא טובה, ומה מפריע לה.' },
                ar: { heading: 'القوة والعيب', prompt: 'ما تجيده، وما يعيقها.' },
                de: { heading: 'Stärke und Schwäche', prompt: 'Was sie gut kann und was ihr im Weg steht.' },
                fr: { heading: 'Force et faille', prompt: 'Ce en quoi il excelle, et ce qui lui fait obstacle.' },
                es: { heading: 'Fortaleza y defecto', prompt: 'En qué destaca y qué se interpone en su camino.' },
                ja: { heading: '強みと欠点', prompt: '得意なことと、足を引っ張るもの。' },
            },
        },
        {
            id: 'voice',
            level: 2,
            target: { max: 150 },
            text: {
                en: { heading: 'Voice', prompt: 'How they talk: words they use, words they never would. A line of their dialogue.' },
                he: { heading: 'קול', prompt: 'איך היא מדברת: מילים שהיא משתמשת בהן, ומילים שלעולם לא. שורת דיאלוג שלה.' },
                ar: { heading: 'الصوت', prompt: 'كيف تتحدث: كلمات تستخدمها، وكلمات لن تقولها أبدًا. سطر من حوارها.' },
                de: { heading: 'Stimme', prompt: 'Wie sie spricht: Wörter, die sie benutzt, und Wörter, die sie nie sagen würde. Eine Zeile Dialog von ihr.' },
                fr: { heading: 'Voix', prompt: 'Sa façon de parler : les mots qu’il emploie, ceux qu’il n’emploierait jamais. Une réplique de lui.' },
                es: { heading: 'Voz', prompt: 'Cómo habla: palabras que usa y palabras que nunca usaría. Una línea de su diálogo.' },
                ja: { heading: '声', prompt: '話し方。使う言葉と、決して使わない言葉。その人物のセリフを一行。' },
            },
        },
        {
            id: 'arc',
            level: 2,
            target: { max: 150 },
            text: {
                en: { heading: 'Arc', prompt: 'Who they are at the start, and who at the end.' },
                he: { heading: 'קשת', prompt: 'מי היא בהתחלה, ומי בסוף.' },
                ar: { heading: 'قوس الشخصية', prompt: 'من هي في البداية، ومن هي في النهاية.' },
                de: { heading: 'Entwicklungsbogen', prompt: 'Wer sie am Anfang ist und wer am Ende.' },
                fr: { heading: 'Arc', prompt: 'Qui il est au début, et qui il est à la fin.' },
                es: { heading: 'Arco', prompt: 'Quién es al principio y quién al final.' },
                ja: { heading: 'キャラクターアーク', prompt: '始まりではどんな人物で、終わりではどんな人物か。' },
            },
        },
        {
            id: 'relations',
            level: 2,
            target: { max: 200 },
            text: {
                en: { heading: 'Relationships', prompt: 'The people who matter to them, and what each wants from them.' },
                he: { heading: 'קשרים', prompt: 'האנשים שחשובים לה, ומה כל אחד רוצה ממנה.' },
                ar: { heading: 'العلاقات', prompt: 'الأشخاص المهمّون بالنسبة إليها، وما يريده كل منهم منها.' },
                de: { heading: 'Beziehungen', prompt: 'Die Menschen, die ihr wichtig sind, und was jeder von ihnen von ihr will.' },
                fr: { heading: 'Relations', prompt: 'Les personnes qui comptent pour lui, et ce que chacune attend de lui.' },
                es: { heading: 'Relaciones', prompt: 'Las personas que le importan y lo que cada una quiere de él.' },
                ja: { heading: '人間関係', prompt: '大切な人々と、それぞれがその人物に求めるもの。' },
            },
        },
    ],
};
