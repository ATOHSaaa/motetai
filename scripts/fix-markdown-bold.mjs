#!/usr/bin/env node
/**
 * **「日本語括弧」** 形式の太字を <strong> に変換する
 *
 * Usage:
 *   node scripts/fix-markdown-bold.mjs          # 変換が必要な箇所を表示
 *   node scripts/fix-markdown-bold.mjs --write  # 記事を更新
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLES_DIR = join(process.cwd(), 'src/content/articles');
const BOLD_PATTERN = /\*\*([^*\n]+)\*\*/g;
const JP_PUNCT = /[「」『』（）]/;
const write = process.argv.includes('--write');

let total = 0;

for (const file of readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.md'))) {
  const path = join(ARTICLES_DIR, file);
  const original = readFileSync(path, 'utf8');

  const updated = original.replace(BOLD_PATTERN, (match, inner) => {
    if (!JP_PUNCT.test(inner)) return match;
    total += 1;
    return `<strong>${inner}</strong>`;
  });

  if (updated !== original) {
    console.log(`${file}: updated`);
    if (write) {
      writeFileSync(path, updated);
    }
  }
}

if (total === 0) {
  console.log('✅ 変換対象なし');
} else if (!write) {
  console.log(`\n${total} 箇所を変換可能です。適用するには --write を付けて実行してください。`);
} else {
  console.log(`\n✅ ${total} 箇所を変換しました`);
}
