# SAMA Energia — Public Website

This repo is the **single source of record** for the SAMA Energia public website
(samaenergia.fi / samaenergia.ee / samaenergia.com).

## Deployment

- Deployed via **Netlify auto-deploy from `main`**.
- Draft/review versions live on the **`draft`** branch.
- Netlify serves the repo as-is (no server-side build): generated pages are
  **committed**.

## Structure & build

- **Edit** `src/fi.html` (Finnish) and `src/et.html` (Estonian) — one source
  file per language. Per-page titles/descriptions live in `data-title` /
  `data-desc` attributes on each `.page` div.
- Shared styles/scripts: `assets/site.css`, `assets/site.js`.
- **Generate** all pages, `sitemap.xml`, and `_headers`:
  `node scripts/build-pages.mjs`
- **Verify** before committing: `node scripts/verify-pages.mjs`
- **Review mode**: open `https://draft--samaenergia.netlify.app/?review=1` to see
  draft changes vs production highlighted (copper outlines + UUSI/MUUTETTU labels,
  banner lists changed pages). The build writes `assets/review.json` by diffing
  `src/` against `origin/main`; on `main` the diff is empty, and without the
  `?review=1` parameter the mode loads nothing — inert by construction.
- Never edit generated files by hand (`index.html`, `<slug>/index.html`,
  `et/**`, `sitemap.xml`, `_headers`) — they are overwritten by the build.

## Ownership

Held by the SAMA-Energia GitHub organization as interim holder (business
attribution: SAMA Energia Oy, in formation), solely owned by Martin Rautio.
Founder access to be added per the founder term sheet.

## Rules

Never commit secrets, API keys, or customer data to this repo.
