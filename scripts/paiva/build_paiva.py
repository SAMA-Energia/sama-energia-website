#!/usr/bin/env python3
"""
SAMA etusivu — "Passiivinen liittymä on kuluerä" / "Passiivne liitumine on kuluartikkel" -osion
periaatteellinen vuorokausikaavio (inline SVG; v51-fix1 7.11.2026: selite ja vaihekuvateksti mukana). Kirjoittaa kaavion src/fi.html- ja src/et.html-tiedostoon
merkkien paiva:alku … paiva:loppu väliin.

Kaavio on periaatekuva, ei mittausdataa (kuvateksti sanoo sen). Neljä tilaa vastaavat osion neljää riviä:
  1 reservi (data-k="r"), 2 tehomaksut (f = uusi pääsulakeraja, p = huipun leikkaus),
  3 energia ja siirto (h = tuntihinta, c = lataus, d = purku), 4 kiinteistön arvo (kaikki + v = arvolaatikko).
assets/site.js (päiväkaavio) sytyttää elementit kohdistimen mukaan (data-h = tunti) ja pitää tilan,
kun hiiri on rivin päällä. Tekstien koko säätyy kontin leveyden mukaan (site.css, @container).

Ajo:
    python3 scripts/paiva/build_paiva.py           # päivittää src/fi.html ja src/et.html
    python3 scripts/paiva/build_paiva.py --check   # vain tarkistus
    node scripts/build-pages.mjs && node scripts/verify-pages.mjs
"""
import argparse, html, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
BEGIN, END = '<!-- paiva:alku', '<!-- paiva:loppu -->'

# ---- geometria (käyttäjäyksiköt) ----
W, H = 640, 366
X0, X1 = 12, 628
U = (X1 - X0) / 24
BASE, SC = 176, 124            # kulutuspaneeli: y = BASE - v*SC
F0, F1 = 1.0, 0.74             # pääsulake nyt / kulutuksen mukaan
PY0, PY1 = 204, 226            # tuntihintarivi
BT, BZ, BB = 256, 294, 332     # varastopaneeli: ylä, nolla, ala
BARH = 34
AXY = 358

# kulutus tunneittain 0..24 (24 = 0), teollinen profiili: aamun käynnistyshuippu
V = [.30, .29, .28, .28, .29, .33, .45, .74, .95, .72, .66, .64, .60, .62, .64, .62, .58, .55, .52, .48, .42, .37, .34, .32, .30]
# tuntihinta 0..23 (energia ja siirto, suhteellinen)
P = [.40, .32, .24, .20, .22, .30, .48, .78, .90, .72, .55, .44, .32, .26, .30, .42, .58, .84, 1.0, .92, .70, .56, .48, .44]
RES = [(0, 2), (5, 6.5), (9.5, 12), (15, 17), (20, 24)]   # reservi
CHG = [(2, 5), (12, 15)]                                   # lataus (halpa)
PEAK = (6.5, 9.5)                                          # huippu (purku aamulla)
DIS = (17, 20)                                             # purku (kallis)
NIGHT = [(0, 6), (22, 24)]

# kaavion tyylit (vain etusivulla, siksi SVG:n sisällä eikä site.css:ssä); @container = .k-dfig (site.css)
STYLE = '.kd{display:block;width:100%;height:auto}.kd text{font:500 12px var(--font-body);fill:#4A453C}.kd .kd-h{font-weight:600;fill:#12110F}.kd-ax text{fill:#6B655A}.kd .kd-nt{font-style:italic}.kd-night rect{fill:#EFEBE3}.kd-area{fill:#E7E1D6;opacity:.6}.kd-base,.kd-zero{stroke:#C9C1B1}.kd-line{fill:none;stroke:#12110F;stroke-width:2;stroke-linejoin:round}.kd-f0 line{stroke:#6B655A;stroke-width:1.2;stroke-dasharray:4 4}.kd-f1 line{stroke:#7A5E22;stroke-width:1.8;stroke-dasharray:7 4}.kd .kd-f1 text{fill:#7A5E22;font-weight:600}.kd-clip{fill:#B8913F;opacity:.7}.kd-pn rect{fill:#E7E1D6;opacity:.7}.kd-res{fill:url(#kd-hp);stroke:#97752F}.kd-up{fill:#97752F}.kd-dn{fill:#E9DFC6;stroke:#97752F}.kd .kd-in{fill:#F7F4EE;font-weight:600}.kd .kd-io{fill:#7A5E22;font-weight:600}.kd .kd-halo,.kd .kd-hl,.kd .kd-hd{paint-order:stroke;stroke:#EFE7D3;stroke-width:5px;stroke-linejoin:round}.kd .kd-hl{stroke:#E9E3D8;stroke-width:7px}.kd .kd-hd{stroke:#3A352D;stroke-width:7px}.kd-ibox{fill:#FBF9F4;stroke:#DED7C9}.kd-ib0{fill:#DED7C9}.kd-ib{fill:#97752F}.kd .kd-ia{fill:#7A5E22;font-weight:600}.kd [data-k]{opacity:0;transition:opacity .6s var(--ease)}.kd [data-k].lit{opacity:1}.kd-bar{transform-box:fill-box;transform:scaleY(0);transition:transform .8s var(--ease)}.kd-up{transform-origin:50% 100%}.kd-dn{transform-origin:50% 0}.kd .lit .kd-bar{transform:none}.kd-f1{transform:translateY(var(--dy));transition:transform 1s var(--ease),opacity .4s}.kd .kd-f1.lit{transform:none}.kd-ib{transform-box:fill-box;transform-origin:0 50%;transition:transform 1.2s var(--ease) .4s}.kd-ib2{transform:scaleX(.7)}.kd-inset.lit .kd-ib1{transform:scaleX(.62)}.kd-inset.lit .kd-ib2{transform:none}.kd-cur{opacity:0;pointer-events:none;transition:opacity .3s}.kd.run .kd-cur{opacity:1}.kd-cur line{stroke:#6B655A;stroke-dasharray:2 3}.kd-cur circle{fill:#7A5E22;stroke:#F7F4EE;stroke-width:2}@container (max-width:619px){.kd text{font-size:15px}}@container (max-width:439px){.kd text{font-size:19px}}'

TXT = {
    'et': dict(
        t_use='Tarbimine', t_price='Hind tunnis', t_bat='Salvesti',
        f0='peakaitse praegu', f1='tarbimise järgi',
        cheap='odav', dear='kallis', res='reserv', chg='sisse', peak='tipp', dis='välja',
        v1='Püsikulu', v2='Väärtus', night='öö',
        title='Põhimõtteline ööpäev: tarbimine, peakaitse, tunnihind ja salvesti töö',
        desc='Salvesti on reservis ka öösel. Hommikutipu katab salvesti ja peakaitse saab valida tarbimise järgi. '
             'Odaval tunnil laeb salvesti sisse, kallil annab välja. Kokku: väiksem püsikulu, kõrgem kinnistu hind.'),
    'fi': dict(
        t_use='Kulutus', t_price='Tuntihinta', t_bat='Energiavarasto',
        f0='pääsulake nyt', f1='kulutuksen mukaan',
        cheap='halpa', dear='kallis', res='reservi', chg='lataus', peak='huippu', dis='käyttö',
        v1='Kiinteä kulu', v2='Arvo', night='yö',
        title='Periaatteellinen vuorokausi: kulutus, pääsulake, tuntihinta ja energiavaraston työ',
        desc='Energiavarasto on reservissä myös öisin. Aamun huipun kattaa energiavarasto, joten pääsulakkeen voi valita kulutuksen mukaan. '
             'Halvoilla tunneilla varasto latautuu ja kalliilla sen energiaa käytetään. Yhteensä: pienempi kiinteä kulu, korkeampi kiinteistön hinta.'),
}

def f(x):
    s = ('%.1f' % x)
    return s[:-2] if s.endswith('.0') else s

def hx(h):
    return X0 + h * U

def vy(v):
    return BASE - v * SC

def cr(i):
    """Catmull–Rom (jaksollinen) segmentti i → i+1 Bézier-ohjauspisteinä (y-arvot)."""
    n = 24
    g = lambda j: V[j % n]
    p0, p1, p2, p3 = g(i - 1), g(i), g(i + 1), g(i + 2)
    return p1, p1 + (p2 - p0) / 6, p2 - (p3 - p1) / 6, p2

def v_at(h):
    i = min(int(h), 23); u = h - i
    a, b, c, e = cr(i)
    m = 1 - u
    return m * m * m * a + 3 * m * m * u * b + 3 * m * u * u * c + u * u * u * e

def curve_path():
    d = ['M%s %s' % (f(hx(0)), f(vy(V[0])))]
    for i in range(24):
        a, b, c, e = cr(i)
        d.append('C%s %s %s %s %s %s' % (f(hx(i + 1 / 3)), f(vy(b)), f(hx(i + 2 / 3)), f(vy(c)), f(hx(i + 1)), f(vy(e))))
    return ''.join(d)

def clip_path():
    hs = [PEAK[0] + k * 0.02 for k in range(int((PEAK[1] - PEAK[0]) / 0.02) + 1)]
    pts = [(h, v_at(h)) for h in hs if v_at(h) > F1]
    # tarkka leikkauskohta molemmista päistä
    def cross(a, b):
        for _ in range(40):
            m = (a + b) / 2
            if (v_at(a) - F1) * (v_at(m) - F1) <= 0: b = m
            else: a = m
        return (a + b) / 2
    h0 = cross(pts[0][0] - 0.02, pts[0][0]); h1 = cross(pts[-1][0], pts[-1][0] + 0.02)
    d = ['M%s %s' % (f(hx(h0)), f(vy(F1)))]
    d += ['L%s %s' % (f(hx(h)), f(vy(v))) for h, v in pts[::3] + [pts[-1]]]
    d.append('L%s %sZ' % (f(hx(h1)), f(vy(F1))))
    return ''.join(d), h0, h1

def heat(p):
    lo, hi = min(P), max(P)
    k = (p - lo) / (hi - lo)
    a, b = (0xE9, 0xE3, 0xD8), (0x3A, 0x35, 0x2D)
    return '#%02X%02X%02X' % tuple(round(a[j] + (b[j] - a[j]) * k) for j in range(3))

def svg(lang):
    T = TXT[lang]
    e = html.escape
    o = []
    o.append(f'<svg class="kd" viewBox="0 0 {W} {H}" role="img" aria-labelledby="kd-tt kd-dd" data-v="{",".join(f(x * 100) for x in V)}">')
    o.append(f'<title id="kd-tt">{e(T["title"])}</title><desc id="kd-dd">{e(T["desc"])}</desc>')
    o.append('<style>' + STYLE + '</style>')
    o.append('<defs><pattern id="kd-hp" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
             '<rect width="6" height="6" fill="#EFE7D3"/><path d="M0 0V6" stroke="#97752F" stroke-width="1.4"/></pattern></defs>')
    # yö
    o.append('<g class="kd-night">' + ''.join(
        f'<rect x="{f(hx(a))}" y="24" width="{f((b - a) * U)}" height="314"/>' for a, b in NIGHT) + '</g>')
    # kulutuspaneeli
    cp = curve_path()
    o.append(f'<text class="kd-h" x="{X0}" y="18">{e(T["t_use"])}</text>')
    o.append(f'<path class="kd-area" d="{cp}L{f(hx(24))} {BASE}L{f(hx(0))} {BASE}Z"/>')
    o.append(f'<line class="kd-base" x1="{X0}" x2="{X1}" y1="{BASE}" y2="{BASE}"/>')
    o.append(f'<g class="kd-f0"><line x1="{X0}" x2="{X1}" y1="{f(vy(F0))}" y2="{f(vy(F0))}"/>'
             f'<text x="{X0 + 4}" y="{f(vy(F0) - 7)}">{e(T["f0"])}</text></g>')
    clip, c0, c1 = clip_path()
    o.append(f'<g data-k="p" data-h="{f(c0)}"><path class="kd-clip" d="{clip}"/></g>')
    o.append(f'<path class="kd-line" d="{cp}"/>')
    dy = vy(F1) - vy(F0)
    o.append(f'<g class="kd-f1" data-k="f" data-h="0" style="--dy:{f(-dy)}px"><line x1="{X0}" x2="{X1}" y1="{f(vy(F1))}" y2="{f(vy(F1))}"/>'
             f'<text x="{X0 + 4}" y="{f(vy(F1) - 7)}">{e(T["f1"])}</text></g>')
    # arvolaatikko (tila 4); leveys mitoitettu suurimman (puhelin)fontin mukaan
    lw = max(len(T['v1']), len(T['v2'])) * 0.56 * 19
    bx = 12 + lw + 10
    iw = bx + 100 + 30
    ix = X1 - 2 - iw
    o.append(f'<g class="kd-inset" data-k="v" data-h="0"><rect class="kd-ibox" x="{f(ix)}" y="24" width="{f(iw)}" height="50" rx="4"/>'
             f'<text x="{f(ix + 12)}" y="38" dominant-baseline="central">{e(T["v1"])}</text>'
             f'<rect class="kd-ib0" x="{f(ix + bx)}" y="34" width="100" height="8" rx="1.5"/>'
             f'<rect class="kd-ib kd-ib1" x="{f(ix + bx)}" y="34" width="100" height="8" rx="1.5"/>'
             f'<text class="kd-ia" x="{f(ix + bx + 108)}" y="38" dominant-baseline="central">↓</text>'
             f'<text x="{f(ix + 12)}" y="60" dominant-baseline="central">{e(T["v2"])}</text>'
             f'<rect class="kd-ib0" x="{f(ix + bx)}" y="56" width="70" height="8" rx="1.5"/>'
             f'<rect class="kd-ib kd-ib2" x="{f(ix + bx)}" y="56" width="100" height="8" rx="1.5"/>'
             f'<text class="kd-ia" x="{f(ix + bx + 108)}" y="60" dominant-baseline="central">↑</text></g>')
    # tuntihinta
    o.append(f'<text class="kd-h" x="{X0}" y="198">{e(T["t_price"])}</text>')
    o.append('<g class="kd-pn">' + ''.join(
        f'<rect x="{f(hx(i) + 1)}" y="{PY0}" width="{f(U - 2)}" height="{PY1 - PY0}"/>' for i in range(24)) + '</g>')
    for i in range(24):
        o.append(f'<g data-k="h" data-h="{i}"><rect x="{f(hx(i) + 1)}" y="{PY0}" width="{f(U - 2)}" height="{PY1 - PY0}" fill="{heat(P[i])}"/></g>')
    ym = (PY0 + PY1) / 2
    o.append(f'<g data-k="h" data-h="2"><text class="kd-io kd-hl" x="{f(hx(3.5))}" y="{f(ym)}" text-anchor="middle" dominant-baseline="central">{e(T["cheap"])}</text></g>')
    o.append(f'<g data-k="h" data-h="17"><text class="kd-in kd-hd" x="{f(hx(18.5))}" y="{f(ym)}" text-anchor="middle" dominant-baseline="central">{e(T["dear"])}</text></g>')
    # varastopaneeli
    o.append(f'<text class="kd-h" x="{X0}" y="248">{e(T["t_bat"])}</text>')
    o.append(f'<line class="kd-zero" x1="{X0}" x2="{X1}" y1="{BZ}" y2="{BZ}"/>')
    for a, b in RES:
        lab = ''
        if b - a >= 4:
            lab = f'<text class="kd-io kd-halo" x="{f(hx((a + b) / 2))}" y="{BZ}" text-anchor="middle" dominant-baseline="central">{e(T["res"])}</text>'
        o.append(f'<g data-k="r" data-h="{f(a)}"><rect class="kd-res" x="{f(hx(a) + 1)}" y="{BT}" width="{f((b - a) * U - 2)}" height="{BB - BT}" rx="2"/>{lab}</g>')
    def bar(k, a, b, up, word, cls):
        x, w = hx(a) + 1, (b - a) * U - 2
        y = BZ - BARH if up else BZ
        ty = BZ - BARH / 2 if up else BZ + BARH / 2
        return (f'<g data-k="{k}" data-h="{f(a)}"><rect class="kd-bar {"kd-up" if up else "kd-dn"}" x="{f(x)}" y="{y}" width="{f(w)}" height="{BARH}" rx="2"/>'
                f'<text class="{cls}" x="{f(x + w / 2)}" y="{f(ty)}" text-anchor="middle" dominant-baseline="central">{e(word)}</text></g>')
    for a, b in CHG:
        o.append(bar('c', a, b, False, T['chg'], 'kd-io'))
    o.append(bar('p', PEAK[0], PEAK[1], True, T['peak'], 'kd-in'))
    o.append(bar('d', DIS[0], DIS[1], True, T['dis'], 'kd-in'))
    # tuntiakseli
    ax = [f'<text x="{X0}" y="{AXY}">00</text>'] + [f'<text x="{f(hx(h))}" y="{AXY}" text-anchor="middle">{h:02d}</text>' for h in (6, 12, 18)]
    ax.append(f'<text x="{X1}" y="{AXY}" text-anchor="end">24</text>')
    ax.append(f'<text class="kd-nt" x="{f(hx(3))}" y="{AXY}" text-anchor="middle">{e(T["night"])}</text>')
    o.append('<g class="kd-ax">' + ''.join(ax) + '</g>')
    # kohdistin
    o.append(f'<g class="kd-cur"><line x1="0" x2="0" y1="24" y2="{BB + 4}"/><circle cx="0" cy="{f(vy(V[0]))}" r="4"/></g>')
    o.append('</svg>')
    return ''.join(o)

# ---- v51-fix1 (Martin 7.11.2026, päätös D5): reservivaihe itsestään selväksi ja yhteenvetovaihe kevyemmäksi ----
# Martinin patch_v51_fix1.py:n SVG-muutokset sellaisinaan generaattorin tulosteeseen (jokainen korvaus tarkistaa
# osumamääränsä). 9.11.2026 Madis: fix2:n tumma canvas-paneeli pois → tämä vaalea SVG-versio fix1:n selkeytyksineen.
def fix1(svg, lang):
    L = {
        'fi': dict(kul='Kulutus', hinta='Tuntihinta', res='reservi', korv='Korvaus valmiudesta',
                   cost='Kiinteä kulu', val='Kiinteistön arvo', val_old='Arvo',
                   leg=['reservi: valmiudessa verkolle ↑↓', 'korvaus valmiudesta, tunneittain', 'lataus ↓', 'huippu, käyttö ↑'],
                   desc_old='Energiavarasto on reservissä myös öisin.',
                   desc_new='Energiavarasto on reservissä myös öisin, ja valmiudesta maksetaan korvaus tunneittain.',
                   leg_label='Kaavion selite', key='Raidalliset jaksot: varasto on valmiudessa verkolle.', bat='Energiavarasto'),
        'et': dict(kul='Tarbimine', hinta='Hind tunnis', res='reserv', korv='Tasu valmisoleku eest',
                   cost='Püsikulu', val='Kinnistu väärtus', val_old='Väärtus',
                   leg=['reserv: valmis võrgu jaoks ↑↓', 'tasu valmisoleku eest, tunni kaupa', 'sisse ↓', 'tipp, välja ↑'],
                   desc_old='Salvesti on reservis ka öösel.',
                   desc_new='Salvesti on reservis ka öösel ja valmisoleku eest makstakse tasu tunni kaupa.',
                   leg_label='Joonise legend', key='Triibulised lõigud: salvesti on valmis võrgu jaoks.', bat='Salvesti'),
    }[lang]

    def srep(old, new, count=1):
        nonlocal svg
        n = svg.count(old)
        assert n == count, f'svg: expected {count}x {old[:70]!r}, found {n}'
        svg = svg.replace(old, new)

    U = 616 / 24
    X = lambda h: 12 + h * U

    # taller canvas: one new row ("korvaus") under the battery row
    srep('viewBox="0 0 640 366"', 'viewBox="0 0 640 402"')
    srep('<rect x="12" y="24" width="154" height="314"/><rect x="576.7" y="24" width="51.3" height="314"/>',
         '<rect x="12" y="24" width="154" height="350"/><rect x="576.7" y="24" width="51.3" height="350"/>')
    ax0 = svg.index('<g class="kd-ax">'); ax1 = svg.index('</g>', ax0)
    svg = svg[:ax0] + svg[ax0:ax1].replace('y="358"', 'y="394"') + svg[ax1:]
    srep('<line x1="0" x2="0" y1="24" y2="336"/>', '<line x1="0" x2="0" y1="24" y2="372"/>')
    srep(L['desc_old'], L['desc_new'])

    # context layers that fade back in the summary step
    srep(f'<text class="kd-h" x="12" y="18">{L["kul"]}</text>', f'<text class="kd-h kd-dim" x="12" y="18">{L["kul"]}</text>')
    srep('<path class="kd-area" ', '<path class="kd-area kd-dim" ')
    srep('<path class="kd-line" ', '<path class="kd-line kd-dim" ')
    srep('<line class="kd-base" ', '<line class="kd-base kd-dim" ')
    srep('<g class="kd-f0">', '<g class="kd-f0 kd-dim">')
    srep('<g class="kd-f1" data-k="f"', '<g class="kd-f1 kd-dim" data-k="f"')
    srep('<g data-k="p" data-h="7"><path class="kd-clip"', '<g class="kd-dim" data-k="p" data-h="7"><path class="kd-clip"')

    # price row: hidden until its own step (no more 24 empty cells during the reserve step)
    srep(f'<text class="kd-h" x="12" y="198">{L["hinta"]}</text>',
         f'<g class="kd-dim" data-k="h" data-h="0"><text class="kd-h" x="12" y="198">{L["hinta"]}</text></g>')
    srep('<g class="kd-pn">', '<g class="kd-pn kd-dim" data-k="h" data-h="0">')
    n_h = svg.count('<g data-k="h" data-h="')
    svg = svg.replace('<g data-k="h" data-h="', '<g class="kd-dim" data-k="h" data-h="')
    assert n_h == 26, n_h

    # reserve blocks: label every block wide enough to hold it, from the moment it appears
    for (x, w, h, cls) in [('13', 49.3, '0', 'kd-sm'), ('256.8', 62.2, '9.5', 'kd-md'), ('398', 49.3, '15', 'kd-sm')]:
        old = f'<g data-k="r" data-h="{h}"><rect class="kd-res" x="{x}" y="256" width="{w:g}" height="76" rx="2"/></g>'
        new = (f'<g data-k="r" data-h="{h}"><rect class="kd-res" x="{x}" y="256" width="{w:g}" height="76" rx="2"/>'
               f'<text class="kd-io kd-halo {cls}" x="{float(x) + w / 2:.1f}" y="294" text-anchor="middle" dominant-baseline="central">{L["res"]}</text></g>')
        srep(old, new)

    # step-0-only key in the (then empty) price band: says what the striped blocks are while they draw in
    srep(f'<text class="kd-h" x="12" y="248">{L["bat"]}</text>',
         f'<g data-k="q" data-h="0"><rect class="kd-res" x="12" y="203" width="22" height="14" rx="2"/>'
         f'<text class="kd-io" x="42" y="210" dominant-baseline="central">{L["key"]}</text></g>'
         f'<text class="kd-h" x="12" y="248">{L["bat"]}</text>')

    # new row: the payment for being available, one mark per reserve hour
    blocks = [(0.0, 1.92), (5.0, 6.42), (9.54, 11.96), (15.04, 16.96), (20.04, 23.96)]
    row = [f'<g class="kd-dim" data-k="r" data-h="0"><text class="kd-h" x="12" y="354">{L["korv"]}</text></g>']
    for a0, a1 in blocks:
        h = int(a0)
        while h < a1:
            x0, x1 = max(a0, h), min(a1, h + 1)
            if x1 - x0 > 0.35:
                row.append(f'<g class="kd-dim" data-k="r" data-h="{x0:.2f}"><rect class="kd-tk" x="{X(x0) + 2:.1f}" y="362" width="{(x1 - x0) * U - 4:.1f}" height="8" rx="1.5"/></g>')
            h += 1
    srep('<g class="kd-ax">', ''.join(row) + '<g class="kd-ax">')

    # summary step: the result moves into a larger panel over the faded consumption curve
    i0 = svg.index('<g class="kd-inset" data-k="v" data-h="0">'); i1 = svg.index('</g>', i0) + 4
    inset = (f'<g class="kd-inset" data-k="v" data-h="0">'
             f'<rect class="kd-ibox" x="110" y="40" width="420" height="104" rx="6"/>'
             f'<text class="kd-ix" x="134" y="76" dominant-baseline="central">{L["cost"]}</text>'
             f'<rect class="kd-ib0" x="330" y="70" width="170" height="12" rx="2"/><rect class="kd-ib kd-ib1" x="330" y="70" width="170" height="12" rx="2"/>'
             f'<text class="kd-ia kd-ix" x="512" y="76" dominant-baseline="central">↓</text>'
             f'<text class="kd-ix" x="134" y="112" dominant-baseline="central">{L["val"]}</text>'
             f'<rect class="kd-ib0" x="330" y="106" width="119" height="12" rx="2"/><rect class="kd-ib kd-ib2" x="330" y="106" width="170" height="12" rx="2"/>'
             f'<text class="kd-ia kd-ix" x="512" y="112" dominant-baseline="central">↑</text></g>')
    assert L['val_old'] in svg[i0:i1]
    svg = svg[:i0] + inset + svg[i1:]

    css_add = ('.kd .kd-tk{fill:#97752F}'
               '.kd .kd-dim{transition:opacity .6s var(--ease)}'
               '.kd.sum .kd-dim,.kd.sum [data-k].kd-dim.lit{opacity:.18}'
               '.kd .kd-ix{font-size:15px}'
               '@container (max-width:619px){.kd .kd-sm{display:none}.kd .kd-ix{font-size:17px}}'
               '@container (max-width:439px){.kd .kd-md{display:none}.kd .kd-ix{font-size:20px}}'
               '.kd-leg{display:flex;flex-wrap:wrap;gap:6px 18px;margin:12px 52px 0 0;padding:0;list-style:none;font-size:13.5px;line-height:1.4;color:var(--ink-2)}'
               '.kd-leg li{display:inline-flex;align-items:center;gap:7px}'
               '.kd-sw{flex:none;width:18px;height:12px;border-radius:2px;border:1px solid #97752F}'
               '.kd-sw.r{background:repeating-linear-gradient(45deg,#EFE7D3 0 3px,#97752F 3px 4.4px)}'
               '.kd-sw.t{height:8px;background:#97752F;border:0}.kd-sw.c{background:#E9DFC6}.kd-sw.u{background:#97752F}'
               '.kd-step{display:none;margin:0 0 10px;font-size:15px;line-height:1.45;color:var(--ink-2)}'
               '.kd-step b{font-weight:600;color:var(--gold-deep)}'
               '@media (max-width:1023px){.kd-step:not([hidden]){display:block}}')
    srep('</style><defs><pattern id="kd-hp"', css_add + '</style><defs><pattern id="kd-hp"')

    return svg


def legend(lang):
    L = {'fi': dict(leg_label='Kaavion selite', leg=['reservi: valmiudessa verkolle ↑↓', 'korvaus valmiudesta, tunneittain', 'lataus ↓', 'huippu, käyttö ↑']),
          'et': dict(leg_label='Joonise legend', leg=['reserv: valmis võrgu jaoks ↑↓', 'tasu valmisoleku eest, tunni kaupa', 'sisse ↓', 'tipp, välja ↑'])}[lang]
    leg = (f'<ul class="kd-leg" aria-label="{L["leg_label"]}">'
           f'<li><i class="kd-sw r"></i>{L["leg"][0]}</li><li><i class="kd-sw t"></i>{L["leg"][1]}</li>'
           f'<li><i class="kd-sw c"></i>{L["leg"][2]}</li><li><i class="kd-sw u"></i>{L["leg"][3]}</li></ul>')
    return leg

def block(lang):
    return (f'{BEGIN} — GENEROITU: python3 scripts/paiva/build_paiva.py. Muokkaa skriptiä, älä tätä lohkoa. -->'
            + '<p class="kd-step" aria-hidden="true" hidden></p>' + fix1(svg(lang), lang) + legend(lang) + END)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); a = ap.parse_args()
    bad = False
    for lang in ('fi', 'et'):
        p = ROOT / 'src' / f'{lang}.html'
        s = p.read_text(encoding='utf-8')
        i = s.find(BEGIN); j = s.find(END)
        if i < 0 or j < 0:
            print(f'{p.name}: merkit puuttuvat'); bad = True; continue
        new = s[:i] + block(lang) + s[j + len(END):]
        if new != s:
            if a.check: print(f'{p.name}: kaavio ei ajan tasalla'); bad = True
            else: p.write_text(new, encoding='utf-8'); print(f'{p.name}: päivitetty')
        else:
            print(f'{p.name}: ajan tasalla')
    _, c0, c1 = clip_path()
    print('huippu leikataan klo %.2f–%.2f' % (c0, c1))
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
