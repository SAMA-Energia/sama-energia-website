# SAMA Energia Website — Repo Rules

This is a **static site**: plain HTML/CSS, no frameworks. Pages are generated
by a dependency-free local script (decided 2026-08-20 for real URLs + per-page
SEO metadata) — **no server-side build**; generated output is committed.

- Sources: `src/fi.html` and `src/et.html` (one file per language). Edit these,
  never the generated pages (`index.html`, `<slug>/index.html`, `et/**`,
  `404.html`, `sitemap.xml`, `llms-full.txt`, `_headers`).
- Build: `node scripts/build-pages.mjs` · Verify: `node scripts/verify-pages.mjs`
- Run both after every content change and commit sources + output together.

The generated pages on `main` are the live public site.

## Design system

- **Design system v5 (gold/typographic, Newsreader + IBM Plex Sans) supersedes
  Valgusklaas/Sügav Salu — 03.09.2026.** Source of record: the founders' design
  files `fi 3.1` / `et 5.1` (kept outside the repo), converted into the two
  sources. Shared `assets/site.css` (single stylesheet) and `assets/site.js`.
- Fonts are self-hosted in `assets/fonts/` with `font-display: swap`. No
  Google Fonts, no third-party request of any kind — `verify-pages.mjs` fails
  the build on any external resource.
- Contrast: small text uses `--ink-3` / `--gold-deep` (AA on paper-2), gold
  italics in headlines only at ≥ 24 px. Keep it that way.

## Language

All customer-facing text is Finnish or Estonian and requires a
**native-speaker pass** before merging to `main`.

## Content rules that bind this repo

- Partner names are permitted site-wide, both languages, for exactly this
  list: VENI Energia, Soleron Energy, Ralos Oy, JSM Automaatiosähkö Oy, Svea —
  founder decision 03.09.2026 (Martin). No other company name may be added
  without a founder decision. One named financing company was removed from the
  site by founder decision 03.09.2026 and must not be reintroduced (see the
  project's Decision Log; do not name it here).
- Team titles and personal contact numbers as published on Meistä/Meist are
  approved — founder decision 03.09.2026.
- Team bios permitted as of 28.08.2026 (founder decision, Martin).
- No track-record claims. (Retained in full force.)
- No figures without a documented source. (Retained in full force.)
- Reserve-market shares are quoted as *prequalified capacity* ("säätökokein
  todennettu kapasiteetti"), never as "produced" — Fingrid, Energiavarastot
  reservimarkkinoilla, 10.2.2025.
- Backup power is always qualified: it requires an installation designed for
  island operation and a separated critical circuit, assessed per site.

When in doubt, leave it out and flag it.

## Registered deviations from the URL spec

- **Trailing-slash canonicals** (`/slug/` directory style, not extensionless
  files): chosen 2026-08-20 with the multi-page migration; Netlify serves
  `<slug>/index.html` natively and all canonicals/hreflang/sitemap use this
  form consistently. Do not "normalize" one without the others.
- **Unpaired pages**: articles are per-language (`ajankohtaista/<slug>` on .fi,
  `ulevaated/<slug>` on .ee) and listed in `UNPAIRED` in `build-pages.mjs`;
  they get canonical + og and hreflang only to themselves + x-default.
- **§12 GoAccess log analytics**: not possible on Netlify (no server log
  access). Registered decision 2026-08-21: use Netlify Analytics or defer.
  Either way, no third-party client-side analytics — the no-analytics
  doctrine stands.
