# Esilehe loogika v39 — põhjendatud ettepanek (02.11.2026)

Allikad: `2026-11-02-konversio-b2b.md` (konversiooniuuring) ja `2026-11-02-fingrid-elering.md` (andmestik). Iga väide allpool viitab neile.

## Kokkuvõte

- Lava (kerimisega juhitav 3D-lavastus) esilehelt maha. 3D jääb paremale püsiva, hiirele reageeriva taustana, mis vahetab stseeni sektsiooni kaupa, aga ei juhi kerimist ega kanna teksti.
- Sügavad selgitused (kihid, 6A.4 etapid, aku päev) alamlehtedele; esilehelt viib sinna kirjeldav link + staatiline eelvaade, ja „Mida pakume" kaartidelt „Loe lähemalt".
- Kaart saab oma andmeloogika: kuus kihti, iga kiht vastab ühele kliendi küsimusele, Fingrid ja Elering sama definitsiooniga või sildiga, kui definitsioon erineb. Täiskaart lehel /vork (FI /verkko), esilehel kolm kihti oma turu numbritega.
- Esileht 3 003 sõnalt (ET v38) 500–800 sõnale.

## 1. Mida tõendid ütlevad ja mida see meile tähendab

1. 57 % vaatamisajast kulub esimesele ekraanile, 74 % kahele esimesele (NN/g silmajälgimine, 130 000 fikseeringut, 2018). → Esimene ekraan kannab sõnumit, tõendit ja CTA-d. 3D ei saa olla see, mis sõnumi kannab.
2. Kerimisega juhitav animatsioon: enamik kasutajaid kaotas orientatsiooni, osa lahkus või laadis lehe uuesti; kõige rohkem häiris see ülesandele keskendunud kasutajaid; mobiilis hullem (NN/g, scrolljacking, 8/2023). Meie ostja on omanik/CFO, kes tuli kontrollima, kas see tasub — just see sihtrühm. Sellepärast lava esilehel ei toimi.
3. Parallaks: 86 inimese kontrollitud katses tõusis ainult „lõbus"; kasutatavus, rahulolu ja visuaalne meeldivus ei muutunud; 2 inimest 86-st said iiveldust (Frederick jt, J. of Usability Studies, 2/2015). → 3D taust on brändi ja tähelepanu element, mitte veenmise element. Kasutame, aga ei looda sellele.
4. Avaldatud uuringut, kus 3D- või kerimisanimatsioon tõstaks B2B-liidide konversiooni, ei ole. See on lünk, mitte tõend vastupidisest — aga ehitame nii, et konversioon ei sõltu sellest.
5. Kiirus: 53 % mobiilikülastajaist lahkub, kui leht laeb üle 3 s (Google/SOASTA 2017); LCP −31 % → müük +8 % (Vodafone, web.dev). JS, CSS ja pildibaidid on LCP ebaõnnestumise tugevaimad ennustajad (HTTP Archive 2021). → 3D laeb pärast teksti; mobiilis staatiline kaader; `prefers-reduced-motion` austatud.
6. Konkreetne arv võidab üldsõna: „auhinnatud, täielikult integreeritud" → täpsed arvud andis CTR +20,9 % (MarketingExperiments 2010); numbrid tõmbavad skaneerivat silma (NN/g 2007). 73 % 3 500 otsustajast usaldab andmepõhist mõttejuhtimist rohkem kui turundusmaterjali; 86 % kutsuks selle tegija hankesse (Edelman–LinkedIn 2024). → Kaart Fingridi ja Eleringi numbritega on usalduse mootor. See on kaardi koht esilehel.
7. Kulu läbipaistvus on B2B ostjale tähtsaim 28 infoliigist (NN/g 2006); 451 ostjast 25 % pani selle esikohale (Clutch 2020). → „Mida hinnang sisaldab, mis on tasuta, mis maksab" esilehele.
8. Tundmatud logod ei jää meelde (CXL, N=1 153, 2016). → Partnereid esilehel mitte esile tõsta (sinu 02.11 otsus) on tõenditega kooskõlas. Nende asemel andmed.
9. Sihtrühmapõhine navigatsioon on „tavaliselt problemaatiline": inimesed ei oska end liigitada ja kardavad parema pakkumise maha magada (NN/g 2015). → „Kellele" jääb, teisejärgulise teena.
10. Akordion sobib KKK-le ja mobiilile; peidetud sisu jäetakse vahele (NN/g 2014; Baymard 2014). → „Loe lähemalt" sügavusele, mitte põhisõnumile.
11. Vorm: üherealised väljad konversiooni peaaegu ei langeta, tekstialad ja rippmenüüd langetavad (HubSpot, 40 000 lehte); B2B hinnapäring vähemate väljade + usaldusmärkidega +262 % (MarketingExperiments 2012). Telefon nähtav: Stanfordi usaldusjuhised; 58 % B2B ostjaist eelistab telefoni (KoMarketing 2013, vana).
12. Ostugrupp on 6–10 inimest, igaüks kogub 4–5 infotükki ise; müüjaga kulub 17 % ajast (Gartner). → Alamlehed on need, mida CFO-le edasi saadetakse. Sügav selgitus alamlehel ei ole peidus — see on müügitööriist.
13. Pikkus: Unbounce 2024 (41 000 lehte, 57 mln konversiooni) — konversioon kõrgeim 275–745 sõna juures, sõnade arv korreleerub −18,6 %; SaaS-i demo-leht lühendatuna +65 % broneeringuid (CXL). V38 ET esileht: 3 003 sõna. FI: 2 908.

## 2. Esilehe järjestus ja põhjendus

Parem veerg: üks püsiv 3D-lava (sticky), mis vahetab stseeni sektsiooni vahetudes (300 ms ülesulamine, mitte kerimisega seotud kaadrid), reageerib hiirele (parallaks, esiletõst), ei juhi kerimist, ei sisalda teksti. Mobiilis: hero juures üks staatiline kaader, edasi tekst. Laeb pärast teksti.

1. **Hero.** Vasakul h1 (energiasõltumatus), üks lause: mida teeme ja kellele; CTA „Telli tasuta objektihinnang"; telefon. Paremal objekt mõõtkavas (hall, salvesti, paneelid). Järgmine sektsioon paistab ekraani alt — 6/8 kasutajast ei kerinud täisekraani-herost edasi (NN/g 2016).
2. **Tõendiriba.** 3–4 oma turu numbrit allikaga. ET: 8,3 TWh tarbimist 2025 (Elering); 10,0 TWh 2030 (arengukava 7/2026); Hertz 1+2 200 MW / 400 MWh (ERR 2026); reservide eest maksti 2025 74 M€ (Elering 2/2026). FI: 84,6 TWh (Fingrid 4.3.2026); 106–123 TWh 2030 (Fingrid 30.9.2026); ~1 050 MW salvesteid võrgus (Fingrid 24.2.2026); üle 4 GW salvestite liitumislepinguid (Fingrid 18.8.2026).
3. **Teadmatus → liitumine on vara.** Lühike, numbritega, ilma reklaamiomadussõnadeta (objektiivne keel +27 % kasutatavust, NN/g). 3D: liitumispunkt ja võrk.
4. **Mida pakume.** Kolm astet: Hinnang (tasuta; mida sisaldab) / Salvesti + mitmeturuteenus / Portfell. Iga kaart → „Loe lähemalt" alamlehele; seal avanevad sügavad 3D-selgitused. 3D: kihid (päike, salvesti, laadimine).
5. **Ühine võrk.** Kaart, kolm kihti (võrk, tarbimise kasv, salvestid), oma turu kolm numbrit; link „Vaata kogu kaarti" → /vork. 3D-lava näitab siin kaarti.
6. **Kuidas see käib.** Neli sammu, kes mida teeb: SAMA integreerib, agregaator opereerib.
7. **Kellele.** Segmendikaardid → alamlehed.
8. **Miks SAMA.** Tiimi päris portreed, aadress, registrikood. Päris portreesid vaadati 10 % kauem kui 316 % suuremaid biosid (NN/g 2010).
9. **Reserviturg.** Kirjeldav link + staatiline eelvaade alamlehest (infolõhn, NN/g 2003). Mitte „Loe lähemalt".
10. **KKK.** Akordion, vähesed võtmeküsimused.
11. **Vorm.** Viis üherealist välja: nimi, ettevõte, telefon, e-post, liitumise suurus (kW). Kohustuslikku tekstiala ei ole. Kõrval telefon, e-post, „mis juhtub järgmisena ja millal".

Sõnade eelarve 500–800. Üks põhi-CTA läbi lehe (1 link 13,5 % vs 3 linki 10,5 %, 18 639 lehte, 2018 — korrelatiivne).

## 3. Kaardi loogika — Fingrid ja Elering kõrvuti

Kaardi küsimus: „Mis toimub ühises võrgus ja kus on selles teie liitumise koht?" Kuus kihti, igaüks vastab ühele küsimusele:

| # | Kiht | Küsimus | Eesti (Elering) | Soome (Fingrid) | Võrreldav |
|---|---|---|---|---|---|
| 1 | Võrk | Kus võrk on? | 330 kV 1 851 km, 110 kV 3 342 km, 158 alajaama; EstLink 1+2 1 016 MW (arengukava 9.7.2026) | 400 kV 5 400 km, 220 kV 1 000 km, 110 kV 7 600 km, 138 alajaama (Fingrid 2025) | jah; 330 kV EE ≈ 400 kV FI roll |
| 2 | Tarbimine | Kui palju kasv tuleb? | 8,3 TWh 2025 → 10,0 (2030) → 11,2 (2035); tipp 1 924 MW 2030 (arengukava 7/2026) | 84,6 TWh 2025 → 106–123 (2030) → 110–162 (2035) (Fingrid 30.9.2026); rekord 15 553 MW 8.1.2026 | jah, brutotarbimine |
| 3 | Tootmine | Kust tuleb ilmast sõltuv tootmine? | tuul 694 MW, päike 1 214 MW (VKA 12/2025) | tuul 9 433 MW (Suomen Uusiutuvat 31.12.2025); päike ~1,2 GW 2025 alguses + 403 MW liitunud 2025 (Fingrid) | osaliselt; FI päikese kogusummat Fingrid ei avalda — kaart ütleb seda |
| 4 | Salvestid | Kes juba salvestab? | Hertz 1 Kiisa 100 MW + Hertz 2 Aruküla 100 MW / 200 MWh (ERR 3.2. ja 7.7.2026); jaotusvõrgus 74 MW (Elektrilevi 19.8.2026) | ~1 050 MW ühendatud; 85 % üksustest alla 2 MW; 56 % jaotusvõrgus (Fingrid 24.2.2026) | ei — EE-l puudub ühtne kogusumma; eraldi sildid |
| 5 | Reservid | Kui palju vajatakse ja kes maksab? | mFRR üles nõudlus ~600 MW; eelkvalifitseeritud FCR 26, aFRR 197/297, mFRR 572/976 MW (Elering 12/2025); kulu 74 M€ 2025, 3,73 €/MWh igal arvel (Elering 2/2026) | 2026 kohustused FCR-N 128, FCR-D üles 309 / alla 298, aFRR ~50, mFRR üles 880–1 300 MW (Fingrid 2026) | osaliselt — FI kohustus, EE nõudlus + pakkumine; sildid ütlevad |
| 6 | Tulevik | Mis tuleb? | 1 500 MW uut tootmist 2030-ks; salvestite baasstsenaarium 600 MW / 1 200 MWh (2030), 1 500 / 3 000 (2035); EstLink 3 700 MW 2038–40 (arengukava) | andmekeskused ~5 GW, salvestid >4 GW, elektrikatlad >3 GW liitumislepinguid (Fingrid 18.8.2026) | jah, TSO lepingud ja plaanid |

Lõppkiht „Teie liitumine": kliendi objekt punktina; kihid kokku näitavad, miks liitumine koos salvestiga on vara.

Turueraldus: ET-lehel on Eesti aktiivne ja numbrid Eleringist; Soome on joonistatud ja nupp „Võrdle Soomega" avab Fingridi numbrid samas kihis. FI-lehel vastupidi. „Ühine võrk" on päris (EstLink 1+2) ja iga turg argumenteerib oma numbritega.

Täpsus: Natural Earthi rannajoon jääb, aga liinid ja alajaamad tulevad päris andmetest — 400 kV (FI) ja 330 kV (EE) liinid ja alajaamad OpenStreetMapist (ODbL, viide kaardi all), lihtsustatud; EstLink 1 (Harku–Espoo) ja EstLink 2 (Püssi–Anttila) päris trassidena; Hertz Kiisa ja Aruküla punktidena; Fingridi „pool salvestitest Tampere–Lahti–Lappeenranta joonest lõunas" tsoonina; Lõuna-Soome salvestite liitumispiirang kuni 2029 (Fingrid 26.9.2025) sildina.

Otsused, mille tegin: FI tarbimine 84,6 TWh (Fingrid, mitte Energiateollisuuse 85); FI tipp = rekord 15 553 MW 8.1.2026, sildistatud; EE prognoos arengukavast 7/2026 (uuem kui VKA 12/2025: 10,4 / 12,2 TWh), sildistatud. Reservihindade langus (EE mFRR üles 43,90 → 8,46 €/MW/h) jääb kaardilt välja — see kuulub reserviturulehele modelleeritud vahemikuna koos nõudluse kasvuga, mitte esilehe kaardile.

Reaalajas andmed: Fingridil ja Eleringil on avatud API-d, aga leht lubab „ei kolmanda osapoole skripte" ja ehitus keelab välisressursid. Kaart kasutab allikastatud arve kuupäevaga, uuendus kvartalis andmefailist. Reaalajas voog nõuaks Netlify funktsiooni — asutajaotsus, mitte kiireloomuline.

## 4. Mis v38-st jääb, mis muutub

Jääb: 3D-mootor ja stseenid, logo kuld, kinnitatud tekstid (hero-rida ja ingress 09.09, tuluvood, sammud, kipu-, segmendi-, miks-, KKK- ja vormisektsioonid), kaardi kihid, partnerite mitte-esiletõstmine, alamlehtede struktuur.

Muutub: lava → sektsioonipõhine lava (ei juhi kerimist; mobiilis staatiline); sügavad selgitused alamlehtedele; tõendiriba juurde; vorm viie väljaga; sõnade arv alla 800; kaart kuue kihi ja andmefailiga; /vork ja /verkko lehed.

## 5. Mida mõõdame

1. Vormi saatmise määr sessiooni kohta, seadme ja keele kaupa; lagi 6,1 % (Unbounce 2024, professionaalsed teenused).
2. Kerimissügavus 25/50/75/100 % ja osakaal, kes jõuab vormini; langus kohe hero järel = vale põrand (NN/g 2016).
3. Core Web Vitals mobiilis 3D-ga: LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (CrUX / Search Console).
4. Alamlehed: klikid esilehelt, väljumised selgituse sees, kas selgituse lugejad konverteeruvad paremini.
5. Liidi kvaliteet: ≥ 100 kW ja otsustaja osakaal; kõned jälgitava numbri kaudu vs vorm; aeg esimese kontaktini.

Leht lubab „ei analüütikat". Netlify Analytics on serveripõhine (ei skripti, ei küpsist) ja sobib 1., 3. (koos Search Console'iga) ja 5. mõõtmiseks; 2. ja 4. nõuavad esimese osapoole skripti — asutajaotsus.

## 6. Kaks kohta, kus tõendid varasemale otsusele vastu räägivad

- Päise CTA välja (07.09.2026). Murdejoone ja kleepuva navigatsiooni tõendid (NN/g 2015, 2023; Smashing 2012: ülesanded 22 % kiiremad) toetavad väikest püsivat CTA-d + telefoni. Soovitan sisse.
- „Hero ilma graafikuta" (09/2026) ja „3D paremal kerides" (11/2026) sobivad kokku ainult nii, et 3D on taust ilma tekstita ja ilma kerimisjuhtimiseta. Seda ettepanek teebki.

## 7. Ehitusjärjekord

1. Kaardi andmefail (`assets/kartta-data.json`: kihid, arvud, allikad, kuupäevad) + liinid OSM-ist + /vork ja /verkko lehed.
2. Esileht FI v39 (sektsioonipõhine lava, tõendiriba, vorm, sõnade eelarve).
3. Esileht ET v39.
4. Alamlehtede 3D-selgitused (kihid, 6A.4 etapid, aku päev) tavakerimisega peatükkidena.
5. Kontroll: telefonilaius, LCP ilma 3D-ta ja 3D-ga, verify-pages, standalone-eelvaated, kuvatõmmised.

Kõik uued FI/ET tekstid natiivkontrolli.
