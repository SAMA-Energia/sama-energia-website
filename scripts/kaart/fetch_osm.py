#!/usr/bin/env python3
"""
SAMA kaart — OSM-i voimajohdot, sähköasemat ja voimalat Suomesta ja Virosta.

Hakee Overpass-rajapinnasta (OpenStreetMap, ODbL) kaiken, mitä kartan kerrokset tarvitsevat:
  - power=line / power=cable, jännite ≥ 110 kV (ilmajohdot, maa- ja merikaapelit, HVDC)
  - power=substation, jännite ≥ 110 kV (keskipisteinä)
  - power=plant, plant:source = wind | solar | battery, ja akku-generaattorit (keskipisteinä)

Haku tehdään ruuduittain (laatikko kerrallaan), koska valtioalueeseen rajattu yksi iso kysely
kaatuu peilipalvelimen 50 sekunnin aikarajaan. Rajaus valtioon tehdään vasta build_map.py:ssä
Natural Earthin rajoilla, joten rajan ylittävät ja merikaapelit tulevat mukaan.

Raakavastaukset: docs/kaart/osm/<laji>-<päivä>.json (eivät ole julkaistavia — docs/ on suojattu
_redirectsissä). build_map.py tekee niistä assets/kartta-pohja.json- ja assets/kartta-110.json-tiedostot.

Ajo (neljännesvuosittain, ks. docs/kaart/uuendamine.md):
    python3 scripts/kaart/fetch_osm.py
    OVERPASS_URL=https://maps.mail.ru/osm/tools/overpass/api/interpreter python3 scripts/kaart/fetch_osm.py
"""
import json, os, sys, time, datetime, pathlib, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs' / 'kaart' / 'osm'
MIRRORS = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
]
if os.environ.get('OVERPASS_URL'):          # aja vain annettu peili
    MIRRORS = [os.environ['OVERPASS_URL']]

# Jännitteet, jotka kartta näyttää. HVDC: EstLink 1 150 kV, EstLink 2 450 kV, Fenno-Skan 1 400 kV,
# Fenno-Skan 2 500 kV. Monipiiristen johtojen arvot (esim. "400000;110000") haetaan erikseen.
VOLTS = ['110000', '150000', '220000', '330000', '400000', '450000', '500000']

# Ruudut (etelä, länsi, pohjoinen, itä). Suomi + Viro + merialueet ja naapurien rajavyöhyke.
def tiles():
    out = []
    lat = 57.2
    while lat < 70.4:
        lon = 18.5
        while lon < 32.0:
            out.append((round(lat, 2), round(lon, 2), round(min(lat + 1.6, 70.4), 2), round(min(lon + 2.7, 32.0), 2)))
            lon += 2.7
        lat += 1.6
    return out


def q_lines(b):
    bb = ','.join(map(str, b))
    parts = ''.join(f'way["power"="{p}"]["voltage"="{v}"]({bb});' for p in ('line', 'cable') for v in VOLTS)
    parts += f'way["power"~"^(line|cable)$"]["voltage"~";"]({bb});'
    return f'[out:json][timeout:50];({parts});out tags geom;'


def q_subs(b):
    bb = ','.join(map(str, b))
    return f'[out:json][timeout:50];nwr["power"="substation"]["voltage"~"(^|;)(110000|220000|330000|400000)"]({bb});out tags center;'


def q_plants(b):
    bb = ','.join(map(str, b))
    return ('[out:json][timeout:50];('
            f'nwr["power"="plant"]["plant:source"~"^(wind|solar|battery)$"]({bb});'
            f'nwr["power"="generator"]["generator:source"="battery"]({bb});'
            ');out tags center;')


def post(q):
    last = None
    for url in MIRRORS:
        for attempt in range(5):
            try:
                req = urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(),
                                             headers={'User-Agent': 'SAMA-Energia-kartta/1.0 (samaenergia.fi)'})
                with urllib.request.urlopen(req, timeout=120) as r:
                    d = json.loads(r.read())
                if 'elements' not in d:
                    raise ValueError('no elements')
                if d.get('remark') and 'runtime error' in d['remark']:
                    raise ValueError(d['remark'][:120])
                return url, d
            except Exception as e:   # noqa: BLE001 — peilit vaihtelevat
                last = e
                time.sleep(8 * (attempt + 1))
    raise RuntimeError(f'kaikki peilit epäonnistuivat: {last}')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    want = set(sys.argv[1:]) or {'lines', 'substations', 'plants'}
    kinds = {'lines': q_lines, 'substations': q_subs, 'plants': q_plants}
    meta_f = OUT / 'meta.json'
    meta = json.loads(meta_f.read_text()) if meta_f.exists() else {'license': 'OpenStreetMap contributors, ODbL 1.0', 'files': {}}
    for kind in ('lines', 'substations', 'plants'):
        if kind not in want:
            continue
        seen, elems, stamp, mirror = set(), [], None, None
        ts = tiles()
        for i, b in enumerate(ts):
            mirror, d = post(kinds[kind](b))
            stamp = d.get('osm3s', {}).get('timestamp_osm_base', stamp)
            n = 0
            for e in d['elements']:
                k = (e['type'], e['id'])
                if k in seen:
                    continue
                seen.add(k); elems.append(e); n += 1
            print(f'{kind} ruutu {i + 1}/{len(ts)} {b}: +{n}', file=sys.stderr)
            time.sleep(1.5)
        f = OUT / f'{kind}-{today}.json'
        f.write_text(json.dumps({'osm_base': stamp, 'elements': elems}, ensure_ascii=False, separators=(',', ':')))
        meta['files'][kind] = {'file': f.name, 'fetched': today, 'mirror': mirror, 'osm_base': stamp, 'elements': len(elems)}
        meta_f.write_text(json.dumps(meta, ensure_ascii=False, indent=1))
        print(f'{kind}: {len(elems)} elementtiä, OSM-tila {stamp}', file=sys.stderr)


if __name__ == '__main__':
    main()
