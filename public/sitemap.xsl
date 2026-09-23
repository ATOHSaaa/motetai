<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>XML Sitemap | motetai</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <style>
          :root {
            color-scheme: light;
          }
          body {
            margin: 0;
            padding: 2rem 1rem 3rem;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            line-height: 1.5;
            color: #0f172a;
            background: #f8fafc;
          }
          main {
            max-width: 960px;
            margin: 0 auto;
          }
          h1 {
            margin: 0 0 0.5rem;
            font-size: 1.5rem;
          }
          p {
            margin: 0 0 1.5rem;
            color: #64748b;
            font-size: 0.95rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            overflow: hidden;
          }
          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.9rem;
          }
          th {
            background: #eff6ff;
            color: #1e3a8a;
            font-weight: 600;
          }
          tr:last-child td {
            border-bottom: 0;
          }
          a {
            color: #2563eb;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>XML Sitemap</h1>
          <p>motetai の公開ページ一覧です。検索エンジン向けの XML サイトマップをブラウザ表示しています。</p>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>最終更新</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td>
                    <a href="{s:loc}">
                      <xsl:value-of select="s:loc" />
                    </a>
                  </td>
                  <td>
                    <xsl:value-of select="s:lastmod" />
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
