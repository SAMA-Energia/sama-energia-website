#!/usr/bin/env node
/**
 * SAMA Energia — asettelukatselmus (QA-työkalu, ei osa buildia; 10.09.2026).
 *
 * Syy: 09.09. julkaistiin kaksi asetteluvirhettä, jotka sivu kerrallaan katsomalla jäivät
 * huomaamatta. Molemmat olivat samaa lajia — merkkaus odotti CSS-sääntöä, jota tyylitiedostossa
 * ei enää ollut (.intro-split.wide ja .hero h1 -koko). Staattinen grep ei löydä niitä, koska
 * body:llä on overflow-x:hidden: leikkautuva elementti ei tuota vierityspalkkia eikä siis näy
 * mistään muusta kuin renderöinnistä.
 *
 * Lataa kaikki 27 sivua + 2 × 404 leveyksillä 1440 / 1280 / 1024 / 768 / 390 ja raportoi:
 *   1  vaakaylivuoto (elementin scrollWidth > clientWidth kun overflow-x on visible;
 *      lisäksi documentElement.scrollWidth > clientWidth)
 *   2  merkkauksen luokat, joille ei ole sääntöä site.css:ssä
 *   3  ruudukkoraiteet, jotka voivat vuotaa yli (paljas 1fr; korjaus on minmax(0,1fr))
 *   4  otsikot, jotka menevät neljälle riville tai useammalle
 *   5  elementit, jotka esi-isän overflow:hidden leikkaa
 *   6  kontrasti: pieni teksti tummalla pinnalla ≥ 4,5:1
 *
 * Ajo (generoitujen sivujen päällä, eli buildin jälkeen):
 *   node scripts/qa-layout.mjs            # raportti
 *   node scripts/qa-layout.mjs --json     # sama koneluettavana
 *
 * Poistuu nollalla, kun löydöksiä ei ole. Riippuvuudet: EI mitään repossa — sama
 * playwright-core-haku ja sisäinen staattinen palvelin kuin qa-illustrations.mjs:ssä.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JSON_OUT = process.argv.includes('--json');
const WIDTHS = [1440, 1280, 1024, 768, 390];

/* Luokat, joilla ei kuulukaan olla sääntöä: lomakkeiden kehykset (tyyli tulee .form-säännöistä),
   .page on generaattorin rakennekääre, ja SVG:iden sisäiset lyhenteet tyylitellään
   kuvituskohtaisilla <style>-lohkoilla tai attribuuteilla. */
const NO_RULE_OK = new Set([
  'lead-form', 'nl-form',   // lomakekehykset: tyyli tulee .form-säännöistä
  'page',                   // generaattorin rakennekääre
  'duty',                   // <p class="duty"> yhteystietokortissa — tyyli .person p:stä (tarkistettu 10.09.2026)
  'typical',                // .compare-col typical — vertailun oletuspalsta, tyyli .compare-col:sta; vain .sama poikkeaa
  'flow',                   // SVG:n sisäinen: määritelty kuvituskohtaisessa <style>-lohkossa
]);
const NO_RULE_OK_RE = [/^r\d+$/, /^s\d+$/, /^bv$/, /^gv$/, /^chart-/, /^trace/];

/* ---------- playwright-core ilman repo-riippuvuutta (sama haku kuin qa-illustrations.mjs) ---------- */
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

/* Kaikki generoidut sivut. */
function allPages() {
  const pages = [];
  const skip = new Set(['assets', 'scripts', 'src', 'qa', '.git', '.github', 'node_modules', 'Claude outputs']);
  const walk = (dir, url) => {
    for (const e of readdirSync(dir)) {
      const fp = join(dir, e);
      if (statSync(fp).isDirectory() && !skip.has(e)) walk(fp, `${url}/${e}`);
    }
    if (existsSync(join(dir, 'index.html'))) pages.push(`${url}/`);
  };
  walk(ROOT, '');
  pages.push('/404.html', '/et/404.html');
  return pages.sort();
}

/* ---------- 2 & 3: site.css:n staattinen puoli ---------- */
/* Kommentit pois, säännöt talteen — luokat selektoreista, ei kommenttiteksteistä. */
function cssFacts() {
  const raw = readFileSync(join(ROOT, 'assets/site.css'), 'utf8');
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
  const classes = new Set();
  const bareFr = [];
  let i = 0, buf = '', atStack = [];
  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') {
      const prelude = buf.trim();
      if (prelude.startsWith('@')) { atStack.push(prelude); buf = ''; i++; continue; }
      let d = 1, j = i + 1;
      while (j < css.length && d > 0) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++; }
      const body = css.slice(i + 1, j - 1);
      for (const m of prelude.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) classes.add(m[1]);
      /* paljas 1fr = 1fr, jota ei ole kääritty minmax(0,…):iin -> raide ei voi kutistua
         alle sisältönsä min-contentin, jolloin pitkä sana tai taulukko vuotaa yli */
      for (const m of body.matchAll(/grid-template-columns:([^;}]+)/g)) {
        const v = m[1];
        const withoutMinmax = v.replace(/minmax\([^)]*\)/g, '');
        if (/\b1fr\b/.test(withoutMinmax)) bareFr.push({ sel: prelude, at: atStack.join(' '), value: v.trim() });
      }
      buf = ''; i = j; continue;
    }
    if (ch === '}') { atStack.pop(); buf = ''; i++; continue; }
    buf += ch; i++;
  }
  return { classes, bareFr };
}

/* ---------- selaimessa ajettava mittaus ---------- */
function inspect() {
  const out = { overflow: [], noRule: [], headings: [], clipped: [], contrast: [], grid: [] };
  const vw = document.documentElement.clientWidth;
  const nameOf = el => {
    const c = (typeof el.className === 'string' ? el.className : el.getAttribute('class') || '').trim();
    return el.tagName.toLowerCase() + (c ? '.' + c.split(/\s+/).slice(0, 3).join('.') : '') + (el.id ? '#' + el.id : '');
  };
  const sectionOf = el => { const s = el.closest('[id]'); return s ? '#' + s.id : '—'; };

  /* 1 — vaakaylivuoto.
     scrollWidth > clientWidth EI kelpaa sellaisenaan, koska se laskee mukaan kaksi asiaa,
     jotka eivät ole vikoja:
       a) absoluuttisesti sijoitetut jälkeläiset. .nav .menu on position:absolute ja .dd on sen
          sijoitusehdokas, joten piilotettu 260 px pudotusvalikko näkyy .dd:n scrollWidthissä
          jokaisella sivulla — päällyskerros, ei ylivuoto.
       b) pyöritetyt jälkeläiset. [open]-tilan .plus on rotate(45°), jolloin 30 px neliön
          rajauslaatikko kasvaa 42 px:iin (~6 px per reuna). Elementti on ympyrä — mikään ei
          liiku. Tämä valeylivuoto kertautui summary -> details -> .faq-list -> .faq.
     Siksi mitataan suoraan: onko elementissä NORMAALISSA vuossa oleva, pyörittämätön jälkeläinen,
     joka yltää sen padding-laatikon ulkopuolelle. Sama vika, luotettavampi mittaus — ja raportti
     kertoo myös, MIKÄ lapsi vuotaa yli.
     SVG-elementit ohitetaan: niillä ei ole samaa laatikkomallia, ja ne mitataan getBBox-pohjaisesti
     omalla työkalullaan (scripts/qa-illustrations.mjs). */
  const isPositioned = el => { const p = getComputedStyle(el).position; return p === 'absolute' || p === 'fixed'; };
  const isSvg = el => el.namespaceURI === 'http://www.w3.org/2000/svg';
  const isRotated = el => {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return false;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map(Number); return Math.abs(p[1]) > 0.01 || Math.abs(p[2]) > 0.01; }
    return /rotate/.test(t);
  };
  /* Uloimmat jälkeläiset, jotka yltävät elementin padding-laatikon ulkopuolelle. */
  const overflowingKids = el => {
    const R = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const left = R.left + (parseFloat(cs.borderLeftWidth) || 0);
    const right = R.right - (parseFloat(cs.borderRightWidth) || 0);
    const hits = [];
    const walk = n => {
      for (const c of n.children) {
        if (isPositioned(c) || isSvg(c) || isRotated(c)) continue;
        const cr = c.getBoundingClientRect();
        if (cr.width === 0) continue;
        if (cr.right > right + 1 || cr.left < left - 1) { hits.push({ node: c, over: Math.round(Math.max(cr.right - right, left - cr.left)) }); continue; }
        /* Ei mennä sellaisen lapsen sisään, joka itse vierittää tai leikkaa: sen sisältö on
           tarkoituksella sitä leveämpää. Leveät taulukot ovat .tbl-scroll{overflow-x:auto}
           -kääreessä ja table.tbl{min-width:640px} on tahallinen — 390 px:ssä käyttäjä
           vierittää taulukkoa vaakasuunnassa, mikään ei vuoda sivulle. */
        if (getComputedStyle(c).overflowX !== 'visible') continue;
        walk(c);
      }
    };
    walk(el);
    return hits;
  };
  for (const el of document.querySelectorAll('body *')) {
    if (isSvg(el) || el.clientWidth === 0) continue;
    if (getComputedStyle(el).overflowX !== 'visible') continue;
    for (const h of overflowingKids(el))
      out.overflow.push({ el: nameOf(el), child: nameOf(h.node), section: sectionOf(el), numbers: `lapsi yltää ${h.over} px yli` });
  }
  if (document.documentElement.scrollWidth > vw + 1)
    out.overflow.push({ el: 'documentElement', section: '—', numbers: `scrollWidth ${document.documentElement.scrollWidth} > clientWidth ${vw}` });

  /* 2 — merkkauksen luokat (kerätään; sääntövertailu tehdään Nodessa) */
  const domClasses = new Set();
  for (const el of document.querySelectorAll('[class]')) {
    const c = (typeof el.className === 'string' ? el.className : el.getAttribute('class') || '');
    for (const t of c.split(/\s+/)) if (t) domClasses.add(t);
  }
  out.domClasses = [...domClasses];

  /* 3 — ruudukot, joiden lapsi ei mahdu raiteeseensa. Sama suodatus kuin kohdassa 1. */
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (!/grid/.test(cs.display) || isSvg(el)) continue;
    for (const c of el.children) {
      if (isPositioned(c) || isSvg(c) || isRotated(c) || c.clientWidth === 0) continue;
      /* scrollWidth nappaa myös TEKSTIN ylivuodon omasta laatikostaan (tekstisolmu ei ole
         lapsielementti, joten overflowingKids ei näe sitä) — mutta se laskee mukaan myös
         pyöritetyn .plus-merkin ~6 px valeylivuodon, joten se ohitetaan silloin. */
      const hasRotated = [...c.querySelectorAll('*')].some(isRotated);
      if (overflowingKids(c).length || (c.scrollWidth > c.clientWidth + 1 && !hasRotated))
        out.grid.push({ el: nameOf(el), child: nameOf(c), section: sectionOf(el), numbers: `raide ${c.clientWidth} px, sisältö ${c.scrollWidth} px`, tracks: cs.gridTemplateColumns });
    }
  }

  /* 4 — otsikot neljällä rivillä tai useammalla */
  for (const h of document.querySelectorAll('h1,h2,h3')) {
    if (!h.getClientRects().length) continue;
    const rng = document.createRange(); rng.selectNodeContents(h);
    const tops = new Set([...rng.getClientRects()].filter(r => r.height > 2).map(r => Math.round(r.top)));
    if (tops.size >= 4)
      out.headings.push({ el: h.tagName.toLowerCase(), section: sectionOf(h), lines: tops.size, fontSize: getComputedStyle(h).fontSize, text: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) });
  }

  /* 5 — esi-isän overflow:hidden leikkaa. body:n overflow-x:hidden on tarkoituksellinen
     (se on juuri syy siihen, ettei leikkautuminen näy vierityspalkkina) — se ei ole löydös
     itsessään, mutta sen sisällä leikkautuva elementti on. */
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'hidden' && cs.overflowX !== 'hidden' && cs.overflowY !== 'hidden') continue;
    if (el.tagName === 'BODY') continue;
    const R = el.getBoundingClientRect();
    if (R.width === 0) continue;
    for (const c of el.children) {
      const cr = c.getBoundingClientRect();
      if (cr.width === 0) continue;
      const cc = getComputedStyle(c);
      if (cc.position === 'absolute' || cc.position === 'fixed') continue; // koristeet sijoitetaan tahallaan yli
      if (cr.right > R.right + 1 || cr.left < R.left - 1)
        out.clipped.push({ el: nameOf(c), parent: nameOf(el), section: sectionOf(el), numbers: `lapsi ${Math.round(cr.left)}–${Math.round(cr.right)} vs laatikko ${Math.round(R.left)}–${Math.round(R.right)}` });
    }
  }

  /* 6 — kontrasti. Pieni teksti = < 24 px, tai < 18,66 px lihavoituna (WCAG 1.4.3).
     Taustaväri haetaan esi-isistä; jos matkalla on taustakuva, väriä ei voi laskea
     tyyleistä -> merkitään mittaamattomaksi eikä väitetä mitään. */
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a));
  for (const el of document.querySelectorAll('p,li,span,small,a,dt,dd,figcaption,td,th,b,strong,em')) {
    if (!el.getClientRects().length) continue;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').trim();
    if (txt.length < 3) continue;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize), w = parseInt(cs.fontWeight, 10) || 400;
    const small = fs < 24 && !(w >= 700 && fs >= 18.66);
    if (!small) continue;
    const fg = parse(cs.color); if (!fg) continue;
    let bg = null, imaged = false, n = el;
    while (n && n.nodeType === 1) {
      const ns = getComputedStyle(n);
      if (ns.backgroundImage && ns.backgroundImage !== 'none') { imaged = true; break; }
      const b = parse(ns.backgroundColor);
      if (b && b.a > 0) { bg = bg ? over(b, bg) : (b.a >= 1 ? b.rgb : null); if (bg) break; }
      n = n.parentElement;
    }
    if (imaged || !bg) continue;
    const L1 = lum(over(fg, bg)), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    if (ratio < 4.5)
      out.contrast.push({ el: nameOf(el), section: sectionOf(el), ratio: +ratio.toFixed(2), fontSize: cs.fontSize, color: cs.color, bg: `rgb(${bg.map(Math.round).join(',')})`, text: txt.slice(0, 40) });
  }
  return out;
}

/* ---------- ajo ---------- */
const chromium = await loadPlaywright();
const { classes: cssClasses, bareFr } = cssFacts();
const { srv, base } = await serve();
const pages = allPages();
const browser = await chromium.launch({ channel: 'chrome' });
const findings = { overflow: [], noRule: [], grid: [], headings: [], clipped: [], contrast: [] };
const seenClasses = new Set();

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  for (const url of pages) {
    await pg.goto(base + url, { waitUntil: 'networkidle' });
    /* in-view-luokat päälle ja details auki, jotta myös paljastuva sisältö mitataan */
    await pg.evaluate(() => {
      document.querySelectorAll('.reveal,.watch').forEach(e => e.classList.add('in-view'));
      document.querySelectorAll('details').forEach(d => { d.open = true; });
    });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(120);
    const r = await pg.evaluate(inspect);
    for (const c of r.domClasses) seenClasses.add(c);
    for (const k of ['overflow', 'grid', 'headings', 'clipped', 'contrast'])
      for (const f of r[k]) findings[k].push({ page: url, width: w, ...f });
  }
  await ctx.close();
}
await browser.close();
srv.close();

/* 2 — merkkauksen luokat ilman sääntöä */
for (const c of [...seenClasses].sort()) {
  if (cssClasses.has(c) || NO_RULE_OK.has(c) || NO_RULE_OK_RE.some(re => re.test(c))) continue;
  findings.noRule.push({ class: c });
}

/* ---------- raportti ---------- */
if (JSON_OUT) { console.log(JSON.stringify({ findings, bareFr }, null, 1)); }
else {
  const dedupe = (rows, key) => { const m = new Map(); for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, { ...r, widths: [] }); m.get(k).widths.push(r.width); } return [...m.values()]; };
  const H = t => console.log(`\n[1m${t}[0m`);
  console.log(`SAMA Energia — asettelukatselmus · ${pages.length} sivua × ${WIDTHS.join('/')} px`);

  H('1 — vaakaylivuoto');
  const ov = dedupe(findings.overflow, r => r.page + r.el + r.child + r.numbers);
  ov.length ? ov.forEach(r => console.log(`  ${r.page}  ${r.section}  ${r.el} > ${r.child}  ${r.numbers}  @ ${r.widths.join(',')}`)) : console.log('  ei löydöksiä');

  H('2 — merkkauksen luokat ilman sääntöä site.css:ssä');
  findings.noRule.length ? findings.noRule.forEach(r => console.log(`  .${r.class}`)) : console.log('  ei löydöksiä');

  H('3 — ruudukkoraiteet, joihin lapsi ei mahdu');
  const gr = dedupe(findings.grid, r => r.page + r.el + r.child);
  gr.length ? gr.forEach(r => console.log(`  ${r.page}  ${r.el} > ${r.child}  ${r.numbers}  [${r.tracks}]  @ ${r.widths.join(',')}`)) : console.log('  ei löydöksiä');
  console.log(`  (site.css: ${bareFr.length} paljasta 1fr -ilmoitusta — korjaus tarvittaessa minmax(0,1fr))`);
  for (const b of bareFr) console.log(`     ${b.at ? b.at + ' ' : ''}${b.sel.slice(0, 110)}  ->  ${b.value.slice(0, 60)}`);

  H('4 — otsikot neljällä rivillä tai useammalla');
  const hd = dedupe(findings.headings, r => r.page + r.section + r.text);
  hd.length ? hd.forEach(r => console.log(`  ${r.page}  ${r.section}  ${r.el} ${r.lines} riviä @ ${r.fontSize}  "${r.text}"  @ ${r.widths.join(',')}`)) : console.log('  ei löydöksiä');

  H('5 — esi-isän overflow:hidden leikkaa');
  const cl = dedupe(findings.clipped, r => r.page + r.el + r.parent);
  cl.length ? cl.forEach(r => console.log(`  ${r.page}  ${r.el} esi-isässä ${r.parent}  ${r.numbers}  @ ${r.widths.join(',')}`)) : console.log('  ei löydöksiä');

  H('6 — kontrasti alle 4,5:1 (pieni teksti)');
  const co = dedupe(findings.contrast, r => r.page + r.el + r.text);
  co.length ? co.forEach(r => console.log(`  ${r.page}  ${r.section}  ${r.el}  ${r.ratio}:1  ${r.fontSize}  ${r.color} / ${r.bg}  "${r.text}"  @ ${r.widths.join(',')}`)) : console.log('  ei löydöksiä');

  const total = Object.values(findings).reduce((n, a) => n + a.length, 0);
  console.log(`\nyhteensä ${total} löydöstä`);
}
process.exit(Object.values(findings).some(a => a.length) ? 1 : 0);
