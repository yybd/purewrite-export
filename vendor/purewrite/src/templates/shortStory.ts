import type { Localized, TemplateDef } from './types';

/**
 * A short story, as the writing workshops teach it: one character, one
 * change, told from one place — and the reminder to show it rather than
 * explain it. The parts are for planning and drafting; the finished story
 * reads straight through, without them.
 */

const SHOW: Localized = {
    en: 'Shown in a scene, not explained',
    he: 'מוצג בסצנה, לא מוסבר',
    ar: 'يظهر في مشهد، ولا يُشرح',
    de: 'In einer Szene gezeigt, nicht erklärt',
    fr: 'Montré dans une scène, pas expliqué',
    es: 'Se muestra en una escena, no se explica',
    ja: '説明せず、場面で見せている',
};

export const shortStory: TemplateDef = {
    schema: 1,
    id: 'fiction.short-story',
    version: '1.0.0',
    source: 'bundled',
    family: 'fiction',
    info: {
        en: { title: 'Short story', description: 'One character, one change, one point of view: the story planned part by part, the way the workshops teach it.', file: 'Short story' },
        he: { title: 'סיפור קצר', description: 'דמות אחת, שינוי אחד, נקודת מבט אחת: הסיפור מתוכנן חלק אחרי חלק, כמו שמלמדים בסדנאות.', file: 'סיפור קצר' },
        ar: { title: 'قصة قصيرة', description: 'شخصية واحدة، وتغيّر واحد، ووجهة نظر واحدة: القصة مخططة جزءًا جزءًا، كما تُعلَّم في ورش الكتابة.', file: 'قصة قصيرة' },
        de: { title: 'Kurzgeschichte', description: 'Eine Figur, eine Veränderung, eine Perspektive: die Geschichte Teil für Teil geplant, wie man es in Schreibwerkstätten lernt.', file: 'Kurzgeschichte' },
        fr: { title: 'Nouvelle', description: 'Un personnage, un changement, un point de vue : la nouvelle construite partie par partie, comme on l’enseigne en atelier d’écriture.', file: 'Nouvelle' },
        es: { title: 'Cuento', description: 'Un personaje, un cambio, un punto de vista: el cuento planificado parte por parte, como se enseña en los talleres de escritura.', file: 'Cuento' },
        ja: { title: '短編小説', description: '一人の人物、一つの変化、一つの視点。創作講座で教わるとおりに、短編をパートごとに組み立てます。', file: '短編小説' },
    },
    nodes: [
        { id: 'seed', level: 2, target: { max: 80 }, text: {
            en: { heading: 'The seed', prompt: 'What the story is about, under the plot: a feeling, a question, an image you cannot let go of.' },
            he: { heading: 'הגרעין', prompt: 'על מה הסיפור, מתחת לעלילה: תחושה, שאלה, תמונה שלא מרפה.' },
            ar: { heading: 'البذرة', prompt: 'عمّ تدور القصة تحت سطح الأحداث: إحساس، أو سؤال، أو صورة لا تفارقك.' },
            de: { heading: 'Die Keimzelle', prompt: 'Worum es unter der Handlung eigentlich geht: ein Gefühl, eine Frage, ein Bild, das dich nicht loslässt.' },
            fr: { heading: 'Le germe', prompt: 'Ce dont parle l’histoire, sous l’intrigue : un sentiment, une question, une image qui ne vous quitte pas.' },
            es: { heading: 'La semilla', prompt: 'De qué trata el cuento por debajo de la trama: una sensación, una pregunta, una imagen que no te suelta.' },
            ja: { heading: '物語の種', prompt: 'あらすじの奥で、この物語は何を語るのか。感情、問い、頭から離れないイメージなど。' },
        } },
        { id: 'narrator', level: 2, target: { max: 100 }, text: {
            en: { heading: 'Point of view and narrator', prompt: 'Who tells it — first person, close third, someone looking back — and why this voice.', questions: ['What can this narrator not know?'] },
            he: { heading: 'נקודת מבט ומספר', prompt: 'מי מספר — גוף ראשון, גוף שלישי צמוד, מישהו שמביט לאחור — ולמה דווקא הקול הזה.', questions: ['מה המספר הזה לא יכול לדעת?'] },
            ar: { heading: 'وجهة النظر والراوي', prompt: 'من يروي — بضمير المتكلم، أو بضمير الغائب القريب من الشخصية، أو شخص ينظر إلى الماضي — ولماذا هذا الصوت تحديدًا.', questions: ['ما الذي لا يمكن لهذا الراوي أن يعرفه؟'] },
            de: { heading: 'Perspektive und Erzählstimme', prompt: 'Wer erzählt – in der Ich-Form, personal in der dritten Person, jemand im Rückblick – und warum gerade diese Stimme.', questions: ['Was kann diese Erzählstimme nicht wissen?'] },
            fr: { heading: 'Point de vue et narrateur', prompt: 'Qui raconte — à la première personne, en focalisation interne à la troisième, quelqu’un qui regarde en arrière — et pourquoi cette voix.', questions: ['Qu’est-ce que ce narrateur ne peut pas savoir ?'] },
            es: { heading: 'Punto de vista y narrador', prompt: 'Quién lo cuenta —primera persona, tercera cercana, alguien que mira atrás— y por qué esta voz.', questions: ['¿Qué no puede saber este narrador?'] },
            ja: { heading: '視点と語り手', prompt: '誰が語るのか。一人称、三人称一元視点、過去を振り返る語り手など。そして、なぜこの声なのか。', questions: ['この語り手に知り得ないことは何ですか？'] },
        } },
        { id: 'character', level: 2, target: { max: 150 }, text: {
            en: { heading: 'The character', prompt: 'Who they are, what they want, and what they are hiding — even from themselves.' },
            he: { heading: 'הדמות', prompt: 'מי היא, מה היא רוצה, ומה היא מסתירה — גם מעצמה.' },
            ar: { heading: 'الشخصية', prompt: 'من هي، وماذا تريد، وماذا تخفي — حتى عن نفسها.' },
            de: { heading: 'Die Figur', prompt: 'Wer sie ist, was sie will und was sie verbirgt – sogar vor sich selbst.' },
            fr: { heading: 'Le personnage', prompt: 'Qui il est, ce qu’il veut et ce qu’il cache — même à lui-même.' },
            es: { heading: 'El personaje', prompt: 'Quién es, qué quiere y qué oculta, incluso a sí mismo.' },
            ja: { heading: '主人公', prompt: 'どんな人物で、何を望み、何を隠しているのか。本人さえ気づかずに隠しているものも。' },
        } },
        { id: 'opening', level: 2, target: { min: 100, max: 600 }, text: {
            en: { heading: 'Opening', prompt: 'Start late: in the middle of something, with the character already in motion.', questions: ['Does the first sentence make the second one necessary?'] },
            he: { heading: 'פתיחה', prompt: 'להתחיל מאוחר: באמצע משהו, כשהדמות כבר בתנועה.', questions: ['המשפט הראשון מחייב את השני?'] },
            ar: { heading: 'الافتتاحية', prompt: 'ابدأ متأخرًا: في منتصف حدث ما، والشخصية في حركة بالفعل.', questions: ['هل تجعل الجملة الأولى الجملةَ الثانية ضرورية؟'] },
            de: { heading: 'Einstieg', prompt: 'Steig spät ein: mitten in etwas, während die Figur schon in Bewegung ist.', questions: ['Macht der erste Satz den zweiten notwendig?'] },
            fr: { heading: 'Incipit', prompt: 'Commencez tard : au milieu de quelque chose, le personnage déjà en mouvement.', questions: ['La première phrase rend-elle la deuxième nécessaire ?'] },
            es: { heading: 'Inicio', prompt: 'Empieza tarde: en mitad de algo, con el personaje ya en movimiento.', questions: ['¿La primera frase hace necesaria la segunda?'] },
            ja: { heading: '書き出し', prompt: '遅めに始めます。何かの途中、人物がすでに動いているところから。', questions: ['最初の一文は、次の一文を必然にしていますか？'] },
        }, checks: [{ id: 'show', text: SHOW }] },
        { id: 'conflict', level: 2, target: { min: 200, max: 1500 }, text: {
            en: { heading: 'Rising conflict', prompt: 'What presses on the character, scene by scene, until something has to give.' },
            he: { heading: 'הקונפליקט מסלים', prompt: 'מה לוחץ על הדמות, סצנה אחרי סצנה, עד שמשהו חייב להישבר.' },
            ar: { heading: 'تصاعد الصراع', prompt: 'ما الذي يضغط على الشخصية، مشهدًا بعد مشهد، حتى يتحتم أن ينكسر شيء ما.' },
            de: { heading: 'Steigender Konflikt', prompt: 'Was die Figur unter Druck setzt, Szene für Szene, bis etwas nachgeben muss.' },
            fr: { heading: 'Montée du conflit', prompt: 'Ce qui pèse sur le personnage, scène après scène, jusqu’à ce que quelque chose cède.' },
            es: { heading: 'Nudo', prompt: 'Lo que presiona al personaje, escena tras escena, hasta que algo tiene que ceder.' },
            ja: { heading: '高まる葛藤', prompt: '人物を追い詰めるものを、場面を重ねて描きます。何かが崩れずにはいられなくなるまで。' },
        }, checks: [{ id: 'show', text: SHOW }] },
        { id: 'turn', level: 2, target: { min: 100, max: 800 }, text: {
            en: { heading: 'The turn', prompt: 'The moment of change — a choice, a realisation, a loss.', questions: ['Is it the character who changes, or only the situation?'] },
            he: { heading: 'המפנה', prompt: 'רגע השינוי — בחירה, הבנה, אובדן.', questions: ['הדמות משתנה, או רק המצב?'] },
            ar: { heading: 'نقطة التحول', prompt: 'لحظة التغيّر — قرار، أو إدراك، أو فقد.', questions: ['هل الشخصية هي التي تتغيّر، أم الموقف فقط؟'] },
            de: { heading: 'Die Wende', prompt: 'Der Moment der Veränderung – eine Entscheidung, eine Erkenntnis, ein Verlust.', questions: ['Verändert sich die Figur oder nur die Lage?'] },
            fr: { heading: 'Le tournant', prompt: 'L’instant du changement — un choix, une prise de conscience, une perte.', questions: ['Est-ce le personnage qui change, ou seulement la situation ?'] },
            es: { heading: 'El giro', prompt: 'El momento del cambio: una decisión, una revelación, una pérdida.', questions: ['¿Cambia el personaje, o solo la situación?'] },
            ja: { heading: '転換点', prompt: '変化の瞬間。選択、気づき、喪失など。', questions: ['変わるのは人物ですか、それとも状況だけですか？'] },
        }, checks: [{ id: 'show', text: SHOW }] },
        { id: 'ending', level: 2, target: { min: 50, max: 500 }, text: {
            en: { heading: 'Ending', prompt: 'Leave the reader with the change, not a lesson. Often an image.', questions: ['Does it echo the opening?'] },
            he: { heading: 'סיום', prompt: 'להשאיר את הקורא עם השינוי, לא עם מוסר השכל. לעתים קרובות — תמונה.', questions: ['הוא מהדהד את הפתיחה?'] },
            ar: { heading: 'الخاتمة', prompt: 'اترك القارئ مع التغيّر، لا مع عبرة. وكثيرًا ما تكون صورة.', questions: ['هل تتردد فيها أصداء الافتتاحية؟'] },
            de: { heading: 'Schluss', prompt: 'Lass die Leserschaft mit der Veränderung zurück, nicht mit einer Moral. Oft genügt ein Bild.', questions: ['Klingt darin der Einstieg nach?'] },
            fr: { heading: 'Dénouement', prompt: 'Laissez le lecteur avec le changement, pas avec une leçon. Souvent, une image.', questions: ['Fait-il écho à l’incipit ?'] },
            es: { heading: 'Desenlace', prompt: 'Deja al lector con el cambio, no con una moraleja. A menudo, una imagen.', questions: ['¿Hace eco del inicio?'] },
            ja: { heading: '結末', prompt: '読者に残すのは教訓ではなく、変化です。多くの場合、一つのイメージで。', questions: ['書き出しと響き合っていますか？'] },
        } },
    ],
};
