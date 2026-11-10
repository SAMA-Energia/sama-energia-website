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
- Partner names permitted after written confirmation (R14): Elecnova (both sites) and Avant Power (Finnish site only) — decision
  I-20261023-1, 23.10.2026; Gare Energy Oy (Finnish site only; integrated solar roofs, aurinkokatto.com) — founder line 02.11.2026,
  recorded under v38 below. Name only: model names and technical values belong in the offer, not on the page (founder decision
  04.11.2026, below; *superseded 9.11.2026 by the product catalogue decision in the v53 section*). Soleron Energy is named on the Estonian site only, as each market argues with its own facts (applied
  04.11.2026). Roofit.Solar (manufacturer without a contract; the Finnish cooperation runs through Gare Energy Oy), EP Energy /
  EP Equipment and Energen Nordic are not named on either site until the founder decides. `verify-pages.mjs` guards `nimet-1104`
  and `mallinimet-1104` fail the build if these names or product model names reappear in visible text.
- **Kumppanit / Partnerid page (v34, founder decisions 25.10.2026, Martin):** products are listed by type
  and specification without naming the manufacturer, except the permitted names above. The page says SAMA
  has several suppliers and names manufacturer and model in the offer. A manufacturer is named only after
  its written confirmation, logged in R14 and the Decision Log, and added to the list above. Ready-made
  cards for pending names are kept OUTSIDE this public repo (project doc `claude/SAMA_Kumppanit_v34_odottavat.md`).
  "EP Energy" stays on the banned-name guard until that decision is made. *(Superseded by D1 below.)*
- **Supplier names, decision D1 (Martin 07.11.2026; launch bundle 08.11.2026):** the supplier names EP Energy, Elecnova,
  Avant Power, Gare Energy and Roofit.Solar stay on the site (reverses P1–P3 of 25.10.2026; EP Energy was already allowed by
  Madis on 06.11.2026). State at launch: EP Energy, Elecnova and Avant Power on both sites; Gare Energy and Roofit.Solar on the
  Finnish site only (Roofit.Solar together with Gare Energy; guard `roofit-et`); Soleron Energy on the Estonian site; Scanoffice
  on both (06.11.2026). Never named: EP Equipment and Energen Nordic (guard `nimet-1104`), the financing companies (guard
  `kielletyt-nimet`, which no longer lists EP Energy), VENI. ~~Model names and technical values stay in the offer (`mallinimet-1104`).~~
  Superseded 9.11.2026 (Madis): product photo, manufacturer, model and key specs from the manufacturer datasheet, with source and
  date, are shown in the subpage product catalogue; guard `mallinimet-1104` removed (see v53).
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

## v39-1 — kontrollin korjaukset (haara v35-uusi-ilme, 03.11.2026)

- Kontrolli: `docs/kontroll/2026-11-02-audit.md` (arvosanat, 10 korjausta, natiivilista; osio "Seis 03.11.2026" kertoo mitä on jo tehty).
- Varavoima/varutoide aina ehdolla myös etusivun hotellikortissa. 3D: ei erillistä akkuinvertteriä — `_xPcs` piirtää akkukaapin (etusivun kuvitus 3 kaappia, varasto-kerros 4); INVERTTERI/INVERTER-tarrat pois.
- Reservisivujen data-desc "mallinnettu/modelleeritud", ei "kolme skenaariota"; "satoja kertoja / sadu kordi" pois (ei lähdettä).
- Puhelin (<= 750 px, sivuilla joilla .lava): 3D-moottoria ei käynnistetä; still-kuva `assets/hero-3d.webp` (938×586, ei tarroja) hero-ryhmässä. Kuvan päivitys moottorimuutosten jälkeen: renderöi .cv-hero still-tilassa 519 px leveällä ikkunalla, DPR 2 (canvas 479 css-px < 480 = ei tarroja). Hero-teksti ilman fade-animaatiota.

## Kartta /verkko/ ja /vork/ luvuiksi (vestlus C, haara v35-uusi-ilme, 02.11.2026)

- Sivu: seitsemän lukua tavallisella vierityksellä (kysymys → yksi johtopäätös → yksi luku → faktat lähteineen → toinen maa vertailuna määritelmämerkinnällä → lähteet), kartta tekstin ulkopuolella (≥ 1024 px kiinnitetty oikealle ja vaihtaa kerrosta luvun mukana; puhelimella lukujen yläpuolella). Sivun lohko `kartta:alku … kartta:loppu` generoidaan datasta: `python3 scripts/kaart/build_page.py` — älä muokkaa lohkoa käsin.
- Data: `assets/kartta-data.json` on yhteinen etusivun scene.js:n kanssa (muoto yhteensopiva: id/name/q/cmp/facts/pins; lisätty concl/big/pays/base/fx/note/sources/views/next). Jokainen luku lähde + päivä, tarkistettu 2.11.2026, seuraava tarkistus 1.2.2027 (rutiini: `docs/kaart/lugu.md`).
- Pohja `assets/kartta-pohja.json` (< 150 kt, `scripts/kaart/build_map.py`, OSM ODbL + Natural Earth) ja 110 kV erikseen `assets/kartta-110.json` (ladataan vain painikkeesta). Etusivun `kartta-verkko.json` ja `kartta.json` ennallaan.
- Moottori `assets/kartta.js` (SVG, ei piirtosilmukkaa; reduced-motion; kosketus, näppäimistö) + `assets/kartta.css` vain tällä sivulla (`data-assets="kartta"` → build-pages lisää linkin; ei kasvata site.css:n budjettia). /verkko/ ei enää lataa scene.js:ää. Globaali rajapinta `window.SAMA_VERKKO` (ei `SAMA_KARTTA`, jonka scene.js käyttää esikatselussa).
- verify-pages: kartan tiedostojen koot, jokaisen kerroksen johtopäätös sivulla = data, faktojen lähteet olemassa.
- AVOIN: natiivitarkistus kaikille uusille FI/ET-teksteille; Elektrilevi mainitaan datalähteenä (jakeluverkkoyhtiö); etusivun karttarivit (FI 1 050 MW 24.2.2026, ET „Hertz 1 Kiisa") päivitetään etusivun uudistuksessa; reaaliaikainen data vaatisi Netlify-funktion — perustajapäätös.

## Etusivun karttaosio moottorilla (vestlus C, 03.11.2026) — korvattu v41:llä 04.11.2026

- 3.11.2026 etusivun Yhteinen verkko -osio tehtiin kartta.js-moottorilla (painikkeet 1–7, kartta 3D-näyttämössä). v41 (K2, alla) korvasi
  etusivun staattisella karttaosiolla `.k-kaart` (tasokuvat, ei JS:ää); vestlus C:n etusivulohkoa ei ole lähteessä. Etusivutila
  (`data-mode="front"`) säilyy kartta.js:ssä käyttämättä; `build_page.py` ohittaa etusivun, jos merkkejä `kartta-etusivu:alku … loppu` ei ole.
- Samalla tuli /verkko/- ja /vork/-sivun kartalle v39-näyttämön ilme: maa kultaisina pisteinä, johtojen hehku, syvyys hiirellä (kaksi SVG:tä,
  verkkotaso 2D-siirrolla; ei CSS-perspektiiviä — Chromium jätti sen alla SVG-muutoksia piirtämättä). Kaksiriviset tunnisteet (EstLink,
  Fenno-Skan, synkronialueet), pistekohteet voittavat alueen 22 px:n säteellä, useampi `[data-kartta]`-lohko samassa dokumentissa (km0-, km1-…).
- Budjetit kartta.js 36 kt, kartta.css 20 kt. Esikatselu: `python3 scripts/build-standalone.py <versio> verkko,vork` (avautuu osioon);
  kartta.js upotetaan esikatseluun tekstinä — data:-skriptin tiedostonäkymä esti (Madis 3.11.2026: kartta ei näkynyt).
- AVOIN: natiivitarkistus uusille FI/ET-teksteille; `.k-kaart`-tasokuvien luvut kannattaa verrata `assets/kartta-data.json`:iin (sama lähde, 2.11.2026).
- 04.11.2026 (Madis: „ei samaa vieritysefektiä", „vain suurjännitejohto", „kartta ulottuu Saarenmaalle ja saarille"): /verkko/ ja /vork/ -kartta seuraa
  vieritystä kaikilla näytöillä (puhelimella kartta kiinnittyy ylös, luvut vierivät alla), kerros vaihtuu luvuittain, viimeinen luku zoomaa vierityksen
  mukana kotimaasta kohteeseen (v38:n "kartta kasvaa kerittäessä"); 110 kV (myös saarten johdot ja kaapelit) näkyy oletuksena. Data: `view`/`vmode` kerroksittain.
  ETUSIVUN VESTLUKSELLE (v42, scene.js-kartta): etusivun kartta piirtää vain `kartta-verkko.json`:n 400/330 kV ja ET-sivullakin koko Suomen
  (Viro pieni, saaret ilman johtoja) — Madiksen palaute 4.11.2026 koskee myös sitä: kaikki johdot (110 kV) ja saaret, kotimaa isona.
  Aineisto: `assets/kartta-110.json` (kartta.js:n LCC-polut) tai lon/lat `docs/kaart/osm/lines-2026-11-02.json` (voltage 110000: 4 113 johtoa).
  Valmis vaihtoehto: kartta.js:n etusivutila (`data-mode="front"`, `.km-inline` / `.km-slot`), testattu 3.11.2026.
  → Tehty 4.11.2026 (v42, alla): etusivun scene.js-kartta piirtää 110 kV:n ja saaret (`assets/kartta-etusivu.json` kartta-110.json:sta), kotimaa isona
  kartta-data.json:n näkymillä, viimeinen luku zoomaa vierityksen mukana.

## v41 — K2-etusivu (luonnos, haara v35-uusi-ilme, 04.11.2026)

- Etusivu FI/ET K2-konseptin mukaan (Claude Design -kanvas: k2-1440, k2-390, kaart-1440, kaart-390). Täysleveät osiot vaalea/tumma-rytmissä;
  `.k-chalk` = vaalea tokenisarja (myös lomake: vaaleat kentät, `color-scheme:light`). 3D vain still-kuvina: hero-tausta `k-hero-{1920,1280}.webp`,
  puhelimelle `k-hero-m.webp` + numeroidut nastat, päivänvalokuva `k-paev*.webp`, kohdekäynti `k-objekt*.webp`. Tarrat HTML:nä renderin
  prosenttiankkureista (`.k-tag.r` = nimilappu vasemmalle reunan lähellä). Heron korkeus seuraa näkymää (`100vh - 130px`, 600–860 px): seuraava osio pilkistää.
- Etusivu ei lataa 3D-moottoria (scene.js / scene-et.js + kartta-json, ~200 kt). Kartta on oma osio `.k-kaart`: kuusi kysymystä + "Teidän liittymänne",
  radio + label (ei JS:ää, nuolinäppäimet toimivat), tasokuvat `kk-{fi,ee}-{d,m}0–6.webp` (kanvasin map2-renderit; FI-varastotason neliö siirretty
  Kuopio-nimen vasemmalle puolelle). Luvut ja lähteet kanvasin kaart-datasta (tarkistettu 02.11.2026). Koko interaktiivinen kartta jää /verkko/ ↔ /vork/.
- Järjestys: hero (H1 lukittu, ET "oma"; v39-ingressi; CTA + "Miten akku toimii?" + puhelin; todiste FI 1 500 MW Fingrid 11.6.2025 / ET 3,73 €/MWh
  Elering 2026) → miten toimii (kipu + kolme asiaa + kuva + neljä tuloriviä, reservimarkkina ensin) → reserviteaser → kolme tilattavaa → kartta →
  näin edetään → kenelle → miksi SAMA → UKK (6, kaikki kiinni) → lomake.
- Siirretty etusivulta alasivulle (ei poistettu): kenelle-ingressi ja "Ettekö löytänyt…" → /energiavarastot/#kenelle-miksi ja /energiasalvestid/#kellele-miks;
  tarjouskorttien "mitä sisältää" -rivit ovat palvelusivulla (Mitä sisältää / Mitä te annatte). FI-etusivun osio-id:t takaisin suomeksi (etusivu, tarjoamme, verkko, nain).
- Sanamäärä (näkyvä teksti Chromessa, ilman ylä- ja alatunnistetta): FI 814 / ET 854, tavoite ≤ 800. Loput vaativat hyväksyttyjen tekstien lyhentämistä
  → perustajan valinta. Ehdotus (vain kokonaisten lauseiden poisto): Miksi SAMA -ingressi, UKK:n sivulause; ET lisäksi vaiheiden ingressin 1. lause ja
  Miksi SAMA -kohtien 2. lauseet → FI 784, ET 795.
- site.js: UKK "yksi auki kerrallaan" rajattu omaan `.faq`-lohkoonsa; kiinnitetty CTA tunnistaa K2-heron (`.k-hero`). build-standalone.py upottaa
  `<source srcset>` -kuvat. build-pages.mjs poistaa `&shy;`:n tekstiversioista (H1:n tavutuskohdat näkyvät vain puhelimella, `hyphens` ohjaa).
  native-pass.mjs vertaa nykyiseen mainiin 941e6ef (docs/native-pass/FI.md 347 riviä, ET.md 379 riviä, generoitu 04.11.2026).
- Lighthouse mobiili (paikallinen palvelin brotlilla, 2 ajoa): suorituskyky 87–89, saavutettavuus 100, parhaat käytännöt 100, SEO 100; FCP 1,2–1,4 s,
  LCP 3,5–3,6 s (simuloitu; LCP-elementti on heron ingressi, mitattuna verkon ja CPU:n hidastuksella ≈ 1,1 s), TBT 110–130 ms, CLS 0.
  Suurin jäljellä oleva vipu: Newsreader-muuttujafonttien preload (279 kt).
- AJASTETTU: 1.1.2027 Eleringin tasakaalustamisvõimsuse tasu 3,73 → 2,97 €/MWh (ERR 26.6.2026) — vaihda ET-heron todiste ja kartan Reservid-taso.
- AVOIN: natiivitarkistus; lähteet puuttuvat automaattitarkistuksessa kolmelta vanhalta riviltä (ET reservisivu "miinimumpakkumine 1 MW", invertteri/aku 1:2,
  tiimin aurinkokokemus) ja kahdelta FI-riviltä; push repoon vaatii oikeuden; etapit 2–4 (alasivut, riippumaton tarkistus + natiivi, perustajan OK → main).

## Perustajan päätökset 4.11.2026 (Madis) — koskevat seuraavaa etusivua

- Etusivun konsepti 1 "Objektid ees" suunnitelmasta "Veebileht v1 — plaan ja kvaliteedilatt" (https://claude.ai/artifact/3dVPs11nXDLpw64ZAbYetd); päätöslokissa I-20261104-2.
- Hero-otsikko (I-20261104-3) korvaa 9.9.2026 otsikon: ET „Teie elektriliitumine on vara. Pange see enda kasuks tööle." / FI „Sähköliittymänne on omaisuutta. Laittakaa se töihin omaksi eduksenne." v41-osion "H1 lukittu" ei enää päde. Toisen osion otsikko ei toista sanaa „vara".
- Ingressi (I-20261104-4) korvaa 9.9.2026 ingressin: ET „SAMA ehitab teie liitumise taha süsteemi: energiasalvesti, energia tootmise ja nutika juhtimise. Teenige valmisolekust, makske vähem ja otsustage ise." / FI „SAMA rakentaa liittymänne taakse järjestelmän: energiavaraston, energiantuotannon ja älykkään ohjauksen. Ansaitkaa reservimarkkinoilla, maksakaa vähemmän ja päättäkää itse." (FI Martinin natiivitarkistukseen).
- Hero (I-20261104-5): yksi paikallaan pysyvä kohtaus markkinaa kohden koko mittarin takaisella järjestelmällä ja neljä kohdepainiketta (viljankuivuri, teollisuus ja kylmävarasto, hotelli ja hoivakoti, aurinkopuisto). Kohtaus ja sen lause vaihtuvat vain lukijan valinnasta; mikään ei vaihdu itsestään (ei karusellia).
- Valokuvaus 9.–11.11.2026 (I-20261104-6): kolme muotokuvaa samassa valossa ja taustassa (Martin, Viljar, Madis), sähköasentaja pääkeskuksella, yksi kohde ulkoa. Nimikirjaimet vain siihen asti.
- Lupaus (I-20261104-7): kirjallinen arvio kahden työpäivän kuluessa tietojen saamisesta, sama kaikilla sivuilla (korvaa /palvelut/- ja /teenused/-sivujen „arvio valmistuu yleensä viikossa tietojen saamisesta" / „hinnang valmib tavaliselt nädalaga pärast andmete saamist").
- Kumppanit etusivulla: kaikki kirjallisesti vahvistetut kumppanit luokittain ja tasavertaisesti (korvaa 2.11.2026 linjauksen "etusivulla ei nosteta yksittäisiä kumppaneita esiin"). Nimi vain R14-merkinnän ja päätöslokin mukaan (I-20261023-1); malli ja tekniset arvot tarjoukseen, ei sivulle.
- ET-heron todiste ei ole €/MWh (Madis 8.9.2026: senttejä megawatilta ei kiinnosta ketään); suunnitelmassa Eleringin varustuskindluse aruanne 2025 (juhitav võimsus ~2 100 MW 2035, salvestid ~400 MW, ERR 9.12.2025).
- Työ haaraan pushataan jokaisen vaiheen jälkeen kysymättä (I-20261104-1); main vain Madiksen OK:lla.

## v42 — elävät luvut K2-sivuille (luonnos, haara v35-uusi-ilme, 04.11.2026)

- Madis 4.11.2026: v38:n vierityksen mukana kehittyvät 3D-kuvat ja kartta takaisin v41-sivuille. Elävä luku = `section.k-live[data-live="map|proc|sld"]`,
  askeleet `[data-step]`, karttapainikkeet `data-jump`: etusivun Yhteinen verkko / Ühine võrk (kartta) ja Näin edetään / Kuidas edasi (vaiheet) sekä
  energiavarastosivun uusi luku /energiavarastot/#kerros ↔ /energiasalvestid/#kihid (Kantaverkosta kennoon / Põhivõrgust akuelemendini, viisi kerrosta;
  linkki etusivun Miten toimii / Kuidas toimib -osiosta). Uudessa etusivussa (konsepti 1) samat luvut toimivat samalla merkinnällä.
- Moottori (scene.js / scene-et.js) käynnistyy vasta, kun luku lähestyy (IntersectionObserver). prefers-reduced-motion → ei moottoria, K2-stillit ja radio jäävät.
  Vieritystä ei ohjata: lukulinjaa (55 % näkymästä; puhelimella kiinnittyvän kuvan alapuolella) lähimpänä oleva askel ohjaa kuvaa, sld etenee jatkuvasti.
- Kartta: rajaus kartta-data.json:n näkymistä (`views`, kerroksen `view`, `vmode: scroll` — samat kuin /verkko/), viimeinen luku zoomaa kotimaasta
  kohteeseen vierityksen mukana; leveällä näytöllä kartta tarttuu osion yläreunasta (`--kk-lift`). 110 kV -verkko (myös saaret ja kaapelit) ja rantaviivat:
  `assets/kartta-etusivu.json` ← `python3 scripts/kaart/etusivu_110.py` (lähteet kartta-110.json + kartta-pohja.json; aja uudelleen, kun ne päivittyvät).
- Varastokerros: ei erillistä invertteriä — neljäs akkukaappi, tehoelektroniikka (PCS) ja ohjaus (EMS) piirretty avoimen kaapin sisään. Kanvaasin tarrat
  kääntyvät reunalla; puhelimessa (kanvaasi < 480 px) sld-luvussa ei tarroja.
- Lighthouse mobiili (paikallinen brotli-palvelin): /et/ 86–87, / 89–95, /et/energiasalvestid/ 93; saavutettavuus, parhaat käytännöt, SEO 100; CLS 0.
  Kartan aineisto latautuu vasta osion lähestyessä. Esikatselu: `python3 scripts/build-standalone.py v42`.
- AVOIN: natiivitarkistus uusille teksteille (sld-askeleet, linkkitekstit, kanvaasin tarrat, aria-labelit); `.k-kaart`-tasokuvat (reduced-motion)
  näyttävät vielä vain päälinjat — päivitettävä samaan aineistoon; uusi hero-otsikko (I-20261104-3) ja konsepti 1 kuuluvat seuraavaan etusivuun.

## v43 — konseptin 1 etusivu ja koko sivuston viimeistely (haara v35-uusi-ilme, 04.11.2026)

- Etusivu FI/ET Madiksen 4.11.2026 päätösten (I-20261104-2…7) ja tekstilehden "Esilehe tekstileht ET ja FI"
  (https://claude.ai/artifact/8hiJLLnQmFupFpEMkcAvyH) mukaan: hero (H1, ingressi, neljä kohdepainiketta, CTA, puhelin, todiste) → Miten toimii /
  Kuidas toimib (järjestelmä, neljä riviä, reservimarkkina ensin) → kolme tilattavaa → kartta (k-live map) → Näin edetään (k-live proc) →
  kumppanit luokittain (`.k-prt`) → tiimi nimikirjaimin + UKK (6) → tumma lomake (`section.closer`). Todiste FI 1 500 MW (Fingrid 11.6.2025),
  ET 1 300 MW / 751 MW (Elering, varustuskindluse aruanne 2025, tabel 2.3, 9.12.2025). Proosa ET 791 / FI 780 sanaa (tekstilehden laskutapa).
- Hero: radiot `.k-or` (#ko0–#ko3) ennen `.k-stage`- ja `.wrap`-sisaruksia; kohtaus `.k-scN`, lause `.k-sayN`, puhelin/tablettikuva `.k-mpN`
  vaihtuvat CSS:llä, ei automaattikiertoa. ET tööstus (oletus), kuivati, hotell, päike; FI kuivuri (oletus), teollisuus, hotelli, aurinko.
  Kuvat `k-hero-*` ja `k-obj-{kuivati,hotell,paike}-{1920,1280,m}.webp`, puhelimelle `k-obj-toostus-m.webp` (sama rajaus kaikissa);
  renderöijä `scripts/render-stills.mjs` + `scripts/stills/hero3d.js` (three.js, riippuvuudet --modules-polusta, ei repoon).
  `.k-stage` = herokorkeus × 1,7566, ankkuri oikeaan ylänurkkaan: kohtaus ei suurennu matalilla näytöillä. Tarrat prosenttiankkureista;
  `.k-tag.h` = vaakaviiva ja nimilappu oikealle. Tarrat piiloon alle 1 280 px:n ja `max-aspect-ratio: 7/5`. ≤ 1 023 px pinottu asettelu,
  puhelimessa kuva 3:2. Tarkistettu 4 kohtausta × 30 näyttökokoa × 2 kieltä: tarrat eivät osu tekstiin, toisiinsa, reunoihin eikä valitsimeen.
- Kartta (scene.js / scene-et.js): tunnisteet piirretään lopuksi tärkeysjärjestyksessä (kohde > valittu kerros > pohja) ja päällekkäinen
  alemman tärkeyden tunniste jätetään pois; tasokuvat `kk-*` uusittu elävästä moottorista (`scripts/render-map-tiles.mjs`).
- Fontit: Newsreader rajattu fontTools-instancerilla (opsz 36, wght 300–600; OFL, ei varattua nimeä) → esiladattavat 279 → 112 kt.
  site.css 92 392 → ~76,9 kt (budjetti 76 kt = 77 824 t), site.js ~19,6 kt.
- Lighthouse mobiili (paikallinen palvelin, pakkaus välimuistissa kuten CDN:ssä, 3 ajoa): /et/ 95–97, LCP 2,6–2,9 s, TBT 0–30 ms; / 88–97,
  LCP 2,5–2,8 s; CLS 0; työpöytä 100 (LCP 0,6 s). Saavutettavuus, parhaat käytännöt, SEO 100.
- Alasivut (agenttihaara 56afa41 + jatko): vedetty takaisin sanoitus, mallinimet, track record, toisen maan faktat, lupaus kahdessa
  arkipäivässä kaikkialla, „Küsi tasuta hinnangut", pilkut ja aku → salvesti; uudet vartijat `nimet-1104` ja `mallinimet-1104`.
  Perustajan 7.–9.9.2026 hylkäämät kohdat pois (yhteystietojen "Kolm inimest…", uutissivun nauha, Tulekul/Tulossa-kortit, koulutusrivi,
  FI-sitaatti). Ajatusviivat ja ylisanat alasivuilla: erillinen kierros.
- AVOIN: kuvaus 9.–11.11 (muotokuvat); ET-sivun yhteystiedot (nyt +358 ja Helsinki); Elecnova-tuotekuva; Energen Nordic (vastaus suunnitelman
  kommentissa); natiivitarkistus (FI Martin, ET Madis; muutoslistat projektin ulkopuolella); uutissivun energiakatselmuskohta (määräaika 11.10.2026
  ohi); /meist/ ja /meista/ yritysfaktoissa molemmat markkinat; main vain Madiksen OK:lla.

## v44 — Madiksen palaute 5.11.2026 (haara v35-uusi-ilme)

- Hero: 3D-kohdekuvat ja kohdepainikkeet pois (Madis: viljankuivuri ensimmäisenä ei ole oikea, renderöity kohtaus vie pointin).
  Tilalle kumppaneiden tuotteet ja palvelut liikkuvana kuvavirtana: työpöydällä kaksi pystysaraketta (vastakkaiset suunnat,
  72 s / 86 s), puhelimella yksi vaakarivi; pysäytyspainike (WCAG 2.2.2), tauko hiiren alla ja kun virta ei näy,
  reduced-motion = paikallaan. Kuvat `assets/tarjonta/*.webp` 480×600, yhtenäinen lähes neutraali mustavalko (kumppaneiden
  omista materiaaleista, Madiksen lupa 5.11.2026 ja 23.10.2026). Kuvateksti = ala + kumppani. Kumpikin maa vain omat kumppaninsa.
  Elecnovan kuvapalvelin palauttaa 403 (hotlink-suojaus) — kuvaa ei kierretty, Elecnova näkyy nimellä.
- Kumppanit aloittain: etusivu (`.k-pgrid`, FI 6 alaa, ET 4), kumppanisivu (ala–kumppani-taulukko `.pmx`: laitteet / asennus /
  aggregaattori) ja Meistä/Meist-sivu samalla ruudukolla. Jokaisella kumppanilla kaikki sen alat (Ralos myös aurinkovoimalat,
  Avant myös energiavarastot ja siirrettävä lataus, Gare myös katokset ja asennus, Scanoffice aurinko, lataus ja lämpöpumput).
  ET-kumppanisivulle lisätty Elecnova-kortti (sallittu molemmilla sivuilla).
- Liittymissopimukset ja -kyselyt pois asiakkaalle näkyvästä sisällöstä (Madis: kaikki eivät ole vahvistettuja sopimuksia,
  osa on vain selvityksiä ja jää kesken; sekoittaa asiakkaan): kartta-data (kasvu, varastot, tuleva, kohde), etusivun karttaluku,
  /verkko/ ja /vork/, liityntärajoitusartikkeli (kaavio 1 800 / 30 000 MW pois), uutiskortit, reservisivun kortti
  ("Nopeus: liittymänne on jo olemassa"). Tilalle vahvistetut luvut: käytössä olevat varastot ja Fingridin rajoitus 2029.
  Lähteet fg-ruuhka ja fg-h1 poistettu kartta-datasta. Tasokuvat kk-* renderöity uudelleen, alt-tekstit vastaavat kuvia.
- Kartta: "Käytä sijaintiani" -painike ja kohdan valinta kartalta (napautus). Selaimen sijainti vain painikkeesta, karkea
  tarkkuus, aikakatkaisu 10 s; sijaintia ei tallenneta eikä lähetetä (ei evästeitä, ei localStoragea; selaimen oma
  lupakysely riittää). Merkki näkyy kaikilla tasoilla, viimeinen taso zoomaa merkkiin. Moottori: `_mapInv` (käänteinen
  projektio), `c._you`; .kk-body ja .kk-chipsw eivät enää peitä kanvaasia (pointer-events).
- Ulkoasu: painikkeet litteiksi (ei liukuväriä eikä hehkua, säde 8 px; tummalla kulta #D4B574, vaalealla musta),
  otsikoiden korostus pystyyn (kursiivi pois, väri kantaa), vaaleat osiot raikkaammiksi (#F7F4EE / #EFEBE3), lomakeosion
  ruskea hehku pois, Newsreader-kursiivin esilataus pois (ei enää käytössä otsikoissa).
- AVOIN: Elecnovan tuotekuva (palvelin estää suoran latauksen); natiivitarkistus uusille FI/ET-teksteille.

## Kohteen sijainti kartalla (vestlus C, haara v35-uusi-ilme, 05.11.2026)

- Madis 5.11.2026: "Teidän liittymänne / Teie liitumine" ilman paikkaa ei kerro mitään. Lukija antaa paikan painikkeesta (selaimen
  sijainti, selaimen oma lupakysely) tai napauttamalla karttaa; ei evästeitä, ei IP-paikannusta, ei tallennusta eikä lähetystä.
  Etusivulla painike sekä kartan alussa (merkki kaikilla tasoilla, tila linkittää viimeiseen askeleeseen) että viimeisessä askeleessa;
  /verkko/ ja /vork/ viimeisessä luvussa.
- Paikan kortti `assets/kartta-paikka.js` (generoitu: `python3 scripts/kaart/build_paikka.py`, pohja `scripts/kaart/paikka.tpl.js`;
  ladataan vasta paikan valinnasta): FI-aluerajoitus / vapaa kapasiteetti (Fingrid, samat tekstit kuin kartalla), lähin 110 kV:n
  asema ja lähin kantaverkon asema (OSM), EE lähin suuri varastopuisto alle 80 km (ERR), mikä on koko maassa sama ja mikä riippuu
  paikasta. Etusivulla kortti tulee viimeiseen askeleeseen askeleen CTA:n eteen (scene.js / scene-et.js `paikka()`).
- `Permissions-Policy` on nyt `geolocation=(self)` (oli `()`, joka esti painikkeen tuotannossa); verify-pages vartioi.
- Perustelut, lähteet ja seuraavat vaihtoehdot (paikkakuntahaku, verkkoyhtiö ja tariffi, PVGIS, paikka lomakkeeseen):
  `docs/kaart/lugu.md`, osio "Teie objekti asukohas".
- AVOIN: natiivitarkistus kortin teksteille (FI Martin, ET Madis) ja viimeisen askeleen painikeriville.

## v45 — hero ja toinen osio uudelleen (Madis 5.11.2026 klo 19.15, haara v35-uusi-ilme)

- Madis: kuvat eivät sovi heroon karusellina; 6A.6-version herokuva sopii, mutta hillitymmin, ilman monia värejä ja
  kömpelyyttä, integroituna taustaan; vain tarjoamamme olennaiset osat; kaappien mitat, paikat ja ohjausyksikön paikka
  ohjeen mukaan. Toisen osion kuva oli tilaamaton → pois. Seuraavat osiot vasta tämän jälkeen, askel kerrallaan.
- Hero: kuvavirta (`.k-flow`, CSS, JS, pysäytyspainike) pois. Tilalle 3D-taustakuva `assets/k-tausta-{1200,1800,2400}.webp`
  (työpöytä 3:2) ja `k-tausta-m{780,1170}.webp` (puhelin 4:3), renderöity `node scripts/render-stills.mjs --tausta
  --modules …` (hero3d.js `look=tausta`, kuvat `bg` ja `bgm`). Ulkoasu: grafiitti + kulta, ei vihreää eikä sinistä, ei
  aitaa, autoa, puita eikä valaistuja ikkunoita. Sisältö 3D-ohjeen mukaan: kaapit 1,35 × 1,01 × 2,45 m, neljä rivissä
  (v45: 0,6 m välein omasta 3D-ohjeesta; v46: 100 mm Ralosin ohjeen mukaan, ks. alla), muuntaja kaapissa; pääkeskus hallin sähkötilassa (ovi auki, sisällä keskus ja ohjausyksikkö, jonka
  merkkivalo on kultainen); vaalea kulta = kaapit → pääkeskus, tummempi kulta = muuntamo/mittaus → pääkeskus ja verkko;
  hämärä, ortografinen kamera atsimuutti 35,5°, korkeus 34,4°; yksi ihminen (omistaja tabletin kanssa) mittakaavaksi.
- Asettelu: kuva on tekstin takana taustana (`.k-hfig`, korkeus = heron korkeus, translateX(-40 %), maski hävittää
  tekstin alla olevan osan), tekstisarake z-index 1. Neljä HTML-tarraa (`.k-hl`, aria-hidden; alt kertoo saman):
  aurinkopaneelit, pääkeskus ja ohjausyksikkö, energiavarasto, liittymispiste ja mittari. Puhelimessa numeroidut
  nastat ja selite kuvan alla (3D-ohje). LCP-kuva `fetchpriority="high"`, ei laiskalatausta; kuvalla leveys ja korkeus.
- Ohjausyksikön paikka: pääkeskuksessa, koska ohjaus lukee liittymispisteen mittausta (virtamuuntajat pääkeskuksessa) ja
  rajoittaa varaston tehon liittymän rajaan; EMS, BMS ja muuntaja ovat kaapissa. Jos aggregaattori asentaa oman
  laitteensa muualle, tarran ankkuri vaihtuu (hero2.py POS / hero3d.js SITE_LABELS).
- Toinen osio (#kuidas-toimib / #miten-toimii): k-paev-kuva ja sen tarrat pois; `.k-tag`-säännöt ja k-paev*.webp poistettu.
- Korjaus v44:stä: kumppanisivun taulukoiden sr-only-solut (absoluuttinen sijainti) leventivät sivua puhelimessa
  (scrollWidth 702 / 421 px); `.tbl-scroll` sai position:relative.
- Laatu: axe 0 rikkomusta (31 sivua, 1440 ja 390); Lighthouse mobiili FI 96/96, ET 94/99, työpöytä 100 kaikki;
  CLS 0; vaakavierintää ei millään leveydellä 360–2560.

## v46 — toinen osio, prosessi ja valikoima (Madis 5.11.2026 klo 20.31, haara v35-uusi-ilme)

- Madis: toinen osio liian tekstipainotteinen → animoitu kaavio tueksi; "Kolme asiaa, jotka voitte meiltä tilata" /
  "Kolm asja, mida saate meilt tellida" hämmentää → pois; prosessi ilman vieritystoimintoa: video pyörii paikallaan,
  selitykset vasemmalla (puhelimessa alla), nykyinen vaihe korostuu ja taustasävy täyttyy, hiiri vaiheen päällä vie videon
  siihen ja pysäyttää sen; kaappien sijoittelu ja mitat Ralosin aineistosta; valikoimaan tuotekuvat (ei karusellia).
- Ralos-sijoittelu. Lähteet: "Perusteellinen asennus- ja käyttöohje BEAST125HD v2.1" §5.1.2 ja §5.2, "Fifty_Gateway ja
  Accuvim_II_Asennusohje" (Ralosin sähköposti 24.8.2026), asiakkaan infopaketti 26.8.2026. Kaappi 1 350 × 1 010 × 2 450 mm,
  2 600 kg; kaappien väli 100 mm; sivuilla ≥ 500 mm, takana ≥ 800 mm, edessä ≥ 1 500 mm, yläpuolella ≥ 500 mm; perustus
  korotettu ≥ 300 mm (C25, 5 t, tasaisuus ≤ 3 mm, maadoitus ≤ 4 Ω); paloetäisyydet paikallisten määräysten mukaan
  (pelastuslaitoksen suositus ≥ 8 m rakennuksesta yli 50 kWh ulkovarastolle, projektimuistio suuruspaa-2026-10-06:
  suositus, ei tarkistettu viranomaisvaatimukseksi). Fifty Gateway DIN-kiskossa ja Acuvim II -mittari pääkeskuksessa tai
  liittymispisteessä → "Pääkeskus ja ohjausyksikkö" on oikein. hero3d.js `ROW` (gap 0.1, base 0.3, front 1.5, back 0.8,
  side 0.5) + huoltoalue `apron`; taustakuvat renderöity uudelleen; tarra 3: x .5372, y .7271, mx .4788, my .712.
- Toinen osio: `.k-h2g` (otsikko ja ingressi | kolme asiaa pystylistana) + `.k-dg` (rivit vasemmalla, kaavio oikealla;
  ≤ 1023 px nimiö, kaavio, rivit). Kaavio `scripts/paiva/build_paiva.py` → inline SVG merkkien paiva:alku/loppu väliin
  (tyylit SVG:n sisällä, tekstikoko @container). Neljä tilaa = neljä riviä: reservi (myös yöllä), tehomaksut (huippu
  leikataan, pääsulake kulutuksen mukaan), energia ja siirto (halpa tunti sisään, kallis ulos), kiinteistön arvo
  (kaikki yhdessä + kiinteä kulu ↓, arvo ↑). Kuvateksti "Periaatteellinen vuorokausi, ei mittausdataa." Kaavion sanat
  vain hyväksytyistä riveistä.
- Prosessi: `.k-pg` (ol.k-ps vasemmalla, video oikealla; puhelimessa video ylhäällä, sticky jos korkeus ≥ 600 px).
  Video `assets/k-proc{,-m}.{webm,mp4}` 30 s / 24 fps, `node scripts/render-proc.mjs --modules …` (hero3d.js
  `look=kriit&anim=proc&shot=proc`): vaiheet 0–5,5 / 5,5–11 / 11–17 / 17–22 / 22–30 s, avainkuvat 4,6 / 10,4 / 16,2 /
  21,3 / 29,2 s (= `assets/etusivu.js` S ja KEY). Juliste = 0,4 s kuva; pysäytyskuvat k-proc-1..5.webp
  (reduced-motion, saveData, estetty automaattitoisto).
- `assets/etusivu.js` (vain etusivulla, site.js ennallaan): automaattinen eteneminen + rivin taustasävy (--p), hiiri tai
  näppäimistöfokus pitää vaiheen, kosketus valitsee (linkissä toinen napautus avaa), pysäytyspainike (WCAG 2.2.2),
  video ladataan 400 px ennen näkymää ja toistetaan vain näkyvissä. Ei vieritykseen sidottua toimintaa.
- Pois: #pakume / #tarjoamme ja .k-cards; vanha prosessikanvaasi (.k-live data-live="proc", .k-fig, .k-steps,
  #nain/#kuidas.is-live).
- Valikoima: `.k-gal` kuusi tuotekuvaa järjestyksessä (assets/tarjonta, v44:n kuvatekstit ala + kumppani, kumpikin maa
  vain omat kumppaninsa; ≤ 1023 px vaakarivi), kumppaniruudukko ennallaan. FI: Ralos, Avant, Gare, Scanoffice, JSM,
  reservimarkkinat; ET: Ralos ×3, SAMA, Soleron ×2. Lämpöpumpuille ei ole kuvaa.

## v47 — Madiksen palaute 5.11.2026 klo 22.44 (haara v35-uusi-ilme)

- Madis: prosessiosion video ei näyttänyt vaiheita eikä reagoinut hiireen (esikatselutiedostossa); Laaja valikoima:
  miksi vain mustavalkoisia kuvia, ei alojen uutta erittelyä, näytetään mitä tarjoamme; omat kuvat ja enemmän tiimiä
  myöhemmin; kysymys väreistä (musta + kulta), kartta sitoo designin ja tuo avaruutta. Hero: aurinkopaneeleilta oma
  kaapeli alas pääkeskukseen ja hehkuva kuten muut; "Liitumispunkt ja arvesti" on oikeasti trafojaam; varasto seinän
  viereen Ralosin aineiston mukaan mitoitettuna, betoniperustus näkyviin; kaapelireitit todenmukaisiksi.
- hero3d.js `ROW` (seinämalli): kaapit hallin itäseinän vieressä sähkötilan oven pohjoispuolella, takaosa seinään päin
  (Ralos v2.1 6.2: verkkoliitäntä kaapin takana; 5.1.2: taka 800, sivut 500, väli 100, etu 1 500 mm), perustus 300 mm
  (5.2) ja huoltotaso seinästä kaappien eteen; rivin eteläpää 1,4 m oven saranasta. Kaapelikanava perustuksen
  etureunassa → seinän läpivienti oven pohjoispuolella (5.2: suojaputket perustukseen); muuntamon maakaapeli →
  läpivienti oven eteläpuolella (ei enää ovesta sisään); aurinkokaapeli `EL.solarPts`: kattohylly → kaiteen yli →
  julkisivua pitkin nurkan ja ikkunarivin välissä → läpivienti 2,6 m:ssä. Herossa aurinkokaapeli hehkuu kuten varaston
  viiva, videossa (kriit) himmeä olemassa oleva infra. Kaappien pistevalot kaappien eteen (+x), allasvalo uuteen
  paikkaan. Omistaja kaappien edessä. Kamera `proc` tx 23, tz -16, vh 17.5. Video ja herotaustat renderöity uudelleen.
- Herotarrat: 2 tekstiksi vasemmalle (`u l`), 3 kaappien yläpuolelle (`u`, x .5816 y .3743 / mx .5236 my .3967),
  4 = Trafojaam / Muuntamo; tarroilla tumma pohja (luettava viivojen päällä). Alt-tekstit päivitetty.
- `assets/etusivu.js`: vaiheen nimi videon kulmassa (`.k-pvl`); jos video ei käynnisty (estetty automaattitoisto,
  virhe, ei kuvaa 6 s:ssa) vaiheiden pysäytyskuvat etenevät samalla aikataululla ja hiiri/kosketus toimii samoin;
  esikatselutiedostossa video Blob-osoitteena (Safari) ja pysäytyskuvat upotettuina (`data-stills`).
- Valikoima (#valik / #valikoima): kumppaniruudukko (.k-pgrid) pois etusivulta (alat on kerrottu toisessa osiossa,
  kumppanit kumppanisivulla); kuusi kuvaa 3:2 `assets/valikoima/*.webp` alkuperäisinä väreinä (Ralosin omat kuvat ovat
  mustavalkoisia), kuvatekstinä vain kumppanin nimi; ET: Ralos ×3, Soleron ja kaksi sivuston omaa kuvaa ilman
  kumppanin nimeä. Omat kuvat korvaavat nämä kuvauksen (9.–11.11) jälkeen.

## v48 — Madiksen palaute 6.11.2026 klo 0.10 (haara v35-uusi-ilme)

- Madis: "Laaja valikoima / Lai valik" -osio on metsässä (otsikko "lai valik" ei toimi); viesti hänen sanoillaan:
  parhaista parhaat kumppanit valittu sen mukaan, mikä luo yrityksen investoinnille suurimman arvon; investoinnin arvo
  syntyy monesta osasta; eri valmistajien, tuotteiden ja palveluiden valikoimalla räätälöity ratkaisu kiinteistölle
  asiakkaan omien päätöskriteerien mukaan, ei yhden laitteen myynnin; "me mõtleme tervikuna". Prosessi: kuvaukset eivät
  mahdu, video ei näytä katon aurinkopaneeleja, lomake on alussa ja kartoitus annetaan, aika-asteikot vaiheisiin.
  Hero: ei ihmistä kaappien edessä; kontrolleri ja kaapelit oikein pääkeskukselle, varaston kaapeli oven alta
  sähkökaappiin (seinän läpiviennit "veits vale"); muuntamo ja verkkolinja oudossa paikassa.
- hero3d.js `NEWSITE` (= look tausta tai kriit; muut kuvat ennallaan): muuntamo `KX` 23, z -13,6 (oven itäpuolella,
  ~8 m seinästä), keskijännite maakaapelina idästä (`EL.riserPts`, häivytetään maan mukana, ei pylväitä). Kaikki kolme
  kaapelia maassa oven kynnyksen alta sisään: aurinko z -13,25 (julkisivua alas maahan ja seinän vierustaa ovelle),
  muuntamo -13,6 (suoraan länteen), varasto -13,95 (perustuksen etureunan kanava rivin eteläpäästä ovelle). Sisäkuva:
  pääkeskus, sen vieressä ohjausyksikkö mittausjohtoineen, kaapelit lattiaa pitkin pääkeskukseen. Ei läpivientilevyjä.
  Herosta ja kriit-stillistä ihmiset pois. Kamerat: `bg` tx 8.25 tz -18.25 vh 22.25, `bgm` tx 9.25 tz -19.75 vh 22,
  `proc` tx 9 tz -18.5 vh 20.5 (4:3, katto paneeleineen näkyy). Videossa markkinapulssit varasto → pääkeskus →
  muuntamo → verkko, käyttöönotossa myös aurinkokaapeli kirkastuu.
- render-proc.mjs: oletus 1200×900 (4:3), puhelin 2/3 (800×600), pysäytyskuvat ja juliste samaan kokoon; CRF
  säädettävissä (`--crf264` 28 / `--crf9` 40, puhelin +1): katon paneelit kasvattavat bittimäärää (webm 1,23 Mt /
  mp4 1,54 Mt, puhelin 0,62 / 0,71 Mt; ladataan vasta kun osio lähestyy näkymää).
- Prosessi (#kuidas): vaiheriveillä aika (ja maksuttomuus) oikealla; aktiivisen vaiheen kuvaus vakiokorkuisessa
  paneelissa rivien alla (`.k-pl` > `.k-pdx`, etusivu.js kloonaa kuvaukset, aria-hidden; rivien omat kuvaukset jäävät
  ruudunlukijalle). Rivien sisäinen haitari hylättiin: kun yläpuolinen kuvaus sulkeutui, rivit siirtyivät hiiren alla
  ja väärä vaihe valittiin. Ilman JS:ää ja reduced-motionilla kuvaukset riveillä. Rivit näppäimistöllä kohdistettavia. Ajat:
  kliendi teekond (Madis 28.9.2026) ja sivuston lupaus I-20261104-7: kartoitus 2 tp; esitarkastus 1–2 pv; kohdekäynti
  puoli päivää viikon sisällä, tarjous 2–5 tp; päätös asiakkaan aikataulussa; kohteella 2–3 pv. FI: asentajan jono
  noin kaksi viikkoa, ilmoitus verkkoyhtiölle tilausvahvistuksen päivänä (ei "teknisiä ehtoja"). ET: paigaldusaeg
  lepitakse kokku tellimuse kinnitamisel (Soome kahte nädalat ei kasutata), mõõtepunkti taotlused samal päeval.
  Vaihe 1 alkaa lomakkeesta.
- Kumppaniosio (#valik / #valikoima): H2 "Me mõtleme tervikuna." / "Ajattelemme kokonaisuutta." vasemmalla, Madiksen
  viesti oikealla. Madis 6.11. klo 9.40: osio yhä huono, kaikki kumppanit eivät näy (Elecnova puuttui), Ralosin iso kuva
  oudossa yhteydessä. Nyt: markkinan KAIKKI kumppanit tasavertaisina kortteina (`.k-pcs` > `.k-pc`: kuva, nimi, mitä tuo;
  linkki kumppanisivun korttiin, roolit kumppanisivun `.role`-riveistä). FI: Ralos, Elecnova, Avant Power (ensimmäinen
  rivi = kolme varastovalmistajaa), Gare Energy, Scanoffice, JSM. ET: Ralos, Elecnova, Soleron Energy OÜ. Elecnovalla
  nimikortti `.k-pcw` (sanamerkki + tuotevalikoima), koska elecnova-ess.com on Cloudflaren bottitarkistuksen takana
  eikä sitä kierretä; tuotekuva Madikselta/Elecnovalta, sitten kortti kuvalliseksi. Puhelimella kortit vaakariveinä.
  Natiivitarkistus: ET Madis, FI Martin.
- site.css 78,7 kt (oma tavoite 76 kt ylittyy hieman; raja 92 kt).

## Perustajan päätökset 6.11.2026 (Madis) — kartta ja paikan kortti

Madis 6.11.2026 (vestlus C, vastaukset kysymyksiin; päätöslokiin lisättävä):
- Osoitehaku ja tarkka aluskartta valtion rekistereistä OMAN Netlify-funktion kautta: Viro Maa- ja Ruumiamet (In-ADS, ei avainta),
  Suomi Maanmittauslaitos (ilmainen API-avain ympäristömuuttujana `MML_API_KEY`, ei repoon). Selain puhuu vain omalle alkuperälle;
  "ei kolmannen osapuolen pyyntöä" pätee edelleen selaimeen (verify-pages). Google ei.
- Kartalla ja paikan kortissa saa nimetä datakeskusten, voima- ja varastopuistojen, siirtoyhteyksien ja verkkoyhtiöiden omistajat,
  kun nimellä on lähde ja päivä. Laajennus koskee vain kartta-aineistoa (`assets/kartta-solmut.json`, kartan kortti); muun sivuston
  nimireegli ja vartijat (VENI, EP Energy, Energen Nordic, Roofit.Solar, kaksi rahoittajaa, mallinimet) pysyvät ennallaan.
- Kartalle myös julkisesti ilmoitetut suunnitelmat (datakeskukset, puistot, yhteydet, verkkoinvestoinnit): jokaisella tila
  käytössä / rakenteilla / päätetty / ilmoitettu, lähde ja päivä. Fingridin ja Eleringin liittymiskyselyjen koosteluvut pysyvät pois (5.11.2026).
- Paikan kortti laskee: liittymisen säännöt paikassa (Fingrid 1.6.2026, Elering), verkkoyhtiö ja tehomaksun / võimsustasu säästö
  (verkkoyhtiö nimetään), aurinkotuotto PVGIS:stä (EU JRC) ja vie paikan arviolomakkeeseen näkyvänä, muokattavana kenttänä
  (tietosuojateksti muuttuu sen mukaan).

## Kartta: solmut, osoitehaku ja paikan laskelmat (vestlus C, haara v35-uusi-ilme, 06.11.2026)

- Solmut `assets/kartta-solmut.json` ← `python3 scripts/kaart/build_solmut.py` (datakeskusrekisteri CC BY 4.0, OSM-puistot, Fingridin
  kehittämissuunnitelma ja rajajohtohankkeet, Elering/ERR); molemmat moottorit (kartta.js, scene.js / scene-et.js) piirtävät ne kerroksittain,
  tunnisteet tärkeysjärjestyksessä, vihje hiirellä. kartta-data.json:n Tulossa-kerroksesta poistettu viisi päällekkäistä viivaa.
- Paikkapalvelu `netlify/functions/paikka.mjs` (/api/paikka, /api/ruutu/…): In-ADS, MML (`MML_API_KEY`), PVGIS, karttaruudut. Netlify tunnistaa
  `netlify/functions` ilman asetuksia. Kortti ja haku `assets/kartta-paikka.js` (budjetti 110 kt, ladataan kartan käynnistyessä).
- Arviolomakkeen `sijainti` on nyt näkyvä valinnainen kenttä (#f-place-a); scene.js täyttää sen hash-osasta `&p=`.
- Perustelut, lähteet, päivitysrutiinit ja avoimet asiat: `docs/kaart/lugu.md`, osio "Uus kaart: sõlmed, aadressiotsing ja asukoha arvutused".
- AVOIN: MML_API_KEY Netlifyyn (Madis); verkkoyhtiöiden tehomaksut lähteineen; Viron liittymissäännöt; etusivun 6. askeleen
  "ei jonota kantaverkkoon" -lause vs. Fingrid 1.6.2026 (≥ 2 MW, osin ≥ 1 MW) — perustajan päätös; natiivitarkistus uusille teksteille.

## v49 — avoimen lähdekoodin 3D-putki: tarkka kaappi, Cycles-herotausta, kaappi 3D:nä ja AR:nä (Madis 6.11.2026 klo 0.58, haara v35-uusi-ilme)

- Madis: kartoitettu avoimen lähdekoodin 3D-, kuva- ja videopino otetaan käyttöön tämän sivuston rakennuksessa heti.
  Sivustolle kuuluvat osat: tarkka tuotemalli (build123d), fysikaalinen renderöinti (Blender Cycles) ja kaappi omalla pihalla
  oikeassa koossa (model-viewer, AR). Generatiiviset kuva- ja videomallit eivät tule sivustolle: ne näyttäisivät asennuksia,
  joita ei ole (sääntö: ei track record -väitteitä); omat kuvat tulevat kuvauksesta 9.–11.11.
- Kaappi: `assets/3d/kaappi.glb` ← `scripts/3d/kaappi.py` (build123d Apache-2.0, trimesh MIT; `@gltf-transform/cli` weld +
  quantize). Ulkomitat 1 350 × 1 010 × 2 450 mm (Ralosin infopaketti 26.8.2026); ulkonäkö Ralosin tuotekuvista: kapea
  sähkötilan ovi (merkkivalo, kolme merkkilamppua, näytön kansi, avainkytkin, korkea säleikkö), leveä akkutilan ovi
  (jäähdytysyksikön verkko ja puhallinkotelo), keskikahvat, pohjakehys trukkitaskuin, kattolevy, takasivun läpivientilevy
  (v2.1 6.2). 7 916 kolmiota, KHR_mesh_quantization, 208 kt, ei logoja eikä tekstejä. Nodet `kaappi_<materiaali>`:
  hero3d.js `cabinet()` liittää omat materiaalinsa nimillä (tausta/kriit/hämärä säilyvät; `kaappi_led` = merkkivalo,
  userData.led). render-stills.mjs ja render-proc.mjs palvelevat nyt myös /assets/.
- Herotausta `k-tausta-*`: Blender 5.0.1 Cycles samasta näyttämöstä (rajaus, kaapit, kaapelit, muuntamo ja tarrojen
  ankkurit ennallaan; anchors-tiedostoa ei tarvitse ajaa):
  `node scripts/blender/export-scene.mjs --modules <three-moduulit> --out X` (hero3d.js `?export=glb`: GLB + kamera, valot,
  maan häivytys) → `python scripts/blender/render_hero.py --scene X/bg.glb --meta X/bg.json --out Y --samples 64 --world 0.8 --cab 4 --bloom 0.8`
  (sama `bgm`:lle) → `python3 scripts/blender/encode_hero.py Y` (samat nimet, mitat ja tiedostobudjetit kuin render-stills).
  Sävytys = three.js:n ACES-filmikäyrä, valotus 1,12 ja hehku (kynnys 0,85, voimakkuus 1,1), joten hyväksytty sävymaailma
  säilyy; Cycles tuo pehmeät varjot, kaapeleiden ja avoimen oven heijastuvan valon ja todellisen peittovarjostuksen.
  Maan häivytys taustaväriin tehdään maskilla sävytyksen jälkeen → kuvan reunat kuten ennen. Riippuvuudet eivät tule
  repoon: `uv venv -p 3.11 /tmp/bpy && uv pip install --python /tmp/bpy/bin/python bpy OpenEXR pillow`.
  Nopea luonnos ennen Cycles-ajoa edelleen `node scripts/render-stills.mjs --tausta --preview <kansio>` (three.js).
  `--cab 4`: kaappien edessä olevat valot (hero3d.js `kaappivalo`) nelinkertaisiksi, jotta tuote erottuu pimeästä kuten
  three.js-kuvassa; `--bloom 0.8` kapeampi hehku kuin three.js:n mip-hehku 2400 px:n kuvassa.
  Jos hero3d.js:n näyttämö muuttuu, aja vienti ja Cycles uudelleen (2 ytimellä bg noin 15–20 min, bgm noin 5 min).
- Prosessivideo ja pysäytyskuvat `k-proc*` renderöity uudelleen tarkalla kaapilla (three.js, muuten ennallaan).
- Energiavarastosivu (/energiavarastot/#toimitus, /et/energiasalvestid/#tarne): lohko `.ar3d` (site.css loppu, `assets/ar.js`).
  Kaappikuva `assets/3d/kaappi-poster.webp` (`scripts/blender/render_poster.py`, Cycles, Khronos PBR Neutral = sama sävytys
  kuin model-viewerissä); painike avaa mallin 3D:nä (hiiri/kosketus kääntää); puhelimessa "Näytä omalla pihalla" /
  "Vaata oma hoovis" asettaa kaapin kamerakuvaan oikeassa koossa (`ar-scale="fixed"`). model-viewer 4.4.0 (Google,
  Apache-2.0, 9.10.2026) omalta palvelimelta `assets/vendor/`, ladataan vasta painikkeesta (ei vaikuta LCP:hen eikä
  muihin sivuihin). AR-tilat `webxr` (Android Chrome) ja `quick-look` (iPhone; USDZ syntyy selaimessa samasta mallista);
  Googlen Scene Viewer -sovellus jätetty pois (ei kolmatta osapuolta). Dekooderien osoitteet ohjataan omaan kansioon;
  vendoroidusta tiedostosta poistettu yksi latauksenaikainen WebAssembly-käännös (meshopt, ks. assets/vendor/README.txt),
  jotta CSP pysyy ilman wasm-unsafe-evalia. Tarkistettu tuotannon otsakkeilla: 0 konsolivirhettä, 0 ulkoista pyyntöä.
  Sivulla ei mallinimeä eikä mittoja (perustajan päätös 4.11.2026): "oikeassa koossa", "mitat ovat valmistajan tiedoista".
- AVOIN: natiivitarkistus uusille riveille (FI Martin, ET Madis); AR kokeiltava oikealla puhelimella Netlify-esikatselussa
  (Android Chrome ja iPhone Safari) — automaattitesti kattaa 3D-näkymän, latauksen ja ulkoiset pyynnöt, ei kameraa.

## v50 — energiavarastosivun kerroskuva mittakaavaan (Madis 6.11.2026 klo 9.59, haara v35-uusi-ilme)

- Madis: energiavarastosivun kerroskuva (/energiavarastot/#kerros ↔ /et/energiasalvestid/#kihid) ei ollut oikean kokoinen eikä
  välit olleet oikein. Korjattu scene.js / scene-et.js (merkkijonot ainoa ero; ET:n "· HAVAINNOLLISTUS" → "· ILLUSTRATSIOON").
- Koko ja välit: pino mahtuu vapaaseen alaan — työpöydällä lukupalstan (.ks-s) oikeasta reunasta kanvaasin oikeaan reunaan
  reunavaroin (max(32 px, 4 %)), pinottuna (≤ 900 px) koko leveydelle 16 px:n reunoin; a = min(230, leveys/(2·1,732·1,08),
  korkeus/(2,4·1,08)). Kerrosten väli 2,25a (oli 1,8a), laatat ja niiden sisältö eivät mene päällekkäin. Kanvaasin oma vasen
  varjo pois (CSS-kerros suojaa tekstin). Naapurikerroksen nimi sille puolelle, jossa ei ole nousua; tarrat eivät mene lukupalstalle.
- Varastokerros (3) mittakaavassa 1 yksikkö = 5,2 m, sijoittelu kuten herossa (hero3d.js ROW) Ralosin ohjeen mukaan: neljä
  kaappia 1 350 × 1 010 × 2 450 mm rivissä 100 mm:n välein, takana 800 mm hallin seinään, edessä 1 500 mm, sivuilla 500 mm,
  betoniperustus 300 mm (reunat 250 mm), huoltotaso; hallin seinä leikattuna 3,2 m:stä ja sähkötilan ovi; kaapeli perustuksen
  etureunan kanavassa oven kynnyksen alle (nousu R[2] laskeutuu kynnykselle). Kaapin piirto kaappi.py:n mitoista (ovijako 440 | 890,
  säleikkö, verkkosäleikkö, puhallinkotelo, näytön kansi, merkkivalo, kahvat, pohjakehys trukkitaskuin, kattolevy). Avoin kaappi
  Ralosin kuvan (assets/valikoima/ralos-kaappi-auki.webp) mukaan: sähkötila vasemmalla (johdonsuojat, ohjausyksikkö näyttöineen,
  tehoelektroniikka), akkutila oikealla (2 × 7 akkupakettia), jäähdytysyksikkö akkutilan oven sisäpuolella; kapea ovi 100°, leveä 172°.
  Tarkistus: kaappi.glb renderöitynä samalla isometrisellä projektiolla osuu kanvaasin kaappeihin pikselintarkasti (ei repoon).
- Kennokerros (4) peilattu: akusto avoimen kaapin akkutilan alla (nousu R[3]), moduuli ja kenno vasemmalla; U/T/SOC-lukemat kennon vasemmalle.
- Liittymäkerros (2): kaapelin pää R[2] = (0,77; −0,28); VERKKOYHTIÖN PUOLI laatan reunan alle, MUUNTAJA-tarra muuntajan eteen
  (ei päällekkäisyyttä 1 024 px:n näytöllä).
- Tarkistettu 1024/1280/1440/1920/2560 × 5 vaihetta, tabletti 768, puhelin 390/360, FI ja ET: ei konsolivirheitä, ei vaakavieritystä.
  scene.js 168,7 → 181,1 kt (gzip 47,9 → 53,2 kt), ladataan edelleen vasta luvun lähestyessä.

## v48c — kumppaniosio kumppaneiden koko tarjonnalla (Madis 6.11.2026 klo 10.57)

- Madis: kaikki kumppanit ja niiden tarjonta eivät näy; Scanoffice puuttui (ET) ja näytti pelkältä lataukselta; EP Energy
  puuttui kokonaan ("EP energy has obviously very good charging, everything"; EP:ltä myös trukit ja muut laitteet; Avantilta
  tarvittaessa koko valikoima); Elecnovalta ei kuvia eikä materiaaleja; JSM:llä vain aurinkokuva, ei akkuasennusta.
  Virheen syy (oma arvio): osio rakennettiin käsillä olevista kuvista, ei kumppaneiden tarjonnasta.
- Etusivun kortit (`.k-pcs` 12 sarakkeen ruudukko; `.k-pc` = kuvamosaiikki `.k-pm.n1/n2/n3` + nimi linkkinä kumppanisivun
  korttiin + kuvaus + tarjontalista `.k-pco`): FI Ralos, Elecnova, EP Energy, Avant Power (s3, neljä riviin), Scanoffice,
  Gare Energy, JSM (s4). ET Ralos, Elecnova, EP Energy (s4), Scanoffice (o2, keskitetty pari), Soleron Energy OÜ.
  ≤1023 px pyyhkäisyrivi (site.js scrollers + `.k-pcs`). Tekstiin lisätty "Kumppaneiden koko valikoima on käytettävissänne."
- Perustajan päätökset 6.11.2026: EP Energy näkyy molemmilla sivustoilla (verify-pages `nimet-1104` vartioi enää EP Equipment,
  Energen, Roofit); Scanoffice myös ET-sivustolla (`scanoffice-et`-vartija poistettu; tulkinta Madiksen viestistä, vahvistetaan).
  Mallinimet ja tekniset arvot edelleen tarjouksessa (`mallinimet-1104`), kunnes Madis päättää datalehdistä.
- Kuvat `assets/kumppanit/{ralos,elecnova,ep,avant,scanoffice,gare,jsm,soleron}-N.webp`. Lähteet: kumppaneiden omat sivut
  (lupa 23.10. ja 5.11.2026); EP Energy: viralliset luettelot "EP ENERGY C&I-20251231.pdf" ja "EP ENERGY MOBILE-20251231.pdf"
  (Gmail-ketju 19eb6a5aa27f8813, projektikuvat s. 3); Elecnova: lehdistökuva "Photo Credit: Elecnova" (TaiyangNews 3.11.2025,
  media.assettype.com) — elecnova-ess.com ja sen tiedostopalvelin (shopsource.singoo.cc) ovat Cloudflaren bottitarkistuksen
  takana, ei kierretty; pv magazinen Elecnova-kuva on pv magazinen oma ("Image: pv magazine"), ei käytetty. Scanoffice:
  scanoffice.fi ilma-vesilämpöpumpun tuotekuva. JSM:n akkuasennuskuvia ei löytynyt (posti, Drive, JSM:n sivu) — pyydetty Madikselta.
- Kuvien oma tarkistus (6.11.2026): kuvassa ei saa näkyä mallinimeä eikä nimeämätöntä valmistajaa (sama sääntö kuin tekstissä).
  avant-2 = rajaus Avantin mikroverkkohavainnekuvasta (avanttecno.com, 2560 px) ilman tuotenimilogoa ja englanninkielisiä
  tarroja; scanoffice-1 (etusivu, pysty) ja scanoffice-4 (ET-kumppanisivu, vaaka) rajattu niin, ettei laitteen valmistaja- ja
  mallikilpi näy; JSM:n GREE-lämpöpumppukuva poistettu (ei kumppani, kilpailee Scanofficen valikoiman kanssa). JSM-kortin
  pääkuva ralos-4 = Ralosin oma kuva avatusta akkukaapista (energiavarastojen asennus on JSM:n ensimmäinen ala) siihen asti,
  kun JSM:n omat akkuasennuskuvat saadaan.
- Kumppanisivut: EP Energy -kortti kuvalla (#ep-energy) FI/ET, Elecnova-kortille kuva, ET:hen Scanoffice omaan ryhmään
  "Päikeseelekter, laadimine ja soojuspumbad" (#scanoffice), matriisit päivitetty (ET viisi alaa). Meistä/Meist-ruudukko: EP Energy
  (+ ET Scanoffice ja "Laadimine ja soojuspumbad").
- Avoin: Madikselta JSM:n akkuasennuskuvat, Elecnovan mediapaketti (kaappikuvat), päätös datalehdistä kumppanisivulle,
  Energen Nordicin nimeäminen EP:n kanavana (ei nimetty).

## v51 — Madiksen esikatselukommentit 6.11.2026 klo 13.18 (haara v35-uusi-ilme)

- Avant Power myös Viron sivustolla (Madis: "siit on puudu avant"): ET-etusivun kortti (ensimmäinen rivi = neljä varastovalmistajaa:
  Ralos, Elecnova, EP Energy, Avant Power; toinen rivi Scanoffice ja Soleron keskitettynä), ET-kumppanisivun kortti (#avant-power,
  kuva + logo, teksti FI-kortin käännös), matriisi ja Meist-ruudukko. FI-kumppanisivun Avant-kortille sama kuva. Korvaa v38:n "Avant Power vain FI".
- Kumppanikortit avautuvat (Madis: "iga ettevõtte kohta saaks võtta lahti täpsema kirjelduse"): kortti on painike (Popover API, ei JS:ää;
  Esc, taustan napautus ja Sulje-painike sulkevat, fokus palaa korttiin), paneelissa kuvat isompina, sijainti, kumppanisivun kuvaus,
  tarjonta ja linkit kumppanisivulle ja kumppanin sivustolle. Paneelit ovat lähteessä (src/*.html, `.k-pdl`) tavallisena HTML:nä.
  Lähteet Scanoffice (scanoffice.fi/in-english: 1984, Espoo, lähes sata ammattilaista), EP Energy (ep-equipment.com/ep-energy: Anji,
  Zhejiang, oma tehdas ja tuotekehityskeskus; konsernin nimeä ei mainita), Ralos (discovercleantech: perustettu 2017, Tampere), Gare
  (roofit.solar/contact-us "Find a Reseller", Suomi: Gare Energy OY, aurinkokatto.com; samassa listassa myös Ruukki), Elecnova
  "saatavilla Suomen markkinoilla" (Madis 6.11.2026), JSM "myös Ralosin kaapit" (Madis 6.11.2026). verify-pages: linkkitarkistuksen
  regex ei enää lue `popovertargetaction`-attribuuttia osoitteeksi.
- Gare Energy (Madis: "aurinkokatto.com … Roofit.Solar peamine partner Soomes"): kortissa ja kumppanisivulla "Roofit.Solarin
  jälleenmyyjä Suomessa, aurinkokatto.com". "Pääkumppani" ei ole lähteestä (Roofit.Solarin oma lista sanoo reseller, kaksi
  suomalaista) — vaihdetaan, jos Madis antaa kirjallisen lähteen. Vartija: `nimet-1104` = EP Equipment / Energen (molemmat),
  uusi `roofit-et` = Roofit vain Viron sivustolla kielletty.
- Lomakeosion yhteystieto (Madis: nimi ja rooli eivät ole siinä järkeviä): etusivun, Yhteystiedot/Kontakt-sivun ja Kiitos/Aitäh-sivun
  `.direct`-laatikko = info@samaenergia.fi + Madiksen numero, kunnes yrityksellä on oma numero. Uutisartikkelin kirjoittajakortti ja
  yhteystietosivun tiimikortit ennallaan.
- Prosessi (Madis: "näitlikustame päikesepaneele … drooniga mõõtmise koha … saame laenutada drooni"): vaihe 3 FI "Halutessanne
  mittaamme katon droonilla ja suunnittelemme aurinkopaneelien sijoittelun." / ET "Soovi korral mõõdame katuse drooniga ja kavandame
  päikesepaneelide paigutuse." Video (hero3d.js anim=proc): katto alkaa tyhjänä; 12–16,9 s drooni nousee sähköasentajan luota, mittaa
  katon kahdella ylilennolla (keila ja kaistale) ja suunniteltu sijoittelu ilmestyy lennon perässä läpikuultavina kultaisina
  paneeleina; vaiheessa 5 paneelit asennetaan rivi kerrallaan (23,4–25,6 s), rivikaapelit, runko ja aurinkokaapeli piirtyvät
  (25,5–26,9 s) ja kirkastuvat käyttöönotossa. Kamera `proc` tx 8.4 tz -20.6 vh 21 (enemmän kattoa).
- Hero (Madis: "päikesepaneelide vahel jooksevad ka juhtmed"): rivikaapelit katolla rivien välissä (himmeämpi kulta `M.energyStr`,
  0,28 × energia, ohuempi) ja runkokaapeli rivien itäpäässä aurinkokaapelin alkuun. Herotausta renderöity uudelleen Cyclesillä
  (v49-putki: export-scene.mjs → render_hero.py --samples 64 --world 0.8 --cab 4 --bloom 0.8 → encode_hero.py).
- Osoitehaku (#kk-q1, Madis: ei toiminut Chromessa): esikatselutiedostossa ei ole palvelinta (/api/paikka). Netlifyn deploy preview
  (https://deploy-preview-8--samaenergia.netlify.app/et/) toimii: haku, valinta ja merkki kartalla tarkistettu 6.11.2026.
  build-standalone.py: vain file:-esikatselussa Viron osoitehaku suoraan In-ADS:ään (CORS sallittu) ja Viron karttaruudut
  Maa- ja Ruumiametista; PVGIS ja MML eivät toimi esikatselussa. Suomen osoitteet vaativat edelleen MML_API_KEY:n Netlifyyn.
- AVOIN: natiivitarkistus (FI Martin, ET Madis) paneelien teksteille, Avantin ET-tekstille ja vaiheen 3 lauseelle; Garen
  "pääkumppani"-lähde; yrityksen oma puhelinnumero.

## v51-launch — Martinin korjaukset fix1–fix7 lähteisiin (haara v51-launch, 8.11.2026)

- Haara alkaa a7336f5:stä (tuottaa katselmoidut v51-esikatselut tavu tavulta). Jokainen fix portattu lähteisiin ja tarkistettu:
  esikatselun näkyvä teksti = Martinin fixN-referenssi kaikilla reiteillä (FI, ET). fix4 peruttu, ei portattu.
- Kartan lähderekisteri kaksikieliseksi (fix6): `assets/kartta-data.json` `sources[id].et` korvaa ET-sivulla kentät pub/title/date
  (avaandmed, andmestik, loetud, OSM- ja Natural Earth -kuvaukset; asiakirjojen nimet pysyvät suomeksi niminä), faktojen ja
  pinnien `s` voi olla `{fi, et}`, ja kerroksella voi olla `mapkey: {fi: {t, v, s}, et: {…}}` = kartan merkkien selite luvun
  faktalistan ensimmäisenä rivinä (vain oman kielen sivulla, ei toisen maan vertailussa). Lukijat: build_page.py (`src_of`),
  kartta.js (`src()`, `t()`), scene.js ja scene-et.js (`inLang`, solmujen lähteet `ks.sources[id][lang]`). Solmurekisterin OSM-lähteen
  ET-nimi `scripts/kaart/build_solmut.py`:ssä.

## v52 — Madiksen kommentit 7.11.2026 klo 15.34 (haara v35-uusi-ilme; portattu v51-launchiin 9.11.2026, c0c262a)

- Salvestin ja verkon kytkentä (Madis: "make sure that the connection between the batteries and the grid is depicted correctly"):
  hero ja prosessivideo (scripts/stills/hero3d.js). Salvestinkaapeli ei enää kulje perustuksen etureunaa pitkin: kaapelit lähtevät
  kaappien takaa (Ralos v2.1 §6.2 liitäntä kaapin takana, §5.2 putket valettu perustukseen, kaapelit kaapin pohjan läpi), kulkevat
  seinän viertä ja menevät sähkötilan oven alta pääkeskukseen yhdessä aurinkokaapelin ja muuntamon kaapelin kanssa. `EL.brightPts`
  seinän puolella (`XB = ROW.wallX + 0.28`), `EL.stubPts` = yksi lyhyt haara per kaappi takaa runkoon (näkyy animaatiossa 25,7 s
  jälkeen), oven lehti avattu 174° (`DOOR.open = 3.04`), jotta reitti oven alta näkyy. Topologia (projektin muistiinpanot
  Junkars/Ralos): varasto omana lähtönä pääkeskukseen, mittari ja virtamuuntajat liittymäpisteessä, ohjausyksikkö lukee mittaria;
  varasto on mittarin takana. Herotunniste 2 FI "Pääkeskus, mittari ja ohjausyksikkö" / ET "Peakilp, arvesti ja juhtseade" (mahtuu
  1280, 1366 ja 1920 px leveydelle tekstin viereen); alt-tekstit ja llms.txt päivitetty. Cycles uudelleen (64 näytettä) ja
  prosessivideo + pysäytyskuvat uudelleen.
- Elecnovan kuvat (Madis: "pictures … could be better, especially for Elecnova … many different types of batteries, not just
  container solutions"). Lähde: elecnovapower.com (Jiangsu Elecnova Electric, Elecnovan oma sivusto, ei bottiseinää; luettu
  7.11.2026): tuoteperheen kuvat /uploads/image/20260203/ (ilmajäähdytteinen kaappi, hybridikaappi, STS-kaappi, kontti) ja
  uutisen "Elecnova Showcases C&I Energy Storage Solutions at ENERGIA 2026 in Finland" (25.10.2026) tuotekuvat (kaappi kiinni ja
  auki). Lupa: Elecnova sallii median ja tietojen käytön (Madis 23.10.2026, projektin muistiinpano v34). elecnova-ess.com,
  DirectIndustry ja Made-in-China eivät auenneet (Cloudflare 403 / lupapyyntö ilman vastausta) — ei kierretty. Kahden kaapin
  mallimerkintärivi ("… ECO-Energy Storage System …") poistettu (sääntö: ei mallinimiä kuvissa). Uudet tiedostot
  assets/kumppanit/elecnova-2…6.webp ja elecnova-sarja.webp (kumppanisivun rivikuva: kontti, kaapit, hybridikaappi, STS-kaappi).
  Etusivun kortti n3 (kaappikuva, hybridikaappi, kontti), paneelissa `.k-pgal` = kuusi tyyppiä kuvateksteineen (3 saraketta,
  myös puhelimella). HUOM: `.k-pg` on jo prosessiosion luokka — älä käytä sitä muualla. Tekstit: neste- ja ilmajäähdytteiset
  ulkokaapit, hybridikaappi aurinkosähköön, kontit, STS-kaappi; "Lokakuussa Elecnova oli esillä Energia 2026 -messuilla
  Tampereella" (lähde yllä).
- Osoitehaku: v52:n Syke/Ryhti-haku on v51-launchissa vain esikatselutiedostossa (scripts/esikatselu/); julkaistulla sivulla
  haku kulkee /api/paikka-funktion kautta (Maanmittauslaitos + Maa- ja Ruumiamet, MML_API_KEY Netlifyssä).

## v53 — alasivut vaaleiksi ja tuotevalikoima (Madis 9.11.2026, haara v51-launch)

Madis 9.11.2026 klo 1.44 (sivusto "näyttää koulutyöltä", uutissivu liian tumma, energiavarasto- ja aurinkosivuilla ei tuotteita eikä
kuvia, liian opettavainen, "black and yellow" kaikkialla). Vastaukset kysymyksiin 9.11.2026: (1) yksi julkaisu, kun alasivut on tehty;
(2) tuotteet = "Foto, tootja, mudel, põhinäitajad" (kuva, valmistaja, malli, päätiedot valmistajan datalehdeltä lähteineen) — kumoaa
4.11.2026 linjauksen ja vartijan `mallinimet-1104`; (3) "Hele põhi, tume ainult päis ja jalus".

- Vaalea teema: `assets/alasivut.css` (ladataan kaikille paitsi etusivulle; build-pages.mjs `head()`), alasivun `.page`-div saa
  luokan `lt` (build-pages.mjs `cleanOpen`; build-standalone.py hyväksyy `page lt` ja liittää alasivut.css:n). Sävyt = etusivun
  `.k-chalk`; painikkeet grafiittina, kulta vain linkeissä ja otsikon korostuksessa. Tummat paneelit (.example, .post.featured,
  .value.featured, .vote, .newsstrip …) vaaleiksi. Upotetut tummat näkymät: `.k-sld` (kerros kerrallaan, pyöristetty paneeli) ja
  verkko-sivun karttapaneeli `.km-map`/`.km-inline` saavat omat tummat muuttujansa; verkko-sivun luvut ovat vaalealla.
  Viisi alasivun SVG-kaaviota (chart-scale, chart-yield, sysdiag, orbit, mg-svg) väritetty vaaleiksi lähteissä (`data-lt="1"`).
  Budjetti alasivut.css ≤ 40 kt (verify-pages). site.css ennallaan.
- Tuotevalikoima: `scripts/tuotteet/build_tuotteet.py` (data + HTML; merkit `tuotteet:<lohko>:alku/loppu`; `--check`).
  Energiavarastot/energiasalvestid: 13 tuotetta (Ralos Beast 125 HD; Elecnova ECO-E418LP, ECO-E101WX, ECO-E64WX, ECO-E20FT2170LP,
  ECO-STS-C125; EP Energy EPES233, EPHS104/156, EPES5000, EPPS93-M, EPPS210-M, EPCS209; Avant Power OptiTemp Cube 47), suodatus
  radiopainikkeilla ja `:has()` (ilman :has()-tukea kaikki näkyvät). Lähteet ja päivät kortissa:
  Ralos = tekninen tiedote Beast 125 V10 (Junkars-tarjouksen liite 3.9.2026, Outlook), tarkistettu 9.11.2026;
  Elecnova = elecnova-ess.com-tuotesivut, luettu 9.11.2026 (ECO-E418LP: ENERGIA 2026 -messujen malli, Elecnovan uutinen 25.10.2026);
  EP Energy = luettelot "C&I Energy Storage Solutions" ja "Mobile Energy & Storage Charging Solutions" 12/2025 (Gmail 19eb6a5aa27f8813;
  valmistajan asiakirja, ei Energen-materiaalia; EP Equipment -nimeä ei näytetä); Avant = OptiTemp Cube 47 -esite 6/2026 (avanttecno.com).
  EPES261L jätetty pois (ENF 27.9.2026: ei enää tuotannossa; EPES233 on uusi malli).
- Tuotekuvat `assets/tuotteet/<id>.webp` 600×600: Elecnovan renderöinnit elecnovapower.com /uploads/image/20260203/ (ECO-E101WX,
  ECO-E64WX, ECO-E20FT2170LP-2, STS), ECO-E418LP = Elecnovan messukuva (kumppanit/elecnova-2), EP Energyn kuvat luetteloista
  (pdfimages + alfamaski), Avantin kuva esitteestä, Ralos = kumppanit/ralos-kaapit. Alkukuva `rivi-{2400,1600,m}.webp` = kuuden
  tuotteen rivi oikeassa mittasuhteessa (korkeudet datalehdiltä). Lupa: kumppaneiden omat materiaalit (23.10., 5.11. ja 9.11.2026).
- Energiavarastosivu uudelleen: alkukuva tuoterivinä, valikoima heti alussa, sitten rahavirtataulukko, "Mikä laskullanne muuttuu",
  toimitus + 3D/AR, kohteet, kerros kerrallaan (upotettu tumma), UKK, CTA. Päiväkaavio poistettu (sama kuin etusivulla).
- Kumppanisivu: "Valmistaja, malli ja tekniset tiedot ovat tarjouksessa." → linkki valikoimaan (FI/ET).
- Aurinkosähkö/päikeseelekter: alkukuva `assets/valikoima/ralos-katot.webp` (Ralosin ilmakuva), periaatteet rivinä (.facts-row),
  valikoima lohkossa `tuotteet:aurinko` (Ralos RLS-585 ja RLS-480 = Ralosin esitteet 6/2023, Roofit.Solar Velario Slim = datalehti
  2026-02 V1 vain FI, Gare Energy Oy:n kautta, kuva Garen aurinkokattokuvasta; Ralos Beast 125 HD, EP Energy EPHS, Elecnova ECO-E64WX).
  FI-osioihin kuvat valikoima/gare-katto (Gare Energy) ja valikoima/jsm-asentajat (JSM); ET-sivulla ei Garen eikä JSM:n kuvia
  (nimet vain Suomen sivustolla).
- Ajankohtaista/uudised: pääkatsauksen kortissa kartta (`assets/uutiset/*.webp`, rajattu tasokuvista kk-fi-d6 ja kk-ee-d4, OSM- ja
  Natural Earth -merkintä kuvan kulmassa), kuvateksti viittaa Yhteinen verkko / Ühine võrk -sivun lähteisiin; lainaus tekstin alle.
- Lukulista (artefakti LZyjrfRh2pqqPrZdC7cePR, versio 2, 9.11.2026): vertailu katselmoituun v51:een (`v51-orig`), siirretyt
  muuttumattomat rivit suodatettu, tuotekortit omana osionaan generaattorista, alt-tekstit piilotekstien osiossa; päätökset 17 (v52
  mukana) ja 21 (päiväkaavion kuvaus ja selite) päivitetty. Natiivilistat docs/native-pass päivitetty (PLAYWRIGHT_CORE=/opt/npm-tools/…).
- AVOIN: Madiksen päätökset 1–21 ja lauseiden luku; muut alasivut kuviin, kun kuvauksen (9.–11.11) kuvat tulevat; Avant OptiGrid
  ilman julkisia kW/kWh-lukuja (ei korttia); Elecnova ECO-E261LP-2A ilman varmistettua tuotekuvaa (ei korttia).

## v56 — Fingridin raja, kumppanien tausta ja alasivujen viimeistely (Madis 9.11.2026 klo 3.06 ja 3.12, haara v51-launch)

Madis: (3.06) kumppaneiden taustaa ja valinnan perusteita ei ole kerrottu kunnolla; (3.12) 2029-artikkeli ei pidä paikkaansa alle
5 MW:n liittymillä; kaikki osat ammattimaisiksi, korkein taso, ei kysymyksiä Madikselle, jos muutos vahvistaa kokonaisuutta;
katso kilpailijat; asiakkaan luottamus syntyy kokonaisuudesta.

- Fingridin raja: Etelä-Suomen varastorajoitus (Fingrid 24.9.2025) toteutuu liittymissopimushakemusten kautta. 20.11.2025 menettely
  ei koskenut alle 5 MW:n varastoja (Jyväskylän, Tampereen ja Turun seuduilla alle 1 MW:n); 1.6.2026 alkaen hakemus tarvitaan
  vähintään 2 MW:n kulutuksesta, tuotannosta ja varastoista koko Suomessa, myös jakeluverkon kautta, ja kartan alueilla
  (Tampere–Jyväskylä, Turku, osa Pohjanmaata) jo 1 MW:sta (Fingrid, sivu päivitetty 7.5.2026; kartta 1.6.2026; webinaari 18.5.2026).
  Hakemusten käsittely ruuhkautunut, etusijamenettely suunniteltu 1.1.2027 (Fingrid 23.10.2026). Artikkeli
  ajankohtaista/liityntarajoitus-2029 kirjoitettu uudelleen (merkintä "Päivitetty 9.11.2026", osoite ennallaan), samoin uutiskortti,
  reservimarkkinoiden nopeuskortti, energiavarastosivun huomautus, Meistä, etusivun karttatasot 3/5/6 ja kartta-data.json (lähde
  `fg-lta`, rivi Hakemusraja / Taotluse piir). Älä palauta väitettä "uudet varastot kantaverkkoon vasta 2029" ilman rajaa.
- Kumppanit: `scripts/kumppanit/build_kumppanit.py` (`--check`) on ainoa tietolähde kumppanisivun profiileille
  (merkit `kumppanit:profiilit:alku/loppu`) sekä etusivun korteille ja paneeleille. Jokaisella kumppanilla sijainti, Miksi valitsimme /
  Miks me nad valisime, Tausta / Taust, tarjonta, linkit ja lähteet päivämäärineen. Perustelut ovat Clauden ehdotus avoimista
  lähteistä (lukulistan päätös 22). Gare: "Roofit.Solarin virallinen kumppani Suomessa" (aurinkokatto.com/yritysesittely 9.11.2026).
  Avant: Yrittäjät 9.1.2024 (noin 450 henkeä, liikevaihto noin 288 milj. € 2023). EP: luettelo 12/2025 (yli 17 vuotta, noin 200 000
  akkua/v, yli 600 000 käytössä, Belgia 2011). Kumppanisivulla kumppanit heti alkuun, vanhat kortit ja sanamerkit pois.
- Alasivut (alasivut.css): ikonilaatat ja korttikehykset pois (principle, benefit, agg-step, step, process-cta), vaiheiden numerot
  Newsreaderilla, versaalit pois taulukoista ja selitteistä. Palvelut/Teenused: H1 "Kirjallisesta arviosta valmiiseen järjestelmään" /
  "Kirjalikust hinnangust valmis süsteemini", "tyypillinen tarjous" -vertailu pois. Laitevaatimukset: SJV2024 (Fingrid 15.1.2025).
  Energiavarastot: sijoitus valmistajan ohjeen ja Pelastusopiston ohjeen (12/2025) mukaan.
- Tarkkuuspäätökset toteutettu (lukulista): 1, 2 (pörssihinta vartin välein 1.10.2025 alkaen; reservit tunneittain ennallaan), 4
  (1 200 MW vuoteen 2030 mennessä), 6, 8a–b, 10, 12, 13 (ET: eelnõu 17.7.2026, 10 TJ / 85 TJ), 14, 20, 21. Avoinna: 8c (Viljarin
  "mestari"), 11 ja 15 (kartta), 16 (LinkedIn), 22 (perustelut), 25 (turvallisuuslauseet).
- Lukulista versio 3 (artefakti LZyjrfRh2pqqPrZdC7cePR): v56-rivit merkitty "v56", uudet sivut mukana, päätösten tila.
- Kilpailijahavainnot (9.11.2026): Cactos (Kempele, oma valmistus, 400+ kohdetta, OK Tanska 3.11.2026, STT), Powera (yritysfaktat,
  takuu, omistus, varovaiset tuottolupaukset), W.EG Eesti (yritystiedot, takuu, EAS-tuki, tehdyt työt); markkinan luottamusongelma:
  Fingridille satoja valituksia kotiakkujen myynnistä Fingridin nimissä (MTV). SAMAn ero: valmistajista riippumaton, lähteet ja
  päivämäärät, kirjallinen arvio, aggregaattori kohteen mukaan.

## v57 — lataus, koko valikoima ja Meistä (Madis 9.11.2026 klo 12.14 ja 12.25, haara v51-launch)

Madis: Meistä-osio ja se, mitä itsestämme kirjoitamme, on amatööritasoa; tuotteiden kohdalla ei ole latausasemia, vaikka niitä
on valikoimassa useamman valmistajan kautta; "kõiki tooteid ei leidnud valikus, pane kõik tooted üles".

- Uusi sivupari /lataus/ ↔ /laadimine/ (PAIRS molemmissa skripteissä, NAV_KEY ratkaisut/lahendused, valikko, mobiilivalikko,
  alatunniste, _redirects, llms.txt). Sivu: hero ja kolme lukua datalehdiltä → valikoima (`tuotteet:lataus`, suodatin AC / DC /
  akulla / siirrettävät) → mikroverkko-osio (siirretty kumppanisivulta, id #mikroverkko / #mikrovork) → käyttö ja ratkaisu
  -taulukko → UKK → CTA. FI-sivulla latauspistevelvoite: laki 733/2020, yli 20 pysäköintipaikan muut kuin asuinrakennukset,
  vähintään yksi yli 3,7 kW:n latauspiste 31.12.2024 alkaen (Moottori 30.9.2024). ET-sivulla ei velvoitetta: Viro päätti olla
  siirtämättä direktiivin pysäköintivaatimusta (ERR 16.9.2026), joten ET argumentoi ilman sitä.
- Tuotegeneraattori (`scripts/tuotteet/build_tuotteet.py`): lohkot varastot, aurinko, lataus ja kaikki (kumppanisivun koko
  valikoima, suodatin energiavarastot / lataus / aurinkosähkö / lämpöpumput / siirrettävät / varavoima). Lohkon rivi voi olla
  `(id, ryhmät, ohitukset)`; ohitukset korvaavat kortin kentät (esim. Cube 47 lataussivulla Type 2 -lähdöllä). `MUUT` = taulukko
  malleista, joista ei ole käyttökelpoista tuotekuvaa (Elecnovan kuvapalvelin on bottitarkistuksen takana, ei kierretä):
  Elecnova ECO-E261LP-2A, -E241WP-2A, -E233LS, -E215WS, -B418LP-2N, -B372LS, -B20FT5015LP-2, -B20FT3404WS, EPS-kaappi,
  PCS/BMS/EMS sekä Avant Power OptiGrid (tiedote 1.7.2025, ei julkisia kW/kWh-arvoja). Otsikko "Muut mallit ja ratkaisut",
  ei mainintaa puuttuvista kuvista (ei heikkouden kautta).
- Uudet tuotteet ja lähteet (luettu 9.11.2026): Zaptec Pro (tuotelehti 22.2.2023), Easee Charge Pro (10/2025 v1.03), EP Energy
  EPCP-DC120–360 (Mobile-luettelo 12/2025), ZOE Energy Storage Z Box-C 215-2H, HT-SAAE HT72-18X(ND)-F ja HT54/HT60-18X(ND)-F,
  HD Hyundai HiT-H LE-FB, APsystems QT2 (v1.0 7.10.2023), Sofar Solar KTL-sarja, Mitsubishi Electric CAHV-Z450, CAHV-R450,
  Large Hydrobox E, P-sarja, WDH, IDH125-D/250-D, PAC-IF013B-E, Ecodan E ja Geodan — kaikki Scanofficen datalehdiltä/esitteistä
  paitsi EP. Kuvat `assets/tuotteet/<id>.webp` 600×600 (Scanofficen tuotekuvat; EP luettelosta), valmistelu
  scratchpadin prep57.py:n tapaan (leikkaus alfasta, keskitys, seinälaitteet pystykeskelle).
- Rajaus: valikoimassa ovat yrityskohteisiin sopivat tuotteet. Kotitalouksien latausasemat (Zaptec Go, Easee Charge Up/Max,
  BENY), kotiakut (SolaX, Sofar HYD) ja ilmalämpöpumput mainitaan huomautuksessa ("saatte samoilta kumppaneilta pyynnöstä").
  Fronius-sivu on Scanofficella poistunut (uudelleenohjaus), CAHV-P500-sivu virheellinen: ei mukana.
- Uudet valmistajanimet sivustolla (tuotekortit, Madiksen 9.11.2026 ohje): Zaptec, Easee, ZOE Energy Storage, HT-SAAE,
  HD Hyundai, APsystems, Sofar Solar, Mitsubishi Electric. Toimittaja kaikissa Scanoffice Oy (molemmat sivustot, kuten
  kumppanisivulla 6.11.2026). Easeen datalehdessä on tavaramerkkihuomautus: vahvistus Scanofficelta lukulistan päätöksenä.
- Meistä/Meist uudelleen: H1 = brändilinja "Yhteinen verkko, itsenäinen energia." / "Ühine võrk, iseseisev energia.", ingressi
  mitä teemme, kolme faktaa (EPC, FI + EE, kirjallinen arvio kahdessa arkipäivässä); Miksi SAMA on olemassa (yhteinen verkko,
  markkina muuttuu -kappale lähteineen ennallaan, tieto ensin ja päätös teidän, mitä tavoittelemme); uusi osio Miten toimimme
  (kuusi käytäntöä, kaikki jo sivustolla luvattuja); Kuka vastaa mistäkin (Vastaa + Tausta hyväksytyistä bioista, ei
  nimikirjainpaikkoja, ei "mestari" -sanaa eikä "Lue lisää" -lohkoa); verkosto + linkki koko valikoimaan; kotipaikkaan osoite.
  Poistettu: kilpailijoiden heikkouksien kautta kerrottu "Tarjoukset pysyivät samoina" ja aloitussuunnitelma "Mistä aloitamme".
- Etusivun tiimiosio: "Vastuuhenkilöt nimeltä." / "Vastutajad nimeliselt.", vastuu ja suora numero (hyväksytyt numerot
  3.9.2026), ei nimikirjainlaatikoita (`.k-av` poistettu). Yhteystietosivun kortit samaan muotoon. Valokuvat lisätään
  kuvauksen jälkeen (`.person`-kortteihin `<img>` nimen yläpuolelle).

## v58 — EP Energy piiloon, muut tuotteet valikoimaan (perustajan päätös 9.11.2026 klo 12.59, haara v51-launch)

- EP Energy ei näy sivustolla toistaiseksi (tuotekortit, kumppaniprofiili, etusivun kortti, kumppanimatriisi, Meistä-ruudukko, llms.txt,
  tuoterivikuva). Data säilyy: `PIILOTETUT_VALMISTAJAT` (scripts/tuotteet/build_tuotteet.py), `PIILOTETUT` (scripts/kumppanit/build_kumppanit.py),
  etusivun kortit `scripts/kumppanit/piilotetut/ep-energy-{fi,et}.html`. Vartija `ep-piilossa` kaataa buildin, jos nimi tai EP-mallikoodi
  palaa näkyviin. Palautus perustajan päätöksellä: poista vartija ja kaksi piilotuslistaa, palauta kortit, aja generaattorit.
- Ralos: koko tuotekatalogi (ralos.fi/tuotekatalogi, luettu 9.11.2026): Mini-Beast 50 (50 kW / 102 kWh), Hoymiles HiOne, LB-16D-G3,
  HiT, HYT/HAT, MiT, HMT, HMS ja MiS, Atmoce M-ELV ja mikroinvertterit, Enershare CORE, Pytes PiLV1 ja V16, Raystech RT16076MPlus,
  Hanersun HiTouch 450/500/620/725, Over Easy xM-3. Taulukossa Raystech RT5427 (valmistajasivun kuva on tekoälyllä tehty, ei käytetä),
  Atmoce M-Backup ja M-Combiner, FLAT25. RLS-585 piilossa (ei Raloksen katalogissa 9.11.2026).
- Avant Power: OptiGrid™-energiavarasto 200 kW / 250 kWh tai 400 kW / 500 kWh, uppojäähdytys, integroitu pikalataus 200–600 kW
  (avantpower.fi/optigrid, luettu 9.11.2026). Pikalatauslaitteen valmistajaa ei nimetä. Kortin kuva = Avantin OptiGrid-havainnekuvan rajaus.
- Gare Energy Oy (vain FI): Gare Solar Carport. Scanoffice: Easee Charge Max, BENY BCP, SolaX X3-Hybrid G4 + T30 korteiksi; Zaptec Go,
  Easee Charge Up, lataustolppa, Sofar HYD, ilmalämpöpumppujen mallisarjat, Lossnay/Mobair ja kiinnitysjärjestelmät taulukkoon.
  Suodattimet Pienkohteet / Kotiin.
- Lataussivun luvut ja taulukko: pikalataus Avant Powerin varaston kautta (200–600 kW), siirrettävä yksikkö Type 2 9 kW.
- Energiavarastosivun tuoterivikuva ilman EP:tä (Elecnova-kontti, ZOE, ECO-E101WX, ECO-E64WX, Cube 47), mitat 2400×640 / 1200×506.

- v58b: kumppanien sivukartat ja tuotekatalogit käyty läpi 9.11.2026 (ralos.fi/sitemap.xml ja /tuotekatalogi, scanoffice.fi/sitemap.xml,
  avantpower.fi/sitemap.xml, aurinkokatto.com/page-sitemap.xml, elecnova-ess.com tuotevalikko). Uudet kortit: Ralos RLS-525, Tongwei
  725 Wp, Ralos Stalker 2.0 (uusi suodatin Aurinkoseuraaja), Atmoce BattBank, Enershare Active16, Raedian Nora, Roofit.Solar NuClick 2.0
  (vain FI). HYT-HV ja HAT-HV erotettu: HYT kortiksi, HAT taulukkoon omalla lähteellään. RLS-480:n lähde = nykyinen tuotesivu.
  Taulukkoon: Elecnova ECO-B100/120WP-2H, ECO-H3200K (PCS-Boost-kontti), akkupaketit ECO-P1P20WS ja ECO-P1P52LS; Hoymiles HiBattery
  1920 AC (valmistajasivun kuva tekoälyllä tehty), HMT-2250-6T, DTSU666; Ralos Nanorail; KACO blueplanet, Canadian Solar, Hanwha Q CELLS,
  ZNShine Solar, Scanoffice Premium -paketit, AmpIN Smart, Energiansäästäjä, Energypac, City Multi VRF, alpha innotec, Flowair LEO,
  varaajat. Jätetty pois: Avant TER47 (puolustusala), Mitsubishi AP (myynti päättynyt), Wedoton Comfort (saatavilla 2027),
  lisävarusteet ja kulutustarvikkeet. llms.txt: EP-maininta rivinvaihdon yli poistettu; vartija tarkistaa nyt myös llms-tiedostot.

## v59 — logorivi ja tuotenosto etusivulle (Martin 9.11.2026; tehty haarassa draft-logot-tuotteet, viety v51-launchiin ja draftiin 9.11.2026 klo 21.30 jälkeen)

Martin 9.11.2026: kumppaniosion kortit ja paneelit (jokaisella oma kortti ja linkit kumppanin sivuille) vaihtoehtoisesti
logoina yhdessä rivissä; paneelien tilalle päätuotteiden esittely, valittava valikko ja 2–3 tuotetta per valinta (vieritettävä)
tai tuotekatalogit. Tehty omaan haaraan vertailtavaksi draftin rinnalla (Netlifyn deploy preview PR:stä draftiin); draft ennallaan.

- Järjestys (Martin 9.11.2026 klo 19.19): tuotenosto ensin, logorivi sen alla.
- Logorivi (`.k-logos`, `scripts/kumppanit/build_kumppanit.py` `logos()`, merkit `kumppanit:logot:alku/loppu`): FI Ralos,
  Elecnova, Avant Power, Scanoffice, Gare Energy, JSM; ET Ralos, Elecnova, Avant Power, Scanoffice, Soleron. Ei linkkejä.
  Logot `assets/kumppanit/logot/<id>.svg`: kumppaneiden omilta sivuilta 9.11.2026 (ralos.fi R-merkki + jakokuvan sanamerkki,
  elecnovapower.com, scanoffice.fi ilman 40-vuotislisäystä "vuodesta 1984", aurinkokatto.com garelogo, jsmautomaatiosahko.fi
  ilman sulkukaaria, soleronenergy.ee; Avant Power = repossa ollut logo-avant-power.png), renderöity selaimessa isoksi ja
  jäljitetty yksivärisiksi vektoreiksi (potrace), väri #EFE8D8 = osion teksti. Optinen koko: leveys × korkeus ≈ `LOGO_ALA`,
  korkeus `LOGO_H`, tasaus `LOGO_SKAALA`. EP Energy jää pois `PIILOTETUT`-listan kautta. `front()` ohittaa korttien
  päivityksen, kun etusivulla ei ole `.k-pc`-kortteja.
- Tuotenosto (`.k-tuo`, `scripts/tuotteet/build_tuotteet.py` `ETUSIVU`/`etusivu()`, merkit `tuotteet:etusivu:alku/loppu`):
  radiot + `:has()` (ei JS:ää; ilman tukea kaikki ryhmät allekkain), ryhmät Energiavarastot / Aurinkosähkö / Lataus /
  Lämpöpumput, kolme korttia (alasivujen kortti, kaksi päätietoa, lähde ja päivä) + "Koko valikoima" -kortti tuotemäärällä
  ja linkillä alasivun valikoimaan (lämpöpumput: /kumppanit/?v=lampo#valikoima ↔ /partnerid/?v=lampo#valik). FI aurinko:
  Velario Slim, Gare Solar Carport, HD Hyundai; ET: HD Hyundai, Ralos Stalker 2.0, Tongwei 725 (kielirajatut ohitetaan).
  ≤ 1023 px kortit pyyhkäisyrivinä, ≤ 640 px valikko vaakavieritteinen.
- site.css: `.k-pcs/.k-pc/.k-pdl/.k-pm/.k-pgal`-säännöt poistettu (−5,3 kt), uudet `.k-logos`/`.k-tuo` lopussa; 87,8 kt.
  site.js: scrollers `.k-tuo-g` (oli `.k-pcs`), `?v=<ryhmä>` valitsee sivun tuotesuodattimen.
- Korjaus (koskee myös draftia): alasivut.css:n suodatussäännöt kattoivat vain tv- ja ta-lohkojen vanhat ryhmät, ja valitsin
  `.tuo:has(...)` ei osunut kumppanisivun `section#valikoima`:an → /kumppanit/-, /lataus/- ja v57–v58-ryhmien suodattimet eivät
  rajanneet mitään (draft 9.11.2026: "Lämpöpumput" näytti 58/58). Nyt säännöt generoidaan CATS × BLOCKS:sta
  (`filter_css()`, merkit `tuotteet:suodatus:alku/loppu` alasivut.css:ssä), valitsin `.tuo-f:has(radio)~.tuo-g`.
- Uudet näkyvät tekstit natiivitarkistukseen: FI "Kumppanimme", "Poimintoja valikoimasta", "Koko valikoima", "tuotetta",
  "Katso valikoima"; ET "Meie partnerid", "Näiteid valikust", "Kogu valik", "toodet", "Vaata valikut". Muut lauseet ovat
  alasivujen valikoiman hyväksyttyjä lauseita.
- Martin 9.11.2026 klo 21.30: "We like this design more than the previous one" → draftiin. Iso tyhjä "Koko valikoima" -kortti pois;
  tilalle ryhmän pieni painike korttien alla (`.k-tuo-more`: FI "Kaikki energiavarastot" / "Koko aurinkosähkövalikoima" /
  "Kaikki latausratkaisut" / "Kaikki lämpöpumput" + määrä; ET "Kõik energiasalvestid" / "Kogu päikeseelektri valik" /
  "Kõik laadimislahendused" / "Kõik soojuspumbad"). Valikon perään "Kaikki tuotteet" / "Kõik tooted" → /kumppanit/#valikoima ↔
  /partnerid/#valik (`.k-tuo-allp`). Kolme korttia rivissä (kuva 4:3, puhelimella 1:1). Koko kortti on linkki tuotteeseen sen omalla
  sivulla (`<lohkon pre>-<id>`, esim. /energiavarastot/#tv-ralos-beast-125-hd, lämpöpumput /kumppanit/#tk-…): mallinimen linkki
  `.tc-a` venytetään `::after`-kerroksella, lähdelinkki (`.tc-src`, z-index 2) pysyy klikattavana. Kohdekortti korostuu
  alasivulla (`.tc:target`, alasivut.css). Ryhmä = `.k-tuo-p` (paneeli: lista + painike).
- Avant Power korjattu (Martin 9.11.2026 klo 21.31: "Optigrid is their aggregation service … we want to show their battery
  storage"): tarkistettu avantpower.fi/optigrid 9.11.2026 — OptiGrid™ on Avantin mikroverkko- ja energianhallinta-alusta
  (DC-verkko, varastot, lataus, OptiGrid Cloud -pilviohjaus, joka voi viedä ylimääräisen kapasiteetin sähkömarkkinoille);
  varasto on oma tuotteensa ("Kiinteät energiavarastot … saatavilla erikseen", toimii myös itsenäisenä). Kortti nyt id
  `avant-power-bess`, malli "Kiinteä energiavarasto" / "Statsionaarne energiasalvesti", kuva Avantin BESS-tuotekuvasta
  (BESS-1.avif, neliörajaus; vanha `avant-power-optigrid.webp` = OptiGrid-havainnekuvan rajaus poistettu), päätieto "Käyttö:
  osana OptiGrid-mikroverkkoa tai itsenäisenä" (oli "Ohjaus: OptiGrid Cloud"), lähteen nimi "OptiGrid™-sivu, kohta Kiinteät
  energiavarastot". Energiavarastosivun tuoterivikuvan alt korjattu samaan. Taulukon rivi "OptiGrid™ — Mikroverkko …" on oikein ja jää.
- AVOIN: natiivitarkistus (yllä luetellut + ryhmäpainikkeet, "Kaikki tuotteet" / "Kõik tooted", "Käyttö" / "Kasutus" ja sen arvo,
  "Statsionaarne energiasalvesti"); logojen käyttö kumppanin ilmeohjeen mukaan (pyydä tarvittaessa viralliset vektorilogot).

## v59c — kielitarkistus FI/ET ja tietosuojatarkistus (Martin 10.11.2026, haara v51-launch)

- Koko sivuston näkyvä teksti luettu läpi molemmilla kielillä (Voikko + hunspell-et apuna). Korjattu selvät virheet lähteisiin ja
  generaattoreihin: FI "suuntaa antava", "suuritehoinen", "ilmajäähdytteinen", Type 2 -lähtö, lataussivun kuvaus (ei enää 120–360 kW:n
  pikalatureita, jotka olivat EP Energyn), pilkut ja sijamuodot; ET Soome tootenimed tabelis eestikeelseks (`MUUT`-rivin malli voi olla
  `(fi, et)`), "õhk-vesisoojuspump", "turulepääs", "päikesevarikatus" laadimise lehel, "Helsingi", privaatsuspoliitika sõnastus,
  "ligikaudne" (oli "suunda näitav"), "paigaldatud netovõimsus" jt. OptiGrid-taulukkorivin lähde omaksi (`avant-ogp`).
- Tarkistettu: sivusto ei aseta evästeitä eikä selaimen tallennusta (paitsi `?review=1`-katselmustilan sessionStorage); kartan osoitehaku
  ei tallenna hakuja (funktio lokittaa vain virhekoodin); yritystiedot, tietosuojaseloste ja kartta-aineistojen lähdemerkinnät ovat sivuilla.
- Lomake-ilmoitukset menevät Netlifystä Madikselle (madis.maastik@samaenergia.fi, Martin 10.11.2026).
- AVOIN natiivitarkistukseen (perustajan valinta, ei korjattu): FI "Akulla varustettu pikalaturi" -osio lataussivulla kuvaa tuotetyyppiä,
  jota valikoimassa ei nyt näy (EP piilossa); Gare-taustan "15 vuoden kokemuksella"; ET "Ta võtab tasu" (võrguettevõtja), "peakilbi joonis/skeem".
- JULKAISU 10.11.2026 (perustajan päätös, Martin klo 3.55): v51-launch → main ennen Madiksen "publish"-hyväksyntää ja natiivitarkistusta,
  kuten v34 26.10.2026. Poikkeaa päätöksestä I-20261104-1 ("main vain Madiksen OK:lla") ja Language-säännöstä; korjaukset jatkokommiteissa.
  Tietosuojasivujen päivämäärä ja llms.txt 10.11.2026. Palautus tarvittaessa Netlifyn aiempaan tuotantodeployhin (941e6ef).
