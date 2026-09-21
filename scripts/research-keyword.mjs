#!/usr/bin/env node
/**
 * 狙う検索キーワードの上位記事をリサーチし、記事執筆用ブリーフを生成する
 *
 * Usage:
 *   node scripts/research-keyword.mjs "マッチングアプリ おすすめ 男性"
 *   node scripts/research-keyword.mjs "婚活 30代 男性" --slug konkatsu-30s-male
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RESEARCH_DIR = join(ROOT, 'research');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u30ff\u4e00-\u9faf]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let keyword = '';
  let slug = '';
  let limit = 10;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = Number(args[++i]);
    } else if (!args[i].startsWith('--')) {
      keyword = args[i];
    }
  }

  if (!keyword) {
    console.error('Usage: node scripts/research-keyword.mjs "<keyword>" [--slug article-slug] [--limit 10]');
    process.exit(1);
  }

  return { keyword, slug: slug || slugify(keyword), limit };
}

/** DuckDuckGo HTML から検索結果を取得 */
async function searchDuckDuckGo(query, limit) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ja-JP,ja;q=0.9' },
  });

  if (!res.ok) throw new Error(`DuckDuckGo search failed: ${res.status}`);

  const html = await res.text();
  const results = [];
  const blockRegex =
    /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  let match;
  while ((match = blockRegex.exec(html)) !== null && results.length < limit) {
    const rawUrl = match[1];
    const title = stripHtml(match[2]).trim();
    const snippet = stripHtml(match[3]).trim();

    if (!title || !rawUrl) continue;

    const decodedUrl = decodeDuckDuckGoUrl(rawUrl);
    if (!decodedUrl || isExcludedUrl(decodedUrl)) continue;

    results.push({ rank: results.length + 1, title, url: decodedUrl, snippet });
  }

  return results;
}

function decodeDuckDuckGoUrl(href) {
  if (href.startsWith('http')) return href;
  const uddg = href.match(/uddg=([^&]+)/);
  if (uddg) return decodeURIComponent(uddg[1]);
  return href;
}

function isExcludedUrl(url) {
  const excluded = ['youtube.com', 'twitter.com', 'x.com', 'instagram.com', 'amazon.co.jp', 'wikipedia.org'];
  return excluded.some((d) => url.includes(d));
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

/** ページの title と h2 を取得（タイムアウト付き） */
async function fetchPageStructure(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ja-JP,ja;q=0.9' },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]).trim() : '';

    const h2s = [];
    const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
    let h2Match;
    while ((h2Match = h2Regex.exec(html)) !== null && h2s.length < 15) {
      const text = stripHtml(h2Match[1]).trim();
      if (text && text.length < 100) h2s.push(text);
    }

    const textLength = stripHtml(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')).length;

    return { title, h2s, estimatedChars: textLength };
  } catch {
    return null;
  }
}

function analyzeCompetitors(results, structures) {
  const allH2s = structures.flatMap((s) => s?.h2s ?? []);
  const h2Freq = {};
  for (const h2 of allH2s) {
    const key = h2.toLowerCase();
    h2Freq[key] = (h2Freq[key] || 0) + 1;
  }

  const commonTopics = Object.entries(h2Freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  const titlePatterns = results.map((r) => r.title);

  return { commonTopics, titlePatterns };
}

function buildBriefMarkdown({ keyword, slug, results, structures, analysis }) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    `# キーワードリサーチ: ${keyword}`,
    '',
    `- 調査日: ${date}`,
    `- 記事スラッグ: ${slug}`,
    `- 対象キーワード: \`${keyword}\``,
    '',
    '## 上位10記事一覧',
    '',
    '| 順位 | タイトル | URL |',
    '|------|---------|-----|',
  ];

  for (const r of results) {
    const title = r.title.replace(/\|/g, '\\|');
    lines.push(`| ${r.rank} | ${title} | ${r.url} |`);
  }

  lines.push('', '## 各記事の分析', '');

  for (const r of results) {
    const s = structures[r.rank - 1];
    lines.push(`### ${r.rank}. ${r.title}`, '');
    lines.push(`- URL: ${r.url}`);
    lines.push(`- スニペット: ${r.snippet}`);
    if (s) {
      lines.push(`- ページtitle: ${s.title}`);
      lines.push(`- 推定文字数: 約${s.estimatedChars.toLocaleString()}文字`);
      if (s.h2s.length > 0) {
        lines.push('- 見出し(H2):');
        for (const h2 of s.h2s) lines.push(`  - ${h2}`);
      }
    } else {
      lines.push('- （ページ構造の取得に失敗）');
    }
    lines.push('');
  }

  lines.push('## 競合の共通トピック（H2頻出）', '');
  if (analysis.commonTopics.length > 0) {
    for (const { topic, count } of analysis.commonTopics) {
      lines.push(`- ${topic}（${count}記事で出現）`);
    }
  } else {
    lines.push('- （H2データが不足しています。手動で上位記事を確認してください）');
  }

  lines.push('', '## タイトルパターン分析', '');
  for (const t of analysis.titlePatterns) {
    lines.push(`- ${t}`);
  }

  lines.push(
    '',
    '## 記事執筆チェックリスト',
    '',
    '上位記事を参考にしつつ、以下を満たすこと:',
    '',
    '- [ ] 競合が扱っている必須トピックをすべてカバーしている',
    '- [ ] 競合より具体例・表・チェックリストが充実している',
    '- [ ] タイトルに検索キーワードを自然に含めている',
    '- [ ] 独自の切り口（男性向け・論理的・データ）がある',
    '- [ ] 読者の悩みに寄り添う優しいトーンを保っている',
    '- [ ] 内部リンク・関連記事への導線がある',
    '',
    '## 差別化ポイント（執筆前に記入）',
    '',
    '- ',
    '',
    '## メモ',
    '',
    '- ',
    ''
  );

  return lines.join('\n');
}

async function main() {
  const { keyword, slug, limit } = parseArgs(process.argv);

  console.log(`🔍 キーワードリサーチ: "${keyword}"`);
  console.log(`   上位${limit}件を調査中...\n`);

  const results = await searchDuckDuckGo(keyword, limit);

  if (results.length === 0) {
    console.error('❌ 検索結果が取得できませんでした。キーワードを変えて再試行してください。');
    process.exit(1);
  }

  console.log(`✅ ${results.length}件の検索結果を取得`);
  console.log('📄 各ページの構造を分析中...\n');

  const structures = [];
  for (const r of results) {
    process.stdout.write(`   [${r.rank}/${results.length}] ${r.title.slice(0, 40)}...`);
    const structure = await fetchPageStructure(r.url);
    structures.push(structure);
    console.log(structure ? ' ✓' : ' ✗');
    await sleep(500);
  }

  const analysis = analyzeCompetitors(results, structures);
  const brief = buildBriefMarkdown({ keyword, slug, results, structures, analysis });

  if (!existsSync(RESEARCH_DIR)) {
    await mkdir(RESEARCH_DIR, { recursive: true });
  }

  const outPath = join(RESEARCH_DIR, `${slug}.md`);
  await writeFile(outPath, brief, 'utf-8');

  console.log(`\n📝 リサーチブリーフを保存: research/${slug}.md`);
  console.log('\n次のステップ:');
  console.log('  1. research/' + slug + '.md を読む');
  console.log('  2. 競合分析をもとに記事を執筆');
  console.log('  3. frontmatter に targetKeyword を設定');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
