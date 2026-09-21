#!/usr/bin/env node
/**
 * キューから本日の記事を選び、リサーチのみ実行する（API キー不要）
 *
 * Usage:
 *   node scripts/prepare-daily-articles.mjs
 *   node scripts/prepare-daily-articles.mjs --count 2
 */

import { spawnSync } from 'node:child_process';
import { loadQueue, pickNextArticles, ROOT } from './lib/article-queue.mjs';

function parseArgs(argv) {
  const args = argv.slice(2);
  let count = 2;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) count = Number(args[++i]);
  }

  return { count };
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    throw new Error(`コマンド失敗: ${command} ${args.join(' ')}`);
  }
}

async function main() {
  const { count } = parseArgs(process.argv);
  const queue = await loadQueue();
  const targets = pickNextArticles(queue, count);

  if (targets.length === 0) {
    console.log('✅ 公開待ちのキューがありません');
    process.exit(0);
  }

  console.log(`📋 本日の対象: ${targets.length} 件\n`);

  for (const item of targets) {
    console.log(`━━ ${item.slug}`);
    console.log(`   KW: ${item.keyword}`);
    console.log(`   category: ${item.category}\n`);
    run('node', ['scripts/research-keyword.mjs', item.keyword, '--slug', item.slug]);
  }

  console.log('\n✅ リサーチ完了。次は記事を執筆してください。');
  console.log('   参照: .cursor/skills/article-writing/SKILL.md');
  console.log('   参照: .cursor/automations/daily-articles.md');
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
