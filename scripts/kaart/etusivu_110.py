#!/usr/bin/env python3
"""Etusivun 3D-kartan lisäaineisto (04.11.2026): 110 kV -verkko ja rantaviivat.

Lukee /verkko/-sivun aineiston (scripts/kaart/build_map.py):
  assets/kartta-110.json   110 kV -johdot ja -kaapelit (FI, EE, myös saaret)
  assets/kartta-pohja.json  maiden rajaukset (Natural Earth 1:10m, myös saaret) ja projektio
muuntaa polut pituus-/leveysasteiksi (LCC, GRS80, käänteismuunnos Snyderin kaavoilla), yksinkertaistaa (Douglas-Peucker 400 m),
ketjuttaa toisiinsa liittyvät johtopalat ja kirjoittaa assets/kartta-etusivu.json:
  {"src": ..., "q": 1000, "ac": {"fi": [...], "ee": [...], "sea": [...]}, "cable": {...}, "land": {"fi": [...], "ee": [...]}}
Jokainen viiva tai rengas on litteä kokonaislukulista tuhannesosa-asteina: ensimmäinen piste [lon, lat], sitten erotukset.
Moottori (assets/scene.js, scene-et.js) lataa tiedoston, kun etusivun karttaosio lähestyy.

Ajo aina, kun kartta-110.json tai kartta-pohja.json päivittyy:  python3 scripts/kaart/etusivu_110.py
"""
import json, math, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'assets/kartta-110.json')
BASE = os.path.join(ROOT, 'assets/kartta-pohja.json')
OUT = os.path.join(ROOT, 'assets/kartta-etusivu.json')
TOL = 4.0        # Douglas-Peucker, projektion yksikköinä (100 m) -> 400 m
MIN_RING = 30.0  # pienempiä saaria (ympärysmitta < 3 km) ei piirretä


def lcc_inverse(params):
    p = dict(kv.split('=') for kv in params.replace('+', '').split() if '=' in kv)
    assert p.get('proj') == 'lcc' and p.get('ellps') == 'GRS80', params
    a, f = 6378137.0, 1 / 298.257222101
    e2 = f * (2 - f); e = math.sqrt(e2)
    r = math.radians
    p1, p2, p0, l0 = r(float(p['lat_1'])), r(float(p['lat_2'])), r(float(p['lat_0'])), r(float(p['lon_0']))
    m = lambda ph: math.cos(ph) / math.sqrt(1 - e2 * math.sin(ph) ** 2)
    t = lambda ph: math.tan(math.pi / 4 - ph / 2) / ((1 - e * math.sin(ph)) / (1 + e * math.sin(ph))) ** (e / 2)
    n = (math.log(m(p1)) - math.log(m(p2))) / (math.log(t(p1)) - math.log(t(p2)))
    F = m(p1) / (n * t(p1) ** n)
    rho0 = a * F * t(p0) ** n

    def inv(x, y):
        dy = rho0 - y
        rho = math.copysign(math.hypot(x, dy), n)
        th = math.atan2(x, dy) if n > 0 else math.atan2(-x, -dy)
        tt = (rho / (a * F)) ** (1 / n)
        ph = math.pi / 2 - 2 * math.atan(tt)
        for _ in range(8):
            es = e * math.sin(ph)
            ph = math.pi / 2 - 2 * math.atan(tt * ((1 - es) / (1 + es)) ** (e / 2))
        return math.degrees(th / n + l0), math.degrees(ph)
    return inv


def paths(d):
    """SVG-polku (M, l, L, z) -> lista viivoista projektion yksiköissä; z sulkee renkaan."""
    out, cur, cmd, nums = [], None, None, []
    for tok in re.findall(r'[MmLlZz]|-?\d+(?:\.\d+)?', d):
        if tok in 'Zz':
            if cur and cur[-1] != cur[0]:
                cur.append(cur[0])
            continue
        if tok in 'MmLl':
            cmd = tok; continue
        nums.append(float(tok))
        if len(nums) < 2:
            continue
        x, y = nums; nums = []
        if cmd == 'M':
            cur = [(x, y)]; out.append(cur); cmd = 'L'   # SVG: M:n jälkeiset lisäparit ovat absoluuttisia lineto-komentoja
        elif cmd == 'l':
            px, py = cur[-1]; cur.append((px + x, py + y))
        elif cmd == 'L':
            cur.append((x, y))
    return [p for p in out if len(p) > 1]


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy)
    i, dmax = 0, -1.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * (pts[k][0] - x1) - dx * (pts[k][1] - y1)) / L if L > 1e-9 else math.hypot(pts[k][0] - x1, pts[k][1] - y1)
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)


def chain(polys):
    """Yhdistää viivat, joiden päätepisteet osuvat samaan pisteeseen (OSM-palat), jotta tiedosto pysyy pienenä."""
    polys = [list(p) for p in polys]
    ends = {}
    for i, p in enumerate(polys):
        for k in (p[0], p[-1]):
            ends.setdefault(k, set()).add(i)
    alive = set(range(len(polys)))
    out = []
    for i in range(len(polys)):
        if i not in alive:
            continue
        alive.discard(i); cur = polys[i]
        for _ in (0, 1):
            while True:
                pt = cur[-1]
                j = next((j for j in ends.get(pt, ()) if j in alive), None)
                if j is None:
                    break
                alive.discard(j); q = polys[j]
                if q[0] != pt:
                    q = q[::-1]
                cur = cur + q[1:]
            cur = cur[::-1]
        out.append(cur)
    return out


def enc(p):
    a = [p[0][0], p[0][1]]
    for k in range(1, len(p)):
        a += [p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]]
    return a


def main():
    base = json.load(open(BASE, encoding='utf-8'))
    meta = base['meta']
    src = json.load(open(SRC, encoding='utf-8'))
    inv = lcc_inverse(meta['projection'])
    U, X0, Y1 = meta['unit_m'], meta['x0'], meta['y1']
    to_q = lambda pl: [(round(lon * 1000), round(lat * 1000)) for lon, lat in (inv(X0 + x * U, Y1 - y * U) for x, y in pl)]
    dedup = lambda pts: [pts[0]] + [q for k, q in enumerate(pts[1:], 1) if q != pts[k - 1]]
    out = {'src': 'OpenStreetMap contributors, ODbL 1.0 — 110 kV power lines and cables (FI, EE, islands), assets/kartta-110.json; '
                  'Natural Earth 1:10m (public domain) — coastlines, assets/kartta-pohja.json; built %s; Douglas-Peucker 400 m; '
                  'scripts/kaart/etusivu_110.py' % src['meta'].get('built', '?'), 'q': 1000}
    groups, nl, npts = {}, 0, 0
    for L in src['lines']:
        c = {'FI': 'fi', 'EE': 'ee'}.get(L['c'], 'sea')
        kind = 'cable' if L['t'] == 'cable' else 'ac'
        for pl in paths(L['d']):
            pts = dedup(to_q(dp(pl, TOL)))
            if len(pts) > 1:
                groups.setdefault(kind, {}).setdefault(c, []).append(pts)
    for kind, byc in groups.items():
        out[kind] = {c: [enc(p) for p in chain(polys)] for c, polys in byc.items()}
        for c in out[kind]:
            nl += len(out[kind][c]); npts += sum(len(a) // 2 for a in out[kind][c])
    out['land'] = {}
    nr = 0
    for cc, key in (('FI', 'fi'), ('EE', 'ee')):
        rings = []
        for ring in paths(base['land'][cc]):
            per = sum(math.hypot(ring[k][0] - ring[k - 1][0], ring[k][1] - ring[k - 1][1]) for k in range(1, len(ring)))
            if per < MIN_RING:
                continue
            pts = dedup(to_q(dp(ring, TOL)))
            if len(pts) > 3:
                rings.append(enc(pts)); npts += len(pts)
        out['land'][key] = rings; nr += len(rings)
    s = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    open(OUT, 'w', encoding='utf-8').write(s + '\n')
    print(OUT, nl, 'johtoa,', nr, 'rengasta,', npts, 'pistettä,', round(len(s) / 1024, 1), 'kt')


if __name__ == '__main__':
    main()
