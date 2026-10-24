# Portfolio, notes, and journal

A static Astro portfolio with Markdown technical notes and a separate journal page. No backend or CMS.

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

## Add a note

Create `src/content/notes/<subject>/<slug>.md` with frontmatter like:

```md
---
title: "My new note"
date: 2026-10-05
category: "Algorithms"
tags: [Graph, LeetCode]
description: "One sentence about the note."
---

## First heading

Write in Markdown.
```

Use `Algorithms`, `Paper Reading`, or `Learn` for `category`. Tags can overlap across categories; for example, a paper reading about agents could use `category: "Paper Reading"` and `tags: [AI, Systems]`. The article layout keeps notes grouped by category on the left and the current article's headings on the right. The Journal page is separate and currently has no entries. Dates determine ordering. Push the note to `main` to trigger deployment.

For paper reading notes, copy `src/content/notes/paper/_template.md.example` to `src/content/notes/paper/<paper-slug>.md`. Replace the sample title, date, tags, description, paper link, and body. Use a short lowercase filename such as `attention-is-all-you-need.md`; it becomes part of the note URL. Keep `category: "Paper Reading"` so the note appears in that category. Use a few consistent topic tags (for example, `AI`, `Systems`, `LLM`) so tag pages group related notes. The `.example` template is not published as a note.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`. GitHub Pages is configured to use GitHub Actions as its source.

`astro.config.mjs` reads `GITHUB_REPOSITORY` during Actions builds. In `heziq/heziq`, the site uses `https://heziq.github.io/heziq/`. If the repository is renamed to `heziq.github.io`, it automatically uses `/` as the base path. For a different owner or repository, the same variables provide the matching site URL and base path.

## Add a project

Create one Markdown file in `src/content/myproject/`, named for its URL slug (for example, `my-project.md` becomes `/projects/my-project/`). Put the card summary and metadata in frontmatter, then write the detail page in Markdown:

```md
---
title: "My project"
description: "One sentence for the project card."
tags: [Graphics, Research]
order: 5
github: "https://github.com/example/my-project"
role: "Independent project"
stack: [Python, OpenGL]
---

## Overview

What the project does and why it matters.
```

Lower `order` values appear first; the first three projects also appear on the home page. A file gets a detail page automatically. Use `detail: false` for a summary-only placeholder. For a card and detail-page cover, put an image in `public/images/projects/` and set `image: "images/projects/my-project.webp"`. For images inside the article, place the file alongside the Markdown (or in a nearby `images/` folder) and use a relative Markdown image such as `![Project screenshot](./images/my-project.webp)`. Cards without an image keep the existing abstract visual.

Contact links are on the home page in `src/pages/index.astro`. The Notes page searches a static index generated from note titles, descriptions, categories, tags, and Markdown text. No search service is needed.
