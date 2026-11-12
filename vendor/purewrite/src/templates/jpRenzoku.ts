import type { NodeDef, NodeText, TemplateDef } from './types';

/**
 * A Japanese 連続ドラマ for a commercial network's one-hour slot. Production
 * thinks of the hour not in acts but in the parts between commercial breaks
 * — アバン before the titles, then A to D パート, each ending on a 引き that
 * holds the viewer through the break — and closes on 次回予告. Before the
 * episode, the 企画書 documents: 企画意図, the characters, and the shape of
 * one クール (10–11 episodes). Japanese only; the lengths count characters.
 */

function part(id: string, position: number, ja: NodeText, hiki = true): NodeDef {
    return {
        id,
        level: 2,
        position,
        target: { min: 100, max: 600 },
        text: { ja },
        ...(hiki ? { checks: [{ id: 'hiki', text: { ja: 'CM前の「引き」で終わっている' } }] } : {}),
    };
}

export const jpRenzoku: TemplateDef = {
    schema: 1,
    id: 'screen.jp-renzoku',
    version: '1.0.0',
    source: 'bundled',
    family: 'screenplay',
    info: {
        ja: {
            title: '連続ドラマ 第1話（民放1時間枠）',
            description: 'CMで区切られる民放の1時間ドラマ。企画の骨子、1クールの全話構成、そして第1話をアバンからDパート、次回予告まで。',
            file: '第1話構成案',
        },
    },
    nodes: [
        {
            id: 'logline',
            level: 2,
            target: { max: 50, hard: true },
            text: { ja: { heading: 'ログライン', prompt: 'シリーズを一文で。誰が、どんな世界で、何を求め、何に阻まれるのか。', questions: ['第1話だけでなく、1クール分の物語を約束していますか？'] } },
            checks: [{ id: 'length', auto: { rule: 'within-target' }, text: { ja: '一文、100字以内' } }],
        },
        {
            id: 'intent',
            level: 2,
            target: { min: 150, max: 500 },
            text: { ja: { heading: '企画意図', prompt: 'なぜ今この物語を、連続ドラマとして描くのか。テーマ、トーン、想定する視聴者。', questions: ['この枠で、なぜ今この物語なのですか？'] } },
        },
        {
            id: 'characters',
            level: 2,
            target: { min: 150, max: 600 },
            text: { ja: { heading: '登場人物', prompt: '主要人物ごとに短く。何を望み、何を隠し、このクールで何を失うのか。', questions: ['主要人物はそれぞれ、最終話までに変わりますか？'] } },
        },
        {
            id: 'season',
            level: 2,
            target: { min: 150, max: 600 },
            text: { ja: { heading: '全話構成', prompt: '1クール（全10〜11話）の流れ。第1話が投げかける問いと、最終話で出す答え、その間の山場。', questions: ['中盤の山場は第何話ですか？'] } },
            checks: [{ id: 'finale', text: { ja: '最終話の答えが決まっている' } }],
        },
        part('avant', 0, { heading: 'アバン', prompt: 'オープニングタイトル前の数分。世界観とトーンを一気に見せ、問いを残します。', questions: ['ここだけで、チャンネルを止めてもらえますか？'] }, false),
        part('a', 0.08, { heading: 'Aパート', prompt: '主人公の日常と、第1話の事件がそこへ飛び込んでくるまで。', questions: ['Aパートの終わりで、この回の問題がはっきりしていますか？'] }),
        part('b', 0.3, { heading: 'Bパート', prompt: '主人公の最初の一手と、それがうまくいかない理由。二本目の筋が動き出します。', questions: ['主人公はここで何を賭けていますか？'] }),
        part('c', 0.55, { heading: 'Cパート', prompt: '中盤の転換。何かが明らかになり、問いそのものが変わります。', questions: ['もう元には戻れないものは何ですか？'] }),
        part('d', 0.8, { heading: 'Dパート', prompt: 'この回の問題に決着をつけ、シリーズ全体の問いをさらに大きく開きます。', questions: ['次回も見たくなる理由は何ですか？'] }, false),
        {
            id: 'preview',
            level: 2,
            position: 0.98,
            target: { max: 100 },
            text: { ja: { heading: '次回予告', prompt: '次回の見どころを短く。答えは見せず、問いだけを残します。' } },
        },
    ],
};
