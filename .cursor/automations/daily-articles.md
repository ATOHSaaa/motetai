# 毎日2記事追加（Cursor Automation 用プロンプト）

Anthropic API キーは不要です。Cursor の Cloud Agent が記事を執筆します。

## Automation 作成手順（初回のみ）

`Automations: New Automation` というコマンドは**存在しません**。次のいずれかで作成します。

### 方法A: ブラウザ（いちばん簡単）

1. https://cursor.com/automations/new を開く
2. **Name:** `motetai 毎日2記事追加`
3. **Trigger:** Schedule → **毎日 6:00**（JST）
4. **Repository:** `ATOHSaaa/motetai` / `main`
5. **Tools:** Git commit / push を有効化
6. **Instructions:** 下の「やること」セクションをコピー、または `@.cursor/automations/daily-articles.md` を参照
7. 保存して有効化

### 方法B: Agents Window

1. `Cmd+Shift+P` → **表示: New Agents Window**
2. チャットで `/automate` と入力
3. 「毎日6時に motetai で2記事書いて push」と説明する

### 方法C: このチャットで依頼（手動・確実）

毎朝、チャットで次を送るだけでもOK:

> `@.cursor/automations/daily-articles.md` に従って、今日の2記事を書いて commit & push して

プリフィル JSON: `.cursor/automations/daily-articles.prefill.json`

---

## やること

`data/article-queue.json` から **pending** の記事を priority 順に **2件** 選び、以下を **1件ずつ** 実行する。

### 各記事の手順

1. `.cursor/skills/article-writing/SKILL.md` のワークフローに従う
2. `npm run research -- "<keyword>" --slug <slug>` でリサーチ（未作成なら）
3. `research/<slug>.md` を読んで競合分析
4. `src/content/articles/<slug>.md` に記事を執筆
   - frontmatter に `targetKeyword` / `researchSlug` を設定
   - `publishedAt` は今日の日付（JST）
   - 太字で「」を含む場合は `<strong>` を使う
5. `npm run convert:templates`
6. 2件すべて書き終えたら:
   - `npm run build`
   - `npm run check:bold`
7. `data/article-queue.json` の該当項目を `status: "completed"` に更新
8. git commit & push:
   ```
   feat: 記事追加 - <title1>, <title2>
   ```

### 注意

- 既に `src/content/articles/<slug>.md` がある場合はスキップし、キューを completed にする
- 失敗した記事は `status: "failed"` と `error` を記録
- キューが空なら終了（エラーにしない）
- デプロイは **push 後に GitHub Actions が自動実行** する（手動で deploy 不要）

## キュー確認コマンド

```bash
npm run queue -- list
npm run queue -- next --count 2
npm run daily:prepare
```
