// @ts-check
import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';

import tailwindcss from '@tailwindcss/vite';
import { siteEnv } from './site.config.mjs';

const base = siteEnv.basePath;
const site = siteEnv.origin;

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
});
