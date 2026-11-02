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
  list: Soleron Energy, Ralos Oy, JSM Automaatiosähkö Oy —
  founder decision 03.09.2026 (Martin). No other company name may be added
  without a founder decision. No financing company may be named anywhere on the site — founder decision
  03.09.2026 (evening); the two financiers previously named were removed and
  must not be reintroduced (see the project's Decision Log; do not name them
  here). Financing is described generically: leasing or own capital, compared
  on the same figures in the written assessment.
- Partner names permitted: Soleron Energy, Ralos Oy, JSM Automaatiosähkö Oy, and Scanoffice Oy on the Finnish site only — founder decision 08.09.2026.
- **Kumppanit / Partnerid page (v34, founder decisions 25.10.2026, Martin):** products are listed by type
  and specification without naming the manufacturer, except the permitted names above. The page says SAMA
  has several suppliers and names manufacturer and model in the offer. A manufacturer is named only after
  its written confirmation, logged in R14 and the Decision Log, and added to the list above. Ready-made
  cards for pending names are kept OUTSIDE this public repo (project doc `claude/SAMA_Kumppanit_v34_odottavat.md`).
  "EP Energy" stays on the banned-name guard until that decision is made.
- Installation wording (founder decision 25.10.2026): the installation manager leads the work; electrical
  work and commissioning are done by a registered electrical contractor partner. Do not write "oma
  asennustiimi" / "paigaldusmeeskond" until there is an installation team under contract.
- Reserve income is described as *modelled* ("mallinnettu" / "modelleeritud") per product from realised
  hourly prices, future as a range — founder decision 25.10.2026 (replaces "kolme skenaariota").
- CSS budget 76 KB (was 70) — founder decision 25.10.2026.
- **VENI Energia removed site-wide 21.10.2026** at the company's request — founder decision (Martin). It must not be
  named, linked or described anywhere on the site, in either language, nor in llms.txt. Aggregation in Finland is
  described generically (/aggregaattori/). `verify-pages.mjs` fails the build if the name reappears in any served file.
- verify-pages.mjs carries content guards for figures and titles corrected on 03.09/06.09/08.09; a guard is removed only by a founder decision recorded in the project’s Decision Log.
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
  `uudised/<slug>` on .ee) and listed in `UNPAIRED` in `build-pages.mjs`;
  they get canonical + og and hreflang only to themselves + x-default.
- **§12 GoAccess log analytics**: not possible on Netlify (no server log
  access). Registered decision 2026-08-21: use Netlify Analytics or defer.
  Either way, no third-party client-side analytics — the no-analytics
  doctrine stands.

## v38 — lava (luonnos, haara v35-uusi-ilme, 02.11.2026)

- Etusivu FI/ET on nyt "lava": paremmalla kleepuv 3D-näyttämö (.lava-stage), vasemmalla tekstiaskeleet (.lv-g / .lv-s). Näyttämö vaihtaa kohtausta kerittäessä: katu (hero) → Suomi–Viro-kartta viidellä tasolla → kantaverkosta kennoon → akun viikko (tuluvood, reservimarkkinat ensin) → projektin vaiheet. Hiiri: parallaksi, heron kohteiden korostus, kartan solmujen vihjeet (lähteineen).
- Moottori `assets/scene.js` / `scene-et.js` (pohjana perustajien 6A-konseptit; värit logon kultaan; vaihe 2 näyttää sähköasentajan kameralla, ei droonia). Karttadata `assets/kartta.json` (rannikot Natural Earth).
- Kaikki kuvatekstien luvut lähteineen: Fingrid 24.2./18.8./30.9.2026, Elering (EstLink 3 700 MW), Euroopan komissio 9.2.2025, ERR 7.7.2026 (Kiisa + Aruküla 200 MW / 400 MWh), Caruna 1.9.2024, Elektrilevi.
- Perustajan linjaus 02.11.2026 (Madis): etusivulla ei nosteta yksittäisiä kumppaneita esiin — valinta koko markkinalta kohteen ja toiveiden mukaan; kumppanisivu säilyy. Roofit.Solar ei Viron sivulla ennen sopimusta (Suomessa yhteistyö aurinkokatto.com / Gare Energy Oy). Avant Power ja Scanoffice vain FI.
- Hyväksytyt tekstit säilytetty: hero-rivi ja ingressi (09.09.2026), tuluvoodid (ratkaisu-kortit), vaiheet (nain), kipu-, segmentti-, miksi-, UKK- ja lomakeosiot.
- Esikatselu: `python3 scripts/build-standalone.py v38` → `dist-preview/` (ei repoon).
- AVOIN: elävä Fingrid/Elering-data kartalle vaatisi kolmannen osapuolen pyynnön (Netlify-välipalvelin) — asutajaotsus.
- AVOIN: CSS-budjetti 76 → 88 kt (verify-pages).

## v39 — sektiopohjainen näyttämö + Yhteinen verkko -kartta datasta (luonnos, haara v35-uusi-ilme, 02.11.2026)

- Perustelu: `docs/tutkimus/2026-11-02-esilehe-loogika-v39.md` (konversionäyttö + Fingrid–Elering-aineisto). Scroll-ohjattu lava (v38) poistettu
  etusivulta: NN/g 2023 (scrolljacking), Frederick 2015 (parallaksi), Unbounce 2024 (pituus). 3D jää oikealle kleepuvana taustana, joka vaihtaa
  kohtausta osion mukaan (300 ms), reagoi hiireen, ei ohjaa vieritystä eikä sisällä tekstiä. Puhelimella ja reduced-motionilla: yksi still-kuva heron alla, piirto pysäytetään.
- Etusivun järjestys: hero → todisterivi (4 oman markkinan lukua lähteineen) → kipu (orbit-kuvio näyttämöllä) → kolme tilattavaa (Arvio/Varasto/Portfolio, kortit ohjaavat 3D-räjäytyskuvaa) →
  Yhteinen verkko (kartta, 3 kerrosta, "Vertaa Viroon/Suomeen", linkki /verkko/ ja /vork/) → vaiheet (animaatio, askelkorostus seuraa animaatiota) → kenelle → miksi → reserviteaser → UKK → lomake.
- Karttadata: `assets/kartta-data.json` (6 kerrosta + liittymä; FI/ET-tekstit; jokainen luku lähde+päivä; vertailukelpoisuushuomio per kerros) ja
  `assets/kartta-verkko.json` (OSM ODbL: 400 kV FI / 330 kV EE -johdot, HVDC-kaapelit, 74 sähköasemaa; Overpass 2.11.2026, Douglas-Peucker 0,006°; attribuutio piirretään karttaan).
  Moottori `_mapDraw` on datavetoinen: kerrokset `setMapLayers()`, kotimarkkina korostettu, toinen maa himmeänä kunnes vertailu päällä. `window.SAMA_KD/SAMA_KV` standalone-esikatselussa.
- Uusi sivu /verkko/ ↔ /vork/ (PAIRS, _redirects, llms.txt, NAV_KEY=reservimarkkinat/reserviturg): koko kartta, 7 kerrospainiketta, faktat molemmista maista, lähteet.
- Päätökset datasta: FI 2025 kulutus 84,6 TWh (Fingrid), FI huippu = ennätys 15 553 MW 8.1.2026, EE ennuste arengukava 7/2026 (10,0 / 11,2 TWh). Reservihintojen lasku ei kartalle (reservisivulle mallinnettuna).
- CSS-budjetti 88 → 92 kt (verify-pages) — avoin perustajapäätös. Esikatselu: `python3 scripts/build-standalone.py v39`.
- AVOIN: etusivun näkyvä sanamäärä ~1 100 (tavoite 500–800): kenelle-osion "Miksi tässä" -kappaleet ja kivun tiilet ovat seuraavat karsittavat; natiivitarkistus kaikille uusille FI/ET-teksteille.
