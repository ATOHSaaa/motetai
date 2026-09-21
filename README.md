# motetai

20代後半〜40代男性向けの婚活・恋愛メディア。Astro + Tailwind CSS で構築。

**公開URL:** https://motetai.jp/

## 開発

```bash
npm install
npm run dev
```

ローカルでは `http://localhost:4321/` で表示されます。

## ビルド

```bash
npm run build
npm run preview
```

## GitHub Pages デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイします。

初回のみ、GitHub リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

## 記事作成

**必ずリサーチしてから書く。** 詳細は `.cursor/skills/article-writing/SKILL.md`

```bash
# 1. 上位10記事をリサーチ
npm run research -- "狙うキーワード" --slug 記事スラッグ

# 2. research/<slug>.md を読んでから記事を執筆

# 3. デプロイ（IndexNow 自動送信付き）
./scripts/deploy-pages.sh

# IndexNow を手動送信する場合
npm run indexnow -- --changed
```

## 構成

- `src/content/articles/` — 記事（Markdown）
- `research/` — キーワードリサーチブリーフ（記事執筆前に作成）
- `src/pages/` — ページルーティング
- `src/components/` — UIコンポーネント
- `src/config/site.ts` — サイト設定
- `.cursor/skills/article-writing/` — 記事執筆ワークフロー
