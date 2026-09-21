# 毎日2記事追加（Cursor Automation 用プロンプト）

このファイルを Cursor Automations の Instructions にコピーするか、`@.cursor/automations/daily-articles.md` で参照してください。

Anthropic API キーは不要です。Cursor の Cloud Agent が記事を執筆します。

---

## トリガー

- **Schedule:** 毎日 6:00（JST）— 1日1回で2記事まとめて処理
- **Repository:** motetai（main ブランチ）
- **Tools:** Git への commit / push を有効化

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
