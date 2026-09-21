# motetai

20代後半〜40代男性向けの婚活・恋愛メディア。Astro + Tailwind CSS で構築。

**公開URL:** https://atohslit1113.github.io/motetai/

## 開発

```bash
npm install
npm run dev
```

ローカルでは `http://localhost:4321/motetai/` で表示されます。

## ビルド

```bash
npm run build
npm run preview
```

## GitHub Pages デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイします。

初回のみ、GitHub リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

## 構成

- `src/content/articles/` — 記事（Markdown）
- `src/pages/` — ページルーティング
- `src/components/` — UIコンポーネント
- `src/config/site.ts` — サイト設定
