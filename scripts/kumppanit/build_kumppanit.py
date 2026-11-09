# -*- coding: utf-8 -*-
"""Kumppaniprofiilit: tausta ja "miksi valitsimme" lähteineen (v56, Madis 9.11.2026 klo 3.06:
"ettevõtete taustast ja miks me oleme need valinud on väga kehvasti räägitud").

Yksi tietolähde kolmelle paikalle kummallakin kielellä:
  1. kumppanisivun profiilit  <!-- kumppanit:profiilit:alku --> … <!-- kumppanit:profiilit:loppu -->
  2. etusivun kortin kuvaus   (kortin <p class="k-pcw"> + <p class="k-pcy">)
  3. etusivun avautuva paneeli (tausta, miksi valitsimme, tarjonta, lähteet)

Nimisäännöt (verify-pages): Gare Energy, Roofit.Solar ja JSM vain FI-sivustolla, Soleron vain ET-sivustolla,
EP Equipment ja Energen Nordic ei koskaan. Ajo: python3 scripts/kumppanit/build_kumppanit.py [--check]
"""
import re, sys, html

ROOT = __file__.rsplit('/scripts/', 1)[0] + '/'
EXT = ' target="_blank" rel="noopener"'
ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"/></svg>'
OUT = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h9v9M16 4L5 15"/></svg>'


def a(url, text):
    return f'<a href="{html.escape(url)}"{EXT}>{text}</a>'


# ---------------------------------------------------------------- lähteet
SRC = {
    'dc-ralos': dict(url='https://discovercleantech.com/directory/ralos/', fi='Discover Cleantech, Ralos (luettu 9.11.2026)', et='Discover Cleantech, Ralos (loetud 9.11.2026)'),
    'ralos-v10': dict(url=None, fi='Ralos Oy, tekninen tiedote Ralos Beast 125, V10', et='Ralos Oy, tehniline andmeleht Ralos Beast 125, V10'),
    'el-e261': dict(url='https://www.elecnova-ess.com/eco-e261lp-2a', fi='Elecnova, tuotesivu ECO-E261LP-2A (luettu 27.9.2026)', et='Elecnova, tooteleht ECO-E261LP-2A (loetud 27.9.2026)'),
    'el-uutinen': dict(url=None, fi='Elecnovan uutinen ENERGIA 2026 -messuilta, 25.10.2026', et='Elecnova uudis messilt ENERGIA 2026, 25.10.2026'),
    'pvm-elecnova': dict(url='https://www.pv-magazine.com/2026/06/03/elecnova-launches-all-in-one-liquid-cooled-ess-container-for-backup-power-microgrids/', fi='pv magazine, 3.6.2026', et='pv magazine, 3.6.2026'),
    'ep-cat': dict(url=None, fi='EP Energy, luettelot C&amp;I Energy Storage Solutions ja Mobile Energy &amp; Storage Charging Solutions, 12/2025', et='EP Energy, kataloogid C&amp;I Energy Storage Solutions ja Mobile Energy &amp; Storage Charging Solutions, 12/2025'),
    'yrittajat-avant': dict(url='https://www.yrittajat.fi/uutiset/ylojarvella-kehitettiin-akku-joka-ratkaisee-ison-ongelman-toimii-40-asteen-lammossa-tai-30-asteen-pakkasessa', fi='Yrittäjät, 9.1.2024', et='Yrittäjät, 9.1.2024'),
    'avant-cube': dict(url='https://avanttecno.com/fi/wp-content/uploads/sites/7/2026/08/avant-power-cube47-esite-A4-FI-web.pdf', fi='Avant Power, OptiTemp Cube 47 -esite, 6/2026', et='Avant Power, OptiTemp Cube 47 brošüür, 6/2026'),
    'gare': dict(url='https://aurinkokatto.com/yritysesittely/', fi='Gare Energy Oy, yritysesittely (luettu 9.11.2026)', et=None),
    'scan-en': dict(url='https://www.scanoffice.fi/in-english', fi='Scanoffice Oy, In English (luettu 9.11.2026)', et='Scanoffice Oy, In English (loetud 9.11.2026)'),
    'scan-pv': dict(url='https://scanoffice.fi/aurinkopaneelit/aurinkosahkojarjestelma/', fi='Scanoffice Oy, Aurinkosähköjärjestelmä (luettu 27.9.2026)', et='Scanoffice Oy, Aurinkosähköjärjestelmä (loetud 27.9.2026)'),
    'jsm': dict(url='https://www.jsmautomaatiosahko.fi/', fi='JSM Automaatiosähkö Oy, etusivu (luettu 9.11.2026)', et=None),
    'sol-web': dict(url='https://soleronenergy.ee/', fi=None, et='Soleron Energy, avaleht (loetud 9.11.2026)'),
    'sol-blog': dict(url='https://www.soleronenergy.ee/blogi/sagedusreservide-turg/', fi=None, et='Soleron Energy, Soleron Energy sagedusreservide turul, 10.9.2025'),
    'sol-ea': dict(url='https://elektriala.ee/soleroni-juhtimistarkvara-tagab-optimaalse-energiajuhtimise-ja-otsejuurdepaasu-sagedusreservide-turule/', fi=None, et='Elektriala, 7.11.2025'),
}


def sources(ids, L):
    out = []
    for i in ids:
        s = SRC[i]
        out.append(a(s['url'], s[L]) if s['url'] else s[L])
    return ('Lähteet: ' if L == 'fi' else 'Allikad: ') + '; '.join(out) + '.'


# ---------------------------------------------------------------- kumppanit
# img = (polku, leveys, korkeus, alt FI, alt ET); y = lyhyt perustelu etusivun korttiin; why = "Miksi valitsimme"; bg = "Tausta"
P = {
 'ralos': dict(
    name='Ralos Oy', site=('https://ralos.fi/', 'ralos.fi'), src=['dc-ralos', 'ralos-v10'], cat=True,
    img=('/assets/valikoima/ralos-kaapit.webp', 900, 600, 'Ralos Beast -energiavarastokaappeja hallissa, kuva: Ralos Oy', 'Ralos Beasti salvestikapid hallis, foto: Ralos Oy'),
    fi=dict(w='Suomi · Tampere · perustettu 2017',
            y='Kotimainen toimittaja: laite, takuu ja huolto samalta yhtiöltä. Kaappeja rinnan enintään 16.',
            why='Kotimainen toimittaja: laite, takuu ja huolto samalta suomalaiselta yhtiöltä. Beast-kaappeja voi kytkeä rinnan enintään 16, yhteensä 2&nbsp;MW, joten sama tuote sopii yhden kaapin kohteeseen ja megawattiluokan kohteeseen. Kaappiin on saatavana varavoiman kytkin (STS) saarekekäyttöön suunniteltuihin kohteisiin.',
            bg='Tamperelainen aurinkosähköyhtiö, perustettu vuonna 2017. Toimittaa yrityksille aurinkovoimaloita omilla Ralos-paneeleilla sekä teollisia energiavarastoja sisä- ja ulkoasennukseen.',
            o=['Teolliset energiavarastot', 'Useita akkuvaihtoehtoja', 'Aurinkovoimalat', 'Mikroinvertteriratkaisut']),
    et=dict(w='Soome · Tampere · asutatud 2017',
            y='Seadme, garantii ja hoolduse eest vastutab üks tootja. Kappe saab paralleelselt kuni 16.',
            why='Seadme, garantii ja hoolduse eest vastutab üks tootja. Beasti kappe saab ühendada paralleelselt kuni 16, kokku 2&nbsp;MW, seega sobib sama toode nii ühe kapiga objektile kui ka megavatisele objektile. Saartalitluseks projekteeritud objektidele on kapile saadaval varutoite lüliti (STS).',
            bg='Tamperes tegutsev päikeseenergiaettevõte, asutatud 2017. aastal. Tarnib ettevõtetele päikeseelektrijaamu oma Ralose paneelidega ning tööstuslikke energiasalvesteid sise- ja välipaigalduseks.',
            o=['Tööstuslikud energiasalvestid', 'Mitu akuvalikut', 'Päikeseelektrijaamad', 'Mikroinverterlahendused'])),
 'elecnova': dict(
    name='Elecnova', site=('https://www.elecnova-ess.com/', 'elecnova-ess.com'), src=['el-e261', 'el-uutinen', 'pvm-elecnova'], cat=True,
    img=('/assets/kumppanit/elecnova-sarja.webp', 1600, 1000, 'Elecnovan valikoimaa: konttivarasto, ilmajäähdytteinen kaappi, hybridikaappi ja STS-kaappi, kuva: Elecnova', 'Elecnova valik: konteinersalvesti, õhkjahutusega kapp, hübriidkapp ja STS-kapp, foto: Elecnova'),
    fi=dict(w='Kiina · Shanghai · saatavilla Suomen markkinoilla',
            y='Kaikki kokoluokat kaapista konttiin, ja tuotteiden standardit ovat julkisia.',
            why='Yhdeltä valmistajalta saa kaikki kokoluokat kaapista konttiin, ja kaapit ja kontit toimivat rinnan. Tuotteiden standardit ovat julkisia, esimerkiksi akkuturvallisuuden IEC&nbsp;62619, palotestin UL&nbsp;9540A ja verkkoon liittämisen EN&nbsp;50549, joten ne voi tarkistaa ennen tarjousta.',
            bg='Shanghailainen energiavarastojen ja mikroverkkojen valmistaja. Valikoima ulottuu ilma- ja nestejäähdytteisistä ulkokaapeista konttivarastoihin, hybridikaappiin aurinkosähköön ja STS-kaappiin saarekekäyttöön. Lokakuussa 2026 Elecnova esitteli kaappejaan Energia 2026 -messuilla Tampereella.',
            o=['Neste- ja ilmajäähdytteiset kaapit', 'Hybridikaappi aurinkosähköön', 'Konttivarastot', 'Saarekekäyttö', 'Lataus ja mikroverkot']),
    et=dict(w='Hiina · Shanghai',
            y='Kõik suurused kapist konteinerini ja toodete standardid on avalikud.',
            why='Ühelt tootjalt saab kõik suurused kapist konteinerini ning kapid ja konteinerid töötavad paralleelselt. Toodete standardid on avalikud, näiteks akuohutuse IEC&nbsp;62619, tulekatse UL&nbsp;9540A ja võrguühenduse EN&nbsp;50549. Neid saab kontrollida enne pakkumist.',
            bg='Shanghais tegutsev energiasalvestite ja mikrovõrkude tootja. Valik ulatub õhk- ja vedelikjahutusega väliskappidest konteinersalvestite, päikeseelektri hübriidkapi ja saartalitluse STS-kapini. Oktoobris 2026 tutvustas Elecnova oma kappe Tamperes messil Energia 2026.',
            o=['Vedelik- ja õhkjahutusega kapid', 'Hübriidkapp päikeseelektrile', 'Konteinersalvestid', 'Saartalitlus', 'Laadimine ja mikrovõrgud'])),
 'ep-energy': dict(
    name='EP Energy', site=('https://www.ep-unipower.com/', 'ep-unipower.com'), src=['ep-cat'], cat=True,
    img=('/assets/kumppanit/ep-1.webp', 760, 507, 'EP Energyn energiavarastokaappeja rivissä rakennuksen seinän vieressä, kuva: EP Energy', 'EP Energy salvestikapid reas hoone seina ääres, foto: EP Energy'),
    fi=dict(w='Kiina · Anji, Zhejiang · Euroopan toimisto Belgiassa vuodesta 2011',
            y='Siirrettävä energia ja akulla varustetut pikalaturit sinne, missä liittymä ei riitä.',
            why='Kiinteiden kaappien ja konttien lisäksi siirrettävät energiayksiköt ja akulla varustetut pikalaturit: varasto ja lataus myös työmaalle ja kohteisiin, joissa liittymä ei riitä. Jakelu ja tuki Euroopassa hoituvat Belgiasta.',
            bg='Litiumakkujen valmistaja, jolla on yli 17 vuoden kokemus: ensin sähkökäyttöisiin trukkeihin ja varastolaitteisiin, vuodesta 2022 myös energiavarastoihin. Akkuja valmistuu noin 200&nbsp;000 vuodessa, ja niitä on käytössä yli 600&nbsp;000. Euroopan toimisto on ollut Belgiassa vuodesta 2011, varasto on Brysselissä ja toimisto Kölnissä.',
            o=['Energiavarastokaapit', 'Konttivarastot', 'Siirrettävät energiayksiköt', 'Pikalaturit', 'Trukit ja laitteet']),
    et=dict(w='Hiina · Anji, Zhejiang · Euroopa kontor Belgias aastast 2011',
            y='Teisaldatav energia ja akuga kiirlaadijad sinna, kus liitumisest ei piisa.',
            why='Lisaks kappidele ja konteineritele teisaldatavad energiaseadmed ja akuga kiirlaadijad: salvesti ja laadimine ka ehitusplatsile ja kohtadesse, kus liitumisest ei piisa. Turustus ja tugi Euroopas käib Belgia kaudu.',
            bg='Liitiumakude tootja, kellel on üle 17 aasta kogemust: kõigepealt elektriliste tõstukite ja laotehnika akud, alates 2022. aastast ka energiasalvestid. Aastas valmib umbes 200&nbsp;000 akut ja kasutuses on neid üle 600&nbsp;000. Euroopa kontor on Belgias aastast 2011, ladu on Brüsselis ja kontor Kölnis.',
            o=['Salvestikapid', 'Konteinersalvestid', 'Teisaldatavad energiaseadmed', 'Kiirlaadijad', 'Tõstukid ja tehnika'])),
 'avant-power': dict(
    name='Avant Power', site=('https://avantpower.fi/', 'avantpower.fi'), src=['yrittajat-avant', 'avant-cube'], cat=True,
    img=('/assets/valikoima/avant-varasto.webp', 900, 600, 'Avant Powerin konttimallinen energiavarasto, kuva: Avant Power', 'Avant Poweri konteinersalvesti, foto: Avant Power'),
    fi=dict(w='Suomi · Ylöjärvi · Avant Tecnon tytäryhtiö',
            y='Suomalainen uppojäähdytetty akku pakkaseen ja helteeseen sekä mikroverkot varikoille.',
            why='Suomalainen valmistaja, jonka nesteeseen upotettu ja lämmitetty akku toimii pakkasessa ja helteessä: siirrettävän Cube&nbsp;47 -yksikön käyttölämpötila on −30…+50&nbsp;°C. Mikroverkko kokoaa varaston, pikalatauksen ja oman tuotannon yhteen varikoille, logistiikkaan ja maatiloille. Tarvittaessa käytössä on Avantin koko valikoima.',
            bg='Ylöjärveläisen Avant Tecnon akkuyhtiö. Avant Tecno tunnetaan pienkuormaajistaan, joita toimitetaan kaikille mantereille; henkilöstöä on noin 450, ja liikevaihto oli noin 288&nbsp;miljoonaa euroa vuonna 2023. Akut valmistetaan itse omalla uppojäähdytystekniikalla, josta on haettu useita patentteja.',
            o=['Energiavarastot', 'Mikroverkot', 'Mobiili energia ja lataus', 'Off-grid-ratkaisut']),
    et=dict(w='Soome · Ylöjärvi · Avant Tecno tütarettevõte',
            y='Sukeljahutusega aku pakase ja palavuse jaoks ning mikrovõrgud depoodele.',
            why='Vedelikku sukeldatud ja köetav aku töötab nii pakases kui ka palavuses: teisaldatava Cube&nbsp;47 töötemperatuur on −30…+50&nbsp;°C. Mikrovõrk ühendab salvesti, kiirlaadimise ja oma tootmise depoodes, logistikas ja põllumajanduses. Vajadusel on kasutada Avanti kogu valik.',
            bg='Ylöjärvil tegutseva Avant Tecno akuettevõte. Avant Tecno on tuntud kompaktlaadurite poolest, mida tarnitakse kõigile mandritele. Töötajaid on umbes 450 ja käive oli 2023. aastal umbes 288&nbsp;miljonit eurot. Akud valmistatakse ise oma sukeljahutustehnoloogiaga, millele on taotletud mitu patenti.',
            o=['Energiasalvestid', 'Mikrovõrgud', 'Mobiilne energia ja laadimine', 'Võrguvälised lahendused'])),
 'gare-energy': dict(
    name='Gare Energy Oy', site=('https://aurinkokatto.com/', 'aurinkokatto.com'), src=['gare'], cat=False, only='fi',
    link=('/aurinkosahko/#aurinkokatto', 'Aurinkokatto'),
    img=('/assets/valikoima/gare-katto.webp', 900, 600, 'Talo, jonka konesaumakatto tuottaa aurinkosähköä, kuva: Gare Energy Oy', None),
    fi=dict(w='Suomi · aurinkokatto.com · Roofit.Solarin virallinen kumppani Suomessa',
            y='Aurinkokatto, kun katto uusitaan joka tapauksessa: katto ja voimala samassa tuotteessa.',
            why='Kun katto uusitaan joka tapauksessa, aurinkokatto tekee katosta ja voimalasta yhden tuotteen. Gare suunnittelee ja asentaa järjestelmän ja vahvistaa sen toimivuuden ennen luovutusta. Se asentaa myös aurinkokatokset ja latauspisteet.',
            bg='Suomalainen aurinkosähkön asennusyritys, joka on erikoistunut konesaumakattoihin. Gare on integroitujen aurinkokattojen valmistajan Roofit.Solarin virallinen kumppani Suomessa, 15 vuoden kokemuksella.',
            o=['Aurinkokatot', 'Aurinkokatokset', 'Lataus katoksen alla', 'Asennus'])),
 'scanoffice': dict(
    name='Scanoffice Oy', site=('https://www.scanoffice.fi/', 'scanoffice.fi'), src=['scan-en', 'scan-pv'], cat=False,
    img=('/assets/kumppanit/scanoffice-4.webp', 760, 475, 'Ilma-vesilämpöpumpun ulkoyksikkö talon seinustalla, kuva: Scanoffice Oy', 'Õhk-vesisoojuspumba välisseade maja seina ääres, foto: Scanoffice Oy'),
    fi=dict(w='Suomi · Espoo · perustettu 1984 · lähes sata ammattilaista',
            y='Aurinkopaneelit, lämpöpumput ja lataus maahantuojalta, joka on toiminut vuodesta 1984.',
            why='Kun kohde tarvitsee varaston lisäksi aurinkopaneeleja, lämpöpumppuja tai latausta, ne tulevat maahantuojalta, jolla on oma takuu- ja huoltopalvelu. Paneeleilla on 12 vuoden tuotetakuu ja 25 vuoden lineaarinen tehotakuu.',
            bg='Puhtaan energian laitteiden maahantuoja ja tukkukauppa vuodesta 1984, osa Scanoffice-konsernia. Valikoimassa ovat ilma-, ilma-vesi- ja maalämpöpumput, aurinkosähköjärjestelmät, ilmanvaihtolaitteet ja sähköautojen latausasemat, joita myyvät ja asentavat valtuutetut jälleenmyyjät koko Suomessa.',
            o=['Ilmalämpöpumput', 'Ilma-vesilämpöpumput', 'Maalämpöpumput', 'Aurinkopaneelit', 'Latausasemat', 'Ilmanvaihto']),
    et=dict(w='Soome · Espoo · asutatud 1984 · ligi sada spetsialisti',
            y='Päikesepaneelid, soojuspumbad ja laadimine maaletoojalt, kes tegutseb aastast 1984.',
            why='Kui objekt vajab lisaks salvestile päikesepaneele, soojuspumpasid või laadimist, tulevad need maaletoojalt, kellel on oma garantii- ja hooldusteenus. Paneelidel on 12-aastane tootegarantii ja 25-aastane lineaarne võimsusgarantii.',
            bg='Puhta energia seadmete maaletooja ja hulgimüüja aastast 1984, osa Scanoffice’i kontsernist. Valikus on õhk-, õhk-vesi- ja maasoojuspumbad, päikeseelektrisüsteemid, ventilatsiooniseadmed ja elektriautode laadimisjaamad.',
            o=['Õhksoojuspumbad', 'Õhk-vesisoojuspumbad', 'Maasoojuspumbad', 'Päikesepaneelid', 'Laadimisjaamad', 'Ventilatsioon'])),
 'jsm': dict(
    name='JSM Automaatiosähkö Oy', site=('https://www.jsmautomaatiosahko.fi/', 'jsmautomaatiosahko.fi'), src=['jsm'], cat=False, only='fi',
    img=('/assets/valikoima/jsm-asentajat.webp', 900, 600, 'JSM Automaatiosähkön asentajat rakentavat maahan asennettavaa aurinkovoimalaa, kuva: JSM Automaatiosähkö Oy', None),
    fi=dict(w='Suomi · Sastamala · varasto Tampereella · Pirkanmaa',
            y='Asentaa sähkövarastot myös reservimarkkinoille, Ralosin kaapit mukaan lukien.',
            why='JSM asentaa sähkövarastoja myös reservimarkkinakäyttöön, Ralosin kaapit mukaan lukien. Samalta urakoitsijalta tulevat kohteen muut sähkötyöt, aurinkovoimala, lämpöpumput ja lataus, ja työtä johtaa asennuspäällikkömme.',
            bg='Yrittäjävetoinen sähkö- ja automaatiourakoitsija, jolla on yli vuosikymmenen kokemus alalta. Toimisto on Sastamalassa ja varasto Tampereella, ja toimialue kattaa koko Pirkanmaan. Asiakkaina ovat yritykset, julkinen sektori ja yksityiset.',
            o=['Energiavarastojen asennus', 'Aurinkovoimalat', 'Lämpöpumput', 'Sähkötyöt', 'Käyttöönotto'])),
 'soleron': dict(
    name='Soleron Energy OÜ', site=('https://soleronenergy.ee/', 'soleronenergy.ee'), src=['sol-web', 'sol-blog', 'sol-ea'], cat=False, only='et',
    link=('/soleron-energy/', 'Kuidas agregaator töötab'),
    img=('/assets/valikoima/soleron-sovellus.webp', 900, 600, None, 'Soleroni energiajuhtimise rakendus telefonis, foto: Soleron Energy'),
    et=dict(w='Eesti · Tallinn · agregaator Eleringi reserviturul',
            y='Eesti agregaator, kelle oma tarkvara juhib salvestit Eleringi reservides.',
            why='Eesti agregaator, kelle oma juhtimistarkvara pakub salvesti võimsust Eleringi sagedusreservidesse ööpäev läbi. SAMA ehitab ja ühendab süsteemi, Soleron juhib seda turul.',
            bg='Tallinnas tegutsev ettevõte, mille põhifookus on nutikad energiajuhtimis- ja salvestuslahendused. Soleron pakub võtmed kätte lahendusi projekteerimisest ja paigaldusest hoolduse ja süsteemi monitooringuni ning agregeerib salvesteid Eleringi sagedusreservidesse oma EMS-tarkvaraga.',
            o=['Agregaator', 'Energiajuhtimine', 'Reserviturg'])),
}

# ryhmät: (otsikko, ingressi, linkki, kumppanit, tekstiprofiili)
# Piilossa perustajan päätöksellä 9.11.2026 klo 12.59. Palautus perustajan päätöksellä: poista id tästä ja
# palauta etusivun kortti tiedostosta scripts/kumppanit/piilotetut/<id>-<kieli>.html.
PIILOTETUT = {'ep-energy'}

GROUPS = {
 'fi': [
   ('Energiavarastot ja mikroverkot', 'Kaapista konttiin ja latausaseman mikroverkkoon. Valitsemme mallin kohteen tehon, energian, tilan ja käytön mukaan, ja vaihtoehdot vertaillaan tarjouksessa samoilla luvuilla.',
    ('/energiavarastot/#tuotteet', 'Mallit ja tekniset tiedot'), ['ralos', 'elecnova', 'ep-energy', 'avant-power'], None),
   ('Aurinkosähkö, lataus ja lämpöpumput', 'Aurinkokatot, aurinkokatokset, paneelit, latausasemat ja lämpöpumput. Voimalan ja aurinkokaton asennusta johtaa asennuspäällikkömme.',
    ('/aurinkosahko/#tuotteet', 'Paneelit ja aurinkokatto valikoimassa'), ['gare-energy', 'scanoffice'], None),
   ('Asennus ja käyttöönotto', 'Asennusta johtaa asennuspäällikkömme: yksi aikataulu toimintanne mukaan ja yksi dokumentaatio. Sähkötyöt ja käyttöönoton tekee rekisteröity sähköurakoitsijakumppanimme.',
    ('/aurinkosahko/#asennus', 'Näin asennus etenee'), ['jsm'], None),
   ('Pääsy reservimarkkinoille', 'Aggregaattori kokoaa sähkövarastot tarjoukseksi, ohjaa niitä automaattisesti ja tilittää tuoton.',
    ('/aggregaattori/', 'Näin valitsemme aggregaattorin'), [],
    ('Aggregaattori valitaan kohteen mukaan', 'Fingridin hyväksymä reservitoimittaja',
     'Vertaamme reservitoimittajat kohteenne varaston ja tuotteiden mukaan. Valinnan perusteet kirjataan arvioon, ja me rakennamme yhteyden valittuun aggregaattoriin.')),
 ],
 'et': [
   ('Energiasalvestid ja mikrovõrgud', 'Kapist konteinerini ja laadimisjaama mikrovõrguni. Valime mudeli objekti võimsuse, energia, ruumi ja kasutuse järgi ning variante võrreldakse pakkumises samade numbritega.',
    ('/energiasalvestid/#tooted', 'Mudelid ja tehnilised andmed'), ['ralos', 'elecnova', 'ep-energy', 'avant-power'], None),
   ('Päikeseelekter, laadimine ja soojuspumbad', 'Päikesepaneelid, laadimisjaamad ja soojuspumbad partneritelt. Päikesejaama paigaldust juhib meie paigaldusjuht.',
    ('/paikeseelekter/#tooted', 'Paneelid ja salvestid valikus'), ['scanoffice'], None),
   ('Paigaldus ja käikulaskmine', 'Paigaldust juhib meie paigaldusjuht: üks ajakava teie tegevuse järgi ja üks dokumentatsioon. Elektritööd ja käikulaskmise teeb registreeritud elektritööde partner.',
    ('/paikeseelekter/#paigaldus', 'Nii paigaldus käib'), [], None),
   ('Turulepääs reserviturule', 'Agregaator koondab mitme objekti salvestid üheks pakkumiseks, juhib neid automaatselt ja maksab tulu välja.',
    ('/soleron-energy/', 'Kuidas agregaator töötab'), ['soleron'], None),
 ],
}

T = {
 'fi': dict(why='Miksi valitsimme', bg='Tausta', cat='Mallit valikoimassa', cats={'ralos': '/energiavarastot/#tuotteet', 'elecnova': '/energiavarastot/#tuotteet', 'ep-energy': '/energiavarastot/#tuotteet', 'avant-power': '/energiavarastot/#tuotteet'},
            page='/kumppanit/', onpage='Kumppanisivulla', offer='Tarjonta'),
 'et': dict(why='Miks me nad valisime', bg='Taust', cat='Mudelid valikus', cats={'ralos': '/energiasalvestid/#tooted', 'elecnova': '/energiasalvestid/#tooted', 'ep-energy': '/energiasalvestid/#tooted', 'avant-power': '/energiasalvestid/#tooted'},
            page='/partnerid/', onpage='Partnerite lehel', offer='Pakkumine'),
}


def offers(lst, cls):
    return f'<ul class="{cls}">' + ''.join(f'<li>{x}</li>' for x in lst) + '</ul>'


def links(pid, L, own=True):
    p = P[pid]; t = T[L]; out = []
    if own and p.get('cat'):
        out.append(f'<a href="{t["cats"][pid]}">{t["cat"]} {ARROW}</a>')
    if own and p.get('link'):
        out.append(f'<a href="{p["link"][0]}">{p["link"][1]} {ARROW}</a>')
    out.append(f'<a href="{p["site"][0]}"{EXT}>{p["site"][1]} {OUT}</a>')
    return out


def profile(pid, L):
    p = P[pid]; d = p[L]; t = T[L]; im = p['img']
    alt = im[3] if L == 'fi' else im[4]
    return (f'<article class="prof" id="{pid}" aria-labelledby="{pid}-n">'
            f'<figure class="prof-i"><img src="{im[0]}" alt="{alt}" width="{im[1]}" height="{im[2]}" loading="lazy" decoding="async"></figure>'
            f'<div class="prof-b"><h4 class="prof-n" id="{pid}-n">{p["name"]}</h4><p class="prof-w">{d["w"]}</p>'
            f'<h5 class="prof-k">{t["why"]}</h5><p class="prof-y">{d["why"]}</p>'
            f'<h5 class="prof-k">{t["bg"]}</h5><p class="prof-t">{d["bg"]}</p>'
            + offers(d['o'], 'prof-o') +
            f'<div class="prof-f"><p class="prof-l">' + ''.join(links(pid, L)) + '</p>'
            f'<p class="prof-s">{sources(p["src"], L)}</p></div></div></article>')


def text_profile(tp):
    name, w, txt = tp
    return (f'<article class="prof prof-x"><div class="prof-b"><h4 class="prof-n">{name}</h4><p class="prof-w">{w}</p>'
            f'<p class="prof-t">{txt}</p></div></article>')


def block(L):
    out = ['<div class="prt">']
    for gi, (h, intro, lk, ids, tp) in enumerate(GROUPS[L]):
        out.append(f'<div class="prt-g"><div class="prt-gh"><h3>{h}</h3><div><p>{intro}</p>'
                   f'<p class="prt-gl"><a class="link-arrow" href="{lk[0]}">{lk[1]} {ARROW}</a></p></div></div>')
        for pid in ids:
            if pid in PIILOTETUT:
                continue
            out.append(profile(pid, L))
        if tp:
            out.append(text_profile(tp))
        out.append('</div>')
    out.append('</div>')
    return '\n      '.join(out)


# ---------------------------------------------------------------- etusivun logorivi
# Vaihtoehto (haara draft-logot-tuotteet, Martin 9.11.2026): kumppanikorttien ja -paneelien tilalle logot yhdessä rivissä,
# ilman linkkejä kumppaneiden sivuille. Logot kumppaneiden omilta sivuilta 9.11.2026 (Avant Power: repossa ollut logo),
# jäljitetty yksivärisiksi vektoreiksi (potrace) osion tekstin sävyyn: assets/kumppanit/logot/<id>.svg.
# Nimisäännöt kuten muualla: Gare Energy ja JSM vain FI, Soleron vain ET, EP Energy piilossa.
LOGOT = {
 'fi': ['ralos', 'elecnova', 'avant-power', 'scanoffice', 'gare-energy', 'jsm'],
 'et': ['ralos', 'elecnova', 'avant-power', 'scanoffice', 'soleron'],
}
LOGO_ALA = 3900  # optinen koko: leveys × korkeus px, jotta pitkä sanamerkki ja neliömäinen merkki näyttävät yhtä suurilta
LOGO_H = (17, 40)
LOGO_SKAALA = {'elecnova': 0.88, 'ralos': 1.06}  # silmämääräinen tasaus: Elecnovan lihava sanamerkki, Ralosin ohut
LOGO_LABEL = {'fi': 'Kumppanimme', 'et': 'Meie partnerid'}


def logo_size(pid):
    m = re.search(r'viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"', open(ROOT + f'assets/kumppanit/logot/{pid}.svg', encoding='utf-8').read())
    w, h = float(m.group(1)), float(m.group(2))
    hh = min(max((LOGO_ALA * h / w) ** 0.5, LOGO_H[0]), LOGO_H[1]) * LOGO_SKAALA.get(pid, 1)
    return round(hh * w / h), round(hh)


def logos(L):
    li = []
    for pid in LOGOT[L]:
        if pid in PIILOTETUT:
            continue
        w, h = logo_size(pid)
        li.append(f'<li><img src="/assets/kumppanit/logot/{pid}.svg" alt="{html.escape(P[pid]["name"], quote=True)}" '
                  f'width="{w}" height="{h}" loading="lazy" decoding="async"></li>')
    return (f'<div class="k-logos"><p class="k-logos-h" id="kl-h">{LOGO_LABEL[L]}</p>'
            f'<ul class="k-logos-r" aria-labelledby="kl-h">' + ''.join(li) + '</ul></div>')


# ---------------------------------------------------------------- etusivu
def front(s, L):
    t = T[L]
    if 'class="k-pc"' not in s:   # vaihtoehto: etusivulla logorivi korttien sijaan
        return s
    for pid, p in P.items():
        if (p.get('only') and p['only'] != L) or pid in PIILOTETUT:
            continue
        d = p[L]
        m = re.search(r'(<article class="k-pc">.*?popovertarget="pd-' + re.escape(pid) + r'".*?</article>)', s, re.S)
        if not m:
            sys.exit(f'{L}: etusivun korttia pd-{pid} ei löydy')
        art = m.group(1)
        new = art
        # kortti: kuvaus → sijainti + perustelu
        new, k = re.subn(r'(</button></h3>)(?:<p class="k-pcw">.*?</p><p class="k-pcy">.*?</p>|<p>.*?</p>)(<ul class="k-pco">)',
                         lambda mm: mm.group(1) + f'<p class="k-pcw">{d["w"]}</p><p class="k-pcy">{d["y"]}</p>' + mm.group(2), new, count=1, flags=re.S)
        if k != 1:
            sys.exit(f'{L}: kortin pd-{pid} kuvausta ei löydy')
        # paneeli: sijainti, perustelu, tausta, tarjonta, lähteet, linkit
        body = (f'<p class="k-pdl-w">{d["w"]}</p>'
                f'<h4 class="k-pdl-k">{t["why"]}</h4><p class="k-pdl-y">{d["why"]}</p>'
                f'<h4 class="k-pdl-k">{t["bg"]}</h4><p>{d["bg"]}</p>'
                + offers(d['o'], 'k-pco') +
                f'<p class="k-pdl-s">{sources(p["src"], L)}</p>'
                f'<p class="k-pdl-a"><a href="{t["page"]}#{pid}">{t["onpage"]}</a>'
                f'<a href="{p["site"][0]}"{EXT}>{p["site"][1]} {OUT}</a></p>')
        new2, k = re.subn(r'(<h3 id="pd-' + re.escape(pid) + r'-h">[^<]*</h3>).*?(</div></div></div></article>)$',
                          lambda mm: mm.group(1) + body + mm.group(2), new, count=1, flags=re.S)
        if k != 1:
            sys.exit(f'{L}: paneelia pd-{pid} ei löydy')
        s = s.replace(art, new2)
    return s


def build(check=False):
    changed = []
    for L in ('fi', 'et'):
        f = ROOT + f'src/{L}.html'
        s0 = open(f, encoding='utf-8').read()
        s = front(s0, L)
        A = '<!-- kumppanit:profiilit:alku -->'; B = '<!-- kumppanit:profiilit:loppu -->'
        if A not in s:
            sys.exit(f'{L}: merkit {A} puuttuvat')
        i = s.index(A) + len(A); j = s.index(B)
        s = s[:i] + '\n      ' + block(L) + '\n      ' + s[j:]
        A2 = '<!-- kumppanit:logot:alku -->'; B2 = '<!-- kumppanit:logot:loppu -->'
        if A2 in s:
            i = s.index(A2) + len(A2); j = s.index(B2)
            s = s[:i] + logos(L) + s[j:]
        if s != s0:
            changed.append(L)
            if not check:
                open(f, 'w', encoding='utf-8').write(s)
    if check and changed:
        sys.exit('kumppaniprofiilit eivät vastaa dataa: ' + ', '.join(changed) + ' (aja build_kumppanit.py)')
    print('kumppaniprofiilit:', 'muuttui ' + ', '.join(changed) if changed else 'ajan tasalla')


if __name__ == '__main__':
    build('--check' in sys.argv)
