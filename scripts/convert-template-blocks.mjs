#!/usr/bin/env node
/**
 * 記事内の ``` コードブロックをテンプレートカード HTML に変換
 *
 * Usage:
 *   node scripts/convert-template-blocks.mjs
 *   node scripts/convert-template-blocks.mjs --write
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTemplateBlockHtml } from '../src/utils/template-block-html.mjs';

const ARTICLES_DIR = join(process.cwd(), 'src/content/articles');
const CODE_BLOCK = /```(?:plaintext)?\n([\s\S]*?)```/g;
const write = process.argv.includes('--write');

let convertedBlocks = 0;
let updatedFiles = 0;

for (const file of readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.md'))) {
  const path = join(ARTICLES_DIR, file);
  const original = readFileSync(path, 'utf8');

  const updated = original.replace(CODE_BLOCK, (match, content) => {
    if (match.includes('class="template-block"')) return match;
    convertedBlocks += 1;
    return `${buildTemplateBlockHtml(content)}\n`;
  });

  if (updated !== original) {
    updatedFiles += 1;
    console.log(file);
    if (write) writeFileSync(path, updated);
  }
}

if (convertedBlocks === 0) {
  console.log('✅ 変換対象なし');
} else if (!write) {
  console.log(`\n${convertedBlocks} ブロック / ${updatedFiles} ファイル。適用: --write`);
} else {
  console.log(`\n✅ ${convertedBlocks} ブロックを ${updatedFiles} ファイルで変換しました`);
}
