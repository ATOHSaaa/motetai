/** IndexNow API キー（public/{key}.txt に同名ファイルを配置） */
export const indexNowConfig = {
  key: 'e8f3a2b1c9d04e7f',
  host: 'atohsaaa.github.io',
  sitePath: '/motetai',
} as const;

export function getSiteBaseUrl(): string {
  const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'atohsaaa';
  const siteOrigin = process.env.ASTRO_SITE ?? `https://${owner.toLowerCase()}.github.io`;
  const base = process.env.ASTRO_BASE ?? '/motetai/';
  return `${siteOrigin}${base}`.replace(/\/$/, '');
}

export function getKeyLocation(): string {
  const base = getSiteBaseUrl();
  return `${base}/${indexNowConfig.key}.txt`;
}
