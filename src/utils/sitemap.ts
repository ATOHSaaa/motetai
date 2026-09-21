export interface SitemapUrl {
  loc: string;
  lastmod?: Date;
}

export function formatSitemapDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function renderSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(({ loc, lastmod }) => {
      const lastmodTag = lastmod
        ? `\n    <lastmod>${formatSitemapDate(lastmod)}</lastmod>`
        : '';
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodTag}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
