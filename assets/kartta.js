/* SAMA Energia — Yhteinen verkko / Ühine võrk: kartta sivuilla /verkko/ ja /vork/ (v35, 2.11.2026).
   SVG, ei ulkoisia kirjastoja eikä reaaliaikaisia hakuja: lukee vain oman palvelimen tiedostot
     data-pohja  /assets/kartta-pohja.json  maat, järvet, ≥ 220 kV -verkko, voimalat (scripts/kaart/build_map.py)
     data-v110   /assets/kartta-110.json    110 kV -verkko, ladataan vasta kun lukija avaa sen
     data-src    /assets/kartta-data.json   kerrokset, luvut, lähteet (sama tiedosto kuin etusivun scene.js)
   Esikatselutiedostossa sama data tulee sivun sisältä: <script type="application/json" id="kartta-…-json">.
   Kun mikään ei liiku, selain ei piirrä mitään (ei animaatiosilmukkaa); näkymän vaihto ≤ 380 ms, reduced-motion: heti.
   Rajapinta: window.SAMA_VERKKO = { setLayer(i), setCompare(bool) }. */
(function () {
  'use strict';
  var root = document.querySelector('[data-kartta]');
  if (!root) return;

  var LANG = root.getAttribute('data-lang') === 'et' ? 'et' : 'fi';
  var HOME = root.getAttribute('data-home') === 'EE' ? 'EE' : 'FI';
  var OTHER = HOME === 'FI' ? 'EE' : 'FI';
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';

  var UI = {
    fi: { compare: 'Vertaa Viroon', compareOff: 'Vain Suomi', layer: 'Kerros', src: 'Lähde', sources: 'Lähteet', def: 'Vertailtavuus',
      pays: 'Kuka maksaa', fail: 'Karttaa ei voitu ladata. Kaikki luvut ovat tekstissä.', home: 'Suomi', other: 'Viro', map: 'Kartta',
      v110: '110 kV', v110on: '110 kV näkyvissä', loading: 'ladataan…', note110: '110 kV: kaikki OpenStreetMapiin merkityt 110 kV:n johdot, myös jakeluverkkoyhtiöiden.' },
    et: { compare: 'Võrdle Soomega', compareOff: 'Ainult Eesti', layer: 'Kiht', src: 'Allikas', sources: 'Allikad', def: 'Võrreldavus',
      pays: 'Kes maksab', fail: 'Kaarti ei õnnestunud laadida. Kõik arvud on tekstis.', home: 'Eesti', other: 'Soome', map: 'Kaart',
      v110: '110 kV', v110on: '110 kV nähtav', loading: 'laeb…', note110: '110 kV: kõik OpenStreetMapi märgitud 110 kV liinid, sh jaotusvõrguettevõtjate omad.' }
  }[LANG];

  var state = { layer: 0, compare: false, data: null, net: null, view: null, anim: 0, tipFor: null, feats: [], v110: 0 };
  var el = {
    stage: root.querySelector('.km-stage'), bar: root.querySelector('.km-bar'), inset: root.querySelector('.km-inset'),
    caption: root.querySelector('.km-cap'), cmp: root.querySelector('.km-cmp'), t110: root.querySelector('.km-t110'), tip: null, svg: null
  };
  if (!el.stage) return;

  /* ---------- projektio: Lambertin kartioprojektio GRS80, sama kuin scripts/kaart/build_map.py ---------- */
  var P = (function () {
    var a = 6378137, f = 1 / 298.257222101, e = Math.sqrt(2 * f - f * f), d = Math.PI / 180;
    function m(p) { var s = Math.sin(p); return Math.cos(p) / Math.sqrt(1 - e * e * s * s); }
    function t(p) { var s = Math.sin(p); return Math.tan(Math.PI / 4 - p / 2) / Math.pow((1 - e * s) / (1 + e * s), e / 2); }
    var p1 = 58.5 * d, p2 = 67.5 * d, p0 = 63 * d, l0 = 25.5 * d;
    var n = (Math.log(m(p1)) - Math.log(m(p2))) / (Math.log(t(p1)) - Math.log(t(p2)));
    var F = m(p1) / (n * Math.pow(t(p1), n)), r0 = a * F * Math.pow(t(p0), n);
    return function (lon, lat) {
      var r = a * F * Math.pow(t(lat * d), n), th = n * (lon * d - l0);
      return [r * Math.sin(th), r0 - r * Math.cos(th)];
    };
  })();
  function xy(ll) { var mt = state.net.meta, p = P(ll[0], ll[1]); return [(p[0] - mt.x0) / mt.unit_m, (mt.y1 - p[1]) / mt.unit_m]; }

  /* ---------- apurit ---------- */
  function t(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[LANG] != null ? o[LANG] : o.fi)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cname(c) { return c === HOME ? UI.home : UI.other; }
  function src(id) { return (state.data.sources || {})[id]; }
  function srcText(id) { var s = src(id); return s ? s.pub + ' · ' + s.date : ''; }
  function srcLink(id) { var s = src(id); return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.pub) + '</a> · ' + esc(s.date) : ''; }
  function f1(n) { return n.toFixed(1); }
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
  function targetView() {
    var v = state.data.views;
    return fitView(bboxView(state.compare ? v.both.bbox : (HOME === 'FI' ? v.fi.bbox : v.ee.bbox)));
  }
  function applyView(vb) {
    state.view = vb;
    el.svg.setAttribute('viewBox', vb.map(f1).join(' '));
    el.svg.style.setProperty('--k', (vb[2] / stageSize()[0]).toFixed(4));
  }
  function goView(animate) {
    var to = targetView(), from = state.view;
    cancelAnimationFrame(state.anim);
    if (!from || !animate || REDUCED) { applyView(to); return; }
    var t0 = performance.now(), dur = 380;
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
        if (p.k === 'link') { f.t = 'ln'; f.cls = 'link'; f.ll = [p.b, p.a]; f.frac = 1 - (p.lt || 0.5); f.route = 1; }   // reitti piirtyy OSM-kaapelista; tässä vain tunniste ja osuma-alue
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

  /* ---------- piirto ---------- */
  function mapDraw() {
    var net = state.net, m = net.meta, h = [];
    h.push('<defs><pattern id="km-hatch" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<line x1="0" y1="0" x2="0" y2="70" class="km-hatch-ln"/></pattern>' +
      '<marker id="km-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="km-arrowhead"/></marker>' +
      '<clipPath id="km-clip-FI"><path d="' + (net.land.FI || '') + '"/></clipPath>' +
      ['l:1:0:0:0', 'r:0:0:1:0', 't:0:1:0:0', 'b:0:0:0:1'].map(function (q) {
        var a = q.split(':');
        return '<linearGradient id="km-e-' + a[0] + '" x1="' + a[1] + '" y1="' + a[2] + '" x2="' + a[3] + '" y2="' + a[4] + '">' +
          '<stop offset="0" class="km-e0"/><stop offset="1" class="km-e1"/></linearGradient>';
      }).join('') + '</defs>');
    h.push('<rect class="km-sea" x="' + (-m.w) + '" y="' + (-m.h) + '" width="' + (m.w * 3) + '" height="' + (m.h * 3) + '"/>');
    h.push('<g class="km-land">');
    Object.keys(net.land).forEach(function (k) {
      h.push('<path class="km-c' + (k === HOME ? ' is-home' : (k === OTHER ? ' is-other' : ' is-ngb')) + '" data-c="' + k + '" d="' + net.land[k] + '"/>');
    });
    h.push('<path class="km-lakes" d="' + net.lakes + '"/></g><g class="km-regions"></g><g class="km-zones"></g>');
    h.push('<g class="km-net">');
    net.lines.forEach(function (l) {
      h.push('<path class="km-l km-v' + l.v + ' km-t-' + l.t + (l.c === 'FI' || l.c === 'EE' || l.c === 'SEA' ? '' : ' km-ngb') + '" data-c="' + l.c + '" d="' + l.d + '"/>');
    });
    h.push('</g><g class="km-n110"></g>');
    var F = Math.round(Math.min(m.w, m.h) * 0.09);
    h.push('<g class="km-edge"><rect x="0" y="0" width="' + F + '" height="' + m.h + '" fill="url(#km-e-l)"/><rect x="' + (m.w - F) + '" y="0" width="' + F + '" height="' + m.h + '" fill="url(#km-e-r)"/>' +
      '<rect x="0" y="0" width="' + m.w + '" height="' + F + '" fill="url(#km-e-t)"/><rect x="0" y="' + (m.h - F) + '" width="' + m.w + '" height="' + F + '" fill="url(#km-e-b)"/></g><g class="km-subs">');
    ['FI', 'EE'].forEach(function (c) {
      h.push('<path class="km-sub" data-c="' + c + '" d="' + net.subs.filter(function (s) { return s[3] === c; }).map(function (s) { return dot(s); }).join('') + '"/>');
    });
    h.push('</g><g class="km-plants">');
    net.plants.forEach(function (p) {
      var r = p[3] ? Math.max(4, Math.sqrt(p[3]) * 1.6) : 4;
      h.push('<path class="km-pl km-pl-' + p[2] + '" data-c="' + p[4] + '" style="stroke-width:' + f1(r) + 'px" d="' + dot(p) + '"/>');
    });
    h.push('</g><g class="km-fx"></g>');
    el.svg.innerHTML = h.join('');

    var groups = { regions: [], zones: [], fx: [] }, per = state.data.layers.map(function () { return { regions: [], zones: [], fx: [] }; });
    state.feats.forEach(function (f, j) {
      var g = per[f.layer], tip = ' data-tip="' + j + '" data-c="' + f.c + '"';
      if (f.t === 'rg') {
        g.regions.push('<path class="km-rg km-rg-' + f.cls + '"' + tip + ' d="' + f.iso.map(function (iso) { return net.regions[iso] || ''; }).join('') + '"/>');
        if (f.label_at) g.fx.push(label(f, f.label_at, 'km-lbl km-lbl-rg', tip));
      } else if (f.t === 'zone') {
        g.zones.push('<path class="km-zone km-zone-' + f.cls + '" data-c="' + f.c + '" d="' + f.lands.map(function (k) { return net.land[k] || ''; }).join('') + '"/>');
      } else if (f.t === 'poly') {
        g.zones.push('<path class="km-poly" clip-path="url(#km-clip-FI)"' + tip + ' d="' + pathOf(f.poly) + 'Z"/>');
        g.fx.push('<path class="km-fl km-fl-edge"' + tip + ' d="' + pathOf(f.poly.slice(0, f.n)) + '"/>');
        g.fx.push(label(f, f.ll, 'km-lbl km-lbl-pin', tip));
      } else if (f.t === 'ln' || f.t === 'ar') {
        var d = pathOf(f.ll);
        if (!f.route) g.fx.push('<path class="km-fl km-fl-' + f.cls + '"' + tip + ' d="' + d + '"' + (f.t === 'ar' ? ' marker-end="url(#km-arrow)"' : '') + '/>');
        g.fx.push('<path class="km-hit"' + tip + ' d="' + d + '"/>');
        if (f.tag) f.tag.forEach(function (q) { g.fx.push(label({ ta: q[2] || f.ta }, q[0], 'km-lbl km-lbl-' + f.cls, tip, t(q[1]))); });
        else g.fx.push(label(f, f.label_at || along(f.ll, f.frac == null ? 0.5 : f.frac), 'km-lbl km-lbl-' + f.cls, tip));
      } else if (f.t === 'lbl') {
        g.fx.push(label(f, f.ll, 'km-lbl km-lbl-' + f.cls, tip));
      } else if (f.t === 'ring') {
        var c = xy(f.ll), k = 52;
        g.fx.push('<circle class="km-ring km-ring-a"' + tip + ' cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(Math.sqrt(f.r[0]) * k) + '"/>');
        g.fx.push('<circle class="km-ring km-ring-b"' + tip + ' cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(Math.sqrt(f.r[1]) * k) + '"/>');
        g.fx.push(label(f, f.ll, 'km-lbl km-lbl-ring', tip));
      } else if (f.t === 'pt' || f.t === 'you') {
        var p = xy(f.ll);
        if (f.t === 'you') g.fx.push('<path class="km-you-pulse" data-c="' + f.c + '" d="' + dot(p) + '"/>');
        g.fx.push('<path class="km-pt km-pt-' + (f.t === 'you' ? 'you' : f.cls) + '"' + tip + ' d="' + dot(p) + '"/>');
        g.fx.push(label(f, f.ll, 'km-lbl km-lbl-pt', tip));
      }
    });
    ['regions', 'zones', 'fx'].forEach(function (k) {
      var box = el.svg.querySelector('.km-' + k);
      box.innerHTML = per.map(function (g, i) { return '<g data-layer="' + i + '">' + g[k].join('') + '</g>'; }).join('');
    });
    return groups;
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

  /* ---------- 110 kV, ladataan pyydettäessä ---------- */
  function toggle110() {
    if (state.v110 === 2) { el.svg.classList.toggle('show-110'); sync110(); return; }
    if (state.v110 === 1) return;
    state.v110 = 1;
    if (el.t110) el.t110.textContent = UI.v110 + ' ' + UI.loading;
    var inl = inline('kartta-110-json');
    (inl ? Promise.resolve(inl) : fetch(root.getAttribute('data-v110'), { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('110'); return r.json(); }))
      .then(function (d) {
        var h = d.lines.map(function (l) { return '<path class="km-l km-v110 km-t-' + l.t + '" data-c="' + l.c + '" d="' + l.d + '"/>'; });
        ['FI', 'EE'].forEach(function (c) {
          h.push('<path class="km-sub km-sub110" data-c="' + c + '" d="' + d.subs.filter(function (s) { return s[3] === c; }).map(dot).join('') + '"/>');
        });
        el.svg.querySelector('.km-n110').innerHTML = h.join('');
        state.v110 = 2;
        el.svg.classList.add('show-110');
        sync110();
      }).catch(function () { state.v110 = 0; sync110(); });
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
  function setLayer(i, opts) {
    var L = state.data.layers[i];
    if (!L) return;
    state.layer = i;
    var b = L.base || {};
    el.svg.style.setProperty('--net', b.lines == null ? 1 : b.lines);
    el.svg.classList.toggle('show-subs', !!b.subs);
    el.svg.classList.toggle('show-plants', !!b.plants);
    el.svg.querySelectorAll('[data-layer]').forEach(function (g) { g.classList.toggle('on', +g.getAttribute('data-layer') === i); });
    el.svg.querySelectorAll('.km-fx [data-tip]').forEach(function (n) {
      var on = n.parentNode.classList.contains('on') && visibleC(n.getAttribute('data-c')) && n.tagName.toLowerCase() === 'text';
      n.setAttribute('tabindex', on ? '0' : '-1');
      if (on) { n.setAttribute('role', 'button'); n.setAttribute('aria-label', t(state.feats[+n.getAttribute('data-tip')].lab)); }
    });
    if (el.bar) el.bar.querySelectorAll('button').forEach(function (bt, k) {
      bt.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      if (k === i && el.bar.scrollWidth > el.bar.clientWidth) el.bar.scrollTo({ left: Math.max(0, bt.offsetLeft - 12), behavior: REDUCED ? 'auto' : 'smooth' });
    });
    el.svg.setAttribute('aria-label', UI.map + ' — ' + t(L.q));
    renderInset();
    caption();
    hideTip();
    if (opts && opts.reveal && window.innerWidth < 1024) {
      var mp = root.querySelector('.km-map');
      if (mp) mp.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function setCompare(on) {
    state.compare = !!on;
    root.classList.toggle('is-compare', state.compare);
    if (el.cmp) { el.cmp.setAttribute('aria-pressed', state.compare ? 'true' : 'false'); el.cmp.textContent = state.compare ? UI.compareOff : UI.compare; }
    goView(true);
    setLayer(state.layer);
  }

  /* ---------- tietolaatikko ---------- */
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
    return '<b>' + esc(t(f.lab)) + '</b>' + (f.val ? '<span>' + esc(t(f.val)) + '</span>' : '') +
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
  function bindTips() {
    el.tip = document.createElement('div');
    el.tip.className = 'km-tip';
    el.tip.setAttribute('role', 'tooltip');
    el.tip.hidden = true;
    el.stage.appendChild(el.tip);
    el.svg.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var n = hit(e.target);
      if (!n) { if (state.tipFor) { hideTip(); caption(); } return; }
      var f = state.feats[+n.getAttribute('data-tip')];
      state.tipFor = n;
      showTipAt(tipHtml(f), e.clientX, e.clientY);
      caption('<b>' + esc(t(f.lab)) + '</b>' + (f.src ? ' · ' + UI.src + ': ' + srcLink(f.src) : ''));
    });
    el.svg.addEventListener('pointerleave', function () { hideTip(); caption(); });
    el.svg.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var n = hit(e.target);
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
      if (!b) return;
      var s = src(b.getAttribute('data-src'));
      if (!s) return;
      var r = b.getBoundingClientRect();
      showTipAt('<b>' + esc(s.pub) + '</b><span>' + esc(s.title) + ' · ' + esc(s.date) + '</span><small><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
        esc(s.url.replace(/^https?:\/\//, '').slice(0, 64)) + '</a></small>', r.left, r.top - 60);
    });
  }

  /* ---------- painikkeet ja tekstin luvut ---------- */
  var manual = 0;
  function bindUi() {
    if (el.bar) {
      el.bar.innerHTML = state.data.layers.map(function (L, i) {
        return '<button type="button" aria-pressed="false" data-i="' + i + '"><span>' + (i + 1) + '</span>' + esc(t(L.name)) + '</button>';
      }).join('');
      el.bar.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-i]');
        if (b) { manual = Date.now(); setLayer(+b.getAttribute('data-i')); }
      });
    }
    if (el.cmp) { el.cmp.hidden = false; el.cmp.textContent = UI.compare; el.cmp.addEventListener('click', function () { setCompare(!state.compare); }); }
    if (el.t110) { el.t110.hidden = false; el.t110.addEventListener('click', toggle110); }
    document.querySelectorAll('[data-show-layer]').forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () { manual = Date.now(); setLayer(+b.getAttribute('data-show-layer'), { reveal: true }); });
    });
    /* luvun tullessa luettavaksi kartta vaihtaa sen kerrokseen — vain leveällä näytöllä, jossa kartta pysyy näkyvissä tekstin rinnalla */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (window.innerWidth < 1024 || Date.now() - manual < 900) return;
        es.forEach(function (e) { if (e.isIntersecting) setLayer(+e.target.getAttribute('data-layer')); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('.km-ch[data-layer]').forEach(function (c) { io.observe(c); });
    }
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { applyView(targetView()); }, 120); });
    if ('ResizeObserver' in window) {
      var last = 0;
      new ResizeObserver(function () { var w = stageSize()[0]; if (Math.abs(w - last) > 2) { last = w; applyView(targetView()); } }).observe(el.stage);
    }
  }

  /* ---------- lataus ---------- */
  function inline(id) {
    var s = document.getElementById(id);
    if (!s) return null;
    try { return JSON.parse(s.textContent); } catch (e) { return null; }
  }
  function load() {
    var a = inline('kartta-pohja-json'), b = inline('kartta-data-json');
    if (a && b) return Promise.resolve([a, b]);
    return Promise.all([root.getAttribute('data-pohja'), root.getAttribute('data-src')].map(function (u) {
      return fetch(u, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); });
    }));
  }
  function start() {
    el.stage.setAttribute('data-state', 'loading');
    load().then(function (res) {
      state.net = res[0]; state.data = res[1];
      state.feats = collect();
      el.svg = document.createElementNS(NS, 'svg');
      el.svg.setAttribute('class', 'km-svg');
      el.svg.setAttribute('role', 'img');
      el.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      el.stage.appendChild(el.svg);
      mapDraw();
      bindTips();
      bindUi();
      applyView(targetView());
      setLayer(0);
      el.stage.setAttribute('data-state', 'ready');
    }).catch(function () {
      el.stage.setAttribute('data-state', 'error');
      el.stage.insertAdjacentHTML('beforeend', '<p class="km-err">' + esc(UI.fail) + '</p>');
    });
  }
  window.SAMA_VERKKO = {
    setLayer: function (i) { if (state.data) setLayer(i); },
    setCompare: function (v) { if (state.data) setCompare(v); }
  };
  /* teksti ensin: kartta ladataan, kun se lähestyy näkymää tai selain on joutilas */
  var go = function () { if (!go.done) { go.done = true; start(); } };
  if ('IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { near.disconnect(); go(); } }, { rootMargin: '600px 0px' });
    near.observe(root);
  } else go();
  if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200);
})();
