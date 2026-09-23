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

export interface SitemapRenderOptions {
  stylesheet?: string;
}

export function renderSitemapXml(
  urls: SitemapUrl[],
  options?: SitemapRenderOptions
): string {
  const urlEntries = urls
    .map(({ loc, lastmod }) => {
      const lastmodTag = lastmod
        ? `\n    <lastmod>${formatSitemapDate(lastmod)}</lastmod>`
        : '';
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodTag}\n  </url>`;
    })
    .join('\n');

  const stylesheetLine = options?.stylesheet
    ? `<?xml-stylesheet type="text/xsl" href="${escapeXml(options.stylesheet)}"?>\n`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
${stylesheetLine}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
