#!/usr/bin/env node
/**
 * SAMA Energia — kuvitusten mittaus (QA-työkalu, ei osa buildia; 03.09.2026).
 *
 * Mittaa jokaisen SVG-kuvituksen tekstit (getBBox) molemmilla kielillä kolmella leveydellä
 * (1440 / 768 / 390) ja liputtaa: teksti viewBoxin ulkopuolella, tekstit päällekkäin, teksti
 * vuotaa omasta laatikostaan tai ympyrästään, alle 10 px:n teksti 390 px:n leveydellä, hero-
 * aaltoviiva ingressin tai nappien takana (otsikon takana se kulkee tarkoituksella), HTML-kaavioiden (.queue, .day-notes, .legend,
 * .structure, askelkiskon .steps) leikkautuminen. Rajaa lisäksi jokaisesta kuvituksesta PNG:n ja kokoaa
 * ennen/jälkeen-vertailuarkit.
 *
 * Ajo (generoitujen sivujen päällä, eli buildin jälkeen):
 *   node scripts/qa-illustrations.mjs before    # mittaa + rajaa kuvat (…-before.png), flags-before.json
 *   node scripts/qa-illustrations.mjs after     # sama muutosten jälkeen (…-after.png), flags-after.json
 *   node scripts/qa-illustrations.mjs contact   # vertailuarkit contact-1…9.png ennen/jälkeen-kuvista
 *
 * Tulokset: qa/illustrations/ (git-ignoroitu). Poistuu nollalla, kun liputuksia ei ole.
 *
 * Riippuvuudet: EI mitään repossa. Tarvitsee Google Chromen sekä playwright-coren, joka
 * etsitään järjestyksessä: ympäristömuuttuja PLAYWRIGHT_CORE (polku pakettikansioon tai
 * index.mjs:ään), globaali npm-kansio (`npm i -g playwright-core`), ./node_modules
 * (git-ignoroitu). Sisäinen staattinen palvelin jäljittelee Netlifyn sääntöjä (paljaat
 * ET-slugit → et/-kansio), joten erillistä palvelinta ei tarvita.
 */
import { readFileSync, existsSync, statSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'qa', 'illustrations');
const MODE = process.argv[2];
if (!['before', 'after', 'contact'].includes(MODE)) {
  console.error('Käyttö: node scripts/qa-illustrations.mjs before | after | contact');
  process.exit(2);
}

/* ---------- playwright-core ilman repo-riippuvuutta ---------- */
async function loadPlaywright() {
  const cands = [];
  if (process.env.PLAYWRIGHT_CORE) cands.push(process.env.PLAYWRIGHT_CORE);
  try { cands.push(join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(), 'playwright-core')); } catch { /* npm puuttuu */ }
  cands.push(join(ROOT, 'node_modules', 'playwright-core'));
  for (let c of cands) {
    if (existsSync(c) && statSync(c).isDirectory()) c = join(c, 'index.mjs');
    if (existsSync(c)) return (await import(pathToFileURL(c).href)).chromium;
  }
  console.error('playwright-core ei löydy. Asenna `npm i -g playwright-core` tai anna PLAYWRIGHT_CORE=/polku/playwright-core');
  process.exit(2);
}

/* ---------- pieni staattinen palvelin (Netlify-säännöt: paljas ET-slug -> et/) ---------- */
const ET_TOP = new Set(readdirSync(join(ROOT, 'et')).filter(d => statSync(join(ROOT, 'et', d)).isDirectory()));
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };
function serve() {
  return new Promise(resolve => {
    const srv = createServer((req, res) => {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (ET_TOP.has(path.split('/')[1])) path = '/et' + path;
      let file = join(ROOT, path);
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
      if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(readFileSync(file));
    }).listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/* ---------- mitattavat sivut ja kuvitukset ---------- */
const PAGES = {
  fi: [{ slug: 'home', url: '/' }, { slug: 'reservimarkkinat', url: '/reservimarkkinat/' }, { slug: 'energiavarastot', url: '/energiavarastot/' }, { slug: 'palvelut', url: '/palvelut/' }, { slug: 'liityntarajoitus-2029', url: '/ajankohtaista/liityntarajoitus-2029/' }],
  et: [{ slug: 'home', url: '/et/' }, { slug: 'reserviturg', url: '/reserviturg/' }, { slug: 'energiasalvestid', url: '/energiasalvestid/' }, { slug: 'teenused', url: '/teenused/' }, { slug: 'reservitasu-2026', url: '/ulevaated/reservitasu-2026/' }],
};
const ILLUS = [
  { n: 1, name: 'hero-trace', sel: '.hero-bg svg' },
  { n: 2, name: 'structure', sel: '.structure svg' },
  { n: 3, name: 'viz', sel: '.value .viz svg' },
  { n: 4, name: 'scale', sel: '.teaser .card svg, .reserve-intro .sizing svg' },
  { n: 5, name: 'segment', sel: '.segment .pic svg' },
  { n: 6, name: 'day', sel: '.day svg' },
  { n: 7, name: 'yield', sel: '.yield .sizing svg' },
  { n: 8, name: 'figure', sel: '.article .figure svg' },
  { n: 9, name: 'html', sel: '.queue, .day-notes, .day .legend, .structure, .steps', html: true },
  { n: 10, name: 'system', sel: '.subhero .system svg' },
];
const NAMES = { 1: 'Hero trace (etusivu)', 2: 'Viisi tekijää (etusivu)', 3: 'Kassavirtakorttien sparklinet (etusivu)', 4: 'Vaaka: etusivun kortti + reservisivun .sizing', 5: 'Kohdepiktogrammit (etusivu)', 6: 'Akun päivä (energiavarastot / energiasalvestid)', 7: 'Tuoton arviointi (reservimarkkinat / reserviturg)', 8: 'Artikkelin kuvio (liityntärajoitus 2029 / reservitasu 2026)', 9: 'HTML-kaaviot (.queue, .day-notes, .legend, .structure, .steps)', 10: 'Järjestelmäpiirros (Energiavarastot / Energiasalvestid)' };

/* Selaimessa ajettava mittaus: SVG-tekstien bboxit vs. viewBox, toisensa ja edeltävä muoto. */
function measure(node, arg) {
  const { width, html } = arg; const tol = 0.5; const r4 = a => `${a.x.toFixed(1)},${a.y.toFixed(1)} ${a.w.toFixed(1)}×${a.h.toFixed(1)}`;
  if (html) {
    const flags = [];
    const all = [node, ...node.querySelectorAll('*')];
    for (const e of all) {
      if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible') flags.push({ el: (e.className || e.tagName).toString().slice(0, 40), problem: 'scrollWidth > clientWidth', numbers: `${e.scrollWidth} > ${e.clientWidth}` });
      const cs = getComputedStyle(e);
      if (cs.overflow === 'hidden' || cs.overflowX === 'hidden') { const R = e.getBoundingClientRect(); for (const c of e.children) { const C = c.getBoundingClientRect(); if (C.right > R.right + 1 || C.bottom > R.bottom + 1 || C.left < R.left - 1) flags.push({ el: (c.className || c.tagName).toString().slice(0, 40), problem: 'clipped by overflow:hidden', numbers: `child ${Math.round(C.right)} > box ${Math.round(R.right)}` }); } }
    }
    const R = node.getBoundingClientRect(); if (R.right > document.documentElement.clientWidth + 1) flags.push({ el: node.className.toString(), problem: 'extends beyond viewport', numbers: `${Math.round(R.right)} > ${document.documentElement.clientWidth}` });
    return { flags, rect: { w: Math.round(R.width), h: Math.round(R.height) } };
  }
  const svg = node; const vb = svg.viewBox.baseVal; const R = svg.getBoundingClientRect(); const scale = R.width / vb.width;
  const texts = [...svg.querySelectorAll('text')];
  const info = texts.map((t, i) => {
    const cs = getComputedStyle(t); const hidden = cs.display === 'none' || cs.visibility === 'hidden' || t.getClientRects().length === 0; let b; try { b = t.getBBox(); } catch (e) { b = { x: 0, y: 0, width: 0, height: 0 }; }
    const fs = parseFloat(cs.fontSize);
    let shape = null, p = t.previousElementSibling; while (p) { if (p.tagName === 'rect' || p.tagName === 'circle') { shape = p; break; } p = p.previousElementSibling; }
    let shapeInfo = null;
    if (shape && t.parentElement.tagName === 'g') shapeInfo = shape.tagName === 'rect' ? { type: 'rect', x: +shape.getAttribute('x'), y: +shape.getAttribute('y'), w: +shape.getAttribute('width'), h: +shape.getAttribute('height') } : { type: 'circle', cx: +shape.getAttribute('cx'), cy: +shape.getAttribute('cy'), r: +shape.getAttribute('r') };
    return { i, text: t.textContent.replace(/\s+/g, ' ').trim(), x: b.x, y: b.y, w: b.width, h: b.height, fs, render: +(fs * scale).toFixed(1), hidden, opacity: cs.opacity, shape: shapeInfo };
  });
  const flags = [];
  for (const a of info) {
    if (a.hidden || !a.w) continue;
    if (a.x < vb.x - tol || a.y < vb.y - tol || a.x + a.w > vb.x + vb.width + tol || a.y + a.h > vb.y + vb.height + tol) flags.push({ el: a.text, problem: 'outside viewBox', numbers: `bbox ${r4(a)} vs viewBox ${vb.x} ${vb.y} ${vb.width} ${vb.height}` });
    for (const b of info) { if (b.i <= a.i || b.hidden || !b.w) continue; if (a.x < b.x + b.w - tol && b.x < a.x + a.w - tol && a.y < b.y + b.h - tol && b.y < a.y + a.h - tol) flags.push({ el: a.text + ' × ' + b.text, problem: 'text overlaps text', numbers: `${r4(a)} ∩ ${r4(b)}` }); }
    if (a.shape) {
      const s = a.shape;
      if (s.type === 'rect') { const inside = a.x >= s.x - tol && a.y >= s.y - tol && a.x + a.w <= s.x + s.w + tol && a.y + a.h <= s.y + s.h + tol; const inter = a.x < s.x + s.w && s.x < a.x + a.w && a.y < s.y + s.h && s.y < a.y + a.h; if (inter && !inside) flags.push({ el: a.text, problem: 'overflows its rect', numbers: `bbox ${r4(a)} vs rect ${s.x},${s.y} ${s.w}×${s.h}` }); }
      else { const cs = [[a.x, a.y], [a.x + a.w, a.y], [a.x, a.y + a.h], [a.x + a.w, a.y + a.h]].map(([x, y]) => Math.hypot(x - s.cx, y - s.cy) <= s.r + tol); if (cs.some(Boolean) && !cs.every(Boolean)) flags.push({ el: a.text, problem: 'overflows its circle', numbers: `bbox ${r4(a)} vs circle ${s.cx},${s.cy} r${s.r}` }); }
    }
    if (width === 390 && a.render < 10) flags.push({ el: a.text, problem: 'font < 10px at 390', numbers: `${a.fs}px × ${scale.toFixed(3)} = ${a.render}px` });
  }
  /* hero-aaltoviiva on koriste: raportoi päällekkäisyys ingressin, nappien ja merkkien kanssa.
     Otsikon (h1) takana se kulkee tarkoituksella (v5.3, 04.09.2026) — sen kontrasti mitataan erikseen pikseleistä, ei tässä. */
  if (svg.closest('.hero-bg')) {
    let ys = []; for (const p of svg.querySelectorAll('path.trace, line.base')) { const d = p.getAttribute('d'); if (d) for (const m of d.matchAll(/-?\d+(?:\.\d+)?\s+(-?\d+(?:\.\d+)?)/g)) ys.push(+m[1]); else ys.push(+p.getAttribute('y1'), +p.getAttribute('y2')); }
    const sy = R.height / vb.height; const band = { top: R.top + Math.min(...ys) * sy - 2, bottom: R.top + Math.max(...ys) * sy + 2 };
    for (const sel of ['.hero .lead', '.hero-cta', '.hero .badges']) { const t = document.querySelector(sel); if (!t) continue; const T = t.getBoundingClientRect(); if (T.bottom > band.top && T.top < band.bottom) flags.push({ el: sel, problem: 'hero trace strokes overlap text', numbers: `text ${Math.round(T.top)}–${Math.round(T.bottom)} vs trace band ${Math.round(band.top)}–${Math.round(band.bottom)}` }); }
  }
  return { vb: [vb.x, vb.y, vb.width, vb.height], scale: +scale.toFixed(3), rect: { w: Math.round(R.width), h: Math.round(R.height) }, texts: info, flags };
}

async function runMeasure(chromium, SET) {
  const { srv, base } = await serve();
  const rows = []; const detail = [];
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const lang of ['fi', 'et']) {
    mkdirSync(join(OUT, lang), { recursive: true });
    for (const pg of PAGES[lang]) for (const width of [1440, 768, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 2, isMobile: width === 390, hasTouch: width === 390 });
      const page = await ctx.newPage();
      await page.goto(base + pg.url, { waitUntil: 'networkidle' });
      for (const il of ILLUS) {
        const els = await page.$$(il.sel);
        for (let k = 0; k < els.length; k++) {
          const el = els[k];
          if (!(await el.isVisible())) continue; /* esim. heron järjestelmäpiirros on alle 700 px:n leveydellä display:none */
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1700); /* reveal-animaatiot ja viivat loppuun */
          await el.evaluate(e => e.getAnimations().forEach(a => a.pause())); /* elementin oma loputon animaatio (heron taajuusjäljen ajelehdinta) estäisi rajauksen: Playwright odottaa vakaata sijaintia */
          const suffix = els.length > 1 ? String.fromCharCode(97 + k) : '';
          const file = join(OUT, lang, `${pg.slug}-${il.n}${suffix}-${width}-${SET}.png`);
          try { await el.screenshot({ path: file }); } catch (e) { rows.push({ page: pg.slug, lang, width, il: il.name + suffix, el: '', problem: 'screenshot failed', numbers: e.message.slice(0, 60) }); }
          const res = await el.evaluate(measure, { width, html: !!il.html });
          detail.push({ page: pg.slug, lang, width, il: il.name + suffix, ...res });
          for (const f of res.flags) rows.push({ page: pg.slug, lang, width, il: il.name + suffix, ...f });
        }
      }
      await ctx.close();
      process.stdout.write('.');
    }
  }
  await browser.close();
  srv.close();
  writeFileSync(join(OUT, `flags-${SET}.json`), JSON.stringify({ rows, detail }, null, 1));
  console.log(`\n${SET.toUpperCase()} — ${rows.length} liputusta · ${detail.length} kuvitusta mitattu · kuvat qa/illustrations/{fi,et}/`);
  const pad = (s, n) => String(s).padEnd(n).slice(0, n);
  if (rows.length) console.log(pad('page', 22) + pad('lang', 5) + pad('w', 5) + pad('illustration', 12) + pad('element text', 40) + pad('problem', 30) + 'numbers');
  for (const r of rows) console.log(pad(r.page, 22) + pad(r.lang, 5) + pad(r.width, 5) + pad(r.il, 12) + pad(r.el, 40) + pad(r.problem, 30) + r.numbers);
  return rows.length;
}

/* Vertailuarkit: yksi PNG per kuvitus — BEFORE (390 + 1440) ja AFTER (390 + 1440), FI ja ET. */
async function runContact(chromium) {
  const files = { fi: existsSync(join(OUT, 'fi')) ? readdirSync(join(OUT, 'fi')) : [], et: existsSync(join(OUT, 'et')) ? readdirSync(join(OUT, 'et')) : [] };
  if (!files.fi.length && !files.et.length) { console.error('Ei kuvia — aja ensin `before` ja/tai `after`.'); process.exit(2); }
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const keys = new Set();
    for (const lang of ['fi', 'et']) for (const f of files[lang]) { const m = new RegExp(`^(.+)-${n}([a-z]?)-(1440|390)-(before|after)\\.png$`).exec(f); if (m) keys.add(`${lang}|${m[1]}|${m[2]}`); }
    if (!keys.size) continue;
    const rows = [...keys].sort().map(k => {
      const [lang, slug, suf] = k.split('|');
      const img = (w, set) => { const f = `${slug}-${n}${suf}-${w}-${set}.png`; return files[lang].includes(f) ? `<img src="${pathToFileURL(join(OUT, lang, f)).href}">` : '<div class="none">—</div>'; };
      return `<tr><th>${lang.toUpperCase()} · ${slug}${suf ? ' · ' + suf : ''}</th><td>${img(390, 'before')}</td><td>${img(1440, 'before')}</td><td class="after">${img(390, 'after')}</td><td class="after">${img(1440, 'after')}</td></tr>`;
    }).join('');
    const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:24px;background:#fff;font:500 14px/1.4 -apple-system,'IBM Plex Sans',sans-serif;color:#1F1C18}
    h1{font:600 20px/1.3 -apple-system,sans-serif;margin:0 0 14px} table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #E8E2D4;padding:8px;vertical-align:top;text-align:left;font-weight:500}
    thead th{background:#FAF7F0;font-weight:600} td.after{background:#FBF7EA} th{width:150px}
    td{width:25%} img{display:block;max-width:100%;max-height:420px;width:auto;height:auto;border:1px solid #D8D0BC;background:#fff} .none{color:#7A746A}
  </style><h1>${n}. ${NAMES[n]}</h1><table><thead><tr><th></th><th>BEFORE · 390 px</th><th>BEFORE · 1440 px</th><th>AFTER · 390 px</th><th>AFTER · 1440 px</th></tr></thead><tbody>${rows}</tbody></table>`;
    const tmp = join(OUT, `contact-${n}.html`);
    writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href);
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT, `contact-${n}.png`), fullPage: true });
    console.log(`qa/illustrations/contact-${n}.png (${keys.size} riviä)`);
  }
  await browser.close();
}

const chromium = await loadPlaywright();
mkdirSync(OUT, { recursive: true });
if (MODE === 'contact') await runContact(chromium);
else process.exitCode = (await runMeasure(chromium, MODE)) ? 1 : 0;
