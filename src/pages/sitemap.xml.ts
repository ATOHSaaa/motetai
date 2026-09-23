import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { categories } from '../utils/category';
import { renderSitemapXml, type SitemapUrl } from '../utils/sitemap';
import { withBase } from '../utils/url';

function absoluteUrl(path: string): string {
  const base = import.meta.env.SITE + import.meta.env.BASE_URL;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return new URL(normalized, base).href;
}

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles');

  const urls: SitemapUrl[] = [
    { loc: absoluteUrl('/') },
    { loc: absoluteUrl('/about/') },
    { loc: absoluteUrl('/privacy/') },
    { loc: absoluteUrl('/articles/') },
    { loc: absoluteUrl('/ranking/') },
    { loc: absoluteUrl('/diagnosis/maiari/') },
    ...categories.map((category) => ({
      loc: absoluteUrl(`/category/${category.slug}/`),
    })),
    ...articles.map((article) => ({
      loc: absoluteUrl(`/articles/${article.id}/`),
      lastmod: article.data.updatedAt ?? article.data.publishedAt,
    })),
  ];

  return new Response(
    renderSitemapXml(urls, {
      stylesheet: absoluteUrl(withBase('/sitemap.xsl')),
    }),
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
};
