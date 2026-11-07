#!/usr/bin/env python3
"""
SAMA kaart — kirjoittaa netlify/lib/kunnat.mjs: Suomen kuntien numerot ja nimet suomeksi ja ruotsiksi.

Miksi (v52, 7.11.2026): Suomen osoitehaku (netlify/lib/osoite.mjs, Sykeen Ryhti-osoitteet) rajaa haun kunnan mukaan.
Postitoimipaikka ei aina ole kunnan nimi (esim. Vihdin osoitteissa NUMMELA, OTALAMPI), joten "Katu 5, Vihti" etsii
sekä postitoimipaikan että kuntanumeron perusteella. Ryhti antaa kunnan vain numerona (municipality_number, '091').

Lähde: Tilastokeskus, luokitus "Kunnat 2026" (kunta_1_20260101), CC BY 4.0
  https://data.stat.fi/api/classifications/v2/classifications/kunta_1_20260101/classificationItems?content=data&meta=max&lang=fi
  (sama lang=sv ruotsinkielisille nimille).

Ajo (kun kuntaluokitus vaihtuu, eli vuoden alussa):
    python3 scripts/kaart/build_kunnat.py [kunnat-fi.json kunnat-sv.json]
Ilman argumentteja haetaan Tilastokeskuksen rajapinnasta. Tiedosto on generoitu — älä muokkaa kunnat.mjs:ää käsin.
"""
import json, pathlib, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
CLS = 'kunta_1_20260101'
URL = 'https://data.stat.fi/api/classifications/v2/classifications/' + CLS + '/classificationItems?content=data&meta=max&lang={}&format=json'


def load(lang, path=None):
    if path:
        return json.loads(pathlib.Path(path).read_text(encoding='utf-8'))
    with urllib.request.urlopen(URL.format(lang), timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))


def names(items):
    out = {}
    for it in items:
        n = [x['name'].strip() for x in it['classificationItemNames'] if x.get('name', '').strip()]
        out[it['code']] = n[0] if n else ''
    return out


args = sys.argv[1:]
fi = names(load('fi', args[0] if len(args) > 0 else None))
sv = names(load('sv', args[1] if len(args) > 1 else None))
assert len(fi) > 300 and set(fi) == set(sv), (len(fi), len(sv))
rows = []
for code in sorted(fi):
    r = [code, fi[code]]
    if sv[code] and sv[code] != fi[code]:
        r.append(sv[code])
    rows.append(r)
blob = json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
out = ('/* GENEROITU: python3 scripts/kaart/build_kunnat.py — Tilastokeskus, luokitus Kunnat 2026 (' + CLS + '), CC BY 4.0.\n'
       '   [kuntanumero, nimi suomeksi, nimi ruotsiksi jos eri]. Käyttö: netlify/lib/osoite.mjs (Suomen osoitehaun kuntarajaus). */\n'
       'export const KUNNAT = ' + blob + ';\n')
p = ROOT / 'netlify' / 'lib' / 'kunnat.mjs'
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(out, encoding='utf-8')
print(f'{p.relative_to(ROOT)} {len(out.encode())} tavua · kuntia {len(rows)} · ruotsinkielinen nimi {sum(len(r) == 3 for r in rows)}')
