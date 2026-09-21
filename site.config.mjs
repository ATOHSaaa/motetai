/** @typedef {import('./site.config.d.ts').SiteConfig} SiteConfig */

/** @type {SiteConfig} */
export const siteEnv = {
  domain: 'motetai.jp',
  origin: process.env.ASTRO_SITE ?? 'https://motetai.jp',
  basePath: process.env.ASTRO_BASE ?? '/',
};

export function getSiteUrl(config = siteEnv) {
  const normalizedBase =
    config.basePath === '/' ? '' : config.basePath.replace(/\/$/, '');
  return `${config.origin}${normalizedBase}`.replace(/\/$/, '');
}
