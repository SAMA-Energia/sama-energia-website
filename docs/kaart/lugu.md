# Ühine võrk / Yhteinen verkko — kaardi lugu (v35, 2.11.2026; esileht 3.11.2026)

Vestlus C (kaart ja andmed), haru `v35-uusi-ilme`. Alus: `docs/brief/00-lahteulesanne.md`, `docs/brief/03-kaart.md`, `docs/tutkimus/2026-11-02-fingrid-elering.md`.

## Mis on tehtud

- **4.11.2026 (Madise tagasiside: „pole sama kerimise efekti", „näitad ainult kõrgepingeliini", „kaart ulatub ju Saaremaale ja saartele")**: /vork/ ja /verkko/ kaart järgib kerimist kõigil ekraanidel — telefonis kinnitub kaart üles ja peatükid kerivad selle all (nagu v38 lava telefonis); kiht vahetub peatüki kaupa, „Salvestid" (EE) suumib Harju–Rapla parkidele ja viimases peatükis suumib kaart kerimise järgi kodumaast teie objektini (v38: kaart kasvab kerides). 110 kV võrk (sh saarte liinid ja kaablid) on vaikimisi nähtav; nupp „110 kV" peidab. Andmefailis kihi oma vaade `view` (riigiti) ja `vmode: "scroll"`.
- **Esileht (3.11.2026, Madise valik „Esilehele + 3D tagasi")**: esilehe lõik „Ühine võrk" / „Yhteinen verkko" (ankur `#vork` / `#verkko`) jutustab nüüd sama loo: nupud 1–7, korraga üks küsimus → järelduslause → suur arv → allikas; seitsmendas kihis „Küsi tasuta hindamist". Lauaarvutis on kaart paremal 3D-laval nagu v39-s (kuldsed punktid, helendavad liinid, sügavus hiirega), telefonis ja reduced-motion'iga lõigu sees nuppude all; telefonis jäävad nupud kerimisel üles. „Võrdle Soomega / Vertaa Viroon" ja link „Kogu kaart, faktid ja allikad" → /vork/, /verkko/. Plokk genereeritakse samast andmefailist (`build_page.py`, märgid `kartta-etusivu:alku … kartta-etusivu:loppu`); `verify-pages` kontrollib järeldusi ka esilehel. FI todisterea kaks salvestiarvu viidi kaardiga samaks (2 085 MW, Fingrid 2.11.2026; lähes 6 GW, Fingrid 23.10.2026), et samal lehel ei oleks kahte eri arvu.
- **Lehed /vork/ (ET) ja /verkko/ (FI)**: seitse peatükki tavalise kerimisega, tekst kaardist väljas. Iga peatükk = küsimus (h2) → **üks järelduslause** → üks suur arv → faktid allikate ja kuupäevadega → „Soome samal mõõdupuul / Viro samalla mittarilla" (teine riik, definitsioonimärkega) → allikad → nupp „Näita kaardil". Viimane peatükk „Teie liitumine / Teidän liittymänne" on järeldus ja kutse tasuta hinnangule.
- **Kaart**: lauaarvutis kleepub paremale ja vahetab kihti, kui peatükk jõuab ekraani keskele (ainult ≥ 1024 px; ei juhi kerimist). Telefonis on kaart peatükkide kohal, mitte kleepuv; „Näita kaardil" viib kaardini. Kihinupud 1–7, „Võrdle Soomega / Vertaa Viroon", „110 kV" (eraldi kiht, laetakse alles vajutusel), allikas hiire, puute ja klaviatuuriga, kodumaa esil ja teine riik tuhm kuni võrdluseni.
- **Andmed ühes kohas**: `assets/kartta-data.json` — sama fail, mida kasutab esilehe 3D-lava kaart (`scene.js`); vorming ühilduv (id/name/q/cmp/facts/pins), lisatud `concl`, `big`, `pays`, `base`, `fx`, `note`, `sources`, `views`, `next`.
- **Lehe tekst tuleb andmetest**: `python3 scripts/kaart/build_page.py` kirjutab peatükid `src/fi.html` ja `src/et.html` sisse (märkide `kartta:alku … kartta:loppu` vahele). `verify-pages.mjs` kontrollib, et iga kihi järeldus on lehel sama mis andmefailis, failide suurused ja et allikad on olemas.
- **Kaardi alus**: `scripts/kaart/fetch_oim.py` (OpenInfraMapi vektoriplaadid, OSM ODbL) või `fetch_osm.py` (Overpass) → `scripts/kaart/build_map.py` → `assets/kartta-pohja.json` (113 kB, gzip 49 kB: maad, järved, ≥ 220 kV liinid, alalisvool, ≥ 220 kV alajaamad, tuule- ja päikesepargid) ja `assets/kartta-110.json` (73 kB, eraldi). Projektsioon Lamberti koonus (GRS80), sama brauseris ja skriptis.
- **Eelvaated**: `dist-preview/samaenergia-fi-v35-kartta.standalone.html` ja `…-et-…` (kogu sait ühes failis, kaart töötab ilma serverita; lehel `#/verkko` ja `#/vork`).

## Lugu: kuus küsimust ja seitsmes kiht

Iga kihi järeldus on üks lause. ET-leht argumenteerib Eesti arvudega, FI-leht Soome omadega; teine riik on ainult võrdluses (kaardi erand, `00-lahteulesanne.md` p 2).

### 1. Kus võrk on? · Missä verkko on?

- **Järeldus, ET-leht (Eesti):** Eesti põhivõrk – 1 851 km 330 kV ja 3 342 km 110 kV liine – töötab 9. veebruarist 2025 Mandri-Euroopa sünkroonalas ning on ühendatud Soomega kahe alalisvoolukaabli ja Lätiga kolme 330 kV liini kaudu.
- **Johtopäätös, FI-sivu (Suomi):** Kantaverkko siirtää sähköä länsirannikolta ja pohjoisesta, missä on yli 70 prosenttia Suomen sähköntuotannosta, etelään, missä kulutetaan yli puolet sähköstä.
- **Suur arv:** Eesti **1 851 km** – 330 kV liine · lisaks 3 342 km 110 kV · 158 alajaama · Soome **5 400 km** – 400 kV:n johtoja · lisäksi 1 000 km 220 kV ja 7 600 km 110 kV · 138 sähköasemaa (2025)
- **Võrreldavus:** Võrreldav: mõlemad on põhivõrguettevõtja enda liinid ja alajaamad. Eesti 330 kV võrk vastab rollilt Soome 400 kV võrgule.
- **Faktid ja allikad:**
  - Eesti · Põhivõrk: 330 kV 1 851 km · 110 kV 3 342 km · kaablid 284 km · 158 alajaama — [Elering: Elektri ülekandevõrk](https://www.elering.ee/elektri-ulekandevork) · 21.8.2026
  - Eesti · Välisühendused: Soome 1 016 MW mõlemas suunas · Läti kolm 330 kV liini, import kuni 1 300 MW · impordivõimekus kokku 2 165 MW — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Eesti · Sünkroonala: Mandri-Euroopa alates 9.2.2025 — [Elering: Sünkroniseerimine Mandri-Euroopaga](https://www.elering.ee/sunkroniseerimine-mandri-euroopaga) · 5.6.2026
  - Soome · Põhivõrk: 400 kV 5 400 km · 220 kV 1 000 km · 110 kV 7 600 km · alalisvoolukaablid 320 km · 138 alajaama — [Fingrid: Suomen sähköjärjestelmä (luvut 2025)](https://www.fingrid.fi/kantaverkko/kehittaminen/suomen-sahkojarjestelma/) · 2025
  - Soome · Tootmine ja tarbimine: üle 70 % tootmisest läänerannikul ja põhjas · üle 50 % tarbimisest Lõuna-Soomes — [Fingrid: Fingridin selvitys: teollisuuskulutuksen sijoittuminen lähelle sähköntuotantoa lisää kantaverkon liitettävyyttä merkittävästi](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/fingridin-selvitys-teollisuuskulutuksen-sijoittuminen-lahelle-sahkontuotantoa-lisaa-kantaverkon-liitettavyytta-merkittavasti/) · 3.9.2026
  - Soome · Rootsi: põhjapoolne vahelduvvooluühendus 1 900 MW mõlemas suunas alates 1.12.2025 (Aurora Line) · Fenno-Skan 1 ja 2: 400 + 800 MW — [Fingrid: Siirtokapasiteetin määräytyminen Aurora-käyttöönoton jälkeen (sähkömarkkinatoimikunta)](https://www.fingrid.fi/globalassets/dokumentit/fi/yhtio/toimikunnat/markkinatoimikunta/siirtokapasiteetin-maaraytyminen-aurora-kayttoonoton-jalkeen.pdf) · 4.12.2025
  - Soome · Eesti ja Norra: EstLink 1 ja 2: 350 + 650 MW · Norrasse 220 kV ühendus Inarist — [Fingrid: Osa pohjoismaista sähköjärjestelmää](https://www.fingrid.fi/kantaverkko/kehittaminen/pohjoismainen-sahkojarjestelma-ja-liitynnat-muihin-jarjestelmiin/) · luettu 2.11.2026

### 2. Kui palju kasv tuleb? · Kuinka paljon kasvua tulee?

- **Järeldus, ET-leht (Eesti):** Eleringi prognoosis kasvab Eesti aastane elektritarbimine 7,9 teravatt-tunnilt 2025. aastal 10,0 teravatt-tunnini 2030. aastaks ja 11,2 teravatt-tunnini 2035. aastaks, ning tiputarbimise rekord tõusis 5. veebruaril 2026 1 723 megavatini.
- **Johtopäätös, FI-sivu (Suomi):** Fingridin skenaarioissa Suomen sähkönkulutus kasvaa nykyisestä alle 90 terawattitunnista 106–123 terawattituntiin vuoteen 2030 mennessä, ja jo solmitut datakeskusten ja sähkökattiloiden liittymissopimukset lisäisivät toteutuessaan kulutusta jopa 40 prosenttia.
- **Suur arv:** Eesti **10,0 TWh** – aastane tarbimine 2030 Eleringi prognoosis · 2025: 7,9 TWh · Soome **106–123 TWh** – sähkönkulutus 2030 Fingridin skenaarioissa · 2025: 84,6 TWh
- **Võrreldavus:** Osaliselt võrreldav: mõlemad on riigi aastane elektritarbimine, kuid Fingrid annab stsenaariumide vahemiku ja Elering ühe prognoosi. Tipu prognoosi avaldab ainult Elering.
- **Faktid ja allikad:**
  - Eesti · Prognoos: 10,0 TWh aastal 2030 · 11,2 TWh aastal 2035 (2025: 7,9 TWh) — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Eesti · Tiputarbimine: rekord 1 723 MW 5.2.2026 · prognoos külmal talvel 1 924 MW aastal 2030 — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Eesti · Import: 37 % tarbimisest kaeti 2025. aastal impordiga — [ERR (Eleringi andmed): Eestis tõusis mullu elektritarbimine protsendi võrra](https://www.err.ee/1609922156/eestis-tousis-mullu-elektritarbimine-protsendi-vorra) · 26.1.2026
  - Soome · Tarbimine 2025: 84,6 TWh (+1,9 %) — [Fingrid: Fingridin ajankohtaiset, neuvottelukunta](https://www.fingrid.fi/globalassets/dokumentit/fi/yhtio/toimikunnat/neuvottelukunta/nk126_fingridin-ajankohtaiset-4.3.2026.pdf) · 4.3.2026
  - Soome · Prognoos: 106–123 TWh aastal 2030 · 110–162 TWh aastal 2035 — [Fingrid: Sähkön tuotannon ja kulutuksen kehitysnäkymät päivitetty – sähkönkulutuksen kasvu konkretisoituu](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/sahkon-tuotannon-ja-kulutuksen-kehitysnakymat-paivitetty--sahkonkulutuksen-kasvu-konkretisoituu/) · 30.9.2026
  - Soome · Jaanuar–september 2026: 64,8 TWh (+5,0 %) — [Fingrid: Fingrid-konsernin johdon katsaus 1.1.–30.9.2026](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/fingrid-konsernin-johdon-katsaus-1.1.30.9.2026/) · 29.10.2026
  - Soome · Tiputarbimine: rekord 15 553 MW 8.1.2026 kl 17–17.15 — [Fingrid: Fingridin ajankohtaiset, neuvottelukunta](https://www.fingrid.fi/globalassets/dokumentit/fi/yhtio/toimikunnat/neuvottelukunta/nk126_fingridin-ajankohtaiset-4.3.2026.pdf) · 4.3.2026
  - Soome · Liitumislepingud: andmekeskused üle 5 GW · elektrikatlad üle 3 GW · teostumisel kuni +40 % tarbimisele 2025. aasta tasemest — [Fingrid: Liittymissopimushakemusten käsittely ruuhkautunut](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/liittymissopimushakemusten-kasittely-ruuhkautunut/) · 23.10.2026

### 3. Kust tuleb ilmast sõltuv tootmine? · Mistä säästä riippuva tuotanto tulee?

- **Järeldus, ET-leht (Eesti):** Eestis on Eleringi andmetel 694 MW tuule- ja 1 214 MW päikesevõimsust, ning Balti põhivõrguettevõtjad näevad taastuvenergia lisandumise tõttu sagedusreservide vajaduse kiiret kasvu.
- **Johtopäätös, FI-sivu (Suomi):** Fingridin ennusteissa Suomen verkossa on 9 553 MW tuulivoimaa ja 2 074 MW aurinkovoimaa, ja Fingridin mukaan sääriippuvaisen tuotannon rinnalle tarvitaan lisää säätövoimaa ja joustoa.
- **Suur arv:** Eesti **1 214 MW** – päikeseenergiat · tuuleenergiat 694 MW · installeeritud netovõimsus 2025 · Soome **9 553 MW** – tuulivoimaa · aurinkovoimaa 2 074 MW · Fingridin ennusteiden kapasiteetit 2.11.2026
- **Võrreldavus:** Osaliselt võrreldav: Soome arvud on Fingridi prognoosides kasutatud võimsused (hinnang, mitte ametlik statistika, 2.11.2026), Eesti arvud Eleringi installeeritud netovõimsus 2025.
- **Faktid ja allikad:**
  - Eesti · Tuuleenergia: 694 MW — [Elering: Eesti elektrisüsteemi varustuskindluse aruanne 2025](https://eleringweb.cdn.prismic.io/eleringweb/E2ycOv1JSD1PO4Ow_Elering_VKA_2025_veeb-1.pdf) · 9.12.2025
  - Eesti · Päikeseenergia: 1 214 MW · +245 MW aastaga — [Elering: Eesti elektrisüsteemi varustuskindluse aruanne 2025](https://eleringweb.cdn.prismic.io/eleringweb/E2ycOv1JSD1PO4Ow_Elering_VKA_2025_veeb-1.pdf) · 9.12.2025
  - Eesti · Taastuvenergia 2025: 68 % kodumaisest toodangust · 41 % tarbimisest — [ERR (Eleringi andmed): Eestis tõusis mullu elektritarbimine protsendi võrra](https://www.err.ee/1609922156/eestis-tousis-mullu-elektritarbimine-protsendi-vorra) · 26.1.2026
  - Soome · Tuuleenergia: 9 553 MW — [Fingrid, avoin data: Tuulivoimaennusteessa käytetty kokonaiskapasiteetti (aineisto 268)](https://data.fingrid.fi/datasets/268) · 2.11.2026
  - Soome · Päikeseenergia: 2 074 MW, sisaldab väiketootmise hinnangut · ametlikku kogusummat Fingrid ei avalda — [Fingrid, avoin data: Aurinkovoimaennusteessa käytetty kokonaiskapasiteetti (aineisto 267)](https://data.fingrid.fi/datasets/267) · 2.11.2026
  - Soome · Liidetud 2025: 1 509 MW tuule- ja päikeseenergiat — [Fingrid: Fingridin ajankohtaiset, neuvottelukunta](https://www.fingrid.fi/globalassets/dokumentit/fi/yhtio/toimikunnat/neuvottelukunta/nk126_fingridin-ajankohtaiset-4.3.2026.pdf) · 4.3.2026
  - Soome · Juhitav võimsus: ilmast sõltuva tootmise kõrvale on vaja rohkem juhitavat võimsust ja paindlikkust — [Fingrid: Sähkönkulutus on kääntymässä voimakkaaseen kasvuun – rinnalle tarvitaan lisää säätövoimaa](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/sahkonkulutus-on-kaantymassa-voimakkaaseen-kasvuun--rinnalle-tarvitaan-lisaa-saatovoimaa/) · 18.8.2026
- **Märge kaardil:** Punktid: OpenStreetMapi märgitud tuulepargid ja vähemalt 1 MW päikesejaamad (loetud 2.11.2026). Loetelu ei ole täielik; kogusummad on Fingridi ja Eleringi omad.

### 4. Kes juba salvestab? · Kuka jo varastoi?

- **Järeldus, ET-leht (Eesti):** Eestis on Eleringi teatel võrku ühendatud 245 MW akuvõimsust (veebruar 2026), juulis lisandus Aruküla 100 MW park, ning ministri sõnul on Eleringil lepingus ligi 1 000 MW akusalvesteid.
- **Johtopäätös, FI-sivu (Suomi):** Suomessa on Fingridin arvion mukaan jo 2 085 MW yli megawatin sähkövarastoja ja liittymissopimuksia lähes kuuden gigawatin edestä, mutta Etelä-Suomen kantaverkkoon uusia varastoja liitetään vasta vuonna 2029.
- **Suur arv:** Eesti **245 MW** – akuvõimsust võrgus veebruaris 2026 (Elering) · juulis lisandus Aruküla 100 MW · Soome **2 085 MW** – yli 1 MW:n sähkövarastoja, Fingridin arvio 2.11.2026 · sopimuksia lähes 6 GW
- **Võrreldavus:** Ei ole võrreldav: Soome arv on Fingridi hinnang kõigist üle 1 MW salvestitest. Eestis on Eleringi kogusumma avaldatud ainult uudises, seepärast on kaardil eraldi sildid. Arve ei tohi kokku liita.
- **Faktid ja allikad:**
  - Eesti · Võrgus: 245 MW akuvõimsust (veebruar 2026) — [ERR News (Eleringi andmed): New powerful battery storage facilities to be built in Valga and Pärnu counties](https://news.err.ee/1609943084/new-powerful-battery-storage-facilities-to-be-built-in-valga-and-parnu-counties) · 17.2.2026
  - Eesti · Kiisa: 100 MW · täisvõimsusel veebruaris 2026 — [ERR News: Largest battery park in continental Europe up and running in Estonia](https://news.err.ee/1609931312/largest-battery-park-in-continental-europe-up-and-running-in-estonia) · 4.2.2026
  - Eesti · Aruküla: 100 MW / 200 MWh · avati juulis 2026 · koos Kiisaga 200 MW / 400 MWh — [ERR News: 100 megawatt battery park opened in Harju County](https://news.err.ee/1610072545/100-megawatt-battery-park-opened-in-harju-county) · 8.7.2026
  - Eesti · Jaotusvõrgus: 74 MW 2025. aasta lõpus — [ERR (Elektrilevi andmed): Elektrilevi tahab elektrivõrku 10 aastaga investeerida ligi kaks miljardit](https://www.err.ee/1610114110/elektrilevi-tahab-elektrivorku-10-aastaga-investeerida-ligi-kaks-miljardit) · 19.8.2026
  - Eesti · Lepingutes: ministri sõnul ligi 1 000 MW akusalvesteid Eleringiga (veebruar 2026) — [ERR News: Largest battery park in continental Europe up and running in Estonia](https://news.err.ee/1609931312/largest-battery-park-in-continental-europe-up-and-running-in-estonia) · 4.2.2026
  - Soome · Võrgus praegu: 2 085 MW üle 1 MW salvesteid (hinnang, sisaldab umbes kuu jooksul tööle minevaid) — [Fingrid, avoin data: Sähkövarastojen yhteenlaskettu asennettu kapasiteetti (aineisto 424)](https://data.fingrid.fi/datasets/424) · 2.11.2026
  - Soome · Veebruar 2026: u 1 050 MW · 85 % üksustest alla 2 MW · 56 % jaotusvõrgus · umbes pool Tampere–Lahti–Lappeenranta joonest lõuna pool — [Fingrid: Sähkövarastojen yhteisteho Suomessa jo yli 1 000 MW](https://www.sttinfo.fi/tiedote/71833182) · 24.2.2026
  - Soome · Lepingud ja päringud: liitumislepinguid ligi 6 GW (10/2026) · liitumispäringuid 12 kuuga u 32 GW (6/2026) — [Fingrid: Liittymissopimushakemusten käsittely ruuhkautunut](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/liittymissopimushakemusten-kasittely-ruuhkautunut/) · 23.10.2026
  - Soome · Lõuna-Soome: uued salvestid põhivõrku alles siis, kui Hikiä–Toivila valmib 2029 · Pohjanmaal ja Põhja-Soomes vaba võimsust mitu tuhat megavatti — [Fingrid: Sähkövarastojen liityntärajoitusta jatketaan Etelä-Suomessa](https://www.fingrid.fi/ajankohtaista/tiedotteet/2025/fingrid-varmistaa-siirtokapasiteettia-sahkonkulutuksen-kasvulle-ja-uusille-teollisille-investoinneille---sahkovarastojen-liityntarajoitusta-jatketaan-etela-suomessa/) · 24.9.2025

### 5. Kui palju reserve vajatakse ja kes maksab? · Kuinka paljon reservejä tarvitaan ja kuka maksaa?

- **Järeldus, ET-leht (Eesti):** Balti põhivõrguettevõtjate prognoosis kasvab mFRR-reservi vajadus 2035. aastaks üles 604-lt 754 megavatini ja alla 691-lt 991 megavatini, ning reservide kulu maksab alates 2026. aastast iga tarbija oma elektriarvel 3,73 eurot megavatt-tunni kohta.
- **Johtopäätös, FI-sivu (Suomi):** Fingrid hankkii joka tunti keskimäärin 1 500 MW reservikapasiteettia ja arvioi tarvitsevansa viiden vuoden päästä 1 200 MW lisää, ja reservien kustannukset katetaan tasepalvelumaksuilla, joita Fingrid perii tasevastaavilta.
- **Suur arv:** Eesti **604 → 754 MW** – mFRR üles vajadus Balti juhtimisplokis 2026 → 2035 · alla 691 → 991 MW · Soome **+1 200 MW** – reservikapasiteettia viiden vuoden päästä · nyt keskimäärin 1 500 MW joka tunti (6/2025)
- **Võrreldavus:** Osaliselt võrreldav: Soome arvud on Fingridi riiklikud kohustused ja hange, Eesti vajadus on Balti ühise juhtimisploki (Eesti, Läti, Leedu) dimensioneerimine. Eelkvalifitseeritud võimsus on pakkumine, mitte vajadus.
- **Kes maksab:** Eesti – Iga elektritarbija maksab alates 2026. aastast arvel tasakaalustamisvõimsuse kulu 3,73 €/MWh; raha saavad reserve pakkuvate elektrijaamade omanikud, mitte Elering ega riik. · Soome – Reservide kulud kaetakse bilansiteenuse tasudega, mida Fingrid võtab bilansihalduritelt; tootmise ja tarbimise mahutasu on alates 1.1.2027 0,64 €/MWh.
- **Faktid ja allikad:**
  - Eesti · Balti vajadus: aFRR kuni 120 MW üles / 115 MW alla · mFRR üles 604 → 754 MW · mFRR alla 691 → 991 MW (2026 → 2035) — [Elering, AST, Litgrid: Baltic LFC block FRR dimensioning forecast 2026–2035](https://eleringweb.cdn.prismic.io/eleringweb/UI9Nk_WeQoC984_P_FRR_dimensioning_forecast_2026-2035.pdf) · 29.7.2025
  - Eesti · Kulu: 74 M€ veebruar–detsember 2025 · prognoos 2026: 60 M€ — [Elering: 2025 turu kokkuvõte](https://elering.ee/sites/default/files/2026-02/2025%20turu%20kokkuv%C3%B5te.pdf) · 4.2.2026
  - Eesti · Eelkvalifitseeritud (pakkumine): FCR 76 · aFRR 602 / 685 · mFRR 1 617 / 1 657 MW (oktoober 2026) — [Elering: Sagedusreservide turu kokkuvõtted](https://www.elering.ee/sagedusreservide-turu-kokkuvotted) · 2.11.2026
  - Soome · Hange praegu: keskmiselt 1 500 MW igas tunnis · viie aasta pärast 1 200 MW rohkem — [Fingrid: Reservimarkkinat tutuiksi -webinaari](https://www.fingrid.fi/globalassets/reservimarkkinat-tutuiksi-webinaari-11.6.2025-1.pdf) · 11.6.2025
  - Soome · Kohustused 2026: FCR-N 128 MW · FCR-D üles 309 / alla 298 MW · aFRR u 50 MW · mFRR üles 880–1 300 MW · mFRR alla 575 MW — [Fingrid: Power system reserves: velvoitteet 2026 ja hankintaennuste](https://www.fingrid.fi/en/electricity-market/reserves/power-system-reserves/) · 2026
  - Soome · Hankeprognoos: mFRR alla 567 → 1 100 MW (2026 → 2032) · aFRR üles 44 → 85 MW (2026 → 2028) — [Fingrid: Power system reserves: velvoitteet 2026 ja hankintaennuste](https://www.fingrid.fi/en/electricity-market/reserves/power-system-reserves/) · 2026
  - Soome · 2027: FCR hangitakse ainult tunniturult — [Fingrid: Taajuusohjatun käyttö- ja häiriöreservin hankinta keskitetään tuntimarkkinoille 2027](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/taajuusohjatun-kaytto--ja-hairioreservin-hankinta-keskitetaan-tuntimarkkinoille-2027/) · 8.9.2026

### 6. Mis tuleb? · Mitä on tulossa?

- **Järeldus, ET-leht (Eesti):** Eleringi arengukava arvestab 2030. aastaks kuni 1 500 MW uute tootmisvõimsuste ja 2035. aastaks 1 000–1 300 MW lisanduva salvestusega, ning umbes 2038. aastast kasvatavad EstLink 3 ja Eesti–Läti neljas ühendus impordivõimekust veel 1 200 MW võrra.
- **Johtopäätös, FI-sivu (Suomi):** Fingrid toteuttaa 5,2 miljardin euron investointiohjelmaa, liittymien etusijamenettelyn on määrä tulla voimaan 1.1.2027 ja Etelä-Suomen varastoliitynnät avautuvat, kun Hikiä–Toivila valmistuu vuonna 2029.
- **Suur arv:** Eesti **1 500 MW** – uusi tootmisvõimsusi liitub 2030. aastaks (Eleringi arengukava) · Soome **5,2 mrd €** – Fingridin investointiohjelma · noin 2 mrd € vuosina 2026–2029
- **Võrreldavus:** Suunda näitav: mõlemad on põhivõrguettevõtja plaanid ja liitumisolukord. Soome arvud on lepingud ja päringud, Eesti arvud planeerimise lähteeeldused.
- **Faktid ja allikad:**
  - Eesti · Uus tootmine: kuni 1 500 MW 2030. aastaks — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Eesti · Salvestus 2035: 1 000–1 300 MW lisandub (ENMAK 2035, Eleringi arengukavas) — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Eesti · Salvestid, baasstsenaarium: 600 MW / 1 200 MWh 2030 · 1 500 MW / 3 000 MWh 2035 — [Elering: Eesti elektrisüsteemi varustuskindluse aruanne 2025](https://eleringweb.cdn.prismic.io/eleringweb/E2ycOv1JSD1PO4Ow_Elering_VKA_2025_veeb-1.pdf) · 9.12.2025
  - Eesti · Ühendused: EstLink 3 (700 MW) ja Eesti–Läti neljas ühendus: impordivõimekus +1 200 MW umbes 2038. aastast — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Soome · Valminud: Järvilinja 2: 305 km uusi 400 ja 110 kV liine, kasutusel oktoobrist 2026 — [Fingrid: Järvilinja 2 otettiin käyttöön](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/jarvilinja-2-otettiin-kayttoon---vahvempi-kantaverkko-tukee-ita-suomen-investointeja/) · 26.10.2026
  - Soome · Järgmisena: Hikiä–Toivila 2029 · Metsälinja 2 Vaala–Jämsä, u 350 km, 2030 — [Fingrid: Metsälinja 2 -voimajohtoyhteys vastaa sähköistyvän Suomen tarpeisiin](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/metsalinja-2--voimajohtoyhteys-vastaa-sahkoistyvan-suomen-tarpeisiin/) · 29.9.2026
  - Soome · Eelisjärjekord: liitumiste eelisjärjekorra menetlus, kavandatud jõustumine 1.1.2027 — [Fingrid: Liittymissopimushakemusten käsittely ruuhkautunut](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/liittymissopimushakemusten-kasittely-ruuhkautunut/) · 23.10.2026
  - Soome · Nõudlus: liitumispäringud 12 kuuga: tarbimine u 68 GW, salvestid u 32 GW, tootmine u 13 GW — [Fingrid: Fingrid-konsernin puolivuosikatsaus 1.1.–30.6.2026](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/fingrid-konsernin-puolivuosikatsaus-1.1.30.62.2026/) · 23.7.2026

### 7. Kus on selles pildis teie liitumine? · Missä teidän liittymänne on tässä kokonaisuudessa?

- **Järeldus, ET-leht (Eesti):** Teie liitumine on juba olemas: selle taha paigaldatud aku ei vaja uut põhivõrguliitumist, ja sellega saab alandada võimsustasu, kasutada börsihinna erinevusi ning osaleda agregaatori kaudu reserviturul, mille kulu maksab praegu iga tarbija.
- **Johtopäätös, FI-sivu (Suomi):** Teidän liittymänne on jo olemassa: sen taakse asennettu akku ei jonota kantaverkkoon, ja sillä voi laskea tehomaksua, hyödyntää pörssisähkön hintaeroja ja osallistua aggregaattorin kautta reservimarkkinoille, joiden tarve kasvaa.
- **Suur arv:** Eesti **3,73 €/MWh** – reservide kulu iga tarbija arvel 2026 · raha saavad reservide pakkujad · Soome **32 GW** – sähkövarastojen liityntäkyselyjä Fingridille 12 kuukaudessa · hakemusten käsittely ruuhkautunut 10/2026
- **Faktid ja allikad:**
  - Eesti · Kes maksab: 3,73 €/MWh igal arvel 2026; raha reservide pakkujatele — [Elering: Tasakaalustamisvõimsuse kulu](https://www.elering.ee/tasakaalustamisvoimsuse-kulu) · 29.6.2026
  - Eesti · Reservide vajadus: mFRR üles 604 → 754 MW, alla 691 → 991 MW (2026 → 2035) — [Elering, AST, Litgrid: Baltic LFC block FRR dimensioning forecast 2026–2035](https://eleringweb.cdn.prismic.io/eleringweb/UI9Nk_WeQoC984_P_FRR_dimensioning_forecast_2026-2035.pdf) · 29.7.2025
  - Eesti · Tiputarbimine: rekord 1 723 MW 5.2.2026 — [Elering: Eesti elektriülekandevõrgu arengukava 2026–2035](https://elering.ee/sites/default/files/2026-07/Eesti%20elektri%C3%BClekandev%C3%B5rgu%20arengukava%202026-2035_0.pdf) · 9.7.2026
  - Soome · Põhivõrk: liitumislepingu taotluste menetlus on ummikus, kõiki ei jõuta sel aastal menetleda — [Fingrid: Liittymissopimushakemusten käsittely ruuhkautunut](https://www.fingrid.fi/ajankohtaista/tiedotteet/2026/liittymissopimushakemusten-kasittely-ruuhkautunut/) · 23.10.2026
  - Soome · Lõuna-Soome: uue suure tarbimise põhivõrguliitumine piiratud 2025–27 · uued salvestid põhivõrku 2029 — [Fingrid: Sähkönkulutuksen liitettävyys kantaverkkoon väliaikaisesti tiukilla eteläisessä Suomessa](https://www.fingrid.fi/ajankohtaista/tiedotteet/2025/sahkonkulutuksen-liitettavyys-kantaverkkoon-valiaikaisesti-tiukilla-etelaisessa-suomessa/) · 21.1.2025
  - Soome · Reservid: vajadus kasvab viie aastaga 1 200 MW — [Fingrid: Reservimarkkinat tutuiksi -webinaari](https://www.fingrid.fi/globalassets/reservimarkkinat-tutuiksi-webinaari-11.6.2025-1.pdf) · 11.6.2025

## Arvude kontroll (2.11.2026)

Iga `kartta-data.json`-i arv on avatud allika vastu kontrollitud (allikas avatud kas 2.11.2026 või sama päeva varasemas töös; tsitaadid on töömaterjalides). Muudatused võrreldes v39-ga:

| # | Oli (v39) | On nüüd | Allikas | Miks |
|---|---|---|---|---|
| 1 | EE tiputarbimise rekord 1 595 MW (4.1.2024) | **1 723 MW (5.2.2026)** | Elering, arengukava 2026–2035, 9.7.2026 | uus rekord; vana oli aegunud |
| 2 | FI–Rootsi „AC 1 500 MW import" (Siirtojenhallinta 2024) | **SE1–FI 1 900 MW mõlemas suunas alates 1.12.2025** | Fingrid, sähkömarkkinatoimikunta 4.12.2025 | Aurora Line muutis võimsust |
| 3 | Norra „~120 MW" | ainult „220 kV ühendus Inarist" | Fingrid, Osa pohjoismaista sähköjärjestelmää | MW-arvu ei leitud Fingridi allikast |
| 4 | FI salvestid ~1 050 MW (24.2.2026) | **2 085 MW** (+ veebruari arv faktina) | Fingrid avaandmed 424, 2.11.2026 | uuem; definitsioon: hinnang kõigist > 1 MW turuloaga salvestitest, sh umbes kuu jooksul tööle minevad |
| 5 | FI salvestite liitumislepingud „üle 4 GW" (18.8.2026) | **ligi 6 GW** | Fingrid 23.10.2026 | uuem |
| 6 | FI „päringud üle 100 GW, kolmandik andmekeskused" (29.10.2026) | **päringud 12 kuuga: tarbimine u 68 GW, salvestid u 32 GW, tootmine u 13 GW** | Fingrid poolaastaülevaade 23.7.2026 | 29.10.2026 ülevaates GW-arvu ei ole; „kolmandik andmekeskused" käib > 50 liitumislepingu kohta |
| 7 | FI tuul 9 433 MW (Suomen Uusiutuvat 31.12.2025) | **9 553 MW** | Fingrid avaandmed 268, 2.11.2026 | põhivõrguettevõtja allikas nagu Eestis; märge: prognoosi võimsus, mitte ametlik statistika |
| 8 | FI päike „n. 1,2 GW alkuvuonna 2025" | **2 074 MW + märge** | Fingrid avaandmed 267, 2.11.2026 | **Brief eeldas, et Fingrid ei avalda.** Fingrid avaldab prognoosis kasutatava hinnangu (sh kodude ja ettevõtete väiketootmine), kuid ütleb ise, et see ei ole ametlik koguvõimsus. Lehel on mõlemad: arv ja „virallista kokonaislukua Fingrid ei julkaise" |
| 9 | EE salvestid: Hertz 1 Kiisa, Hertz 2 Aruküla | **Eleringi kogusumma 245 MW (veebruar 2026) + eraldi sildid Kiisa 100 MW, Aruküla 100 MW / 200 MWh, jaotusvõrk 74 MW, lepingutes ligi 1 000 MW** | ERR News 17.2.2026 (Eleringi kommunikatsioon), ERR News 4.2.2026, 8.7.2026, ERR 19.8.2026 | Eleringi kogusumma leiti uudisest; Eleringi veebis seda ei ole. Projektinimed „Hertz" asendatud kohanimedega (Eleringi arengukava kasutab samuti „Kiisa ja Aruküla akusalvestid") |
| 10 | EE nõudlus „mFRR üles u 600 MW" | **Balti juhtimisploki vajadus: mFRR üles 604 → 754 MW, alla 691 → 991 MW (2026 → 2035), aFRR kuni 120/115 MW** | Elering, AST, Litgrid 29.7.2025 | 600 MW on Balti ploki (EE + LV + LT) vajadus, mitte Eesti oma |
| 11 | EE eelkvalifitseeritud FCR 26 · aFRR 197/297 · mFRR 572/976 (10/2025) | **FCR 76 · aFRR 602/685 · mFRR 1 617/1 657 MW (10/2026)** | Elering, sagedusreservide turu kokkuvõtted, 2.11.2026 | uuem; märge „pakkumine, mitte vajadus" |
| 12 | EE tarbimine 8,3 TWh → prognoos 10,0 TWh | **7,9 → 10,0 → 11,2 TWh (sama tabel)**; 8,3 TWh eemaldatud | Elering, arengukava, tabel 3.1 | 8,3 TWh (ERR) ja 7,9 TWh (arengukava) on erineva definitsiooniga; kasv näidatakse ühe allika sees |
| 13 | EstLink 3 silt Ida-Virumaal (27,9° E) | **Loode-Eesti** | Elering, EstLink 3, 10.6.2026 | randumiskoht Loode-Eestis |
| 14 | sõlmed Olkiluoto, Loviisa, Kemijoki; „Pohjanmaa · tuulivoima 9 433 MW" | eemaldatud; „Tuulivoima 9 553 MW (koko Suomi)" | — | ilma allikata, ei vasta küsimusele; koguarv ühe punkti juures eksitas |
| 15 | FI 2026 kohustused 128/309/298 vs hange 126/≤305/≤293 | **mõlemad õiged, eri mõiste** | Fingrid, Power system reserves (tabel 2026); Fingrid 1.9.2025 | kohustus ≠ aastaturu hange |

Kontrollitud ja muutmata: FI põhivõrk 5 400/1 000/7 600 km ja 138 alajaama (Fingrid 2025); EE 1 851/3 342 km ja 158 alajaama (Elering 21.8.2026); FI 84,6 TWh +1,9 % ja rekord 15 553 MW (Fingrid 4.3.2026); FI prognoos 106–123 / 110–162 TWh (30.9.2026); EE tuul 694 MW, päike 1 214 MW (VKA 2025, tabel 2.6); EE 68 % / 41 % taastuvat, 37 % import (ERR/Elering 26.1.2026); EE reservikulu 74 M€ (veebr–dets 2025) ja prognoos 60 M€ 2026 (Elering 4.2.2026); 3,73 €/MWh (Elering 29.6.2026); EstLink 1/2 350/650 MW; EstLink 3 700 MW, 2038–2040; salvestite baasstsenaarium 600 MW / 1 200 MWh 2030 ja 1 500 MW / 3 000 MWh 2035 (VKA 2025).

**Lisatud** (uued, kontrollitud): Fingrid 3.9.2026 (> 70 % tootmisest lääne-/põhjaosas, > 50 % tarbimisest lõunas); 1 509 MW tuul + päike liitunud 2025; Fingridi reservid keskmiselt 1 500 MW tunnis ja + 1 200 MW viie aasta pärast (11.6.2025); hankeprognoos 2026–2036; FCR 2027 ainult tunniturult (8.9.2026); bilansiteenuse mahutasu 0,64 €/MWh 1.1.2027 (27.10.2026); Järvilinja 2 (26.10.2026), Metsälinja 2 (29.9.2026), etusijamenettely 1.1.2027 (23.10.2026); Eleringi arengukava: kuni 1 500 MW uut tootmist 2030, ENMAK 2035 salvestus 1 000–1 300 MW, impordivõimekus + 1 200 MW umbes 2038; Eesti–Läti 4. ühendus Paide–Lihula–Saaremaa (Elering 10.6.2026).

**Puudub (allikas ei avalda, lehel märgitud):** Soome päikese ametlik koguvõimsus; Eesti salvestite ametlik kogusumma Eleringi veebis (ainult uudises, 2/2026); Soome tiputarbimise prognoos; Eesti eraldi reservivajadus (ainult Balti plokk); andmekeskuste ja salvestite liitumislepingute asukohad (Fingrid ei anna — kaardil ainult sildid, mitte punktid); ELTS § 71 lg 10¹ salvestite võrgutasu reegel jäi lehelt välja (ei kuulu kuue küsimuse hulka; uuringus E18).

## OSM-valimi kontroll (kaart vs Fingridi ja Eleringi avalikud kaardid ja arvud)

| Pinge | OSM kaardil | Ametlik | Suhe | Selgitus |
|---|---|---|---|---|
| FI 400 kV | 5 714 km | 5 400 km (Fingrid 2025) | 106 % | OSM-is on ka 2025–2026 valminud liinid (Aurora Line 11/2025, Järvilinja 2 10/2026) ja mõni paralleelahel eraldi |
| FI 220 kV | 1 075 km | 1 000 km | 108 % | sama |
| FI 110 kV | 15 714 km | 7 600 km (Fingridi osa) | 207 % | OSM-is on ka jaotusvõrguettevõtjate 110 kV liinid → eraldi kiht ja märge kaardil |
| EE 330 kV | 1 683 km | 1 851 km (Elering 21.8.2026) | 91 % | z7-plaatide üldistus kaotab lühikesi lõike; uued 330 kV alajaamad Rehemäe ja Mustaru puuduvad OSM-ist nime järgi (Sopi on olemas) |
| EE 110 kV | 2 447 km + 72 km kaablit | 3 342 km | 75 % | sama + osa liine OSM-is märkimata |
| Alajaamad | FI ≥ 220 kV 80 · EE 330 kV 15 | Fingrid 138 · Elering 158 (kõik pinged) | — | kaardil põhikihis ≥ 220 kV; 110 kV kihis FI 746 (sh jaotusvõrk) ja EE 146 |

Visuaalne võrdlus: **Eleringi ülekandevõrgu kaart (2026)** — OSM-i 330 kV võrk ühtib: Harku–Kiisa–Aruküla–Rakvere–Püssi–Balti/Viru, Kiisa–Paide–Mustvee–Tartu, Lihula–Sindi–Kilingi-Nõmme–Riia, Tartu–Tsirguliina–Valmiera, Saaremaa ja Muhu 110 kV. **Fingridi põhivõrgu arengukava kaart (12/2025)** — 400 kV põhja–lõuna koridorid, läänerannik ja Lapi 220 kV (sh Inari–Norra) ühtivad.

Punktide kontroll: EstLink 1 Harku–Espoo ja EstLink 2 Püssi–Anttila — OSM-i kaablitrassid ja randumisalajaamad vastavad Eleringi ja Fingridi kirjeldusele; kaardil joonistub trass OSM-ist, silt ja allikas TSO-lt. Kiisa (330 kV alajaam 24,701° E 59,243° N) ja Aruküla (25,041° E 59,361° N) — akupargid on märgitud alajaama koordinaatidele. Hikiä (24,919° E 60,749° N) ja Toivila (25,129° E 61,893° N) — OSM-i alajaamad. Lõuna-Soome salvestite piirang 2029: Fingrid ei avalda piirkonna täpset piiri → kaardil Hikiä–Toivila liin ja tekst, mitte polügoon. „Pool salvestitest Tampere–Lahti–Lappeenranta joonest lõunas" → skemaatiline ala teadaande sõnastuse järgi. Tuule- ja päikeseparkide punktid OSM-ist on poolikud (FI: 72 tuuleparki, märgitud võimsus 4 254 MW 9 553 MW-st) — märge kaardil. OSM-i akumärgised (FI 5, EE 1) jäeti välja.

## Interaktsioon ja jõudlus

- **SVG, mitte canvas** (brief ütles „canvas, ≤ 2 kaadrit sekundis"): kui midagi ei liigu, ei joonista leht üldse (0 kaadrit); objektid on DOM-is, nii et hiir, puude, Tab ja allika näitamine töötavad ilma tabamuse arvutuseta; terav igal suumil. /verkko/ ei lae enam 3D-mootorit `scene.js` (146 kB, gzip 39 kB) — kaardimoodul on 26 kB (gzip 8,5 kB). Esilehe lava kasutab edasi `scene.js`-i ja sama andmefaili.
- **Kerimine (4.11.2026)**: kerimise kuulaja (passiivne, `requestAnimationFrame`) valib peatüki, mille ülaserv on lugemisjoonest möödas (arvutis ekraani keskel, telefonis kinnitatud kaardi all oleva tekstiala ülemises kolmandikus); kihivahetus animeerub 520 ms; viimases peatükis vaade = kodumaa → objekt geomeetriliselt (laius `a·(b/a)^t`), `t` = kerimine peatüki 60 % ulatuses; reduced-motion: kohe lõppvaade.
- **Laadimine**: tekst kõigepealt; /vork/-, /verkko/-lehel laeb kaart, kui see on 600 px kaugusel nähtavast alast või brauser on jõude (≤ 2,5 s); esilehel ainult siis, kui lõik läheneb (kontroll 2.11.2026: telefonile ei laeta kaardiandmeid, kui lugeja lõiku ei jõua); 110 kV laetakse koos alusega ja on vaikimisi nähtav (4.11.2026).
- **Liikumine**: vaate vahetus 380 ms; `prefers-reduced-motion`: kohe, ilma üleminekuteta; „teie objekt" pulss 4 korda ja seisma.
- **Telefon**: puudutus näitab allikat, teine puudutus peidab; `touch-action: pan-y` (leht kerib normaalselt); kihinupud keritavad ja aktiivne nupp tuleb nähtavale.
- **Klaviatuur ja ligipääs**: kihinupud on nupud (`aria-pressed`), kaardi sildid Tab-iga, Esc sulgeb; „i" näitab allikat lingiga; kõik arvud on ka tekstis; pealdis `aria-live`.
- **3D-välimus ilma perspektiivita (3.11.2026)**: kaks SVG-d üksteise peal — all maa punktidena (rannik, järved), peal võrk, kihtide objektid ja sildid. Hiirega liigub ülemine kiht kuni 7 px rohkem kui maa (sügavus) ja lava ise parallaksiga; see on ainult 2D-nihe oma kihil, brauser ei joonista kaarti uuesti. CSS-perspektiiv (`perspective` + `rotateX`) jäeti välja: Chromium jättis selle all osa kihivahetuse muudatustest joonistamata (Playwright: lõunapoolsed sildid puudusid, ilma perspektiivita olemas).
- **Mitu kaarti ühes dokumendis**: igal `[data-kartta]` plokil oma mootor ja SVG-tunnused (`km0-…`, `km1-…`); kaks korda laetud skript ei käivita plokki uuesti (eelvaates on esileht ja /vork/ samas failis). `python3 scripts/build-standalone.py v35-kartta verkko,vork` → eelvaade avaneb otse kaardilõigul.
- **Punktid**: punktobjekt (salvesti, teie objekt) võidab ala, kui hiir või sõrm on 22 px kaugusel; kaherealised sildid on vihjes ja ekraanilugejas üherealised.
- **Kontroll** (Playwright 1440 × 900 ja 390 × 844, FI ja ET, esileht ja /vork/ /verkko/): konsoolis vigu ei ole, horisontaalset ületäitu ei ole, iga nähtav silt on kuvatõmmisel joonistatud (pikslikontroll), puudutus näitab vihjet, reduced-motion kasutab lõigusisest kaarti, eelvaade töötab mõlemal lehel.
- **Mahud**: `kartta-pohja.json` 113 kB (gzip 49 kB), `kartta-110.json` 73 kB (gzip 28 kB, ainult nupu peale), `kartta-data.json` 58 kB (gzip 14 kB), `kartta.js` 34 kB ja `kartta.css` 17 kB (esilehel ja /vork/-, /verkko/-lehel; ei suurenda `site.css`-i eelarvet; `verify-pages` piirid 36 ja 20 kB).

## Uuendamise kord (kord kvartalis)

Järgmine: **1.2.2027**, seejärel mai, august, november. Erakorraliselt: Fingridi või Eleringi teade liitumislepingutest, salvestitest või tariifist; uus suur salvesti Eestis; etusijamenettely jõustumine (1.1.2027).

1. **Fingrid**: avaandmed 268, 267, 424 (viimane väärtus) → kiht 3 ja 4; uudised liitumislepingutest ja salvestitest; kvartali- ja aastaülevaade (Q4 veebruaris–märtsis); kehitysnäkymät (september); Power system reserves (kohustused ja hankeprognoos, uueneb kord aastas); bilansiteenuse hinnad.
2. **Elering**: sagedusreservide turu kokkuvõtted (igakuine; tabelid 1–4); elektri ülekandevõrk; arengukava (juuli); varustuskindluse aruanne (detsember); tasakaalustamisvõimsuse kulu (muutub poolaastase etteteatamisega); EstLink 3 ja Eesti–Läti 4. ühenduse lehed.
3. **Muuda** `assets/kartta-data.json`: väärtus, `s` (allikas tekstina), `src` (allika id), `sources` (kuupäev, URL), vajadusel `concl` ja `big`; tõsta `date` ja `next`.
4. **OSM** (kord aastas või suurema muutuse järel): `python3 scripts/kaart/fetch_oim.py` (või `fetch_osm.py`) → `python3 scripts/kaart/build_map.py --ne <natural-earth-kaust>`; pohjafail peab jääma alla 150 kB (skript katkestab).
5. `python3 scripts/kaart/build_page.py` → `node scripts/build-pages.mjs` → `node scripts/verify-pages.mjs` → `python3 scripts/build-standalone.py vNN` → kuvatõmmised → commit (fail + kuupäev); FI/ET tekstimuutustele natiivkontroll.

## Viis silmatorkavat võrdlust (müügile ja esilehele)

Iga turg oma arvudega; viies on ainult „Ühine võrk" kaardi jaoks (võrdlus ongi selle sisu).

1. **FI — järjekord vs park.** Fingridile tuli 12 kuuga u **32 GW** salvestite liitumispäringuid (23.7.2026) — **15 korda** Soome praegune salvestusvõimsus **2 085 MW** (Fingrid avaandmed 2.11.2026). FI: „Varastojen liityntäkyselyt ovat 15-kertaiset nykyiseen varastokantaan verrattuna — olemassa oleva liittymä on etu."
2. **FI — kaheksa kuuga kahekordne.** Üle 1 MW salvestid: **980 MW** (Fingrid 24.2.2026) → **2 085 MW** (Fingridi hinnang 2.11.2026, sh umbes kuu jooksul tööle minevad). Märge: veebruari arv on teadaanne, novembri arv avaandmete hinnang.
3. **EE — maksjast saajaks.** Iga tarbija maksab 2026. aastal reservide eest **3,73 €/MWh**; ettevõte, mis tarbib aastas 1 GWh, maksab u **3 730 €** aastas (+ km) — ja Elering annab selle raha täies mahus reservide pakkujatele (Elering 29.6.2026). Akuga objekt saab olla pakkuja poolel (agregaatori kaudu; tulu modelleeritud, mitte lubadus).
4. **EE — vajadus kasvab.** Balti ploki mFRR-alla vajadus kasvab 2035. aastaks **43 %** (691 → 991 MW) ja mFRR-üles **25 %** (604 → 754 MW) (Elering, AST, Litgrid 29.7.2025); Eesti tiputarbimise rekord tõusis 5.2.2026 **1 723 MW-ni**, eelmine rekord 2024. aasta algusest oli alla 1 600 MW (Elering 9.7.2026).
5. **Ühine võrk — mõõtkava.** Soome tarbimise kasv aastaks 2030 (84,6 → 106–123 TWh, ehk + 21–38 TWh, Fingrid) on **2,6–4,6 korda** Eesti kogu aastane tarbimine (8,3 TWh, Elering/ERR 26.1.2026) — mõlemad brutotarbimine koos kadudega.

## Avatud küsimused ja otsused

1. **Tehniline valik**: SVG canvas'e asemel (põhjendus eespool). Kui on vaja tagasi canvas'ele, on andmefail ühilduv `scene.js`-iga.
2. **Elektrilevi** on nimetatud andmeallikana (jaotusvõrguettevõtja, 74 MW salvesteid jaotusvõrgus; ERR 19.8.2026). Teisi ettevõtete nimesid lehel ei ole; „Hertz" asendati kohanimedega. Esilehel on veel „Hertz 1 Kiisa" (esilehe vestlus).
3. **Esilehe kaardiplokk** on 3.11.2026 andmetest (vanad staatilised read ja lülitid on läinud). Kui esileht ehitatakse ümber täislaiuses sektsioonideks (brief p 5.1), töötab sama plokk ilma lavata: kaart läheb lõigu sisse (`.km-inline`); laial ekraanil on siis vaja kahe veeru paigutust (tekst + kaart). `assets/kartta.json` ja `assets/kartta-verkko.json` (v39 lõuendikaart `scene.js`-is) ei ole enam ühelgi lehel kasutusel — eemaldada koos `scene.js`-i kaardikoodiga, kui esilehe vestlus seda ei vaja.
4. **Reaalajas andmed** vajaksid Netlify funktsiooni (Fingridi avaandmete API võtmega, Eleringi andmed), mis kirjutaks sama domeeni JSON-i — brauser ei teeks kolmanda osapoole päringuid (CSP `connect-src 'self'` kehtib). Eraldi otsus; seni kord kvartalis.
5. **site.css**: kõik vanad kaardireeglid (`.map-full`, `.mp-*`) on nüüd kasutamata — eemaldamine vabastab eelarvet.
6. **Natiivkontroll**: kõik uued FI ja ET laused (järeldused, faktid, kaardi sildid) enne main'i.
7. **Reservituru leht**: sisend on `docs/kaart/reservid-sisend.md` (ülesanne 5), mitte esilehe kaart.
