import { defineConfig } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER || 'heziq';
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'heziq';
const isUserSite = repository.toLowerCase() === `${owner.toLowerCase()}.github.io`;

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: isUserSite ? '/' : `/${repository}`,
  trailingSlash: 'always',
});
