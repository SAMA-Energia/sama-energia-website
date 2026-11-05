#!/usr/bin/env node
/**
 * SAMA Energia — etusivun hero-kohteiden stillkuvat (konsepti 1, I-20261104-5).
 *
 * Renderöi three.js-näyttämön scripts/stills/hero3d.js (sama näyttämö, kamera, valo ja jälkikäsittely,
 * josta k-hero-{1920,1280,m}.webp on tehty) headless-Chromiumissa ja kirjoittaa
 *   assets/k-obj-<kohde>-1920.webp, -1280.webp (2880×1640-renderistä) ja -m.webp (1170×1560-renderistä)
 * sekä tarrojen ankkurit (murtolukuina kuvan leveydestä/korkeudesta) JSON-tiedostoon.
 *
 * Kohteet (?scene=…): toostus (nykyinen k-hero: teollisuushalli ja kylmävarasto), kuivati (viljankuivuri),
 * hotell (hotelli ja hoivakoti), paike (aurinkopuisto). toostus renderöidään vain pyydettäessä eikä sen
 * kuvia kirjoiteta assets/-kansioon (k-hero-*.webp säilyy).
 *
 * Ajo repon juuresta:
 *   node scripts/render-stills.mjs --modules /polku/node_modules [--scenes kuivati,hotell,paike]
 *        [--anchors /polku/anchors.json] [--png /polku/png-kansio] [--preview /polku/esikatselu] [--no-assets]
 * --modules: kansio, jossa three@0.180.0, postprocessing@6.39.6 ja n8ao@2.0.1, esim.
 *   npm i --prefix /tmp/sama-r3d three@0.180.0 postprocessing@6.39.6 n8ao@2.0.1  →  --modules /tmp/sama-r3d/node_modules
 * --preview: puolikas resoluutio, kirjoittaa vain PNG:t annettuun kansioon (nopea tarkistus).
 * --tausta (05.11.2026): etusivun herotausta ?look=tausta: kirjoittaa assets/k-tausta-{2400,1800,1200}.webp
 *   (työpöytä 3:2, shot=bg) ja assets/k-tausta-m{1170,780}.webp (puhelin 4:3, shot=bgm) sekä tarrojen ankkurit
 *   (--anchors). Muut kohteet eivät renderöidy tässä tilassa.
 * Playwright: require('playwright') (globaali asennus), chromium.launch() ilman valintoja (SwiftShader-WebGL).
 * Repoon ei tule riippuvuuksia; tämä tiedosto ja scripts/stills/ eivät ole palveltavia (_redirects).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const MODULES = opt('modules', process.env.STILLS_MODULES);
if (!MODULES || !existsSync(join(MODULES, 'three', 'build', 'three.module.js'))) {
  console.error('Anna --modules /polku/node_modules (three@0.180.0, postprocessing@6.39.6, n8ao@2.0.1).');
  process.exit(2);
}
const TAUSTA = argv.includes('--tausta');
const SCENES = TAUSTA ? ['toostus'] : String(opt('scenes', 'kuivati,hotell,paike')).split(',').filter(Boolean);
const PREVIEW = opt('preview', null);
const PNG_DIR = PREVIEW || opt('png', null);
const ANCHORS = opt('anchors', null);
const WRITE_ASSETS = !PREVIEW && !argv.includes('--no-assets');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

/* Kuvakoot ja tiedostobudjetit (k-hero-1920 = 39 kt; raja 60 kt). */
const SHOTS = TAUSTA ? [
  { key: 'd', shot: 'bg', w: 2700, h: 1800, out: [{ suf: '2400', w: 2400, h: 1600, max: 150000 }, { suf: '1800', w: 1800, h: 1200, max: 92000 }, { suf: '1200', w: 1200, h: 800, max: 48000 }] },
  { key: 'm', shot: 'bgm', w: 1560, h: 1170, out: [{ suf: 'm1170', w: 1170, h: 878, max: 58000 }, { suf: 'm780', w: 780, h: 585, max: 30000 }] },
] : [
  { key: 'd', shot: 'hero', w: 2880, h: 1640, out: [{ suf: '1920', w: 1920, h: 1093, max: 56000 }, { suf: '1280', w: 1280, h: 729, max: 40000 }] },
  { key: 'm', shot: 'heroPortraitObj', w: 1170, h: 1560, out: [{ suf: 'm', w: 780, h: 1040, max: 56000 }] },
];
const LOOKQ = TAUSTA ? '&look=tausta' : '';
const ALT = {
  toostus: { et: 'Illustratsioon: tööstushall ja külmladu, peakilp, salvestikapid, liitumine võrguga ja päikesepaneelid katusel; objektil elektrik ja omanik.',
             fi: 'Kuvitus: teollisuushalli ja kylmävarasto, pääkeskus, akkukaapit, liittymä verkkoon ja aurinkopaneelit katolla; kohteessa sähköasentaja ja omistaja.' },
  kuivati: { et: 'Illustratsioon: teraviljakuivati ja viljasilod, peakilp, salvestikapid, liitumine võrguga ja päikesepaneelid katusel; objektil elektrik ja omanik.',
             fi: 'Kuvitus: viljankuivuri ja siilot, pääkeskus, akkukaapit, liittymä verkkoon ja aurinkopaneelit katolla; kohteessa sähköasentaja ja omistaja.' },
  hotell: { et: 'Illustratsioon: kolmekorruseline hotell ja hooldekodu köögitiiva ja parklaga, peakilp, salvestikapid, liitumine võrguga ja päikesepaneelid katusel; objektil elektrik ja omanik.',
            fi: 'Kuvitus: kolmikerroksinen hotelli ja hoivakoti, keittiösiipi ja pysäköintialue, pääkeskus, akkukaapit, liittymä verkkoon ja aurinkopaneelit katolla; kohteessa sähköasentaja ja omistaja.' },
  paike: { et: 'Illustratsioon: päikesepark, aiaga piiratud paneeliread, peakilp tehnohoones, salvestikapid ja liitumine võrguga pargi serval; objektil elektrik ja omanik.',
           fi: 'Kuvitus: aurinkopuisto, aidattu paneelikenttä, pääkeskus teknisessä rakennuksessa, akkukaapit ja liittymä verkkoon puiston reunalla; kohteessa sähköasentaja ja omistaja.' },
};
/* toostus: työpöytäkuvat ovat jo k-hero-1920/1280.webp — siitä kirjoitetaan vain puhelinkuva samalla rajauksella
   kuin muissa kohteissa (k-obj-toostus-m.webp), jotta kohteen vaihto puhelimessa pitää järjestelmän paikallaan. */
const OUTNAME = { kuivati: 'kuivati', hotell: 'hotell', paike: 'paike', toostus: 'toostus' };
const SKIP_OUT = { toostus: new Set(['1920', '1280']) };

/* ---------- staattinen palvelin: /stills/ → scripts/stills, /node_modules/ → --modules ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm' };
function serve() {
  const roots = { stills: join(ROOT, 'scripts', 'stills'), node_modules: resolve(MODULES) };
  return new Promise((ok) => {
    const srv = createServer((req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const [, top, ...rest] = path.split('/');
      const base = roots[top];
      const file = base && normalize(join(base, ...rest));
      if (!file || !file.startsWith(base) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(readFileSync(file));
    }).listen(0, '127.0.0.1', () => ok({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/* Selaimessa: kolmiosuodin (tent, tuki = skaala) erotuvasti, sitten WebP-laatuhaku budjettiin. */
function encodeInPage(arg) {
  const { outs } = arg;
  const src = document.querySelector('canvas');
  const sw = src.width, sh = src.height;
  const c0 = document.createElement('canvas'); c0.width = sw; c0.height = sh;
  const g0 = c0.getContext('2d'); g0.drawImage(src, 0, 0);
  const sd = g0.getImageData(0, 0, sw, sh).data;
  const kern = (sn, dn) => {
    const s = sn / dn, sup = Math.max(1, s), K = [];
    for (let i = 0; i < dn; i++) {
      const c = (i + 0.5) * s, a = Math.max(0, Math.floor(c - sup)), b = Math.min(sn, Math.ceil(c + sup));
      const w = []; let sum = 0;
      for (let x = a; x < b; x++) { const t = Math.max(0, 1 - Math.abs((x + 0.5 - c) / sup)); w.push(t); sum += t; }
      K.push({ a, w: w.map((v) => v / sum) });
    }
    return K;
  };
  const res = [];
  for (const o of outs) {
    const kx = kern(sw, o.w), ky = kern(sh, o.h);
    const tmp = new Float32Array(o.w * sh * 3);
    for (let y = 0; y < sh; y++) for (let x = 0; x < o.w; x++) {
      const k = kx[x]; let r = 0, gg = 0, bb = 0;
      for (let j = 0; j < k.w.length; j++) { const p = (y * sw + k.a + j) * 4, t = k.w[j]; r += sd[p] * t; gg += sd[p + 1] * t; bb += sd[p + 2] * t; }
      const q = (y * o.w + x) * 3; tmp[q] = r; tmp[q + 1] = gg; tmp[q + 2] = bb;
    }
    const c1 = document.createElement('canvas'); c1.width = o.w; c1.height = o.h;
    const g1 = c1.getContext('2d'); const id = g1.createImageData(o.w, o.h); const dd = id.data;
    for (let y = 0; y < o.h; y++) { const k = ky[y]; for (let x = 0; x < o.w; x++) {
      let r = 0, gg = 0, bb = 0;
      for (let j = 0; j < k.w.length; j++) { const q = ((k.a + j) * o.w + x) * 3, t = k.w[j]; r += tmp[q] * t; gg += tmp[q + 1] * t; bb += tmp[q + 2] * t; }
      const p = (y * o.w + x) * 4; dd[p] = r + 0.5; dd[p + 1] = gg + 0.5; dd[p + 2] = bb + 0.5; dd[p + 3] = 255;
    } }
    g1.putImageData(id, 0, 0);
    let best = null;
    for (let q = 92; q >= 50; q -= 2) {
      const url = c1.toDataURL('image/webp', q / 100);
      const bytes = Math.floor((url.length - url.indexOf(',') - 1) * 3 / 4);
      if (bytes <= o.max) { best = { url, q, bytes }; break; }
    }
    res.push(Object.assign({ suf: o.suf }, best || { url: null }));
  }
  return res;
}

const ONLY_ANCHORS = argv.includes('--anchors-only');
/* Puhelimen numeroidut nastat: järjestys kuten etusivulla (1 pääkeskus, 2 varasto, 3 liittymä) + verkko ja aurinko, jos kuvassa. */
const PIN_ORDER = ['peakilp', 'salvesti', 'liitumispunkt', 'vork', 'paike'];
const inFrame = (p) => p[0] >= 0.03 && p[0] <= 0.97 && p[1] >= 0.03 && p[1] <= 0.97;
const pins = (fr) => PIN_ORDER.filter((k) => fr[k] && inFrame(fr[k])).map((k, i) => ({ n: i + 1, el: k, x: fr[k][0], y: fr[k][1] }));
async function anchorsOf(base, scene, shot, w, h) {
  const page = await browser.newPage({ viewport: { width: 64, height: 64 } });
  await page.goto(`${base}/stills/hero3d.html?scene=${scene}&shot=${shot}&w=${w}&h=${h}&light=dusk&labels=1&norender=1${LOOKQ}`, { waitUntil: 'commit', timeout: 120000 });
  await page.waitForFunction('window.DONE===true||!!window.FAIL', null, { timeout: 120000, polling: 200 });
  const A = await page.evaluate('window.ANCHORS'); await page.close();
  const frac = {}; for (const [k, v] of Object.entries(A)) frac[k] = [+(v[0] / w).toFixed(3), +(v[1] / h).toFixed(3)];
  return frac;
}

const { srv, base } = await serve();
const browser = await chromium.launch();
const anchorsOut = {};
if (PNG_DIR) mkdirSync(PNG_DIR, { recursive: true });
try {
  for (const scene of SCENES) {
    const files = TAUSTA ? { desktop: ['k-tausta-2400.webp', 'k-tausta-1800.webp', 'k-tausta-1200.webp'], phone: ['k-tausta-m1170.webp', 'k-tausta-m780.webp'] }
      : scene === 'toostus' ? { desktop: ['k-hero-1920.webp', 'k-hero-1280.webp'], phone: 'k-obj-toostus-m.webp', phone_old: 'k-hero-m.webp' }
      : { desktop: [`k-obj-${OUTNAME[scene]}-1920.webp`, `k-obj-${OUTNAME[scene]}-1280.webp`], phone: `k-obj-${OUTNAME[scene]}-m.webp` };
    const okey = TAUSTA ? 'tausta' : scene;
    anchorsOut[okey] = { files, alt: TAUSTA ? null : ALT[scene] };
    if (scene === 'toostus' && !TAUSTA) {   // nykyinen k-hero-m.webp (vanha rajaus heroPortrait) samoilla avaimilla
      const fr = await anchorsOf(base, scene, 'heroPortrait', 1170, 1560);
      anchorsOut[scene].phone_old = fr; anchorsOut[scene].phone_old_pins = pins(fr);
    }
    for (const S of SHOTS) {
      const f = PREVIEW ? 0.5 : 1, w = Math.round(S.w * f), h = Math.round(S.h * f);
      if (ONLY_ANCHORS) {
        const fr = await anchorsOf(base, scene, S.shot, S.w, S.h);
        anchorsOut[okey][S.key === 'd' ? 'desktop' : 'phone'] = fr;
        if (S.key === 'm') anchorsOut[okey].phone_pins = pins(fr);
        continue;
      }
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const logs = []; page.on('console', (m) => logs.push(m.text())); page.on('pageerror', (e) => logs.push('ERR ' + e));
      const t0 = Date.now();
      await page.goto(`${base}/stills/hero3d.html?scene=${scene}&shot=${S.shot}&w=${w}&h=${h}&light=dusk&labels=1${LOOKQ}`, { waitUntil: 'commit', timeout: 120000 });
      await page.waitForFunction('window.DONE===true||!!window.FAIL', null, { timeout: 600000, polling: 500 });
      const fail = await page.evaluate('window.FAIL||null');
      if (fail) throw new Error(`${scene}/${S.shot}: ${fail} ${logs.slice(-5).join(' | ')}`);
      const A = await page.evaluate('window.ANCHORS');
      const frac = {}; for (const [k, v] of Object.entries(A)) frac[k] = [+(v[0] / w).toFixed(3), +(v[1] / h).toFixed(3)];
      anchorsOut[okey][S.key === 'd' ? 'desktop' : 'phone'] = frac;
      if (S.key === 'm') anchorsOut[okey].phone_pins = pins(frac);
      if (PNG_DIR) {
        const png = await page.evaluate("document.querySelector('canvas').toDataURL('image/png')");
        writeFileSync(join(PNG_DIR, `${scene}-${S.key}.png`), Buffer.from(png.split(',')[1], 'base64'));
      }
      const outs = S.out.filter((o) => !(SKIP_OUT[scene] && SKIP_OUT[scene].has(o.suf)));
      if (WRITE_ASSETS && OUTNAME[scene] && outs.length) {
        const enc = await page.evaluate(encodeInPage, { outs });
        for (const e of enc) {
          if (!e.url) throw new Error(`${scene}-${e.suf}: ei mahdu budjettiin`);
          const name = TAUSTA ? `k-tausta-${e.suf}.webp` : `k-obj-${OUTNAME[scene]}-${e.suf}.webp`;
          writeFileSync(join(ROOT, 'assets', name), Buffer.from(e.url.split(',')[1], 'base64'));
          console.log(`assets/${name}  q${e.q}  ${(e.bytes / 1024).toFixed(1)} kt`);
        }
      }
      console.log(`${scene}/${S.shot} ${w}×${h} ${((Date.now() - t0) / 1000).toFixed(1)} s${logs.filter((l) => /ERR|rror/.test(l)).length ? '  ' + logs.filter((l) => /ERR|rror/.test(l)).slice(0, 3).join(' | ') : ''}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  srv.close();
}
if (ANCHORS) {
  let prev = {};
  try { prev = JSON.parse(readFileSync(ANCHORS, 'utf8')); } catch { /* uusi tiedosto */ }
  writeFileSync(ANCHORS, JSON.stringify(Object.assign(prev, anchorsOut), null, 1));
  console.log('ankkurit →', ANCHORS);
}
