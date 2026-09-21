#!/usr/bin/env node
/**
 * リサーチブリーフから記事 Markdown を生成する
 *
 * Usage:
 *   node scripts/generate-article.mjs --slug article-slug
 *   node scripts/generate-article.mjs --slug article-slug --keyword "メインKW" --category matching-app
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateText } from './lib/llm.mjs';
import { ARTICLES_DIR, ROOT, findQueueItem, loadQueue } from './lib/article-queue.mjs';

const RESEARCH_DIR = join(ROOT, 'research');
const SKILL_PATH = join(ROOT, '.cursor', 'skills', 'article-writing', 'SKILL.md');

function parseArgs(argv) {
  const args = argv.slice(2);
  let slug = '';
  let keyword = '';
  let category = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) slug = args[++i];
    else if (args[i] === '--keyword' && args[i + 1]) keyword = args[++i];
    else if (args[i] === '--category' && args[i + 1]) category = args[++i];
  }

  if (!slug) {
    console.error('Usage: node scripts/generate-article.mjs --slug <slug> [--keyword "..."] [--category ...]');
    process.exit(1);
  }

  return { slug, keyword, category };
}

function todayJst() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

async function listExistingArticles() {
  const files = (await readdir(ARTICLES_DIR)).filter((name) => name.endsWith('.md'));
  const articles = [];

  for (const file of files) {
    const content = await readFile(join(ARTICLES_DIR, file), 'utf-8');
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    articles.push({
      slug: file.replace(/\.md$/, ''),
      title: titleMatch?.[1] ?? file,
    });
  }

  return articles;
}

function extractMarkdown(raw) {
  const fenced = raw.match(/```(?:markdown|md)?\n([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const frontmatter = raw.match(/^---\n[\s\S]*?\n---\n[\s\S]+/);
  if (frontmatter) return frontmatter[0].trim();

  return raw.trim();
}

function validateArticle(markdown, slug) {
  if (!markdown.startsWith('---')) {
    throw new Error('frontmatter がありません');
  }

  const body = markdown.replace(/^---[\s\S]*?---\n/, '');
  if (body.length < 2500) {
    throw new Error(`本文が短すぎます（${body.length}文字）。最低 2,500 文字必要です`);
  }

  const required = ['title:', 'description:', 'category:', 'publishedAt:', 'targetKeyword:'];
  for (const key of required) {
    if (!markdown.includes(key)) {
      throw new Error(`frontmatter に ${key} がありません`);
    }
  }

  if (!markdown.includes(`researchSlug: ${slug}`) && !markdown.includes(`researchSlug: "${slug}"`)) {
    throw new Error('researchSlug がスラッグと一致していません');
  }
}

async function resolveMeta({ slug, keyword, category }) {
  if (keyword && category) {
    return { keyword, category, targetKeywords: [] };
  }

  const queue = await loadQueue();
  const item = findQueueItem(queue, slug);
  if (!item) {
    throw new Error(`キューに ${slug} が見つかりません。--keyword と --category を指定してください`);
  }

  return {
    keyword: keyword || item.keyword,
    category: category || item.category,
    targetKeywords: item.targetKeywords ?? [],
  };
}

function buildSystemPrompt(skillText) {
  return `あなたは男性向け婚活・恋愛メディア「motetai」の記事ライターです。
以下の執筆スキルに厳密に従い、SEO 記事を日本語で書きます。

${skillText}

出力形式:
- Markdown ファイル全体のみを出力（説明文や前置きは不要）
- 先頭は --- で始まる YAML frontmatter
- 本文は 4,000〜7,000 文字を目安に書く
- 太字で「」や（）を含む場合は <strong>タグ</strong> を使う（** は使わない）
- 内部リンクは /articles/スラッグ/ 形式で最低2本入れる
- 表・チェックリスト・FAQ（3〜5問）を含める
- テンプレート例は通常の \`\`\` コードブロックで書く（後処理で変換される）`;
}

function buildUserPrompt({ keyword, category, targetKeywords, slug, researchBrief, existingArticles, publishedAt }) {
  const linkList = existingArticles
    .slice(0, 30)
    .map((a) => `- ${a.title}: /articles/${a.slug}/`)
    .join('\n');

  const subKw = targetKeywords.length > 0 ? targetKeywords.join('、') : '（スキルに沿って設定）';

  return `次のリサーチブリーフをもとに記事を書いてください。

## 記事メタ情報
- slug: ${slug}
- メインキーワード: ${keyword}
- サブキーワード: ${subKw}
- category: ${category}
- publishedAt: ${publishedAt}
- researchSlug: ${slug}

## frontmatter 必須項目
title, description, category, publishedAt, targetKeyword, targetKeywords, researchSlug, readingTime, tags
affiliate は内容に応じて true/false

## 内部リンク候補（既存記事）
${linkList}

## リサーチブリーフ
${researchBrief}`;
}

async function main() {
  const { slug, keyword: kwArg, category: catArg } = parseArgs(process.argv);
  const outPath = join(ARTICLES_DIR, `${slug}.md`);
  const researchPath = join(RESEARCH_DIR, `${slug}.md`);

  if (existsSync(outPath)) {
    console.error(`❌ 記事は既に存在します: ${outPath}`);
    process.exit(1);
  }

  if (!existsSync(researchPath)) {
    console.error(`❌ リサーチブリーフがありません: research/${slug}.md`);
    console.error('   先に npm run research を実行してください');
    process.exit(1);
  }

  const meta = await resolveMeta({ slug, keyword: kwArg, category: catArg });
  const researchBrief = await readFile(researchPath, 'utf-8');
  const skillText = existsSync(SKILL_PATH) ? await readFile(SKILL_PATH, 'utf-8') : '';
  const existingArticles = await listExistingArticles();
  const publishedAt = todayJst();

  console.log(`✍️  記事生成中: ${slug}`);
  console.log(`   キーワード: ${meta.keyword}`);

  const raw = await generateText({
    apiKey: process.env.ANTHROPIC_API_KEY,
    system: buildSystemPrompt(skillText),
    user: buildUserPrompt({
      keyword: meta.keyword,
      category: meta.category,
      targetKeywords: meta.targetKeywords,
      slug,
      researchBrief,
      existingArticles,
      publishedAt,
    }),
  });

  const markdown = extractMarkdown(raw);
  validateArticle(markdown, slug);

  await writeFile(outPath, `${markdown}\n`, 'utf-8');
  console.log(`✅ 記事を保存: src/content/articles/${slug}.md`);
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
