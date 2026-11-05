#!/usr/bin/env python3
"""
SAMA etusivu — "Passiivinen liittymä on kuluerä" / "Passiivne liitumine on kuluartikkel" -osion
periaatteellinen vuorokausikaavio (inline SVG). Kirjoittaa kaavion src/fi.html- ja src/et.html-tiedostoon
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

def block(lang):
    return (f'{BEGIN} — GENEROITU: python3 scripts/paiva/build_paiva.py. Muokkaa skriptiä, älä tätä lohkoa. -->'
            + svg(lang) + END)

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
