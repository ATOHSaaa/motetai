#!/usr/bin/env node
/**
 * 記事キューの管理 CLI
 *
 * Usage:
 *   node scripts/article-queue.mjs list
 *   node scripts/article-queue.mjs next [--count 2]
 *   node scripts/article-queue.mjs add --slug xxx --keyword "..." --category matching-app
 */

import { findQueueItem, loadQueue, pickNextArticles, saveQueue } from './lib/article-queue.mjs';

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] ?? 'list';
  const options = { count: 2, slug: '', keyword: '', category: '', priority: 50, targetKeywords: [] };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) options.count = Number(args[++i]);
    else if (args[i] === '--slug' && args[i + 1]) options.slug = args[++i];
    else if (args[i] === '--keyword' && args[i + 1]) options.keyword = args[++i];
    else if (args[i] === '--category' && args[i + 1]) options.category = args[++i];
    else if (args[i] === '--priority' && args[i + 1]) options.priority = Number(args[++i]);
    else if (args[i] === '--tags' && args[i + 1]) options.targetKeywords = args[++i].split(',').map((s) => s.trim());
  }

  return { command, options };
}

async function main() {
  const { command, options } = parseArgs(process.argv);
  const queue = await loadQueue();

  if (command === 'list') {
    const pending = queue.articles.filter((a) => a.status === 'pending');
    const done = queue.articles.filter((a) => a.status === 'completed');
    const failed = queue.articles.filter((a) => a.status === 'failed');

    console.log(`pending: ${pending.length} / completed: ${done.length} / failed: ${failed.length}\n`);

    for (const item of pending.sort((a, b) => b.priority - a.priority)) {
      console.log(`[${item.priority}] ${item.slug}`);
      console.log(`    ${item.keyword} (${item.category})`);
    }
    return;
  }

  if (command === 'next') {
    const next = pickNextArticles(queue, options.count);
    if (next.length === 0) {
      console.log('キューが空です');
      return;
    }
    for (const item of next) {
      console.log(`${item.slug}\t${item.keyword}\t${item.category}`);
    }
    return;
  }

  if (command === 'add') {
    const { slug, keyword, category, priority, targetKeywords } = options;
    if (!slug || !keyword || !category) {
      console.error('Usage: node scripts/article-queue.mjs add --slug xxx --keyword "..." --category matching-app');
      process.exit(1);
    }

    if (findQueueItem(queue, slug)) {
      console.error(`❌ ${slug} は既にキューにあります`);
      process.exit(1);
    }

    queue.articles.push({
      slug,
      keyword,
      category,
      targetKeywords,
      priority,
      status: 'pending',
    });

    await saveQueue(queue);
    console.log(`✅ 追加: ${slug}`);
    return;
  }

  console.error('Unknown command. Use: list | next | add');
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
