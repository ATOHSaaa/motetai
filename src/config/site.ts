const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'atohsaaa';
const repo = 'motetai';
const base = process.env.ASTRO_BASE ?? `/${repo}/`;
const siteOrigin = process.env.ASTRO_SITE ?? `https://${owner}.github.io`;

export const siteConfig = {
  name: 'motetai',
  description:
    '20代後半〜40代男性向けの婚活・恋愛メディア。マッチングアプリ攻略、見た目改善、デート術をデータと体験に基づいてわかりやすく解説します。',
  url: `${siteOrigin}${base}`.replace(/\/$/, ''),
  locale: 'ja_JP',
  author: 'motetai編集部',
  ogImage: '/og-default.png',
} as const;
