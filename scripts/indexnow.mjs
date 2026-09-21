#!/usr/bin/env node
/**
 * IndexNow — 記事作成・更新後に検索エンジンへURLを通知
 *
 * Usage:
 *   node scripts/indexnow.mjs --changed          # git差分の記事のみ
 *   node scripts/indexnow.mjs --all              # 全記事 + 主要ページ
 *   node scripts/indexnow.mjs article-slug-1 ... # 指定スラッグ
 */

import { execSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ARTICLES_DIR = join(ROOT, 'src/content/articles');

const INDEXNOW_KEY = 'e8f3a2b1c9d04e7f';
const INDEXNOW_HOST = 'atohsaaa.github.io';
const SITE_BASE = process.env.INDEXNOW_SITE_BASE ?? 'https://atohsaaa.github.io/motetai';

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];

function parseArgs(argv) {
  const args = argv.slice(2);
  let mode = 'slugs';
  const slugs = [];

  for (const arg of args) {
    if (arg === '--changed') mode = 'changed';
    else if (arg === '--all') mode = 'all';
    else if (!arg.startsWith('--')) slugs.push(arg.replace(/\.md$/, ''));
  }

  return { mode, slugs };
}

function articleUrl(slug) {
  return `${SITE_BASE}/articles/${slug}/`;
}

async function getAllArticleSlugs() {
  const files = await readdir(ARTICLES_DIR);
  return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}

function getChangedArticleSlugs() {
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD -- src/content/articles/', {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();

    if (diff) {
      return diff
        .split('\n')
        .filter(Boolean)
        .map((p) => p.replace('src/content/articles/', '').replace(/\.md$/, ''));
    }
  } catch {
    // HEAD~1 がない場合など
  }

  try {
    const staged = execSync('git diff --name-only --cached -- src/content/articles/', {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();

    if (staged) {
      return staged
        .split('\n')
        .filter(Boolean)
        .map((p) => p.replace('src/content/articles/', '').replace(/\.md$/, ''));
    }
  } catch {
    // ignore
  }

  try {
    const unstaged = execSync('git diff --name-only -- src/content/articles/', {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();

    if (unstaged) {
      return unstaged
        .split('\n')
        .filter(Boolean)
        .map((p) => p.replace('src/content/articles/', '').replace(/\.md$/, ''));
    }
  } catch {
    // ignore
  }

  return [];
}

function getStaticPages() {
  return [
    `${SITE_BASE}/`,
    `${SITE_BASE}/articles/`,
    `${SITE_BASE}/ranking/`,
    `${SITE_BASE}/about/`,
    `${SITE_BASE}/category/matching-app/`,
    `${SITE_BASE}/category/konkatsu/`,
    `${SITE_BASE}/category/appearance/`,
    `${SITE_BASE}/category/date-talk/`,
    `${SITE_BASE}/category/fashion/`,
  ];
}

async function resolveUrls({ mode, slugs }) {
  if (mode === 'all') {
    const articleSlugs = await getAllArticleSlugs();
    return [...getStaticPages(), ...articleSlugs.map(articleUrl)];
  }

  if (mode === 'changed') {
    const changed = getChangedArticleSlugs();
    if (changed.length === 0) {
      console.log('ℹ️  変更された記事はありません');
      return getStaticPages();
    }
    return [
      `${SITE_BASE}/`,
      `${SITE_BASE}/articles/`,
      ...changed.map(articleUrl),
    ];
  }

  if (slugs.length === 0) {
    console.error('Usage: node scripts/indexnow.mjs [--changed|--all] [slug...]');
    process.exit(1);
  }

  return [
    `${SITE_BASE}/`,
    `${SITE_BASE}/articles/`,
    ...slugs.map(articleUrl),
  ];
}

async function verifyKeyFile() {
  const keyPath = join(ROOT, 'public', `${INDEXNOW_KEY}.txt`);
  try {
    const content = (await readFile(keyPath, 'utf-8')).trim();
    return content === INDEXNOW_KEY;
  } catch {
    return false;
  }
}

async function submitToIndexNow(urls) {
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_BASE}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const results = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });

      results.push({ endpoint, status: res.status, ok: res.ok || res.status === 202 });

      if (res.ok || res.status === 202) {
        console.log(`  ✓ ${endpoint} → ${res.status}`);
      } else {
        const body = await res.text().catch(() => '');
        console.log(`  ✗ ${endpoint} → ${res.status} ${body.slice(0, 100)}`);
      }
    } catch (err) {
      console.log(`  ✗ ${endpoint} → エラー: ${err.message}`);
      results.push({ endpoint, ok: false });
    }
  }

  return results.some((r) => r.ok);
}

async function submitWithRetry(urls, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    if (i > 0) {
      const wait = i * 10;
      console.log(`  リトライ ${i}/${maxRetries - 1}（${wait}秒後）...`);
      await sleep(wait * 1000);
    }

    const ok = await submitToIndexNow(urls);
    if (ok) return true;
  }
  return false;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { mode, slugs } = parseArgs(process.argv);
  const urls = [...new Set(await resolveUrls({ mode, slugs }))];

  if (!(await verifyKeyFile())) {
    console.error(`❌ キーファイル public/${INDEXNOW_KEY}.txt が見つかりません`);
    process.exit(1);
  }

  console.log(`📡 IndexNow 送信 (${urls.length} URL)`);
  console.log(`   サイト: ${SITE_BASE}`);
  console.log(`   キー: ${INDEXNOW_KEY}.txt\n`);

  for (const url of urls) {
    console.log(`   - ${url}`);
  }
  console.log('');

  const ok = await submitWithRetry(urls);

  if (ok) {
    console.log('\n✅ IndexNow 送信完了（Bing 等の検索エンジンに通知されました）');
  } else {
    console.log('\n⚠️  IndexNow 送信に失敗しました。デプロイ直後はキーファイルの反映を待って再実行してください。');
    console.log(`   再実行: npm run indexnow -- --changed`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
