# Portfolio and notes

A static Astro portfolio with a Markdown technical notebook. No backend or CMS.

## View the site

Once the [deployment workflow](https://github.com/heziq/heziq/actions/workflows/deploy.yml) finishes, open [the website](https://heziq.github.io/heziq/).

To view it locally now, run `npm install` and `npm run dev`, then open the local URL printed by Astro. The project base path is `/heziq/`, so the URL will normally end in `/heziq/`.

## Local development

```sh
npm install
npm run dev
npm run check
npm run build
```

## Add a note

Create `src/content/notes/<subject>/<slug>.md` with frontmatter like:

```md
---
title: "My new note"
date: 2026-10-05
category: "Algorithms"
tags: [graph, leetcode]
description: "One sentence about the note."
---

## First heading

Write in Markdown.
```

Valid categories are `Algorithms`, `Systems`, `AI / Agents`, `Research`, and `Graphics / CV`. The site builds note pages, category lists, tag pages, recent notes, and article navigation automatically. Dates determine ordering. Push the note to `main` to trigger deployment.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`. GitHub Pages is configured to use GitHub Actions as its source.

`astro.config.mjs` reads `GITHUB_REPOSITORY` during Actions builds. In `heziq/heziq`, the site uses `https://heziq.github.io/heziq/`. If the repository is renamed to `heziq.github.io`, it automatically uses `/` as the base path. For a different owner or repository, the same variables provide the matching site URL and base path.

Project summaries and links live in `src/lib/projects.ts`. The resume page is a placeholder until a PDF or HTML resume is ready.
