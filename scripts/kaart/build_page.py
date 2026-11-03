#!/usr/bin/env python3
"""
SAMA kaart — kirjoittaa /verkko/- ja /vork/-sivun luvut tiedostosta assets/kartta-data.json
lähdetiedostoihin src/fi.html ja src/et.html (sivu id="p-verkko", merkkien kartta:alku … kartta:loppu väliin)
sekä etusivun Yhteinen verkko / Ühine võrk -osion (merkkien kartta-etusivu:alku … kartta-etusivu:loppu väliin;
kysymys kerrallaan painikkeilla, kartta näyttämössä tai osion sisällä — assets/kartta.js, data-mode="front").

Miksi: kartan luvut, johtopäätökset ja lähteet ovat yhdessä paikassa (kartta-data.json). Sivun teksti
(luvut tavallisella vierityksellä, teksti kartan ulkopuolella) ja kartta näyttävät aina samat luvut.

Ajo (aina kun kartta-data.json muuttuu):
    python3 scripts/kaart/build_page.py           # päivittää src/fi.html ja src/et.html
    python3 scripts/kaart/build_page.py --check   # vain tarkistus: virhe, jos lähteet eivät ole ajan tasalla
    node scripts/build-pages.mjs && node scripts/verify-pages.mjs
"""
import argparse, html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = ROOT / 'assets' / 'kartta-data.json'
BEGIN, END = '<!-- kartta:alku', '<!-- kartta:loppu -->'
FBEGIN, FEND = '<!-- kartta-etusivu:alku', '<!-- kartta-etusivu:loppu -->'

TXT = {
    'fi': {
        'home': 'FI', 'other': 'EE', 'slug': 'verkko',
        'title': 'Yhteinen verkko – kuusi kysymystä Suomen sähköjärjestelmästä — SAMA Energia',
        'desc': 'Missä kantaverkko kulkee, paljonko kulutus kasvaa, kuka jo varastoi ja kuka reserveistä maksaa? Fingridin luvut kartalla, jokainen lähteineen ja päiväyksineen.',
        'crumbs': '<a href="/">Etusivu</a><span>›</span><span>Yhteinen verkko</span>',
        'h1': 'Yhteinen verkko – kuusi kysymystä ja <em>teidän liittymänne.</em>',
        'lead': 'Kartta näyttää, mihin Suomen sähköjärjestelmä on menossa: missä verkko kulkee, kuinka paljon kulutus kasvaa, mistä tuuli- ja aurinkosähkö tulee, kuka jo varastoi ja kuka reserveistä maksaa. Jokaisella luvulla on lähde ja päiväys.',
        'how': 'Lukekaa luku kerrallaan: kartta vaihtaa kerrosta mukana. Viekää hiiri tai sormi kartan kohteen päälle, niin näette luvun lähteen. Vertaa Viroon -painike näyttää Viron samalla määritelmällä tai kertoo, missä määritelmä eroaa.',
        'other_sum': 'Viro samalla mittarilla', 'def': 'Vertailtavuus', 'pays': 'Kuka maksaa', 'sources': 'Lähteet', 'show': 'Näytä kartalla',
        'cta': ('Pyydä maksuton kartoitus', '/yhteystiedot/'),
        'final': 'Maksuton kirjallinen arvio näyttää, mitä teidän liittymänne voi tehdä: tehomaksu, pörssisähkö ja mallinnettu reservituotto tuotteittain.',
        'map': 'Kartta', 'bar': 'Kartan kerrokset', 'compare': 'Vertaa Viroon', 'legend': 'Selite',
        'leg': ['400 kV', '220 kV', '110 kV', 'Tasavirta'],
        'cap': 'Kartta latautuu, kun se tulee näkyviin. Kaikki luvut ovat myös tekstissä.',
        'attr': 'Pohja: Natural Earth · Verkko: © OpenStreetMap-tekijät (ODbL), OpenInfraMap · luettu 2.11.2026',
        'aria': 'Kartta Suomen ja Viron sähköverkosta: kantaverkko, rajayhteydet, tuuli- ja aurinkovoimalat, varastot, reservialueet ja tulevat hankkeet.',
        'after_h': 'Lähteet ja <em>päivitys.</em>',
        'f_h2': 'Yhteinen verkko – kuusi kysymystä ja <em>teidän liittymänne.</em>',
        'f_lead': 'Suomen sähköjärjestelmä kartalla, kysymys kerrallaan. Jokaisella luvulla on lähde ja päiväys.',
        'f_bar': 'Kysymykset', 'f_more': 'Koko kartta, faktat ja lähteet', 'f_cta': ('Pyydä maksuton kartoitus', '#kartoitus'), 'f_src': 'Lähde',
        'f_attr': 'Kartta: © OpenStreetMap-tekijät (ODbL) · Natural Earth',
        'after': 'Luvut tarkistettu 2.11.2026, seuraava tarkistus helmikuussa 2027. Kartan johdot, sähköasemat ja voimalat ovat OpenStreetMapista (luettu 2.11.2026), ja niitä on verrattu Fingridin kantaverkon kehittämissuunnitelman karttaan ja Eleringin verkkokarttaan. Tulevien hankkeiden reitit ovat kaavamaisia: ne yhdistävät hankkeen päätepisteet.',
    },
    'et': {
        'home': 'EE', 'other': 'FI', 'slug': 'vork',
        'title': 'Ühine võrk – kuus küsimust Eesti elektrisüsteemist — SAMA Energia',
        'desc': 'Kus põhivõrk on, kui palju tarbimine kasvab, kes juba salvestab ja kes reservide eest maksab? Eleringi arvud kaardil, igaüks allika ja kuupäevaga.',
        'crumbs': '<a href="/">Avaleht</a><span>›</span><span>Ühine võrk</span>',
        'h1': 'Ühine võrk – kuus küsimust ja <em>teie liitumine.</em>',
        'lead': 'Kaart näitab, kuhu Eesti elektrisüsteem liigub: kus võrk on, kui palju tarbimine kasvab, kust tuleb tuule- ja päikeseelekter, kes juba salvestab ja kes reservide eest maksab. Igal arvul on allikas ja kuupäev.',
        'how': 'Lugege peatükk korraga: kaart vahetab kihti kaasa. Viige hiir või sõrm kaardil objektile ja näete arvu allikat. Nupp „Võrdle Soomega“ näitab Soomet sama definitsiooniga või ütleb, kus definitsioon erineb.',
        'other_sum': 'Soome samal mõõdupuul', 'def': 'Võrreldavus', 'pays': 'Kes maksab', 'sources': 'Allikad', 'show': 'Näita kaardil',
        'cta': ('Küsi tasuta hindamist', '/kontakt/'),
        'final': 'Tasuta kirjalik hinnang näitab, mida teie liitumine suudab: võimsustasu, börsihind ja modelleeritud reservitulu toodete kaupa.',
        'map': 'Kaart', 'bar': 'Kaardi kihid', 'compare': 'Võrdle Soomega', 'legend': 'Legend',
        'leg': ['330–400 kV', '220 kV', '110 kV', 'Alalisvool'],
        'cap': 'Kaart laeb, kui see jõuab nähtavale. Kõik arvud on ka tekstis.',
        'attr': 'Alus: Natural Earth · Võrk: © OpenStreetMapi kaastöölised (ODbL), OpenInfraMap · loetud 2.11.2026',
        'aria': 'Kaart Eesti ja Soome elektrivõrgust: põhivõrk, välisühendused, tuule- ja päikeseelektrijaamad, salvestid, reservialad ja tulevased projektid.',
        'after_h': 'Allikad ja <em>uuendamine.</em>',
        'f_h2': 'Ühine võrk – kuus küsimust ja <em>teie liitumine.</em>',
        'f_lead': 'Eesti elektrisüsteem kaardil, küsimus korraga. Igal arvul on allikas ja kuupäev.',
        'f_bar': 'Küsimused', 'f_more': 'Kogu kaart, faktid ja allikad', 'f_cta': ('Küsi tasuta hindamist', '#hindamine'), 'f_src': 'Allikas',
        'f_attr': 'Kaart: © OpenStreetMapi kaastöölised (ODbL) · Natural Earth',
        'after': 'Arvud on kontrollitud 2.11.2026, järgmine kontroll veebruaris 2027. Kaardi liinid, alajaamad ja elektrijaamad on OpenStreetMapist (loetud 2.11.2026) ning neid on võrreldud Eleringi võrgukaardi ja Fingridi põhivõrgu arengukava kaardiga. Tulevaste projektide trassid on skemaatilised: need ühendavad projekti lõpp-punkte.',
    },
}
ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5"/></svg>'


def e(s):
    return html.escape(s, quote=True)


def t(o, lang):
    return o if isinstance(o, str) else o.get(lang, o.get('fi', ''))


def src_link(S, sid):
    s = S[sid]
    return f'<a href="{e(s["url"])}" target="_blank" rel="noopener">{e(s["pub"])}: {e(s["title"])}</a> · {e(s["date"])}'


def facts_html(facts, lang):
    return '<ul class="km-facts">' + ''.join(
        f'<li><b>{e(t(f["t"], lang))}:</b> {e(t(f["v"], lang))} <small>({e(f["s"])})</small></li>' for f in facts) + '</ul>'


def chapter(L, i, n, D, lang):
    X = TXT[lang]
    S, home, other = D['sources'], X['home'], X['other']
    big = L['big'][home]
    ids = []
    for sid in [f['src'] for f in L['facts'][home]] + big['src'] + ([L['pays'][home]['src']] if L.get('pays') else []):
        if sid not in ids:
            ids.append(sid)
    out = [f'<article class="km-ch{" km-final" if L["id"] == "site" else ""}" id="kerros-{i + 1}" data-layer="{i}" aria-labelledby="kerros-{i + 1}-h">',
           f'  <p class="km-n">{i + 1:02d} / {n:02d}</p>',
           f'  <h2 id="kerros-{i + 1}-h">{e(t(L["q"], lang))}</h2>',
           f'  <p class="km-concl">{e(L["concl"][lang])}</p>',
           f'  <p class="km-fig"><b>{e(big["v"])}</b><span>{e(t(big["l"], lang))}</span></p>',
           '  ' + facts_html(L['facts'][home], lang)]
    if L.get('pays'):
        out.append(f'  <p class="km-paysp"><b>{X["pays"]}:</b> {e(t(L["pays"][home], lang))}</p>')
    if L['id'] != 'site' and L['facts'].get(other):
        out.append(f'  <details class="km-other"><summary>{X["other_sum"]}</summary>'
                   f'<p class="km-def"><b>{X["def"]}:</b> {e(t(L["cmp"], lang))}</p>' + facts_html(L['facts'][other], lang) + '</details>')
    if L['id'] == 'site':
        out.append(f'  <p class="lead" style="margin-top:22px">{e(X["final"])}</p>')
    out.append(f'  <p class="src">{X["sources"]}: ' + '; '.join(src_link(S, sid) for sid in ids) + '</p>')
    out.append(f'  <button type="button" class="km-show" data-show-layer="{i}" hidden>{X["show"]}</button>')
    if L['id'] == 'site':
        out.append(f'  <p><a class="btn btn-primary" href="{X["cta"][1]}">{X["cta"][0]} {ARROW}</a></p>')
    out.append('</article>')
    return '\n'.join(out)


def page(D, lang):
    X = TXT[lang]
    n = len(D['layers'])
    used = []
    for L in D['layers']:
        for c in ('FI', 'EE'):
            for sid in [f['src'] for f in L['facts'].get(c, [])] + (L['big'][c]['src'] if c in L.get('big', {}) else []):
                if sid not in used:
                    used.append(sid)
        for p in L.get('pins', []) + L.get('fx', []):
            if p.get('src') and p['src'] not in used:
                used.append(p['src'])
        if L.get('pays'):
            for c in ('FI', 'EE'):
                if L['pays'][c]['src'] not in used:
                    used.append(L['pays'][c]['src'])
    used += [s for s in ('osm', 'ne') if s not in used]
    home_first = sorted(used, key=lambda s: (0 if (s.startswith('fg') == (X['home'] == 'FI')) and not s in ('osm', 'ne') else 1 if s not in ('osm', 'ne') else 2))
    S = D['sources']
    chs = '\n'.join(chapter(L, i, n, D, lang) for i, L in enumerate(D['layers']))
    leg = X['leg']
    return f'''{BEGIN} — GENEROITU: python3 scripts/kaart/build_page.py (lähde assets/kartta-data.json, {D["date"]}). Muokkaa dataa, älä tätä lohkoa. -->
<section class="subhero plain">
  <div class="wrap">
    <p class="crumbs">{X["crumbs"]}</p>
    <h1>{X["h1"]}</h1>
    <p class="lead">{e(X["lead"])}</p>
  </div>
</section>
<section class="km" data-kartta data-lang="{lang}" data-home="{X["home"]}" data-pohja="/assets/kartta-pohja.json" data-v110="/assets/kartta-110.json" data-src="/assets/kartta-data.json">
  <div class="km-grid">
    <div class="km-chs">
      <p class="km-intro lead">{e(X["how"])}</p>
{chs}
    </div>
    <aside class="km-map" aria-label="{X["map"]}">
      <div class="km-bar" role="toolbar" aria-label="{X["bar"]}"></div>
      <div class="km-stage" role="group" aria-label="{e(X["aria"])}"></div>
      <div class="km-inset" aria-live="polite"></div>
      <div class="km-foot">
        <button type="button" class="km-cmp" aria-pressed="false" hidden>{X["compare"]}</button>
        <button type="button" class="km-t110" aria-pressed="false" hidden>110 kV</button>
        <ul class="km-legend" aria-label="{X["legend"]}"><li><i></i>{leg[0]}</li><li><i class="l220"></i>{leg[1]}</li><li><i class="l110"></i>{leg[2]}</li><li><i class="hvdc"></i>{leg[3]}</li></ul>
        <p class="km-cap" aria-live="polite">{e(X["cap"])}</p>
        <p class="km-attr">{e(X["attr"])}</p>
      </div>
    </aside>
  </div>
</section>
<section class="section band-warm">
  <div class="wrap">
    <h2>{X["after_h"]}</h2>
    <p class="lead" style="margin-top:14px">{e(X["after"])}</p>
    <ul class="km-src-list">
{chr(10).join(f"      <li>{src_link(S, sid)}</li>" for sid in home_first)}
    </ul>
  </div>
</section>
<script src="/assets/kartta.js" defer></script>
{END}'''


def replace_page(src_text, lang, block):
    X = TXT[lang]
    m = re.search(r'<div class="page" id="p-verkko"[^>]*>', src_text)
    if not m:
        raise SystemExit(f'src/{lang}.html: id="p-verkko" puuttuu')
    tok = re.compile(r'<div\b|</div>')
    depth, end = 0, -1
    for tm in tok.finditer(src_text, m.start()):
        depth += -1 if tm.group(0) == '</div>' else 1
        if depth == 0:
            end = tm.start()
            break
    if end < 0:
        raise SystemExit(f'src/{lang}.html: p-verkko -div ei sulkeudu')
    for k in ('desc',):
        if not 120 <= len(X[k]) <= 175:
            raise SystemExit(f'{lang} {k}: {len(X[k])} merkkiä (120–175)')
    open_tag = (f'<div class="page" id="p-verkko" data-slug="{X["slug"]}" data-assets="kartta" '
                f'data-title="{e(X["title"])}" data-desc="{e(X["desc"])}">')
    return src_text[:m.start()] + open_tag + '\n' + block + '\n' + src_text[end:]


def front(D, lang):
    """Etusivun Yhteinen verkko / Ühine võrk -osio: seitsemän kysymystä painikkeina, yksi johtopäätös kerrallaan.
    Kartta piirtyy leveällä näytöllä oikean reunan näyttämöön (.lava-cv .km-slot), kapealla osion sisään (.km-inline)."""
    X = TXT[lang]
    S, home, n = D['sources'], X['home'], len(D['layers'])
    chips = ''.join(f'<button type="button" data-i="{i}" aria-pressed="{"true" if i == 0 else "false"}"><span>{i + 1}</span>{e(t(L["name"], lang))}</button>'
                    for i, L in enumerate(D['layers']))
    steps = []
    for i, L in enumerate(D['layers']):
        b = L['big'][home]
        links = '; '.join(f'<a href="{e(S[sid]["url"])}" target="_blank" rel="noopener">{e(S[sid]["pub"])}</a> · {e(S[sid]["date"])}' for sid in b['src'])
        cta = (f'<p><a class="btn btn-primary" href="{X["f_cta"][1]}">{X["f_cta"][0]} {ARROW}</a></p>' if L['id'] == 'site' else '')
        steps.append(f'        <li class="km-fs{" on" if i == 0 else ""}" data-layer="{i}"><p class="km-n">{i + 1:02d} / {n:02d}</p>'
                     f'<h3>{e(t(L["q"], lang))}</h3><p class="km-concl">{e(L["concl"][lang])}</p>'
                     f'<p class="km-fig"><b>{e(b["v"])}</b><span>{e(t(b["l"], lang))}</span></p>'
                     f'<p class="src">{X["f_src"]}: {links}</p>{cta}</li>')
    return f'''{FBEGIN} — GENEROITU: python3 scripts/kaart/build_page.py (lähde assets/kartta-data.json, {D["date"]}). Muokkaa dataa, älä tätä lohkoa. -->
      <div class="lv-h"><h2>{X["f_h2"]}</h2><p class="lead">{e(X["f_lead"])}</p></div>
      <div class="km-bar km-fbar" role="toolbar" aria-label="{X["f_bar"]}" hidden>{chips}</div>
      <div class="km-inline"></div>
      <ol class="km-fsteps">
{chr(10).join(steps)}
      </ol>
      <p class="km-fnav"><button type="button" class="km-cmp" aria-pressed="false" hidden>{X["compare"]}</button><a class="link-arrow" href="/{X["slug"]}/">{X["f_more"]} {ARROW}</a></p>
      <p class="km-attr">{e(X["f_attr"])}</p>
{FEND}'''


def replace_front(src_text, lang, block):
    a = src_text.find(FBEGIN)
    b = src_text.find(FEND)
    if a < 0 or b < a:
        raise SystemExit(f'src/{lang}.html: etusivun karttalohko (kartta-etusivu:alku … loppu) puuttuu')
    return src_text[:a] + block + src_text[b + len(FEND):]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    D = json.loads(DATA.read_text(encoding='utf-8'))
    bad = 0
    for lang in ('fi', 'et'):
        f = ROOT / 'src' / f'{lang}.html'
        old = f.read_text(encoding='utf-8')
        new = replace_front(replace_page(old, lang, page(D, lang)), lang, front(D, lang))
        if a.check:
            if new != old:
                print(f'{f.relative_to(ROOT)}: /verkko/-sivu ei vastaa kartta-data.json:ia — aja python3 scripts/kaart/build_page.py', file=sys.stderr)
                bad = 1
        elif new != old:
            f.write_text(new, encoding='utf-8')
            print(f'päivitetty {f.relative_to(ROOT)}', file=sys.stderr)
    sys.exit(bad)


if __name__ == '__main__':
    main()
