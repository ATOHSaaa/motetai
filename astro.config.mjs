// @ts-check
import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'atohsaaa';
const repo = 'motetai';
const base = process.env.ASTRO_BASE ?? `/${repo}/`;
const site = process.env.ASTRO_SITE ?? `https://${owner}.github.io`;

// https://astro.build/config
/** @param {string} basePath */
function rehypeBaseLinks(basePath) {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = `${normalizedBase}${href.slice(1)}`;
      }
    });
  };
}

export default defineConfig({
  site,
  base,
  markdown: {
    rehypePlugins: [[rehypeBaseLinks, base]],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
