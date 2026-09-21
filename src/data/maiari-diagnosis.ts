export interface MaiariOption {
  label: string;
  score: number;
}

export interface MaiariQuestion {
  id: number;
  category: string;
  question: string;
  options: MaiariOption[];
}

export interface MaiariResult {
  minScore: number;
  maxScore: number;
  level: string;
  emoji: string;
  color: string;
  title: string;
  description: string;
  advice: string[];
  articleSlug: string;
}

export const maiariQuestions: MaiariQuestion[] = [
  {
    id: 1,
    category: 'LINE',
    question: 'LINEの返信速度はどれくらいですか？',
    options: [
      { label: '数時間以内に返ってくることが多い', score: 3 },
      { label: '当日中には返ってくる', score: 2 },
      { label: '翌日以降になることが多い', score: 1 },
      { label: '既読スルーが多い', score: 0 },
    ],
  },
  {
    id: 2,
    category: 'LINE',
    question: '連絡のきっかけはどちらが多いですか？',
    options: [
      { label: '相手から連絡してくることが多い', score: 3 },
      { label: 'お互い半々くらい', score: 2 },
      { label: '自分から送ることが多い', score: 1 },
      { label: 'ほぼ自分だけが連絡している', score: 0 },
    ],
  },
  {
    id: 3,
    category: 'LINE',
    question: 'メッセージの内容はどんな感じですか？',
    options: [
      { label: '質問が多く、会話が自然に続く', score: 3 },
      { label: '普通に返してくれる', score: 2 },
      { label: '短文・スタンプのみが多い', score: 1 },
      { label: '返信が消極的・事務的', score: 0 },
    ],
  },
  {
    id: 4,
    category: 'デート',
    question: '会う話はどう進みますか？',
    options: [
      { label: '相手からデートを提案してくれる', score: 3 },
      { label: '「会いたい」と言ってくれた', score: 2 },
      { label: '誘ったらOKしてくれる', score: 1 },
      { label: '日程調整が難しい・断られることが多い', score: 0 },
    ],
  },
  {
    id: 5,
    category: 'デート',
    question: '会っているときの目線は？',
    options: [
      { label: 'よく目を合わせて話してくれる', score: 3 },
      { label: '普通に会話してくれる', score: 2 },
      { label: 'あまり目を合わせない', score: 1 },
      { label: 'スマホを見ることが多い', score: 0 },
    ],
  },
  {
    id: 6,
    category: 'デート',
    question: '会っているときの距離感は？',
    options: [
      { label: '自分より近づいてくることがある', score: 3 },
      { label: '自然な距離感', score: 2 },
      { label: 'やや離れている', score: 1 },
      { label: '明らかに距離を置いている', score: 0 },
    ],
  },
  {
    id: 7,
    category: '会話',
    question: 'プライベートな話題はどこまで話しますか？',
    options: [
      { label: '価値観・家族・将来の話もしてくれる', score: 3 },
      { label: '仕事や趣味の深い話をしてくれる', score: 2 },
      { label: '表面的な話題が中心', score: 1 },
      { label: 'あまり自分のことを聞いてこない', score: 0 },
    ],
  },
  {
    id: 8,
    category: '会話',
    question: '以前話したことの記憶は？',
    options: [
      { label: '覚えていて触れてくれる', score: 3 },
      { label: 'たまに覚えている', score: 2 },
      { label: 'あまり覚えていない', score: 1 },
      { label: '忘れていることが多い', score: 0 },
    ],
  },
  {
    id: 9,
    category: '会話',
    question: 'デート後のフォローはどうですか？',
    options: [
      { label: '相手から先に連絡してくれる', score: 3 },
      { label: '当日〜翌日に返事をくれる', score: 2 },
      { label: '連絡が遅い', score: 1 },
      { label: 'ほぼ連絡がない', score: 0 },
    ],
  },
  {
    id: 10,
    category: '将来',
    question: '将来の話・次の予定は？',
    options: [
      { label: '「また会いたい」と具体的に言う', score: 3 },
      { label: '次の予定を話してくれる', score: 2 },
      { label: '特に言わない', score: 1 },
      { label: '「楽しかった」だけ／無反応', score: 0 },
    ],
  },
];

export const maiariResults: MaiariResult[] = [
  {
    minScore: 0,
    maxScore: 8,
    level: '脈ナシ',
    emoji: '💭',
    color: 'slate',
    title: '脈ナシの可能性が高い',
    description:
      '現時点では、相手の好意サインはあまり見られません。単に忙しい可能性もありますが、複数の項目で低スコアが出ている場合は、期待値を下げて他の出会いも視野に入れるのが合理的です。',
    advice: [
      '追撃メッセージは避け、一度距離を置いてみましょう',
      '自分磨き（清潔感・プロフィール改善）に集中するのも有効です',
      '1つだけ好反応がある場合は、他のサインも確認してから判断してください',
    ],
    articleSlug: 'how-to-read-maiari-signs',
  },
  {
    minScore: 9,
    maxScore: 15,
    level: '様子見',
    emoji: '🤔',
    color: 'amber',
    title: '様子見ゾーン',
    description:
      '好意のサインと中立のサインが混在しています。この段階では「脈アリ」と決めつけず、もう1〜2回のデートや会話で追加のサインを確認するのがベストです。',
    advice: [
      '自然体で会話を楽しみ、相手のペースを尊重しましょう',
      '自分から次のデートを具体的に提案してみてください',
      '清潔感と会話の質を上げると、評価が変わることもあります',
    ],
    articleSlug: 'date-maiari-signs-male',
  },
  {
    minScore: 16,
    maxScore: 22,
    level: '脈アリ',
    emoji: '💗',
    color: 'rose',
    title: '脈アリの可能性が高い',
    description:
      '複数の場面で好意のサインが見られます。相手はあなたとの関係に興味を持っている可能性が高いです。ここからは「確認」より「関係を進める」フェーズに入れます。',
    advice: [
      '48時間以内に次のデートを具体的に提案しましょう',
      '褒めすぎず、相手の話を聞く姿勢を続けてください',
      '焦って告白するより、デートの回数を重ねるのが安全です',
    ],
    articleSlug: 'matching-app-maiari-signs',
  },
  {
    minScore: 23,
    maxScore: 30,
    level: '脈アリ濃厚',
    emoji: '🔥',
    color: 'brand',
    title: '脈アリ濃厚！',
    description:
      'ほぼすべての場面で好意のサインが確認できます。相手はあなたに強い関心を持っている可能性が非常に高いです。次の行動を迷わず進めましょう。',
    advice: [
      '次のデートを早めに提案し、二人きりの時間を増やしましょう',
      '「楽しい」「また会いたい」という気持ちを素直に伝えてOK',
      '清潔感をキープし、自信を持って接してください',
    ],
    articleSlug: 'line-how-to-send-male',
  },
];

export function getResultByScore(score: number): MaiariResult {
  return (
    maiariResults.find((r) => score >= r.minScore && score <= r.maxScore) ??
    maiariResults[0]
  );
}

export const maxMaiariScore = maiariQuestions.length * 3;
