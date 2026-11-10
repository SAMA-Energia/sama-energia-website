#!/usr/bin/env python3
"""
SAMA alasivut — tuotevalikoima (perustajan päätös Madis 9.11.2026: "Foto, tootja, mudel, põhinäitajad":
tuotteen kuva, valmistaja, malli ja päätiedot valmistajan datalehdeltä lähteineen). Kirjoittaa valikoiman
src/fi.html- ja src/et.html-tiedostoon merkkien  <!-- tuotteet:<lohko>:alku … -->  ja  <!-- tuotteet:<lohko>:loppu -->  väliin.

Säännöt (CLAUDE.md):
  * jokaisella luvulla on lähde ja päivä (datalehti/versio tai tuotesivu + lukupäivä);
  * valmistajan nimi vain, jos se on sallittu kyseisellä sivustolla (D1 7.11.2026: Ralos, Elecnova, EP Energy,
    Avant Power molemmilla); EP Equipment -nimeä ei näytetä missään (vartija nimet-1104);
  * varavoima on aina ehdollinen: valikoiman alla oleva huomautus sanoo, että varmennetut piirit suunnitellaan
    kohteittain; ei toimitusaikoja viikkoina, ei hintoja.
Kuvat: assets/tuotteet/<id>.webp (600×600; lähteet CLAUDE.md:ssä v53-kohdassa).

Ajo:
    python3 scripts/tuotteet/build_tuotteet.py           # päivittää src/fi.html ja src/et.html
    python3 scripts/tuotteet/build_tuotteet.py --check   # vain tarkistus
    node scripts/build-pages.mjs && node scripts/verify-pages.mjs
"""
import argparse, html, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
LUETTU = '9.11.2026'

# ---------- lähteet ----------
SRC = {
    'ralos-v10': dict(fi='Ralos Oy, tekninen tiedote Ralos Beast 125, versio V10', et='Ralos Oy, tehniline andmeleht Ralos Beast 125, versioon V10', url=None, check=True),
    'el-e418': dict(fi='Elecnova, tuotesivu ECO-E418LP', et='Elecnova, tooteleht ECO-E418LP', url='https://www.elecnova-ess.com/eco-e418lp-a406980-1'),
    'el-e101': dict(fi='Elecnova, tuotesivu ECO-E101WX', et='Elecnova, tooteleht ECO-E101WX', url='https://www.elecnova-ess.com/eco-e101wx'),
    'el-e64': dict(fi='Elecnova, tuotesivu ECO-E64WX', et='Elecnova, tooteleht ECO-E64WX', url='https://www.elecnova-ess.com/eco-e64wx-1'),
    'el-e20ft': dict(fi='Elecnova, tuotesivu ECO-E20FT2170LP', et='Elecnova, tooteleht ECO-E20FT2170LP', url='https://www.elecnova-ess.com/eco-e20ft2170lp'),
    'el-sts': dict(fi='Elecnova, tuotesivu ECO-STS-C125', et='Elecnova, tooteleht ECO-STS-C125', url='https://www.elecnova-ess.com/eco-sts-c125-246in'),
    'ep-ci': dict(fi='EP Energy, luettelo C&amp;I Energy Storage Solutions, 12/2025', et='EP Energy, kataloog C&amp;I Energy Storage Solutions, 12/2025', url=None),
    'ep-mob': dict(fi='EP Energy, luettelo Mobile Energy &amp; Storage Charging Solutions, 12/2025', et='EP Energy, kataloog Mobile Energy &amp; Storage Charging Solutions, 12/2025', url=None),
    'ralos-585': dict(fi='Ralos Oy, esite RLS-585, 6/2023', et='Ralos Oy, brošüür RLS-585, 6/2023', url=None),
    'roofit-vs': dict(fi='Roofit.Solar, Velario Slim -datalehti 2026-02 V1', et='Roofit.Solar, Velario Slim andmeleht 2026-02 V1', url='https://roofit.solar/wp-content/uploads/2026/04/velario-slim-datasheets-2026-02-v1.pdf'),
    # v57 (Madis 9.11.2026 klo 12.14 ja 12.25: latausasemat useammalta valmistajalta, kaikki tuotteet valikoimaan)
    'zaptec-pro': dict(fi='Zaptec Charger AS, Zaptec Pro -tuotelehti 22.2.2023 (Scanoffice)', et='Zaptec Charger AS, Zaptec Pro tooteleht 22.2.2023 (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2023/11/Datalehti_Zaptec_Pro.pdf'),
    'easee-pro': dict(fi='Easee, Charge Pro -datalehti 10/2025, versio 1.03 (Scanoffice)', et='Easee, Charge Pro andmeleht 10/2025, versioon 1.03 (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2026/02/Datalehti_Charge_Pro.pdf'),
    'zoe': dict(fi='ZOE Energy Storage, Z Box-C 215-2H -datalehti (Scanoffice)', et='ZOE Energy Storage, Z Box-C 215-2H andmeleht (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2025/12/Datalehti_ZOE_C215_2H.pdf'),
    'hts-musta': dict(fi='HT-SAAE, esitteet HT54- ja HT60-18X(ND)-F (Scanoffice)', et='HT-SAAE, brošüürid HT54- ja HT60-18X(ND)-F (Scanoffice)', url='https://scanoffice.fi/aurinkopaneelit/tuotteet/ht-s-taysin-mustat-aurinkopaneelit/'),
    'hts-72': dict(fi='HT-SAAE, datalehti HT72-18X(ND)-F (Scanoffice)', et='HT-SAAE, andmeleht HT72-18X(ND)-F (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2025/06/Datalehti_HT-S_HT72-585-605W.pdf'),
    'hyundai': dict(fi='HD Hyundai Energy Solutions, HJT-paneelien datalehti (Scanoffice)', et='HD Hyundai Energy Solutions, HJT-paneelide andmeleht (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2025/06/Datalehti_Hyundai_HJT_aurinkopaneelit.pdf'),
    'qt2': dict(fi='APsystems, QT2-datalehti, versio 1.0, 7.10.2023 (Scanoffice)', et='APsystems, QT2 andmeleht, versioon 1.0, 7.10.2023 (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2023/10/Datalehti_APsystems_QT2.pdf.pdf'),
    'sofar': dict(fi='Sofar Solar, invertterien datalehti (Scanoffice)', et='Sofar Solar, inverterite andmeleht (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2022/12/sofarsolar-datalehti_monta_sivua1.pdf'),
    'me-r450': dict(fi='Mitsubishi Electric, CAHV-R450-esite (Scanoffice)', et='Mitsubishi Electric, CAHV-R450 brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2023/10/Esite_CAHV-R450YA-HPB-3.pdf'),
    'me-z450': dict(fi='Mitsubishi Electric, CAHV-Z450-esite (Scanoffice)', et='Mitsubishi Electric, CAHV-Z450 brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2026/10/Esite_Mitsubishi_Electric_CAHV-Z450.pdf'),
    'me-lhb': dict(fi='Mitsubishi Electric, Large Hydrobox E -esite (Scanoffice)', et='Mitsubishi Electric, Large Hydrobox E brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2026/02/Esite_Large_Hydrobox_E-sarja-1.pdf'),
    'me-ecodan': dict(fi='Mitsubishi Electric, Ecodan E -esite (Scanoffice)', et='Mitsubishi Electric, Ecodan E brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2025/10/Esite_Ecodan_E-gen-1.pdf'),
    'me-geodan': dict(fi='Mitsubishi Electric, Geodan-esite (Scanoffice)', et='Mitsubishi Electric, Geodan brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2019/07/Esite_Geodan-1.pdf'),
    'me-p': dict(fi='Mitsubishi Electric, P-sarjan ilmalämpöpumput -esite (Scanoffice)', et='Mitsubishi Electric, P-seeria õhksoojuspumpade brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2024/10/Esite_Mitsubishi_Electric_P-sarjan_ilmalampopumput-2.pdf'),
    'me-wdh': dict(fi='Mitsubishi Electric, WDH-esite (Scanoffice)', et='Mitsubishi Electric, WDH brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2018/06/Esite_Mitsubishi_Electric_WDH-1.pdf'),
    'me-idh': dict(fi='Mitsubishi Electric, IDH-esite (Scanoffice)', et='Mitsubishi Electric, IDH brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2018/06/Esite_IDH-2.pdf'),
    'me-pac': dict(fi='Mitsubishi Electric, PAC-IF013-esite (Scanoffice)', et='Mitsubishi Electric, PAC-IF013 brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2024/10/Esite_PAC-IF013_uudet_mallit-2.pdf'),
    'el-e241': dict(fi='Elecnova, tuotesivu ECO-E241WP-2A', et='Elecnova, tooteleht ECO-E241WP-2A', url='https://www.elecnova-ess.com/eco-e241wp-2a'),
    'el-e261': dict(fi='Elecnova, tuotesivu ECO-E261LP-2A', et='Elecnova, tooteleht ECO-E261LP-2A', url='https://www.elecnova-ess.com/eco-e261lp-2a'),
    'el-e215': dict(fi='Elecnova, tuotesivu ECO-E215WS', et='Elecnova, tooteleht ECO-E215WS', url='https://www.elecnova-ess.com/eco-e215ws'),
    'el-e233': dict(fi='Elecnova, tuotesivu ECO-E233LS', et='Elecnova, tooteleht ECO-E233LS', url='https://www.elecnova-ess.com/eco-e233ls'),
    'el-b418': dict(fi='Elecnova, tuotesivu ECO-B418LP-2N', et='Elecnova, tooteleht ECO-B418LP-2N', url='https://www.elecnova-ess.com/eco-b418lp-2n-1'),
    'el-b372': dict(fi='Elecnova, tuotesivu ECO-B372LS', et='Elecnova, tooteleht ECO-B372LS', url='https://www.elecnova-ess.com/eco-b372ls'),
    'el-b5015': dict(fi='Elecnova, tuotesivu ECO-B20FT5015LP-2', et='Elecnova, tooteleht ECO-B20FT5015LP-2', url='https://www.elecnova-ess.com/eco-b20ft5015lp-2-1'),
    'el-b3404': dict(fi='Elecnova, tuotesivu ECO-B20FT3404WS', et='Elecnova, tooteleht ECO-B20FT3404WS', url='https://www.elecnova-ess.com/eco-b20ft3404ws'),
    'el-eps': dict(fi='Elecnova, tuotesivu ECO-EPS-C125', et='Elecnova, tooteleht ECO-EPS-C125', url='https://www.elecnova-ess.com/eco-eps-c125-136in'),
    'el-comp': dict(fi='Elecnova, tuotesivut PCS, BMS ja EMS', et='Elecnova, tootelehed PCS, BMS ja EMS', url='https://www.elecnova-ess.com/eco-pcs'),
    'avant-og': dict(fi='Avant Tecno, tiedote OptiGrid™-mikroverkosta 1.7.2025', et='Avant Tecno, pressiteade OptiGrid™ mikrovõrgust 1.7.2025', url='https://avanttecno.com/news-and-events/avant-power-expands-operations-optigridmicrogrid-revolutionizes-energy-and-charging-solutions/'),
    # v57b (Madis 9.11.2026 klo 12.59): Raloksen koko tuotekatalogi, Avant Powerin kiinteä varasto ja lataus, Gare Solar Carport, Scanofficen kotilataus ja -akut
    'r-minibeast': dict(fi='Ralos Oy, tuotesivu Ralos Mini-Beast 50', et='Ralos Oy, tooteleht Ralos Mini-Beast 50', url='https://ralos.fi/tuotteet/ralos-mini-beast-50-energiavarasto'),
    'r-hione': dict(fi='Ralos Oy, tuotesivu Hoymiles HiOne', et='Ralos Oy, tooteleht Hoymiles HiOne', url='https://ralos.fi/tuotteet/hoymiles-hione-all-in-one'),
    'r-lb16': dict(fi='Ralos Oy, tuotesivu Hoymiles LB-16D-G3', et='Ralos Oy, tooteleht Hoymiles LB-16D-G3', url='https://ralos.fi/tuotteet/hoymiles-lb-16d-g3'),
    'r-enershare': dict(fi='Ralos Oy, tuotesivu Enershare CORE', et='Ralos Oy, tooteleht Enershare CORE', url='https://ralos.fi/tuotteet/enershare'),
    'r-pilv1': dict(fi='Ralos Oy, tuotesivu Pytes PiLV1', et='Ralos Oy, tooteleht Pytes PiLV1', url='https://ralos.fi/tuotteet/pytes-pilv1-pinottava-matalajanniteakusto'),
    'r-v16': dict(fi='Ralos Oy, tuotesivu Pytes V16', et='Ralos Oy, tooteleht Pytes V16', url='https://ralos.fi/tuotteet/pytes-v16'),
    'r-melv': dict(fi='Ralos Oy, tuotesivu ATMOCE M-ELV', et='Ralos Oy, tooteleht ATMOCE M-ELV', url='https://ralos.fi/tuotteet/atmoce-m-elv'),
    'r-rt16076': dict(fi='Ralos Oy, tuotesivu Raystech RT16076MPlus', et='Ralos Oy, tooteleht Raystech RT16076MPlus', url='https://ralos.fi/tuotteet/raystech-rt16076mplus'),
    'r-rt5427': dict(fi='Ralos Oy, tuotesivu Raystech RT5427 HV/SHV', et='Ralos Oy, tooteleht Raystech RT5427 HV/SHV', url='https://ralos.fi/tuotteet/raystech-rt5427-hv-shv'),
    'r-hit': dict(fi='Ralos Oy, tuotesivu Hoymiles HiT', et='Ralos Oy, tooteleht Hoymiles HiT', url='https://ralos.fi/tuotteet/hoymiles-hit-matalajannitehybridi-invertterit'),
    'r-hyt': dict(fi='Ralos Oy, tuotesivu Hoymiles HYT-HV', et='Ralos Oy, tooteleht Hoymiles HYT-HV', url='https://ralos.fi/tuotteet/hoymiles-hyt-hybridi-invertterit'),
    'r-mit': dict(fi='Ralos Oy, tuotesivu Hoymiles MiT', et='Ralos Oy, tooteleht Hoymiles MiT', url='https://ralos.fi/tuotteet/hoymiles-mit'),
    'r-hmt': dict(fi='Ralos Oy, tuotesivu Hoymiles HMT', et='Ralos Oy, tooteleht Hoymiles HMT', url='https://ralos.fi/tuotteet/hoymiles-hmt'),
    'r-hms': dict(fi='Ralos Oy, tuotesivu Hoymiles HMS', et='Ralos Oy, tooteleht Hoymiles HMS', url='https://ralos.fi/tuotteet/hoymiles-hms'),
    'r-mis': dict(fi='Ralos Oy, tuotesivu Hoymiles MiS', et='Ralos Oy, tooteleht Hoymiles MiS', url='https://ralos.fi/tuotteet/hoymiles-mis'),
    'r-atmoce': dict(fi='Ralos Oy, tuotesivu Atmoce-mikroinvertterit', et='Ralos Oy, tooteleht Atmoce mikroinverterid', url='https://ralos.fi/tuotteet/atmoce'),
    'r-mbackup': dict(fi='Ralos Oy, tuotesivu ATMOCE M-Backup', et='Ralos Oy, tooteleht ATMOCE M-Backup', url='https://ralos.fi/tuotteet/atmoce-m-backup-varavoiman-kytkentakeskus'),
    'r-mcomb': dict(fi='Ralos Oy, tuotesivu ATMOCE M-Combiner', et='Ralos Oy, tooteleht ATMOCE M-Combiner', url='https://ralos.fi/tuotteet/atmoce-m-combiner'),
    'r-h450': dict(fi='Ralos Oy, tuotesivu Hanersun HiTouch 450 Wp', et='Ralos Oy, tooteleht Hanersun HiTouch 450 Wp', url='https://ralos.fi/tuotteet/hanersun-450'),
    'r-h500': dict(fi='Ralos Oy, tuotesivu Hanersun HiTouch 500 Wp', et='Ralos Oy, tooteleht Hanersun HiTouch 500 Wp', url='https://ralos.fi/tuotteet/hanersun-500'),
    'r-h620': dict(fi='Ralos Oy, tuotesivu Hanersun HiTouch 620 Wp', et='Ralos Oy, tooteleht Hanersun HiTouch 620 Wp', url='https://ralos.fi/tuotteet/hanersun-620w'),
    'r-h725': dict(fi='Ralos Oy, tuotesivu Hanersun HiTouch 725 Wp', et='Ralos Oy, tooteleht Hanersun HiTouch 725 Wp', url='https://ralos.fi/tuotteet/hanersun-725'),
    'r-overeasy': dict(fi='Ralos Oy, tuotesivu Over Easy xM-3', et='Ralos Oy, tooteleht Over Easy xM-3', url='https://ralos.fi/tuotteet/overeasy-xm'),
    'r-av': dict(fi='Ralos Oy, ratkaisusivu aurinkovoimalat', et='Ralos Oy, lahenduste leht päikesejaamad', url='https://ralos.fi/ratkaisut/aurinkovoimalat'),
    'avant-ogp': dict(fi='Avant Power, OptiGrid™-sivu', et='Avant Power, OptiGrid™ leht', url='https://avantpower.fi/optigrid/'),
    'avant-ogs': dict(fi='Avant Power, OptiGrid™-sivu, kohta Kiinteät energiavarastot', et='Avant Power, OptiGrid™ leht, statsionaarsete salvestite osa', url='https://avantpower.fi/optigrid/'),
    'gare-carport': dict(fi='Gare Energy Oy, Gare Solar Carport -tuotesivu', et='Gare Energy Oy, Gare Solar Carport', url='https://aurinkokatto.com/carport-autokatos-gare-energy/'),
    'easee-max': dict(fi='Easee, Charge Max -datalehti (Scanoffice)', et='Easee, Charge Max andmeleht (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2026/02/Datalehti_Charge_Max.pdf'),
    'easee-up': dict(fi='Easee, Charge Up -datalehti (Scanoffice)', et='Easee, Charge Up andmeleht (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2026/02/Datalehti_Charge_Up.pdf'),
    'zaptec-go': dict(fi='Zaptec Charger AS, Zaptec Go -tuotelehti (Scanoffice)', et='Zaptec Charger AS, Zaptec Go tooteleht (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2023/11/Datalehti_Zaptec_Go.pdf'),
    'beny': dict(fi='BENY, latausaseman esite (Scanoffice)', et='BENY, laadimisjaama brošüür (Scanoffice)', url='https://scanoffice.fi/wp-content/uploads/2022/09/Esite_ZJBeny-3.pdf'),
    'solax': dict(fi='SolaX, esitteet X3-Hybrid G4 ja Triple Power T30 (Scanoffice)', et='SolaX, brošüürid X3-Hybrid G4 ja Triple Power T30 (Scanoffice)', url='https://scanoffice.fi/aurinkopaneelit/tuotteet/solax-sahkovarasto-ja-hybridi-invertteri/'),
    'so-sofar-hyd': dict(fi='Scanoffice, tuotesivu Sofar-sähkövarasto ja hybridi-invertteri', et='Scanoffice, tooteleht Sofar salvesti ja hübriidinverter', url='https://scanoffice.fi/aurinkopaneelit/tuotteet/aurinkopaneelin-akku-sofar-solar-sahkovarasto-ja-hybridi-invertteri/'),
    'so-ilp': dict(fi='Scanoffice, ilmalämpöpumput-tuotesivut', et='Scanoffice, õhksoojuspumpade tootelehed', url='https://scanoffice.fi/ilmalampopumput/'),
    'so-iv': dict(fi='Scanoffice, ilmanvaihtolaitteet-tuotesivu', et='Scanoffice, ventilatsiooniseadmete tooteleht', url='https://scanoffice.fi/ilmanvaihtolaitteet/'),
    'so-kiinn': dict(fi='Scanoffice, aurinkopaneelien tuotesivut', et='Scanoffice, päikesepaneelide tootelehed', url='https://scanoffice.fi/aurinkopaneelit/'),
    'so-tolppa': dict(fi='Scanoffice, tuotesivu Easee-latausasemat ja lataustolpat', et='Scanoffice, tooteleht Easee laadimisjaamad ja laadimispostid', url='https://scanoffice.fi/sahkoauton-latausasemat/tuotteet/easee-sahkoauton-latausasemat/'),
    'avant-cube': dict(fi='Avant Power, OptiTemp® Cube 47 -esite, 6/2026', et='Avant Power, OptiTemp® Cube 47 brošüür, 6/2026', url='https://avanttecno.com/fi/wp-content/uploads/sites/7/2026/08/avant-power-cube47-esite-A4-FI-web.pdf'),
    # v58b (9.11.2026): Raloksen, Scanofficen, Garen ja Elecnovan loput tuotesivut (sivukartat ja tuotekatalogit käyty läpi)
    'r-rls480': dict(fi='Ralos Oy, tuotesivu Ralos RLS-480', et='Ralos Oy, tooteleht Ralos RLS-480', url='https://ralos.fi/tuotteet/rls-480'),
    'r-rls525': dict(fi='Ralos Oy, tuotesivu Ralos RLS-525', et='Ralos Oy, tooteleht Ralos RLS-525', url='https://ralos.fi/tuotteet/rls-525'),
    'r-tongwei': dict(fi='Ralos Oy, tuotesivu Tongwei 725 Wp', et='Ralos Oy, tooteleht Tongwei 725 Wp', url='https://ralos.fi/tuotteet/tongwei-725'),
    'r-stalker': dict(fi='Ralos Oy, tuotesivu Ralos Stalker 2.0', et='Ralos Oy, tooteleht Ralos Stalker 2.0', url='https://ralos.fi/tuotteet/stalker'),
    'r-battbank': dict(fi='Ralos Oy, ratkaisusivu Atmoce BattBank', et='Ralos Oy, lahenduse leht Atmoce BattBank', url='https://ralos.fi/ratkaisut/atmoce-battbank'),
    'r-active16': dict(fi='Ralos Oy, tuotesivu Enershare Active16', et='Ralos Oy, tooteleht Enershare Active16', url='https://ralos.fi/tuotteet/enershare-active16-matalajanniteakku-16-kwh'),
    'r-hibattery': dict(fi='Ralos Oy, tuotesivu Hoymiles HiBattery 1920 AC', et='Ralos Oy, tooteleht Hoymiles HiBattery 1920 AC', url='https://ralos.fi/tuotteet/hoymiles-hibattery-1920ac'),
    'r-dtsu': dict(fi='Ralos Oy, tuotesivu Hoymiles DTSU666', et='Ralos Oy, tooteleht Hoymiles DTSU666', url='https://ralos.fi/tuotteet/hoymiles-dtsu666'),
    'r-pro': dict(fi='Ralos Oy, tuotesivu Hoymilesin ammattilaissarjan mikroinvertterit', et='Ralos Oy, tooteleht Hoymilesi professionaalse seeria mikroinverterid', url='https://ralos.fi/tuotteet/hoymiles-ammattilaissarjan-mikroinvertterit'),
    'r-hat': dict(fi='Ralos Oy, tuotesivu Hoymiles HAT-HV', et='Ralos Oy, tooteleht Hoymiles HAT-HV', url='https://ralos.fi/tuotteet/hoymiles-hat-akkuinvertterit'),
    'r-nanorail': dict(fi='Ralos Oy, tuotesivu Ralos Nanorail', et='Ralos Oy, tooteleht Ralos Nanorail', url='https://ralos.fi/tuotteet/ralos-nanorail-innovatiivinen-kiskoton-asennusjarjestelma-peltikatoille'),
    'so-raedian': dict(fi='Scanoffice, tuotesivu Raedian-latausasemat', et='Scanoffice, tooteleht Raedian laadimisjaamad', url='https://scanoffice.fi/sahkoauton-latausasemat/tuotteet/raedian-sahkoauton-latausasemat/'),
    'so-ampin': dict(fi='Scanoffice, tuotesivu AmpIN Smart', et='Scanoffice, tooteleht AmpIN Smart', url='https://scanoffice.fi/sahkoauton-latausasemat/tuotteet/ampin-smart-kestava-sahkoauton-latauskaapeli/'),
    'so-kaco': dict(fi='Scanoffice, tuotesivu KACO blueplanet', et='Scanoffice, tooteleht KACO blueplanet', url='https://scanoffice.fi/muut-tuotteet/tuotteet/kaco-blueplanet-invertterit/'),
    'so-cs': dict(fi='Scanoffice, tuotesivu Canadian Solar HiKu', et='Scanoffice, tooteleht Canadian Solar HiKu', url='https://scanoffice.fi/muut-tuotteet/tuotteet/canadian-solar-hiku-aurinkopaneelit/'),
    'so-hanwha': dict(fi='Scanoffice, tuotesivu Hanwha Q.PEAK DUO ML-G11', et='Scanoffice, tooteleht Hanwha Q.PEAK DUO ML-G11', url='https://scanoffice.fi/muut-tuotteet/tuotteet/hanwha-q-peak-duo-ml-g11-aurinkopaneelit/'),
    'so-znshine': dict(fi='Scanoffice, tuotesivu ZNShine Solar ZXM7', et='Scanoffice, tooteleht ZNShine Solar ZXM7', url='https://scanoffice.fi/muut-tuotteet/tuotteet/znshine-solar-zxm7-aurinkopaneelit/'),
    'so-premium': dict(fi='Scanoffice, tuotesivu Premium-aurinkosähköpaketit', et='Scanoffice, tooteleht Premium päikeseelektripaketid', url='https://scanoffice.fi/aurinkopaneelit/tuotteet/scanoffice-premium-aurinkosahkopaketit/'),
    'so-esaastaja': dict(fi='Scanoffice, tuotesivu Energiansäästäjä kiinteistöihin', et='Scanoffice, tooteleht Energiansäästäjä kinnistutele', url='https://scanoffice.fi/kiinteistotuotteet/ilma-vesilampopumput/tuotteet/energiansaastaja-nykyisen-lammonlahteen-rinnalle-kiinteistot/'),
    'so-energypac': dict(fi='Scanoffice, tuotesivu Scanoffice-Energypac', et='Scanoffice, tooteleht Scanoffice-Energypac', url='https://scanoffice.fi/ilma-vesilampopumput/tuotteet/scanoffice-energypac/'),
    'so-vrf': dict(fi='Scanoffice, tuotesivu VRF-järjestelmät', et='Scanoffice, tooteleht VRF-süsteemid', url='https://scanoffice.fi/kiinteistotuotteet/vrf-jarjestelmat/'),
    'so-maalampo': dict(fi='Scanoffice, tuotesivu maalämpöpumput suuriin kiinteistöihin', et='Scanoffice, tooteleht maasoojuspumbad suurtele kinnistutele', url='https://scanoffice.fi/kiinteistotuotteet/maalampopumput-suuriin-kiinteistoihin/'),
    'so-flowair': dict(fi='Scanoffice, tuotesivu Flowair LEO', et='Scanoffice, tooteleht Flowair LEO', url='https://scanoffice.fi/kiinteistotuotteet/kiertoilmakojeet/tuotteet/flowair-leo-kiertoilmakojeet/'),
    'so-varaajat': dict(fi='Scanoffice, tuotesivu puskuri- ja käyttövesivaraajat', et='Scanoffice, tooteleht puhver- ja tarbeveeboilerid', url='https://scanoffice.fi/muut-tuotteet/tuotteet/puskurivaraajat-ja-kayttovesivaraajat/'),
    'gare-nuclick': dict(fi='Gare Energy Oy, aurinkokattotuotteet', et='Gare Energy Oy, päikesekatuse tooted', url='https://aurinkokatto.com/aurinkokatto-tuotteet/'),
    'el-b100': dict(fi='Elecnova, tuotesivu ECO-B100/120WP-2H', et='Elecnova, tooteleht ECO-B100/120WP-2H', url='https://www.elecnova-ess.com/eco-b100120wp-2h-1'),
    'el-h3200': dict(fi='Elecnova, tuotesivu PCS-Boost-kontti ECO-H3200K', et='Elecnova, tooteleht PCS-Boost konteiner ECO-H3200K', url='https://www.elecnova-ess.com/eco-h1000k-10g'),
    'el-p20': dict(fi='Elecnova, tuotesivu ECO-P1P20WS', et='Elecnova, tooteleht ECO-P1P20WS', url='https://www.elecnova-ess.com/eco-p1p20ws'),
    'el-p52': dict(fi='Elecnova, tuotesivu ECO-P1P52LS', et='Elecnova, tooteleht ECO-P1P52LS', url='https://www.elecnova-ess.com/eco-p1p52ls'),
}

NB = '&nbsp;'
import re
def n(s):  # sitova välilyönti vain luvun ja yksikön väliin sekä tuhaterottimeksi; sanojen välissä rivi saa katketa
    s = re.sub(r'(?<=\d) (?=\d{3}\b)', NB, s)
    s = re.sub(r'(?<=[\d)]) (?=(?:kWh|kWp|kW|kVA|VA|Wp|V|W|ms|m|t|kg|s|m³/h)(?:\b|$))', NB, s)
    s = re.sub(r'(?<=\d) (?=°C|%)', NB, s)
    return s.replace('V DC', 'V' + NB + 'DC')

# ---------- tuotteet ----------
# spec = (FI-otsake, ET-otsake, FI-arvo, ET-arvo); arvoissa välilyönti = sitova välilyönti
P = [
    dict(id='ralos-beast-125-hd', mk='Ralos', model='Beast 125 HD', cats=['kaappi', 'varavoima'], src='ralos-v10', photo=True,
         alt=('Ralos Beast -energiavarastokaappeja hallissa, kuva: Ralos Oy', 'Ralos Beasti salvestikapid hallis, foto: Ralos Oy'),
         t=('Nestejäähdytetty energiavarasto sisä- tai ulkoasennukseen', 'Vedelikjahutusega salvesti sise- või välipaigalduseks'),
         s=[('Teho', 'Võimsus', '125 kW', '125 kW'), ('Energia', 'Energia', '261 kWh', '261 kWh'),
            ('Varavoima, optio', 'Varutoide, lisavarustus', 'STS, alle 10 ms', 'STS, alla 10 ms'),
            ('Aurinkosähkö, optio', 'Päikeseelekter, lisavarustus', '2 × 63 kW', '2 × 63 kW')]),
    dict(id='elecnova-eco-e418lp', mk='Elecnova', model='ECO-E418LP', cats=['kaappi'], src='el-e418', photo=True,
         alt=('Elecnovan ECO-E418LP-energiavarastokaappi, kuva: Elecnova', 'Elecnova ECO-E418LP salvestikapp, foto: Elecnova'),
         t=('Nestejäähdytetty ulkokaappi', 'Vedelikjahutusega väliskapp'),
         s=[('Teho', 'Võimsus', '100 kW (400 V)', '100 kW (400 V)'), ('Energia', 'Energia', '418 kWh', '418 kWh'),
            ('Jäähdytys', 'Jahutus', 'neste', 'vedelik'), ('Pohja', 'Põhi', '1,5 × 1,35 m', '1,5 × 1,35 m')]),
    dict(id='elecnova-eco-e101wx', mk='Elecnova', model='ECO-E101WX', cats=['kaappi'], src='el-e101',
         alt=('Elecnovan ECO-E101WX-energiavarastokaappi, kuva: Elecnova', 'Elecnova ECO-E101WX salvestikapp, foto: Elecnova'),
         t=('Ilmajäähdytteinen ulkokaappi', 'Õhkjahutusega väliskapp'),
         s=[('Teho', 'Võimsus', '100 kW', '100 kW'), ('Energia', 'Energia', '101 kWh', '101 kWh'),
            ('Jäähdytys', 'Jahutus', 'ilma', 'õhk'), ('Pohja', 'Põhi', '1,25 × 1,2 m', '1,25 × 1,2 m')]),
    dict(id='ep-energy-epes233', mk='EP Energy', model='EPES233', cats=['kaappi'], src='ep-ci',
         alt=('EP Energyn EPES233-energiavarastokaappi, kuva: EP Energy', 'EP Energy EPES233 salvestikapp, foto: EP Energy'),
         t=('Nestejäähdytetty ulkokaappi', 'Vedelikjahutusega väliskapp'),
         s=[('Teho', 'Võimsus', '105 kW', '105 kW'), ('Energia', 'Energia', '233 kWh', '233 kWh'),
            ('Jäähdytys', 'Jahutus', 'neste', 'vedelik'), ('Pohja', 'Põhi', '1,45 × 1,3 m', '1,45 × 1,3 m')]),
    dict(id='ep-energy-ephs', mk='EP Energy', model='EPHS104 / EPHS156', cats=['hybridi', 'varavoima'], src='ep-ci',
         alt=('EP Energyn EPHS-hybridikaappi, kuva: EP Energy', 'EP Energy EPHS hübriidkapp, foto: EP Energy'),
         t=('Hybridikaappi aurinkosähköön', 'Hübriidkapp päikeseelektrile'),
         s=[('Teho', 'Võimsus', '50 kW', '50 kW'), ('Energia', 'Energia', '104 tai 156 kWh', '104 või 156 kWh'),
            ('Aurinkosähkö', 'Päikeseelekter', 'enintään 100 kW', 'kuni 100 kW'), ('Varavoima', 'Varutoide', 'alle 10 ms', 'alla 10 ms')]),
    dict(id='elecnova-eco-e64wx', mk='Elecnova', model='ECO-E64WX', cats=['hybridi'], src='el-e64',
         alt=('Elecnovan ECO-E64WX-hybridikaappi, kuva: Elecnova', 'Elecnova ECO-E64WX hübriidkapp, foto: Elecnova'),
         t=('Hybridikaappi aurinkosähköön', 'Hübriidkapp päikeseelektrile'),
         s=[('Teho', 'Võimsus', '25–50 kW', '25–50 kW'), ('Energia', 'Energia', '64,5 kWh', '64,5 kWh'),
            ('Aurinkosähkö', 'Päikeseelekter', '37,5–75 kW', '37,5–75 kW'), ('Jäähdytys', 'Jahutus', 'ilma', 'õhk')]),
    dict(id='elecnova-eco-e20ft2170lp', mk='Elecnova', model='ECO-E20FT2170LP', cats=['kontti'], src='el-e20ft',
         alt=('Elecnovan 20 jalan konttivarasto ECO-E20FT2170LP, kuva: Elecnova', 'Elecnova 20-jalane konteinersalvesti ECO-E20FT2170LP, foto: Elecnova'),
         t=('20 jalan konttivarasto', '20-jalane konteinersalvesti'),
         s=[('Teho', 'Võimsus', '1 000 kW', '1 000 kW'), ('Energia', 'Energia', '2 170 kWh', '2 170 kWh'),
            ('Jäähdytys', 'Jahutus', 'neste', 'vedelik'), ('Paino', 'Kaal', '25 t', '25 t')]),
    dict(id='ep-energy-epes5000', mk='EP Energy', model='EPES5000', cats=['kontti'], src='ep-ci',
         alt=('EP Energyn EPES5000-akustokontti, kuva: EP Energy', 'EP Energy EPES5000 akukonteiner, foto: EP Energy'),
         t=('Akustokontti suuriin kohteisiin', 'Akukonteiner suurtele objektidele'),
         s=[('Energia', 'Energia', '5 015 kWh', '5 015 kWh'), ('Jännite', 'Pinge', '1 040–1 500 V DC', '1 040–1 500 V DC'),
            ('Jäähdytys', 'Jahutus', 'neste', 'vedelik'), ('Paino', 'Kaal', '44 t', '44 t')]),
    dict(id='ep-energy-epps93-m', mk='EP Energy', model='EPPS93-M', cats=['siirrettava'], src='ep-mob',
         alt=('EP Energyn siirrettävä energiayksikkö EPPS93-M, kuva: EP Energy', 'EP Energy teisaldatav energiaseade EPPS93-M, foto: EP Energy'),
         t=('Siirrettävä energiayksikkö', 'Teisaldatav energiaseade'),
         s=[('Energia', 'Energia', '93 kWh', '93 kWh'), ('DC-lataus', 'DC-laadimine', '60 kW', '60 kW'),
            ('AC-ulostulo', 'AC-väljund', '33 kVA', '33 kVA'), ('Paino', 'Kaal', '1,5 t', '1,5 t')]),
    dict(id='ep-energy-epps210-m', mk='EP Energy', model='EPPS210-M', cats=['siirrettava'], src='ep-mob',
         alt=('EP Energyn siirrettävä energiayksikkö EPPS210-M perävaunulla, kuva: EP Energy', 'EP Energy teisaldatav energiaseade EPPS210-M haagisel, foto: EP Energy'),
         t=('Siirrettävä energiayksikkö perävaunulla', 'Teisaldatav energiaseade haagisel'),
         s=[('Energia', 'Energia', '217 kWh', '217 kWh'), ('DC-lataus', 'DC-laadimine', 'enintään 240 kW', 'kuni 240 kW'),
            ('AC-ulostulo', 'AC-väljund', '125 kW', '125 kW'), ('Paino', 'Kaal', '2,7 t', '2,7 t')]),
    dict(id='ep-energy-epcs209', mk='EP Energy', model='EPCS209', cats=['siirrettava'], src='ep-mob',
         alt=('EP Energyn akulla varustettu DC-pikalaturi EPCS209, kuva: EP Energy', 'EP Energy akuga DC-kiirlaadija EPCS209, foto: EP Energy'),
         t=('Akulla varustettu DC-pikalaturi', 'Akuga DC-kiirlaadija'),
         s=[('Liittymästä', 'Liitumisest', '60 kW', '60 kW'), ('Lataus', 'Laadimine', 'enintään 240 kW', 'kuni 240 kW'),
            ('Akku', 'Aku', '209 kWh', '209 kWh'), ('Liittimet', 'Pistikud', '2 × CCS2', '2 × CCS2')]),
    dict(id='avant-power-cube-47', mk='Avant Power', model='OptiTemp® Cube 47', cats=['siirrettava'], src='avant-cube',
         alt=('Avant Powerin siirrettävä energiayksikkö OptiTemp Cube 47, kuva: Avant Power', 'Avant Poweri teisaldatav energiaseade OptiTemp Cube 47, foto: Avant Power'),
         t=('Siirrettävä energiayksikkö työkoneille', 'Teisaldatav energiaseade töömasinatele'),
         s=[('Energia', 'Energia', '47 kWh', '47 kWh'), ('Teho', 'Võimsus', '11 kW', '11 kW'),
            ('Kotelointi', 'Kaitseaste', 'IP54', 'IP54'), ('Paino', 'Kaal', '730 kg', '730 kg')]),
    dict(id='elecnova-eco-sts-c125', mk='Elecnova', model='ECO-STS-C125', cats=['varavoima'], src='el-sts',
         alt=('Elecnovan STS-kaappi ECO-STS-C125, kuva: Elecnova', 'Elecnova STS-kapp ECO-STS-C125, foto: Elecnova'),
         t=('STS-kaappi saarekekäyttöön', 'STS-kapp saartalitluseks'),
         s=[('Varastoille', 'Salvestitele', '2, 4 tai 6 × 125 kW', '2, 4 või 6 × 125 kW'), ('Siirto', 'Ümberlülitus', '20 ms', '20 ms'),
            ('Kotelointi', 'Kaitseaste', 'IP54', 'IP54'), ('Jännite', 'Pinge', '400 V', '400 V')]),
    # aurinkosähkö (v53): paneelit ja aurinkokatto; Roofit.Solar vain Suomen sivustolla (Gare Energy Oy, vartija roofit-et)
    dict(id='ralos-rls-585', mk='Ralos', model='RLS-585', cats=['paneeli'], src='ralos-585',
         alt=('Ralosin kaksipuolinen aurinkopaneeli RLS-585 edestä ja takaa, kuva: Ralos Oy', 'Ralose kahepoolne päikesepaneel RLS-585 eest ja tagant, foto: Ralos Oy'),
         t=('Kaksipuolinen aurinkopaneeli, HJT-kennot', 'Kahepoolne päikesepaneel, HJT-elemendid'),
         s=[('Teho', 'Võimsus', '585 W', '585 W'), ('Hyötysuhde', 'Kasutegur', '22,4 %', '22,4 %'),
            ('Kaksipuolisuus', 'Kahepoolsus', '90 %', '90 %'), ('Koko', 'Mõõdud', '2,38 × 1,10 m', '2,38 × 1,10 m')]),
    dict(id='ralos-rls-480', mk='Ralos', model='RLS-480', cats=['paneeli'], src='r-rls480',
         alt=('Ralosin täysmusta kaksipuolinen aurinkopaneeli RLS-480, kuva: Ralos Oy', 'Ralose täismust kahepoolne päikesepaneel RLS-480, foto: Ralos Oy'),
         t=('Täysmusta kaksipuolinen aurinkopaneeli, HJT-kennot', 'Täismust kahepoolne päikesepaneel, HJT-elemendid'),
         s=[('Teho', 'Võimsus', '480 Wp', '480 Wp'), ('Hyötysuhde', 'Kasutegur', '22,3 %', '22,3 %'),
            ('Takuu', 'Garantii', 'tuote 25 v, teho 30 v', 'toode 25 a, võimsus 30 a'), ('Koko', 'Mõõdud', '1,96 × 1,10 m', '1,96 × 1,10 m')]),
    dict(id='ralos-rls-525', mk='Ralos', model='RLS-525', cats=['paneeli'], src='r-rls525',
         alt=('Ralosin täysmusta aurinkopaneeli RLS-525, kuva: Ralos Oy', 'Ralose täismust päikesepaneel RLS-525, foto: Ralos Oy'),
         t=('Täysmusta aurinkopaneeli, TOPCon-kennot', 'Täismust päikesepaneel, TOPCon-elemendid'),
         s=[('Teho', 'Võimsus', '525 Wp', '525 Wp'), ('Hyötysuhde', 'Kasutegur', '22,1 %', '22,1 %'),
            ('Takuu', 'Garantii', 'tuote 25 v, teho 30 v', 'toode 25 a, võimsus 30 a'), ('Koko', 'Mõõdud', '2,09 × 1,13 m', '2,09 × 1,13 m')]),
    dict(id='roofit-velario-slim', mk='Roofit.Solar', model='Velario Slim', cats=['katto'], src='roofit-vs', photo=True, langs=['fi'],
         alt=('Aurinkokatto omakotitalossa, kuva: Gare Energy Oy', ''),
         t=('Aurinkokatto konesaumakattoon, Suomessa toimittaa Gare Energy Oy', ''),
         s=[('Teho', '', '180 W / moduuli', ''), ('Hyötysuhde', '', '19,1 %', ''),
            ('Paloluokka', '', 'BROOF(t2)', ''), ('Kattokaltevuus', '', 'vähintään 10°', '')]),
    # v57: lataus, ZOE, Scanofficen aurinkosähkö ja kiinteistölämpöpumput (Madis 9.11.2026: "pane kõik tooted üles")
    dict(id='zaptec-pro', mk='Zaptec', model='Zaptec Pro', cats=['ac'], src='zaptec-pro',
         alt=('Zaptec Pro -latausasema, kuva: Zaptec', 'Zaptec Pro laadimisjaam, foto: Zaptec'),
         t=('AC-latausasema yritysten ja taloyhtiöiden pysäköintiin', 'Vahelduvvoolu laadimisjaam ettevõtete ja korteriühistute parklasse'),
         s=[('Teho', 'Võimsus', 'enintään 22 kW', 'kuni 22 kW'), ('Kuormanhallinta', 'Koormuse juhtimine', 'dynaaminen, myös vaiheet', 'dünaamiline, ka faasid'),
            ('Mittari', 'Arvesti', 'MID, luokka B', 'MID, klass B'), ('Rajapinta', 'Liides', 'OCPP 1.6J', 'OCPP 1.6J')]),
    dict(id='easee-charge-pro', mk='Easee', model='Charge Pro', cats=['ac'], src='easee-pro',
         alt=('Easee Charge Pro -latausasema, kuva: Easee', 'Easee Charge Pro laadimisjaam, foto: Easee'),
         t=('AC-latausasema suuriin latausverkostoihin', 'Vahelduvvoolu laadimisjaam suurtele laadimisvõrkudele'),
         s=[('Teho', 'Võimsus', 'enintään 22 kW', 'kuni 22 kW'), ('Kuormanhallinta', 'Koormuse juhtimine', 'paikallinen, myös vaiheet', 'kohalik, ka faasid'),
            ('Mittari', 'Arvesti', 'MID, luokka B', 'MID, klass B'), ('Rajapinta', 'Liides', 'OCPP 1.6J', 'OCPP 1.6J')]),
    dict(id='ep-energy-epcp-dc', mk='EP Energy', model='EPCP-DC120–360', cats=['dc'], src='ep-mob',
         alt=('EP Energyn DC-pikalaturi EPCP-DC kahdella latauskaapelilla, kuva: EP Energy', 'EP Energy DC-kiirlaadija EPCP-DC kahe laadimiskaabliga, foto: EP Energy'),
         t=('DC-pikalaturi kahdella CCS2-liittimellä', 'DC-kiirlaadija kahe CCS2-pistikuga'),
         s=[('Teho', 'Võimsus', '120–360 kW', '120–360 kW'), ('Liittimet', 'Pistikud', '2 × CCS2', '2 × CCS2'),
            ('Jännite', 'Pinge', '200–1 000 V DC', '200–1 000 V DC'), ('Käyttölämpötila', 'Töötemperatuur', '−30…+55 °C', '−30…+55 °C')]),
    dict(id='zoe-z-box-c215', mk='ZOE Energy Storage', model='Z Box-C 215-2H', cats=['kaappi'], src='zoe',
         alt=('ZOE Z Box-C -energiavarastokaappi, kuva: ZOE Energy Storage', 'ZOE Z Box-C salvestikapp, foto: ZOE Energy Storage'),
         t=('Nestejäähdytetty ulkokaappi', 'Vedelikjahutusega väliskapp'),
         s=[('Teho', 'Võimsus', '105 kW', '105 kW'), ('Energia', 'Energia', '215 kWh', '215 kWh'),
            ('Jäähdytys', 'Jahutus', 'neste', 'vedelik'), ('Pohja', 'Põhi', '1,34 × 1,40 m', '1,34 × 1,40 m')]),
    dict(id='ht-s-ht72', mk='HT-SAAE', model='HT72-18X(ND)-F', cats=['paneeli'], src='hts-72',
         alt=('HT-SAAE:n kaksipuolinen aurinkopaneeli HT72, kuva: Scanoffice', 'HT-SAAE kahepoolne päikesepaneel HT72, foto: Scanoffice'),
         t=('Kaksipuolinen kaksilasinen paneeli, TOPCon-kennot', 'Kahepoolne kaheklaasiline paneel, TOPCon-elemendid'),
         s=[('Teho', 'Võimsus', '585–605 W', '585–605 W'), ('Hyötysuhde', 'Kasutegur', 'enintään 23,4 %', 'kuni 23,4 %'),
            ('Kaksipuolisuus', 'Kahepoolsus', '80 %', '80 %'), ('Koko', 'Mõõdud', '2,28 × 1,13 m', '2,28 × 1,13 m')]),
    dict(id='ht-s-ht54', mk='HT-SAAE', model='HT54 / HT60-18X(ND)-F', cats=['paneeli'], src='hts-musta',
         alt=('HT-SAAE:n täysmusta aurinkopaneeli, kuva: Scanoffice', 'HT-SAAE täismust päikesepaneel, foto: Scanoffice'),
         t=('Täysmusta kaksilasinen paneeli, TOPCon-kennot', 'Täismust kaheklaasiline paneel, TOPCon-elemendid'),
         s=[('Teho', 'Võimsus', '440–505 W', '440–505 W'), ('Hyötysuhde', 'Kasutegur', 'enintään 23,3 %', 'kuni 23,3 %'),
            ('Kaksipuolisuus', 'Kahepoolsus', '80 %', '80 %'), ('Koko', 'Mõõdud', '1,76 tai 1,91 × 1,13 m', '1,76 või 1,91 × 1,13 m')]),
    dict(id='hd-hyundai-hit', mk='HD Hyundai', model='HiT-H LE-FB', cats=['paneeli'], src='hyundai', photo=True,
         alt=('Täysmustia aurinkopaneeleja tiilikatolla, kuva: Scanoffice', 'Täismustad päikesepaneelid kivikatusel, foto: Scanoffice'),
         t=('Täysmusta HJT-aurinkopaneeli', 'Täismust HJT-päikesepaneel'),
         s=[('Teho', 'Võimsus', '440–460 W', '440–460 W'), ('Hyötysuhde', 'Kasutegur', 'enintään 23,0 %', 'kuni 23,0 %'),
            ('Takuu', 'Garantii', '30 vuotta, myös teho', '30 aastat, ka võimsus'), ('Koko', 'Mõõdud', '1,76 × 1,13 m', '1,76 × 1,13 m')]),
    dict(id='apsystems-qt2', mk='APsystems', model='QT2', cats=['invertteri'], src='qt2',
         alt=('APsystems QT2 -mikroinvertteri, kuva: APsystems', 'APsystems QT2 mikroinverter, foto: APsystems'),
         t=('Kolmivaiheinen mikroinvertteri neljälle paneelille', 'Kolmefaasiline mikroinverter neljale paneelile'),
         s=[('AC-teho', 'AC-võimsus', '2 000 VA', '2 000 VA'), ('Hyötysuhde', 'Kasutegur', '97 %', '97 %'),
            ('Kotelointi', 'Kaitseaste', 'IP67', 'IP67'), ('Käyttölämpötila', 'Töötemperatuur', '−40…+65 °C', '−40…+65 °C')]),
    dict(id='sofar-ktl', mk='Sofar Solar', model='KTL-X, KTL-G2 ja KTL', model_et='KTL-X, KTL-G2 ja KTL', cats=['invertteri'], src='sofar',
         alt=('Sofar Solarin verkkoinvertteri, kuva: Sofar Solar', 'Sofar Solari võrguinverter, foto: Sofar Solar'),
         t=('Kolmivaiheiset verkkoinvertterit', 'Kolmefaasilised võrguinverterid'),
         s=[('Teho', 'Võimsus', '3,3–70 kW', '3,3–70 kW'), ('Hyötysuhde', 'Kasutegur', 'enintään 98,6 %', 'kuni 98,6 %'),
            ('MPPT', 'MPPT', '2 tai 3', '2 või 3'), ('Kotelointi', 'Kaitseaste', 'IP65', 'IP65')]),
    dict(id='me-cahv-z450', mk='Mitsubishi Electric', model='CAHV-Z450', cats=['lampo'], src='me-z450',
         alt=('Mitsubishi Electric CAHV -ulkoyksikkö, kuva: Mitsubishi Electric', 'Mitsubishi Electric CAHV välisseade, foto: Mitsubishi Electric'),
         t=('Ilma-vesilämpöpumppu kiinteistöihin, R290', 'Õhk-vesisoojuspump kinnistutele, R290'),
         s=[('Lämmitysteho', 'Küttevõimsus', '40 kW', '40 kW'), ('Menovesi', 'Pealevool', '75 °C vielä −15 °C:ssa', '75 °C ka −15 °C juures'),
            ('Kylmäaine', 'Külmaaine', 'R290', 'R290'), ('Kytkentä', 'Ühendus', 'useita yksiköitä rinnan', 'mitu seadet paralleelis')]),
    dict(id='me-cahv-r450', mk='Mitsubishi Electric', model='CAHV-R450', cats=['lampo'], src='me-r450',
         alt=('Mitsubishi Electric CAHV-R450 -ulkoyksikkö, kuva: Mitsubishi Electric', 'Mitsubishi Electric CAHV-R450 välisseade, foto: Mitsubishi Electric'),
         t=('Ilma-vesilämpöpumppu kiinteistöihin, R454C', 'Õhk-vesisoojuspump kinnistutele, R454C'),
         s=[('Lämmitysteho', 'Küttevõimsus', '40 kW (6,7–43 kW)', '40 kW (6,7–43 kW)'), ('Menovesi', 'Pealevool', '70 °C vielä −20 °C:ssa', '70 °C ka −20 °C juures'),
            ('Kylmäaine', 'Külmaaine', 'R454C', 'R454C'), ('Ohjaus', 'Juhtimine', 'Modbus tai BACnet', 'Modbus või BACnet')]),
    dict(id='me-large-hydrobox', mk='Mitsubishi Electric', model='Large Hydrobox E', cats=['lampo'], src='me-lhb',
         alt=('Mitsubishi Electric Ecodan -sisäyksikkö, kuva: Mitsubishi Electric', 'Mitsubishi Electric Ecodan siseseade, foto: Mitsubishi Electric'),
         t=('Ilma-vesilämpöpumppu suurempiin kiinteistöihin', 'Õhk-vesisoojuspump suurematele kinnistutele'),
         s=[('Lämmitysteho', 'Küttevõimsus', '23 kW (11,4–28 kW)', '23 kW (11,4–28 kW)'), ('SCOP, 35 °C', 'SCOP, 35 °C', '4,25', '4,25'),
            ('Lämmitys', 'Küte', '−28 °C:een asti', 'kuni −28 °C'), ('Jäähdytys', 'Jahutus', '20 kW', '20 kW')]),
    dict(id='me-p-sarja', mk='Mitsubishi Electric', model='P-sarja', model_et='P-seeria', cats=['lampo'], src='me-p',
         alt=('Mitsubishi Electric PCA-M -kattomallin sisäyksikkö, kuva: Mitsubishi Electric', 'Mitsubishi Electric PCA-M lae-siseseade, foto: Mitsubishi Electric'),
         t=('Ilmalämpöpumput suuriin tiloihin: PCA, PKA, PLA ja PEAD', 'Õhksoojuspumbad suurtesse ruumidesse: PCA, PKA, PLA ja PEAD'),
         s=[('Lämmitysteho', 'Küttevõimsus', 'nimellinen 8–27 kW', 'nimivõimsus 8–27 kW'), ('SCOP', 'SCOP', 'enintään 4,8', 'kuni 4,8'),
            ('Kylmäaine', 'Külmaaine', 'R32', 'R32'), ('Järjestelmät', 'Süsteemid', 'myös Twin ja Triple', 'ka Twin ja Triple')]),
    dict(id='me-wdh', mk='Mitsubishi Electric', model='WDH', cats=['lampo'], src='me-wdh',
         alt=('Mitsubishi Electric WDH -kiertoilmakoje, kuva: Mitsubishi Electric', 'Mitsubishi Electric WDH ringlusõhuseade, foto: Mitsubishi Electric'),
         t=('Kiertoilmakoje halleihin ja teollisuustiloihin', 'Ringlusõhuseade hallidele ja tööstusruumidele'),
         s=[('Lämmitysteho', 'Küttevõimsus', 'nimellinen 8–27 kW', 'nimivõimsus 8–27 kW'), ('Kytkentä', 'Ühendus', '1–3 laitetta ulkoyksikköön', '1–3 seadet välisseadmele'),
            ('Jäähdytys', 'Jahutus', '7,1–27 kW', '7,1–27 kW')]),
    dict(id='me-idh', mk='Mitsubishi Electric', model='IDH125-D / IDH250-D', cats=['lampo'], src='me-idh', photo=True,
         alt=('Kiertoilmakoje korjaamohallin katossa, kuva: Mitsubishi Electric', 'Ringlusõhuseade remonditöökoja lae all, foto: Mitsubishi Electric'),
         t=('Kiertoilmakoje suuriin halleihin', 'Ringlusõhuseade suurtele hallidele'),
         s=[('Lämmitysteho', 'Küttevõimsus', 'nimellinen 14–27 kW', 'nimivõimsus 14–27 kW'), ('Ilmavirta', 'Õhuvool', '2 750–4 100 m³/h', '2 750–4 100 m³/h'),
            ('Kylmäaine', 'Külmaaine', 'R410A tai R32', 'R410A või R32')]),
    dict(id='me-pac-if013', mk='Mitsubishi Electric', model='PAC-IF013B-E', cats=['lampo'], src='me-pac',
         alt=('Mitsubishi Electric PAC-IF013 -tuloilmalämpöpumppu ilmanvaihtokoneeseen kytkettynä, kuva: Mitsubishi Electric', 'Mitsubishi Electric PAC-IF013 sissepuhkeõhu soojuspump ventilatsiooniseadmega, foto: Mitsubishi Electric'),
         t=('Tuloilmalämpöpumppu ilmanvaihtokoneeseen', 'Sissepuhkeõhu soojuspump ventilatsiooniseadmele'),
         s=[('Lämmitysteho', 'Küttevõimsus', 'nimellinen 4,1–27 kW', 'nimivõimsus 4,1–27 kW'), ('Lämmitys', 'Küte', '−28 °C:een asti', 'kuni −28 °C'),
            ('Kylmäaine', 'Külmaaine', 'R32', 'R32')]),
    dict(id='me-ecodan-e', mk='Mitsubishi Electric', model='Ecodan E', cats=['lampo'], src='me-ecodan',
         alt=('Mitsubishi Electric Ecodan -sisäyksikkö, kuva: Mitsubishi Electric', 'Mitsubishi Electric Ecodan siseseade, foto: Mitsubishi Electric'),
         t=('Ilma-vesilämpöpumppu', 'Õhk-vesisoojuspump'),
         s=[('Menovesi', 'Pealevool', 'enintään 70 °C', 'kuni 70 °C'), ('Lämmitys', 'Küte', '−30 °C:een asti', 'kuni −30 °C'),
            ('Kylmäaine', 'Külmaaine', 'R32', 'R32')]),
    dict(id='me-geodan', mk='Mitsubishi Electric', model='Geodan', cats=['lampo'], src='me-geodan',
         alt=('Mitsubishi Electric Geodan -maalämpöpumppu, kuva: Mitsubishi Electric', 'Mitsubishi Electric Geodan maasoojuspump, foto: Mitsubishi Electric'),
         t=('Maalämpöpumppu', 'Maasoojuspump'),
         s=[('Lämmitysteho', 'Küttevõimsus', '1,5–11 kW', '1,5–11 kW'), ('SCOP, 35 °C', 'SCOP, 35 °C', '5,86 kylmässä ilmastossa', '5,86 külmas kliimas'),
            ('Energialuokka', 'Energiaklass', 'A+++', 'A+++'), ('Kylmäaine', 'Külmaaine', 'R32', 'R32')]),
    # v57b: Raloksen tuotekatalogi (ralos.fi/tuotekatalogi, luettu 9.11.2026)
    dict(id='ralos-mini-beast-50', mk='Ralos', model='Mini-Beast 50', cats=['hybridi', 'varavoima'], src='r-minibeast',
         alt=('Ralos Mini-Beast 50 -energiavarastokaappi, kuva: Ralos Oy', 'Ralos Mini-Beast 50 salvestikapp, foto: Ralos Oy'),
         t=('Energiavarasto keskisuuriin kiinteistöihin, hybridi-invertterillä', 'Salvesti keskmistele kinnistutele, hübriidinverteriga'),
         s=[('Teho', 'Võimsus', '50 kW', '50 kW'), ('Energia', 'Energia', '102 kWh', '102 kWh'),
            ('Varavoima', 'Varutoide', 'oma lähtö, UPS-toiminto', 'oma väljund, UPS-funktsioon'), ('Aurinkosähkö', 'Päikeseelekter', 'suoraan invertteriin', 'otse inverterisse')]),
    dict(id='hoymiles-hione', mk='Hoymiles', model='HiOne', cats=['pieni'], src='r-hione',
         alt=('Hoymiles HiOne -energiavarasto, kuva: Hoymiles', 'Hoymiles HiOne salvesti, foto: Hoymiles'),
         t=('Kolmivaiheinen all-in-one-varasto kotiin ja pieneen yritykseen', 'Kolmefaasiline all-in-one salvesti kodule ja väikeettevõttele'),
         s=[('Teho', 'Võimsus', '8–20 kW', '8–20 kW'), ('Energia', 'Energia', '8–32 kWh tornissa, enintään 64 kWh', '8–32 kWh tornis, kuni 64 kWh'),
            ('Kotelointi', 'Kaitseaste', 'IP66', 'IP66'), ('Takuu', 'Garantii', '10 vuotta', '10 aastat')]),
    dict(id='hoymiles-lb-16d-g3', mk='Hoymiles', model='LB-16D-G3', cats=['pieni'], src='r-lb16',
         alt=('Hoymiles LB-16D-G3 -akku, kuva: Hoymiles', 'Hoymiles LB-16D-G3 aku, foto: Hoymiles'),
         t=('Matalajänniteakku hybridi-invertterille', 'Madalpingeaku hübriidinverterile'),
         s=[('Energia', 'Energia', '16 kWh', '16 kWh'), ('Laajennus', 'Laiendus', 'enintään 16 rinnan, 256 kWh', 'kuni 16 paralleelis, 256 kWh'),
            ('Jännite', 'Pinge', '51,2 V', '51,2 V'), ('Kotelointi', 'Kaitseaste', 'IP65', 'IP65')]),
    dict(id='enershare-core', mk='Enershare', model='CORE', cats=['pieni'], src='r-enershare', white=True,
         alt=('Enershare CORE -akkutorni, kuva: Enershare', 'Enershare CORE akutorn, foto: Enershare'),
         t=('Pinottava korkeajänniteakku', 'Virnastatav kõrgepingeaku'),
         s=[('Energia', 'Energia', '9,6–25,6 kWh tornissa', '9,6–25,6 kWh tornis'), ('Rinnan', 'Paralleelis', 'enintään 153,6 kWh', 'kuni 153,6 kWh'),
            ('Syklit', 'Tsüklid', 'vähintään 6 000', 'vähemalt 6 000'), ('Kotelointi', 'Kaitseaste', 'IP65', 'IP65')]),
    dict(id='pytes-pilv1', mk='Pytes', model='PiLV1', cats=['pieni'], src='r-pilv1',
         alt=('Pytes PiLV1 -akkutorni, kuva: Pytes', 'Pytes PiLV1 akutorn, foto: Pytes'),
         t=('Pinottava matalajänniteakku', 'Virnastatav madalpingeaku'),
         s=[('Energia', 'Energia', '5,12–30,72 kWh tornissa', '5,12–30,72 kWh tornis'), ('Rinnan', 'Paralleelis', 'enintään 8 tornia', 'kuni 8 torni'),
            ('Jännite', 'Pinge', '51,2 V', '51,2 V'), ('Syklit', 'Tsüklid', 'vähintään 6 000', 'vähemalt 6 000')]),
    dict(id='pytes-v16', mk='Pytes', model='V16', cats=['pieni'], src='r-v16',
         alt=('Pytes V16 -akku, kuva: Pytes', 'Pytes V16 aku, foto: Pytes'),
         t=('Matalajänniteakku myös ulkoasennukseen', 'Madalpingeaku ka välipaigalduseks'),
         s=[('Energia', 'Energia', '16,07 kWh', '16,07 kWh'), ('Purkuteho', 'Tühjendusvõimsus', 'jatkuva 10,24 kW', 'pidev 10,24 kW'),
            ('Kotelointi', 'Kaitseaste', 'IP66', 'IP66'), ('Syklit', 'Tsüklid', 'vähintään 8 000', 'vähemalt 8 000')]),
    dict(id='atmoce-m-elv', mk='Atmoce', model='M-ELV', cats=['pieni'], src='r-melv',
         alt=('Atmoce M-ELV -akku, kuva: Atmoce', 'Atmoce M-ELV aku, foto: Atmoce'),
         t=('Matalajänniteakku integroidulla invertterillä', 'Madalpingeaku integreeritud inverteriga'),
         s=[('Energia', 'Energia', '7 kWh', '7 kWh'), ('Teho', 'Võimsus', '4,5 kVA jatkuva', '4,5 kVA pidev'),
            ('Laajennus', 'Laiendus', 'enintään 126 kWh', 'kuni 126 kWh'), ('Takuu', 'Garantii', '15 vuotta', '15 aastat')]),
    dict(id='raystech-rt16076mplus', mk='Raystech', model='RT16076MPlus', cats=['pieni'], src='r-rt16076',
         alt=('Raystech RT16076MPlus -akku, kuva: Raystech', 'Raystech RT16076MPlus aku, foto: Raystech'),
         t=('Matalajänniteakku', 'Madalpingeaku'),
         s=[('Energia', 'Energia', '14,95 kWh', '14,95 kWh'), ('Syklit', 'Tsüklid', 'yli 16 000', 'üle 16 000'),
            ('Kotelointi', 'Kaitseaste', 'IP65', 'IP65'), ('Paino', 'Kaal', '124 kg', '124 kg')]),
    dict(id='hoymiles-hit', mk='Hoymiles', model='HiT-(5–20)L-G3', cats=['invertteri'], src='r-hit',
         alt=('Hoymiles HiT -hybridi-invertteri, kuva: Hoymiles', 'Hoymiles HiT hübriidinverter, foto: Hoymiles'),
         t=('Kolmivaiheinen hybridi-invertteri matalajänniteakuille', 'Kolmefaasiline hübriidinverter madalpingeakudele'),
         s=[('Teho', 'Võimsus', '5–20 kW', '5–20 kW'), ('MPPT', 'MPPT', 'enintään 4', 'kuni 4'),
            ('DC/AC', 'DC/AC', 'enintään 200 %', 'kuni 200 %'), ('Epäsymmetria', 'Asümmeetria', '100 %', '100 %')]),
    dict(id='hoymiles-hyt-hat', mk='Hoymiles', model='HYT-HV', cats=['invertteri'], src='r-hyt',
         alt=('Hoymiles HYT-HV -hybridi-invertteri, kuva: Hoymiles', 'Hoymiles HYT-HV hübriidinverter, foto: Hoymiles'),
         t=('Kolmivaiheinen hybridi-invertteri korkeajänniteakuille', 'Kolmefaasiline hübriidinverter kõrgepingeakudele'),
         s=[('Teho', 'Võimsus', '5–12 kW', '5–12 kW'), ('Akkujännite', 'Akupinge', '170–600 V', '170–600 V'),
            ('Varavoima', 'Varutoide', 'alle 10 ms', 'alla 10 ms'), ('Hyötysuhde', 'Kasutegur', 'enintään 98,0 %', 'kuni 98,0 %')]),
    dict(id='hoymiles-mit', mk='Hoymiles', model='MiT', cats=['mikro'], src='r-mit',
         alt=('Hoymiles MiT -mikroinvertteri, kuva: Hoymiles', 'Hoymiles MiT mikroinverter, foto: Hoymiles'),
         t=('Kolmivaiheinen mikroinvertteri teollisuuskohteisiin', 'Kolmefaasiline mikroinverter tööstusobjektidele'),
         s=[('AC-teho', 'AC-võimsus', '3 000–5 000 W', '3 000–5 000 W'), ('Hyötysuhde', 'Kasutegur', '96,5 % (CEC)', '96,5 % (CEC)'),
            ('DC-jännite', 'DC-pinge', 'alle 65 V', 'alla 65 V'), ('Takuu', 'Garantii', '12 vuotta, laajennettavissa 25 vuoteen', '12 aastat, pikendatav 25 aastani')]),
    dict(id='hoymiles-hmt', mk='Hoymiles', model='HMT', cats=['mikro'], src='r-hmt',
         alt=('Hoymiles HMT -mikroinvertteri, kuva: Hoymiles', 'Hoymiles HMT mikroinverter, foto: Hoymiles'),
         t=('Kolmivaiheinen mikroinvertteri neljälle paneelille', 'Kolmefaasiline mikroinverter neljale paneelile'),
         s=[('AC-teho', 'AC-võimsus', '1 600–2 000 W', '1 600–2 000 W'), ('Hyötysuhde', 'Kasutegur', '96,5 % (CEC)', '96,5 % (CEC)'),
            ('DC-jännite', 'DC-pinge', 'alle 65 V', 'alla 65 V'), ('Kotelointi', 'Kaitseaste', 'IP67', 'IP67')]),
    dict(id='hoymiles-hms', mk='Hoymiles', model='HMS', cats=['mikro'], src='r-hms',
         alt=('Hoymiles HMS -mikroinvertteri, kuva: Hoymiles', 'Hoymiles HMS mikroinverter, foto: Hoymiles'),
         t=('Yksivaiheinen mikroinvertteri', 'Ühefaasiline mikroinverter'),
         s=[('AC-teho', 'AC-võimsus', '400–2 000 W', '400–2 000 W'), ('Hyötysuhde', 'Kasutegur', '96,5 % (CEC)', '96,5 % (CEC)'),
            ('DC-jännite', 'DC-pinge', 'alle 65 V', 'alla 65 V'), ('Jännite', 'Pinge', '230 V', '230 V')]),
    dict(id='hoymiles-mis', mk='Hoymiles', model='MiS', cats=['mikro'], src='r-mis',
         alt=('Hoymiles MiS -mikroinvertteri, kuva: Hoymiles', 'Hoymiles MiS mikroinverter, foto: Hoymiles'),
         t=('Suuritehoinen yksivaiheinen mikroinvertteri', 'Suure võimsusega ühefaasiline mikroinverter'),
         s=[('AC-teho', 'AC-võimsus', '2 250–2 750 W', '2 250–2 750 W'), ('Hyötysuhde', 'Kasutegur', '96,5 % (CEC)', '96,5 % (CEC)'),
            ('DC-jännite', 'DC-pinge', 'alle 65 V', 'alla 65 V'), ('Paneelit', 'Paneelid', 'yli 600 W', 'üle 600 W')]),
    dict(id='atmoce-mi', mk='Atmoce', model='MI-sarja', model_et='MI-seeria', cats=['mikro'], src='r-atmoce',
         alt=('Atmoce-mikroinvertteri, kuva: Atmoce', 'Atmoce mikroinverter, foto: Atmoce'),
         t=('Mikroinvertteri pientaloihin', 'Mikroinverter väikeelamutele'),
         s=[('Paneelit', 'Paneelid', 'enintään 700 W', 'kuni 700 W'), ('Hyötysuhde', 'Kasutegur', 'huippu 97,4 %', 'tipp 97,4 %'),
            ('Kotelointi', 'Kaitseaste', 'IP67', 'IP67'), ('Takuu', 'Garantii', '25 vuotta', '25 aastat')]),
    dict(id='hanersun-450', mk='Hanersun', model='HiTouch 450 Wp', cats=['paneeli'], src='r-h450',
         alt=('Hanersun HiTouch -aurinkopaneeli, kuva: Hanersun', 'Hanersun HiTouch päikesepaneel, foto: Hanersun'),
         t=('Täysmusta aurinkopaneeli', 'Täismust päikesepaneel'),
         s=[('Teho', 'Võimsus', '450 Wp', '450 Wp'), ('Hyötysuhde', 'Kasutegur', '22,5 %', '22,5 %'),
            ('Takuu', 'Garantii', 'tuote 15 v, teho 30 v', 'toode 15 a, võimsus 30 a'), ('Koko', 'Mõõdud', '1,76 × 1,13 m', '1,76 × 1,13 m')]),
    dict(id='hanersun-500', mk='Hanersun', model='HiTouch 500 Wp', cats=['paneeli'], src='r-h500',
         alt=('Hanersun HiTouch -aurinkopaneeli, kuva: Hanersun', 'Hanersun HiTouch päikesepaneel, foto: Hanersun'),
         t=('Täysmusta aurinkopaneeli', 'Täismust päikesepaneel'),
         s=[('Teho', 'Võimsus', '500 Wp', '500 Wp'), ('Hyötysuhde', 'Kasutegur', '22,5 %', '22,5 %'),
            ('Takuu', 'Garantii', 'tuote 15 v, teho 30 v', 'toode 15 a, võimsus 30 a'), ('Koko', 'Mõõdud', '1,96 × 1,13 m', '1,96 × 1,13 m')]),
    dict(id='hanersun-620', mk='Hanersun', model='HiTouch 620 Wp', cats=['paneeli'], src='r-h620',
         alt=('Hanersun HiTouch 620 -aurinkopaneeli edestä ja takaa, kuva: Hanersun', 'Hanersun HiTouch 620 päikesepaneel eest ja tagant, foto: Hanersun'),
         t=('Suuritehoinen aurinkopaneeli tasakatoille', 'Suure võimsusega päikesepaneel lamekatustele'),
         s=[('Teho', 'Võimsus', '620 Wp', '620 Wp'), ('Hyötysuhde', 'Kasutegur', '23 %', '23 %'),
            ('Takuu', 'Garantii', 'tuote 15 v, teho 30 v', 'toode 15 a, võimsus 30 a'), ('Koko', 'Mõõdud', '2,38 × 1,13 m', '2,38 × 1,13 m')]),
    dict(id='hanersun-725', mk='Hanersun', model='HiTouch 725 Wp', cats=['paneeli'], src='r-h725',
         alt=('Hanersun HiTouch 725 -aurinkopaneeli edestä ja takaa, kuva: Hanersun', 'Hanersun HiTouch 725 päikesepaneel eest ja tagant, foto: Hanersun'),
         t=('Suuritehoinen aurinkopaneeli suuriin kohteisiin', 'Suure võimsusega päikesepaneel suurtele objektidele'),
         s=[('Teho', 'Võimsus', '725 Wp', '725 Wp'), ('Hyötysuhde', 'Kasutegur', '23,3 %', '23,3 %'),
            ('Takuu', 'Garantii', 'tuote 15 v, teho 30 v', 'toode 15 a, võimsus 30 a'), ('Koko', 'Mõõdud', '2,38 × 1,13 m', '2,38 × 1,13 m')]),
    dict(id='overeasy-xm3', mk='Over Easy', model='xM-3', cats=['paneeli'], src='r-overeasy',
         alt=('Over Easy xM-3 -paneelirivit viherkatolle, kuva: Over Easy', 'Over Easy xM-3 paneeliread rohekatusele, foto: Over Easy'),
         t=('Kaksipuolinen aurinkovoimala viherkatolle', 'Kahepoolne päikesejaam rohekatusele'),
         s=[('Teho', 'Võimsus', '256 W yksikköä kohden', '256 W seadme kohta'), ('Kaksipuolisuus', 'Kahepoolsus', '95 %', '95 %'),
            ('Koko', 'Mõõdud', '1,58 × 1,49 m', '1,58 × 1,49 m'), ('Paino', 'Kaal', 'noin 28 kg', 'umbes 28 kg')]),
    # v57b: Avant Powerin kiinteä energiavarasto ja integroitu pikalataus (avantpower.fi/optigrid, luettu 9.11.2026)
    # 9.11.2026 (Martin): tuote on Avant Powerin kiinteä energiavarasto, ei OptiGrid. OptiGrid™ on Avantin mikroverkko- ja
    # energianhallinta-alusta (DC-verkko, varastot, lataus, OptiGrid Cloud), jossa varasto on "saatavilla erikseen" ja toimii
    # myös itsenäisenä (avantpower.fi/optigrid, Energiavarastointi-ikkuna, luettu 9.11.2026). Kuva = Avantin BESS-tuotekuva
    # (wp-content/uploads/2026/09/BESS-1.avif), rajattu neliöksi; aiempi kuva oli OptiGrid-havainnekuvan rajaus.
    dict(id='avant-power-bess', mk='Avant Power', model='Kiinteä energiavarasto', model_et='Statsionaarne energiasalvesti', cats=['kontti'], src='avant-ogs', photo=True,
         alt=('Avant Powerin kiinteä energiavarasto, vihreä ulkokotelo, kuva: Avant Power', 'Avant Poweri statsionaarne energiasalvesti, roheline välikorpus, foto: Avant Power'),
         t=('Kiinteä energiavarasto uppojäähdytyksellä, myös pikalatauksella', 'Statsionaarne salvesti sukeljahutusega, ka kiirlaadimisega'),
         s=[('Koot', 'Suurused', '200 kW / 250 kWh tai 400 kW / 500 kWh', '200 kW / 250 kWh või 400 kW / 500 kWh'),
            ('Pikalataus', 'Kiirlaadimine', 'integroitu, 200–600 kW', 'integreeritud, 200–600 kW'),
            ('Jäähdytys', 'Jahutus', 'uppojäähdytys', 'sukeljahutus'), ('Käyttö', 'Kasutus', 'osana OptiGrid-mikroverkkoa tai itsenäisenä', 'OptiGridi mikrovõrgu osana või iseseisvalt')]),
    # v57b: Gare Energy Oy (vain FI) ja Scanofficen kotilataus ja -akut
    dict(id='gare-solar-carport', mk='Gare Energy', model='Gare Solar Carport', cats=['katos'], src='gare-carport', photo=True, langs=['fi'],
         alt=('Gare Solar Carport -aurinkokatos autojen päällä, kuva: Gare Energy Oy', ''),
         t=('Aurinkokatos 2–8 autolle, lataus ja varasto lisävarusteena', ''),
         s=[('Teho', '', '8,78 kWp kahdelle autolle', ''), ('Autopaikat', '', '2, 4, 6 tai 8', ''),
            ('Pinnoite', '', 'Magnelis', ''), ('Takuu', '', 'rakenne 10 v, paneelit 25 v', '')]),
    dict(id='easee-charge-max', mk='Easee', model='Charge Max', cats=['koti'], src='easee-max',
         alt=('Easee Charge Max -latausasema, kuva: Easee', 'Easee Charge Max laadimisjaam, foto: Easee'),
         t=('AC-latausasema kotiin ja pieneen kohteeseen', 'AC-laadimisjaam kodule ja väikeobjektile'),
         s=[('Teho', 'Võimsus', 'enintään 22 kW', 'kuni 22 kW'), ('Mittari', 'Arvesti', 'MID, luokka B', 'MID, klass B'),
            ('Kotelointi', 'Kaitseaste', 'IP54, IK10', 'IP54, IK10'), ('Rajapinta', 'Liides', 'OCPP 1.6J', 'OCPP 1.6J')]),
    dict(id='beny-bcp', mk='BENY', model='BCP-sarja', model_et='BCP-seeria', cats=['koti'], src='beny',
         alt=('BENY-latausasema latauskaapelilla, kuva: BENY', 'BENY laadimisjaam laadimiskaabliga, foto: BENY'),
         t=('AC-latausasema kotiin ja vapaa-ajan kohteisiin', 'AC-laadimisjaam kodule ja puhkeobjektidele'),
         s=[('Teho', 'Võimsus', 'enintään 22 kW', 'kuni 22 kW'), ('Kuormanhallinta', 'Koormuse juhtimine', 'dynaaminen, myös langaton', 'dünaamiline, ka juhtmevaba'),
            ('Ohjaus', 'Juhtimine', 'puhelinsovellus', 'telefonirakendus')]),
    dict(id='solax-x3-t30', mk='SolaX', model='X3-Hybrid G4 ja T30', cats=['pieni'], src='solax',
         alt=('SolaX-hybridi-invertteri ja akku, kuva: SolaX', 'SolaX hübriidinverter ja aku, foto: SolaX'),
         t=('Hybridi-invertteri ja akku kotiin ja pienkohteisiin', 'Hübriidinverter ja aku kodule ja väikeobjektidele'),
         s=[('Teho', 'Võimsus', '5–15 kW', '5–15 kW'), ('Akku', 'Aku', '3,1–12,3 kWh', '3,1–12,3 kWh'),
            ('Kotelointi', 'Kaitseaste', 'IP65', 'IP65'), ('Rinnan', 'Paralleelis', 'enintään 150 kW', 'kuni 150 kW')]),
    # v58b: loput tuotesivut (Ralos, Scanoffice, Gare Energy Oy), luettu 9.11.2026
    dict(id='tongwei-725', mk='Tongwei', model='TWMNF-66HD 725 Wp', cats=['paneeli'], src='r-tongwei',
         alt=('Tongwei 725 Wp -aurinkopaneeli, kuva: Tongwei', 'Tongwei 725 Wp päikesepaneel, foto: Tongwei'),
         t=('Kaksipuolinen lasi-lasipaneeli suuriin kohteisiin, TNC-kennot', 'Kahepoolne klaas-klaas paneel suurtele objektidele, TNC-elemendid'),
         s=[('Teho', 'Võimsus', '725 Wp', '725 Wp'), ('Hyötysuhde', 'Kasutegur', '23,3 %', '23,3 %'),
            ('Takuu', 'Garantii', 'tuote 12 v, teho 30 v', 'toode 12 a, võimsus 30 a'), ('Koko', 'Mõõdud', '2,38 × 1,30 m', '2,38 × 1,30 m')]),
    dict(id='ralos-stalker', mk='Ralos', model='Stalker 2.0', cats=['seuraaja'], src='r-stalker', photo=True,
         alt=('Ralos Stalker -aurinkoseuraajan paneelit alhaalta kuvattuna, kuva: Ralos Oy', 'Ralos Stalker päikesejälgija paneelid altvaates, foto: Ralos Oy'),
         t=('Kaksiakselinen aurinkoseuraaja mikroinverttereillä', 'Kaheteljeline päikesejälgija mikroinverteritega'),
         s=[('Teho', 'Võimsus', '3,72 kWp', '3,72 kWp'), ('Paneelit', 'Paneelid', '6 × Hanersun 620 Wp, kaksipuolinen', '6 × Hanersun 620 Wp, kahepoolne'),
            ('Invertterit', 'Inverterid', '2 × Hoymiles HMT-2000', '2 × Hoymiles HMT-2000'), ('Asennusala', 'Paigaldusala', '7 × 7 m', '7 × 7 m')]),
    dict(id='atmoce-battbank', mk='Atmoce', model='BattBank', cats=['pieni', 'varavoima'], src='r-battbank', photo=True,
         alt=('Kaksi Atmoce BattBank -akkutornia seinän vieressä, kuva: Ralos Oy', 'Kaks Atmoce BattBank akutorni seina ääres, foto: Ralos Oy'),
         t=('Modulaarinen akusto ja varavoima maatiloille, taloyhtiöille ja yrityksille', 'Modulaarne aku ja varutoide taludele, korteriühistutele ja ettevõtetele'),
         s=[('Teho', 'Võimsus', '8–40 kW', '8–40 kW'), ('Energia', 'Energia', '16–80 kWh tornissa', '16–80 kWh tornis'),
            ('Varavoima', 'Varutoide', 'alle 10 ms', 'alla 10 ms'), ('Akkujännite', 'Akupinge', 'alle 60 V DC, IP66', 'alla 60 V DC, IP66')]),
    dict(id='enershare-active16', mk='Enershare', model='Active16', cats=['pieni'], src='r-active16',
         alt=('Enershare Active16 -akku, kuva: Enershare', 'Enershare Active16 aku, foto: Enershare'),
         t=('Lattialle sijoitettava matalajänniteakku', 'Põrandale paigaldatav madalpingeaku'),
         s=[('Energia', 'Energia', '16,08 kWh, käytettävissä 14,5 kWh', '16,08 kWh, kasutatav 14,5 kWh'), ('Laajennus', 'Laiendus', 'yli 10 rinnan', 'üle 10 paralleelis'),
            ('Syklit', 'Tsüklid', 'vähintään 8 000', 'vähemalt 8 000'), ('Kotelointi', 'Kaitseaste', 'IP54', 'IP54')]),
    dict(id='raedian-nora', mk='Raedian', model='Nora', cats=['koti'], src='so-raedian',
         alt=('Raedian Nora -latausasemat kaapelilla ja voimavirtapistokkeella, kuva: Raedian', 'Raedian Nora laadimisjaamad kaabli ja jõupistikuga, foto: Raedian'),
         t=('AC-latausasema kotiin, myös voimavirtapistokkeella', 'AC-laadimisjaam kodule, ka jõupistikuga'),
         s=[('Teho', 'Võimsus', 'kiinteä enintään 22 kW, pistoke 11 kW', 'püsiühendus kuni 22 kW, pistik 11 kW'),
            ('Kuormanhallinta', 'Koormuse juhtimine', 'dynaaminen, langaton', 'dünaamiline, juhtmevaba'),
            ('Ohjaus', 'Juhtimine', 'ajastus ja aurinkosähkö', 'ajastus ja päikeseelekter'), ('Kotelointi', 'Kaitseaste', 'IP55', 'IP55')]),
    dict(id='roofit-nuclick', mk='Roofit.Solar', model='NuClick 2.0', cats=['katto'], src='gare-nuclick', langs=['fi'],
         alt=('Roofit.Solar NuClick 2.0 -aurinkokattomoduuli edestä ja takaa, kuva: Roofit.Solar', ''),
         t=('Aurinkokattomoduuli lukkosaumakattoon, Suomessa toimittaa Gare Energy Oy', ''),
         s=[('Teho', '', '120 W tai 180 W / moduuli', ''), ('Saumaus', '', 'lukkosauma, Ruukki Classic C', ''),
            ('Paloluokka', '', 'Class A', ''), ('Takuu', '', 'tuote 10 v, teho 25 v', '')]),
]

CATS = {
    'varastot': [
        ('kaikki', 'Kaikki', 'Kõik'),
        ('kaappi', 'Ulkokaapit', 'Väliskapid'),
        ('hybridi', 'Hybridikaapit', 'Hübriidkapid'),
        ('kontti', 'Kontit ja suuret varastot', 'Konteinerid ja suured salvestid'),
        ('siirrettava', 'Siirrettävät', 'Teisaldatavad'),
        ('varavoima', 'Varavoima', 'Varutoide'),
        ('pieni', 'Pienkohteet', 'Väikeobjektid'),
    ],
    'aurinko': [
        ('kaikki', 'Kaikki', 'Kõik'),
        ('paneeli', 'Aurinkopaneelit', 'Päikesepaneelid'),
        ('katto', 'Aurinkokatto', 'Päikesekatus'),
        ('katos', 'Aurinkokatos', 'Päikesevarjualune'),
        ('seuraaja', 'Aurinkoseuraaja', 'Päikesejälgija'),
        ('mikro', 'Mikroinvertterit', 'Mikroinverterid'),
        ('invertteri', 'Invertterit', 'Inverterid'),
        ('hybridi', 'Aurinko ja varasto', 'Päike ja salvesti'),
    ],
    'lataus': [
        ('kaikki', 'Kaikki', 'Kõik'),
        ('ac', 'AC-lataus', 'AC-laadimine'),
        ('dc', 'DC-pikalataus', 'DC-kiirlaadimine'),
        ('akku', 'Varaston kanssa', 'Salvestiga'),
        ('siirrettava', 'Siirrettävät', 'Teisaldatavad'),
        ('katos', 'Aurinkokatos', 'Päikesevarjualune'),
        ('koti', 'Kotiin', 'Kodule'),
    ],
    'kaikki': [
        ('kaikki', 'Kaikki', 'Kõik'),
        ('varasto', 'Energiavarastot', 'Energiasalvestid'),
        ('lataus', 'Lataus', 'Laadimine'),
        ('aurinko', 'Aurinkosähkö', 'Päikeseelekter'),
        ('lampo', 'Lämpöpumput', 'Soojuspumbad'),
        ('siirrettava', 'Siirrettävät', 'Teisaldatavad'),
        ('varavoima', 'Varavoima', 'Varutoide'),
        ('pieni', 'Pienkohteet', 'Väikeobjektid'),
    ],
}

# Valmistajat ja tuotteet, joita ei näytetä julkisesti (data säilyy, palautus yhdellä rivillä):
#  * EP Energy: piilossa perustajan päätöksellä 9.11.2026 klo 12.59; palautus perustajan päätöksellä
#  * Ralos RLS-585: ei Raloksen tuotekatalogissa 9.11.2026
PIILOTETUT_VALMISTAJAT = {'EP Energy'}
PIILOTETUT = {'ralos-rls-585'}
def nakyy(p): return p['mk'] not in PIILOTETUT_VALMISTAJAT and p['id'] not in PIILOTETUT

NOTE_AURINKO = {
    'fi': 'Tekniset tiedot ovat valmistajien datalehdiltä ja esitteistä. Paneelit, voimalan koko ja invertterit valitaan kohteenne kulutuksen, katon ja liittymän mukaan, '
          'ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla. Varavoima koskee valittuja piirejä, jotka suunnitellaan kohdekäynnillä.',
    'et': 'Tehnilised andmed on tootjate andmelehtedelt ja brošüüridelt. Paneelid, jaama suurus ja inverterid valitakse teie objekti tarbimise, katuse ja liitumise järgi '
          'ning variante võrreldakse kirjalikus hinnangus samade numbritega. Varutoide hõlmab valitud ahelaid, mis kavandatakse objektikülastusel.',
}
NOTE_LATAUS = {
    'fi': 'Tekniset tiedot ovat valmistajien datalehdiltä. Latauspisteiden määrä, teho ja kuormanhallinta mitoitetaan pysäköinnin, käytön ja liittymän mukaan, '
          'ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla.',
    'et': 'Tehnilised andmed on tootjate andmelehtedelt. Laadimispunktide arv, võimsus ja koormuse juhtimine valitakse parkla, kasutuse ja liitumise järgi '
          'ning variante võrreldakse kirjalikus hinnangus samade numbritega.',
}
NOTE_KAIKKI = {
    'fi': 'Tekniset tiedot ovat valmistajien datalehdiltä, esitteistä ja tuotesivuilta. Valmistaja ja malli valitaan kohteenne kulutuksen, liittymän ja tilan mukaan, '
          'ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla. Pienkohteiden ja kotien tuotteet löytyvät omalla suodattimellaan.',
    'et': 'Tehnilised andmed on tootjate andmelehtedelt, brošüüridelt ja tootelehtedelt. Tootja ja mudel valitakse teie objekti tarbimise, liitumise ja ruumi järgi '
          'ning variante võrreldakse kirjalikus hinnangus samade numbritega. Väikeobjektide ja kodude tooted leiate eraldi filtri alt.',
}

TXT = {
    'fi': dict(src='Lähde', read='luettu', checked='tarkistettu', group='Tuoteryhmä', tab='Näytä',
               note='Tekniset tiedot ovat valmistajien datalehdiltä ja tuotesivuilta. Varavoima koskee valittuja piirejä, jotka suunnitellaan kohdekäynnillä. '
                    'Valmistaja ja malli valitaan kohteenne kulutuksen, liittymän ja tilan mukaan, ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla.',
               more='Muut mallit ja ratkaisut', more_l='Tiedot valmistajien tuotesivuilta ja tiedotteista.',
               cols=('Malli', 'Tyyppi', 'Päätiedot', 'Lähde')),
    'et': dict(src='Allikas', read='loetud', checked='kontrollitud', group='Tooterühm', tab='Näita',
               note='Tehnilised andmed on tootjate andmelehtedelt ja tootelehtedelt. Varutoide hõlmab valitud ahelaid, mis kavandatakse objektikülastusel. '
                    'Tootja ja mudel valitakse teie objekti tarbimise, liitumise ja ruumi järgi ning variante võrreldakse kirjalikus hinnangus samade numbritega.',
               more='Teised mudelid ja lahendused', more_l='Andmed tootjate tootelehtedelt ja pressiteadetest.',
               cols=('Mudel', 'Tüüp', 'Põhiandmed', 'Allikas')),
}

def src_html(key, L):
    src = SRC[key]
    stamp = f'{TXT[L]["read"]} {LUETTU}' if src['url'] else (f'{TXT[L]["checked"]} {LUETTU}' if src.get('check') else None)
    h = (f'<a href="{src["url"]}" rel="noopener" target="_blank">{src[L]}</a>' if src['url'] else src[L])
    return h + (f', {stamp}' if stamp else '')

def card(p, L, pre, hx='h3', href=None):
    i = 0 if L == 'fi' else 1
    specs = ''.join(f'<div><dt>{sp[i]}</dt><dd>{n(sp[2 + i])}</dd></div>' for sp in p['s'])
    cls = 'tc' + (' tc-ph' if p.get('photo') else '')
    model = p.get('model_et') if (L == 'et' and p.get('model_et')) else p['model']
    return (f'<li class="{cls}" id="{pre}-{p["id"]}" data-c="{" ".join(p["cats"])}">'
            f'<figure class="tc-m"><img src="/assets/tuotteet/{p["id"]}.webp" alt="{html.escape(p["alt"][i], quote=True)}" width="600" height="600" loading="lazy" decoding="async"></figure>'
            f'<div class="tc-b"><p class="tc-mk">{p["mk"]}</p><{hx} class="tc-n">{f'<a class="tc-a" href="{href}">{model}</a>' if href else model}</{hx}><p class="tc-t">{p["t"][i]}</p>'
            f'<dl class="tc-s">{specs}</dl>'
            f'<p class="tc-src">{TXT[L]["src"]}: {src_html(p["src"], L)}</p></div></li>')

BYID = {p['id']: p for p in P}

# Mallit ilman käyttökelpoista tuotekuvaa (Elecnovan kuvapalvelin on bottitarkistuksen takana; OptiGridista ei julkisia arvoja):
# rivi = (valmistaja, malli, (FI-tyyppi, ET-tyyppi), (FI-päätiedot, ET-päätiedot), lähde, ryhmät, kielet)
MUUT = [
    ('Elecnova', 'ECO-E261LP-2A', ('Nestejäähdytetty ulkokaappi', 'Vedelikjahutusega väliskapp'), ('125 kW, 261 kWh', '125 kW, 261 kWh'), 'el-e261', ['varasto']),
    ('Elecnova', 'ECO-E241WP-2A', ('Ilmajäähdytteinen ulkokaappi', 'Õhkjahutusega väliskapp'), ('125 kW, 241 kWh', '125 kW, 241 kWh'), 'el-e241', ['varasto']),
    ('Elecnova', 'ECO-E233LS', ('Nestejäähdytetty ulkokaappi', 'Vedelikjahutusega väliskapp'), ('100 kW, 233 kWh', '100 kW, 233 kWh'), 'el-e233', ['varasto']),
    ('Elecnova', 'ECO-E215WS', ('Ilmajäähdytteinen ulkokaappi', 'Õhkjahutusega väliskapp'), ('100 kW, 215 kWh', '100 kW, 215 kWh'), 'el-e215', ['varasto']),
    ('Elecnova', 'ECO-B418LP-2N', ('Nestejäähdytetty akustokaappi, tehoelektroniikka erikseen', 'Vedelikjahutusega akukapp, jõuelektroonika eraldi'), ('418 kWh', '418 kWh'), 'el-b418', ['varasto']),
    ('Elecnova', 'ECO-B372LS', ('Nestejäähdytetty akustokaappi, tehoelektroniikka erikseen', 'Vedelikjahutusega akukapp, jõuelektroonika eraldi'), ('372 kWh', '372 kWh'), 'el-b372', ['varasto']),
    ('Elecnova', 'ECO-B20FT5015LP-2', ('Nestejäähdytetty 20 jalan akustokontti', 'Vedelikjahutusega 20-jalane akukonteiner'), ('5 015 kWh', '5 015 kWh'), 'el-b5015', ['varasto']),
    ('Elecnova', 'ECO-B20FT3404WS', ('Ilmajäähdytteinen 20 jalan akustokontti', 'Õhkjahutusega 20-jalane akukonteiner'), ('3 404 kWh', '3 404 kWh'), 'el-b3404', ['varasto']),
    ('Elecnova', 'ECO-EPS-C125', ('EPS-kaappi varavoimaan', 'EPS-kapp varutoiteks'), ('1, 3 tai 6 × 125 kW, siirto enintään 20 s', '1, 3 või 6 × 125 kW, ümberlülitus kuni 20 s'), 'el-eps', ['varasto', 'varavoima']),
    ('Elecnova', 'PCS, BMS ja EMS', ('Tehoelektroniikka, akunhallinta ja energianhallinta', 'Jõuelektroonika, akuhaldus ja energiahaldus'), ('komponentit kokonaisuuden osiksi', 'komponendid terviklahenduse osadeks'), 'el-comp', ['varasto']),
    ('Elecnova', 'ECO-B100/120WP-2H', ('Ilmajäähdytteinen hybridikaappi aurinkosähkölle', 'Õhkjahutusega hübriidkapp päikeseelektrile'),
     ('30 tai 40 kW, 100 tai 121 kWh, aurinkosähkö enintään 60 tai 80 kW', '30 või 40 kW, 100 või 121 kWh, päikeseelekter kuni 60 või 80 kW'), 'el-b100', ['varasto']),
    ('Elecnova', 'ECO-H3200K', ('PCS-Boost-kontti: tehoelektroniikka ja muuntaja suuriin varastoihin', 'PCS-Boost konteiner: jõuelektroonika ja trafo suurtele salvestitele'),
     ('3 200 kW, 6–35 kV, akusto 1 000–1 500 V DC', '3 200 kW, 6–35 kV, akud 1 000–1 500 V DC'), 'el-h3200', ['varasto']),
    ('Elecnova', 'ECO-P1P20WS', ('Ilmajäähdytteinen akkupaketti järjestelmiin', 'Õhkjahutusega akupakett süsteemidesse'), ('17,92 kWh, 64 V DC', '17,92 kWh, 64 V DC'), 'el-p20', ['varasto']),
    ('Elecnova', 'ECO-P1P52LS', ('Nestejäähdytetty akkupaketti järjestelmiin', 'Vedelikjahutusega akupakett süsteemidesse'), ('46,59 kWh, 166,4 V DC, IP65', '46,59 kWh, 166,4 V DC, IP65'), 'el-p52', ['varasto']),
    ('Raystech', 'RT5427 HV/SHV', ('Korkeajänniteakun moduuli', 'Kõrgepingeaku moodul'), ('5,43 kWh moduulia kohden, IP65', '5,43 kWh mooduli kohta, IP65'), 'r-rt5427', ['varasto']),
    ('Atmoce', 'M-Backup', ('Varavoiman kytkentäkeskus', 'Varutoite lülituskeskus'), ('verkko 80 A, kuorma 63 A, IP65', 'võrk 80 A, koormus 63 A, IP65'), 'r-mbackup', ['varasto']),
    ('Hoymiles', 'HiBattery 1920 AC', ('Pistorasiaan kytkettävä akku mökille ja parvekevoimalalle', 'Pistikupessa ühendatav aku suvilale ja rõdujaamale'),
     ('1,92 kWh, 800 VA, enintään 6 akkua, IP66', '1,92 kWh, 800 VA, kuni 6 akut, IP66'), 'r-hibattery', ['varasto']),
    ('Atmoce', 'M-Combiner', ('Kytkentäkotelo aurinkosähkölle ja akuille', 'Ühenduskarp päikeseelektrile ja akudele'), ('aurinkosähkö enintään 30 kW, akut enintään 42 kWh', 'päikeseelekter kuni 30 kW, akud kuni 42 kWh'), 'r-mcomb', ['aurinko']),
    ('Sofar Solar', 'HYD 5–20KTL-3PH', ('Kolmivaiheinen hybridi-invertteri akuille', 'Kolmefaasiline hübriidinverter akudele'), ('5–20 kW', '5–20 kW'), 'so-sofar-hyd', ['aurinko']),
    ('Hoymiles', 'HAT-HV', ('AC-kytketty akkuinvertteri akun jälkiasennukseen', 'AC-ühendusega akuinverter aku järelpaigalduseks'),
     ('5–10 kW, akku 170–600 V, varavoima alle 10 ms, IP65', '5–10 kW, aku 170–600 V, varutoide alla 10 ms, IP65'), 'r-hat', ['aurinko']),
    ('Hoymiles', 'HMT-2250-6T', ('Kolmivaiheinen mikroinvertteri kuudelle paneelille', 'Kolmefaasiline mikroinverter kuuele paneelile'),
     ('2 250 W, paneelit 300–470 Wp', '2 250 W, paneelid 300–470 Wp'), 'r-pro', ['aurinko']),
    ('Hoymiles', 'DTSU666', ('Kolmivaiheinen älymittari kulutuksen ja verkkoon syötön seurantaan', 'Kolmefaasiline nutiarvesti tarbimise ja võrku andmise jälgimiseks'),
     ('80 A, 3 × 230/400 V, RS485 Modbus RTU', '80 A, 3 × 230/400 V, RS485 Modbus RTU'), 'r-dtsu', ['aurinko']),
    ('KACO', 'blueplanet', ('Aurinkosähköinvertterit yrityskohteisiin', 'Päikeseinverterid ettevõtete objektidele'), ('10–125 kW, etävalvonta vakiona', '10–125 kW, kaugseire standardina'), 'so-kaco', ['aurinko']),
    ('Canadian Solar', 'HiKu6 CS6W-MB-AG', ('Half-cut-aurinkopaneeli', 'Half-cut päikesepaneel'), ('540 W, tuotetakuu 12 v, tuottotakuu 25 v', '540 W, tootegarantii 12 a, toodangugarantii 25 a'), 'so-cs', ['aurinko']),
    ('Hanwha Q CELLS', 'Q.PEAK DUO ML-G11', ('Täysmusta aurinkopaneeli', 'Täismust päikesepaneel'), ('395 Wp, hyötysuhde enintään 20,8 %, takuu 25 v', '395 Wp, kasutegur kuni 20,8 %, garantii 25 a'), 'so-hanwha', ['aurinko']),
    ('ZNShine Solar', 'ZXM7-SHLDD108', ('Musta kaksipuolinen lasi-lasipaneeli', 'Must kahepoolne klaas-klaas paneel'), ('hyötysuhde enintään 20 %, grafeenipinnoite, tuottotakuu 30 v', 'kasutegur kuni 20 %, grafeenkate, toodangugarantii 30 a'), 'so-znshine', ['aurinko']),
    ('Scanoffice', ('Premium-aurinkosähköpaketit', 'Premium-päikeseelektripaketid'), ('Paneelit, Sofar-invertteri ja kattokiinnikkeet yhtenä toimituksena', 'Paneelid, Sofari inverter ja katusekinnitused ühe tarnena'),
     ('invertterit 3–50 kWp, kattokiinnikkeiden takuu 30 v', 'inverterid 3–50 kWp, katusekinnituste garantii 30 a'), 'so-premium', ['aurinko']),
    ('Ralos', 'Nanorail', ('Kiskoton kiinnitysjärjestelmä harjakatoille', 'Rööbasteta kinnitussüsteem viilkatustele'),
     ('konesauma-, lukkosauma-, profiilipelti- ja huopakatot; paneelit 28–40 mm', 'valts-, klikkvalts-, profiilplekk- ja rullkatused; paneelid 28–40 mm'), 'r-nanorail', ['aurinko']),
    ('Ralos', 'FLAT25', ('Kiskoton asennusjärjestelmä tasakatoille', 'Rööbasteta paigaldussüsteem lamekatustele'), ('katon kuorma 5,5 kg/m²', 'katuse koormus 5,5 kg/m²'), 'r-av', ['aurinko']),
    ('AeroCompact, Esdec, Nordic Sun, Orima Solar', ('Kiinnitysjärjestelmät', 'Kinnitussüsteemid'), ('Paneelien kiinnitys katolle ja maahan', 'Paneelide kinnitus katusele ja maale'), ('tasakatot, harjakatot ja maateline; palomieskytkin Santon', 'lamekatused, viilkatused ja maaraam; tuletõrjelüliti Santon'), 'so-kiinn', ['aurinko']),
    ('Avant Power', 'OptiGrid™', ('Mikroverkko latausasemille ja kiinteistöille', 'Mikrovõrk laadimisjaamadele ja kinnistutele'),
     ('DC-verkko, energiavarastot, lataus ja OptiGrid Cloud -ohjaus, osat myös erikseen', 'DC-võrk, energiasalvestid, laadimine ja OptiGrid Cloudi juhtimine, osad ka eraldi'), 'avant-ogp', ['lataus', 'varasto']),
    ('Zaptec', 'Zaptec Go', ('AC-latausasema kotiin', 'AC-laadimisjaam kodule'), ('enintään 22 kW, IP54, OCPP 1.6J', 'kuni 22 kW, IP54, OCPP 1.6J'), 'zaptec-go', ['lataus']),
    ('Easee', 'Charge Up', ('AC-latausasema kotiin', 'AC-laadimisjaam kodule'), ('enintään 22 kW, IP54, IK10, OCPP 1.6J', 'kuni 22 kW, IP54, IK10, OCPP 1.6J'), 'easee-up', ['lataus']),
    ('AmpIN', 'AmpIN Smart', ('Type 2 -latauskaapeli', 'Type 2 laadimiskaabel'), ('taipuisa −40 °C:ssa, yli 50 000 käyttökertaa, IEC 62196-2', 'painduv −40 °C juures, üle 50 000 kasutuskorra, IEC 62196-2'), 'so-ampin', ['lataus']),
    ('Scanoffice', ('Lataustolppa', 'Laadimispost'), ('Lataustolppa kahdelle latauslaitteelle', 'Laadimispost kahele laadijale'), ('maalattu galvanoitu teräs, toimitetaan koottuna', 'värvitud tsingitud teras, tarnitakse kokkupanduna'), 'so-tolppa', ['lataus']),
    ('Mitsubishi Electric', ('Ilmalämpöpumput', 'Õhksoojuspumbad'), ('Ilmalämpöpumput ja ilmanjäähdyttimet', 'Õhksoojuspumbad ja õhujahutid'),
     ('mallisarjat AY, EF, FT, MSZ-LN, RW, RZ, SLZ-M, MFZ-KW ja Multisplit; jäähdyttimet HR ja MSY-TP', 'mudeliseeriad AY, EF, FT, MSZ-LN, RW, RZ, SLZ-M, MFZ-KW ja Multisplit; jahutid HR ja MSY-TP'), 'so-ilp', ['lampo']),
    ('Mitsubishi Electric', 'Energiansäästäjä', ('Ilma-vesilämpöpumppu nykyisen lämmitysjärjestelmän rinnalle', 'Õhk-vesisoojuspump olemasoleva küttesüsteemi kõrvale'),
     ('öljyn, kaukolämmön tai sähkölämmityksen rinnalle; omakotitalot ja kiinteistöt', 'õli-, kaug- või elektrikütte kõrvale; eramud ja kinnistud'), 'so-esaastaja', ['lampo']),
    ('Scanoffice', 'Energypac', ('Kokonaislämmitysjärjestelmä omakotitaloon, myös käyttövesi', 'Terviklik küttesüsteem eramule, ka tarbevesi'), ('lämmitysteho 10,5–17 kW', 'küttevõimsus 10,5–17 kW'), 'so-energypac', ['lampo']),
    ('Mitsubishi Electric', 'City Multi VRF', ('Lämmitys ja jäähdytys suuriin kiinteistöihin', 'Küte ja jahutus suurtele kinnistutele'),
     ('ulkoyksiköstä useaan sisäyksikköön; toimistot, kauppakeskukset ja hotellit', 'välisseadmest mitmesse siseseadmesse; kontorid, kaubanduskeskused ja hotellid'), 'so-vrf', ['lampo']),
    ('alpha innotec', ('Maalämpöpumput', 'Maasoojuspumbad'), ('Maalämpöpumput suuriin kiinteistöihin, myös viilennys', 'Maasoojuspumbad suurtele kinnistutele, ka jahutus'),
     ('taloyhtiöt, teollisuushallit ja liikekiinteistöt', 'korteriühistud, tööstushallid ja ärikinnistud'), 'so-maalampo', ['lampo']),
    ('Flowair', 'LEO', ('Kiertoilmakojeet halleihin', 'Ringlusõhuseadmed hallidele'), ('katto- tai seinäasennus, termostaattiohjain mukana', 'lae- või seinapaigaldus, termostaatjuhtimine kaasas'), 'so-flowair', ['lampo']),
    ('Galmet ja Scanoffice', ('Varaajat', 'Paagid ja boilerid'), ('Puskuri- ja käyttövesivaraajat lämpöpumpuille', 'Puhverpaagid ja tarbeveeboilerid soojuspumpadele'),
     ('puskurivaraajat 100–1 500 l, käyttövesivaraajat 193–657 l', 'puhverpaagid 100–1 500 l, tarbeveeboilerid 193–657 l'), 'so-varaajat', ['lampo']),
    ('Mitsubishi Electric ja Mobair', 'Lossnay', ('Lämmöntalteenottava ilmanvaihtolaite', 'Soojustagastusega ventilatsiooniseade'), ('myös Mobair-korvausilmaventtiilit', 'ka Mobairi asendusõhu ventiilid'), 'so-iv', ['lampo']),
]

def muut(L, groups):
    rows = [r for r in MUUT if set(r[5]) & set(groups) and r[0] not in PIILOTETUT_VALMISTAJAT]
    if not rows: return ''
    i = 0 if L == 'fi' else 1; c = TXT[L]['cols']
    body = ''.join(f'<tr><td><b>{r[1] if isinstance(r[1], str) else r[1][i]}</b><span>{r[0]}</span></td><td>{r[2][i]}</td><td>{n(r[3][i])}</td><td class="tuo-xs">{src_html(r[4], L)}</td></tr>' for r in rows)
    return (f'<div class="tbl-wrap tuo-x"><div class="tbl-head"><h3>{TXT[L]["more"]}</h3><p class="src">{TXT[L]["more_l"]}</p></div>'
            f'<div class="tbl-scroll"><table class="tbl"><thead><tr>{"".join(f"<th>{x}</th>" for x in c)}</tr></thead><tbody>{body}</tbody></table></div></div>')

def catalog(L, name):
    b = BLOCKS[name]; pre = b['pre']; cats = CATS[name]
    i = 1 if L == 'fi' else 2
    items = []
    for it in b['items']:
        pid, pc = it[0], it[1]; ov = it[2] if len(it) > 2 else {}
        if L in BYID[pid].get('langs', ['fi', 'et']) and nakyy(BYID[pid]): items.append((dict(BYID[pid], **ov), pc))
    cnt = {c[0]: (len(items) if c[0] == 'kaikki' else sum(1 for _, pc in items if c[0] in pc)) for c in cats}
    chips = ''.join(
        f'<input type="radio" name="{pre}-v" id="{pre}-v-{c[0]}" value="{c[0]}"{" checked" if c[0] == "kaikki" else ""}>'
        f'<label for="{pre}-v-{c[0]}">{c[i]} <span>{cnt[c[0]]}</span></label>'
        for c in cats if cnt[c[0]])
    cards = ''.join(card(dict(p, cats=pc), L, pre) for p, pc in items)
    note = b.get('note', {}).get(L) or TXT[L]['note']
    return (f'<div class="tuo-f" role="radiogroup" aria-label="{TXT[L]["group"]}">{chips}</div>'
            f'<ul class="tuo-g" role="list">{cards}</ul>'
            + muut(L, b.get('muut', []))
            + f'<p class="tuo-note">{note}</p>')

VARASTOT = ['ralos-beast-125-hd', 'ralos-mini-beast-50', 'elecnova-eco-e418lp', 'elecnova-eco-e101wx', 'zoe-z-box-c215', 'ep-energy-epes233', 'ep-energy-ephs',
            'elecnova-eco-e64wx', 'elecnova-eco-e20ft2170lp', 'avant-power-bess', 'ep-energy-epes5000', 'ep-energy-epps93-m', 'ep-energy-epps210-m',
            'ep-energy-epcs209', 'avant-power-cube-47', 'elecnova-eco-sts-c125', 'atmoce-battbank',
            'hoymiles-hione', 'solax-x3-t30', 'hoymiles-lb-16d-g3', 'enershare-core', 'enershare-active16', 'pytes-pilv1', 'pytes-v16', 'atmoce-m-elv', 'raystech-rt16076mplus']
CUBE_LATAUS = dict(s=[('Lataus', 'Laadimine', 'Type 2 -kaapeli, 9 kW, lisävaruste', 'Type 2 kaabel, 9 kW, lisavarustus'), ('Energia', 'Energia', '47 kWh', '47 kWh'),
                      ('Teho', 'Võimsus', '11 kW', '11 kW'), ('Paino', 'Kaal', '730 kg', '730 kg')],
                   t=('Siirrettävä energiayksikkö ja lataus työkoneille', 'Teisaldatav energiaseade ja laadimine töömasinatele'))
AVANT_LATAUS = dict(t=('Energiavarasto ja integroitu pikalataus latausasemille', 'Salvesti ja integreeritud kiirlaadimine laadimisjaamadele'),
                    s=[('Pikalataus', 'Kiirlaadimine', '200–600 kW, satelliittilatausasemat', '200–600 kW, satelliitlaadijad'), ('Varasto', 'Salvesti', '250 tai 500 kWh', '250 või 500 kWh'),
                       ('Teho', 'Võimsus', '200 tai 400 kW', '200 või 400 kW'), ('Käyttö', 'Kasutus', 'osana OptiGrid-mikroverkkoa tai itsenäisenä', 'OptiGridi mikrovõrgu osana või iseseisvalt')])
LATAUS = [('zaptec-pro', ['ac']), ('easee-charge-pro', ['ac']), ('avant-power-bess', ['dc', 'akku'], AVANT_LATAUS), ('ep-energy-epcp-dc', ['dc']),
          ('ep-energy-epcs209', ['dc', 'akku']), ('ep-energy-epps210-m', ['dc', 'siirrettava']), ('ep-energy-epps93-m', ['dc', 'siirrettava']),
          ('avant-power-cube-47', ['ac', 'siirrettava'], CUBE_LATAUS), ('gare-solar-carport', ['katos']), ('easee-charge-max', ['ac', 'koti']), ('beny-bcp', ['ac', 'koti']), ('raedian-nora', ['ac', 'koti'])]
AURINKO = [('ralos-rls-480', ['paneeli']), ('ralos-rls-525', ['paneeli']), ('ralos-rls-585', ['paneeli']), ('hanersun-450', ['paneeli']), ('hanersun-500', ['paneeli']),
           ('hanersun-620', ['paneeli']), ('hanersun-725', ['paneeli']), ('tongwei-725', ['paneeli']), ('ht-s-ht72', ['paneeli']), ('ht-s-ht54', ['paneeli']),
           ('hd-hyundai-hit', ['paneeli']), ('overeasy-xm3', ['paneeli']),
           ('roofit-velario-slim', ['katto']), ('roofit-nuclick', ['katto']), ('gare-solar-carport', ['katos']), ('ralos-stalker', ['seuraaja']),
           ('hoymiles-mit', ['mikro']), ('hoymiles-hmt', ['mikro']), ('hoymiles-hms', ['mikro']), ('hoymiles-mis', ['mikro']), ('atmoce-mi', ['mikro']), ('apsystems-qt2', ['mikro']),
           ('hoymiles-hit', ['invertteri']), ('hoymiles-hyt-hat', ['invertteri']), ('sofar-ktl', ['invertteri']),
           ('ralos-beast-125-hd', ['hybridi']), ('ralos-mini-beast-50', ['hybridi']), ('ep-energy-ephs', ['hybridi']), ('elecnova-eco-e64wx', ['hybridi']), ('solax-x3-t30', ['hybridi'])]
LAMPO = ['me-cahv-z450', 'me-cahv-r450', 'me-large-hydrobox', 'me-p-sarja', 'me-wdh', 'me-idh', 'me-pac-if013', 'me-ecodan-e', 'me-geodan']
def _kaikki_varasto(pid):
    c = BYID[pid]['cats']
    return (['varasto'] + [k for k in ('siirrettava', 'varavoima', 'pieni') if k in c]
            + (['lataus'] if pid in ('ep-energy-epcs209', 'ep-energy-epps210-m', 'ep-energy-epps93-m', 'avant-power-cube-47', 'avant-power-bess') else []))
KAIKKI = ([(pid, _kaikki_varasto(pid)) for pid in VARASTOT]
          + [('zaptec-pro', ['lataus']), ('easee-charge-pro', ['lataus']), ('ep-energy-epcp-dc', ['lataus']), ('gare-solar-carport', ['lataus', 'aurinko']),
             ('easee-charge-max', ['lataus', 'pieni']), ('beny-bcp', ['lataus', 'pieni']), ('raedian-nora', ['lataus', 'pieni'])]
          + [(pid, ['aurinko'] + (['pieni'] if pid in ('hoymiles-hms', 'atmoce-mi') else [])) for pid, _ in AURINKO if pid not in VARASTOT and pid != 'gare-solar-carport']
          + [(pid, ['lampo'] + (['pieni'] if pid in ('me-ecodan-e', 'me-geodan') else [])) for pid in LAMPO])
BLOCKS = {
    'varastot': dict(pre='tv', items=[(pid, BYID[pid]['cats']) for pid in VARASTOT], muut=['varasto']),
    'aurinko': dict(pre='ta', note=NOTE_AURINKO, items=AURINKO, muut=['aurinko']),
    'lataus': dict(pre='tl', note=NOTE_LATAUS, items=LATAUS, muut=['lataus']),
    'kaikki': dict(pre='tk', note=NOTE_KAIKKI, items=KAIKKI, muut=['varasto', 'lataus', 'aurinko', 'lampo']),
}

# ---------- etusivun tuotenosto (vaihtoehto, haara draft-logot-tuotteet, Martin 9.11.2026) ----------
# Martin: kumppanikorttien ja -paneelien tilalle päätuotteiden esittely, valittava valikko ja 2–3 tuotetta per valinta
# (vieritettävä), linkki koko valikoimaan. Kortit = alasivujen kortit (sama data, lähde ja päivä), etusivulla kaksi päätietoa.
# Ryhmä: (avain, FI, ET, [(id, ohitukset)], (FI-osoite, ET-osoite), lohko, jonka tuotemäärä kerrotaan, ryhmä lohkon sisällä)
ETUSIVU = [
    ('varasto', 'Energiavarastot', 'Energiasalvestid',
     [('ralos-beast-125-hd', {}), ('hoymiles-hione', {}), ('zoe-z-box-c215', {})],   # Madis 10.11.2026: Ralos, Hoymiles ja ZOE
     ('/energiavarastot/#tuotteet', '/energiasalvestid/#tooted'), 'varastot', None),
    ('aurinko', 'Aurinkosähkö', 'Päikeseelekter',
     [('roofit-velario-slim', {}), ('gare-solar-carport', {}), ('hd-hyundai-hit', {}), ('ralos-stalker', {}), ('tongwei-725', {})],
     ('/aurinkosahko/#tuotteet', '/paikeseelekter/#tooted'), 'aurinko', None),
    ('lataus', 'Lataus', 'Laadimine',
     [('zaptec-pro', {}), ('easee-charge-pro', {}), ('avant-power-bess', AVANT_LATAUS)],
     ('/lataus/#latausasemat', '/laadimine/#laadimisjaamad'), 'lataus', None),
    ('lampo', 'Lämpöpumput', 'Soojuspumbad',
     [('me-cahv-z450', {}), ('me-large-hydrobox', {}), ('me-geodan', {})],
     ('/kumppanit/?v=lampo#valikoima', '/partnerid/?v=lampo#valik'), 'kaikki', 'lampo'),
]
ETUSIVU_N = 3       # tuotetta per ryhmä (lista voi olla pidempi: kielirajatut tuotteet ohitetaan)
ETUSIVU_SPEC = 2    # päätietoa per kortti
ETUSIVU_TXT = {
    'fi': dict(h='Poimintoja valikoimasta', lead='Tekniset tiedot ovat valmistajien datalehdiltä ja tuotesivuilta.',
               note='Valmistaja ja malli valitaan kohteenne kulutuksen, liittymän ja tilan mukaan, ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla.',
               allp='Kaikki tuotteet', allp_url='/kumppanit/#valikoima'),
    'et': dict(h='Näiteid valikust', lead='Tehnilised andmed on tootjate andmelehtedelt ja tootelehtedelt.',
               note='Tootja ja mudel valitakse teie objekti tarbimise, liitumise ja ruumi järgi ning variante võrreldakse kirjalikus hinnangus samade numbritega.',
               allp='Kõik tooted', allp_url='/partnerid/#valik'),
}
# Ryhmän painike korttien alla (Martin 9.11.2026 klo 21.30: iso tyhjä "Koko valikoima" -kortti pois, tilalle pieni painike)
ETUSIVU_MORE = {'varasto': ('Kaikki energiavarastot', 'Kõik energiasalvestid'),
                'aurinko': ('Koko aurinkosähkövalikoima', 'Kogu päikeseelektri valik'),
                'lataus': ('Kaikki latausratkaisut', 'Kõik laadimislahendused'),
                'lampo': ('Kaikki lämpöpumput', 'Kõik soojuspumbad')}
ARROW = ('<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '
         'aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"/></svg>')

def _count(block_name, L, group=None):
    n_ = 0
    for it in BLOCKS[block_name]['items']:
        p = BYID[it[0]]
        if L in p.get('langs', ['fi', 'et']) and nakyy(p) and (group is None or group in it[1]):
            n_ += 1
    return n_

def etusivu(L):
    T = ETUSIVU_TXT[L]; i = 0 if L == 'fi' else 1
    radios, panels = [], []
    for gi, (key, fi_l, et_l, ids, urls, bname, grp) in enumerate(ETUSIVU):
        items = [dict(BYID[pid], **ov) for pid, ov in ids
                 if L in BYID[pid].get('langs', ['fi', 'et']) and nakyy(BYID[pid])][:ETUSIVU_N]
        radios.append(f'<input type="radio" name="kt-v" id="kt-v-{key}" value="{key}"{" checked" if gi == 0 else ""}>'
                      f'<label for="kt-v-{key}">{fi_l if L == "fi" else et_l}</label>')
        # kortti vie tuotteeseen sen omalla sivulla: sivun valikoiman kortin id = <lohkon pre>-<id> (scroll-margin + :target)
        page = urls[i].split('#')[0].split('?')[0]
        pre = BLOCKS[bname]['pre']
        cards = ''.join(card(dict(p, s=p['s'][:ETUSIVU_SPEC]), L, 'kt', hx='h4', href=f'{page}#{pre}-{p["id"]}') for p in items)
        cnt = _count(bname, L, grp)
        panels.append(f'<div class="k-tuo-p" data-c="{key}"><ul class="k-tuo-g" role="list">{cards}</ul>'
                      f'<a class="k-tuo-more" href="{urls[i]}">{ETUSIVU_MORE[key][i]}<span>{cnt}</span>{ARROW}</a></div>')
    return (f'<div class="k-tuo"><div class="k-tuo-h"><div><h3>{T["h"]}</h3><p>{T["lead"]}</p></div>'
            f'<div class="k-tuo-nav"><div class="k-tuo-f" role="radiogroup" aria-label="{TXT[L]["group"]}">{"".join(radios)}</div>'
            f'<a class="k-tuo-allp" href="{T["allp_url"]}">{T["allp"]}{ARROW}</a></div></div>'
            + ''.join(panels) + f'<p class="k-tuo-note">{T["note"]}</p></div>')

def block(name, L):
    body = etusivu(L) if name == 'etusivu' else catalog(L, name)
    return (f'<!-- tuotteet:{name}:alku — GENEROITU: python3 scripts/tuotteet/build_tuotteet.py. Muokkaa skriptiä, älä tätä lohkoa. -->'
            + body + f'<!-- tuotteet:{name}:loppu -->')

# Suodatuksen CSS (alasivut.css, merkkien välissä): yksi sääntö per lohko × ryhmä. Generoitu, jotta uusi ryhmä ei jää ilman
# sääntöä (9.11.2026 korjaus: tl- ja tk-lohkojen sekä v57–v58-ryhmien säännöt puuttuivat, suodatin ei rajannut mitään).
# Valitsin ei oleta osion luokkaa: .tuo-f:has(radio) ~ .tuo-g. Ilman :has()-tukea kaikki kortit näkyvät.
CSS_A = '/* tuotteet:suodatus:alku — GENEROITU: python3 scripts/tuotteet/build_tuotteet.py */'
CSS_B = '/* tuotteet:suodatus:loppu */'
def filter_css():
    sel = []
    for name, b in BLOCKS.items():
        for c in CATS[name]:
            if c[0] != 'kaikki':
                sel.append(f'.tuo-f:has(#{b["pre"]}-v-{c[0]}:checked)~.tuo-g .tc:not([data-c~={c[0]}])')
    return CSS_A + '\n' + ',\n'.join(sel) + '{display:none}\n' + CSS_B

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); a = ap.parse_args()
    bad = 0
    for L in ('fi', 'et'):
        f = ROOT / 'src' / f'{L}.html'; s = f.read_text(encoding='utf-8'); o = s
        for name in list(BLOCKS) + ['etusivu']:
            b0 = f'<!-- tuotteet:{name}:alku'; e0 = f'<!-- tuotteet:{name}:loppu -->'
            i = s.find(b0); j = s.find(e0)
            if i < 0 or j < 0:
                print(f'{f.name}: merkit tuotteet:{name} puuttuvat', file=sys.stderr); bad += 1; continue
            s = s[:i] + block(name, L) + s[j + len(e0):]
        if s != o:
            if a.check: print(f'{f.name}: tuotelohko ei ole ajan tasalla', file=sys.stderr); bad += 1
            else: f.write_text(s, encoding='utf-8'); print(f'{f.name}: päivitetty')
        else: print(f'{f.name}: ajan tasalla')
    f = ROOT / 'assets' / 'alasivut.css'; c = f.read_text(encoding='utf-8')
    i = c.find('/* tuotteet:suodatus:alku'); j = c.find(CSS_B)
    if i < 0 or j < 0:
        print(f'{f.name}: merkit tuotteet:suodatus puuttuvat', file=sys.stderr); bad += 1
    else:
        c2 = c[:i] + filter_css() + c[j + len(CSS_B):]
        if c2 != c:
            if a.check: print(f'{f.name}: suodatus ei ole ajan tasalla', file=sys.stderr); bad += 1
            else: f.write_text(c2, encoding='utf-8'); print(f'{f.name}: suodatus päivitetty')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
