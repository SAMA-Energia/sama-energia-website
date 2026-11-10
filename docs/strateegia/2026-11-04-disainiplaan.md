# SAMA veebilehe disainiplaan

4.11.2026 · haru v35-uusi-ilme · ehitusspetsifikatsioon vestlusele D · visuaalne versioon: Claude'i artefakt „SAMA disainiplaan"

Plaan ehitab v41 esilehe (commit b3e4f4f) ja sõnumistrateegia (docs/strateegia/2026-11-02-sonumistrateegia.md) peale. Öö ja kuld, 3D-objekt ja päris andmetega kaart jäävad. Muutub see, mida need kolm pilti ütlevad, lehe järjekord ja pikkus.

## 1. Nägu

Kolm visuaalset tööriista, igaühel üks töö: 3D seletab, mis objektil kus seisab; kaart seletab, mis turul ja võrgus toimub; foto näitab, kes vastutab.

1. **Kuldne joon.** Üks õhuke kuldne joon tähendab liitumist: heros arvestist masti, kalendris ajajoon, kaardil võrk, protsessis nelja sammu side, vormis lõpeb nupul.
2. **Öö ja paber.** Öö = turg (võrk, süsteemihaldur, suured arvud, kaart, 3D). Paber = teie objekt (teie samm, hinnang, inimesed, vorm). Rütm: hero öö · muutus paber · väärtus öö · kaart paber · võrk öö · kuidas paber · kellele paber-1 · miks öö · KKK paber · vorm öö.
3. **Arvu anatoomia.** Newsreaderi number, ühik, üks lause, allikarida kuupäevaga; alati sama kuju.
4. **Pealkiri on lause.** Newsreader, üks kuldne kursiivfraas. Ei eyebrow-silte, ei numbrimarkereid peale protsessi.
5. **Kuld on vähe.** Nupud, kursiivfraas, joon, numbrid. Suurt kuldset pinda ei ole. Signaalroheline ainult kaardil ja graafikutel, tähendab andmeid.
6. **Mõõtkavas ja päris.** 3D mõõtkavas, ilma eraldi inverterita, ilma eramuteta; kaart päris andmetest; inimesed päris inimesed. Stock-fotosid inimestest ei ole.

## 2. Värvid (site.css tokenid)

Tuletatud logo gradiendist #E8D193 → #C7A45C → #97752F.

| Token | Väärtus | Kasutus |
|---|---|---|
| --night | #0B0B0A | öö taust |
| --night-1 | #141310 | öö kaardid ja moodulid |
| --night-2 | #1D1B16 | väljad, pildiraamid ööl |
| --night-line | rgba(232,209,147,.16) | jooned ööl |
| --snow / --snow-2 / --snow-3 | #F3EEE2 / #C8C0AE / #948C7D | tekst, lead, allikarida ööl |
| --paper / --paper-1 / --paper-2 | #F7F3EA / #EFE8D8 / #E6DEC9 | paberi taust, tint, väljad |
| --paper-line | #D6CDB6 | jooned paberil |
| --ink / --ink-2 / --ink-3 | #1C1A15 / #4D483E / #6F6859 | tekst, lead, allikarida paberil (ink-3 ainult paper ja paper-1 peal) |
| --gold-1 | #E8D193 | kuldne joon ööl |
| --gold-2 | #D9BC7E | kursiivfraas ööl |
| --gold-3 | #C7A45C | nupp, brändi kuld |
| --gold-4 | #97752F | kursiivfraas paberil, ainult ≥ 24 px |
| --gold-5 | #6E5321 | väike kuldne tekst paberil (lingid, numbrid) |
| --signal | #6FB0A0 | andmed kaardil ja graafikutel ööl; paberil #275F54 |

Kontrast (WCAG): snow/night 17,0; snow-3/night-2 5,2; gold-3/night 8,3 (must tekst kuldsel nupul 8,3); ink-3/paper-1 4,5; gold-4/paper 3,9 (ainult suur kursiiv); gold-5/paper-1 5,9; signal/night 7,9. Praegune site.css kuld #C9A227 ja öö #0E1726 asenduvad (otsus 1).

## 3. Kiri

Newsreader (pealkirjad, suured arvud; 400, kursiiv kuldse fraasi jaoks) + IBM Plex Sans (kõik muu). Mõlemad ise hostitud.

| Roll | 1440 | 390 | Reegel |
|---|---|---|---|
| Hero pealkiri | 56 / 1,04 | 36 / 1,08 | Newsreader 400, üks kuldne kursiivfraas |
| Ploki pealkiri | 44 / 1,08 | 30 / 1,1 | sama |
| Suur arv | 72 / 1 | 44 / 1 | Newsreader, tabelnumbrid, ühik Plex 16 |
| Lead | 21 / 1,5 | 18 / 1,5 | Plex 400, max 62 tähte real |
| Tekst | 17 / 1,6 | 16 / 1,6 | Plex 400, max 72 tähte real |
| Allikarida | 13,5 / 1,45 | 13 / 1,45 | snow-3 või ink-3, alati kuupäevaga |
| Nupp | 16 / 600 | 16 / 600 | kuldne pill, must tekst |

## 4. Esileht ekraanide kaupa

Tekstid sõnumistrateegiast (ET 593, FI 567 sõna). Siht: arvutis u 6 500 px (v41 9 547), telefonis u 9 500 px (v41 13 976). Nähtavad sõnad ≤ 650.

| # | Plokk | Režiim | Visuaal | Mis muutub v41-st |
|---|---|---|---|---|
| 0 | Hero | öö | 3D S1 taustal (mitte veerus); pealkiri A1 (või lukus), juhtlõik L1, süsteemihalduri arv allikaga, nupp liitumise kontroll, telefon | eramud ja koduaku stseenist välja; tekst tavalises sisuveerus; telefonis tekst enne, still pärast, telefoninumber nupu all; ≤ 1 ekraan, järgmine plokk paistab |
| 1 | Muutus | paber | kolm kuupäeva ühel kuldsel joonel (EE 1.1.2026, 1.6.2026, 1.9.2026; FI 1.1.2027, 2029, 1.1.2029), igal lause ja allikas; pilti ei ole | uus plokk, asendab „kolm asja" loetelu |
| 2 | Väärtus | öö | aku päeva 24 h riba (S3), olekud hiirel/puutel ≤ 400 ms, telefonis staatiline; neli kaarti: valmisolek, võimsustasu, börsihind, varutoide | reserv esimeseks; riba esilehele |
| 3 | Kaart | paber | vasakul viis asja hinnangus; paremal kirjaliku hinnangu esimene lehekülg dokumendina (anonüümne; kuni näidishinnangut ei ole, struktuur ilma arvudeta) | uus plokk, asendab „kolm asja, mida saate tellida" |
| 4 | Ühine võrk | öö | kaardimoodul täislaiuses: küsimus → kiht → arv → allikas; kodumaa kuldne; „Võrdle"; link /vork ja /verkko | praegune väike lülititega paneel → täisplokk oma loogikaga (ptk 5) |
| 5 | Kuidas see käib | paber | neli sammu kuldsel joonel, tasuta ja mahaarvestus märgitud; foto: elektrik kaameraga peakilbi juures (kuni fotot ei ole, S5 still) | viis sammu → neli |
| 6 | Kellele | paber-1 | neli küsimusekaarti, igal 3D-vinjett mõõtkavas (S4: kuivati, külmladu, ärihoone, päikesepark); kaart = link alamlehele | kaardid algavad omaniku küsimusega |
| 7 | Miks SAMA | öö | kolm lauset; kolm päris portreed sama valguse ja taustaga, nimi ja roll; link Meist | portreed esilehele |
| 8 | KKK | paber | neli küsimust, kõik suletud, vastused tugevusest | 11 → 4; „rehelliset / ausad" pealkiri välja |
| 9 | Vorm | öö | pealkiri, mida teilt on vaja (üks asi), mis juhtub kahe tööpäevaga; viis üherealist välja, kuldne nupp, telefon ja e-post tekstina | kuldne joon lõpeb nupul |

## 5. Ühine võrk: kaardimoodul

Olemas (assets/kartta-pohja.json, kartta-verkko.json, kartta-110.json, kartta-data.json, kartta.js): Natural Earthi rannajooned, OSM 400/330 kV liinid, 220 kV, HVDC, 74 alajaama, 110 kV eraldi failis (75 kB), tuule- ja päikesejaamad, seitse kihti ET ja FI tekstiga ja allikatega.

| # | Küsimus | Mida kaart joonistab | Arv ja allikas | Seis |
|---|---|---|---|---|
| 1 | Kus võrk on? | 400/330, 220, 110 kV (lüliti), HVDC, alajaamad; lisa planeeritud liinid katkendlikuna (Hikiä–Toivila 2029; EstLink 3), Aurora Line 1 900 MW alates 12/2025 | FI 5 400 km 400 kV (Fingrid 2025); EE 1 851 km 330 kV (Elering) | olemas; planeeritud liinid lisada |
| 2 | Kui palju kasv tuleb? | lisa tarbimine piirkonniti proportsionaalsete ringidena (FI maakunnad failis olemas; EE maakonnad lisada); andmekeskuste lepingud ilma asukohata | FI alla 90 → 106–123 TWh 2030 (Fingrid); EE 7,9 → 10,0 TWh 2030 (Elering 9.7.2026); piirkonniti Tilastokeskus / Statistikaamet | piirkonnakiht lisada |
| 3 | Kust tuleb ilmast sõltuv tootmine? | tuul ja päike OSM-ist (olemas); lisa liigiti: tuum (Olkiluoto, Loviisa), hüdro (Kemijoki), koostootmine, Narva ja Auvere; iga liik oma kujuga, suurus MW | FI tuul 9 553 MW, päike 2 074 MW (Fingridi prognoosivõimsus 2.11.2026); EE tuul 694, päike 1 214 MW (VKA 2025) | liigid lisada |
| 4 | Kes juba salvestab? | avalikult teada suured salvestid punktidena; kogusumma arvuna | FI 2 085 MW (Fingrid avoin data 424); EE 245 MW võrgus (Elering, ERR 17.2.2026) + Aruküla 100 MW | olemas |
| 5 | Kui palju reserve vajatakse ja kes maksab? | sünkroonalade piir Soome lahel, kaablid, mis seda ületavad; arvud küljel | FI 1 500 MW igal tunnil, +1 200 MW viie aastaga (Fingrid 11.6.2025); EE Balti mFRR 604 → 754 MW 2035, 3,73 €/MWh (Elering) | olemas |
| 6 | Mis tuleb? | lisa võrgu areng kolme seisuna „Praegu · 2029 · 2035" (katkendlik = planeeritud) | Fingrid põhivõrgu arenguplaan; Elering arengukava | ajaseisud lisada |
| 7 | Kus on teie liitumine? | näidismarker kitsas piirkonnas; järeldus: liitumine on olemas, salvesti ei vaja uut põhivõrguliitumist | sõnumistrateegia, plokk 7 | olemas |

Legend: kuldne täis joon 400 kV (FI) ja 330 kV (EE); õhuke kuldne 220 ja 110 kV; katkendlik HVDC; punktid alajaamad; signaalrohelised ringid tuulepargid, kuldsed ruudud päikesepargid (suurus = MW). Teine riik tuhm kuni „Võrdle".

Interaktsioon: küsimus on nupp (vahetab kihi, järelduse, arvu); hiir või sõrm elemendil näitab allika; „Võrdle" toob teise riigi sama definitsiooniga või ütleb, kus definitsioon erineb; jõudeolekus null joonistust; reduced-motion ilma üleminekuteta; klaviatuuriga läbitav. Telefon: kaart ruut ekraani laiuses, küsimused kerivad horisontaalselt kaardi kohal, arv ja allikas all; andmed laaditakse ploki lähenedes. Andmed: staatilised JSON-failid, kuupäev lehel, allikate loend lehe lõpus, uuendus kord kvartalis; reaalajas voogu ei ole (Netlify funktsioon eraldi otsus). Reeglid: iga arv allika ja kuupäevaga; reservihindade langust ei tõsteta esile; eelkvalifitseeritud võimsus on pakkumine, mitte turuosa.

## 6. 3D

Stiil: v41 realistlik isomeetria, sama kaamera kõigis stseenides (30° dimeetria), soe öövalgus, kuld ainult liitumise elementidel (kilp, kaabel, mõõtmine, mast). Mõõtkava: hall 8 m, akukapp 2,4 m, inimene 1,8 m, trafo ja mõõtmine 2 m, mast 14 m. Ainult ettevõtte objektid (ei eramut, ei koduakut). Ei drooni: inimesed ja kaamera. Inverter kapi sees. Stseenil ei ole teksti; sildid tulevad HTML-ist.

| Stseen | Kus | Mida seletab | Tekst, mida kannab |
|---|---|---|---|
| S1 Objekt | hero | mis ettevõtte objektil seisab ja kuidas see liitumisega seotud on | hero pealkiri ja juhtlõik; hiirel sildid: peakilp, salvesti, liitumispunkt ja mõõtmine, võrk |
| S2 Kihid | Energiasalvestid | põhivõrgust elemendini; mis on kelle oma, kus on arvesti | alamlehe peatükid tavakerimisega |
| S3 Aku päev | väärtus (esileht), Reserviturg | kuidas üks seade teeb ööpäevas mitut tööd | neli olekut: laeb, katab tipu, hoiab reservi, annab välja |
| S4 Neli objekti | kellele | kuivati, külmladu, ärihoone, päikesepark samas mõõtkavas | omaniku esimene küsimus |
| S5 Protsess | kuidas see käib (kuni fotot ei ole) | elektrik kaameraga peakilbi juures | neli sammu |
| S6 Võrgust elemendini | Reserviturg | süsteemihaldur, agregaator, objekt | hangib, opereerib, integreerib |

Tootmine: arvutis scene.js (6A.6) hiirele reageeriva parallaksiga kuni 12 px, sildid hiirel, ilma kerimisjuhtimiseta, laeb pärast teksti; telefonis ja reduced-motioniga WebP-still ≤ 40 KB stseeni kohta (v41 teeb ≤ 750 px). S4 ja S5 renderdatakse samast mootorist stillideks.

## 7. Liikumine ja kiirus

Üleminek ≤ 400 ms, ease-out; ei kerimisjuhtimist ega lava-loogikat; hiirele reageerib ainult 3D-taust ja kaart; sektsioonid loetavad kohe (ei opacity 0); prefers-reduced-motion: kõik staatiline; telefonis stillid, null animatsiooni. Siht: LCP ≤ 2,5 s telefonis, CLS ≤ 0,1, INP ≤ 200 ms. v41 LCP 3,6 s, piirajaks Newsreaderi kaks muutuvfonti (129 + 144 KiB): fondid alamhulgaks (ladina + ladina laiendatud, 400 ja kursiiv) pyftsubset-iga, siht ≤ 45 KiB kokku; hero-still ≤ 40 KB; kaardi andmed laetakse ploki lähenedes; CSS-eelarve 76 KB jääb.

## 8. Ehitus neljas etapis

Iga etapp omaette commit harule, standalone-eelvaade, kuvatõmmised 1440 ja 390.

1. **Sõnad ja järjekord** (src/fi.html, src/et.html, assets/site.css, assets/scene.js sildid): hero pealkiri ja juhtlõik Madise valiku järgi; eramud ja koduaku stseenist välja; muutuse plokk kalendrina; väärtusploki järjekord reserv esimeseks; kaardiplokk dokumendi raamiga (arvudeta); võrgu moodul täislaiuses; kellele-kaardid küsimustega; KKK neli; vorm; nähtavad sõnad ≤ 650; telefonis telefoninumber esimesel ekraanil; palett site.css-is (otsus 1).
2. **Pildid** (assets): S3 aku päev ribana esilehel; S4 neli vinjetti mõõtkavas; S5 elektrik kaameraga; portreed ja objektifoto fotosessioonilt (Martin, Viljar, Madis sama valguse ja taustaga; elektrik peakilbi juures; üks objekt väljast); hinnangu näidislehekülg, kui näidishinnang on olemas.
3. **Kaart** (assets/kartta-*.json, kartta.js): tootmine liigiti; tarbimine piirkonniti; võrgu areng kolme seisuna; planeeritud liinid katkendlikuna; 110 kV lüliti; Aurora Line. Iga uus arv registrireaga.
4. **Alamlehed ja kiirus**: kihid ja aku nädal Energiasalvestid lehele peatükkidena; Meetod leht; Liitumise kontroll leht (kui strateegia otsus 3 on kontroll); fondid alamhulgaks; Lighthouse mobiil ≥ 90, LCP ≤ 2,5 s.

## 9. Otsused (Madis)

1. **Öö toon.** Soe must #0B0B0A logo kullaga (soovitus; v41 näeb juba nii välja) või praeguse site.css öö #0E1726.
2. **Hero 3D.** Mootor arvutis hiirele reageerivana ja still telefonis (soovitus) või ainult stillid kõikjal.
3. **Kaart esilehel.** Täismoodul seitsme küsimusega (soovitus) või teaser kahe arvuga ja link /vork lehele.
4. **Fotod.** Kas fotosessioon tehakse ja kes on pildil (kolm portreed, elektrik peakilbi juures, üks objekt).
5. **Aku päev esilehel.** 24 h riba väärtusplokis (soovitus) või ainult Reserviturg lehel.

Hero pealkirja ja selgroo otsused: docs/strateegia/2026-11-02-sonumistrateegia.md, peatükk 7.

## Allikad

Repo haru v35-uusi-ilme (docs/brief, docs/kaart/lugu.md, assets/kartta-*.json, docs/kontroll/2026-11-02-audit.md, 4.11.2026); sõnumistrateegia 2.11.2026; energiasammas 11.10.2026; logofailid claude/brand/logo; Nielsen Norman Group, Scrolling and Attention (15.4.2018). Kaart: Natural Earth (public domain), OpenStreetMap contributors (ODbL 1.0), loetud 2.11.2026.
