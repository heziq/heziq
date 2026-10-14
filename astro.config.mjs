import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const owner = process.env.GITHUB_REPOSITORY_OWNER || 'heziq';
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'heziq';
const isUserSite = repository.toLowerCase() === `${owner.toLowerCase()}.github.io`;

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: isUserSite ? '/' : `/${repository}`,
  trailingSlash: 'always',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
