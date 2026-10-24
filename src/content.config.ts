import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['Algorithms', 'Paper Reading', 'Learn']),
    tags: z.array(z.string()).default([]),
    description: z.string(),
  }),
});

const myproject = defineCollection({
  loader: glob({ base: './src/content/myproject', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    order: z.number(),
    github: z.url().optional(),
    image: z.string().optional(),
    role: z.string().optional(),
    stack: z.array(z.string()).default([]),
    detail: z.boolean().default(true),
  }),
});

export const collections = { notes, myproject };
