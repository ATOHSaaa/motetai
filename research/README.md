# キーワードリサーチ

記事執筆前の SERP（検索結果）分析を保存するディレクトリ。

## 使い方

```bash
npm run research -- "狙うキーワード" --slug 記事スラッグ
```

出力例: `research/matching-app-osusume-male.md`

## ルール

- **記事を書く前に必ずリサーチブリーフを作成する**
- リサーチブリーフは記事と一緒にコミットする
- 記事の frontmatter に `targetKeyword` と `researchSlug` を設定する

詳細は `.cursor/skills/article-writing/SKILL.md` を参照。
