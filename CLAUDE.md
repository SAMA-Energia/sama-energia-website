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
  04.11.2026, below). Soleron Energy is named on the Estonian site only, as each market argues with its own facts (applied
  04.11.2026). Roofit.Solar (manufacturer without a contract; the Finnish cooperation runs through Gare Energy Oy), EP Energy /
  EP Equipment and Energen Nordic are not named on either site until the founder decides. `verify-pages.mjs` guards `nimet-1104`
  and `mallinimet-1104` fail the build if these names or product model names reappear in visible text.
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
