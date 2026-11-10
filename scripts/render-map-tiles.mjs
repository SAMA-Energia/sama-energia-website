#!/usr/bin/env node
/**
 * SAMA Energia — etusivun karttaluvun (.k-kaart) tasokuvat kk-{fi,ee}-{d,m}0–6.webp elävästä karttamoottorista.
 *
 * Kuvat näytetään, kun liike on vähennetty (prefers-reduced-motion) tai JS puuttuu. Ne renderöidään samalla
 * moottorilla kuin elävä luku (assets/scene.js / scene-et.js, _mapDraw .k-live-tilassa): rajaus kartta-data.json:n
 * näkymistä (views, kerroksen view, viimeinen luku vmode: scroll), aina verkko + askeleen kerros (sama kuin
 * ohjaimen setMapLayers), 110 kV, saaret ja rantaviivat kartta-etusivu.json:sta, 400/330 kV kartta-verkko.json:sta,
 * kotimaa isona (FI-sivu Suomi, ET-sivu Viro). Kuvaan piirtyvät luvut ovat kartta-data.json:n pin-tekstejä —
 * moottori ei piirrä muita lukuja. Moottoria ei muuteta: skripti pysäyttää sen piirtosilmukan, asettaa askeleen
 * tilan (kuten K2-ohjain) ja kutsuu _mapDraw-funktiota kerran ajalla t = 6 s (sama kuin moottorin reduced-motion-aika).
 *
 * Koot (samat kuin ennen): työpöytä 2160×1230 = koko osio 1440×820 css-px @1,5 — kartta osuu samaan kohtaan kuin
 * elävässä luvussa, jossa kanvaasi on osion oikealla 66 %:lla (left:34 %); kanvaasin vasemmalle puolelle jatkuva kartta
 * häivytetään 170 css-px:n matkalla taustaan (tekstipalsta tyhjä kuten elävässä luvussa, ei kanvaasin reunaa).
 * Puhelin FI 780×1040 (390×520 @2), ET 780×680 (390×340 @2) kuten aiemmin.
 * Viimeinen askel (Teidän liittymänne / Teie liitumine) kuvataan lopputilassa (zoomattu kohteeseen, _mapP = 1).
 * Päällekkäiset tarrat (elävä kanvaasi piirtää ne tässä koossa päällekkäin, esim. FI Varastot: vyöhykkeen tarra
 * Fenno-Skanin päällä) ratkaistaan tärkeyden mukaan: kohde > askeleen kerros > verkkokerros > sähköasema; alempi jää
 * pois kuvasta. Tulostus kertoo jokaisen pois jätetyn tarran.
 *
 * Ajo repon juuresta:  node scripts/render-map-tiles.mjs [--preview /polku/png] [--alt /polku/tiles]
 *   --alt kirjoittaa /polku/tiles.drawn.json: jokaisen kuvan piirretyt tarrat, sähköasemat ja pois jätetyt (alt-tekstejä varten).
 * Riippuvuudet: require('playwright') (globaali), chromium.launch() ilman valintoja. Ei repo-riippuvuuksia.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const PREVIEW = opt('preview', null), ALT_OUT = opt('alt', null);
const { chromium } = createRequire(import.meta.url)('playwright');

const MAPK = ['vork', 'tarbimine', 'tootmine', 'salvestid', 'reservid', 'tulevik', 'site'];   // = K2-ohjaimen MAPK
const VARIANTS = {
  // budjetti: 60 kt työpöytä, 46 kt puhelin (110 kV -verkko ja pisterasteri vievät tavuja; tarrat terävät jo q64:llä).
  // Laatu haetaan q86 → q56: 8.11.2026 FI Tulossa -puhelinkuva (solmut 6.11.) ei mahtunut 46 kt:hen q64:llä (46,8 kt), q62 mahtuu;
  // 9.11.2026 FI Kasvu -puhelinkuva (datakeskusten nimet takaisin, Madis) 46,6 kt q60:llä → q58 mahtuu.
  fi: [{ key: 'd', css: [1440, 820], dpr: 1.5, live: 0.34, max: 60000 }, { key: 'm', css: [390, 520], dpr: 2, live: 0, max: 46000 }],
  et: [{ key: 'd', css: [1440, 820], dpr: 1.5, live: 0.34, max: 60000 }, { key: 'm', css: [390, 340], dpr: 2, live: 0, max: 46000 }],
};
const FILE = { fi: 'kk-fi', et: 'kk-ee' };

/* ---------- palvelin: repo juuri + harjoitussivu ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp' };
function harness(lang, w, h, x0) {
  // Kanvaasi on elävän luvun kokoinen ja paikkainen (työpöydällä osion oikea 66 %); .k-live = moottorin live-tila.
  // Kanvaasi kattaa koko kuvan; moottori piirtää elävän kanvaasin koordinaateissa (x0 = sen vasen reuna), ks. drawStep.
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/fonts.css">
<style>html,body{margin:0;background:#0A0A09;overflow:hidden}.k-live{position:relative;width:${w}px;height:${h}px}
.kk-maps{position:absolute;inset:0}canvas.cv-map{position:absolute;top:0;left:0;width:${w}px;height:${h}px;display:block}</style></head>
<body><section class="k-kaart k-live" data-live="map"><div class="kk-maps"><canvas class="cv-map"></canvas></div></section>
<script src="/assets/${lang === 'et' ? 'scene-et.js' : 'scene.js'}"></script></body></html>`;
}
function serve() {
  return new Promise((ok) => {
    const srv = createServer((req, res) => {
      const u = new URL(req.url, 'http://x');
      if (u.pathname === '/__kk.html') {
        const q = (k) => +u.searchParams.get(k);
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        return res.end(harness(u.searchParams.get('lang'), q('w'), q('h'), q('x0')));
      }
      const file = normalize(join(ROOT, decodeURIComponent(u.pathname)));
      if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(readFileSync(file));
    }).listen(0, '127.0.0.1', () => ok({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/* ---------- selaimessa: askeleen piirto + koonti + WebP ---------- */
async function drawStep(arg) {
  const { i, MAPK, W, H, dpr, x0, max, preview } = arg;
  const c = window.SAMA3D, el = document.querySelector('canvas.cv-map');
  const wAll = el.clientWidth, h = el.clientHeight, w = wAll - x0;   // w = elävän kanvaasin leveys (osion oikea 66 %)
  el.width = W; el.height = H;
  const g = el.getContext('2d');
  // sama tila kuin K2-ohjaimen step(): verkko aina + askeleen kerros, ei vertailua; viimeinen askel loppuun zoomattuna
  const o = {}; MAPK.forEach((k, j) => { o[k] = (j === 0 || j === i) ? 1 : 0; });
  c._mapCmp = false; c._mapCur = MAPK[i]; c._mapOn = {}; c.setMapLayers(o); c._mapP = i === MAPK.length - 1 ? 1 : 0;
  c._mapA = {}; c._mapV = null; c._mapT = undefined;      // ei siirtymää: alfat ja rajaus suoraan tavoitteeseen
  // Moottori piirtää elävän kanvaasin koordinaatistossa, siirrettynä sen paikalle (x0). Viivat ja maan täyttö jatkuvat
  // vasemmalle tekstin varjon alle; moottorin ulkopuolelle rajaamat maapisteet piirretään samalla tyylillä tässä,
  // jottei kuvaan jää elävän kanvaasin reunaa.
  const frame = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0A0A09'; g.fillRect(0, 0, W, H); g.setTransform(dpr, 0, 0, dpr, x0 * dpr, 0); };
  // 1. kutsu: tila tavoitteeseen, projektio talteen ja tarrojen laatikot mitattuna (sama mitoitus kuin moottorin label():
  //    teksti + 5 px reunat, 16 px korkea). Moottorin fillText-kutsut ovat vain tarroja ja OSM-lähdettä.
  const ft = g.fillText, fr = g.fillRect, boxes = [];
  g.fillText = function (t, x, y) { const tw = this.measureText(t).width, al = this.textAlign; let bx = x - 5; if (al === 'center') bx = x - tw / 2 - 5; if (al === 'right') bx = x - tw - 5; boxes.push({ n: boxes.length, t, x0: bx, x1: bx + tw + 10, y0: y - 8, y1: y + 8 }); return ft.apply(this, arguments); };
  frame(); c._mapDraw({ g, w, h, el }, 6);
  g.fillText = ft;
  // Päällekkäiset tarrat (elävä kanvaasi piirtää ne päällekkäin tässä koossa): kuvaan jää korkeamman tärkeyden tarra.
  // 3 = kohteen merkintä, 2 = askeleen oma kerros, 1 = aina näkyvä verkkokerros, 0 = sähköaseman nimi (zoomattuna).
  const KD = c._kd, lang = c._mapLang(), Lsite = KD.layers[KD.layers.length - 1];
  const txt = (L) => L.pins.map((p) => p.t[lang]);
  const pri = (t) => /OpenStreetMap/.test(t) ? 9 : [Lsite.name[lang], 'AKKU · AURINKO · OHJAUS', 'AKU · PÄIKE · JUHTIMINE'].includes(t) ? 3
    : txt(KD.layers[i]).includes(t) ? 2 : txt(KD.layers[0]).includes(t) ? 1 : 0;
  const order = boxes.slice().sort((A, B) => pri(B.t) - pri(A.t) || B.t.length - A.t.length || A.n - B.n), kept = [], hide = new Set(), hidden = [];
  for (const A of order) { if (kept.some((B) => A.x0 < B.x1 && B.x0 < A.x1 && A.y0 < B.y1 && B.y0 < A.y1)) { hide.add(A.n); hidden.push(A.t); } else kept.push(A); }
  // 2. kutsu samassa tilassa ja ajassa = sama kuva; piilotettavan tarran tausta ja teksti jätetään pois
  frame();
  if (x0 > 0) {   // moottori rajaa maapisteet elävän kanvaasin reunaan; vasemmalle jatkuvat pisteet samalla tyylillä
    const P = c._mapProj, home = c._mapHome(), sc = (P([1, 0])[0] - P([0, 0])[0]) / c._map.aspect, dsz = Math.max(1.2, Math.min(3, sc / 520));
    for (const d of c._dots) { const s = P(d); if (s[0] >= -4 || s[0] < -x0 - 4 || s[1] < -4 || s[1] > h + 4) continue; g.fillStyle = (d[2] ? 'ee' : 'fi') === home ? 'rgba(212,181,116,0.2)' : 'rgba(243,238,225,0.12)'; g.fillRect(s[0] - dsz / 2, s[1] - dsz / 2, dsz, dsz); }
  }
  const tmp = document.createElement('canvas').getContext('2d'); tmp.fillStyle = 'rgba(10,10,9,0.78)'; const LBG = tmp.fillStyle;
  let pend = null, k = 0;
  g.fillRect = function (a, b, cw, ch) { if (this.fillStyle === LBG) { pend = [a, b, cw, ch]; return; } return fr.apply(this, arguments); };
  g.fillText = function () {
    const hideIt = hide.has(k++);
    if (pend) { if (!hideIt) { const fs = this.fillStyle; this.fillStyle = LBG; fr.apply(this, pend); this.fillStyle = fs; } pend = null; }
    if (hideIt) return; return ft.apply(this, arguments);
  };
  c._mapDraw({ g, w, h, el }, 6);
  g.fillText = ft; g.fillRect = fr;
  // Elävän kanvaasin vasemmalla puolella (tekstipalsta) tausta kuten elävässä luvussa: jatke häivytetään 170 css-px:n
  // matkalla taustaan, joten otsikon alle ei jää viivoja eikä kuvaan kanvaasin reunaa.
  if (x0 > 0) { g.setTransform(dpr, 0, 0, dpr, 0, 0); const gr = g.createLinearGradient(x0 - 170, 0, x0, 0); gr.addColorStop(0, 'rgba(10,10,9,1)'); gr.addColorStop(1, 'rgba(10,10,9,0)'); g.fillStyle = gr; g.fillRect(0, 0, x0, h); }
  const clash = hidden;
  const out = el;
  const pins = boxes.filter((b) => !hide.has(b.n) && pri(b.t) >= 1 && pri(b.t) < 9 && b.x1 > -x0 && b.x0 < w && b.y1 > 0 && b.y0 < h).map((b) => b.t);
  const subs = boxes.filter((b) => !hide.has(b.n) && pri(b.t) === 0 && b.x1 > -x0 && b.x0 < w && b.y1 > 0 && b.y0 < h).map((b) => b.t);
  if (preview) return { pins, subs, clash, png: out.toDataURL('image/png') };
  let best = null;
  for (let q = 86; q >= 56; q -= 2) {
    const url = out.toDataURL('image/webp', q / 100), bytes = Math.floor((url.length - url.indexOf(',') - 1) * 3 / 4);
    if (bytes <= max) { best = { url, q, bytes }; break; }
  }
  return Object.assign({ pins, subs, clash }, best || {});
}

const { srv, base } = await serve();
const browser = await chromium.launch();
const drawn = {};
if (PREVIEW) mkdirSync(PREVIEW, { recursive: true });
try {
  for (const lang of ['fi', 'et']) for (const V of VARIANTS[lang]) {
    const [cw, ch] = V.css, x0 = Math.round(cw * V.live);
    const page = await browser.newPage({ viewport: { width: cw, height: ch }, deviceScaleFactor: V.dpr });
    const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(`${base}/__kk.html?lang=${lang}&w=${cw}&h=${ch}&x0=${x0}`, { waitUntil: 'load' });
    await page.waitForFunction(() => { const c = window.SAMA3D; return !!(c && c._kd && c._kv && c._ke && c._map && c._dots); }, null, { timeout: 60000, polling: 200 });
    await page.evaluate(async () => {
      const c = window.SAMA3D; c._alive = false; cancelAnimationFrame(c._raf);
      await Promise.all(['600 11px "IBM Plex Sans"', '500 10px "IBM Plex Sans"', '600 13px "IBM Plex Sans"'].map((f) => document.fonts.load(f, 'ÄÖÕÜõäöü€·→–')));
      await document.fonts.ready;
    });
    for (let i = 0; i < MAPK.length; i++) {
      // zoomattu kohdeaskel (saaristo + tiheä 110 kV -verkko): työpöydällä 80 kt, ladataan vain kun askel valitaan
      const max = i === MAPK.length - 1 && V.key === 'd' ? 80000 : V.max;
      const r = await page.evaluate(drawStep, { i, MAPK, W: Math.round(cw * V.dpr), H: Math.round(ch * V.dpr), dpr: V.dpr, x0, max, preview: !!PREVIEW });
      const name = `${FILE[lang]}-${V.key}${i}`;
      if (r.clash && r.clash.length) console.log(`  ! ${name} piilotettu päällekkäisenä: ${r.clash.map((t) => t.replace(/\n/g, ' ')).join(' ; ')}`);
      drawn[name] = { labels: r.pins, substations: r.subs, hidden: r.clash };
      if (PREVIEW) { writeFileSync(join(PREVIEW, name + '.png'), Buffer.from(r.png.split(',')[1], 'base64')); console.log(name, r.pins.length, 'tarraa'); continue; }
      if (!r.url) throw new Error(`${name}: ei mahdu budjettiin`);
      writeFileSync(join(ROOT, 'assets', name + '.webp'), Buffer.from(r.url.split(',')[1], 'base64'));
      console.log(`assets/${name}.webp  q${r.q}  ${(r.bytes / 1024).toFixed(1)} kt  tarrat: ${r.pins.map((t) => t.replace(/\n/g, ' ')).join(' | ')}`);
    }
    if (errs.length) console.error(lang, V.key, errs.slice(0, 3));
    await page.close();
  }
} finally { await browser.close(); srv.close(); }
if (ALT_OUT) writeFileSync(ALT_OUT + '.drawn.json', JSON.stringify(drawn, null, 1));
