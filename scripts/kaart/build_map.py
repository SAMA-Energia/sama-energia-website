#!/usr/bin/env python3
"""
SAMA kaart — tekee /verkko/- ja /vork/-sivun kartan pohjan ja verkon kahteen tiedostoon:
  assets/kartta-pohja.json  maat, järvet, maakunnat, ≥ 220 kV -johdot ja tasavirtayhteydet,
                            ≥ 220 kV -sähköasemat, tuuli- ja aurinkovoimalat (FI, EE)
  assets/kartta-110.json    110 kV -johdot ja -sähköasemat (FI, EE) — ladataan vasta, kun
                            lukija avaa 110 kV -kerroksen (pohjatiedosto pysyy alle 150 kt:n)
Etusivun 3D-näyttämön kartta (scene.js) käyttää omaa tiedostoaan assets/kartta-verkko.json — tämä
skripti ei muuta sitä.

Lähteet (ladataan erikseen, ks. docs/kaart/lugu.md, kohta Uuendamise kord):
  - Natural Earth 1:10m: valtiot (admin 0), järvet, maakunnat (admin 1) — public domain
    (https://github.com/nvkelso/natural-earth-vector, geojson-kansio)
  - OpenStreetMap: docs/kaart/osm/*.json (fetch_osm.py) — © OpenStreetMap contributors, ODbL 1.0

Tulos: kompakti JSON, jossa jokainen kerros on valmis SVG-polku (suhteelliset komennot,
kokonaisluvut 0,1 km:n yksikössä). Selain piirtää polut sellaisenaan — ei dekoodausta, ei
ulkoisia kirjastoja, ei verkkopyyntöjä muualle.

Projektio: Lambertin kartioprojektio (ETRS89/GRS80), lat_1=58.5, lat_2=67.5, lat_0=63, lon_0=25.5.
Sama projektio on kartta-data.json:n pisteillä (build_map.py projisoi ne samalla funktiolla).

Ajo:
    python3 scripts/kaart/build_map.py --ne <natural-earth-geojson-kansio> [--osm docs/kaart/osm]
"""
import argparse, json, math, pathlib, sys, datetime
from collections import defaultdict

from pyproj import Transformer
from shapely.geometry import shape, LineString, MultiLineString, Polygon, MultiPolygon, box, Point
from shapely.ops import transform, unary_union, linemerge

ROOT = pathlib.Path(__file__).resolve().parents[2]
PROJ = '+proj=lcc +lat_1=58.5 +lat_2=67.5 +lat_0=63 +lon_0=25.5 +ellps=GRS80 +units=m +no_defs'
TR = Transformer.from_crs('EPSG:4326', PROJ, always_xy=True)
UNIT = 100.0                      # 1 yksikkö = 100 m (0,1 km)
EXTENT = (11.5, 54.8, 38.5, 71.2)   # lon/lat-laatikko, josta kartta piirretään (naapurimaat ulottuvat näkymän reunojen yli)

# Kartan kehys projektiossa (metreinä) — lasketaan laatikon kulmista ja reunoilta
def _frame():
    xs, ys = [], []
    lo0, la0, lo1, la1 = EXTENT
    for i in range(41):
        for lon, lat in ((lo0 + (lo1 - lo0) * i / 40, la0), (lo0 + (lo1 - lo0) * i / 40, la1),
                         (lo0, la0 + (la1 - la0) * i / 40), (lo1, la0 + (la1 - la0) * i / 40)):
            x, y = TR.transform(lon, lat)
            xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)

X0, Y0, X1, Y1 = _frame()
W = math.ceil((X1 - X0) / UNIT)
H = math.ceil((Y1 - Y0) / UNIT)


def proj_xy(lon, lat):
    """lon/lat -> kartan yksiköt (x oikealle, y alas)."""
    x, y = TR.transform(lon, lat)
    return (x - X0) / UNIT, (Y1 - y) / UNIT


def proj_geom(g):
    import shapely
    return shapely.transform(g, lambda a: __import__('numpy').column_stack(_vec(a[:, 0], a[:, 1])))


def _vec(xs, ys):
    import numpy as np
    xs = np.asarray(xs); ys = np.asarray(ys)
    px, py = TR.transform(xs, ys)
    return (px - X0) / UNIT, (Y1 - py) / UNIT


FRAME = box(0, 0, W, H)


def path_of_rings(rings):
    """Lista pistelistoja -> suhteellinen SVG-polku kokonaisluvuin (suljetut renkaat)."""
    out = []
    for ring in rings:
        pts = [(int(round(x)), int(round(y))) for x, y in ring]
        ded = [pts[0]]
        for p in pts[1:]:
            if p != ded[-1]:
                ded.append(p)
        if len(ded) < 3:
            continue
        s = [f'M{ded[0][0]} {ded[0][1]}']
        px, py = ded[0]
        rel = []
        for x, y in ded[1:]:
            rel.append(f'{x - px} {y - py}'.replace(' -', '-'))
            px, py = x, y
        s.append('l' + ' '.join(rel).replace(' -', '-'))
        s.append('z')
        out.append(''.join(s))
    return ''.join(out)


def path_of_lines(lines):
    out = []
    for coords in lines:
        pts = [(int(round(x)), int(round(y))) for x, y in coords]
        ded = [pts[0]]
        for p in pts[1:]:
            if p != ded[-1]:
                ded.append(p)
        if len(ded) < 2:
            continue
        px, py = ded[0]
        rel = []
        for x, y in ded[1:]:
            rel.append(f'{x - px} {y - py}')
            px, py = x, y
        out.append(f'M{ded[0][0]} {ded[0][1]}l' + ' '.join(rel).replace(' -', '-'))
    return ''.join(out)


def polys(g):
    if g.is_empty:
        return []
    if isinstance(g, Polygon):
        return [g]
    if isinstance(g, MultiPolygon):
        return list(g.geoms)
    return [p for p in getattr(g, 'geoms', []) if isinstance(p, Polygon)]


def area_path(g, min_area, tol):
    rings = []
    for p in polys(g.intersection(FRAME)):
        if p.area < min_area:
            continue
        s = p.simplify(tol, preserve_topology=True)
        for pp in polys(s):
            rings.append(list(pp.exterior.coords))
            for hole in pp.interiors:
                h = Polygon(hole)
                if h.area >= min_area:
                    rings.append(list(hole.coords))
    return path_of_rings(rings)


# ---------------------------------------------------------------- Natural Earth
def load_ne(ne_dir):
    ne = pathlib.Path(ne_dir)
    countries = json.loads((ne / 'ne_10m_admin_0_countries.geojson').read_text())
    lakes = json.loads((ne / 'ne_10m_lakes.geojson').read_text())
    adm1 = json.loads((ne / 'ne_10m_admin_1_states_provinces.geojson').read_text())
    lo0, la0, lo1, la1 = EXTENT
    bb = box(lo0 - 7, la0 - 2, lo1 + 7, la1 + 1.5)   # reilusti yli, leikataan kehykseen vasta projektiossa
    geo = {}
    for f in countries['features']:
        a3 = f['properties'].get('ADM0_A3') or f['properties'].get('adm0_a3')
        key = {'FIN': 'FI', 'ALD': 'FI', 'EST': 'EE', 'SWE': 'SE', 'NOR': 'NO', 'RUS': 'RU', 'LVA': 'LV', 'LTU': 'LT', 'BLR': 'BY'}.get(a3)
        if not key:
            continue
        g = shape(f['geometry']).intersection(bb)
        if g.is_empty:
            continue
        geo[key] = unary_union([geo[key], g]) if key in geo else g
    lk = []
    near = box(19.0, 57.3, 31.8, 70.2)
    for f in lakes['features']:
        g = shape(f['geometry'])
        if g.intersects(near):
            lk.append(g.intersection(bb))
    regions = {}
    for f in adm1['features']:
        p = f['properties']
        if p.get('adm0_a3') in ('FIN', 'EST'):
            regions[p['iso_3166_2']] = shape(f['geometry'])
    return geo, unary_union(lk), regions


# ---------------------------------------------------------------- OSM
def parse_volts(v):
    out = []
    for part in str(v or '').replace(',', ';').split(';'):
        part = part.strip()
        try:
            out.append(int(float(part)))
        except ValueError:
            pass
    return out


VCLASS = [(380000, 400), (300000, 330), (200000, 220), (100000, 110)]


def vclass(volts):
    for lim, c in VCLASS:
        if any(v >= lim for v in volts):
            return c
    return None


def latest(osm_dir, kind):
    fs = sorted(pathlib.Path(osm_dir).glob(f'{kind}-*.json'))
    return fs[-1] if fs else None


def load_osm(osm_dir):
    res = {}
    for kind in ('lines', 'substations', 'plants'):
        f = latest(osm_dir, kind)
        res[kind] = json.loads(f.read_text()) if f else {'elements': []}
        res[kind]['_file'] = f.name if f else None
    return res


def country_of(pt_lonlat, geo_ll, near_deg=0.2):
    """Valtio, jonka maa-alueella piste on; rannikon ja saariston kohteet (NE:n 1:10m-rajan
    ulkopuolella) lähimmälle valtiolle noin 20 km:n säteellä; muuten SEA (merikaapelit)."""
    p = Point(pt_lonlat)
    for k in ('FI', 'EE', 'SE', 'NO', 'RU', 'LV'):
        g = geo_ll.get(k)
        if g is not None and g.contains(p):
            return k
    best, bd = 'SEA', near_deg
    for k in ('FI', 'EE', 'SE', 'NO', 'RU', 'LV'):
        g = geo_ll.get(k)
        if g is None:
            continue
        dist = g.distance(p)
        if dist < bd:
            best, bd = k, dist
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ne', required=True)
    ap.add_argument('--osm', default=str(ROOT / 'docs' / 'kaart' / 'osm'))
    ap.add_argument('--out', default=str(ROOT / 'assets' / 'kartta-pohja.json'))
    ap.add_argument('--out110', default=str(ROOT / 'assets' / 'kartta-110.json'))
    ap.add_argument('--report', default=str(ROOT / 'docs' / 'kaart' / 'osm-tilasto.json'))
    a = ap.parse_args()

    geo_ll, lakes_ll, regions_ll = load_ne(a.ne)
    geo = {k: proj_geom(g) for k, g in geo_ll.items()}
    lakes = proj_geom(lakes_ll)

    out = {
        'meta': {
            'built': datetime.date.today().isoformat(),
            'projection': PROJ, 'unit_m': UNIT, 'w': W, 'h': H, 'x0': round(X0, 3), 'y1': round(Y1, 3),
            'extent_lonlat': EXTENT,
            'sources': {
                'base': 'Natural Earth 1:10m (public domain)',
                'grid': 'OpenStreetMap contributors (ODbL 1.0)',
            },
        },
        'land': {}, 'lakes': '', 'regions': {}, 'lines': [], 'subs': [], 'plants': [],
    }
    out110 = {'meta': {'built': out['meta']['built'], 'note': '110 kV -johdot ja -sähköasemat (FI, EE), sama projektio kuin kartta-pohja.json'},
              'lines': [], 'subs': []}
    # maat: kotimaat tarkemmin, naapurit karkeammin
    for k, g in geo.items():
        detail = k in ('FI', 'EE')
        out['land'][k] = area_path(g, min_area=40 if detail else 1500, tol=2.5 if detail else 14)
    out['lakes'] = area_path(lakes, min_area=5000, tol=9)   # vain suuret järvet (> 50 km²)
    # maakunnat (liittymärajoitusten alueet) — vain ne, joihin kerrokset viittaavat
    for iso in ('FI-18', 'FI-19', 'FI-06', 'FI-16', 'FI-12', 'FI-03', 'FI-07', 'FI-14', 'FI-05', 'FI-10'):
        if iso in regions_ll:
            out['regions'][iso] = area_path(proj_geom(regions_ll[iso]), min_area=400, tol=8)

    # ---- OSM-verkko
    osm = load_osm(a.osm)
    out['meta']['osm'] = {k: {'file': v.get('_file'), 'osm_base': v.get('osm_base')} for k, v in osm.items()}
    groups = defaultdict(list)          # (maa, luokka, laji) -> [LineString]
    stats = defaultdict(float)          # (maa, luokka, laji) -> km
    hvdc_names = {}
    for e in osm['lines']['elements']:
        if e.get('type') != 'way' or 'geometry' not in e:
            continue
        t = e.get('tags', {})
        volts = parse_volts(t.get('voltage'))
        c = vclass(volts)
        if not c:
            continue
        dc = t.get('frequency') == '0' or 'dc' in (t.get('current', '') + t.get('circuits', '')).lower()
        kind = 'dc' if dc else ('cable' if t.get('power') == 'cable' else 'ac')
        coords = [(p['lon'], p['lat']) for p in e['geometry']]
        if len(coords) < 2:
            continue
        ll = LineString(coords)
        mid = ll.interpolate(0.5, normalized=True)
        cty = country_of((mid.x, mid.y), geo_ll)
        g = proj_geom(ll)
        km = g.length * UNIT / 1000.0
        # tilasto lasketaan ennen leikkausta, valtio puolivälin pisteestä
        stats[(cty, c, kind)] += km
        if cty == 'RU':
            continue          # Venäjän verkko ei kuulu kartan kysymyksiin (Viro irrotettiin siitä 9.2.2025)
        if cty not in ('FI', 'EE', 'SEA') and c < 220 and kind != 'dc':
            continue          # naapurimaista vain kantaverkon runko (≥ 220 kV) ja tasavirtayhteydet
        g = g.intersection(FRAME)
        if g.is_empty:
            continue
        groups[(cty, c, kind)].append(g)
        if dc and t.get('name'):
            hvdc_names[t['name']] = c
    for (cty, c, kind), gs in sorted(groups.items()):
        u = unary_union(gs)
        merged = u if isinstance(u, LineString) else linemerge(u)
        tol = 1.5 if c >= 220 else 4.0
        merged = merged.simplify(tol, preserve_topology=False)
        parts = list(merged.geoms) if hasattr(merged, 'geoms') else [merged]
        coords = [list(p.coords) for p in parts if p.length > 0.5]
        rec = {'c': cty, 'v': c, 't': kind, 'd': path_of_lines(coords)}
        (out110 if c == 110 and kind != 'dc' else out)['lines'].append(rec)

    for e in osm['substations']['elements']:
        t = e.get('tags', {})
        c = vclass(parse_volts(t.get('voltage')))
        if not c:
            continue
        lon = e.get('lon') or e.get('center', {}).get('lon')
        lat = e.get('lat') or e.get('center', {}).get('lat')
        if lon is None:
            continue
        x, y = proj_xy(lon, lat)
        if not (0 <= x <= W and 0 <= y <= H):
            continue
        cty = country_of((lon, lat), geo_ll)
        stats[(cty, 'subs', c)] += 1
        if cty not in ('FI', 'EE'):
            continue          # naapurimaiden sähköasemia ei piirretä
        (out110 if c == 110 else out)['subs'].append([int(round(x)), int(round(y)), c, cty])

    def mw(t):
        for k in ('plant:output:electricity', 'generator:output:electricity', 'plant:storage', 'capacity'):
            v = (t.get(k) or '').lower().replace(',', '.').strip()
            if not v:
                continue
            try:
                if v.endswith('gw'):
                    return float(v[:-2]) * 1000
                if v.endswith('mw'):
                    return float(v[:-2])
                if v.endswith('kw'):
                    return float(v[:-2]) / 1000
                if v.endswith('w'):
                    return float(v[:-1]) / 1e6
            except ValueError:
                continue
        return None

    for e in osm['plants']['elements']:
        t = e.get('tags', {})
        src = t.get('plant:source') or t.get('generator:source')
        if src not in ('wind', 'solar', 'battery'):
            continue
        if src == 'battery':
            continue          # OSM:n akkumerkinnät ovat hyvin vajaat (FI 5, EE 1 kohdetta 11/2026); varastot kerrotaan TSO:n luvuin
        lon = e.get('lon') or e.get('center', {}).get('lon')
        lat = e.get('lat') or e.get('center', {}).get('lat')
        if lon is None:
            continue
        m = mw(t)
        x, y = proj_xy(lon, lat)
        if not (0 <= x <= W and 0 <= y <= H):
            continue
        cty = country_of((lon, lat), geo_ll)
        if cty not in ('FI', 'EE'):
            continue
        if src == 'solar' and (m or 0) < 1.0:
            stats[(cty, 'plant-solar-small', 'n')] += 1
            continue          # kartalle vain ≥ 1 MW aurinkopuistot (pienet katot eivät erotu mittakaavassa)
        out['plants'].append([int(round(x)), int(round(y)), src[0], round(m, 1) if m else 0, cty])
        stats[(cty, 'plant-' + src, 'n')] += 1
        if m:
            stats[(cty, 'plant-' + src, 'mw')] += m

    pathlib.Path(a.out).write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    pathlib.Path(a.out110).write_text(json.dumps(out110, ensure_ascii=False, separators=(',', ':')))
    rep = defaultdict(dict)
    for (cty, c, kind), v in stats.items():
        rep[cty][f'{c}-{kind}'] = round(v, 1)
    rep['_meta'] = {'built': out['meta']['built'], 'osm': out['meta']['osm'], 'hvdc_names': hvdc_names, 'w': W, 'h': H}
    pathlib.Path(a.report).write_text(json.dumps(rep, ensure_ascii=False, indent=1, sort_keys=True))
    size = pathlib.Path(a.out).stat().st_size
    s110 = pathlib.Path(a.out110).stat().st_size
    print(f'OK {a.out} {size / 1024:.1f} kt + {a.out110} {s110 / 1024:.1f} kt, kehys {W}×{H} (0,1 km)', file=sys.stderr)
    if size > 150 * 1024:
        print('VIRHE: pohjatiedosto yli 150 kt (docs/brief/03-kaart.md)', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
