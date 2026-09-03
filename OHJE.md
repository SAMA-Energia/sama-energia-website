# OHJE / JUHEND — tekstimuudatused veebilehele · tekstimuutokset verkkosivuille

> Sisäinen ohje sisällöntekijöille. Ei julkaista sivustolla.

## EESTI KEELES

### Kus tekstid elavad

Kõik saidi tekstid elavad TÄPSELT kahes failis:

- **`src/et.html`** — eestikeelne sait (samaenergia.ee)
- **`src/fi.html`** — soomekeelne sait (samaenergia.fi)

Muuda AINULT neid kahte. Kõik muu (leheküljekaustad, `et/**`, `404.html`,
`sitemap.xml`, `llms-full.txt`, `_headers`) on genereeritud — build kirjutab
need üle ja käsitsi tehtud muudatused kaovad.

### Kuidas muuta — otse brauseris, midagi paigaldamata

1. Ava repo github.com-is ja vali üleval vasakul haru **`draft`**.
2. Ava fail `src/et.html` (või `src/fi.html`) ja klõpsa pliiatsiikooni ✏️.
   Suuremaks tööks: vajuta klaviatuuril **`.`** (punkt) — avaneb VS Code
   brauseris, sama draft-haru.
3. Tee muudatus ja vajuta **Commit changes** (siht jääb `draft`-haruks).
4. Valmis — GitHub Action genereerib lehed automaatselt (~1 min). Sina ei
   buildi midagi.

### Kuidas kontrollida

- Oota ~1–2 minutit, siis ava <https://draft--samaenergia.netlify.app>
- **<https://draft--samaenergia.netlify.app/?review=1>** näitab iga muudatuse
  sõnahaaval esile tõstetuna võrreldes avaldatud saidiga — parim viis oma töö
  üle vaadata.

### Kuidas lisada uus ülevaade (artikkel)

Iga artikkel on `src/et.html`-is üks `.page`-plokk pluss üks kaart Ülevaadete
lehel. Kõige lihtsam on kopeerida olemasolev:

1. Otsi failist `data-slug="ulevaated/reservitasu-2026"` — see on terve
   artikliplokk `<div class="page" …> … </div>`. Kopeeri kogu plokk selle alla.
2. Muuda koopias:
   - `id="p-art-<uus-nimi>"` — kordumatu, algab alati `p-art-`;
   - `data-slug="ulevaated/<uus-slug>"` — slug on väiketähed, sidekriipsud,
     ilma täpitähtedeta; sellest saab aadress
     `samaenergia.ee/ulevaated/<uus-slug>/`;
   - `data-title` (brauseri pealkiri) ja `data-desc` (140–160 tähemärki,
     otsingumootorite kirjeldus);
   - murupolk (`<p class="crumbs">`), `.ameta` kuupäev kujul
     `3. september 2026` (build loeb sellest avaldamiskuupäeva), pealkiri
     `<h1>`, sissejuhatus `.stand`, tekst `.prose`, allikad `.sources-list`.
3. Otsi `data-slug="ulevaated"` (Ülevaadete leht) ja lisa `.postlist`-i
   uus `<a class="post …" href="/ulevaated/<uus-slug>/">`-kaart — kopeeri
   olemasolev kaart. Kui uus artikkel on esiletõstetud, vaheta `featured`-klass.
4. Sama slugi ei lisata `scripts/build-pages.mjs`-i: pesastatud
   `ulevaated/…`-slugid on lubatud, aga iga uus artikkel tuleb lisada
   `UNPAIRED.et`-loendisse samas failis (üks rida) — muidu build keeldub.
   Küsi see üks rida Martinilt või lisa ise.
5. Commit → Action buildib → kontrolli esikatselust. Soome artikli jaoks sama
   `src/fi.html`-is (`ajankohtaista/<slug>`, `UNPAIRED.fi`).

### Avaldamine

Kui muudatuste komplekt on valmis, anna **Martinile** teada. Ainult tema
avaldab (draft → main → samaenergia.fi / samaenergia.ee).

### Avaldamine — asutajatele

1. Ava github.com-is haru **`draft`** → nupp **Contribute** →
   **Open pull request** → **Create pull request** (siht: `main`).
2. Oota, kuni kontroll **`build-verify`** läheb roheliseks ✓.
3. Vajuta **Merge pull request** — toodang on samaenergia.fi / .ee peal
   ~2 minutiga.

Punane ✗ tähendab, et build keeldus sisust (nt kohatäide, katkine link või
vananenud genereeritud lehed) — paranda draftis või küsi abi. Merge'ida
saavad ainult asutajad.

### Reeglid

- Ära muuda genereeritud lehti ega `assets/site.css`-i ilma eelneva
  kokkuleppeta.
- Hoia FI ja ET peegelpildis — sama sisumuudatus mõlemasse keelde
  (välja arvatud artiklid, mis on keelepõhised).
- Ei kohatäiteid nagu `[X,XX]`, `KONTROLLITAKSE` või `[CHECK]` avaldatavas
  tekstis — build blokeerib need (punane X).
- Iga avaldatav arv vajab dokumenteeritud allikat (allikarida teksti juurde).
- Partnerite nimed: ainult CLAUDE.md-s loetletud viis — uus nimi vajab
  asutaja otsust.

---

## SUOMEKSI (peilisisältö)

### Missä tekstit asuvat

Kaikki sivuston tekstit asuvat TÄSMÄLLEEN kahdessa tiedostossa:

- **`src/fi.html`** — suomenkielinen sivusto (samaenergia.fi)
- **`src/et.html`** — eestinkielinen sivusto (samaenergia.ee)

Muokkaa VAIN näitä kahta. Kaikki muu (sivukansiot, `et/**`, `404.html`,
`sitemap.xml`, `llms-full.txt`, `_headers`) on generoitua — build
ylikirjoittaa ne ja käsin tehdyt muutokset katoavat.

### Miten muokkaat — suoraan selaimessa, mitään asentamatta

1. Avaa repo github.comissa ja valitse ylhäältä haara **`draft`**.
2. Avaa `src/fi.html` (tai `src/et.html`) ja napsauta kynäkuvaketta ✏️.
   Isompaan työhön: paina näppäintä **`.`** (piste) — selaimeen avautuu
   VS Code, sama draft-haara.
3. Tee muutos ja paina **Commit changes** (kohteena pysyy `draft`).
4. Valmista — GitHub Action generoi sivut automaattisesti (~1 min). Sinun ei
   tarvitse buildata mitään.

### Miten tarkistat

- Odota ~1–2 minuuttia ja avaa <https://draft--samaenergia.netlify.app>
- **<https://draft--samaenergia.netlify.app/?review=1>** näyttää jokaisen
  muutoksen sanatasolla korostettuna julkaistuun sivustoon verrattuna.

### Miten lisäät uuden katsauksen (artikkelin)

Jokainen artikkeli on `src/fi.html`-tiedostossa yksi `.page`-lohko ja yksi
kortti Ajankohtaista-sivulla. Helpointa on kopioida olemassa oleva:

1. Hae tiedostosta `data-slug="ajankohtaista/liityntarajoitus-2029"` — se on
   koko artikkelilohko `<div class="page" …> … </div>`. Kopioi lohko sen alle.
2. Muuta kopioon:
   - `id="p-art-<uusi-nimi>"` — yksilöllinen, alkaa aina `p-art-`;
   - `data-slug="ajankohtaista/<uusi-slug>"` — pienet kirjaimet, väliviivat,
     ei ääkkösiä; siitä tulee osoite `samaenergia.fi/ajankohtaista/<uusi-slug>/`;
   - `data-title` (selaimen otsikko) ja `data-desc` (140–160 merkkiä,
     hakukoneiden kuvaus);
   - murupolku (`<p class="crumbs">`), `.ameta`-päivämäärä muodossa
     `3. syyskuuta 2026` (build lukee siitä julkaisupäivän), otsikko `<h1>`,
     ingressi `.stand`, teksti `.prose`, lähteet `.sources-list`.
3. Hae `data-slug="ajankohtaista"` (Ajankohtaista-sivu) ja lisää `.postlist`-
   ruudukkoon uusi `<a class="post …" href="/ajankohtaista/<uusi-slug>/">`-
   kortti — kopioi olemassa oleva. Jos uusi artikkeli on nosto, siirrä
   `featured`-luokka sille.
4. Lisää uusi slug tiedoston `scripts/build-pages.mjs` listaan `UNPAIRED.fi`
   (yksi rivi) — muuten build kieltäytyy. Pyydä rivi Martinilta tai lisää itse.
5. Commit → Action buildaa → tarkista esikatselusta. Eestinkieliselle
   artikkelille sama `src/et.html`-tiedostossa (`ulevaated/<slug>`,
   `UNPAIRED.et`).

### Julkaisu

Kun muutoskokonaisuus on valmis, kerro **Martinille**. Vain hän julkaisee
(draft → main → samaenergia.fi / samaenergia.ee).

### Julkaisu — perustajille

1. Avaa github.comissa haara **`draft`** → painike **Contribute** →
   **Open pull request** → **Create pull request** (kohde: `main`).
2. Odota, että tarkistus **`build-verify`** muuttuu vihreäksi ✓.
3. Paina **Merge pull request** — tuotanto on samaenergia.fi / .ee -osoitteissa
   ~2 minuutissa.

Punainen ✗ tarkoittaa, että build kieltäytyi sisällöstä (esim. kohatäyte,
rikkinäinen linkki tai vanhentuneet generoidut sivut) — korjaa draftissa tai
kysy apua. Vain perustajat voivat mergata.

### Säännöt

- Älä muokkaa generoituja sivuja tai `assets/site.css`-tiedostoa ilman
  etukäteissopimista.
- Pidä FI ja ET peilikuvina — sama sisältömuutos molempiin kieliin
  (artikkeleita lukuun ottamatta, ne ovat kielikohtaisia).
- Ei kohatäytteitä kuten `[X,XX]`, `TARKISTETAAN` tai `[CHECK]` julkaistavaan
  tekstiin — build estää ne (punainen X).
- Jokainen julkaistava luku tarvitsee dokumentoidun lähteen (lähderivi
  tekstin yhteyteen).
- Kumppaninimet: vain CLAUDE.md:ssä luetellut viisi — uusi nimi vaatii
  perustajan päätöksen.
