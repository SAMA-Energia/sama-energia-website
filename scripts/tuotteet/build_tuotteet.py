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
    'ralos-480': dict(fi='Ralos Oy, esite RLS-480, 6/2023', et='Ralos Oy, brošüür RLS-480, 6/2023', url=None),
    'roofit-vs': dict(fi='Roofit.Solar, Velario Slim -datalehti 2026-02 V1', et='Roofit.Solar, Velario Slim andmeleht 2026-02 V1', url='https://roofit.solar/wp-content/uploads/2026/04/velario-slim-datasheets-2026-02-v1.pdf'),
    'avant-cube': dict(fi='Avant Power, OptiTemp® Cube 47 -esite, 6/2026', et='Avant Power, OptiTemp® Cube 47 brošüür, 6/2026', url='https://avanttecno.com/fi/wp-content/uploads/sites/7/2026/08/avant-power-cube47-esite-A4-FI-web.pdf'),
}

NB = '&nbsp;'
import re
def n(s):  # sitova välilyönti vain luvun ja yksikön väliin sekä tuhaterottimeksi; sanojen välissä rivi saa katketa
    s = re.sub(r'(?<=\d) (?=\d{3}\b)', NB, s)
    s = re.sub(r'(?<=[\d)]) (?=(?:kWh|kW|kVA|V|ms|m|t|kg)\b)', NB, s)
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
    dict(id='ralos-rls-480', mk='Ralos', model='RLS-480', cats=['paneeli'], src='ralos-480',
         alt=('Ralosin täysmusta kaksipuolinen aurinkopaneeli RLS-480, kuva: Ralos Oy', 'Ralose täismust kahepoolne päikesepaneel RLS-480, foto: Ralos Oy'),
         t=('Täysmusta kaksipuolinen aurinkopaneeli, HJT-kennot', 'Täismust kahepoolne päikesepaneel, HJT-elemendid'),
         s=[('Teho', 'Võimsus', '480 W', '480 W'), ('Hyötysuhde', 'Kasutegur', '22,3 %', '22,3 %'),
            ('Kaksipuolisuus', 'Kahepoolsus', '90 %', '90 %'), ('Koko', 'Mõõdud', '1,96 × 1,10 m', '1,96 × 1,10 m')]),
    dict(id='roofit-velario-slim', mk='Roofit.Solar', model='Velario Slim', cats=['katto'], src='roofit-vs', photo=True, langs=['fi'],
         alt=('Aurinkokatto omakotitalossa, kuva: Gare Energy Oy', ''),
         t=('Aurinkokatto konesaumakattoon, Suomessa toimittaa Gare Energy Oy', ''),
         s=[('Teho', '', '180 W / moduuli', ''), ('Hyötysuhde', '', '19,1 %', ''),
            ('Paloluokka', '', 'BROOF(t2)', ''), ('Kattokaltevuus', '', 'vähintään 10°', '')]),
]

CATS = {
    'varastot': [
        ('kaikki', 'Kaikki', 'Kõik'),
        ('kaappi', 'Ulkokaapit', 'Väliskapid'),
        ('hybridi', 'Hybridikaapit', 'Hübriidkapid'),
        ('kontti', 'Kontit', 'Konteinerid'),
        ('siirrettava', 'Siirrettävät ja lataus', 'Teisaldatavad ja laadimine'),
        ('varavoima', 'Varavoima', 'Varutoide'),
    ],
    'aurinko': [
        ('kaikki', 'Kaikki', 'Kõik'),
        ('paneeli', 'Aurinkopaneelit', 'Päikesepaneelid'),
        ('katto', 'Aurinkokatto', 'Päikesekatus'),
        ('hybridi', 'Aurinko ja varasto', 'Päike ja salvesti'),
    ],
}

NOTE_AURINKO = {
    'fi': 'Tekniset tiedot ovat valmistajien datalehdiltä ja esitteistä. Paneelit, voimalan koko ja invertterit valitaan kohteenne kulutuksen, katon ja liittymän mukaan, '
          'ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla. Varavoima koskee valittuja piirejä, jotka suunnitellaan kohdekäynnillä.',
    'et': 'Tehnilised andmed on tootjate andmelehtedelt ja brošüüridelt. Paneelid, jaama suurus ja inverterid valitakse teie objekti tarbimise, katuse ja liitumise järgi '
          'ning variante võrreldakse kirjalikus hinnangus samade numbritega. Varutoide hõlmab valitud ahelaid, mis kavandatakse objektikülastusel.',
}

TXT = {
    'fi': dict(src='Lähde', read='luettu', checked='tarkistettu', group='Tuoteryhmä', tab='Näytä',
               note='Tekniset tiedot ovat valmistajien datalehdiltä ja tuotesivuilta. Varavoima koskee valittuja piirejä, jotka suunnitellaan kohdekäynnillä. '
                    'Valmistaja ja malli valitaan kohteenne kulutuksen, liittymän ja tilan mukaan, ja vaihtoehdot vertaillaan kirjallisessa arviossa samoilla luvuilla.'),
    'et': dict(src='Allikas', read='loetud', checked='kontrollitud', group='Tooterühm', tab='Näita',
               note='Tehnilised andmed on tootjate andmelehtedelt ja tootelehtedelt. Varutoide hõlmab valitud ahelaid, mis kavandatakse objektikülastusel. '
                    'Tootja ja mudel valitakse teie objekti tarbimise, liitumise ja ruumi järgi ning variante võrreldakse kirjalikus hinnangus samade numbritega.'),
}

def card(p, L, pre):
    i = 0 if L == 'fi' else 1
    src = SRC[p['src']]
    s_label = src[L]
    stamp = f'{TXT[L]["read"]} {LUETTU}' if src['url'] else (f'{TXT[L]["checked"]} {LUETTU}' if src.get('check') else None)
    s_html = (f'<a href="{src["url"]}" rel="noopener" target="_blank">{s_label}</a>' if src['url'] else s_label)
    if stamp: s_html += f', {stamp}'
    specs = ''.join(f'<div><dt>{sp[i]}</dt><dd>{n(sp[2 + i])}</dd></div>' for sp in p['s'])
    cls = 'tc' + (' tc-ph' if p.get('photo') else '')
    model = p.get('model_et') if (L == 'et' and p.get('model_et')) else p['model']
    return (f'<li class="{cls}" id="{pre}-{p["id"]}" data-c="{" ".join(p["cats"])}">'
            f'<figure class="tc-m"><img src="/assets/tuotteet/{p["id"]}.webp" alt="{html.escape(p["alt"][i], quote=True)}" width="600" height="600" loading="lazy" decoding="async"></figure>'
            f'<div class="tc-b"><p class="tc-mk">{p["mk"]}</p><h3 class="tc-n">{model}</h3><p class="tc-t">{p["t"][i]}</p>'
            f'<dl class="tc-s">{specs}</dl>'
            f'<p class="tc-src">{TXT[L]["src"]}: {s_html}</p></div></li>')

BYID = {p['id']: p for p in P}

def catalog(L, name):
    b = BLOCKS[name]; pre = b['pre']; cats = CATS[name]
    i = 1 if L == 'fi' else 2
    items = [(BYID[pid], pc) for pid, pc in b['items'] if L in BYID[pid].get('langs', ['fi', 'et'])]
    cnt = {c[0]: (len(items) if c[0] == 'kaikki' else sum(1 for _, pc in items if c[0] in pc)) for c in cats}
    chips = ''.join(
        f'<input type="radio" name="{pre}-v" id="{pre}-v-{c[0]}" value="{c[0]}"{" checked" if c[0] == "kaikki" else ""}>'
        f'<label for="{pre}-v-{c[0]}">{c[i]} <span>{cnt[c[0]]}</span></label>'
        for c in cats if cnt[c[0]])
    cards = ''.join(card(dict(p, cats=pc), L, pre) for p, pc in items)
    note = b.get('note', {}).get(L) or TXT[L]['note']
    return (f'<div class="tuo-f" role="radiogroup" aria-label="{TXT[L]["group"]}">{chips}</div>'
            f'<ul class="tuo-g" role="list">{cards}</ul>'
            f'<p class="tuo-note">{note}</p>')

VARASTOT = ['ralos-beast-125-hd', 'elecnova-eco-e418lp', 'elecnova-eco-e101wx', 'ep-energy-epes233', 'ep-energy-ephs', 'elecnova-eco-e64wx',
            'elecnova-eco-e20ft2170lp', 'ep-energy-epes5000', 'ep-energy-epps93-m', 'ep-energy-epps210-m', 'ep-energy-epcs209',
            'avant-power-cube-47', 'elecnova-eco-sts-c125']
BLOCKS = {
    'varastot': dict(pre='tv', items=[(pid, BYID[pid]['cats']) for pid in VARASTOT]),
    'aurinko': dict(pre='ta', note=NOTE_AURINKO, items=[
        ('ralos-rls-585', ['paneeli']), ('ralos-rls-480', ['paneeli']), ('roofit-velario-slim', ['katto']),
        ('ralos-beast-125-hd', ['hybridi']), ('ep-energy-ephs', ['hybridi']), ('elecnova-eco-e64wx', ['hybridi'])]),
}

def block(name, L):
    return (f'<!-- tuotteet:{name}:alku — GENEROITU: python3 scripts/tuotteet/build_tuotteet.py. Muokkaa skriptiä, älä tätä lohkoa. -->'
            + catalog(L, name) + f'<!-- tuotteet:{name}:loppu -->')

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); a = ap.parse_args()
    bad = 0
    for L in ('fi', 'et'):
        f = ROOT / 'src' / f'{L}.html'; s = f.read_text(encoding='utf-8'); o = s
        for name in BLOCKS:
            b0 = f'<!-- tuotteet:{name}:alku'; e0 = f'<!-- tuotteet:{name}:loppu -->'
            i = s.find(b0); j = s.find(e0)
            if i < 0 or j < 0:
                print(f'{f.name}: merkit tuotteet:{name} puuttuvat', file=sys.stderr); bad += 1; continue
            s = s[:i] + block(name, L) + s[j + len(e0):]
        if s != o:
            if a.check: print(f'{f.name}: tuotelohko ei ole ajan tasalla', file=sys.stderr); bad += 1
            else: f.write_text(s, encoding='utf-8'); print(f'{f.name}: päivitetty')
        else: print(f'{f.name}: ajan tasalla')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
