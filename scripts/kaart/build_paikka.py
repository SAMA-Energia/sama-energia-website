#!/usr/bin/env python3
"""
SAMA kaart — kirjoittaa assets/kartta-paikka.js: "Teie objekti asukohas / Kohteenne sijainnissa" -kortti, joka näytetään,
kun lukija on valinnut liittymänsä paikan kartalla (painike "Kasuta minu asukohta" tai napautus kartalla).

Miksi (Madis 5.11.2026): "teie liitumine" ilman paikkaa ei kerro mitään. Kun paikka on valittu, kortti kertoo, mikä siinä
paikassa on totta, ja vain lähteistettyä:
  - Suomi: onko paikka Fingridin Etelä-Suomen liityntärajoituksen alueella vai alueella, jossa kantaverkossa on vapaata
    liityntäkapasiteettia varastoille (tekstit ja lähteet suoraan kartta-data.json:n aluekohteista, sama kuin kartalla);
  - lähin asema, jolla on 110 kV:n taso, ja lähin kantaverkon (FI 400/220 kV, EE 330 kV) asema etäisyyksineen
    (OpenStreetMap: kartta-pohja/-110 ja 110 kV:n taso raakadatan voltage-tagista); sama asema → yksi lause;
  - Viro: lähin suuri salvestipark (kartta-data.json:n Salvestid-kerroksen pisteet lähteineen);
  - mikä ei riipu paikasta (pörssihinta ja reservimarkkina ovat koko maassa samat) ja mikä riippuu (verkkoyhtiön tehomaksu
    ja liittymän ehdot) → pyyntö kirjalliseen arvioon.
Sijaintia ei tallenneta eikä lähetetä: kaikki lasketaan selaimessa tämän tiedoston aineistosta.

Ajo (aina kun kartta-pohja.json, kartta-110.json, kartta-data.json tai docs/kaart/osm/substations-*.json muuttuu):
    python3 scripts/kaart/build_paikka.py
Tiedosto on generoitu — älä muokkaa assets/kartta-paikka.js:ää käsin.
"""
import json, math, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
A = ROOT / 'assets'

# ---- Lambertin kartioprojektio GRS80 (sama kuin build_map.py ja kartta.js), käänteisenä ----
a = 6378137.0
f = 1 / 298.257222101
e = math.sqrt(2 * f - f * f)
d = math.pi / 180
def _m(p): s = math.sin(p); return math.cos(p) / math.sqrt(1 - e * e * s * s)
def _t(p): s = math.sin(p); return math.tan(math.pi / 4 - p / 2) / ((1 - e * s) / (1 + e * s)) ** (e / 2)
p1, p2, p0, l0 = 58.5 * d, 67.5 * d, 63 * d, 25.5 * d
n = (math.log(_m(p1)) - math.log(_m(p2))) / (math.log(_t(p1)) - math.log(_t(p2)))
F = _m(p1) / (n * _t(p1) ** n)
r0 = a * F * _t(p0) ** n

def inv(X, Y):
    """projisoitu (m) → (lon, lat)"""
    dy = r0 - Y
    r = math.copysign(math.hypot(X, dy), n)
    th = math.atan2(X, dy)
    tt = (r / (a * F)) ** (1 / n)
    lon = th / n + l0
    phi = math.pi / 2 - 2 * math.atan(tt)
    for _ in range(12):
        s = math.sin(phi)
        phi = math.pi / 2 - 2 * math.atan(tt * ((1 - e * s) / (1 + e * s)) ** (e / 2))
    return lon / d, phi / d

def fwd(lon, lat):
    r = a * F * _t(lat * d) ** n
    th = n * (lon * d - l0)
    return r * math.sin(th), r0 - r * math.cos(th)

base = json.loads((A / 'kartta-pohja.json').read_text(encoding='utf-8'))
v110 = json.loads((A / 'kartta-110.json').read_text(encoding='utf-8'))
data = json.loads((A / 'kartta-data.json').read_text(encoding='utf-8'))
M = base['meta']
unit, x0, y1 = M['unit_m'], M['x0'], M['y1']
def unproj(x, y): return inv(x * unit + x0, y1 - y * unit)

# tarkistus: edestakainen projektio
lon_c, lat_c = 25.35, 59.05
X, Y = fwd(lon_c, lat_c)
lo, la = inv(X, Y)
assert abs(lo - lon_c) < 1e-7 and abs(la - lat_c) < 1e-7, (lo, la)

# ---- alueet: polut → renkaat (lon/lat), yksinkertaistus ----
def rings(path):
    """SVG-polku (M/m, L/l, H/h, V/v, Z/z; luvut ilman erottimia, esim. "l-23-4-47") → renkaat lon/lat"""
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
            cur, sx, sy = [unproj(x, y)], x, y
            cmd = 'l' if cmd == 'm' else 'L'
        elif cmd in 'Ll':
            nx, ny = float(toks[i]), float(toks[i + 1]); i += 2
            x, y = (x + nx, y + ny) if cmd == 'l' else (nx, ny)
            cur.append(unproj(x, y))
        elif cmd in 'Hh':
            v = float(toks[i]); i += 1
            x = x + v if cmd == 'h' else v
            cur.append(unproj(x, y))
        elif cmd in 'Vv':
            v = float(toks[i]); i += 1
            y = y + v if cmd == 'v' else v
            cur.append(unproj(x, y))
        else:
            i += 1
    if len(cur) > 2: out.append(cur)
    return out

def dp(pts, tol):
    if len(pts) < 4: return pts
    def rec(i, j, keep):
        ax, ay = pts[i]; bx, by = pts[j]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-12
        best, bi = -1, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            dd = abs(dy * px - dx * py + bx * ay - by * ax) / L
            if dd > best: best, bi = dd, k
        if best > tol:
            keep.add(bi); rec(i, bi, keep); rec(bi, j, keep)
    keep = {0, len(pts) - 1}; rec(0, len(pts) - 1, keep)
    return [pts[k] for k in sorted(keep)]

def dpring(ring, tol):
    """suljettu rengas: jaetaan kahtia alkupisteestä kauimmaisen pisteen kohdalta ja yksinkertaistetaan puolikkaat"""
    if len(ring) > 3 and ring[0] == ring[-1]: ring = ring[:-1]
    if len(ring) < 4: return ring
    x0, y0 = ring[0]
    far = max(range(len(ring)), key=lambda k: (ring[k][0] - x0) ** 2 + (ring[k][1] - y0) ** 2)
    a, b = dp(ring[:far + 1], tol), dp(ring[far:] + [ring[0]], tol)
    return a[:-1] + b[:-1]

S = data['sources']
def srcref(sid):
    s = S[sid]
    return {'pub': s['pub'], 'date': s['date'], 'url': s['url']}

regions, seen = [], set()
for L in data['layers']:
    for fx in L.get('fx', []):
        if fx.get('t') != 'rg' or not fx.get('src'): continue
        key = (fx['cls'], tuple(fx['iso']))
        if key in seen: continue
        seen.add(key)
        rr = []
        for iso in fx['iso']:
            for ring in rings(base['regions'].get(iso, '')):
                s = dpring(ring, 0.02)
                if len(s) >= 4: rr.append([[round(x, 3), round(y, 3)] for x, y in s])
        regions.append({'cls': fx['cls'], 'lab': fx['lab'], 'val': fx['val'], 'src': srcref(fx['src']), 'rings': rr})
# rajoitusalueen tekstistä se versio, jossa on myös varastot (site-kerros), korvaa kulutusversion
site = next(L for L in data['layers'] if L['id'] == 'site')
site_rg = next((fx for fx in site.get('fx', []) if fx.get('t') == 'rg'), None)
if site_rg:
    for r in regions:
        if r['cls'] == site_rg['cls']:
            r.update({'lab': site_rg['lab'], 'val': site_rg['val'], 'src': srcref(site_rg['src'])})

# ---- sähköasemat lon/lat (OSM) ----
# [lon, lat, jänniteluokka, maa, 110] — viimeinen kenttä 1, jos aseman OSM-voltage-tagissa on 110 kV:n taso (100–199 kV).
# Kartan pohja ja 110-tiedosto tuntevat vain jänniteluokan (suurin jännite), joten taso haetaan raakadatasta
# (docs/kaart/osm/substations-*.json, sama aineisto, josta build_map.py teki asemat; kohdistus samoilla kokonaislukukoordinaateilla).
def parse_volts(v):
    out = []
    for part in str(v or '').replace(',', ';').split(';'):
        try: out.append(int(float(part.strip())))
        except ValueError: pass
    return out
VCLASS = [(380000, 400), (300000, 330), (200000, 220), (100000, 110)]
def vclass(vs):
    for lim, c in VCLASS:
        if any(v >= lim for v in vs): return c
    return None
raw_f = sorted((ROOT / 'docs' / 'kaart' / 'osm').glob('substations-*.json'))[-1]
lvl = {}
for el in json.loads(raw_f.read_text(encoding='utf-8'))['elements']:
    tg = el.get('tags', {}); vs = parse_volts(tg.get('voltage')); c = vclass(vs)
    lon = el.get('lon') or el.get('center', {}).get('lon'); lat = el.get('lat') or el.get('center', {}).get('lat')
    if not c or lon is None: continue
    X, Y = fwd(lon, lat)
    k = (int(round((X - x0) / unit)), int(round((y1 - Y) / unit)), c)
    lvl[k] = lvl.get(k, 0) | (1 if any(100000 <= v < 200000 for v in vs) else 0)
subs, unmatched = [], 0
for s in base['subs'] + v110['subs']:
    lon, lat = unproj(s[0], s[1])
    k = (s[0], s[1], s[2])
    if k not in lvl: unmatched += 1
    subs.append([round(lon, 3), round(lat, 3), int(s[2]), s[3], 1 if s[2] == 110 else lvl.get(k, 0)])
assert unmatched == 0, f'{unmatched} asemaa ei löytynyt raakadatasta {raw_f.name} — aja build_map.py ja tämä samasta aineistosta'

# ---- Viron salvestipargid (Salvestid-kerroksen pisteet) ----
parks = []
for L in data['layers']:
    for p in L.get('pins', []):
        if p.get('k') == 'point' and p.get('src') in S:
            parks.append({'c': p['c'], 'p': p['p'], 't': p['t'], 'src': srcref(p['src'])})

D = {'built': data.get('date'), 'osm': srcref('osm'), 'regions': regions, 'subs': subs, 'parks': parks}
blob = json.dumps(D, ensure_ascii=False, separators=(',', ':'))
tpl = (ROOT / 'scripts' / 'kaart' / 'paikka.tpl.js').read_text(encoding='utf-8')
out = tpl.replace('/*DATA*/null', blob)
(A / 'kartta-paikka.js').write_text(out, encoding='utf-8')
print(f'assets/kartta-paikka.js {len(out.encode())} tavua · alueita {len(regions)} · renkaita {sum(len(r["rings"]) for r in regions)} · asemia {len(subs)} (110 kV:n taso {sum(x[4] for x in subs)}) · puistoja {len(parks)}')
