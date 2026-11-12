import type { Localized, NodeDef, NodeText, TemplateDef } from './types';

/**
 * The pilot of a drama series as European broadcasters and the streamers
 * commission it: an episode of about fifty minutes with no ad breaks, so
 * there are no act-outs to write to — four acts, each ending on a turning
 * point, and a cold open if the writer wants one. Before the episode, the
 * documents a commissioning editor reads first: the series, its characters,
 * and the arc of the season. The American network hour is tvPilot.
 */

const TURN: Localized = {
    en: 'Ends on a turning point',
    he: 'נגמרת בנקודת מפנה',
    de: 'Endet mit einem Wendepunkt',
    fr: 'Se termine sur un retournement',
    es: 'Termina en un punto de giro',
};

function act(id: string, position: number, text: Localized<NodeText>): NodeDef {
    return { id, level: 2, position, target: { min: 100, max: 600 }, text, checks: [{ id: 'turn', text: TURN }] };
}

export const seriesPilot: TemplateDef = {
    schema: 1,
    id: 'screen.series-pilot',
    version: '1.0.0',
    source: 'bundled',
    family: 'screenplay',
    info: {
        en: {
            title: 'Drama series pilot — streaming and public TV',
            description: 'An episode of about fifty minutes with no ad breaks, as European broadcasters and the streamers commission it: the series, the season, and the pilot in four acts.',
            file: 'Pilot outline',
        },
        he: {
            title: 'פיילוט לסדרת דרמה — סטרימינג ושידור ציבורי',
            description: 'פרק של כחמישים דקות בלי הפסקות פרסומות, כמו שמזמינים גופי השידור באירופה ופלטפורמות הסטרימינג: הסדרה, העונה, והפיילוט בארבע מערכות.',
            file: 'מתווה פיילוט',
        },
        de: {
            title: 'Pilotfolge einer Dramaserie – Streaming und öffentlich-rechtlich',
            description: 'Eine Folge von etwa fünfzig Minuten ohne Werbepausen, wie Sender und Streamingdienste in Europa sie beauftragen: die Serie, die Staffel und der Pilot in vier Akten.',
            file: 'Pilot-Outline',
        },
        fr: {
            title: 'Pilote de série dramatique — 52 minutes',
            description: 'Un épisode d’environ cinquante minutes sans coupure publicitaire, comme le commandent les chaînes européennes et les plateformes : la série, la saison, et le pilote en quatre actes.',
            file: 'Séquencier du pilote',
        },
        es: {
            title: 'Piloto de serie dramática — plataformas y televisión pública',
            description: 'Un episodio de unos cincuenta minutos sin pausas publicitarias, como lo encargan las cadenas europeas y las plataformas: la serie, la temporada y el piloto en cuatro actos.',
            file: 'Escaleta del piloto',
        },
    },
    total: { value: 50, unit: 'pages' },
    nodes: [
        {
            id: 'logline',
            level: 2,
            target: { max: 50, hard: true },
            text: {
                en: { heading: 'Logline', prompt: 'One sentence for the series: who, in what world, wanting what, against what.', questions: ['Does it promise a season, not only an episode?'] },
                he: { heading: 'משפט מפתח', prompt: 'משפט אחד לסדרה: מי, באיזה עולם, רוצה מה, מול מה.', questions: ['הוא מבטיח עונה, ולא רק פרק?'] },
                de: { heading: 'Logline', prompt: 'Ein Satz für die Serie: wer, in welcher Welt, will was, gegen welchen Widerstand.', questions: ['Verspricht sie eine Staffel und nicht nur eine Folge?'] },
                fr: { heading: 'Logline', prompt: 'Une phrase pour la série : qui, dans quel monde, veut quoi, contre quoi.', questions: ['Promet-elle une saison, et pas seulement un épisode ?'] },
                es: { heading: 'Logline', prompt: 'Una frase para la serie: quién, en qué mundo, quiere qué, contra qué.', questions: ['¿Promete una temporada, y no solo un episodio?'] },
            },
            checks: [{
                id: 'length',
                auto: { rule: 'within-target' },
                text: { en: 'One sentence, under 50 words', he: 'משפט אחד, עד 50 מילים', de: 'Ein Satz, höchstens 50 Wörter', fr: 'Une phrase, 50 mots au maximum', es: 'Una frase, máximo 50 palabras' },
            }],
        },
        {
            id: 'concept',
            level: 2,
            target: { min: 150, max: 500 },
            text: {
                en: { heading: 'The series', prompt: 'What it is about, its tone, and why it is told now: what a commissioning editor needs to say yes.', questions: ['Why this story now, and why as a series?', 'Which series would sit beside it on the platform?'] },
                he: { heading: 'הסדרה', prompt: 'על מה היא, הטון שלה, ולמה מספרים אותה עכשיו: מה שעורך תוכן צריך כדי לומר כן.', questions: ['למה הסיפור הזה עכשיו, ולמה כסדרה?', 'ליד אילו סדרות היא תעמוד בפלטפורמה?'] },
                de: { heading: 'Serienkonzept', prompt: 'Worum es geht, der Ton und warum die Geschichte jetzt erzählt wird – das, was eine Redaktion braucht, um Ja zu sagen.', questions: ['Warum diese Geschichte jetzt, und warum als Serie?', 'Neben welchen Serien stünde sie im Programm?'] },
                fr: { heading: 'Note d’intention', prompt: 'De quoi parle la série, son ton, et pourquoi la raconter maintenant : ce dont un diffuseur a besoin pour dire oui.', questions: ['Pourquoi cette histoire maintenant, et pourquoi en série ?', 'À côté de quelles séries serait-elle programmée ?'] },
                es: { heading: 'La serie', prompt: 'De qué trata, su tono y por qué contarla ahora: lo que una cadena o plataforma necesita para decir que sí.', questions: ['¿Por qué esta historia ahora, y por qué como serie?', '¿Junto a qué series estaría en el catálogo?'] },
            },
        },
        {
            id: 'characters',
            level: 2,
            target: { min: 150, max: 600 },
            text: {
                en: { heading: 'Main characters', prompt: 'A short paragraph for each lead: what they want, what they hide, and what the season will cost them.', questions: ['Does every lead change across the season?'] },
                he: { heading: 'הדמויות הראשיות', prompt: 'פסקה קצרה לכל דמות מובילה: מה היא רוצה, מה היא מסתירה, ומה העונה תעלה לה.', questions: ['כל דמות מובילה משתנה לאורך העונה?'] },
                de: { heading: 'Hauptfiguren', prompt: 'Ein kurzer Absatz pro Hauptfigur: was sie will, was sie verbirgt und was die Staffel sie kostet.', questions: ['Verändert sich jede Hauptfigur im Lauf der Staffel?'] },
                fr: { heading: 'Personnages principaux', prompt: 'Un court paragraphe par personnage principal : ce qu’il veut, ce qu’il cache, et ce que la saison lui coûtera.', questions: ['Chaque personnage principal change-t-il au fil de la saison ?'] },
                es: { heading: 'Personajes principales', prompt: 'Un párrafo breve por protagonista: qué quiere, qué oculta y qué le costará la temporada.', questions: ['¿Cambia cada protagonista a lo largo de la temporada?'] },
            },
        },
        {
            id: 'season',
            level: 2,
            target: { min: 150, max: 500 },
            text: {
                en: { heading: 'The season arc', prompt: 'Where the season starts and where it ends: the question the first episode raises and the last one answers.', questions: ['What do we know in the finale that we do not know in episode one?'] },
                he: { heading: 'קשת העונה', prompt: 'איפה העונה מתחילה ואיפה היא נגמרת: השאלה שהפרק הראשון מעלה והפרק האחרון עונה עליה.', questions: ['מה נדע בפרק האחרון שאיננו יודעים בפרק הראשון?'] },
                de: { heading: 'Staffelbogen', prompt: 'Wo die Staffel beginnt und wo sie endet: die Frage, die Folge eins stellt und das Finale beantwortet.', questions: ['Was wissen wir im Finale, was wir in Folge eins noch nicht wissen?'] },
                fr: { heading: 'Arche de la saison', prompt: 'Où la saison commence et où elle finit : la question que pose le premier épisode et à laquelle répond le dernier.', questions: ['Que savons-nous dans le dernier épisode que nous ignorions dans le premier ?'] },
                es: { heading: 'Arco de la temporada', prompt: 'Dónde empieza la temporada y dónde termina: la pregunta que abre el primer episodio y responde el último.', questions: ['¿Qué sabemos en el final de temporada que no sabíamos en el primer episodio?'] },
            },
            checks: [{ id: 'finale', text: { en: 'The question of the finale is named', he: 'שאלת הסיום מנוסחת', de: 'Die Frage des Finales ist benannt', fr: 'La question du final est formulée', es: 'La pregunta del final está planteada' } }],
        },
        {
            id: 'cold-open',
            level: 2,
            position: 0,
            target: { max: 300 },
            text: {
                en: { heading: 'Cold open', prompt: 'An optional first scene before the titles: the tone and the world, at once.', questions: ['Would we know the genre after this scene alone?'] },
                he: { heading: 'פתיחה קרה', prompt: 'סצנה ראשונה, לא חובה, לפני הכותרות: הטון והעולם, מיד.', questions: ['נדע מה הז\'אנר רק מהסצנה הזאת?'] },
                de: { heading: 'Cold Open', prompt: 'Eine erste Szene vor dem Vorspann, wenn du willst: Ton und Welt, sofort.', questions: ['Kennt man nach dieser Szene schon das Genre?'] },
                fr: { heading: 'Pré-générique', prompt: 'Une première scène facultative avant le générique : le ton et le monde, d’emblée.', questions: ['Devine-t-on le genre dès cette scène ?'] },
                es: { heading: 'Arranque en frío', prompt: 'Una primera escena opcional antes de los créditos: el tono y el mundo, de entrada.', questions: ['¿Se adivina el género solo con esta escena?'] },
            },
        },
        act('act1', 0.05, {
            en: { heading: 'Act One', prompt: 'The lead’s world, and the event of this episode that breaks into it.', questions: ['By the end of the act, is it clear what the episode is about?'] },
            he: { heading: 'מערכה ראשונה', prompt: 'העולם של הדמות הראשית, והאירוע של הפרק הזה שפורץ לתוכו.', questions: ['בסוף המערכה ברור על מה הפרק?'] },
            de: { heading: 'Erster Akt', prompt: 'Die Welt der Hauptfigur und das Ereignis dieser Folge, das in sie einbricht.', questions: ['Ist am Ende des Akts klar, worum es in der Folge geht?'] },
            fr: { heading: 'Premier acte', prompt: 'Le monde du personnage principal, et l’événement de cet épisode qui y fait irruption.', questions: ['À la fin de l’acte, sait-on de quoi parle l’épisode ?'] },
            es: { heading: 'Primer acto', prompt: 'El mundo del protagonista y el suceso de este episodio que irrumpe en él.', questions: ['Al final del acto, ¿está claro de qué trata el episodio?'] },
        }),
        act('act2', 0.3, {
            en: { heading: 'Act Two', prompt: 'The first answer to the problem, and why it falls short. The second story line begins.', questions: ['What does the lead risk here?'] },
            he: { heading: 'מערכה שנייה', prompt: 'התשובה הראשונה לבעיה, ולמה היא לא מספיקה. קו העלילה השני מתחיל.', questions: ['מה הדמות הראשית מסכנת כאן?'] },
            de: { heading: 'Zweiter Akt', prompt: 'Die erste Antwort auf das Problem – und warum sie nicht reicht. Der zweite Handlungsstrang beginnt.', questions: ['Was riskiert die Hauptfigur hier?'] },
            fr: { heading: 'Deuxième acte', prompt: 'La première réponse au problème, et pourquoi elle ne suffit pas. L’intrigue secondaire commence.', questions: ['Que risque le personnage principal ici ?'] },
            es: { heading: 'Segundo acto', prompt: 'La primera respuesta al problema, y por qué no basta. Empieza la trama secundaria.', questions: ['¿Qué arriesga aquí el protagonista?'] },
        }),
        act('act3', 0.55, {
            en: { heading: 'Act Three', prompt: 'The turn in the middle: something revealed that changes the question.', questions: ['What can no longer go back to how it was?'] },
            he: { heading: 'מערכה שלישית', prompt: 'התפנית באמצע: משהו נחשף ומשנה את השאלה.', questions: ['מה כבר לא יכול לחזור להיות כמו שהיה?'] },
            de: { heading: 'Dritter Akt', prompt: 'Der Wendepunkt in der Mitte: Etwas kommt ans Licht und verändert die Frage.', questions: ['Was kann nicht mehr so werden, wie es war?'] },
            fr: { heading: 'Troisième acte', prompt: 'Le retournement du milieu : une révélation change la question.', questions: ['Qu’est-ce qui ne pourra plus redevenir comme avant ?'] },
            es: { heading: 'Tercer acto', prompt: 'El giro del medio: una revelación cambia la pregunta.', questions: ['¿Qué ya no puede volver a ser como antes?'] },
        }),
        act('act4', 0.8, {
            en: { heading: 'Act Four', prompt: 'The episode’s question answered — and the season’s opened wider.', questions: ['What is settled, and what will make us start episode two?'] },
            he: { heading: 'מערכה רביעית', prompt: 'השאלה של הפרק נענית — והשאלה של העונה נפתחת רחב יותר.', questions: ['מה נסגר, ומה יגרום לנו להתחיל את הפרק השני?'] },
            de: { heading: 'Vierter Akt', prompt: 'Die Frage der Folge ist beantwortet – und die der Staffel öffnet sich weiter.', questions: ['Was ist geklärt, und was lässt uns Folge zwei starten?'] },
            fr: { heading: 'Quatrième acte', prompt: 'La question de l’épisode trouve sa réponse — et celle de la saison s’élargit.', questions: ['Qu’est-ce qui est résolu, et qu’est-ce qui nous fera lancer l’épisode deux ?'] },
            es: { heading: 'Cuarto acto', prompt: 'La pregunta del episodio se responde, y la de la temporada se abre aún más.', questions: ['¿Qué queda resuelto, y qué nos hará empezar el segundo episodio?'] },
        }),
    ],
};
