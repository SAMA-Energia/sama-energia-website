/* SAMA Energia — "Teie objekti asukohas / Kohteenne sijainnissa" -kortti, osoitehaku ja lähikartta (5.–6.11.2026).
   GENEROITU: python3 scripts/kaart/build_paikka.py (pohja paikka.tpl.js + aineisto kartta-pohja.json, kartta-110.json,
   kartta-data.json, docs/kaart/osm, docs/kaart/lahteet). Älä muokkaa assets/kartta-paikka.js:ää käsin.
   Kun lukija on valinnut liittymänsä paikan (osoite, painike tai napautus kartalla), kortti kertoo, mikä siinä paikassa on totta:
   lähimmät sähköasemat nimeltä (OSM), todennäköinen verkkoyhtiö, Fingridin liittymissopimushakemuksen raja (1.6.2026),
   Suomen aluerajoitus tai vapaa kapasiteetti (Fingrid), aurinkotuotto (EU JRC PVGIS oman palvelimen kautta), suuret hankkeet
   50 km:n säteellä (kartta-solmut.json), tehomaksun säästölaskuri ja lähikartta (Maa- ja Ruumiamet / Maanmittauslaitos
   oman palvelimen kautta). Mitään ei tallenneta; lomakkeeseen paikka menee vain lukijan omasta painalluksesta.
   Rajapinta: window.SAMA_PAIKKA.show(isäntä, lon, lat, { cta, before, label }), .search(form, onPick). */
(function () {
  'use strict';
  if (window.SAMA_PAIKKA) return;
  var D = /*DATA*/null;
  var API = '/api/paikka', SOLMUT = '/assets/kartta-solmut.json';
  var T = {
    fi: {
      h: 'Kohteenne sijainnissa', out: 'Kartta kattaa Suomen ja Viron. Valitkaa kohta maalta.',
      addr: 'Valittu osoite', pt: 'Valittu kohta',
      sGrid: 'Verkko', sRule: 'Liittyminen', sSun: 'Aurinko', sFee: 'Tehomaksu', sNear: 'Lähellä, alle 50 km', sSame: 'Mikä ei riipu paikasta',
      dist: function (k) { return k < 1 ? 'alle kilometrin päässä' : 'noin ' + Math.round(k) + ' km:n päässä'; },
      unnamed: 'nimetön asema',
      s110: function (n, d) { return 'Lähin 110 kV:n sähköasema: ' + n + ', ' + d + '.'; },
      smain: function (v, n, d) { return 'Lähin kantaverkon ' + v + ' kV:n asema: ' + n + ', ' + d + '.'; },
      ssame: function (v, n, d) { return 'Lähin 110 kV:n sähköasema on myös kantaverkon ' + v + ' kV:n asema: ' + n + ', ' + d + '.'; },
      dso: function (o) { return 'Todennäköinen verkkoyhtiö: ' + o + ' (lähimmän jakeluaseman haltija OpenStreetMapissa; vahvistamme arviossa).'; },
      ltaS: 'Fingrid 1.6.2026: tällä alueella liittymissopimushakemus tarvitaan jo 1 MW:n sähkövarastosta (muualla Suomessa 2 MW:sta).',
      ltaSP: 'Fingrid 1.6.2026: tällä alueella liittymissopimushakemus tarvitaan jo 1 MW:n sähkövarastosta ja tuotannosta (muualla Suomessa 2 MW:sta).',
      ltaN: 'Fingrid 1.6.2026: liittymissopimushakemus tarvitaan vähintään 2 MW:n sähkövarastosta, kulutuksesta ja tuotannosta.',
      ltaTail: ' Rajan alle jäävä varasto liittymän takana ei tarvitse Fingridin hakemusta; suuremmasta hakemuksen lähettää verkkoyhtiönne.',
      edge: ' Kohde on alueen rajan tuntumassa; tarkistamme rajan arviossa.',
      pvWait: 'Haetaan aurinkotuottoa…', pvFail: 'Aurinkotuottoa ei saatu juuri nyt.',
      pv: function (e, s) { return 'Noin ' + e + ' kWh vuodessa aurinkopaneelien kilowattipiikkiä kohden (kiinteä asennus ' + s + '° kulmassa etelään, häviöt 14 %).'; },
      feeIntro: 'Jos siirtotuotteessanne on tehomaksu, laskekaa säästö hinnaston luvulla:',
      feeA: 'Tehomaksu, €/kW kuukaudessa', feeB: 'Huipun leikkaus, kW',
      fee: function (x) { return 'Säästö noin ' + x + ' € vuodessa (tehomaksu × kW × 12).'; },
      near: function (n, k, st, mw, d) { return n + ' · ' + k + ' · ' + st + (mw ? ' · ' + mw : '') + ' · ' + d; },
      nearNone: 'Ei suuria hankkeita 50 km:n säteellä kartta-aineistossa.',
      same: { FI: 'Pörssihinta ja reservimarkkina ovat samat koko Suomessa.', EE: 'Pörssihinta ja reservimarkkina ovat samat koko Virossa.' },
      dep: 'Paikka vaikuttaa siirtohintoihin ja liittymän ehtoihin. Ne lasketaan kirjallisessa arviossa tuntitietojenne kanssa.',
      cta: 'Vie paikka arviopyyntöön', src: 'Lähteet', osm: 'OpenStreetMap-tekijät (ODbL 1.0)',
      attrEE: '© Maa- ja Ruumiamet', attrFI: '© Maanmittauslaitos', mapAlt: 'Lähikartta: valittu kohta ja lähimmät sähköasemat',
      q: 'Kohteen osoite', ph: 'Osoite, esim. Teollisuustie 5, Seinäjoki', go: 'Hae',
      none: 'Osoitetta ei löytynyt. Kokeilkaa kuntaa tai valitkaa kohta kartalta.', nofi: 'Suomen osoitehaku avautuu pian. Valitkaa kohta kartalta.',
      fail: 'Haku ei onnistunut. Valitkaa kohta kartalta.', wait: 'Haetaan…'
    },
    et: {
      h: 'Teie objekti asukohas', out: 'Kaart katab Eestit ja Soomet. Valige koht maismaal.',
      addr: 'Valitud aadress', pt: 'Valitud koht',
      sGrid: 'Võrk', sRule: 'Liitumine', sSun: 'Päike', sFee: 'Võimsustasu', sNear: 'Lähedal, alla 50 km', sSame: 'Mis ei sõltu asukohast',
      dist: function (k) { return k < 1 ? 'alla kilomeetri kaugusel' : 'umbes ' + Math.round(k) + ' km kaugusel'; },
      unnamed: 'nimeta alajaam',
      s110: function (n, d) { return 'Lähim 110 kV alajaam: ' + n + ', ' + d + '.'; },
      smain: function (v, n, d) { return 'Lähim põhivõrgu ' + v + ' kV alajaam: ' + n + ', ' + d + '.'; },
      ssame: function (v, n, d) { return 'Lähim 110 kV alajaam on ühtlasi põhivõrgu ' + v + ' kV alajaam: ' + n + ', ' + d + '.'; },
      dso: function (o) { return 'Tõenäoline võrguettevõtja: ' + o + ' (lähima jaotusalajaama valdaja OpenStreetMapis; kinnitame hinnangus).'; },
      ltaS: 'Fingrid 1.6.2026: selles piirkonnas on liitumislepingu taotlus vajalik juba 1 MW salvestilt (mujal Soomes 2 MW-lt).',
      ltaSP: 'Fingrid 1.6.2026: selles piirkonnas on liitumislepingu taotlus vajalik juba 1 MW salvestilt ja tootmiselt (mujal Soomes 2 MW-lt).',
      ltaN: 'Fingrid 1.6.2026: liitumislepingu taotlus on vajalik vähemalt 2 MW salvestilt, tarbimiselt ja tootmiselt.',
      ltaTail: ' Piirist väiksem salvesti liitumise taga Fingridi taotlust ei vaja; suurema puhul saadab taotluse teie võrguettevõtja.',
      edge: ' Objekt on piirkonna piiri lähedal; kontrollime piiri hinnangus.',
      pvWait: 'Laeb päikesetoodangut…', pvFail: 'Päikesetoodangut ei õnnestunud praegu saada.',
      pv: function (e, s) { return 'Umbes ' + e + ' kWh aastas päikesepaneelide kilovatt-tipu kohta (fikseeritud paigaldus ' + s + '° nurga all lõunasse, kaod 14%).'; },
      feeIntro: 'Kui teie võrgupaketis on võimsustasu, arvutage sääst hinnakirja numbriga:',
      feeA: 'Võimsustasu, €/kW kuus', feeB: 'Tipu vähendamine, kW',
      fee: function (x) { return 'Sääst umbes ' + x + ' € aastas (võimsustasu × kW × 12).'; },
      near: function (n, k, st, mw, d) { return n + ' · ' + k + ' · ' + st + (mw ? ' · ' + mw : '') + ' · ' + d; },
      nearNone: 'Kaardiandmetes pole 50 km raadiuses suuri projekte.',
      same: { FI: 'Börsihind ja reserviturg on kogu Soomes samad.', EE: 'Börsihind ja reserviturg on kogu Eestis samad.' },
      dep: 'Asukoht mõjutab võrgutasusid ja liitumise tingimusi. Need arvutame kirjalikus hinnangus koos teie tunniandmetega.',
      cta: 'Vii asukoht hinnangu päringusse', src: 'Allikad', osm: 'OpenStreetMapi kaastöölised (ODbL 1.0)',
      attrEE: '© Maa- ja Ruumiamet', attrFI: '© Maanmittauslaitos', mapAlt: 'Lähikaart: valitud koht ja lähimad alajaamad',
      q: 'Objekti aadress', ph: 'Aadress, nt Tööstuse 5, Rapla', go: 'Otsi',
      none: 'Aadressi ei leitud. Proovige omavalitsuse nime või valige koht kaardil.', nofi: 'Soome aadressiotsing avaneb peagi. Valige koht kaardil.',
      fail: 'Otsing ebaõnnestus. Valige koht kaardil.', wait: 'Otsin…'
    }
  };
  /* jakeluverkkoyhtiöksi ei tulkita kantaverkkoa, rataverkkoa, alueverkkoa eikä tuottajaa (OSM:n operator-tagi) */
  /* lähimmäksi 110 kV:n asemaksi ei lasketa rata- eikä tuotantolaitoksen omaa asemaa: niihin asiakas ei liity */
  var NOT_GRID = /Väylävirasto|Raudtee|OX2|Tuuliwatti|Tuuli\b|Kraft Ab|wind|solar/i;
  var NOT_DSO = /Fingrid|Elering|Väylävirasto|Raudtee|EPV Alueverkko|Fortum|OX2|Kraft Ab|Tuuliwatti|Kemijoki|Tuuli\b|Eesti Energia|Kraftnät|Inergia|wind|solar/i;
  function lang() { return (document.documentElement.lang || 'fi').slice(0, 2) === 'et' ? 'et' : 'fi'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(n) { return String(n).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
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
  /* etäisyys (km) monikulmion reunaan — rajan tuntumassa ±5 km:n georeferoinnin takia */
  function edgeKm(lon, lat, ring) {
    var best = Infinity, kx = Math.cos(lat * Math.PI / 180) * 111.32, ky = 110.57;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var ax = (ring[j][0] - lon) * kx, ay = (ring[j][1] - lat) * ky, bx = (ring[i][0] - lon) * kx, by = (ring[i][1] - lat) * ky;
      var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L)) : 0;
      var px = ax + t * dx, py = ay + t * dy, d = Math.sqrt(px * px + py * py);
      if (d < best) best = d;
    }
    return best;
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
  function dsoOf(s) {
    var ops = String(s[6] || '').split(/\s*;\s*/).filter(function (o) { return o && !NOT_DSO.test(o); });
    return ops.length ? ops[0].replace(/\s+(Oy|Oyj|Ab|AS|OÜ)$/i, '') : '';
  }
  function subName(s, X) { var n = s[5] || X.unnamed, o = String(s[6] || '').split(/\s*;\s*/)[0]; return n + (o && n.indexOf(o) < 0 ? ' (' + o + ')' : ''); }
  function css() {
    if (document.getElementById('kp-css')) return;
    var st = document.createElement('style');
    st.id = 'kp-css';
    st.textContent = '.kp{margin:14px 0 0;max-width:46rem;padding:14px 16px 16px;border:1px solid rgba(212,181,116,.38);border-radius:10px;background:rgba(212,181,116,.07);font-size:15px;line-height:1.55;text-align:left}' +
      '.kp h3{margin:0 0 4px;font:600 12.5px/1.3 var(--font-body,inherit);letter-spacing:.07em;text-transform:uppercase;color:#D4B574}' +
      '.kp h4{margin:12px 0 0;font:600 12px/1.3 var(--font-body,inherit);letter-spacing:.06em;text-transform:uppercase;opacity:.72}' +
      '.kp p{margin:6px 0 0}.kp b{font-weight:600}.kp .kp-a{font-weight:600}.kp .kp-s{font-size:12.5px;line-height:1.5;opacity:.78}.kp .kp-s a,.kp .kp-n a{color:inherit;text-decoration:underline}' +
      '.kp ul{margin:6px 0 0;padding:0 0 0 18px}.kp li{margin:2px 0}.kp .btn{margin-top:14px}' +
      '.kp-map{position:relative;height:230px;margin:10px 0 0;overflow:hidden;border-radius:8px;background:#141310;border:1px solid rgba(212,181,116,.22)}' +
      '.kp-map img{position:absolute;width:256px;height:256px;max-width:none;filter:grayscale(1) invert(1) brightness(.72) contrast(.95) sepia(.28);user-select:none;pointer-events:none}' +
      '.kp-map svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.kp-map text{font:600 11px var(--font-body,sans-serif);fill:#F3EEE1;paint-order:stroke;stroke:#141310;stroke-width:3px}' +
      '.kp-map small{position:absolute;right:6px;bottom:4px;font-size:10px;color:#CFC8B8;background:rgba(20,19,16,.7);padding:0 4px;border-radius:3px}' +
      '.kp-map .kp-sc{position:absolute;left:8px;bottom:6px;font-size:10px;color:#CFC8B8}.kp-map .kp-sc i{display:block;height:4px;border:1px solid #CFC8B8;border-top:0;margin-bottom:2px}' +
      '.kp-fee{display:flex;flex-wrap:wrap;gap:8px 12px;margin:8px 0 0}.kp-fee label{display:flex;flex-direction:column;gap:3px;font-size:12.5px;opacity:.9}' +
      '.kp-fee input{width:9.5em;padding:7px 9px;border-radius:6px;border:1px solid rgba(212,181,116,.4);background:rgba(0,0,0,.25);color:inherit;font:inherit}' +
      '.kk-addr{position:relative;display:flex;gap:8px;flex-wrap:wrap;width:100%;max-width:34rem}.kk-addr input{flex:1 1 14rem;min-width:0;padding:10px 12px;border-radius:8px;border:1px solid rgba(212,181,116,.45);background:rgba(0,0,0,.28);color:inherit;font:inherit}' +
      '.kk-addr ul{position:absolute;left:0;right:0;top:100%;z-index:20;margin:4px 0 0;padding:4px;list-style:none;border-radius:8px;background:#1b1915;border:1px solid rgba(212,181,116,.4);box-shadow:0 10px 30px rgba(0,0,0,.4)}' +
      '.kk-addr li button{display:block;width:100%;padding:8px 10px;text-align:left;background:none;border:0;border-radius:6px;color:#F3EEE1;font:inherit;font-size:14px;cursor:pointer}' +
      '.kk-addr li button:hover,.kk-addr li button:focus{background:rgba(212,181,116,.16);outline:none}.kk-addr li small{opacity:.65;margin-left:6px}.kk-addr p{width:100%;margin:2px 0 0;font-size:13px;opacity:.8}' +
      '.kk-addr ul[hidden],.kk-addr p[hidden]{display:none}';
    document.head.appendChild(st);
  }

  /* ---------- osoitehaku (oma palvelin → Maa- ja Ruumiamet / Maanmittauslaitos) ---------- */
  function search(form, onPick) {
    if (!form || form._kp) return;
    form._kp = 1;
    css();
    var L = lang(), X = T[L], inp = form.querySelector('input'), ul = form.querySelector('ul'), msg = form.querySelector('p');
    if (!ul) { ul = document.createElement('ul'); ul.hidden = true; ul.setAttribute('role', 'list'); form.appendChild(ul); }
    if (!msg) { msg = document.createElement('p'); msg.hidden = true; msg.setAttribute('role', 'status'); form.appendChild(msg); }
    var seq = 0, timer = 0, last = '';
    function say(t) { msg.textContent = t || ''; msg.hidden = !t; }
    function run(force) {
      var q = inp.value.trim();
      if (q.length < 3 || (!force && q === last)) return;
      last = q;
      var my = ++seq;
      say(X.wait);
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ op: 'haku', q: q, lang: L }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (my !== seq) return;
          var res = d.results || [];
          ul.innerHTML = '';
          if (!res.length) { ul.hidden = true; say(!d.fi && L === 'fi' ? X.nofi : X.none); return; }
          say('');
          res.forEach(function (r) {
            var li = document.createElement('li'), b = document.createElement('button');
            b.type = 'button';
            b.textContent = r.t;
            var sm = document.createElement('small'); sm.textContent = r.c; b.appendChild(sm);
            b.addEventListener('click', function () { ul.hidden = true; inp.value = r.t; last = r.t; onPick(r); });
            li.appendChild(b); ul.appendChild(li);
          });
          ul.hidden = false;
        })
        .catch(function () { if (my === seq) { ul.hidden = true; say(X.fail); } });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); run(true); });
    inp.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { run(false); }, 450); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { ul.hidden = true; } if (e.key === 'ArrowDown' && !ul.hidden) { var f = ul.querySelector('button'); if (f) { e.preventDefault(); f.focus(); } } });
    ul.addEventListener('keydown', function (e) {
      var bs = [].slice.call(ul.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i < bs.length - 1) { e.preventDefault(); bs[i + 1].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? bs[i - 1] : inp).focus(); }
      if (e.key === 'Escape') { ul.hidden = true; inp.focus(); }
    });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) ul.hidden = true; });
  }

  /* ---------- lähikartta: Web Mercator -ruudut oman palvelimen kautta, merkit SVG:nä ---------- */
  function wx(lon, z) { return (lon + 180) / 360 * 256 * Math.pow(2, z); }
  function wy(lat, z) { var s = Math.sin(lat * Math.PI / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256 * Math.pow(2, z); }
  function lmap(box, lon, lat, c, marks, X) {
    var W = box.clientWidth || 320, H = box.clientHeight || 230, z = 15;
    var fitPts = marks.filter(function (m) { return m.fit; });
    for (; z > 7; z--) {
      var cx0 = wx(lon, z), cy0 = wy(lat, z), ok = fitPts.every(function (m) { return Math.abs(wx(m.p[0], z) - cx0) < W / 2 - 34 && Math.abs(wy(m.p[1], z) - cy0) < H / 2 - 22; });
      if (ok) break;
    }
    var cx = wx(lon, z), cy = wy(lat, z), ox = cx - W / 2, oy = cy - H / 2, h = [];
    var tx0 = Math.floor(ox / 256), tx1 = Math.floor((ox + W) / 256), ty0 = Math.floor(oy / 256), ty1 = Math.floor((oy + H) / 256);
    for (var tx = tx0; tx <= tx1; tx++) for (var ty = ty0; ty <= ty1; ty++) {
      h.push('<img alt="" loading="lazy" decoding="async" src="/api/ruutu/' + (c === 'EE' ? 'ee' : 'fi') + '/' + z + '/' + tx + '/' + ty + '.png" style="left:' + Math.round(tx * 256 - ox) + 'px;top:' + Math.round(ty * 256 - oy) + 'px">');
    }
    var sv = ['<svg role="img" aria-label="' + esc(X.mapAlt) + '">'];
    marks.forEach(function (m) {
      var x = wx(m.p[0], z) - ox, y = wy(m.p[1], z) - oy;
      if (x < -10 || y < -10 || x > W + 10 || y > H + 10) return;
      if (m.k === 'sub') sv.push('<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="8" height="8" fill="#D4B574" stroke="#141310" stroke-width="1.5"/>');
      else if (m.k === 'nd') sv.push('<circle cx="' + x + '" cy="' + y + '" r="5" fill="none" stroke="#E9E2D2" stroke-width="2"/>');
      if (m.t) sv.push('<text x="' + (x + (x > W - 120 ? -9 : 9)) + '" y="' + (y + 4) + '"' + (x > W - 120 ? ' text-anchor="end"' : '') + '>' + esc(m.t) + '</text>');
    });
    var sx = W / 2, sy = H / 2;
    sv.push('<circle cx="' + sx + '" cy="' + sy + '" r="16" fill="rgba(212,181,116,.18)"/><circle cx="' + sx + '" cy="' + sy + '" r="6.5" fill="#D4B574" stroke="#141310" stroke-width="2"/></svg>');
    /* mittakaava: noin 70 px pyöreä matka */
    var mpp = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, z), want = mpp * 70, steps = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000], m2 = steps.filter(function (s) { return s <= want; }).pop() || 100;
    var sc = '<span class="kp-sc"><i style="width:' + Math.round(m2 / mpp) + 'px"></i>' + (m2 >= 1000 ? m2 / 1000 + ' km' : m2 + ' m') + '</span>';
    box.innerHTML = h.join('') + sv.join('') + sc + '<small>' + esc(c === 'EE' ? X.attrEE : X.attrFI) + ' · ' + esc(X.osm) + '</small>';
    [].forEach.call(box.querySelectorAll('img'), function (im) { im.addEventListener('error', function () { im.remove(); }); });   // ei ruutua (esim. avain puuttuu) → tumma pohja ja merkit jäävät
  }

  /* ---------- solmut (suuret hankkeet lähellä) ---------- */
  var solmut = null;
  function getSolmut() {
    if (window.SAMA_KS) return Promise.resolve(window.SAMA_KS);
    if (!solmut) solmut = fetch(SOLMUT, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { solmut = null; return null; });
    return solmut;
  }
  function pvInfo(lon, lat) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ op: 'pv', lon: lon, lat: lat }) })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); });
  }

  /* ---------- lomake: paikka näkyvään kenttään vain lukijan painalluksesta ---------- */
  function prefill(txt, base) {
    var f = document.getElementById('f-place-a');
    if (f) {
      f.value = txt;
      var sec = f.closest('section') || f;
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }, 700);
      return;
    }
    /* lomake on etusivulla: .ee-hostilla ET-etusivu on "/", esikatselussa "/et/" */
    var home = location.pathname.indexOf('/et/') === 0 ? '/et/' : '/', id = lang() === 'et' ? 'hindamine' : 'kartoitus';
    location.href = home + '#' + id + '&p=' + encodeURIComponent(txt.slice(0, 200));
  }

  function show(host, lon, lat, opt) {
    if (!host || !D) return;
    opt = opt || {};
    var L = (opt.lang || lang()), X = T[L];
    var box = host.querySelector('.kp');
    if (!box) {
      box = document.createElement('section'); box.className = 'kp'; box.setAttribute('aria-live', 'polite');
      if (opt.before && opt.before.parentNode === host) host.insertBefore(box, opt.before); else host.appendChild(box);
    }
    css();
    var c = country(lon, lat), h = ['<h3>' + esc(X.h) + '</h3>'], src = [];
    var addSrc = function (s) { if (s && !src.some(function (q) { return q.url === s.url; })) src.push(s); };
    var place = opt.label || (num(lat.toFixed(4)) + '° N, ' + num(lon.toFixed(4)) + '° E');
    if (!c) { box.innerHTML = h.join('') + '<p>' + esc(X.out) + '</p>'; return; }
    h.push('<p><span class="kp-a">' + esc(opt.label ? X.addr : X.pt) + ':</span> ' + esc(place) + '</p>');
    h.push('<div class="kp-map"></div>');

    /* verkko: lähimmät asemat nimeltä ja todennäköinen verkkoyhtiö */
    h.push('<h4>' + esc(X.sGrid) + '</h4>');
    var n110 = nearest(lon, lat, function (s) { return s[4] === 1 && !NOT_GRID.test(s[6] || ''); });
    var nm = nearest(lon, lat, function (s) { return c === 'FI' ? (s[3] === 'FI' && s[2] >= 220) : (s[3] === 'EE' && s[2] >= 330); });
    var marks = [];
    if (n110.i >= 0) {
      var a = D.subs[n110.i];
      if (nm.i === n110.i) h.push('<p>' + esc(X.ssame(a[2], subName(a, X), X.dist(n110.k))) + '</p>');
      else {
        h.push('<p>' + esc(X.s110(subName(a, X), X.dist(n110.k))) + '</p>');
        if (nm.i >= 0) { var b = D.subs[nm.i]; h.push('<p>' + esc(X.smain(b[2], subName(b, X), X.dist(nm.k))) + '</p>'); if (nm.k < 40) marks.push({ k: 'sub', p: [b[0], b[1]], t: (b[5] || '') + ' ' + b[2] + ' kV', fit: nm.k < 25 }); }
      }
      marks.push({ k: 'sub', p: [a[0], a[1]], t: (a[5] || '') + ' ' + a[2] + ' kV', fit: true });
      addSrc(D.osm);
    }
    var dsoI = nearest(lon, lat, function (s) { return s[2] === 110 && s[3] === c && !!dsoOf(s); });
    if (dsoI.i >= 0 && dsoI.k < 25) h.push('<p>' + esc(X.dso(dsoOf(D.subs[dsoI.i]))) + '</p>');

    /* liittyminen: Fingridin hakemusraja (Suomi) ja alueen tilanne */
    if (c === 'FI') {
      h.push('<h4>' + esc(X.sRule) + '</h4>');
      var inS = D.lta.s1.some(function (r) { return inRing(lon, lat, r); }), inSP = D.lta.sp1.some(function (r) { return inRing(lon, lat, r); });
      var ek = Math.min.apply(null, D.lta.s1.concat(D.lta.sp1).map(function (r) { return edgeKm(lon, lat, r); }));
      h.push('<p>' + esc((inSP ? X.ltaSP : inS ? X.ltaS : X.ltaN) + X.ltaTail + (ek < 8 ? X.edge : '')) + '</p>');
      addSrc(D.lta.src); addSrc(D.lta.src2);
      for (var i = 0; i < D.regions.length; i++) {
        var R = D.regions[i];
        if (R.rings.some(function (rg) { return inRing(lon, lat, rg); })) { h.push('<p><b>' + esc(R.lab[L]) + ':</b> ' + esc(R.val[L]) + '.</p>'); addSrc(R.src); break; }
      }
    }
    if (c === 'EE' && D.parks.length) {
      var bp = null, bk = Infinity;
      D.parks.forEach(function (p) { if (p.c !== 'EE') return; var k = km(lon, lat, p.p[0], p.p[1]); if (k < bk) { bk = k; bp = p; } });
      if (bp && bk <= 80) { h.push('<p>' + esc(bp.t[L].replace(/ · (.+)$/, ' ($1)')) + ', ' + esc(X.dist(bk)) + '.</p>'); addSrc(bp.src); }
    }

    /* aurinko (PVGIS), tehomaksu, lähellä */
    h.push('<h4>' + esc(X.sSun) + '</h4><p class="kp-pv">' + esc(X.pvWait) + '</p>');
    h.push('<h4>' + esc(X.sFee) + '</h4><p>' + esc(X.feeIntro) + '</p><div class="kp-fee"><label>' + esc(X.feeA) + '<input type="text" inputmode="decimal" autocomplete="off" class="kp-fa"></label>' +
      '<label>' + esc(X.feeB) + '<input type="text" inputmode="decimal" autocomplete="off" class="kp-fb"></label></div><p class="kp-fr" aria-live="polite"></p>');
    h.push('<h4>' + esc(X.sNear) + '</h4><div class="kp-n"><p>…</p></div>');
    h.push('<h4>' + esc(X.sSame) + '</h4><p>' + esc(X.same[c]) + ' ' + esc(X.dep) + '</p>');
    h.push('<button type="button" class="btn btn-primary kp-go">' + esc(X.cta) + '</button>');
    h.push('<p class="kp-s"></p>');
    box.innerHTML = h.join('');
    var srcLine = function () {
      box.querySelector('.kp-s').innerHTML = esc(X.src) + ': ' + src.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(/openstreetmap/.test(s.url) ? X.osm : s.pub) + '</a> · ' + esc(s.date); }).join('; ');
    };
    srcLine();
    var mapBox = box.querySelector('.kp-map');
    lmap(mapBox, lon, lat, c, marks, X);
    var fa = box.querySelector('.kp-fa'), fb = box.querySelector('.kp-fb'), fr = box.querySelector('.kp-fr');
    var calc = function () {
      var a = parseFloat(String(fa.value).replace(',', '.')), b = parseFloat(String(fb.value).replace(',', '.'));
      fr.textContent = a > 0 && b > 0 ? X.fee(num(Math.round(a * b * 12))) : '';
    };
    fa.addEventListener('input', calc); fb.addEventListener('input', calc);
    box.querySelector('.kp-go').addEventListener('click', function () { prefill(place, opt.cta); });
    var stamp = box._kpStamp = Date.now();
    pvInfo(lon, lat).then(function (d) {
      if (box._kpStamp !== stamp) return;
      box.querySelector('.kp-pv').textContent = X.pv(num(d.ey), d.slope);
      addSrc({ pub: 'EU JRC PVGIS (' + d.db + (d.y0 ? ', ' + d.y0 + '–' + d.y1 : '') + ')', date: 'PVcalc 5.3', url: 'https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis_en' });
      srcLine();
    }).catch(function () { if (box._kpStamp === stamp) box.querySelector('.kp-pv').textContent = X.pvFail; });
    getSolmut().then(function (S) {
      if (box._kpStamp !== stamp) return;
      var nb = box.querySelector('.kp-n');
      if (!S) { nb.innerHTML = ''; return; }
      var list = S.items.filter(function (it) { return it.p && it.k !== 'link'; }).map(function (it) { return { it: it, d: km(lon, lat, it.p[0], it.p[1]) }; })
        .filter(function (q) { return q.d <= 50 && ((q.it.mw || q.it.mwit || 0) >= 10 || q.it.k === 'bess'); })
        .sort(function (a, b) { return a.d - b.d; }).slice(0, 4);
      if (!list.length) { nb.innerHTML = '<p>' + esc(X.nearNone) + '</p>'; return; }
      nb.innerHTML = '<ul>' + list.map(function (q) {
        var it = q.it, n = typeof it.n === 'string' ? it.n : it.n[L], mw = it.mw != null ? num(it.mw) + ' MW' : (it.mwit != null ? 'IT ' + num(it.mwit) + ' MW' : '');
        var sq = S.sources[it.src];
        if (sq) addSrc({ pub: sq.pub, date: sq.date, url: sq.url });
        return '<li>' + (it.u ? '<a href="' + esc(it.u) + '" target="_blank" rel="noopener">' + esc(n) + '</a>' : esc(n)) + ' · ' + esc(S.kind[it.k][L]) + (it.o ? ' · ' + esc(it.o) : '') + ' · ' + esc(S.status[it.s][L]) + (mw ? ' · ' + esc(mw) : '') + ' · ' + esc(X.dist(q.d)) + '</li>';
      }).join('') + '</ul>';
      srcLine();
      lmap(mapBox, lon, lat, c, marks.concat(list.filter(function (q) { return q.d < 15; }).map(function (q) { return { k: 'nd', p: q.it.p, t: '' }; })), X);
    });
  }
  window.SAMA_PAIKKA = { show: show, search: search, prefill: prefill, data: D };
})();
