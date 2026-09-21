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

## アクセス解析（GA4 / Clarity / Search Console）

`.env.example` を `.env.production` にコピーし、各サービスの ID を設定してからビルドします。

```bash
cp .env.example .env.production
# PUBLIC_GA_MEASUREMENT_ID / PUBLIC_CLARITY_PROJECT_ID / PUBLIC_GOOGLE_SITE_VERIFICATION を設定
npm run build
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

## 記事の自動追加（1日2記事）

**Anthropic API キーは不要です。** Cursor Automation で記事を執筆し、`main` に push すると GitHub Actions が自動デプロイします。

### セットアップ手順

1. https://cursor.com/automations/new を開く（`Automations: New Automation` コマンドは存在しない）
2. 新規 Automation を作成:
   - **Trigger:** Schedule — 毎日 6:00（JST）
   - **Repository:** `ATOHSaaa/motetai` / `main`
   - **Instructions:** `.cursor/automations/daily-articles.md` の内容をコピー
   - **Tools:** Git commit / push を有効化
3. GitHub リポジトリの **Settings → Secrets → Actions** に解析用 ID を登録（任意・済）:
   - `PUBLIC_GA_MEASUREMENT_ID` / `PUBLIC_CLARITY_PROJECT_ID` / `PUBLIC_GOOGLE_SITE_VERIFICATION`

### 流れ

```
Cursor Automation（毎日）
  → キューから2件選ぶ → リサーチ → 記事執筆 → commit & push
GitHub Actions（push 時）
  → ビルド → gh-pages デプロイ → IndexNow
```

### 記事キュー

`data/article-queue.json` に公開予定のキーワードを登録します。priority が高いものから順に処理されます。

```bash
# キュー一覧
npm run queue -- list

# 次に処理される記事
npm run queue -- next --count 2

# リサーチだけ先に実行（API キー不要）
npm run daily:prepare

# キューに追加
npm run queue -- add --slug new-article --keyword "婚活 コツ 男性" --category konkatsu
```

### 手動で今日の2記事を書く

Cursor のチャットで次のように依頼できます:

> `@.cursor/automations/daily-articles.md` に従って、今日の2記事を書いて commit & push して

## 構成

- `src/content/articles/` — 記事（Markdown）
- `research/` — キーワードリサーチブリーフ（記事執筆前に作成）
- `src/pages/` — ページルーティング
- `src/components/` — UIコンポーネント
- `src/config/site.ts` — サイト設定
- `.cursor/skills/article-writing/` — 記事執筆ワークフロー
