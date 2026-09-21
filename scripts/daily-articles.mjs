#!/usr/bin/env node
/**
 * 1日あたりの記事を自動生成するオーケストレータ
 *
 * Usage:
 *   node scripts/daily-articles.mjs              # 2記事（デフォルト）
 *   node scripts/daily-articles.mjs --count 1
 *   node scripts/daily-articles.mjs --dry-run    # キュー確認のみ
 */

import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ARTICLES_DIR,
  ROOT,
  articleExists,
  loadQueue,
  markStatus,
  pickNextArticles,
  saveQueue,
} from './lib/article-queue.mjs';

function parseArgs(argv) {
  const args = argv.slice(2);
  let count = 2;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) count = Number(args[++i]);
    else if (args[i] === '--dry-run') dryRun = true;
  }

  return { count, dryRun };
}

function run(command, args, { allowFail = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0 && !allowFail) {
    throw new Error(`コマンド失敗: ${command} ${args.join(' ')}`);
  }

  return result.status === 0;
}

async function extractTitle(slug) {
  const path = join(ARTICLES_DIR, `${slug}.md`);
  const content = await readFile(path, 'utf-8');
  const match = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return match?.[1] ?? slug;
}

async function processOne(item, queue) {
  const { slug, keyword, category } = item;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📌 ${slug}`);
  console.log(`   KW: ${keyword}`);

  if (articleExists(slug)) {
    console.log('⏭️  既に記事あり。スキップ');
    markStatus(queue, slug, 'completed', { completedAt: new Date().toISOString(), note: 'already exists' });
    return { slug, status: 'skipped' };
  }

  markStatus(queue, slug, 'in_progress');
  await saveQueue(queue);

  try {
    console.log('🔍 リサーチ中...');
    run('node', ['scripts/research-keyword.mjs', keyword, '--slug', slug]);

    console.log('✍️  記事生成中...');
    run('node', [
      'scripts/generate-article.mjs',
      '--slug',
      slug,
      '--keyword',
      keyword,
      '--category',
      category,
    ]);

    console.log('🎨 テンプレート変換...');
    run('node', ['scripts/convert-template-blocks.mjs', '--write']);

    console.log('🏗️  ビルド確認...');
    run('npm', ['run', 'build']);

    console.log('🔎 太字チェック...');
    if (!run('node', ['scripts/check-markdown-bold.mjs'], { allowFail: true })) {
      throw new Error('太字の未パースがあります。generate-article のプロンプトを見直してください');
    }

    const title = await extractTitle(slug);
    markStatus(queue, slug, 'completed', {
      completedAt: new Date().toISOString(),
      title,
    });

    return { slug, title, status: 'completed' };
  } catch (err) {
    markStatus(queue, slug, 'failed', {
      failedAt: new Date().toISOString(),
      error: err.message,
    });
    console.error(`❌ 失敗: ${err.message}`);
    return { slug, status: 'failed', error: err.message };
  } finally {
    await saveQueue(queue);
  }
}

async function main() {
  const { count, dryRun } = parseArgs(process.argv);

  if (!process.env.ANTHROPIC_API_KEY && !dryRun) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    process.exit(1);
  }

  const queue = await loadQueue();
  const targets = pickNextArticles(queue, count);

  if (targets.length === 0) {
    console.log('✅ 公開待ちのキューがありません。data/article-queue.json に追加してください');
    process.exit(0);
  }

  console.log(`📋 本日の対象: ${targets.length} 件`);
  for (const item of targets) {
    console.log(`   - ${item.slug} (${item.keyword})`);
  }

  if (dryRun) {
    console.log('\n(dry-run のため処理は行いません)');
    process.exit(0);
  }

  const results = [];
  for (const item of targets) {
    results.push(await processOne(item, queue));
  }

  const completed = results.filter((r) => r.status === 'completed');
  const failed = results.filter((r) => r.status === 'failed');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 完了: ${completed.length} 件`);
  if (failed.length > 0) {
    console.log(`❌ 失敗: ${failed.length} 件`);
    for (const f of failed) console.log(`   - ${f.slug}: ${f.error}`);
  }

  if (completed.length === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
