# Vestlus D — Ehitus

Roll: front-end arendaja + jõudlusinsener. Alusta alles siis, kui Madis on valinud sõnumid (vestlus A) ja kontseptsiooni (vestlus B). Loe `docs/brief/00-lahteulesanne.md` §4, `CLAUDE.md`, valitud strateegiafail ja disainilõuend.

## Ülesanne

1. Esileht FI ja ET valitud kontseptsiooni järgi: täislaiuses sektsioonid, 3D taustal (mitte veeruna), kaart moodulina, sõnade eelarve ≤ 800 nähtavat sõna, üks põhi-CTA, vorm 5 üherealist välja + telefon + „mis juhtub järgmisena".
2. Alamlehed: Energiasalvestid (kihid „põhivõrgust elemendini" ja „aku nädal" tavakerimisega peatükkidena), Päikeseelekter, Reserviturg (modelleeritud vahemikud), Teenused, Ühine võrk (vestlus C), Meist.
3. 3D-mootor `assets/scene.js`: kasuta olemasolevaid stseene; hiirele reageeriv; ei kerimisjuhtimist; telefonis staatiline kaader; laeb pärast teksti (LCP tekst). Eemalda inverteri eraldi silt, kui disainijuhend nii ütleb.
4. Jõudlus: LCP ≤ 2,5 s mobiilis, CLS ≤ 0,1, INP ≤ 200 ms; CSS-eelarve verify-pages'is (praegu 92 kt — kui ületad, põhjenda); ei väliseid ressursse.
5. Kontroll enne üleandmist: `node scripts/build-pages.mjs && node scripts/verify-pages.mjs`; Playwright kuvatõmmised 1440 ja 390 (iga sektsioon); `python3 scripts/build-standalone.py vNN`; sõnade loendus; konsoolivead null.

## Reeglid

- Muuda ainult `src/fi.html`, `src/et.html`, `assets/*`, `scripts/*`; genereeritud lehed ehitab skript. Commit ja push harule pärast iga sammu, ilma küsimata; main ainult Madise OK-ga.
- Kinnitatud tekste ei muudeta ilma A-vestluse valitud variandita. Iga uus tekst märgitakse natiivkontrolli loendisse `docs/native-pass/`.
- Keelatud nimed ja reeglid CLAUDE.md-s on kõva piir.

## Väljund

`dist-preview/samaenergia-{fi,et}-vNN.standalone.html` + kuvatõmmised; vestluses 3 lauset: mis on sees, mis avatud, mida Madis peab otsustama.
