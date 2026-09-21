import { siteConfig } from '../config/site';

export const ogImageDimensions = {
  width: 1200,
  height: 630,
};

export function ogImagePathForPage(path: string = '/'): string {
  if (path === '/' || path === '') {
    return '/og/default.png';
  }

  const normalized = path.replace(/^\//, '').replace(/\/$/, '');
  return `/og/${normalized}.png`;
}

export function ogImageUrlForPath(path: string = '/'): string {
  return `${siteConfig.url}${ogImagePathForPage(path)}`;
}
