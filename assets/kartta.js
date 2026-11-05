/* SAMA Energia — Yhteinen verkko / Ühine võrk -kartta (v35, 3.11.2026).
   Kaksi käyttöpaikkaa samalla moottorilla ja samalla datalla:
     - sivu /verkko/ ja /vork/ (data-kartta): seitsemän lukua, kartta tekstin vieressä (.km-stage)
     - etusivun osio (data-kartta data-mode="front"): kysymys kerrallaan painikkeilla; kartta piirtyy leveällä
       näytöllä oikean reunan 3D-näyttämöön (.lava-cv .km-slot), kapealla osion sisään (.km-inline)
   Ilme: maa kultaisina pisteinä, johdoissa hehku, verkko liikkuu hiiren mukana maata enemmän (syvyys) — kuten v38–v39:n
   näyttämökartta, mutta oikealla projektiolla ja kaikilla ≥ 220 kV -johdoilla.
   SVG, ei ulkoisia kirjastoja eikä reaaliaikaisia hakuja: lukee vain oman palvelimen tiedostot
     data-pohja  /assets/kartta-pohja.json  maat, järvet, ≥ 220 kV -verkko, voimalat (scripts/kaart/build_map.py)
     data-v110   /assets/kartta-110.json    110 kV -verkko, ladataan vasta kun lukija avaa sen
     data-src    /assets/kartta-data.json   kerrokset, luvut, lähteet (scripts/kaart/build_page.py kirjoittaa samasta datasta sivun tekstin)
   Esikatselutiedostossa sama data tulee sivun sisältä: <script type="application/json" id="kartta-…-json">.
   Kun mikään ei liiku, selain ei piirrä mitään (ei animaatiosilmukkaa); näkymän vaihto ≤ 380 ms; reduced-motion: ei liikettä.
   Rajapinta: window.SAMA_VERKKO = { setLayer(i), setCompare(bool) } (sivun kartta; kaikki lohkot: window.SAMA_VERKOT). */
(function () {
  'use strict';
  /* Jokainen [data-kartta]-lohko saa oman moottorinsa ja omat SVG-tunnisteensa (km0-…, km1-…). Kahdesti ladattu skripti
     ei alusta samaa lohkoa uudelleen: esikatselutiedostossa etusivu ja /verkko/ ovat samassa dokumentissa. */
  var roots = [].slice.call(document.querySelectorAll('[data-kartta]:not([data-km])'));
  if (!roots.length) return;
  var n0 = document.querySelectorAll('[data-km]').length, apis = window.SAMA_VERKOT = window.SAMA_VERKOT || [];
  roots.forEach(function (r, i) {
    r.setAttribute('data-km', String(n0 + i));
    var api = init(r, n0 + i);
    if (api) { apis.push(api); if (!window.SAMA_VERKKO || r.getAttribute('data-mode') !== 'front') window.SAMA_VERKKO = api; }
  });

  function init(root, n) {
  var X = 'km' + n + '-';   // SVG-tunnisteiden etuliite tälle lohkolle

  var FRONT = root.getAttribute('data-mode') === 'front';
  var LANG = root.getAttribute('data-lang') === 'et' ? 'et' : 'fi';
  var HOME = root.getAttribute('data-home') === 'EE' ? 'EE' : 'FI';
  var OTHER = HOME === 'FI' ? 'EE' : 'FI';
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';

  var UI = {
    fi: { compare: 'Vertaa Viroon', compareOff: 'Vain Suomi', layer: 'Kerros', src: 'Lähde', sources: 'Lähteet', def: 'Vertailtavuus',
      pays: 'Kuka maksaa', fail: 'Karttaa ei voitu ladata. Kaikki luvut ovat tekstissä.', home: 'Suomi', other: 'Viro', map: 'Kartta',
      me: 'Kohteenne', v110: '110 kV', loading: 'ladataan…', note110: '110 kV: kaikki OpenStreetMapiin merkityt 110 kV:n johdot, myös jakeluverkkoyhtiöiden.' },
    et: { compare: 'Võrdle Soomega', compareOff: 'Ainult Eesti', layer: 'Kiht', src: 'Allikas', sources: 'Allikad', def: 'Võrreldavus',
      pays: 'Kes maksab', fail: 'Kaarti ei õnnestunud laadida. Kõik arvud on tekstis.', home: 'Eesti', other: 'Soome', map: 'Kaart',
      me: 'Teie objekt', v110: '110 kV', loading: 'laeb…', note110: '110 kV: kõik OpenStreetMapi märgitud 110 kV liinid, sh jaotusvõrguettevõtjate omad.' }
  }[LANG];

  var state = { layer: 0, compare: false, data: null, net: null, view: null, anim: 0, tipFor: null, feats: [], v110: 0, ready: false, zt: 0 };
  var el = {
    stage: null, bar: root.querySelector('.km-bar'), inset: root.querySelector('.km-inset'),
    caption: root.querySelector('.km-cap'), cmp: root.querySelector('.km-cmp'), t110: root.querySelector('.km-t110'), tip: null, svg: null, base: null
  };

  /* kartan paikka: etusivulla leveällä näytöllä näyttämö, muuten osion oma laatikko */
  function pickStage() {
    if (!FRONT) return root.querySelector('.km-stage');
    var slot = document.querySelector('.lava-cv .km-slot'), inl = root.querySelector('.km-inline');
    var wide = window.innerWidth > 1000 && !document.querySelector('.lava-stage[data-still]');
    return (wide && slot) ? slot : (inl || slot);
  }
  el.stage = pickStage();
  if (!el.stage) return;
  if (FRONT) root.classList.toggle('km-inl', el.stage.classList.contains('km-inline'));

  /* ---------- projektio: Lambertin kartioprojektio GRS80, sama kuin scripts/kaart/build_map.py ---------- */
  var P = (function () {
    var a = 6378137, f = 1 / 298.257222101, e = Math.sqrt(2 * f - f * f), d = Math.PI / 180;
    function m(p) { var s = Math.sin(p); return Math.cos(p) / Math.sqrt(1 - e * e * s * s); }
    function tt(p) { var s = Math.sin(p); return Math.tan(Math.PI / 4 - p / 2) / Math.pow((1 - e * s) / (1 + e * s), e / 2); }
    var p1 = 58.5 * d, p2 = 67.5 * d, p0 = 63 * d, l0 = 25.5 * d;
    var n = (Math.log(m(p1)) - Math.log(m(p2))) / (Math.log(tt(p1)) - Math.log(tt(p2)));
    var F = m(p1) / (n * Math.pow(tt(p1), n)), r0 = a * F * Math.pow(tt(p0), n);
    var fw = function (lon, lat) {
      var r = a * F * Math.pow(tt(lat * d), n), th = n * (lon * d - l0);
      return [r * Math.sin(th), r0 - r * Math.cos(th)];
    };
    /* käänteinen: kartan napautus → lon/lat (liittymän paikka) */
    fw.inv = function (X, Y) {
      var dy = r0 - Y, r = (n < 0 ? -1 : 1) * Math.sqrt(X * X + dy * dy), th = Math.atan2(X, dy), t0 = Math.pow(r / (a * F), 1 / n);
      var phi = Math.PI / 2 - 2 * Math.atan(t0);
      for (var i = 0; i < 10; i++) { var s = Math.sin(phi); phi = Math.PI / 2 - 2 * Math.atan(t0 * Math.pow((1 - e * s) / (1 + e * s), e / 2)); }
      return [(th / n + l0) / d, phi / d];
    };
    return fw;
  })();
  function xy(ll) { var mt = state.net.meta, p = P(ll[0], ll[1]); return [(p[0] - mt.x0) / mt.unit_m, (mt.y1 - p[1]) / mt.unit_m]; }
  function unxy(u) { var mt = state.net.meta; return P.inv(u[0] * mt.unit_m + mt.x0, mt.y1 - u[1] * mt.unit_m); }

  /* ---------- apurit ---------- */
  function t(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[LANG] != null ? o[LANG] : o.fi)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cname(c) { return c === HOME ? UI.home : UI.other; }
  function src(id) { return (state.data.sources || {})[id]; }
  function srcText(id) { var s = src(id); return s ? s.pub + ' · ' + s.date : ''; }
  function srcLink(id) { var s = src(id); return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.pub) + '</a> · ' + esc(s.date) : ''; }
  function f1(n) { return n.toFixed(1); }
  /* kaksiriviset tunnisteet yhdelle riville vihjeeseen ja ruudunlukijalle: "EstLink 1\n350 MW" → "EstLink 1 · 350 MW" */
  function flat(s) { return String(s).replace(/\n(?=[\d+])/g, ' · ').replace(/\n/g, ' '); }
  function pathOf(lls) { return lls.map(function (ll, i) { var p = xy(ll); return (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); }).join(''); }
  function dot(p) { return 'M' + f1(p[0]) + ' ' + f1(p[1]) + 'h0'; }
  function visibleC(c) { return state.compare || c === HOME || c === 'X'; }

  /* ---------- näkymät ---------- */
  function bboxView(bb) {
    var c = [xy([bb[0], bb[1]]), xy([bb[2], bb[1]]), xy([bb[0], bb[3]]), xy([bb[2], bb[3]]), xy([(bb[0] + bb[2]) / 2, bb[1]]), xy([(bb[0] + bb[2]) / 2, bb[3]])];
    var xs = c.map(function (p) { return p[0]; }), ys = c.map(function (p) { return p[1]; });
    return [Math.min.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, xs), Math.max.apply(0, ys)];
  }
  function stageSize() { var r = el.stage.getBoundingClientRect(); return [Math.max(r.width, 10), Math.max(r.height, 10)]; }
  function fitView(box) {
    var s = stageSize(), w = s[0], h = s[1], bw = (box[2] - box[0]) * 1.06, bh = (box[3] - box[1]) * 1.06;
    var cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    if (bw / bh > w / h) bh = bw * h / w; else bw = bh * w / h;
    return [cx - bw / 2, cy - bh / 2, bw, bh];
  }
  /* Näkymä: vertailussa molemmat maat; muuten kerroksen oma rajaus (L.view[maa]) tai koko kotimaa.
     Kerros, jonka vmode on 'scroll' (Teie liitumine / Teidän liittymänne), zoomaa kotimaasta kohteeseen sitä mukaa kuin
     lukija vierittää luvun läpi (state.zt 0 → 1) — kuten v38-näyttämön kartta: kerittäessä kartta kasvaa kohti liittymää. */
  function homeView() { var v = state.data.views; return fitView(bboxView(HOME === 'FI' ? v.fi.bbox : v.ee.bbox)); }
  function targetView() {
    var v = state.data.views, L = state.data.layers[state.layer];
    if (state.compare) return fitView(bboxView(v.both.bbox));
    var lv = L && L.view && L.view[HOME];
    if (!lv) return homeView();
    if (state.me && L.vmode === 'scroll') {   // lukijan oma paikka: sama rajauksen koko, keskellä hänen kohteensa
      var hw = (lv[2] - lv[0]) / 2, hh = (lv[3] - lv[1]) / 2;
      lv = [state.me[0] - hw, state.me[1] - hh, state.me[0] + hw, state.me[1] + hh];
    }
    var b = fitView(bboxView(lv));
    if (L.vmode !== 'scroll') return b;
    var a = homeView(), t = state.zt, ca = [a[0] + a[2] / 2, a[1] + a[3] / 2], cb = [b[0] + b[2] / 2, b[1] + b[3] / 2];
    var w = a[2] * Math.pow(b[2] / a[2], t), h = a[3] * Math.pow(b[3] / a[3], t);
    var cx = ca[0] + (cb[0] - ca[0]) * t, cy = ca[1] + (cb[1] - ca[1]) * t;
    return [cx - w / 2, cy - h / 2, w, h];
  }
  var DOTS = [['km-dot-h', 7.5, 1.15], ['km-dot-o', 7.5, 0.95], ['km-dot-z', 7.5, 1.6], ['km-dot-g', 7.5, 1.45]];   // [id, väli px, säde px]: sama väli → pisteet osuvat päällekkäin
  function applyView(vb) {
    state.view = vb;
    var k = vb[2] / stageSize()[0], s = vb.map(f1).join(' ');
    [el.base, el.svg].forEach(function (g) { g.setAttribute('viewBox', s); g.style.setProperty('--k', k.toFixed(4)); });
    /* pisteet pysyvät näytöllä samankokoisina (7,5 px välein) zoomista riippumatta */
    DOTS.forEach(function (q) {
      var pt = document.getElementById(X + q[0].slice(3));
      if (!pt) return;
      var S = q[1] * k, c = pt.firstChild;
      pt.setAttribute('width', f1(S)); pt.setAttribute('height', f1(S));
      c.setAttribute('cx', f1(S / 2)); c.setAttribute('cy', f1(S / 2)); c.setAttribute('r', f1(q[2] * k));
    });
    /* viivoitus samoin: noin 9 px välein ja 1,4 px paksu myös lähelle zoomattuna */
    var hp = document.getElementById(X + 'hatch');
    if (hp) { var S = 9 * k, ln = hp.firstChild; hp.setAttribute('width', f1(S)); hp.setAttribute('height', f1(S)); ln.setAttribute('y2', f1(S)); ln.style.strokeWidth = (1.4 * k).toFixed(2); }
  }
  function goView(animate) {
    var to = targetView(), from = state.view;
    cancelAnimationFrame(state.anim);
    if (!from || !animate || REDUCED) { applyView(to); return; }
    var t0 = performance.now(), dur = 520;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      applyView(from.map(function (f, i) { return f + (to[i] - f) * e; }));
      if (k < 1) state.anim = requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- kohteet: etusivun pins (scene.js:n muoto) + sivun omat fx ---------- */
  function collect() {
    var out = [];
    state.data.layers.forEach(function (L, i) {
      (L.pins || []).forEach(function (p) {
        var c = p.c || 'X', f = { layer: i, c: c, lab: p.t, src: p.src, s: p.s, ta: p.ta };
        if (p.k === 'link') { f.t = 'ln'; f.cls = 'link'; f.ll = [p.b, p.a]; f.frac = 1 - (p.lt || 0.5); f.route = 1; }   // reitti piirtyy OSM-kaapelista; tässä tunniste ja osuma-alue
        else if (p.k === 'label') { f.t = 'lbl'; f.cls = p.green ? 'green' : (p.dim ? 'dim' : 'pin'); f.ll = p.p; }
        else if (p.k === 'ring') { f.t = 'ring'; f.ll = p.p; f.r = p.r; }
        else if (p.k === 'point' || p.k === 'node') { f.t = 'pt'; f.cls = p.k === 'point' ? 'bess' : 'node'; f.ll = p.p; }
        else if (p.k === 'zone') { f.t = 'poly'; f.poly = p.poly; f.n = p.n || 4; f.ll = p.lp || p.poly[0]; }
        else return;
        out.push(f);
      });
      (L.fx || []).forEach(function (x) { var f = {}; for (var k in x) f[k] = x[k]; f.layer = i; f.c = x.c || 'X'; out.push(f); });
    });
    return out;
  }

  /* ---------- piirto ----------
     Kaksi päällekkäistä SVG:tä: alla maa (pisteet, rannikko, järvet), päällä verkko, kerrosten kohteet ja tunnisteet.
     Hiiren liikkuessa päällimmäinen siirtyy muutaman pikselin enemmän kuin maa (syvyys); siirto on pelkkä 2D-siirto
     omalla tasollaan, joten selain ei piirrä karttaa uudelleen. Viitteet (#km-L-…, kuviot) toimivat SVG:stä toiseen
     samassa dokumentissa. Perspektiivikallistusta ei käytetä: Chromium jättää sen alla osan SVG:n muutoksista piirtämättä. */
  function edge(m) {
    var F = Math.round(Math.min(m.w, m.h) * 0.09);
    return '<g class="km-edge"><rect x="0" y="0" width="' + F + '" height="' + m.h + '" fill="url(#' + X + 'e-l)"/><rect x="' + (m.w - F) + '" y="0" width="' + F + '" height="' + m.h + '" fill="url(#' + X + 'e-r)"/>' +
      '<rect x="0" y="0" width="' + m.w + '" height="' + F + '" fill="url(#' + X + 'e-t)"/><rect x="0" y="' + (m.h - F) + '" width="' + m.w + '" height="' + F + '" fill="url(#' + X + 'e-b)"/></g>';
  }
  function mapDraw() {
    var net = state.net, m = net.meta, h = [];
    h.push('<defs>');
    Object.keys(net.land).forEach(function (k) { h.push('<path id="' + X + 'L-' + k + '" d="' + net.land[k] + '"/>'); });
    DOTS.forEach(function (q) { h.push('<pattern id="' + X + q[0].slice(3) + '" patternUnits="userSpaceOnUse" width="60" height="60"><circle cx="30" cy="30" r="10" class="' + q[0] + '"/></pattern>'); });
    h.push('<pattern id="' + X + 'hatch" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="70" class="km-hatch-ln"/></pattern>' +
      '<marker id="' + X + 'arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="km-arrowhead"/></marker>' +
      '<clipPath id="' + X + 'clip-FI"><use href="#' + X + 'L-FI"/></clipPath>' +
      ['l:1:0:0:0', 'r:0:0:1:0', 't:0:1:0:0', 'b:0:0:0:1'].map(function (q) {
        var a = q.split(':');
        return '<linearGradient id="' + X + 'e-' + a[0] + '" x1="' + a[1] + '" y1="' + a[2] + '" x2="' + a[3] + '" y2="' + a[4] + '"><stop offset="0" class="km-e0"/><stop offset="1" class="km-e1"/></linearGradient>';
      }).join('') + '</defs>');
    h.push('<rect class="km-sea" x="' + (-m.w) + '" y="' + (-m.h) + '" width="' + (m.w * 3) + '" height="' + (m.h * 3) + '"/>');
    /* maa: tumma pohja + kultaiset pisteet (kotimaa) / himmeät pisteet (toinen maa); naapurit pelkkä pohja */
    h.push('<g class="km-land">');
    Object.keys(net.land).forEach(function (k) {
      var role = k === HOME ? 'is-home' : (k === OTHER ? 'is-other' : 'is-ngb');
      h.push('<use href="#' + X + 'L-' + k + '" class="km-c ' + role + '" data-c="' + k + '"/>');
      if (k === HOME || k === OTHER) h.push('<use href="#' + X + 'L-' + k + '" class="km-dots ' + role + '" fill="url(#' + X + (k === HOME ? 'dot-h' : 'dot-o') + ')"/>');
    });
    h.push('<path class="km-lakes" d="' + net.lakes + '"/></g>' + edge(m));
    el.base.innerHTML = h.join('');
    h = ['<g class="km-regions"></g><g class="km-zones"></g>'];
    /* verkko: hehku alle, terävä viiva päälle */
    h.push('<g class="km-net">');
    net.lines.forEach(function (l) {
      var cls = 'km-v' + l.v + ' km-t-' + l.t, own = l.c === 'FI' || l.c === 'EE' || l.c === 'SEA';
      if (own) h.push('<path class="km-glow ' + cls + '" data-c="' + l.c + '" d="' + l.d + '"/>');
      h.push('<path class="km-l ' + cls + (own ? '' : ' km-ngb') + '" data-c="' + l.c + '" d="' + l.d + '"/>');
    });
    h.push('</g><g class="km-n110"></g>' + edge(m) + '<g class="km-subs">');
    ['FI', 'EE'].forEach(function (c) {
      h.push('<path class="km-sub" data-c="' + c + '" d="' + net.subs.filter(function (s) { return s[3] === c; }).map(function (s) { return dot(s); }).join('') + '"/>');
    });
    h.push('</g><g class="km-plants">');
    net.plants.forEach(function (p) {
      var r = p[3] ? Math.max(4, Math.sqrt(p[3]) * 1.6) : 4;
      h.push('<path class="km-pl km-pl-' + p[2] + '" data-c="' + p[4] + '" style="stroke-width:' + f1(r) + 'px" d="' + dot(p) + '"/>');
    });
    h.push('</g><g class="km-fx"></g><g class="km-mine"></g>');
    el.svg.innerHTML = h.join('');

    var per = state.data.layers.map(function () { return { regions: [], zones: [], fx: [], lb: [] }; });
    state.feats.forEach(function (f, j) {
      var g = per[f.layer], tip = ' data-tip="' + j + '" data-c="' + f.c + '"';
      if (f.t === 'rg') {
        g.regions.push('<path class="km-rg km-rg-' + f.cls + '"' + tip + ' fill="url(#' + X + (f.cls === 'free' ? 'dot-g' : 'hatch') + ')"' +
          ' d="' + f.iso.map(function (iso) { return net.regions[iso] || ''; }).join('') + '"/>');
        if (f.label_at) g.lb.push(label(f, f.label_at, 'km-lbl km-lbl-rg', tip));
      } else if (f.t === 'zone') {
        g.zones.push('<path class="km-zone km-zone-' + f.cls + '" data-c="' + f.c + '" d="' + f.lands.map(function (k) { return net.land[k] || ''; }).join('') + '"/>');
      } else if (f.t === 'poly') {
        g.zones.push('<path class="km-poly" clip-path="url(#' + X + 'clip-FI)" fill="url(#' + X + 'dot-z)"' + tip + ' d="' + pathOf(f.poly) + 'Z"/>');
        g.fx.push('<path class="km-fl km-fl-edge"' + tip + ' d="' + pathOf(f.poly.slice(0, f.n)) + '"/>');
        g.lb.push(label(f, f.ll, 'km-lbl km-lbl-pin', tip));
      } else if (f.t === 'ln' || f.t === 'ar') {
        var d = pathOf(f.ll);
        if (!f.route) {
          g.fx.push('<path class="km-glow km-fg-' + f.cls + '"' + tip + ' d="' + d + '"/>');
          g.fx.push('<path class="km-fl km-fl-' + f.cls + '"' + tip + ' d="' + d + '"' + (f.t === 'ar' ? ' marker-end="url(#' + X + 'arrow)"' : '') + '/>');
        }
        g.fx.push('<path class="km-hit"' + tip + ' d="' + d + '"/>');
        if (f.tag) f.tag.forEach(function (q) { g.lb.push(label({ ta: q[2] || f.ta }, q[0], 'km-lbl km-lbl-' + f.cls, tip, t(q[1]))); });
        else g.lb.push(label(f, f.label_at || along(f.ll, f.frac == null ? 0.5 : f.frac), 'km-lbl km-lbl-' + f.cls, tip));
      } else if (f.t === 'lbl') {
        g.lb.push(label(f, f.ll, 'km-lbl km-lbl-' + f.cls, tip));
      } else if (f.t === 'ring') {
        var c = xy(f.ll), k = 52;
        g.fx.push('<circle class="km-ring km-ring-a"' + tip + ' cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(Math.sqrt(f.r[0]) * k) + '"/>');
        g.fx.push('<circle class="km-ring km-ring-b"' + tip + ' cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(Math.sqrt(f.r[1]) * k) + '"/>');
        g.lb.push(label(f, f.ll, 'km-lbl km-lbl-ring', tip));
      } else if (f.t === 'pt' || f.t === 'you') {
        var p = xy(f.ll);
        var yo = f.t === 'you' ? ' data-you="1"' : '';
        g.fx.push('<path class="km-pulse' + (f.t === 'you' ? ' km-pulse-you' : '') + '"' + yo + ' data-c="' + f.c + '" d="' + dot(p) + '"/>');
        g.fx.push('<path class="km-pt km-pt-' + (f.t === 'you' ? 'you' : f.cls) + '"' + tip + yo + ' d="' + dot(p) + '"/>');
        g.lb.push(label(f, f.ll, 'km-lbl km-lbl-pt', tip).replace('<text ', '<text' + yo + ' '));
      }
    });
    ['regions', 'zones', 'fx'].forEach(function (k) {
      el.svg.querySelector('.km-' + k).innerHTML = per.map(function (g, i) { return '<g data-layer="' + i + '">' + g[k].join('') + (k === 'fx' ? g.lb.join('') : '') + '</g>'; }).join('');
    });
  }
  function along(lls, frac) {
    var seg = [], tot = 0;
    for (var i = 1; i < lls.length; i++) { var a = xy(lls[i - 1]), b = xy(lls[i]), d = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(d); tot += d; }
    var want = tot * frac;
    for (var j = 0; j < seg.length; j++) {
      if (want <= seg[j]) { var k = seg[j] ? want / seg[j] : 0; return [lls[j][0] + (lls[j + 1][0] - lls[j][0]) * k, lls[j][1] + (lls[j + 1][1] - lls[j][1]) * k]; }
      want -= seg[j];
    }
    return lls[lls.length - 1];
  }
  function label(f, ll, cls, tip, txt) {
    var p = xy(ll), a = f.ta === 'end' || f.ta === 'middle' ? ' km-ta-' + f.ta : '', x = f1(p[0]);
    var lines = String(txt == null ? t(f.lab) : txt).split('\n');
    return '<text class="' + cls + a + '"' + tip + ' x="' + x + '" y="' + f1(p[1]) + '">' +
      lines.map(function (ln, k) { return k ? '<tspan x="' + x + '" dy="1.2em">' + esc(ln) + '</tspan>' : esc(ln); }).join('') + '</text>';
  }

  /* ---------- 110 kV: koko verkko näkyy oletuksena (Madis 4.11.2026: muutkin johdot, saaret mukaan); painike piilottaa ---------- */
  function fetch110() {
    var inl = inline('kartta-110-json');
    return inl ? Promise.resolve(inl) : fetch(root.getAttribute('data-v110'), { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('110'); return r.json(); });
  }
  function draw110(d) {
    var h = d.lines.map(function (l) { return '<path class="km-l km-v110 km-t-' + l.t + '" data-c="' + l.c + '" d="' + l.d + '"/>'; });
    ['FI', 'EE'].forEach(function (c) {
      h.push('<path class="km-sub km-sub110" data-c="' + c + '" d="' + d.subs.filter(function (s) { return s[3] === c; }).map(dot).join('') + '"/>');
    });
    el.svg.querySelector('.km-n110').innerHTML = h.join('');
    state.v110 = 2;
    el.svg.classList.add('show-110');
    sync110();
  }
  function toggle110() {
    if (state.v110 === 2) { el.svg.classList.toggle('show-110'); sync110(); return; }
    if (state.v110 === 1) return;
    state.v110 = 1;
    if (el.t110) el.t110.textContent = UI.v110 + ' ' + UI.loading;
    fetch110().then(draw110).catch(function () { state.v110 = 0; sync110(); });
  }
  function sync110() {
    if (!el.t110) return;
    var on = el.svg.classList.contains('show-110');
    el.t110.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.t110.textContent = UI.v110;
    el.t110.title = on ? UI.note110 : '';
    caption();
  }

  /* ---------- kerroksen vaihto ---------- */
  function syncText(i) {
    if (el.bar) el.bar.querySelectorAll('button[data-i]').forEach(function (bt) {
      var on = +bt.getAttribute('data-i') === i;
      bt.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && el.bar.scrollWidth > el.bar.clientWidth) {
        var x = bt.getBoundingClientRect().left - el.bar.getBoundingClientRect().left + el.bar.scrollLeft;
        el.bar.scrollTo({ left: Math.max(0, x - 12), behavior: REDUCED ? 'auto' : 'smooth' });
      }
    });
    if (FRONT) root.querySelectorAll('.km-fs').forEach(function (li) { li.classList.toggle('on', +li.getAttribute('data-layer') === i); });
  }
  function setLayer(i, opts) {
    state.layer = i;
    syncText(i);
    if (!state.ready) return;
    var L = state.data.layers[i];
    if (!L) return;
    var b = L.base || {};
    el.svg.style.setProperty('--net', b.lines == null ? 1 : b.lines);
    el.svg.classList.toggle('show-subs', !!b.subs);
    el.svg.classList.toggle('show-plants', !!b.plants);
    el.svg.querySelectorAll('[data-layer]').forEach(function (g) { g.classList.toggle('on', +g.getAttribute('data-layer') === i); });
    el.svg.querySelectorAll('.km-fx [data-tip]').forEach(function (n) {
      var on = n.parentNode.classList.contains('on') && visibleC(n.getAttribute('data-c')) && n.tagName.toLowerCase() === 'text';
      n.setAttribute('tabindex', on ? '0' : '-1');
      if (on) { n.setAttribute('role', 'button'); n.setAttribute('aria-label', flat(t(state.feats[+n.getAttribute('data-tip')].lab))); }
    });
    el.svg.setAttribute('aria-label', UI.map + ' — ' + t(L.q));
    renderInset();
    caption();
    hideTip();
    goView(!(opts && opts.instant));
    if (opts && opts.reveal && window.innerWidth < 1024) {
      var mp = root.querySelector('.km-map');
      if (mp) mp.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function setCompare(on) {
    state.compare = !!on;
    root.classList.toggle('is-compare', state.compare);
    el.svg.classList.toggle('is-compare', state.compare);
    el.base.classList.toggle('is-compare', state.compare);
    var o = el.base.querySelector('.km-dots.is-other');
    if (o) o.setAttribute('fill', 'url(#' + X + (state.compare ? 'dot-h' : 'dot-o') + ')');
    if (el.cmp) { el.cmp.setAttribute('aria-pressed', state.compare ? 'true' : 'false'); el.cmp.textContent = state.compare ? UI.compareOff : UI.compare; }
    goView(true);
    setLayer(state.layer);
  }

  /* ---------- tietolaatikko (vain /verkko/-sivulla) ---------- */
  function bigHtml(L, c, other) {
    var b = L.big && L.big[c];
    if (!b) return '';
    return '<div class="km-big' + (other ? ' is-other' : '') + '"><p class="km-bc">' + esc(cname(c)) + '</p><p class="km-bv">' + esc(b.v) + '</p><p class="km-bl">' + esc(t(b.l)) +
      ' <span class="km-bs">' + b.src.map(function (id) { return '<button type="button" class="km-si" data-src="' + esc(id) + '" aria-label="' + esc(UI.src + ': ' + srcText(id)) + '">i</button>'; }).join('') + '</span></p></div>';
  }
  function renderInset() {
    if (!el.inset) return;
    var L = state.data.layers[state.layer], h = [];
    h.push('<div class="km-bigs' + (state.compare ? ' two' : '') + '">' + bigHtml(L, HOME) + (state.compare ? bigHtml(L, OTHER, true) : '') + '</div>');
    if (state.compare && L.cmp) h.push('<p class="km-def"><b>' + UI.def + ':</b> ' + esc(t(L.cmp)) + '</p>');
    if (L.pays) {
      (state.compare ? [HOME, OTHER] : [HOME]).forEach(function (c) {
        var p = L.pays[c];
        if (p) h.push('<p class="km-pays"><b>' + UI.pays + (state.compare ? ' · ' + esc(cname(c)) : '') + ':</b> ' + esc(t(p)) +
          ' <button type="button" class="km-si" data-src="' + esc(p.src) + '" aria-label="' + esc(UI.src + ': ' + srcText(p.src)) + '">i</button></p>');
      });
    }
    if (L.note) h.push('<p class="km-note">' + esc(t(L.note)) + '</p>');
    el.inset.innerHTML = h.join('');
  }
  function caption(extra) {
    if (!el.caption) return;
    if (extra) { el.caption.innerHTML = extra; return; }
    var L = state.data.layers[state.layer], ids = [];
    [HOME].concat(state.compare ? [OTHER] : []).forEach(function (c) { if (L.big && L.big[c]) ids = ids.concat(L.big[c].src); });
    ids = ids.filter(function (x, k) { return ids.indexOf(x) === k; });
    el.caption.innerHTML = '<b>' + UI.layer + ' ' + (state.layer + 1) + '/' + state.data.layers.length + '</b> · ' + esc(t(L.q)) +
      (ids.length ? ' · ' + UI.sources + ': ' + ids.map(srcLink).join('; ') : '') +
      (el.svg && el.svg.classList.contains('show-110') ? ' · ' + esc(UI.note110) : '');
  }

  /* ---------- vihjeet: hiiri, kosketus, näppäimistö ---------- */
  function tipHtml(f) {
    return '<b>' + esc(flat(t(f.lab))) + '</b>' + (f.val ? '<span>' + esc(t(f.val)) + '</span>' : '') +
      (f.src ? '<small>' + UI.src + ': ' + srcLink(f.src) + '</small>' : (f.s ? '<small>' + UI.src + ': ' + esc(f.s) + '</small>' : ''));
  }
  function showTipAt(html, x, y) {
    var tip = el.tip, r = el.stage.getBoundingClientRect();
    tip.innerHTML = html;
    tip.hidden = false;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = Math.min(Math.max(8, x - r.left + 14), r.width - tw - 8), top = y - r.top + 14;
    if (top + th > r.height - 8) top = Math.max(8, y - r.top - th - 14);
    tip.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
  }
  function hideTip() { if (el.tip) el.tip.hidden = true; state.tipFor = null; }
  function hit(target) {
    var n = target && target.closest && target.closest('[data-tip]');
    if (!n || !n.parentNode.classList.contains('on') || !visibleC(n.getAttribute('data-c'))) return null;
    return n;
  }
  /* pistekohteet (varasto, teidän kohteenne) voittavat alueen, jos osoitin tai sormi on 22 px:n päässä:
     nollan pituinen viiva ei ota osumaa luotettavasti, ja sormi osuu harvoin pikselilleen */
  function pick(e) {
    var best = null, bd = 22 * 22;
    el.svg.querySelectorAll('.km-fx > g.on .km-pt').forEach(function (q) {
      if (!visibleC(q.getAttribute('data-c'))) return;
      var r = q.getBoundingClientRect(), dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = q; }
    });
    var n = hit(e.target);
    return (n && n.tagName.toLowerCase() === 'text') ? n : (best || n);
  }
  /* syvyys: verkko ja tunnisteet liikkuvat hiiren mukana enemmän kuin maa (ei kosketuksessa eikä reduced-motionilla) */
  function tilt(e) {
    if (REDUCED || e.pointerType !== 'mouse') return;
    var r = el.stage.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
    el.svg.style.setProperty('--tx', (-nx * 7).toFixed(1) + 'px');
    el.svg.style.setProperty('--ty', (-ny * 5).toFixed(1) + 'px');
  }
  function untilt() { el.svg.style.setProperty('--tx', '0px'); el.svg.style.setProperty('--ty', '0px'); }
  function bindTips() {
    el.tip = document.createElement('div');
    el.tip.className = 'km-tip';
    el.tip.setAttribute('role', 'tooltip');
    el.tip.hidden = true;
    el.stage.appendChild(el.tip);
    el.svg.addEventListener('pointermove', function (e) {
      tilt(e);
      if (e.pointerType === 'touch') return;
      var n = pick(e);
      if (!n) { if (state.tipFor) { hideTip(); caption(); } return; }
      var f = state.feats[+n.getAttribute('data-tip')];
      state.tipFor = n;
      showTipAt(tipHtml(f), e.clientX, e.clientY);
      caption('<b>' + esc(flat(t(f.lab))) + '</b>' + (f.src ? ' · ' + UI.src + ': ' + srcLink(f.src) : ''));
    });
    el.svg.addEventListener('pointerleave', function () { untilt(); hideTip(); caption(); });
    el.svg.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var n = pick(e);
      if (!n || state.tipFor === n) { hideTip(); return; }
      state.tipFor = n;
      showTipAt(tipHtml(state.feats[+n.getAttribute('data-tip')]), e.clientX, e.clientY);
    });
    el.svg.addEventListener('focusin', function (e) {
      var n = hit(e.target);
      if (!n) return;
      var r = n.getBoundingClientRect();
      showTipAt(tipHtml(state.feats[+n.getAttribute('data-tip')]), r.left + r.width / 2, r.top + r.height / 2);
    });
    el.svg.addEventListener('focusout', hideTip);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
    root.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.km-si');
      if (!b || !state.data) return;
      var s = src(b.getAttribute('data-src'));
      if (!s) return;
      var r = b.getBoundingClientRect();
      showTipAt('<b>' + esc(s.pub) + '</b><span>' + esc(s.title) + ' · ' + esc(s.date) + '</span><small><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
        esc(s.url.replace(/^https?:\/\//, '').slice(0, 64)) + '</a></small>', r.left, r.top - 60);
    });
  }

  /* ---------- painikkeet: etusivulla toimivat heti, ennen kuin kartta on ladattu ---------- */
  var manual = 0;
  function bindBar() {
    if (!el.bar || el.bar.getAttribute('data-bound')) return;
    if (!el.bar.querySelector('button[data-i]') && state.data) {
      el.bar.innerHTML = state.data.layers.map(function (L, i) {
        return '<button type="button" aria-pressed="false" data-i="' + i + '"><span>' + (i + 1) + '</span>' + esc(t(L.name)) + '</button>';
      }).join('');
    }
    if (!el.bar.querySelector('button[data-i]')) return;
    el.bar.setAttribute('data-bound', '1');
    el.bar.hidden = false;
    el.bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (b) { manual = Date.now(); state.zt = 1; setLayer(+b.getAttribute('data-i')); }
    });
  }
  function bindUi() {
    bindBar();
    if (el.cmp) { el.cmp.hidden = false; el.cmp.textContent = UI.compare; el.cmp.addEventListener('click', function () { setCompare(!state.compare); }); }
    if (el.t110) { el.t110.hidden = false; el.t110.addEventListener('click', toggle110); }
    document.querySelectorAll('[data-show-layer]').forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () { manual = Date.now(); state.zt = 1; setLayer(+b.getAttribute('data-show-layer'), { reveal: true }); });
    });
    /* /verkko/-sivulla kartta seuraa vieritystä kaikilla näytöillä (puhelimella kartta on kiinnitetty ylös):
       luku, jonka yläreuna on ohittanut lukulinjan, valitsee kerroksen; viimeisessä luvussa kartta zoomaa kohteeseen. */
    if (!FRONT) {
      var raf = 0;
      var onScroll = function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; scrollSync(); }); };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      scrollSync();
    }
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { restage(); applyView(targetView()); }, 120); });
    if ('ResizeObserver' in window) {
      var last = 0;
      state.ro = new ResizeObserver(function () { var w = stageSize()[0]; if (Math.abs(w - last) > 2) { last = w; applyView(targetView()); } });
      state.ro.observe(el.stage);
    }
  }
  /* ---------- lukijan oma liittymä (5.11.2026): painike tai napautus viimeisessä luvussa → merkki, zoomaus ja paikan kortti.
     Sijainti pysyy selaimessa: ei tallenneta, ei lähetetä; kortin aineisto assets/kartta-paikka.js ladataan vasta nyt. ---------- */
  function siteIndex() { var k = -1; state.data.layers.forEach(function (L, i) { if (L.vmode === 'scroll') k = i; }); return k; }
  function say(k) { var gb = root.querySelector('.km-geo'), st = root.querySelector('.km-st'); if (gb && st) st.textContent = gb.getAttribute('data-' + k) || ''; }
  function drawMe() {
    var g = el.svg.querySelector('.km-mine');
    if (!g || !state.me) return;
    var p = xy(state.me);
    g.innerHTML = '<path class="km-pulse km-pulse-you" d="' + dot(p) + '"/><path class="km-pt km-pt-you" d="' + dot(p) + '"/>' +
      '<text class="km-lbl km-lbl-pt km-lbl-me" x="' + f1(p[0]) + '" y="' + f1(p[1]) + '">' + esc(UI.me) + '</text>';
    el.svg.classList.add('has-me');
  }
  function paikka(lon, lat) {
    var host = root.querySelector('.km-me');
    if (!host) return;
    var a = root.querySelector('.km-final .btn-primary'), o = { cta: a ? a.getAttribute('href') : null };
    if (window.SAMA_PAIKKA) { window.SAMA_PAIKKA.show(host, lon, lat, o); return; }
    var sc = document.createElement('script');
    sc.src = '/assets/kartta-paikka.js';
    sc.onload = function () { if (window.SAMA_PAIKKA) window.SAMA_PAIKKA.show(host, lon, lat, o); };
    document.head.appendChild(sc);
  }
  function setMe(lon, lat, k) {
    var ex = state.net.meta.extent_lonlat;
    if (!(lon > ex[0] && lon < ex[2] && lat > ex[1] && lat < ex[3])) { say('out'); return; }
    state.me = [lon, lat];
    drawMe();
    manual = Date.now(); state.zt = 1;
    var si = siteIndex();
    if (si >= 0 && state.layer !== si) setLayer(si); else goView(true);
    say(k);
    paikka(lon, lat);
  }
  function bindMe() {
    if (FRONT) return;
    var gb = root.querySelector('.km-geo');
    if (gb && 'geolocation' in navigator) {
      gb.hidden = false;
      gb.addEventListener('click', function () {
        say('wait');
        navigator.geolocation.getCurrentPosition(function (p) { setMe(p.coords.longitude, p.coords.latitude, 'ok'); }, function () { say('no'); },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
      });
    }
    el.svg.addEventListener('click', function (e) {
      var L = state.data.layers[state.layer];
      if (!L || L.vmode !== 'scroll' || hit(e.target)) return;   // kohde = vihje, ei paikan valinta
      var r = el.base.getBoundingClientRect(), vb = state.view;
      setMe.apply(null, unxy([vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]]).concat(['tap']));
    });
  }
  var chs = FRONT ? [] : [].slice.call(document.querySelectorAll('.km-ch[data-layer]'));
  function scrollSync() {
    if (!state.ready || !chs.length || Date.now() - manual < 900) return;
    var H = window.innerHeight, mp = root.querySelector('.km-map'), mb = mp && mp.getBoundingClientRect();
    /* lukulinja: leveällä näytöllä ruudun keskellä; puhelimella kiinnitetyn kartan alapuolisen tekstialueen yläkolmanneksessa */
    var ref = (window.innerWidth >= 1024 || !mb) ? H * 0.5 : Math.min(H - 90, mb.bottom + (H - mb.bottom) * 0.35);
    var act = 0;
    for (var i = 0; i < chs.length; i++) if (chs[i].getBoundingClientRect().top <= ref) act = i;
    var li = +chs[act].getAttribute('data-layer'), L = state.data.layers[li], zt = 0;
    if (L && L.vmode === 'scroll') {
      var r = chs[act].getBoundingClientRect();
      zt = (REDUCED || state.me) ? 1 : Math.max(0, Math.min(1, (ref - r.top) / Math.max(1, r.height * 0.6)));
      zt = zt * zt * (3 - 2 * zt);
    }
    if (li !== state.layer) { state.zt = zt; setLayer(li, { instant: L && L.vmode === 'scroll' }); }
    else if (Math.abs(zt - state.zt) > 0.002) { state.zt = zt; cancelAnimationFrame(state.anim); applyView(targetView()); }
  }
  /* etusivu: leveän ja kapean näytön välillä kartta siirtyy näyttämön ja osion välillä */
  function restage() {
    if (!FRONT || !el.svg) return;
    var s = pickStage();
    if (!s || s === el.stage) return;
    el.stage = s;
    s.appendChild(el.base);
    s.appendChild(el.svg);
    s.appendChild(el.tip);
    s.setAttribute('data-state', 'ready');
    root.classList.toggle('km-inl', s.classList.contains('km-inline'));
    if (state.ro) { state.ro.disconnect(); state.ro.observe(s); }
  }

  /* ---------- lataus ---------- */
  function inline(id) {
    var s = document.getElementById(id);
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return null; }
  }
  function load() {
    var v = FRONT ? Promise.resolve(null) : fetch110().catch(function () { return null; });
    var a = inline('kartta-pohja-json'), b = inline('kartta-data-json');
    if (a && b) return Promise.all([a, b, v]);
    return Promise.all([root.getAttribute('data-pohja'), root.getAttribute('data-src')].map(function (u) {
      return fetch(u, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); });
    }).concat([v]));
  }
  function start() {
    el.stage = pickStage();
    if (FRONT) root.classList.toggle('km-inl', el.stage.classList.contains('km-inline'));
    el.stage.setAttribute('data-state', 'loading');
    load().then(function (res) {
      state.net = res[0]; state.data = res[1];
      state.feats = collect();
      el.base = document.createElementNS(NS, 'svg');
      el.base.setAttribute('class', 'km-svg km-base');
      el.base.setAttribute('aria-hidden', 'true');
      el.svg = document.createElementNS(NS, 'svg');
      el.svg.setAttribute('class', 'km-svg km-top');
      el.svg.setAttribute('role', 'group');   /* 04.11.2026: ei 'img' — kartan kohteet ovat painikkeita (axe: nested-interactive); nimi tulee .km-stage-ryhmältä */
      [el.base, el.svg].forEach(function (g) { g.setAttribute('data-home', HOME); g.setAttribute('preserveAspectRatio', 'xMidYMid meet'); el.stage.appendChild(g); });
      mapDraw();
      if (res[2]) draw110(res[2]);
      bindTips();
      bindUi();
      bindMe();
      applyView(targetView());
      state.ready = true;
      setLayer(state.layer, { instant: true });
      if (!FRONT) scrollSync();
      el.stage.setAttribute('data-state', 'ready');
    }).catch(function () {
      el.stage.setAttribute('data-state', 'error');
      el.stage.insertAdjacentHTML('beforeend', '<p class="km-err">' + esc(UI.fail) + '</p>');
    });
  }
  var api = {
    setLayer: function (i) { setLayer(i); },
    setCompare: function (v) { if (state.ready) setCompare(v); }
  };
  /* etusivun kysymykset vaihtuvat heti, kartta tulee perässä */
  if (FRONT) { root.classList.add('km-js'); bindBar(); }
  /* teksti ensin: kartta ladataan, kun se lähestyy näkymää tai selain on joutilas */
  var go = function () { if (!go.done) { go.done = true; start(); } };
  if ('IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { near.disconnect(); go(); } }, { rootMargin: '600px 0px' });
    near.observe(root);
  } else go();
  /* /verkko/-sivulla kartta on pääsisältö: ladataan viimeistään joutilaana. Etusivulla vain, kun osio lähestyy
     (kontrolli 2.11.2026: ei kartta-aineistoa puhelimelle, jos lukija ei tule osioon) */
  if (!FRONT) { if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200); }
  return api;
  }
})();
