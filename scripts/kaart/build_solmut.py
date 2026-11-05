#!/usr/bin/env python3
"""
SAMA kaart — kirjoittaa assets/kartta-solmut.json: kartan nimetyt solmut (datakeskukset, tuuli-, aurinko- ja varastopuistot,
kantaverkon rakenteilla ja suunnitteilla olevat voimajohdot, rajayhteydet). Madis 6.11.2026: "sõlmed esile", EstLink 3 täpsemalt,
suured pargid, andmekeskused suurusega; omistajien nimet lähteineen ja myös ilmoitetut suunnitelmat tilan kanssa (CLAUDE.md).

Aineisto (jokaisella kohteella lähde ja päivä):
  - Suomen datakeskukset: Datakeskushankkeiden kansallinen rekisteri, CC BY 4.0
    (docs/kaart/lahteet/datakeskusrekisteri-*.json, karsittu tilannekuva; kohdekohtainen linkki rekisterin hankesivulle).
  - Viron datakeskukset: Sunly 17.3.2026, ERR 17.6.2026 (käsin, alla).
  - Tuuli-, aurinko- ja varastopuistot: OpenStreetMap (ODbL), docs/kaart/osm/plants-*.json; kynnys tuuli >= 40 MW,
    aurinko >= 15 MW, varasto >= 5 MW; maa kartta-pohja.json:n maakuntarajoista.
  - Kantaverkon hankkeet: Fingrid, Kantaverkon kehittämissuunnitelma 2026–2035 (12/2025), vaihe ja valmistumisvuosi
    suunnitelman aikajanasta; rajayhteydet Fingrid 6.2.2026; EstLink 3:n Viron osa Elering (eriplaneering) ja ERR 26.7.2024.
    Päätepisteet OSM-sähköasemista (docs/kaart/osm/substations-*.json) tai paikannimistä (In-ADS, Nominatim); reitti on suora
    viiva päätepisteiden välillä = suuntaa-antava.

Ajo:  python3 scripts/kaart/build_solmut.py      (aina kun lähdeaineisto päivittyy; tarkistus 1.2.2027 kuten kartta-data.json)
"""
import json, math, pathlib, re, glob, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
A = ROOT / 'assets'
DATE = '2026-11-06'

# ---------------------------------------------------------------- lähteet
S = {
    'dkr': {'pub': 'Datakeskushankkeiden kansallinen rekisteri (CC BY 4.0)', 'date': '2026-11-04', 'url': 'https://www.datakeskusrekisteri.fi/'},
    'sunly': {'pub': 'Sunly', 'date': '2026-03-17', 'url': 'https://sunly.ee/uudised/sunly-kavandab-eestisse-baltimaade-suurimat-andmekeskust'},
    'err-dc': {'pub': 'ERR', 'date': '2026-06-17', 'url': 'https://www.err.ee/1610056444/kaks-arendajat-tunnevad-huvi-lihula-kulje-alla-andmekeskuse-rajamise-vastu'},
    'osm': {'pub': 'OpenStreetMap-tekijät (ODbL 1.0)', 'date': '2026-11-02', 'url': 'https://www.openstreetmap.org/copyright'},
    'fg-ksu': {'pub': 'Fingrid, Kantaverkon kehittämissuunnitelma 2026–2035', 'date': '2025-12-02',
               'url': 'https://www.fingrid.fi/globalassets/dokumentit/fi/kantaverkko/kantaverkon-kehittaminen/kantaverkon-kehittamissuunnitelma-2026-2035/fingrid_kehittamissuunnitelma_a4_2.12_lr.pdf'},
    'fg-raja': {'pub': 'Fingrid, Rajajohtohankkeet (Sähkömarkkinatoimikunta)', 'date': '2026-02-06',
                'url': 'https://www.fingrid.fi/globalassets/dokumentit/fi/yhtio/toimikunnat/markkinatoimikunta/smtk126_fingrid-rajajohtohankkeet-2026-02-03.pdf'},
    'fg-rajoitus': {'pub': 'Fingrid', 'date': '2025-09-26',
                    'url': 'https://www.fingrid.fi/en/news/news/2025/fingrid-secures-transmission-capacity-for-growth-in-electricity-consumption-and-new-industrial-investments--restrictions-on-new-energy-storage-facility-connections-continued-in-southern-finland'},
    'bf-google': {'pub': 'Business Finland', 'date': '2024', 'url': 'https://www.businessfinland.com/news/2024/google-purchases-land-for-future-expansion-of-its-cloud-and-data-center-infrastructure-in-finland/'},
    'el-el3': {'pub': 'Elering, EstLink 3 maismaaosa (riigi eriplaneering)', 'date': '2026-11-06', 'url': 'https://elering.ee/en/node/3894'},
    'err-ulemiste': {'pub': 'ERR', 'date': '2024-07-26', 'url': 'https://www.err.ee/1609407712/elering-tahab-estlink-3-tottu-ulemiste-jarve-aarde-uue-alajaama-ehitada'},
}

# ---------------------------------------------------------------- tilat ja lajit (kartan selite; FI/ET)
STATUS = {
    'op':   {'fi': 'Käytössä', 'et': 'Töös'},
    'con':  {'fi': 'Rakenteilla', 'et': 'Ehitusel'},
    'per':  {'fi': 'Luvitus', 'et': 'Loamenetlus'},
    'plan': {'fi': 'Kaavoitus tai YVA', 'et': 'Planeering või KMH'},
    'pre':  {'fi': 'Esiselvitys', 'et': 'Eeluuring'},
    'cond': {'fi': 'Ehdollinen: jos alueen kulutus tai tuotanto kasvaa', 'et': 'Tingimuslik: kui piirkonna tarbimine või tootmine kasvab'},
}
KIND = {
    'dc':    {'fi': 'Datakeskus', 'et': 'Andmekeskus'},
    'wind':  {'fi': 'Tuulivoimapuisto', 'et': 'Tuulepark'},
    'solar': {'fi': 'Aurinkovoimala', 'et': 'Päikesepark'},
    'bess':  {'fi': 'Sähkövarasto', 'et': 'Salvesti'},
    'line':  {'fi': 'Kantaverkon voimajohto', 'et': 'Põhivõrgu liin'},
    'link':  {'fi': 'Rajayhteys', 'et': 'Riikidevaheline ühendus'},
    'sub':   {'fi': 'Sähköasema', 'et': 'Alajaam'},
}
DKR_STAGE = {'toiminnassa': 'op', 'rakenteilla': 'con', 'lupamenettely': 'per', 'yva_paattynyt': 'plan',
             'kaavoitus': 'plan', 'yva_vireilla': 'plan', 'esiselvitys': 'pre'}   # peruttu → pois

# sivuston nimivartijat (verify-pages): nämä eivät saa tulla kartta-aineistoon minkään kautta
BANNED = re.compile(r'\bVENI\b|venienergia|EP Energy|EP Equipment|\bEnergen\b|Roofit|Grenke|\bSvea\b|Salama Sähkö', re.I)

# ---------------------------------------------------------------- maat maakuntarajoista (kartta-pohja.json)
base = json.loads((A / 'kartta-pohja.json').read_text(encoding='utf-8'))
M = base['meta']
a_ = 6378137.0; f_ = 1 / 298.257222101; e_ = math.sqrt(2 * f_ - f_ * f_); d_ = math.pi / 180
def _m(p): s = math.sin(p); return math.cos(p) / math.sqrt(1 - e_ * e_ * s * s)
def _t(p): s = math.sin(p); return math.tan(math.pi / 4 - p / 2) / ((1 - e_ * s) / (1 + e_ * s)) ** (e_ / 2)
p1, p2, p0, l0 = 58.5 * d_, 67.5 * d_, 63 * d_, 25.5 * d_
n_ = (math.log(_m(p1)) - math.log(_m(p2))) / (math.log(_t(p1)) - math.log(_t(p2)))
F_ = _m(p1) / (n_ * _t(p1) ** n_); r0_ = a_ * F_ * _t(p0) ** n_
def proj(lon, lat):
    r = a_ * F_ * _t(lat * d_) ** n_; th = n_ * (lon * d_ - l0)
    X, Y = r * math.sin(th), r0_ - r * math.cos(th)
    return (X - M['x0']) / M['unit_m'], (M['y1'] - Y) / M['unit_m']

def rings(path):
    toks = re.findall(r'[MmLlHhVvZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?', path)
    out, cur, cmd, x, y, sx, sy, i = [], [], None, 0.0, 0.0, 0.0, 0.0, 0
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t; i += 1
            if cmd in 'Zz':
                if len(cur) > 2: out.append(cur)
                cur, x, y = [], sx, sy
            continue
        if cmd in 'Mm':
            nx, ny = float(toks[i]), float(toks[i + 1]); i += 2
            x, y = (x + nx, y + ny) if cmd == 'm' else (nx, ny)
            if len(cur) > 2: out.append(cur)
            cur, sx, sy = [(x, y)], x, y; cmd = 'l' if cmd == 'm' else 'L'
        elif cmd in 'Ll':
            nx, ny = float(toks[i]), float(toks[i + 1]); i += 2
            x, y = (x + nx, y + ny) if cmd == 'l' else (nx, ny); cur.append((x, y))
        elif cmd in 'Hh':
            v = float(toks[i]); i += 1; x = x + v if cmd == 'h' else v; cur.append((x, y))
        elif cmd in 'Vv':
            v = float(toks[i]); i += 1; y = y + v if cmd == 'v' else v; cur.append((x, y))
        else: i += 1
    if len(cur) > 2: out.append(cur)
    return out
REG = [(c, rings(p)) for c, p in base['land'].items()]   # maiden maarajat (FI, EE, SE, NO, RU, LV, LT, BY)
def inring(x, y, r):
    ins = False
    for i in range(len(r)):
        (ax, ay), (bx, by) = r[i], r[i - 1]
        if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax: ins = not ins
    return ins
def country(lon, lat):
    x, y = proj(lon, lat)
    for dx, dy in [(0, 0)] + [(dx * 30, dy * 30) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1))]:
        for c, rr in REG:   # rannikon ja saarten pisteet: 3 km:n toleranssi (yksinkertaistettu rantaviiva)
            if any(inring(x + dx, y + dy, r) for r in rr): return c
    return None

# ---------------------------------------------------------------- OSM-sähköasemat nimellä (päätepisteet)
raw_sub = json.loads(sorted((ROOT / 'docs' / 'kaart' / 'osm').glob('substations-*.json'))[-1].read_text(encoding='utf-8'))
def volts(v):
    out = []
    for p in str(v or '').replace(',', ';').split(';'):
        try: out.append(int(float(p)))
        except ValueError: pass
    return out
def sub(name_re, vmin=110000):
    best = None
    for el in raw_sub['elements']:
        t = el.get('tags', {}); nm = t.get('name') or ''
        if not re.search(name_re, nm): continue
        vs = volts(t.get('voltage'))
        if not vs or max(vs) < vmin: continue
        lon = el.get('lon') or el.get('center', {}).get('lon'); lat = el.get('lat') or el.get('center', {}).get('lat')
        if lon is None: continue
        if not best or max(vs) > best[2]: best = (round(lon, 4), round(lat, 4), max(vs))
    if not best: sys.exit(f'sähköasemaa ei löydy: {name_re}')
    return [best[0], best[1]]

P = {   # päätepisteet: OSM-sähköasema tai (paikannimi, lähde) — merkitty "~" = likimääräinen
    'Huittinen': sub(r'^Huittinen sähköasema'), 'Forssa': sub(r'^Forssa sähköasema'), 'Alajärvi': sub(r'^Alajärven sähköasema'),
    'Toivila': sub(r'^Toivilan sähköasema'), 'Hikiä': sub(r'^Hikiän sähköasema'), 'Kristiinankaupunki': sub(r'^Kristinestad sähköasema'),
    'Nuojuankangas': sub(r'^Nuojuankankaan sähköasema'), 'Seitenoikea': sub(r'^Seitenoikea sähköasema'), 'Anttila': sub(r'^Anttilan sähköasema'),
    'Länsisalmi': sub(r'^Länsisalmen sähköasema'), 'Lieto': sub(r'^Lieto$'), 'Petäjäskoski': sub(r'^Petäjäskoski sähköasema'),
    'Inkoo': sub(r'^Inkoon sähköasema'), 'Seinäjoki': sub(r'^Seinäjoen sähköasema'), 'Hirvisuo': sub(r'^Hirvisuo$'),
    'Huutokoski': sub(r'^Huutokosken sähköasema'), 'Kontiolahti': sub(r'^Kontiolahti sähköasema'), 'Rauma': sub(r'^Rauma sähköasema'),
    'Kiisa': sub(r'^Kiisa alajaam', 330000), 'Rakvere': sub(r'^Rakvere alajaam', 330000), 'Püssi': sub(r'^Püssi alajaam', 330000),
    'Paide': sub(r'^Paide alajaam', 330000), 'Sopi': sub(r'^Sopi alajaam', 330000), 'Sindi': sub(r'^Sindi alajaam', 330000),
    'Aruküla': sub(r'^Aruküla alajaam', 330000),
    # paikannimet (sähköasemaa ei ole OSM:ssä tai se on uusi): Nominatim / In-ADS 6.11.2026
    'Jylkkä~': [24.2054, 64.2818], 'Nokia~': [23.5096, 61.4782], 'Raisio~': [22.1693, 60.4855], 'Herva~': [26.9615, 65.9188],
    'Rehemäe~': [24.1050, 59.0000], 'Aulepa~': [23.5928, 59.0719], 'Risti~': [24.0584, 58.9985], 'Lihula~': [23.8355, 58.6892],
    'Ülemiste~': [24.7886, 59.4250],
}
def pt(k): return P[k] if k in P else P[k + '~']
def approx(*ks): return any((k + '~') in P for k in ks)

# ---------------------------------------------------------------- kantaverkon hankkeet ja rajayhteydet (käsin, lähteineen)
# (id, nimi, lähtö, tulo, tila, valmistumisvuosi, lähde, huomio FI, huomio ET)
LINES = [
    ('fg1', 'Huittinen–Forssa 400+110 kV', 'Huittinen', 'Forssa', 'op', 2025, 'fg-ksu', None, None),
    ('fg5', 'Herva–Nuojuankangas 400 kV', 'Herva', 'Nuojuankangas', 'con', 2026, 'fg-ksu', None, None),
    ('fg6', 'Jylkkä–Alajärvi 400+110 kV', 'Jylkkä', 'Alajärvi', 'con', 2028, 'fg-ksu', None, None),
    ('fg7', 'Alajärvi–Toivila 400+110 kV', 'Alajärvi', 'Toivila', 'con', 2028, 'fg-ksu', None, None),
    ('fg8', 'Toivila–Hikiä 400 kV', 'Toivila', 'Hikiä', 'con', 2028, 'fg-rajoitus',
     'Fingrid sitoo Etelä-Suomen sähkövarastojen liittämisrajoituksen tähän yhteyteen: rajoitus jatkuu vuoteen 2029.',
     'Fingrid seob Lõuna-Soome salvestite liitumispiirangu selle ühendusega: piirang kestab 2029. aastani.'),
    ('fg9', 'Kristiinankaupunki–Nokia 400+110 kV', 'Kristiinankaupunki', 'Nokia', 'con', 2029, 'fg-ksu', None, None),
    ('fg11', 'Nuojuankangas–Seitenoikea 400+110 kV', 'Nuojuankangas', 'Seitenoikea', 'per', 2030, 'fg-ksu', None, None),
    ('fg12', 'Hausjärvi–Anttila 400 kV', 'Hikiä', 'Anttila', 'per', 2030, 'fg-ksu', None, None),
    ('fg13', 'Länsisalmi–Anttila 400 kV', 'Länsisalmi', 'Anttila', 'per', 2030, 'fg-ksu', None, None),
    ('fg14', 'Lieto–Raisio 400 kV', 'Lieto', 'Raisio', 'plan', 2031, 'fg-ksu', None, None),
    ('fg16', 'Petäjäskoski–Herva 400 kV', 'Petäjäskoski', 'Herva', 'per', 2033, 'fg-ksu', None, None),
    ('fg21', 'Hikiä–Inkoo 400 kV', 'Hikiä', 'Inkoo', 'cond', None, 'fg-ksu', None, None),
    ('fg22', 'Seinäjoki–Hirvisuo 400+110 kV', 'Seinäjoki', 'Hirvisuo', 'cond', None, 'fg-ksu', None, None),
    ('fg23', 'Huutokoski–Kontiolahti 400+110 kV', 'Huutokoski', 'Kontiolahti', 'cond', None, 'fg-ksu', None, None),
    # Elering: EstLink 3 maismaaosa ja sen vaatimat vahvistukset
    ('el-rehemae', 'Rehemäe–Aulepa 330 kV (uusi)', 'Rehemäe', 'Aulepa', 'plan', None, 'el-el3',
     'Uusi 330 kV:n johto EstLink 3:n muuttaja-asemalle.', 'Uus 330 kV liin EstLink 3 muundurjaamani.'),
    ('el-kr', 'Kiisa–Rakvere 330 kV (uusiminen)', 'Kiisa', 'Rakvere', 'plan', None, 'el-el3', None, None),
    ('el-rp', 'Rakvere–Püssi 330 kV (uusiminen)', 'Rakvere', 'Püssi', 'plan', None, 'el-el3', None, None),
    ('el-ps', 'Paide–Sopi 330 kV (uusiminen)', 'Paide', 'Sopi', 'plan', None, 'el-el3', None, None),
    ('el-ss', 'Sopi–Sindi 330 kV (uusiminen)', 'Sopi', 'Sindi', 'plan', None, 'el-el3', None, None),
    ('el-ta', 'Tallinna uus alajaam–Aruküla 330 kV', 'Ülemiste', 'Aruküla', 'plan', None, 'err-ulemiste',
     'Asema Ülemistejärven rannalle; tarkka paikka ratkeaa erityiskaavassa.', 'Alajaam Ülemiste järve kaldale; täpne asukoht selgub eriplaneeringus.'),
    ('el-tk', 'Tallinna uus alajaam–Kiisa 330 kV', 'Ülemiste', 'Kiisa', 'plan', None, 'err-ulemiste', None, None),
]
LINKS = [  # rajayhteydet: piste (ja suunta), ei reittiä
    {'id': 'estlink3', 'n': 'EstLink 3', 'o': 'Elering, Fingrid', 'mw': 700, 's': 'plan', 'y': 2040, 'at': 'Aulepa', 'to': [23.25, 59.45], 'src': 'fg-raja',
     'note': {'fi': 'Muuttaja-asema Aulepan lähelle (Lääne-Nigula). Noin 120 km tasavirtakaapeli läntisellä Suomenlahdella; Suomen pään asema on auki, myös länsirannikon vaihtoehtoja tutkitaan. Valmis vuoteen 2040 mennessä.',
              'et': 'Muundurjaam Aulepa lähedale (Lääne-Nigula vald). Umbes 120 km alalisvoolukaabel Soome lahe lääneosas; Soome otsa alajaam on lahtine, uuritakse ka läänerannikut. Valmib 2040. aastaks.'},
     'src2': 'el-el3'},
    {'id': 'fennoskan3', 'n': 'Fenno-Skan 3', 'o': 'Fingrid, Svenska kraftnät', 'mw': 800, 'mw0': 600, 's': 'pre', 'y': 2040, 'at': 'Rauma', 'to': [20.3, 61.1], 'src': 'fg-raja',
     'note': {'fi': 'Samalle alueelle kuin nykyiset Fenno-Skan-kaapelit, reilut 200 km. 600–800 MW, valmis vuoteen 2040 mennessä.',
              'et': 'Samasse piirkonda kui praegused Fenno-Skani kaablid, veidi üle 200 km. 600–800 MW, valmib 2040. aastaks.'}},
    {'id': 'aurora2', 'n': 'Aurora Line 2', 'o': 'Fingrid, Svenska kraftnät', 'mw': 800, 's': 'plan', 'y': 2036, 'at': 'Herva', 'to': [24.0, 66.3], 'src': 'fg-raja',
     'note': {'fi': 'Reitti Trolltjärn–Degerträsk–Louepalo–Herva, 350–400 km. Noin 800 MW lisää siirtokykyä Ruotsiin, valmis vuoden 2036 aikana.',
              'et': 'Trass Trolltjärn–Degerträsk–Louepalo–Herva, 350–400 km. Umbes 800 MW lisavõimsust Rootsiga, valmib 2036. aasta jooksul.'}},
]
DC_EE = [
    {'id': 'ee-risti', 'n': 'Risti andmekeskuse kampus', 'o': 'Sunly', 'mw': 180, 's': 'plan', 'at': 'Risti', 'src': 'sunly',
     'note': {'fi': '36 ha, kuusi rakennusta. Asemakaavahakemus 18.2.2026; sähkö Eleringin kantaverkosta saman aseman kautta kuin Ristin aurinkopuisto.',
              'et': '36 ha, kuus hoonet. Detailplaneeringu taotlus 18.2.2026; elekter Eleringi põhivõrgust sama alajaama kaudu kui Risti päikesepark.'}},
    {'id': 'ee-lihula', 'n': 'Lihula andmekeskus', 'o': 'Evecon', 'mw': 100, 's': 'plan', 'at': 'Lihula', 'src': 'err-dc',
     'note': {'fi': 'Enintään 100 MW, 22,4 ha Lihulan luoteisreunalla, oma 330 kV:n sähköasema. Asemakaavan vireillepanoa haettu.',
              'et': 'Kuni 100 MW, 22,4 ha Lihula loodeküljel, oma 330 kV alajaam. Detailplaneeringu algatamist on taotletud.'}},
]

# ---------------------------------------------------------------- kokoaminen
items = []
def add(it):
    txt = ' '.join(str(it.get(k) or '') for k in ('n', 'o'))
    if BANNED.search(txt): sys.exit(f'kielletty nimi kartta-aineistossa: {txt}')
    items.append(it)

# Suomen datakeskukset rekisteristä
snap = json.loads(sorted((ROOT / 'docs' / 'kaart' / 'lahteet').glob('datakeskusrekisteri-*.json'))[-1].read_text(encoding='utf-8'))
for h in snap['hankkeet']:
    st = DKR_STAGE.get(h['vaihe'])
    if not st or h['lat'] is None: continue
    c = country(h['lon'], h['lat'])
    if c != 'FI': continue
    it = {'id': 'dc-' + h['id'][:8], 'k': 'dc', 'c': 'FI', 'n': h['nimi'], 'm': h['kunta'], 's': st,
          'p': [round(h['lon'], 4), round(h['lat'], 4)], 'src': 'dkr', 'u': 'https://www.datakeskusrekisteri.fi/hankkeet/' + h['id']}
    if h['toimija']: it['o'] = h['toimija']
    # Googlen palvelinkeskukset (rekisterissä toimija Tuike Finland Oy): Business Finland 2024 nimeää Haminan, Kajaanin ja Muhoksen
    if h['toimija'] == 'Tuike Finland Oy' and re.match(r'Palvelinkeskus (Hamina|Kajaani|Muhos)', h['nimi']):
        it['o'] = 'Google (Tuike Finland Oy)'; it['src2'] = 'bf-google'
    if h['teho_mw'] is not None: it['mw'] = h['teho_mw']      # sähköteho
    if h['it_teho_mw'] is not None: it['mwit'] = h['it_teho_mw']   # IT-teho
    if h['sijainti'] == 'arvio': it['ax'] = 1
    add(it)
for x in DC_EE:
    add({'id': x['id'], 'k': 'dc', 'c': 'EE', 'n': x['n'], 'o': x['o'], 'mw': x['mw'], 's': x['s'], 'p': pt(x['at']), 'ax': 1,
         'src': x['src'], 'note': x['note']})

# OSM-puistot
plants = json.loads(sorted((ROOT / 'docs' / 'kaart' / 'osm').glob('plants-*.json'))[-1].read_text(encoding='utf-8'))
def mwof(v):
    v = str(v or '').strip().lower().replace(',', '.')
    m = re.match(r'^([\d.]+)\s*(mw|kw|gw)?$', v)
    if not m: return None
    x = float(m.group(1)); u = m.group(2) or 'mw'
    return x / 1000 if u == 'kw' else x * 1000 if u == 'gw' else x
KMIN = {'wind': 40, 'solar': 15, 'battery': 5}
for el in plants['elements']:
    t = el.get('tags', {}); src = t.get('plant:source')
    if src not in KMIN: continue
    mw = mwof(t.get('plant:output:electricity'))
    if mw is None or mw < KMIN[src]: continue
    lon = el.get('lon') or el.get('center', {}).get('lon'); lat = el.get('lat') or el.get('center', {}).get('lat')
    if lon is None: continue
    c = country(lon, lat)
    if c not in ('FI', 'EE'): continue
    k = {'wind': 'wind', 'solar': 'solar', 'battery': 'bess'}[src]
    it = {'id': f'osm-{el["type"][0]}{el["id"]}', 'k': k, 'c': c, 'n': t.get('name') or KIND[k]['fi' if c == 'FI' else 'et'],
          'mw': round(mw, 1), 's': 'op', 'p': [round(lon, 4), round(lat, 4)], 'src': 'osm',
          'u': f'https://www.openstreetmap.org/{el["type"]}/{el["id"]}'}
    if t.get('operator'): it['o'] = t['operator']
    if t.get('start_date', '')[:4].isdigit(): it['y'] = int(t['start_date'][:4])
    add(it)

# kantaverkon hankkeet
for (iid, nm, a, b, st, y, src, nfi, net) in LINES:
    c = 'EE' if iid.startswith('el') else 'FI'
    it = {'id': iid, 'k': 'line', 'c': c, 'n': nm, 'o': 'Elering' if c == 'EE' else 'Fingrid', 's': st,
          'g': [pt(a), pt(b)], 'src': src, 'route': 1}
    if y: it['y'] = y
    if approx(a, b): it['ax'] = 1
    if nfi: it['note'] = {'fi': nfi, 'et': net}
    if src != 'fg-ksu' and iid.startswith('fg'): it['src2'] = 'fg-ksu'
    if iid.startswith('el') and src != 'el-el3': it['src2'] = 'el-el3'
    add(it)
for x in LINKS:
    it = {'id': x['id'], 'k': 'link', 'c': 'EE' if x['id'] == 'estlink3' else 'FI', 'n': x['n'], 'o': x['o'], 'mw': x['mw'], 's': x['s'],
          'y': x['y'], 'p': pt(x['at']), 'to': x['to'], 'src': x['src'], 'note': x['note'], 'ax': 1}
    if 'mw0' in x: it['mw0'] = x['mw0']
    if 'src2' in x: it['src2'] = x['src2']
    add(it)

# tarkistukset
ids = [i['id'] for i in items]
assert len(ids) == len(set(ids)), 'kaksoistunniste'
for i in items:
    assert i['src'] in S, i
    assert i['s'] in STATUS, i
    for q in ([i['p']] if 'p' in i else []) + i.get('g', []):
        assert 19 < q[0] < 32.5 and 57.3 < q[1] < 70.2, (i['id'], q)

out = {'date': DATE, 'sources': S, 'status': STATUS, 'kind': KIND,
       'note': {'fi': 'Reitit ovat suuntaa-antavia: viiva yhdistää päätepisteet. ~ = sijainti likimääräinen.',
                'et': 'Trassid on suunda näitavad: joon ühendab otspunkte. ~ = asukoht ligikaudne.'},
       'items': items}
blob = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
(A / 'kartta-solmut.json').write_text(blob, encoding='utf-8')
from collections import Counter
print(f'assets/kartta-solmut.json {len(blob.encode())} tavua · {len(items)} kohdetta ·',
      dict(Counter(i['k'] + '/' + i['c'] for i in items)), '· tilat', dict(Counter(i['s'] for i in items)))
