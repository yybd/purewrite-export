import type { NodeDef, Localized, NodeText, TemplateDef } from './types';

/**
 * A feature film's beat sheet: the fifteen points a mainstream feature turns
 * on, where each one usually lands in a 110-page script, and what to ask of
 * it. The beats are the common craft vocabulary, under neutral names — the
 * best-known fifteen-beat sheet is a trademark, and these are not its words.
 *
 * This is the development document, written before the pages: a line or a
 * paragraph per beat. The pages themselves are a screenplay mode of their own.
 */

function beat(id: string, position: number, text: Localized<NodeText>): NodeDef {
    return { id, level: 3, position, target: { min: 15, max: 200 }, text };
}

export const featureBeats: TemplateDef = {
    schema: 1,
    id: 'screen.feature-15',
    version: '1.0.0',
    source: 'bundled',
    family: 'screenplay',
    info: {
        en: {
            title: 'Feature film — 15 beats',
            description: 'A beat sheet for a feature: logline, four movements, fifteen beats, and the page each one usually lands on.',
            file: 'Beat sheet',
        },
        he: {
            title: 'סרט עלילתי — 15 נקודות',
            description: 'דף נקודות לסרט עלילתי: משפט מפתח, ארבעה מהלכים, חמש עשרה נקודות, והעמוד שבו כל אחת נוחתת בדרך כלל.',
            file: 'דף נקודות',
        },
        ar: {
            title: 'فيلم روائي طويل — 15 محطة',
            description: 'مخطط محطات لفيلم روائي طويل: الفكرة في جملة واحدة، وأربع حركات، وخمس عشرة محطة، والصفحة التي تقع عليها كل محطة عادةً.',
            file: 'مخطط المحطات',
        },
        de: {
            title: 'Spielfilm – 15 Beats',
            description: 'Ein Beat Sheet für den Spielfilm: Logline, vier Abschnitte, fünfzehn Beats und die Seite, auf der jeder Beat üblicherweise kommt.',
            file: 'Beat Sheet',
        },
        fr: {
            title: 'Long métrage — 15 temps forts',
            description: 'La structure d’un long métrage\u00a0: logline, quatre mouvements, quinze temps forts, et la page où chacun tombe d’ordinaire.',
            file: 'Temps forts',
        },
        es: {
            title: 'Largometraje — 15 puntos clave',
            description: 'La estructura de un largometraje: logline, cuatro bloques, quince puntos clave y la página en la que suele caer cada uno.',
            file: 'Estructura del largometraje',
        },
        ja: {
            title: '長編映画（15のビート）',
            description: '長編映画のビートシート。ログライン、四つの大きな流れ、十五のビート、そしてそれぞれが置かれるおおよそのページ。',
            file: 'ビートシート',
        },
    },
    total: { value: 110, unit: 'pages' },
    nodes: [
        {
            id: 'logline',
            level: 2,
            target: { max: 50, hard: true },
            text: {
                en: {
                    heading: 'Logline',
                    prompt: 'One sentence: who wants what, what stands in the way, and what it costs if they fail.',
                    questions: ['Is the hero active — do they decide something?', 'Would a stranger know the genre from this line alone?'],
                },
                he: {
                    heading: 'משפט מפתח',
                    prompt: 'משפט אחד: מי רוצה מה, מה עומד בדרכו, ומה המחיר אם ייכשל.',
                    questions: ['הגיבור פעיל — הוא מחליט משהו?', 'האם זר ידע מה הז\'אנר רק מהשורה הזאת?'],
                },
                ar: {
                    heading: 'الفكرة في جملة واحدة',
                    prompt: 'جملة واحدة (وتُسمّى «لوغلاين»): من يريد ماذا، وما الذي يقف في طريقه، وما الثمن إن فشل.',
                    questions: ['هل البطل فاعل — هل يتخذ قرارًا؟', 'هل يعرف غريبٌ نوع الفيلم من هذه الجملة وحدها؟'],
                },
                de: {
                    heading: 'Logline',
                    prompt: 'Ein Satz: Wer will was, was steht im Weg – und was steht auf dem Spiel, wenn die Figur scheitert?',
                    questions: ['Ist die Hauptfigur aktiv – trifft sie eine Entscheidung?', 'Würde jemand, der das Projekt nicht kennt, das Genre allein an diesem Satz erkennen?'],
                },
                fr: {
                    heading: 'Logline',
                    prompt: 'Une seule phrase\u00a0: qui veut quoi, ce qui l’en empêche, et ce que l’échec lui coûterait.',
                    questions: ['Le héros est-il actif — prend-il une décision\u00a0?', 'Un inconnu devinerait-il le genre à partir de cette seule phrase\u00a0?'],
                },
                es: {
                    heading: 'Logline',
                    prompt: 'Una sola frase: quién quiere qué, qué se lo impide y qué pierde si fracasa.',
                    questions: ['¿Es activo el protagonista? ¿Toma alguna decisión?', '¿Un desconocido adivinaría el género solo con esta frase?'],
                },
                ja: {
                    heading: 'ログライン',
                    prompt: '一文で。誰が何を望み、何がそれを阻み、失敗すれば何を失うのか。',
                    questions: ['主人公は能動的ですか？　何かを決断していますか？', 'この一文だけで、初めて読む人にジャンルが伝わりますか？'],
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
                {
                    id: 'stakes',
                    text: {
                        en: 'The stakes are in it',
                        he: 'המחיר מופיע בו',
                        ar: 'ما على المحكّ واضح فيها',
                        de: 'Benennt, was auf dem Spiel steht',
                        fr: 'L’enjeu y figure',
                        es: 'Deja claro lo que está en juego',
                        ja: '失敗したときに失うものが書かれている',
                    },
                },
            ],
        },
        {
            id: 'act1',
            level: 2,
            text: {
                en: { heading: 'Act One', prompt: 'The world as it is, and the event that breaks it.' },
                he: { heading: 'מערכה ראשונה', prompt: 'העולם כמו שהוא, והאירוע ששובר אותו.' },
                ar: { heading: 'الفصل الأول', prompt: 'العالم كما هو، والحدث الذي يُخلّ بتوازنه.' },
                de: { heading: 'Erster Akt', prompt: 'Die Welt, wie sie ist, und das Ereignis, das sie aufbricht.' },
                fr: { heading: 'Premier acte', prompt: 'Le monde tel qu’il est, et l’événement qui le fait voler en éclats.' },
                es: { heading: 'Primer acto', prompt: 'El mundo tal como es, y el suceso que lo rompe.' },
                ja: { heading: '第一幕', prompt: 'ありのままの世界と、それを壊す出来事。' },
            },
            children: [
                beat('opening', 0, {
                    en: { heading: 'Opening image', prompt: 'The first picture of the hero\'s life before anything changes — the "before" the last image will answer.', questions: ['What does the hero lack, shown and not said?'] },
                    he: { heading: 'תמונת פתיחה', prompt: 'התמונה הראשונה של חיי הגיבור לפני שמשהו משתנה — ה"לפני" שתמונת הסיום תענה לו.', questions: ['מה חסר לגיבור — מוצג, לא נאמר?'] },
                    ar: { heading: 'صورة الافتتاح', prompt: 'أول صورة لحياة البطل قبل أن يتغيّر أي شيء — صورة «ما قبل» التي ستجيب عنها صورة الختام.', questions: ['ما الذي ينقص البطل؟ وهل نراه بالصورة بدل أن يُقال؟'] },
                    de: { heading: 'Eröffnungsbild', prompt: 'Das erste Bild vom Leben der Hauptfigur, bevor sich etwas ändert – das „Vorher“, auf das das Schlussbild antwortet.', questions: ['Was fehlt der Hauptfigur — gezeigt, nicht gesagt?'] },
                    fr: { heading: 'Image d’ouverture', prompt: 'La première image de la vie du héros avant que rien ne change — l’«\u00a0avant\u00a0» auquel répondra l’image finale.', questions: ['Que manque-t-il au héros — montré, pas dit\u00a0?'] },
                    es: { heading: 'Imagen de apertura', prompt: 'La primera imagen de la vida del protagonista antes de que nada cambie: el «antes» al que responderá la imagen final.', questions: ['¿Qué le falta al protagonista, mostrado y no dicho?'] },
                    ja: { heading: 'ファーストシーン', prompt: '何かが変わる前の、主人公の生活を映す最初の画。ラストシーンと対になる「変化の前」。', questions: ['主人公に欠けているものは何ですか？　セリフではなく画で見せていますか？'] },
                }),
                beat('theme', 0.05, {
                    en: { heading: 'Theme', prompt: 'Someone says, almost in passing, the thing the hero will have to learn.', questions: ['Does the hero dismiss it?'] },
                    he: { heading: 'הנושא', prompt: 'מישהו אומר, כמעט בדרך אגב, את מה שהגיבור יצטרך ללמוד.', questions: ['הגיבור מבטל את זה?'] },
                    ar: { heading: 'الثيمة', prompt: 'يقول أحدهم، عَرَضًا، ما سيضطر البطل إلى تعلّمه.', questions: ['هل يستخفّ البطل بما قيل؟'] },
                    de: { heading: 'Thema', prompt: 'Jemand spricht, fast beiläufig, aus, was die Hauptfigur noch lernen muss.', questions: ['Tut die Hauptfigur es ab?'] },
                    fr: { heading: 'Thème', prompt: 'Quelqu’un dit, presque en passant, ce que le héros va devoir apprendre.', questions: ['Le héros balaie-t-il la remarque\u00a0?'] },
                    es: { heading: 'Tema', prompt: 'Alguien dice, casi de pasada, lo que el protagonista tendrá que aprender.', questions: ['¿El protagonista lo desestima?'] },
                    ja: { heading: 'テーマ', prompt: '誰かが、ほとんど何気なく、主人公がこれから学ばなければならないことを口にする。', questions: ['主人公はそれを聞き流しますか？'] },
                }),
                beat('setup', 0.05, {
                    en: { heading: 'Setup', prompt: 'The hero\'s world, the people in it, and every flaw the story will test.', questions: ['Which of these people will matter later?'] },
                    he: { heading: 'הצגת העולם', prompt: 'העולם של הגיבור, האנשים בו, וכל חולשה שהסיפור יבחן.', questions: ['מי מהאנשים האלה יהיה חשוב בהמשך?'] },
                    ar: { heading: 'التمهيد', prompt: 'عالم البطل، والناس فيه، وكل عيب ستختبره القصة.', questions: ['أيّ هؤلاء الناس سيكون له شأن لاحقًا؟'] },
                    de: { heading: 'Exposition', prompt: 'Die Welt der Hauptfigur, die Menschen darin und jede Schwäche, die die Geschichte auf die Probe stellen wird.', questions: ['Wer von diesen Menschen wird später wichtig?'] },
                    fr: { heading: 'Exposition', prompt: 'Le monde du héros, les gens qui l’entourent, et chaque faille que l’histoire mettra à l’épreuve.', questions: ['Lesquels de ces personnages compteront plus tard\u00a0?'] },
                    es: { heading: 'Planteamiento', prompt: 'El mundo del protagonista, la gente que lo habita y cada defecto que la historia pondrá a prueba.', questions: ['¿Quiénes de estas personas importarán más adelante?'] },
                    ja: { heading: '状況設定', prompt: '主人公の世界、そこにいる人々、そして物語が試すことになるすべての欠点。', questions: ['この中の誰が、後で重要になりますか？'] },
                }),
                beat('inciting', 0.11, {
                    en: { heading: 'Inciting incident', prompt: 'The event that knocks the hero\'s life off its course. It happens to them.', questions: ['Could the story start without it?'] },
                    he: { heading: 'האירוע המחולל', prompt: 'האירוע שמוציא את חיי הגיבור ממסלולם. הוא קורה לו.', questions: ['האם הסיפור יכול להתחיל בלעדיו?'] },
                    ar: { heading: 'الحدث المحرّك', prompt: 'الحدث الذي يُخرج حياة البطل عن مسارها. إنه يقع عليه، لا يختاره.', questions: ['هل يمكن أن تبدأ القصة من دونه؟'] },
                    de: { heading: 'Auslösendes Ereignis', prompt: 'Das Ereignis, das das Leben der Hauptfigur aus der Bahn wirft. Es stößt ihr zu.', questions: ['Könnte die Geschichte auch ohne dieses Ereignis beginnen?'] },
                    fr: { heading: 'Élément déclencheur', prompt: 'L’événement qui fait dérailler la vie du héros. Il le subit.', questions: ['L’histoire pourrait-elle commencer sans lui\u00a0?'] },
                    es: { heading: 'Detonante', prompt: 'El suceso que saca de su rumbo la vida del protagonista. Le ocurre, no lo elige.', questions: ['¿Podría empezar la historia sin él?'] },
                    ja: { heading: '発端', prompt: '主人公の人生を軌道から外す出来事。それは主人公の身に降りかかる。', questions: ['この出来事がなくても、物語は始まりますか？'] },
                }),
                beat('debate', 0.11, {
                    en: { heading: 'Debate', prompt: 'The hero resists. Should they go? What would it cost?', questions: ['What makes refusing reasonable?'] },
                    he: { heading: 'התלבטות', prompt: 'הגיבור מתנגד. ללכת או לא? מה זה יעלה?', questions: ['מה הופך את הסירוב להגיוני?'] },
                    ar: { heading: 'التردّد', prompt: 'البطل يقاوم. هل يمضي؟ وما الذي سيكلّفه ذلك؟', questions: ['ما الذي يجعل الرفض معقولًا؟'] },
                    de: { heading: 'Zögern', prompt: 'Die Hauptfigur sträubt sich. Soll sie gehen? Was würde es kosten?', questions: ['Was macht die Weigerung nachvollziehbar?'] },
                    fr: { heading: 'Hésitation', prompt: 'Le héros résiste. Doit-il y aller\u00a0? Qu’est-ce que cela lui coûterait\u00a0?', questions: ['Qu’est-ce qui rend le refus raisonnable\u00a0?'] },
                    es: { heading: 'Duda', prompt: 'El protagonista se resiste. ¿Debe ir? ¿Qué le costaría?', questions: ['¿Qué hace que negarse sea razonable?'] },
                    ja: { heading: 'ためらい', prompt: '主人公はためらう。行くべきか？　その代償は何か？', questions: ['主人公が拒むのも無理はない、と思える理由は何ですか？'] },
                }),
            ],
        },
        {
            id: 'act2a',
            level: 2,
            text: {
                en: { heading: 'Act Two — first half', prompt: 'The new world, and what the premise promised.' },
                he: { heading: 'מערכה שנייה — חצי ראשון', prompt: 'העולם החדש, ומה שהרעיון הבטיח.' },
                ar: { heading: 'الفصل الثاني — النصف الأول', prompt: 'العالم الجديد، وما وعدت به الفكرة.' },
                de: { heading: 'Zweiter Akt – erste Hälfte', prompt: 'Die neue Welt und das, was die Prämisse versprochen hat.' },
                fr: { heading: 'Deuxième acte — première moitié', prompt: 'Le nouveau monde, et ce que le concept promettait.' },
                es: { heading: 'Segundo acto — primera mitad', prompt: 'El mundo nuevo y lo que prometía la premisa.' },
                ja: { heading: '第二幕（前半）', prompt: '新しい世界と、コンセプトが約束したもの。' },
            },
            children: [
                beat('break2', 0.22, {
                    en: { heading: 'Into the new world', prompt: 'The hero chooses to go. This one they decide.', questions: ['Is it a choice, or does it just happen?'] },
                    he: { heading: 'הכניסה לעולם החדש', prompt: 'הגיבור בוחר ללכת. את זה הוא מחליט.', questions: ['זו בחירה, או שזה פשוט קורה?'] },
                    ar: { heading: 'الدخول إلى العالم الجديد', prompt: 'البطل يختار أن يمضي. هذه المرة القرار قراره.', questions: ['هل هو اختيار، أم أنه يحدث فحسب؟'] },
                    de: { heading: 'Erster Plot Point', prompt: 'Die Hauptfigur entscheidet sich aufzubrechen. Diesmal ist es ihre Wahl.', questions: ['Ist es eine Entscheidung, oder passiert es einfach?'] },
                    fr: { heading: 'Entrée dans le nouveau monde', prompt: 'Le héros choisit d’y aller. Cette fois, c’est lui qui décide.', questions: ['Est-ce un choix, ou cela lui tombe-t-il simplement dessus\u00a0?'] },
                    es: { heading: 'Primer punto de giro', prompt: 'El protagonista elige ir. Esta vez, la decisión es suya.', questions: ['¿Es una elección o simplemente sucede?'] },
                    ja: { heading: '新しい世界へ', prompt: '主人公は行くことを選ぶ。今度は自分で決める。', questions: ['それは主人公の選択ですか？　それとも、ただ起きただけですか？'] },
                }),
                beat('bstory', 0.25, {
                    en: { heading: 'Second story', prompt: 'A relationship — love, friendship, a mentor — that will carry the theme.', questions: ['What does this person see in the hero that the hero does not?'] },
                    he: { heading: 'הסיפור המשני', prompt: 'קשר — אהבה, חברות, מורה — שיישא את הנושא.', questions: ['מה האדם הזה רואה בגיבור שהגיבור לא רואה?'] },
                    ar: { heading: 'الحبكة الثانوية', prompt: 'علاقة — حب، صداقة، مرشد — ستحمل الثيمة.', questions: ['ما الذي يراه هذا الشخص في البطل ولا يراه البطل في نفسه؟'] },
                    de: { heading: 'Nebenhandlung', prompt: 'Eine Beziehung – Liebe, Freundschaft, ein Mentor –, die das Thema trägt.', questions: ['Was sieht dieser Mensch in der Hauptfigur, das sie selbst nicht sieht?'] },
                    fr: { heading: 'Intrigue secondaire', prompt: 'Une relation — amour, amitié, mentor — qui portera le thème.', questions: ['Que voit cette personne dans le héros que lui-même ne voit pas\u00a0?'] },
                    es: { heading: 'Subtrama', prompt: 'Una relación —amor, amistad, un mentor— que encarnará el tema.', questions: ['¿Qué ve esta persona en el protagonista que el propio protagonista no ve?'] },
                    ja: { heading: 'サブプロット', prompt: 'テーマを運ぶ人間関係 — 恋愛、友情、師弟。', questions: ['この人物には、主人公自身が気づいていない主人公の何が見えていますか？'] },
                }),
                beat('promise', 0.25, {
                    en: { heading: 'The promise of the premise', prompt: 'The scenes the poster sold. The hero tries the new world, and mostly fails at it.', questions: ['Which of these scenes would be in the trailer?'] },
                    he: { heading: 'הבטחת הרעיון', prompt: 'הסצנות שהפוסטר מכר. הגיבור מנסה את העולם החדש, ובעיקר נכשל.', questions: ['איזו מהסצנות האלה תהיה בטריילר?'] },
                    ar: { heading: 'وعد الفكرة', prompt: 'المشاهد التي وعد بها الملصق الدعائي. البطل يجرّب العالم الجديد، ويفشل في معظم الأحيان.', questions: ['أيّ هذه المشاهد سيظهر في الإعلان الترويجي؟'] },
                    de: { heading: 'Das Versprechen der Prämisse', prompt: 'Die Szenen, die das Plakat verkauft hat. Die Hauptfigur probiert die neue Welt aus und scheitert meist daran.', questions: ['Welche dieser Szenen käme in den Trailer?'] },
                    fr: { heading: 'La promesse du concept', prompt: 'Les scènes que l’affiche a vendues. Le héros s’essaie au nouveau monde, et s’y casse surtout les dents.', questions: ['Laquelle de ces scènes serait dans la bande-annonce\u00a0?'] },
                    es: { heading: 'La promesa de la premisa', prompt: 'Las escenas que vendió el póster. El protagonista prueba el mundo nuevo y casi siempre fracasa en él.', questions: ['¿Cuál de estas escenas estaría en el tráiler?'] },
                    ja: { heading: 'コンセプトの見せ場', prompt: 'ポスターが売り込んだ場面。主人公は新しい世界に挑み、たいていは失敗する。', questions: ['この中のどの場面が予告編に入りますか？'] },
                }),
                beat('midpoint', 0.5, {
                    en: { heading: 'Midpoint', prompt: 'A false victory or a false defeat. The stakes rise and the clock starts.', questions: ['What can no longer be undone after this?'] },
                    he: { heading: 'נקודת האמצע', prompt: 'ניצחון מדומה או תבוסה מדומה. המחיר עולה והשעון מתחיל לתקתק.', questions: ['מה כבר אי אפשר לבטל אחרי זה?'] },
                    ar: { heading: 'نقطة المنتصف', prompt: 'انتصار زائف أو هزيمة زائفة. يرتفع ما على المحكّ ويبدأ العدّ التنازلي.', questions: ['ما الذي لم يعد ممكنًا التراجع عنه بعد هذا؟'] },
                    de: { heading: 'Midpoint', prompt: 'Ein falscher Sieg oder eine falsche Niederlage. Jetzt steht mehr auf dem Spiel, und die Uhr beginnt zu ticken.', questions: ['Was lässt sich danach nicht mehr rückgängig machen?'] },
                    fr: { heading: 'Point médian', prompt: 'Une fausse victoire ou une fausse défaite. L’enjeu grandit et le compte à rebours commence.', questions: ['Qu’est-ce qui devient irréversible à partir de là\u00a0?'] },
                    es: { heading: 'Punto medio', prompt: 'Una falsa victoria o una falsa derrota. Lo que está en juego crece y empieza la cuenta atrás.', questions: ['¿Qué ya no tiene vuelta atrás después de esto?'] },
                    ja: { heading: 'ミッドポイント', prompt: '偽りの勝利、あるいは偽りの敗北。失うものが大きくなり、タイムリミットが動き出す。', questions: ['ここから先、もう取り返しのつかないことは何ですか？'] },
                }),
            ],
        },
        {
            id: 'act2b',
            level: 2,
            text: {
                en: { heading: 'Act Two — second half', prompt: 'Everything closes in, inside and out.' },
                he: { heading: 'מערכה שנייה — חצי שני', prompt: 'הכול נסגר על הגיבור, מבחוץ ומבפנים.' },
                ar: { heading: 'الفصل الثاني — النصف الثاني', prompt: 'كل شيء يضيق على البطل، من الخارج ومن الداخل.' },
                de: { heading: 'Zweiter Akt – zweite Hälfte', prompt: 'Alles zieht sich zusammen, außen wie innen.' },
                fr: { heading: 'Deuxième acte — seconde moitié', prompt: 'Tout se resserre, au-dehors comme au-dedans.' },
                es: { heading: 'Segundo acto — segunda mitad', prompt: 'Todo se cierra sobre el protagonista, por fuera y por dentro.' },
                ja: { heading: '第二幕（後半）', prompt: '外からも内からも、すべてが主人公を追い詰めていく。' },
            },
            children: [
                beat('pressure', 0.5, {
                    en: { heading: 'Pressure rises', prompt: 'The opposition regroups; the hero\'s own flaws do the rest.', questions: ['Is the danger from outside, inside, or both?'] },
                    he: { heading: 'הלחץ גובר', prompt: 'הצד שכנגד מתארגן מחדש; החולשות של הגיבור עושות את השאר.', questions: ['הסכנה מבחוץ, מבפנים, או משניהם?'] },
                    ar: { heading: 'تصاعد الضغط', prompt: 'الخصوم يعيدون رصّ صفوفهم، وعيوب البطل نفسه تتكفّل بالباقي.', questions: ['هل الخطر من الخارج، أم من الداخل، أم من كليهما؟'] },
                    de: { heading: 'Der Druck steigt', prompt: 'Die Gegenseite formiert sich neu; die eigenen Schwächen der Hauptfigur erledigen den Rest.', questions: ['Kommt die Gefahr von außen, von innen oder von beiden Seiten?'] },
                    fr: { heading: 'La pression monte', prompt: 'L’adversaire se réorganise\u00a0; les propres failles du héros font le reste.', questions: ['Le danger vient-il de l’extérieur, de l’intérieur, ou des deux\u00a0?'] },
                    es: { heading: 'La presión aumenta', prompt: 'La oposición se reagrupa; los propios defectos del protagonista hacen el resto.', questions: ['¿El peligro viene de fuera, de dentro o de ambos lados?'] },
                    ja: { heading: '高まる圧力', prompt: '敵対する力が態勢を立て直し、あとは主人公自身の欠点がとどめを刺す。', questions: ['危険は外からですか、内からですか、それとも両方ですか？'] },
                }),
                beat('lowest', 0.68, {
                    en: { heading: 'The lowest point', prompt: 'The worst thing happens. Something — or someone — is lost.', questions: ['What does the hero believe now that they did not at the start?'] },
                    he: { heading: 'נקודת השפל', prompt: 'הדבר הגרוע ביותר קורה. משהו — או מישהו — אובד.', questions: ['במה הגיבור מאמין עכשיו שלא האמין בהתחלה?'] },
                    ar: { heading: 'القاع', prompt: 'يقع أسوأ ما يمكن. يُفقَد شيء ما — أو شخص ما.', questions: ['بماذا يؤمن البطل الآن ولم يكن يؤمن به في البداية؟'] },
                    de: { heading: 'Der Tiefpunkt', prompt: 'Das Schlimmste passiert. Etwas – oder jemand – geht verloren.', questions: ['Was glaubt die Hauptfigur jetzt, was sie am Anfang nicht geglaubt hat?'] },
                    fr: { heading: 'Le point le plus bas', prompt: 'Le pire arrive. Quelque chose — ou quelqu’un — est perdu.', questions: ['Que croit le héros maintenant qu’il ne croyait pas au départ\u00a0?'] },
                    es: { heading: 'El punto más bajo', prompt: 'Ocurre lo peor. Algo —o alguien— se pierde.', questions: ['¿Qué cree ahora el protagonista que no creía al principio?'] },
                    ja: { heading: 'どん底', prompt: '最悪のことが起きる。何かが、あるいは誰かが失われる。', questions: ['主人公が今は信じていて、冒頭では信じていなかったことは何ですか？'] },
                }),
                beat('reckoning', 0.68, {
                    en: { heading: 'Reckoning', prompt: 'The hero sits with the loss, and finally understands the theme.', questions: ['Where is the line from the Theme beat answered?'] },
                    he: { heading: 'חשבון נפש', prompt: 'הגיבור נשאר עם האובדן, ומבין סוף סוף את הנושא.', questions: ['איפה מקבלת המשפט מנקודת "הנושא" את התשובה שלו?'] },
                    ar: { heading: 'مواجهة الذات', prompt: 'يختلي البطل بخسارته، ويفهم الثيمة أخيرًا.', questions: ['أين تجد الجملة التي قيلت في محطة «الثيمة» جوابها؟'] },
                    de: { heading: 'Selbsterkenntnis', prompt: 'Die Hauptfigur bleibt mit dem Verlust allein und begreift endlich das Thema.', questions: ['Wo bekommt der Satz aus dem Beat „Thema“ seine Antwort?'] },
                    fr: { heading: 'Remise en question', prompt: 'Le héros reste seul avec sa perte, et comprend enfin le thème.', questions: ['Où la réplique du temps fort «\u00a0Thème\u00a0» trouve-t-elle sa réponse\u00a0?'] },
                    es: { heading: 'Examen de conciencia', prompt: 'El protagonista se queda a solas con la pérdida y por fin entiende el tema.', questions: ['¿Dónde encuentra respuesta la frase del punto «Tema»?'] },
                    ja: { heading: '内省', prompt: '主人公は喪失と向き合い、ついにテーマを理解する。', questions: ['「テーマ」で語られた一言は、どこで答えを得ますか？'] },
                }),
            ],
        },
        {
            id: 'act3',
            level: 2,
            text: {
                en: { heading: 'Act Three', prompt: 'The hero acts on what they learned.' },
                he: { heading: 'מערכה שלישית', prompt: 'הגיבור פועל לפי מה שלמד.' },
                ar: { heading: 'الفصل الثالث', prompt: 'البطل يتصرّف بما تعلّمه.' },
                de: { heading: 'Dritter Akt', prompt: 'Die Hauptfigur handelt nach dem, was sie gelernt hat.' },
                fr: { heading: 'Troisième acte', prompt: 'Le héros agit selon ce qu’il a appris.' },
                es: { heading: 'Tercer acto', prompt: 'El protagonista actúa según lo que ha aprendido.' },
                ja: { heading: '第三幕', prompt: '主人公は学んだことをもとに行動する。' },
            },
            children: [
                beat('break3', 0.77, {
                    en: { heading: 'Into the final act', prompt: 'The idea that joins the two stories into one plan.', questions: ['Does the second story give the hero the answer?'] },
                    he: { heading: 'הכניסה למערכה השלישית', prompt: 'הרעיון שמחבר את שני הסיפורים לתוכנית אחת.', questions: ['האם הסיפור המשני נותן לגיבור את התשובה?'] },
                    ar: { heading: 'الدخول إلى الفصل الأخير', prompt: 'الفكرة التي تجمع الحبكتين في خطة واحدة.', questions: ['هل تمنح الحبكة الثانوية البطلَ الجواب؟'] },
                    de: { heading: 'Zweiter Plot Point', prompt: 'Die Idee, die beide Handlungsstränge zu einem Plan verbindet.', questions: ['Liefert die Nebenhandlung der Hauptfigur die Antwort?'] },
                    fr: { heading: 'Entrée dans le dernier acte', prompt: 'L’idée qui réunit les deux intrigues en un seul plan.', questions: ['L’intrigue secondaire donne-t-elle la réponse au héros\u00a0?'] },
                    es: { heading: 'Segundo punto de giro', prompt: 'La idea que une las dos tramas en un solo plan.', questions: ['¿Le da la subtrama la respuesta al protagonista?'] },
                    ja: { heading: '最終幕へ', prompt: 'メインプロットとサブプロットを一つの計画に結びつけるアイデア。', questions: ['サブプロットが主人公に答えを与えていますか？'] },
                }),
                beat('finale', 0.77, {
                    en: { heading: 'Finale', prompt: 'The plan, its collapse, and the hero\'s change made into action.', questions: ['Would the hero of page one have won this?'] },
                    he: { heading: 'השיא', prompt: 'התוכנית, הקריסה שלה, והשינוי של הגיבור שהופך למעשה.', questions: ['האם הגיבור מהעמוד הראשון היה מנצח כאן?'] },
                    ar: { heading: 'الذروة', prompt: 'الخطة، وانهيارها، وتحوّل البطل وقد ترجمه إلى فعل.', questions: ['هل كان بطل الصفحة الأولى سينتصر هنا؟'] },
                    de: { heading: 'Höhepunkt', prompt: 'Der Plan, sein Scheitern und die Wandlung der Hauptfigur, die zur Tat wird.', questions: ['Hätte die Hauptfigur von Seite eins das hier gewonnen?'] },
                    fr: { heading: 'Climax', prompt: 'Le plan, son effondrement, et le changement du héros traduit en actes.', questions: ['Le héros de la première page l’aurait-il emporté ici\u00a0?'] },
                    es: { heading: 'Clímax', prompt: 'El plan, su derrumbe y el cambio del protagonista convertido en acción.', questions: ['¿Habría ganado aquí el protagonista de la primera página?'] },
                    ja: { heading: 'クライマックス', prompt: '計画、その崩壊、そして行動となって表れる主人公の変化。', questions: ['1ページ目の主人公のままで、ここで勝てたでしょうか？'] },
                }),
                beat('closing', 0.99, {
                    en: { heading: 'Closing image', prompt: 'The opening image, answered: proof the change is real.', questions: ['Put it next to the opening — is the difference visible?'] },
                    he: { heading: 'תמונת סיום', prompt: 'תמונת הפתיחה, עם תשובה: הוכחה שהשינוי אמיתי.', questions: ['שים אותה ליד תמונת הפתיחה — רואים את ההבדל?'] },
                    ar: { heading: 'صورة الختام', prompt: 'صورة الافتتاح وقد جاءها الردّ: دليل على أن التحوّل حقيقي.', questions: ['ضعها إلى جانب صورة الافتتاح — هل الفرق ظاهر؟'] },
                    de: { heading: 'Schlussbild', prompt: 'Die Antwort auf das Eröffnungsbild: der Beweis, dass die Wandlung echt ist.', questions: ['Leg es neben das Eröffnungsbild – sieht man den Unterschied?'] },
                    fr: { heading: 'Image finale', prompt: 'La réponse à l’image d’ouverture\u00a0: la preuve que le changement est réel.', questions: ['Mettez-la en regard de l’image d’ouverture\u00a0: la différence saute-t-elle aux yeux\u00a0?'] },
                    es: { heading: 'Imagen final', prompt: 'La respuesta a la imagen de apertura: la prueba de que el cambio es real.', questions: ['Ponla junto a la imagen de apertura: ¿se ve la diferencia?'] },
                    ja: { heading: 'ラストシーン', prompt: 'ファーストシーンへの答え。変化が本物である証。', questions: ['ファーストシーンと並べてみて、違いが目に見えますか？'] },
                }),
            ],
        },
    ],
};
