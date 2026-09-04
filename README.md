# SAMA Energia — Public Website

This repo is the **single source of record** for the SAMA Energia public website
(samaenergia.fi / samaenergia.ee / samaenergia.com).

**Non-developer contributors: see [OHJE.md](OHJE.md)** (Estonian + Finnish) —
edit `src/et.html` / `src/fi.html` in the browser on the `draft` branch; a
GitHub Action builds the pages for you.

## Deployment

- Deployed via **Netlify auto-deploy from `main`**.
- Draft/review versions live on the **`draft`** branch.
- Netlify serves the repo as-is (no server-side build): generated pages are
  **committed**.

## Structure & build

- **Edit** `src/fi.html` (Finnish) and `src/et.html` (Estonian) — one source
  file per language. Per-page titles/descriptions live in `data-title` /
  `data-desc` attributes on each `.page` div.
- Shared styles/scripts: `assets/site.css`, `assets/site.js` (design system v5,
  03.09.2026: gold/typographic, Newsreader + IBM Plex Sans).
- **Generate** all pages, both 404 pages, `sitemap.xml`, `llms-full.txt` and
  `_headers`: `node scripts/build-pages.mjs`
- **Verify** before committing: `node scripts/verify-pages.mjs`
- **Illustration QA** (optional, not part of the build; needs Chrome + `playwright-core`, e.g. `npm i -g playwright-core`):
  `node scripts/qa-illustrations.mjs before|after` measures every SVG illustration (text bboxes vs. viewBox, overlaps, mobile font size) and crops it; `… contact` builds before/after contact sheets. Output in `qa/illustrations/` (git-ignored).
- **Review mode**: open `https://draft--samaenergia.netlify.app/?review=1` to see
  draft changes vs production highlighted (gold outlines + UUSI/MUUTETTU labels,
  banner lists changed pages). The build writes `assets/review.json` by diffing
  `src/` against `origin/main`; on `main` the diff is empty, and without the
  `?review=1` parameter the mode loads nothing — inert by construction.
- Never edit generated files by hand (`index.html`, `<slug>/index.html`,
  `et/**`, `404.html`, `sitemap.xml`, `llms-full.txt`, `_headers`) — they are
  overwritten by the build.

Fonts are self-hosted (`assets/fonts/`, from the `@fontsource-variable/newsreader`
and `@fontsource/ibm-plex-sans` npm packages, SIL OFL) and declared in
`assets/fonts.css` with `font-display: swap`; the build preloads the two display
faces and the body face, and no page makes a third-party request. The two
Open Graph images `assets/og-fi.png` / `assets/og-et.png` (1200×630) are
rendered from a small HTML template with headless Chrome and committed; the
build emits `og:image` and `twitter:card` on every page. `llms-full.txt` is
generated from the same page HTML that is served (plain text of every public
page, one `# Title — URL` heading per page) next to the hand-written English
`llms.txt`. Articles are *unpaired* pages — each language has its own — listed
in `UNPAIRED` in `scripts/build-pages.mjs` and written as nested slugs
(`ajankohtaista/<slug>`, `ulevaated/<slug>`); they get canonical, og and a
self-referencing hreflang, and appear in the sitemap.

## Ownership

Held by the SAMA-Energia GitHub organization as interim holder (business
attribution: SAMA Energia Oy, in formation), solely owned by Martin Rautio.
Founder access to be added per the founder term sheet.

## Rules

Never commit secrets, API keys, or customer data to this repo.
