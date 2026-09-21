import { getSiteUrl, siteEnv } from '../../site.config.mjs';

/** IndexNow API キー（public/{key}.txt に同名ファイルを配置） */
export const indexNowConfig = {
  key: 'e8f3a2b1c9d04e7f',
  host: siteEnv.domain,
} as const;

export function getSiteBaseUrl(): string {
  return getSiteUrl();
}

export function getKeyLocation(): string {
  return `${getSiteBaseUrl()}/${indexNowConfig.key}.txt`;
}
