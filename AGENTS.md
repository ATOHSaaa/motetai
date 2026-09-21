## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## 記事作成（必須ワークフロー）

**記事を新規作成・大幅改稿する前に、必ず `.cursor/skills/article-writing/SKILL.md` を読む。**

### 手順の要約

1. 狙う検索キーワードを決める
2. `npm run research -- "キーワード" --slug 記事スラッグ` で上位10記事をリサーチ
3. `research/<slug>.md` を読み、競合分析してから執筆
4. `src/content/articles/<slug>.md` に記事を書く（frontmatter に `targetKeyword` を設定）
5. `npm run build` → `./scripts/deploy-pages.sh`（デプロイ後に IndexNow 自動送信）

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
