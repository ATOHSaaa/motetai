// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'atohslit1113';
const repo = 'motetai';
const base = process.env.ASTRO_BASE ?? `/${repo}/`;
const site = process.env.ASTRO_SITE ?? `https://${owner}.github.io`;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
