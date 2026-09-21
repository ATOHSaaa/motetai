import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      'matching-app',
      'konkatsu',
      'appearance',
      'date-talk',
      'fashion',
    ]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().optional(),
    affiliate: z.boolean().default(false),
    targetKeyword: z.string().optional(),
    targetKeywords: z.array(z.string()).default([]),
    researchSlug: z.string().optional(),
  }),
});

export const collections = { articles };
