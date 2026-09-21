#!/usr/bin/env node
/**
 * ビルド済み HTML に未パースの ** が残っていないかチェック
 *
 * Usage: node scripts/check-markdown-bold.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ARTICLES = join(process.cwd(), 'dist/articles');

function walkHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walkHtmlFiles(path));
    } else if (entry === 'index.html') {
      files.push(path);
    }
  }
  return files;
}

const issues = [];

for (const file of walkHtmlFiles(DIST_ARTICLES)) {
  const html = readFileSync(file, 'utf8');
  const prose = html.match(/<div class="prose-article">([\s\S]*?)<\/div>/)?.[1] ?? '';
  const matches = prose.match(/\*\*[^*]+\*\*/g) ?? [];

  if (matches.length > 0) {
    const slug = file.replace(`${DIST_ARTICLES}/`, '').replace('/index.html', '');
    issues.push({ slug, count: matches.length, samples: matches.slice(0, 3) });
  }
}

if (issues.length === 0) {
  console.log('✅ 全記事の太字パース OK');
  process.exit(0);
}

console.error('❌ 未パースの太字が残っている記事:');
for (const issue of issues) {
  console.error(`  - ${issue.slug}: ${issue.count}件`);
  for (const sample of issue.samples) {
    console.error(`      ${sample}`);
  }
}
process.exit(1);
