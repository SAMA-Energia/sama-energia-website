# SAMA Energia Website — Repo Rules

This is a **static site**: plain HTML/CSS, no frameworks. Pages are generated
by a dependency-free local script (decided 2026-08-20 for real URLs + per-page
SEO metadata) — **no server-side build**; generated output is committed.

- Sources: `src/fi.html` and `src/et.html` (one file per language). Edit these,
  never the generated pages (`index.html`, `<slug>/index.html`, `et/**`,
  `sitemap.xml`, `_headers`).
- Build: `node scripts/build-pages.mjs` · Verify: `node scripts/verify-pages.mjs`
- Run both after every content change and commit sources + output together.

The generated pages on `main` are the live public site.

## Language

All customer-facing text is Finnish or Estonian and requires a
**native-speaker pass** before merging to `main`.

## Content rules that bind this repo

- Partner names permitted ONLY in the Kumppanit section of the FI meistä page
  (founder decision 28.08.2026, Martin); banned everywhere else, including .ee,
  until further decision.
- Team bios permitted as of 28.08.2026 (founder decision, Martin).
- No track-record claims. (Retained in full force.)
- No figures without a documented source. (Retained in full force.)

When in doubt, leave it out and flag it.

## Registered deviations from the URL spec

- **Trailing-slash canonicals** (`/slug/` directory style, not extensionless
  files): chosen 2026-08-20 with the multi-page migration; Netlify serves
  `<slug>/index.html` natively and all canonicals/hreflang/sitemap use this
  form consistently. Do not "normalize" one without the others.
- **§12 GoAccess log analytics**: not possible on Netlify (no server log
  access). Registered decision 2026-08-21: use Netlify Analytics or defer.
  Either way, no third-party client-side analytics — the no-analytics
  doctrine stands.
