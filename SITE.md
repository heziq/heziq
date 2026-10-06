# Portfolio and writing

A static Astro portfolio with Markdown writing. No backend or CMS.

## View the site

Open [the website](https://heziq.github.io/heziq/). Each push to `main` updates it through the [deployment workflow](https://github.com/heziq/heziq/actions/workflows/deploy.yml).

To view it locally now, run `npm install` and `npm run dev`, then open the local URL printed by Astro. The project base path is `/heziq/`, so the URL will normally end in `/heziq/`.

## Local development

```sh
npm install
npm run dev
npm run check
npm run build
```

## Add writing

Create `src/content/notes/<subject>/<slug>.md` with frontmatter like:

```md
---
title: "My new note"
date: 2026-10-05
category: "Tech Notes"
topics: [Algorithms, Graph, LeetCode]
formats: [Study Notes]
description: "One sentence about the note."
---

## First heading

Write in Markdown.
```

Use `Tech Notes` or `Other` for `category`. Add as many `topics` and `formats` as fit the piece; for example, a paper reading about agents could use `topics: [AI / Agents, Systems]` and `formats: [Paper Notes]`. Topics and formats each get their own browse pages. The article layout keeps the writing list on the left and the current article's headings on the right. Dates determine ordering. Push the note to `main` to trigger deployment.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`. GitHub Pages is configured to use GitHub Actions as its source.

`astro.config.mjs` reads `GITHUB_REPOSITORY` during Actions builds. In `heziq/heziq`, the site uses `https://heziq.github.io/heziq/`. If the repository is renamed to `heziq.github.io`, it automatically uses `/` as the base path. For a different owner or repository, the same variables provide the matching site URL and base path.

Project summaries and links live in `src/lib/projects.ts`. Contact links are on the home page in `src/pages/index.astro`.
