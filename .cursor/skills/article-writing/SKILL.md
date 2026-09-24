# 記事執筆スキル（motetai）

motetai の記事を新規作成・大幅改稿する際は、**必ずこのワークフローに従う**。

**記事執筆前に、同ディレクトリの [`guidelines.md`](./guidelines.md) も読むこと。** Google 公式ドキュメントに基づく品質基準（ペナルティ回避・人間優先コンテンツ・E-E-A-T・公開前チェックリスト）がまとまっている。

## 基本原則

1. **狙う検索キーワードを先に決める**（1記事1メインKW + 2〜3サブKW）
2. **上位10記事をリサーチしてから書き始める**
3. 競合を「丸コピー」せず、**構造は参考にし独自性を出す**
4. トーンは **論理的だけど優しめ**（男性の婚活・恋愛メディア）

---

## ワークフロー（必須）

### Step 1: キーワード設定

記事のメインキーワードを決める。例:

- `マッチングアプリ おすすめ 男性 30代`
- `Pairs プロフィール 写真 書き方`
- `婚活 30代 男性 コツ`

### Step 2: SERPリサーチ（上位10記事）

```bash
npm run research -- "メインキーワード" --slug 記事スラッグ
```

例:

```bash
npm run research -- "マッチングアプリ おすすめ 男性" --slug matching-app-osusume-male
```

`research/<slug>.md` に以下が出力される:

- 上位10記事の URL・タイトル
- 各記事の H2 見出し
- 推定文字数
- 競合の共通トピック
- 執筆チェックリスト

**リサーチブリーフを読んでから執筆を始める。スキップ禁止。**

### Step 3: 競合分析（リサーチ後に必ずやる）

`research/<slug>.md` を読み、以下をメモする:

| 分析項目 | 内容 |
|---------|------|
| 必須トピック | 上位記事が共通して扱っている見出し |
| 文字数の目安 | 上位記事の平均より **20%以上長く** |
| タイトルパターン | 【年号】【ランキング】【完全版】など |
| 差別化ポイント | 競合にない切り口（男性向け・データ・体験談） |
| 不足している情報 | 競合が薄い部分を厚く書く |

### Step 4: 記事執筆

`src/content/articles/<slug>.md` を作成・更新。

**frontmatter 必須項目:**

```yaml
title: "検索キーワードを含むタイトル"
description: "120〜160文字。キーワードを自然に含める"
category: matching-app  # いずれか
publishedAt: 2026-09-21
targetKeyword: "メインキーワード"
targetKeywords: ["サブKW1", "サブKW2"]
researchSlug: "記事スラッグ"  # research/ のファイル名
readingTime: 12
tags: ["タグ1", "タグ2"]
```

**本文の構成（推奨）:**

1. リード文（悩みに共感 + この記事で得られること）
2. 必須トピック（競合分析で洗い出した見出し）
3. 具体例・表・チェックリスト
4. よくある質問（FAQ 3〜5問）
5. まとめ + 次のアクション

**文字数の目安:** 最低 3,000文字、理想 5,000〜8,000文字

**太字の書き方（重要）:**

- `**テキスト**` は `「」` や `（）` を含むとパースされず `**` がそのまま表示される
- 括弧入りは `<strong>「お題」機能</strong>` のように HTML で書く
- ビルド後は `npm run build && node scripts/check-markdown-bold.mjs` で全記事を確認

**テンプレート例（``` コードブロック）:**

- 執筆時は通常の ` ``` ` で書いてよい
- ビルド前に `node scripts/convert-template-blocks.mjs --write` を実行し、コピー用カード UI に変換する

### Step 5: 品質チェック

- [ ] `research/<slug>.md` のチェックリストをすべて確認
- [ ] 競合上位記事の必須トピックをカバーしている
- [ ] タイトル・description にメインKWが含まれている
- [ ] 内部リンクが2本以上ある
- [ ] `npm run build` が通る
- [ ] `node scripts/check-markdown-bold.mjs` で太字の未パースがない

### Step 6: デプロイ + IndexNow

```bash
git add -A && git commit -m "feat: 記事追加 - タイトル"
./scripts/deploy-pages.sh
```

`deploy-pages.sh` はデプロイ後に自動で **IndexNow**（Bing 等）へ URL を通知します。

手動で送る場合:

```bash
npm run indexnow -- --changed    # git差分の記事のみ
npm run indexnow -- --all        # 全記事
npm run indexnow -- article-slug # 特定記事
```

---

## リサーチが取れない場合

`npm run research` が失敗した場合:

1. WebSearch で `メインキーワード` を検索
2. 上位10件を手動で `research/<slug>.md` に記録
3. 各記事の見出し構成をコピーして分析
4. その後 Step 4 へ

---

## 参考: カテゴリとKW例

| カテゴリ | KW例 |
|---------|------|
| matching-app | マッチングアプリ おすすめ、Pairs 攻略、プロフィール 写真 |
| konkatsu | 婚活 30代 男性、お見合い 服装、結婚相談所 比較 |
| appearance | メンズ スキンケア 初心者、脱毛 婚活、AGA 恋愛 |
| date-talk | 初デート 場所、LINE 送り方 男性、会話 ネタ |
| fashion | デート 服装 男性、婚活 ファッション、清潔感 コーデ |
