#!/usr/bin/env python3
"""
SAMA kaart — verkko OpenInfraMapin vektoritiiliistä (OpenStreetMap-data, ODbL).

Varapolku fetch_osm.py:lle: kun Overpass-peilit eivät vastaa, sama OSM-data saadaan
OpenInfraMapin julkisista vektoritiiliistä (https://openinframap.org/tiles/{z}/{x}/{y}.pbf).
Tiilet ovat zoomitasolle 7 yleistettyjä (tarkkuus noin 100 m), mikä riittää kartan
mittakaavaan (Suomi + Viro yhdessä näkymässä, Viron lähinäkymä noin 0,5 km/pikseli).

Tulos samassa muodossa kuin fetch_osm.py:n Overpass-vastaus, joten build_map.py lukee sen sellaisenaan:
  docs/kaart/osm/lines-<päivä>.json        power_line (≥ 110 kV, myös HVDC) way-elementteinä
  docs/kaart/osm/substations-<päivä>.json  power_substation_point (≥ 110 kV) node-elementteinä
  docs/kaart/osm/plants-<päivä>.json       power_plant(+_point), source = wind | solar | battery

Raakatiilet: docs/kaart/oim/z<z>/<x>-<y>.pbf (ei julkaista, ei commitoida — .gitignore).

Ajo:
    pip install mapbox-vector-tile shapely
    python3 scripts/kaart/fetch_oim.py            # lataa puuttuvat tiilet ja muuntaa
    python3 scripts/kaart/fetch_oim.py --offline  # vain muunnos jo ladatuista tiilistä
"""
import argparse, datetime, json, math, pathlib, sys, time, urllib.request
from collections import defaultdict

import mapbox_vector_tile as mvt
from shapely.geometry import LineString, MultiLineString, box
from shapely.ops import linemerge, unary_union

ROOT = pathlib.Path(__file__).resolve().parents[2]
OSM = ROOT / 'docs' / 'kaart' / 'osm'
URL = 'https://openinframap.org/tiles/{z}/{x}/{y}.pbf'
Z = 7
# Suomi, Viro, merialueet ja rajavyöhyke: x 70–75 (17–34 °E), y 28–39 (70,4–56,9 °N) zoomilla 7
XS, YS = range(70, 76), range(28, 40)


def lonlat(z, tx, ty, gx, gy, ext):
    n = 2 ** z
    lon = (tx + gx / ext) / n * 360.0 - 180.0
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (ty + gy / ext) / n))))
    return lon, lat


def fetch(z, x, y, d):
    f = d / f'{x}-{y}.pbf'
    if f.exists() and f.stat().st_size > 0:
        return f
    req = urllib.request.Request(URL.format(z=z, x=x, y=y), headers={'User-Agent': 'SAMA-Energia-kartta/1.0 (samaenergia.fi)'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                f.write_bytes(r.read())
            time.sleep(0.4)
            return f
        except Exception as e:   # noqa: BLE001
            print(f'  {x}/{y}: {e}', file=sys.stderr)
            time.sleep(3 * (attempt + 1))
    return None


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--offline', action='store_true')
    a = ap.parse_args()
    tdir = ROOT / 'docs' / 'kaart' / 'oim' / f'z{Z}'
    tdir.mkdir(parents=True, exist_ok=True)
    OSM.mkdir(parents=True, exist_ok=True)

    segs = defaultdict(list)       # osm_id -> [LineString lon/lat]
    tags_of = {}
    subs, plants = {}, {}
    for x in XS:
        for y in YS:
            f = (tdir / f'{x}-{y}.pbf') if a.offline else fetch(Z, x, y, tdir)
            if not f or not f.exists():
                continue
            t = mvt.decode(f.read_bytes(), default_options={'y_coord_down': True})
            for lay, data in t.items():
                ext = data.get('extent', 4096)
                clip = box(0, 0, ext, ext)
                for feat in data['features']:
                    p = feat['properties']
                    g = feat['geometry']
                    if lay == 'power_line':
                        v = num(p.get('voltage'))
                        if v is None or v < 100 or p.get('line') in ('busbar', 'bay') or p.get('construction') or p.get('disused'):
                            continue
                        lines = [g['coordinates']] if g['type'] == 'LineString' else g['coordinates'] if g['type'] == 'MultiLineString' else []
                        for coords in lines:
                            if len(coords) < 2:
                                continue
                            ls = LineString(coords).intersection(clip)        # puskuri pois: tiilet kohtaavat reunalla
                            parts = [ls] if isinstance(ls, LineString) else list(getattr(ls, 'geoms', []))
                            for part in parts:
                                if part.is_empty or part.length == 0:
                                    continue
                                segs[p['osm_id']].append(LineString([lonlat(Z, x, y, cx, cy, ext) for cx, cy in part.coords]))
                        tags_of[p['osm_id']] = {
                            'power': p.get('type') or 'line', 'voltage': str(int(v * 1000)),
                            'frequency': p.get('frequency'), 'location': p.get('location') or None,
                            'name': p.get('name') or None, 'operator': p.get('operator') or None,
                        }
                    elif lay == 'power_substation_point':
                        vs = [num(p.get(k)) for k in ('voltage', 'voltage_2', 'voltage_3')]
                        vmax = max([v for v in vs if v] or [0])
                        if vmax < 100 or p.get('construction'):
                            continue
                        cx, cy = (g['coordinates'] if g['type'] == 'Point' else g['coordinates'][0])
                        if not (0 <= cx <= ext and 0 <= cy <= ext):
                            continue
                        lon, lat = lonlat(Z, x, y, cx, cy, ext)
                        subs[p['osm_id']] = {'type': 'node', 'id': p['osm_id'], 'lon': lon, 'lat': lat,
                                             'tags': {'power': 'substation', 'voltage': ';'.join(str(int(v * 1000)) for v in vs if v),
                                                      'name': p.get('name'), 'operator': p.get('operator'), 'substation': p.get('substation')}}
                    elif lay in ('power_plant_point', 'power_plant'):
                        src = p.get('source')
                        if src not in ('wind', 'solar', 'battery'):
                            continue
                        if g['type'] == 'Point':
                            cx, cy = g['coordinates']
                        else:
                            from shapely.geometry import shape
                            c = shape(g).representative_point(); cx, cy = c.x, c.y
                        if not (0 <= cx <= ext and 0 <= cy <= ext):
                            continue
                        lon, lat = lonlat(Z, x, y, cx, cy, ext)
                        out = num(p.get('output'))
                        prev = plants.get(p['osm_id'])
                        if prev and prev['tags'].get('plant:output:electricity'):
                            continue
                        plants[p['osm_id']] = {'type': 'node', 'id': p['osm_id'], 'lon': lon, 'lat': lat,
                                               'tags': {'power': 'plant', 'plant:source': src,
                                                        'plant:output:electricity': f'{out} MW' if out else None,
                                                        'name': p.get('name'), 'start_date': p.get('start_date'),
                                                        'construction': 'yes' if p.get('construction') else None}}
    ways = []
    for oid, ls in segs.items():
        u = unary_union(ls)
        merged = u if isinstance(u, LineString) else linemerge(u)
        parts = [merged] if isinstance(merged, LineString) else list(getattr(merged, 'geoms', []))
        for i, part in enumerate(parts):
            ways.append({'type': 'way', 'id': oid, 'part': i, 'tags': tags_of[oid],
                         'geometry': [{'lon': round(x, 5), 'lat': round(y, 5)} for x, y in part.coords]})
    today = datetime.date.today().isoformat()
    base = f'OpenInfraMap vector tiles z{Z} (OpenStreetMap data), read {today}'
    for kind, els in (('lines', ways), ('substations', list(subs.values())), ('plants', list(plants.values()))):
        (OSM / f'{kind}-{today}.json').write_text(json.dumps({'osm_base': base, 'elements': els}, ensure_ascii=False, separators=(',', ':')))
        print(f'{kind}: {len(els)}', file=sys.stderr)
    meta = {'license': 'OpenStreetMap contributors, ODbL 1.0; tiles OpenInfraMap', 'source': base,
            'tiles': f'z{Z} x{XS.start}-{XS.stop - 1} y{YS.start}-{YS.stop - 1}'}
    (OSM / 'meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
