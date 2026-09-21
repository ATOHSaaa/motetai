export type CategorySlug =
  | 'matching-app'
  | 'konkatsu'
  | 'appearance'
  | 'date-talk'
  | 'fashion'
  | 'relationship';

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  {
    slug: 'matching-app',
    name: 'マッチングアプリ',
    description: 'Pairs・with・タップルなど、アプリ攻略とプロフィール改善の完全ガイド',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    slug: 'konkatsu',
    name: '婚活',
    description: '30代・40代男性の婚活戦略。お見合い・結婚相談所・婚活パーティー攻略',
    color: 'bg-rose-100 text-rose-800',
  },
  {
    slug: 'appearance',
    name: '見た目・コスメ',
    description: 'メンズスキンケア・脱毛・体型改善。論理的に「清潔感」を作る方法',
    color: 'bg-emerald-100 text-emerald-800',
  },
  {
    slug: 'date-talk',
    name: 'デート・会話',
    description: '初デートの場所選び、会話術、LINEの送り方まで実践的に解説',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    slug: 'fashion',
    name: 'ファッション',
    description: '婚活・デートに映えるメンズコーデ。失敗しない服装の選び方',
    color: 'bg-violet-100 text-violet-800',
  },
  {
    slug: 'relationship',
    name: '恋愛・関係',
    description: '告白、失恋からの立ち直り、長続きのコツ。恋愛関係を論理的に整理する',
    color: 'bg-sky-100 text-sky-800',
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategory(slug)?.name ?? slug;
}
