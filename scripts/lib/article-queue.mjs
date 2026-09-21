import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const QUEUE_PATH = join(ROOT, 'data', 'article-queue.json');
const ARTICLES_DIR = join(ROOT, 'src', 'content', 'articles');

export { QUEUE_PATH, ROOT, ARTICLES_DIR };

export async function loadQueue() {
  const raw = await readFile(QUEUE_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function saveQueue(queue) {
  await writeFile(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`, 'utf-8');
}

export function articleExists(slug) {
  return existsSync(join(ARTICLES_DIR, `${slug}.md`));
}

/** 未公開・未作成の記事を priority 降順で取得 */
export function pickNextArticles(queue, count) {
  return queue.articles
    .filter((item) => item.status === 'pending' && !articleExists(item.slug))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, count);
}

export function findQueueItem(queue, slug) {
  return queue.articles.find((item) => item.slug === slug);
}

export function markStatus(queue, slug, status, extra = {}) {
  const item = findQueueItem(queue, slug);
  if (!item) return false;
  item.status = status;
  Object.assign(item, extra);
  return true;
}
