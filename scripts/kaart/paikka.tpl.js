/* SAMA Energia — "Teie objekti asukohas / Kohteenne sijainnissa" -kortti (5.11.2026).
   GENEROITU: python3 scripts/kaart/build_paikka.py (pohja paikka.tpl.js + aineisto kartta-pohja.json, kartta-110.json,
   kartta-data.json). Älä muokkaa käsin.
   Kun lukija on valinnut liittymänsä paikan (painike tai napautus kartalla), kortti kertoo, mikä siinä paikassa on totta:
   Suomen aluerajoitus tai vapaa kapasiteetti (Fingrid, samat tekstit kuin kartalla), lähin 110 kV ja kantaverkon asema
   (OpenStreetMap), Viron lähin suuri salvestipark (ERR), ja mikä ei riipu paikasta. Kaikki lasketaan selaimessa;
   sijaintia ei tallenneta eikä lähetetä. Rajapinta: window.SAMA_PAIKKA.show(isäntä, lon, lat, { cta: '#kartoitus', before: elementti }):
   cta = kortin oma painike (vain jos isännässä ei ole omaa), before = isännän lapsi, jonka eteen kortti tulee. */
(function () {
  'use strict';
  if (window.SAMA_PAIKKA) return;
  var D = /*DATA*/null;
  var T = {
    fi: {
      h: 'Kohteenne sijainnissa', out: 'Kartta kattaa Suomen ja Viron. Valitkaa kohta maalta.',
      dist: function (k) { return k < 1 ? 'alle kilometrin päässä' : 'noin ' + Math.round(k) + ' km:n päässä'; },
      grid: function (a, v, b) { return 'Lähin 110 kV:n sähköasema on ' + a + ' ja lähin kantaverkon ' + v + ' kV:n asema ' + b + '.'; },
      gridSame: function (a, v) { return 'Lähin 110 kV:n sähköasema on ' + a + ', ja se on myös kantaverkon ' + v + ' kV:n asema.'; },
      park: function (n, a) { return 'Lähin suuri sähkövarastopuisto on ' + n + ', ' + a + '.'; },
      queue: 'Liittymänne taakse asennettu sähkövarasto ei jonota kantaverkkoon.',
      same: { FI: 'Pörssihinta ja reservimarkkina ovat samat koko Suomessa.', EE: 'Pörssihinta ja reservimarkkina ovat samat koko Virossa.' },
      dep: 'Sijainnista riippuvat verkkoyhtiönne siirtohinnat ja liittymän ehdot. Otamme ne huomioon kirjallisessa arviossa yhdessä tuntitietojenne kanssa.',
      cta: 'Pyydä arvio tälle kohteelle', src: 'Lähteet', osm: 'OpenStreetMap-tekijät (ODbL 1.0)'
    },
    et: {
      h: 'Teie objekti asukohas', out: 'Kaart katab Eestit ja Soomet. Valige koht maismaal.',
      dist: function (k) { return k < 1 ? 'alla kilomeetri kaugusel' : 'umbes ' + Math.round(k) + ' km kaugusel'; },
      grid: function (a, v, b) { return 'Lähim 110 kV alajaam on ' + a + ' ja lähim põhivõrgu ' + v + ' kV alajaam ' + b + '.'; },
      gridSame: function (a, v) { return 'Lähim 110 kV alajaam on ' + a + ' ja see on ühtlasi põhivõrgu ' + v + ' kV alajaam.'; },
      park: function (n, a) { return 'Lähim suur salvestipark on ' + n + ', ' + a + '.'; },
      queue: 'Teie liitumise taha paigaldatud salvesti ei vaja uut põhivõrguliitumist.',
      same: { FI: 'Börsihind ja reserviturg on kogu Soomes samad.', EE: 'Börsihind ja reserviturg on kogu Eestis samad.' },
      dep: 'Asukohast sõltuvad teie võrguettevõtja võrgutasud ja liitumise tingimused. Need võtame kirjalikus hinnangus arvesse koos teie tunniandmetega.',
      cta: 'Küsi hinnangut selle objekti kohta', src: 'Allikad', osm: 'OpenStreetMapi kaastöölised (ODbL 1.0)'
    }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function km(lon1, lat1, lon2, lat2) {
    var r = Math.PI / 180, dl = (lat2 - lat1) * r, dn = (lon2 - lon1) * r;
    var h = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dn / 2) * Math.sin(dn / 2);
    return 6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function inRing(x, y, ring) {
    var ins = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var a = ring[i], b = ring[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins;
    }
    return ins;
  }
  function country(lon, lat) {
    if (lat > 57.5 && lat < 59.75 && lon > 21.6 && lon < 28.3) return 'EE';
    if (lat >= 59.75 && lat < 70.1 && lon > 19.4 && lon < 31.6) return 'FI';
    return null;
  }
  function nearest(lon, lat, test) {
    var best = { k: Infinity, i: -1 };
    for (var i = 0; i < D.subs.length; i++) { var s = D.subs[i]; if (test(s)) { var k = km(lon, lat, s[0], s[1]); if (k < best.k) best = { k: k, i: i }; } }
    return best;
  }
  function css() {
    if (document.getElementById('kp-css')) return;
    var st = document.createElement('style');
    st.id = 'kp-css';
    st.textContent = '.kp{margin:14px 0 0;max-width:46rem;padding:14px 16px 16px;border:1px solid rgba(212,181,116,.38);border-radius:10px;background:rgba(212,181,116,.07);font-size:15px;line-height:1.55;text-align:left}' +
      '.kp h3{margin:0 0 4px;font:600 12.5px/1.3 var(--font-body,inherit);letter-spacing:.07em;text-transform:uppercase;color:#D4B574}' +
      '.kp p{margin:7px 0 0}.kp b{font-weight:600}.kp .kp-s{font-size:12.5px;line-height:1.5;opacity:.78}.kp .kp-s a{color:inherit;text-decoration:underline}' +
      '.kp .btn{margin-top:12px}';
    document.head.appendChild(st);
  }
  function show(host, lon, lat, opt) {
    if (!host || !D) return;
    opt = opt || {};
    var lang = (opt.lang || document.documentElement.lang || 'fi').slice(0, 2) === 'et' ? 'et' : 'fi', X = T[lang];
    var box = host.querySelector('.kp');
    if (!box) {
      box = document.createElement('section'); box.className = 'kp'; box.setAttribute('aria-live', 'polite');
      if (opt.before && opt.before.parentNode === host) host.insertBefore(box, opt.before); else host.appendChild(box);
    }
    css();
    var c = country(lon, lat), h = ['<h3>' + esc(X.h) + '</h3>'], src = [];
    var addSrc = function (s) { if (s && !src.some(function (q) { return q.url === s.url; })) src.push(s); };
    if (!c) { box.innerHTML = h.join('') + '<p>' + esc(X.out) + '</p>'; return; }
    if (c === 'FI') {
      for (var i = 0; i < D.regions.length; i++) {
        var R = D.regions[i];
        if (R.rings.some(function (rg) { return inRing(lon, lat, rg); })) {
          h.push('<p><b>' + esc(R.lab[lang]) + ':</b> ' + esc(R.val[lang]) + '.' + (R.cls === 'restrict' ? ' ' + esc(X.queue) : '') + '</p>');
          addSrc(R.src);
          break;
        }
      }
    }
    // asemat [lon, lat, jänniteluokka kV, maa, 110 kV:n taso OSM:n voltage-tagissa 1/0]
    var n110 = nearest(lon, lat, function (s) { return s[4] === 1; });
    var nm = nearest(lon, lat, function (s) { return c === 'FI' ? (s[3] === 'FI' && s[2] >= 220) : (s[3] === 'EE' && s[2] >= 330); });
    if (n110.i >= 0 && nm.i >= 0) {
      var vm = D.subs[nm.i][2];
      h.push('<p>' + esc(n110.i === nm.i ? X.gridSame(X.dist(nm.k), vm) : X.grid(X.dist(n110.k), vm, X.dist(nm.k))) + '</p>');
      addSrc(D.osm);
    }
    if (c === 'EE' && D.parks.length) {   // vain, jos puisto on alle 80 km:n päässä: kaukainen puisto ei kerro paikasta mitään
      var bp = null, bk = Infinity;
      D.parks.forEach(function (p) { if (p.c !== 'EE') return; var k = km(lon, lat, p.p[0], p.p[1]); if (k < bk) { bk = k; bp = p; } });
      if (bp && bk <= 80) { h.push('<p>' + esc(X.park(bp.t[lang].replace(/ · (.+)$/, ' ($1)'), X.dist(bk))) + '</p>'); addSrc(bp.src); }
    }
    h.push('<p>' + esc(X.same[c]) + ' ' + esc(X.dep) + '</p>');
    if (opt.cta) h.push('<a class="btn btn-primary" href="' + esc(opt.cta) + '">' + esc(X.cta) + '</a>');
    if (src.length) h.push('<p class="kp-s">' + esc(X.src) + ': ' + src.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(/openstreetmap/.test(s.url) ? X.osm : s.pub) + '</a> · ' + esc(s.date); }).join('; ') + '</p>');
    box.innerHTML = h.join('');
  }
  window.SAMA_PAIKKA = { show: show, data: D };
})();
