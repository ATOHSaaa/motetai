import { getSiteUrl, siteEnv } from '../../site.config.mjs';

export const siteConfig = {
  name: 'motetai',
  description:
    '20代後半〜40代男性向けの婚活・恋愛メディア。マッチングアプリ攻略、見た目改善、デート術をデータと体験に基づいてわかりやすく解説します。',
  domain: siteEnv.domain,
  url: getSiteUrl(),
  locale: 'ja_JP',
  author: 'motetai編集部',
} as const;
