# OHJE / JUHEND — tekstimuudatused veebilehele · tekstimuutokset verkkosivuille

> Sisäinen ohje sisällöntekijöille. Ei julkaista sivustolla.

## EESTI KEELES

### Kus tekstid elavad

Kõik saidi tekstid elavad TÄPSELT kahes failis:

- **`src/et.html`** — eestikeelne sait (samaenergia.ee)
- **`src/fi.html`** — soomekeelne sait (samaenergia.fi)

Muuda AINULT neid kahte. Kõik muu (leheküljekaustad, `et/**`, `sitemap.xml`,
`_headers`) on genereeritud — build kirjutab need üle ja käsitsi tehtud
muudatused kaovad.

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

### Avaldamine

Kui muudatuste komplekt on valmis, anna **Martinile** teada. Ainult tema
avaldab (draft → main → samaenergia.fi / samaenergia.ee).

### Reeglid

- Ära muuda genereeritud lehti ega `assets/site.css`-i ilma eelneva
  kokkuleppeta.
- Hoia FI ja ET peegelpildis — sama sisumuudatus mõlemasse keelde.
- Ei kohatäiteid nagu `[X,XX]` või `KONTROLLITAKSE` avaldatavas tekstis —
  build blokeerib need (punane X).
- Iga avaldatav arv vajab dokumenteeritud allikat (allikarida teksti juurde).

---

## SUOMEKSI (peilisisältö)

### Missä tekstit asuvat

Kaikki sivuston tekstit asuvat TÄSMÄLLEEN kahdessa tiedostossa:

- **`src/fi.html`** — suomenkielinen sivusto (samaenergia.fi)
- **`src/et.html`** — eestinkielinen sivusto (samaenergia.ee)

Muokkaa VAIN näitä kahta. Kaikki muu (sivukansiot, `et/**`, `sitemap.xml`,
`_headers`) on generoitua — build ylikirjoittaa ne ja käsin tehdyt muutokset
katoavat.

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

### Julkaisu

Kun muutoskokonaisuus on valmis, kerro **Martinille**. Vain hän julkaisee
(draft → main → samaenergia.fi / samaenergia.ee).

### Säännöt

- Älä muokkaa generoituja sivuja tai `assets/site.css`-tiedostoa ilman
  etukäteissopimista.
- Pidä FI ja ET peilikuvina — sama sisältömuutos molempiin kieliin.
- Ei kohatäytteitä kuten `[X,XX]` tai `TARKISTETAAN` julkaistavaan tekstiin —
  build estää ne (punainen X).
- Jokainen julkaistava luku tarvitsee dokumentoidun lähteen (lähderivi
  tekstin yhteyteen).
