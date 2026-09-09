# Julkaisupaketti: `draft` → `main`

Tämä on **`main`-merge-paketti**. Se ei ole lupa yhdistää — se on lista siitä,
mikä on auki, kuka sen sulkee ja millä artefaktilla.

- Lähde: `draft` @ `c3bc2d6`
- Kohde: `main` @ `b74d5ab` (nykyinen julkaistu sivusto)
- Koonnut: automaattisesti erässä v29, 10.09.2026

---

## 1. Avoimet portit — jokainen on suljettava ennen yhdistämistä

| # | Portti | Omistaja | Vaadittu artefakti |
|---|---|---|---|
| — | **Madisin natiivikatselmus** | Madis Maastik | `docs/native-pass/FI.md` ja `docs/native-pass/ET.md` täytettyinä: jokainen rivi joko **OK** tai korjaus **Korjaus:**-rivillä. FI 598 riviä (58 ⚠), ET 573 riviä (52 ⚠). ⚠-rivit ensin — ne ovat perustajan päätöksiä tai lukuja, eivät käännösasioita. |
| E4 | **Kumppanivahvistukset** | Martin | Kirjallinen suostumus nimen käyttöön jokaiselta: VENI Energia, Soleron Energy, Ralos Oy, JSM Automaatiosähkö Oy ja **Scanoffice Oy** (vain FI-sivustolla). Lisäksi **logotiedostot** — logopaikat ovat tällä hetkellä tyhjät. |
| E6 | **Viljar vahvistaa referenssikohteet** | Viljar Petersell (Martin välittää) | Vahvistus Aurinkosähkö-sivun lohkosta „Kokemus, joka on jo tehty“: **„jopa 400 kW:n peltoasennuksiin“** ja **„megawattiluokan hankkeet ovat suunnitelmissa“**. Lohko on jo `draft`illa (päätös D19). Ks. myös löydös alla. |
| E7 | **Ralos-lauseen muotoilu** | Martin | Ratkaisu siihen, palaako „suomalaisten insinöörien suunnittelemat“ Ralos-korttiin. Se on tällä hetkellä **poistettu**, koska kysymys on vastaamatta. |
| E11 | **LinkedIn** | Martin | Yrityksen LinkedIn-URL **ja neljä logotiedostoa**. Tällä hetkellä Ajankohtaista/Uudised-sivulla on vain lause, ei painiketta. |
| E13 | **Netlify Forms -testimerkinnät** | Martin | **Kymmenen** testimerkintää poistettava Netlifyn lomakenäkymästä ennen julkaisua, jottei tuotantodataan jää testejä. |

### Huomio porttiin E13

Toimeksianto sanoo **kymmenen** testimerkintää. `Claude outputs/SAMA_v17_Port_Tracker.md`
kirjaa **neljä** (*„four test entries to delete (2 specified, 1 crashed harness,
1 »PROBE (ei lähetetä)«)“*). Määrä on ilmeisesti kasvanut erien myötä, mutta lukua
ei arvattu kumpaankaan suuntaan: **Martin katsoo Netlifyn lomakenäkymästä
todellisen määrän ja poistaa kaikki testimerkinnät** — myös luvun 4 kaksi aitoa
julkaisun jälkeistä testilähetystä.

### Löydös, joka koskee porttia E6

Merkkijono *„Tiimimme on rakentanut aurinkojärjestelmiä vuosia: … jopa 400 kW:n
peltoasennuksiin“* (FI ja ET) on **sekä referenssiväite että lähteetön luku**.
Repo-säännöt `CLAUDE.md`:ssä pitävät molempia voimassa: *„No track-record claims“*
ja *„No figures without a documented source“*. Portin E6 sulkeminen tarvitsee siis
kaksi asiaa: Viljarin vahvistuksen kohteista **ja** päätöksen siitä, esitetäänkö
luku 400 kW lähteen kanssa vai poistetaanko se. Sisältöä ei muutettu tässä erässä.

---

## 2. Muutoksen laajuus `main`…`draft`

```
96 files changed, 16983 insertions(+), 6003 deletions(-)
```

| | Määrä |
|---|---|
| Uusia tiedostoja | 37 |
| Poistettuja | 27 |
| Muutettuja | 32 |
| Committeja | 47 |

Sivuja: `main` 20 → `draft` 27 (+ 2 × 404). Viisi slugia nimetty uudelleen
(`aurinko-ja-akku`→`aurinkosahko`, `prosessi`→`palvelut`,
`paike-ja-aku`→`paikeseelekter`, `protsess`→`teenused`,
`reserviturud`→`reserviturg`); vanhat osoitteet ohjataan `_redirects`-säännöillä.

### Commitit järjestyksessä

- `af69024` Ulkoasu v5: fontit itse isännöityinä (Newsreader variable + IBM Plex Sans, SIL OFL), logo-PNG:t ja og-kuvat
- `391e084` Ulkoasu v5 (kulta/typografinen): FI+ET lähteet suunnittelutiedostoista fi 3.1 / et 5.1, site.css ja site.js
- `442e196` Build v5: parittomat artikkelisivut, JSON-LD, og:image, llms-full.txt, 404-sivut, ohjaukset ja dokumentit
- `7fd3911` Julkaisu-luonnos: v5-ulkoasu (kulta/typografinen) — generoidut sivut, 404-sivut, sitemap, llms-full.txt, _headers, katselmusmanifesti
- `4b44d82` Katselmustila: alapalkki kokoon taitettava ja suljettava (mobiili)
- `4cfffd5` Kuvitukset: tekstien sovitus, päällekkäisyydet, varjostus seuraa käyrää (FI+ET, mobiili)
- `604eb30` Rahoitus ilman kumppaninimiä (FI+ET); llms.txt ja repo-säännöt päivitetty
- `eda26a4` Meistä: järjestys Madis, Martin, Viljar (FI+ET)
- `da6bdbb` Kielentarkistus FI+ET: aggregaattorimuotoilu, Yritys paperilla, sanajärjestys- ja pilkkukorjaukset, dimensioneerimine-sanasto
- `68b24c9` Aggregaattorisivun otsikko lyhyemmäksi (FI+ET)
- `626f7e8` Etusivu ja Palvelut: "vain laitetta" / "ainult seadet" (FI+ET)
- `9251c48` Etusivu v5.1: uusi järjestys, tiivistetty hero ja askeleet, UKK 5 kysymystä, "Mihin me uskomme" (FI+ET)
- `de9e07f` QA: kuvitusten mittaustyökalu scripts/qa-illustrations.mjs (ei osa buildia, ei npm-riippuvuuksia)
- `eaa199c` Etusivu v5.2: askeleet takaisin laattoina uusin kultariveineen, kultakorostukset takaisin, toinen mielipide -painike (FI+ET)
- `9adcc7a` Etusivu: sanamuotokorjaukset (FI+ET)
- `d95cca8` Hero: taajuusjälki esiin, järjestelmäpiirros oikealle, og-kuvat (FI+ET)
- `6150ccf` Hero: alkuperäinen sommittelu takaisin, piirros pois herosta (FI+ET)
- `383da52` Ratkaisut-osio: järjestelmäpiirros akku keskellä (FI+ET)
- `57e00a5` Järjestelmäpiirros Energiavarastot-sivulle, etusivun Ratkaisut-osio takaisin tiiviiksi, hero-otsikon riviväli (FI+ET)
- `451cd97` Etusivu v5.5: kulta kassavirroille, hero-painike Ratkaisuun (FI+ET)
- `8e50eac` Etusivu v5.5b: ankkurit sticky-otsakkeen alle, Viisi tekijää -osio kuvan ja otsikon mukaiseksi + kartoituslinkki (FI+ET)
- `45e21ca` Etusivu v5.6: Monta tekijää -osio, mobiiliotsikot 36 px, hero-painike "Miten akku toimii?", hero-kuvakokeilu voimalinja (FI+ET)
- `f12f35e` v5.7: osoite Sörnäisten Rantatie 33 C, Martin talousjohtaja + tiimiteksti ilman lupausta, ET-hero neljälle riville, scroll-diagnoosi (FI+ET)
- `2a8b1cb` v17-1a: sisältövartijat verify-pages.mjs:ään, data-lang-tuki, ET uudised-slug + 301:t, Privaatsuspoliitika, CLAUDE.md kumppanilista (Scanoffice FI)
- `a7e4997` v17-1b: hero-otsikko a1 kokeiluun (FI+ET), mittaukset qa/v17-batch1
- `cf662c2` v17-2a: lomakekäsittelijä valitsee form.lead-form (Netlify poistaa data-netlify-attribuutin), "ja perustaja" pois, CLAUDE.md uudised, .gitignore, LinkedIn-painike
- `afda5de` v17-2b: Laitevaatimukset/Seadmete nõuded/Equipment requirements, Valmistajille-lohko, Energiavarastot toimitus-osio, VENI/Soleron järjestelmälohko, yhteystietokortit, arvion kuvaus
- `ec3661a` v17-2c: Tietosuoja/Privaatsuspoliitika päivitys (Netlify, uutiskirje, evästeet), footer-uutiskirjelomake ilman lupausta tiheydestä
- `78e9138` v17-3a: site.css kuollut CSS pois (8 355 tavua), budjetti 70 kt ennallaan
- `bdba2f0` v17-3b: Palvelut tuoteportaikko (Arvio · Projekti · Portfolio), "Näin se etenee – ja mikä maksaa milloin" etusivulle ja Palveluihin, viiden tekijän kaavio Arvio-kortin viereen, rahoitus-UKK etusivulle, syvänsininen night-paletti, uutiskirje kahdella palstalla
- `ac093b5` v17-4a: SVG-tyylit rajattu, OG-kuvat siniselle, hero-CLS (a1)
- `d71a95e` v17-4b: etusivun ensimmäinen osio yhdistetty (Liittymä on omaisuutta + neljä korttia lähteineen), kaavio pois etusivulta, hero-painike → #epavarmuus
- `f65f242` v17-4c: reserviteaser (kuva, korjatut luvut), Kenelle laajentimineen, Miksi SAMA, UKK 11 kohtaa, järjestys
- `1291ae3` v17-5a-1: Elering 76/490/580 MW = kvalifitseeritud võimsus (6 kohtaa, 4 sivua), Datahub-sanamuoto CSV-reitille + vartija, ET reserviteaserin otsikko 2035, tuottavat-vartija
- `ae47d82` v17-5a-2: Meistä/Meist — kokonaistoimittaja, perustamistarina lähteineen, tiimi, kumppanit (Scanoffice FI), rahoitus ennallaan
- `93b88b7` v17-5a-3: Reservimarkkinat/Reserviturg — Neljä syytä (rekisterin luvut), sitaatti, strategiarivi; kanta ennallaan
- `064b575` v17-5a-4: Aurinkosähkö/Päikeseelekter v17-sisältö (E6 gate ennen mainia)
- `365fead` v17-5a-5: Ajankohtaista/Uudised julkaisualustaksi, Lyhyemmät tiedotteet rekisterin sanamuodoin, Tulossa-kortit
- `391d188` v27-6: hero v27-variantti, Carunan hinnastokortit (Tehosiirto 1 PJ), kiinteistön arvo, prosessin vaihe 04 Rahoitus ja päätös, Ajankohtaista/Uudised-nostot, llms.txt ajan tasalle, BRELL-lähteet korjattu
- `1a8f232` v27-7: etusivun osiot 2 ja 3 v27:n rakenteeseen (argumentti + todistelaatikot, Ratkaisu omaksi osiokseen), ET-laatat Elektrilevin hinnastosta käibemaksuta
- `766e941` v27-8: asettelukorjaukset — .intro-split.wide palautettu (12 lohkoa), #kenelle wide, FI-hero mobiilissa, ET-teaserin ja reserviturg-faktojen ylivuoto
- `0fb4e84` v28-1: kuollut CSS pois (renderöintipohjainen audit, .kicker ainoa löydös)
- `1ba4ae5` v28-2: hero-otsikkoon ajatusviiva, "usein" pois Kenelle-otsikosta (perustajapäätös 10.09)
- `fc6a99f` v28-3: hero v27:n asetteluun (otsikko leveänä, lead ja napit alle), kuva ja lead ennallaan
- `8cf4438` v28-4: koko sivuston asettelukatselmus — qa-layout.mjs + löydösten korjaukset
- `7b3cdee` v29-1: tiimikorttien järjestys Madis → Martin → Viljar (Meistä + Yhteystiedot)
- `c3bc2d6` v29-2: docs/native-pass — koko FI/ET-muutospaketti Madisin tarkistettavaksi

---

## 3. Mitä tähän yhdistämiseen **ei** tule

- **Erä 5b — kolme artikkeliparia.** Odottaa Numbers Registeriä (portti **E8**:
  *„Numbers Register for articles“*). Artikkeleita ei julkaista ennen kuin
  jokainen luku on rekisterissä lähteineen. Ajankohtaista/Uudised-sivut
  julkaistaan **julkaisualustana** ilman näitä kolmea artikkelia.

- **`SAMA_v27_Arviointi_2026-09-09.md` §2 — dokumenttia ei löytynyt.**
  Ks. avoin kysymys alla; tämän kohdan sisältö on vahvistettava ennen
  yhdistämistä, jotta lista on täydellinen.

### Avoin kysymys tähän lukuun (Martin)

Toimeksianto rajasi merge-paketin ulkopuolelle *„kaiken, mikä on tiedostossa
`SAMA_v27_Arviointi_2026-09-09.md` §2“*. **Tuota tiedostoa ei ole projektissa.**
Haku koko `~/Projects/sama-energia`-puusta ei löydä yhtään v27-arviointia.
Lähin vastine on `Claude outputs/SAMA_v17_Arviointi_ja_Integrointisuunnitelma_2026-09-08.md`,
mutta **sen §2 on „What changed — by page“** — kuvaus v17:n muutoksista, ei lista
siirretystä työstä. Sitä ei siis voi kopioida tähän lukuun.

Rajausta ei arvattu. Martin vahvistaa kumman tarkoitti:
1. jokin muu dokumentti (nimi), vai
2. v17-arvioinnin jokin toinen luku (esim. §3 „Regressions“ tai §4 „Decisions needed“), vai
3. lista, joka on olemassa vain keskustelussa — jolloin se kirjataan tähän sellaisenaan.

---

## 4. Yhdistämisen jälkeen tarkistettavat

Nämä eivät ole todennettavissa staattisesti — vain tuotannossa julkaisun jälkeen.

**1. Soft-404 molemmilla hosteilla.** Molempien on palautettava `404`, ei `200`:

```bash
curl -sI https://samaenergia.fi/ei-ole-olemassa/ | head -1
curl -sI https://samaenergia.ee/pole-olemas/ | head -1
```

**2. Yksi aito lomakelähetys per kieli.** Täytä ja lähetä kartoituslomake
suomeksi osoitteessa `https://samaenergia.fi/` ja viroksi
`https://samaenergia.ee/`. Tarkista molemmista:
- onnistumispaneeli näkyy selaimessa,
- merkintä ilmestyy Netlifyn lomakenäkymään,
- ilmoitus tulee perille sähköpostiin.

Nämä kaksi lähetystä ovat **aitoja** — ne poistetaan lomakenäkymästä samalla
kertaa kuin portin E13 kymmenen testimerkintää.

---

## 5. Tila

Tämä PR on **luonnos** (draft). Sitä ei yhdistetä ennen kuin luvun 1 jokainen
portti on suljettu ja luvun 3 avoin kysymys on vastattu.
