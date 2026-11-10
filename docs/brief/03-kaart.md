# Vestlus C — Ühine võrk: kaart ja andmed

Roll: andmeajakirjanik + kartograaf + front-end. Loe `docs/brief/00-lahteulesanne.md`, `docs/tutkimus/2026-11-02-fingrid-elering.md` ja repo failid `assets/kartta-data.json`, `assets/kartta-verkko.json`, `assets/scene.js` (`_mapDraw`), lehed `/vork/` ja `/verkko/` (src/et.html, src/fi.html, `id="p-verkko"`).

## Ülesanne

1. Kaardi lugu lõpuni: kuus küsimust (Kus võrk on? Kui palju kasv tuleb? Kust tuleb ilmast sõltuv tootmine? Kes juba salvestab? Kui palju reserve vajatakse ja kes maksab? Mis tuleb?) → iga kihi üks järeldus ühe lausega ET ja FI → lõppkiht „Teie liitumine" kui järeldus. Kirjuta see `docs/kaart/lugu.md` ja vii /vork ja /verkko lehele peatükkidena (tavakerimine, ei scrolljacking; tekst väljaspool kaarti).
2. Andmed: kontrolli iga arv `kartta-data.json`-is allika vastu, täienda puuduvad (FI päikese kogusumma — ütle, et Fingrid ei avalda; EE salvestite kogusumma — eraldi sildid), lisa 220 kV (FI) ja 110 kV valikuliselt eraldi kihina, kui see jääb alla 150 kB. Andmete uuendamise kord: kvartalis, fail + kuupäev, allikate loend lehel.
3. Täpsus: liinid ja alajaamad on OSM-ist (ODbL) — kontrolli valimit Fingridi ja Eleringi avalike võrgukaartide vastu; EstLink 1/2 trassid, Hertz Kiisa/Aruküla, Lõuna-Soome salvestite piirang 2029, andmekeskuste/salvestite liitumislepingud (ilma asukohtadeta, kui allikas neid ei anna).
4. Interaktsioon: kihinupud, hiirega allikas, „Võrdle" nupp, telefonis puutega; kodumaa esile, teine riik tuhm; jõudlus (canvas, ≤ 2 kaadrit sekundis, kui midagi ei liigu; reduced-motion).
5. Reserviturule: Elering mFRR/aFRR/FCR nõudlus ja hinnad 2025–2026 ning Fingridi 2026 kohustused → reserviturulehe modelleeritud vahemike sisend (koos vestlusega A), mitte esilehe kaardile.

## Reeglid

- Iga arv allikas + kuupäev; sama definitsioon mõlemal maal või silt, kui mitte. Reservihindade langust ei tõsteta esile; nõudluse kasv ja „kes maksab" küll.
- Ei väliseid skripte ega reaalajas päringuid (lehe lubadus „ei kolmanda osapoole skripte"); kui reaalajas voog on vajalik, kirjelda Netlify funktsiooni plaan eraldi otsuseks.
- Commit ja push harule pärast iga sammu, ilma küsimata; main ainult Madise OK-ga.

## Väljund

Töötav /vork ja /verkko leht (standalone eelvaade + kuvatõmmised desktop/telefon), `docs/kaart/lugu.md`, uuendatud andmefailid; vestluses 5 „silmatorkavat võrdlust", mida esileht ja müük saavad kasutada.
