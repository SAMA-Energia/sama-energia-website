#!/usr/bin/env node
/**
 * SAMA Energia — sivugeneraattori.
 *
 * Lähteet:  src/fi.html ja src/et.html (yksi lähdetiedosto per kieli).
 * Tuottaa:  / ja /<slug>/index.html (FI), /et/ ja /et/<slug>/index.html (ET),
 *           sitemap.xml, _headers (CSP-hash etusivujen hash-shimille) sekä
 *           assets/review.json (katselmustilan manifesti: lähteiden diff origin/mainiin).
 * Ajo:      node scripts/build-pages.mjs   (ei npm-riippuvuuksia)
 *
 * Generoidut tiedostot committoidaan — Netlify julkaisee repon sellaisenaan,
 * build-vaihetta ei ole palvelimella.
 */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* TODO (2026-08-20): canonical- ja hreflang-URL:t osoittavat .fi-hostiin myös
   ET-sivuilla, koska samaenergia.ee ei vielä palvele monisivusisältöä natiivisti.
   Kun OÜ on perustettu ja .ee palvelee natiivisti, vaihda ET-sivujen BASE
   (canonical + hreflang + sitemap) .ee-hostiin. */
const BASE = 'https://samaenergia.fi';

/* Slugiparit FI ↔ ET (kielivalitsin ja hreflang; tyhjä slug = etusivu).
   Lähde: entiset hash-reititystaulut. */
const PAIRS = [
  ['', ''],
  ['energiavarastot', 'energiasalvestid'],
  ['aurinko-ja-akku', 'paike-ja-aku'],
  ['reservimarkkinat', 'reserviturud'],
  ['prosessi', 'protsess'],
  ['meista', 'meist'],
  ['yhteystiedot', 'kontakt'],
  ['ajankohtaista', 'uudised'],
  ['tietosuoja', 'andmekaitse'],
  ['kiitos', 'aitah'],
];
/* Lomakkeen kiitossivut: generoidaan ja paritetaan, mutta ei sitemapiin,
   ei legacy-shimiin eikä navigaatioon. Sivuilla on data-noindex="1". */
const UNLISTED = new Set(['kiitos', 'aitah']);

const FI_TO_ET = new Map(PAIRS);
const ET_TO_FI = new Map(PAIRS.map(([f, e]) => [e, f]));

const LANGS = {
  fi: { src: 'src/fi.html', legacySrc: 'index.html', htmlLang: 'fi', ogLocale: 'fi_FI', url: s => (s ? `/${s}/` : '/') },
  et: { src: 'src/et.html', legacySrc: 'et/index.html', htmlLang: 'et', ogLocale: 'et_EE', url: s => (s ? `/et/${s}/` : '/et/') },
};
const fiUrl = s => LANGS.fi.url(s);
const etUrl = s => LANGS.et.url(s);

/* Legacy-hash-shim: vanhat #/-osoitteet ohjataan oikeille URL-osoitteille.
   Vain tunnetut polut (whitelist); kaikki muu jätetään huomiotta.
   Sama skripti molemmilla etusivuilla -> yksi CSP-hash. */
const SHIM_MAP = Object.fromEntries(
  PAIRS.filter(([f]) => f && !UNLISTED.has(f)).flatMap(([f, e]) => [
    [`#/${f}`, fiUrl(f)],
    [`#/${e}`, etUrl(e)],
  ]),
);
const SHIM = `(function(){var m=${JSON.stringify(SHIM_MAP)};var t=m[location.hash];if(t)location.replace(t)})()`;
const SHIM_HASH = createHash('sha256').update(SHIM, 'utf8').digest('base64');

const ICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23D18A44' d='M12 1 13.76 7.75 19.78 4.22 16.25 10.24 23 12 16.25 13.76 19.78 19.78 13.76 16.25 12 23 10.24 16.25 4.22 19.78 7.75 13.76 1 12 7.75 10.24 4.22 4.22 10.24 7.75 Z'/%3E%3C/svg%3E">`;

/* ---------- lähteen paloittelu ---------- */

function parseSource(file) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  const bodyOpen = html.indexOf('<body class="t3">');
  const bodyClose = html.lastIndexOf('</body>');
  if (bodyOpen < 0 || bodyClose < 0) throw new Error(`${file}: <body class="t3"> puuttuu`);
  const bodyStart = bodyOpen + '<body class="t3">'.length;
  const body = html.slice(bodyStart, bodyClose);

  const mainOpen = body.indexOf('<main id="main">');
  const mainClose = body.lastIndexOf('</main>');
  if (mainOpen < 0 || mainClose < 0) throw new Error(`${file}: <main id="main"> puuttuu`);
  return {
    full: html,
    /* mainInnerin absoluuttinen offset koko tiedostossa — katselmusdiffin rivikartoitusta varten */
    mainAbs: bodyStart + mainOpen + '<main id="main">'.length,
    preMain: body.slice(0, mainOpen),
    mainInner: body.slice(mainOpen + '<main id="main">'.length, mainClose),
    postMain: body.slice(mainClose + '</main>'.length),
  };
}

/* Poimii .page-divit tasapainotetulla div-laskennalla (sisäkkäiset divit). */
function extractPages(mainInner, file) {
  const pages = [];
  const open = /<div class="page" id="(p-[\w-]+)"([^>]*)>/g;
  let m;
  while ((m = open.exec(mainInner))) {
    const tok = /<div\b|<\/div>/g;
    tok.lastIndex = m.index;
    let depth = 0, end = -1, t;
    while ((t = tok.exec(mainInner))) {
      depth += t[0] === '</div>' ? -1 : 1;
      if (depth === 0) { end = tok.lastIndex; break; }
    }
    if (end < 0) throw new Error(`${file}: div-tasapaino rikki sivulla ${m[1]}`);
    const attr = name => {
      const a = new RegExp(`${name}="([^"]*)"`).exec(m[2]);
      if (!a) throw new Error(`${file}: ${m[1]} — ${name} puuttuu`);
      return a[1];
    };
    pages.push({
      id: m[1],
      slug: attr('data-slug'),
      title: attr('data-title'),
      desc: attr('data-desc'),
      noindex: / data-noindex="1"/.test(m[2]),
      openTag: m[0],
      start: m.index,
      end,
      html: mainInner.slice(m.index, end),
    });
  }
  if (!pages.length) throw new Error(`${file}: yhtään .page-diviä ei löytynyt`);
  return pages;
}

/* Osioiden id:t katselmustilaa varten: hero-divit ja <section>-elementit saavat
   vakaan id:n (olemassa oleva id säilyy). Sama funktio tuottaa sekä sivun HTML:n
   että manifestin osiorajat, joten ne eivät voi erota toisistaan. */
function annotateSections(pageHtml, slug) {
  const key = slug || 'etusivu';
  let n = 0;
  const units = [];
  /* huom: class="hero" tai "hero jotain" — EI esim. "heroscrim" (etuliiteosuma) */
  const html = pageHtml.replace(/<section\b[^>]*>|<div class="hero(?:"|\s[^"]*")[^>]*>/g, (tag, off) => {
    n++;
    const existing = /\bid="([^"]+)"/.exec(tag);
    const id = existing ? existing[1] : `rev-${key}-${n}`;
    units.push({ id, offset: off });
    if (existing) return tag;
    return tag.replace(/^<(section|div)/, `<$1 id="${id}"`);
  });
  return { html, units };
}

/* ---------- sivun kokoaminen ---------- */

function renderPage(lang, page, source, annotatedHtml) {
  const L = LANGS[lang];
  const url = L.url(page.slug);
  const isFront = page.slug === '';
  const pairSlug = lang === 'fi' ? FI_TO_ET.get(page.slug) : ET_TO_FI.get(page.slug);
  const fi = fiUrl(lang === 'fi' ? page.slug : pairSlug ?? '');
  const et = etUrl(lang === 'et' ? page.slug : pairSlug ?? '');

  /* sivun oma div aktiiviseksi; authoring-attribuutit pois julkaistusta sivusta */
  const cleanOpen = page.openTag
    .replace('class="page"', 'class="page active"')
    .replace(/ data-(slug|title|desc|noindex)="[^"]*"/g, '');
  const pageHtml = cleanOpen + annotatedHtml.slice(page.openTag.length);

  /* navigaatio: aktiivinen linkki + kielivalitsin ristiin vastinsivulle */
  let pre = source.preMain;
  const menuStart = pre.indexOf('<nav class="menu"');
  const menuEnd = pre.indexOf('</nav>', menuStart);
  let menu = pre.slice(menuStart, menuEnd);
  menu = menu.replace(`<a href="${url}">`, `<a href="${url}" class="on">`);
  menu = lang === 'fi'
    ? menu.replace('<a href="/et/" lang="et">EE</a>', `<a href="${et}" lang="et">EE</a>`)
    : menu.replace('<a href="/" lang="fi">FI</a>', `<a href="${fi}" lang="fi">FI</a>`);
  pre = pre.slice(0, menuStart) + menu + pre.slice(menuEnd);

  const shim = isFront ? `<script>${SHIM}</script>\n` : '';
  const robots = page.noindex ? `\n<meta name="robots" content="noindex">` : '';

  return `<!DOCTYPE html>
<!-- GENEROITU TIEDOSTO — älä muokkaa käsin. Lähde: ${L.src} · node scripts/build-pages.mjs -->
<html lang="${L.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${page.title}</title>
<meta name="description" content="${page.desc}">${robots}
<link rel="canonical" href="${BASE}${url}">
<link rel="alternate" hreflang="fi-FI" href="${BASE}${fi}">
<link rel="alternate" hreflang="et-EE" href="${BASE}${et}">
<link rel="alternate" hreflang="x-default" href="${BASE}${fi}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${LANGS[lang].ogLocale}">
<meta property="og:url" content="${BASE}${url}">
<!-- og:image jätetty tarkoituksella pois: odottaa tunnusmerkkipäätöstä -->
${ICON}
<meta name="theme-color" content="#0E1519">
<link href="/assets/fonts.css" rel="stylesheet">
<link href="/assets/site.css" rel="stylesheet">
</head>
<body class="t3">${pre}<main id="main">
${pageHtml}
</main>${source.postMain}
${shim}<script src="/assets/site.js"></script>
</body>
</html>
`;
}

/* ---------- katselmustilan manifesti (assets/review.json) ----------
   Diffaa lähdetiedostot origin/mainia vasten ja kartoittaa muuttuneet rivit
   ympäröivään osioon. Mainissa diff on tyhjä -> tyhjä manifesti -> ei vaikutusta.
   Ei koskaan kaada buildia: virhetilanteessa kirjoitetaan tyhjä manifesti + huomautus. */

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  return r;
}

/* Legacy-normalisointi: jos origin/mainilla ei vielä ole src/-tiedostoja, verrataan
   vanhaan yksisivulähteeseen. Linkit ja polut normalisoidaan, jotta pelkät
   URL-migraation mekaaniset muutokset eivät näy "muutoksina" katselmuksessa. */
function normalizeLegacy(text, lang) {
  const map = { '#/': lang === 'fi' ? '/' : '/et/' };
  for (const [f, e] of PAIRS) {
    if (!f || UNLISTED.has(f)) continue;
    map[`#/${f}`] = fiUrl(f);
    map[`#/${e}`] = etUrl(e);
  }
  return text
    .replace(/href="(#\/[^"]*|#\/)"/g, (m, h) => (map[h] ? `href="${map[h]}"` : m))
    .replace(/(src|href)="assets\//g, '$1="/assets/');
}

/* Nykylähteestä riisutaan authoring-attribuutit ennen diffiä (rivimäärä ei muutu),
   jotta pelkkä attribuutti ei leimaa osiota muuttuneeksi legacy-vertailussa. */
function normalizeCurrent(text) {
  return text
    .replace(/ data-(slug|title|desc|noindex)="[^"]*"/g, '')
    .replace(/ data-cap="[^"]*"/g, '');
}

function diffHunks(baseText, curText, tmp, tag) {
  const a = join(tmp, `base-${tag}`);
  const b = join(tmp, `cur-${tag}`);
  writeFileSync(a, baseText);
  writeFileSync(b, curText);
  const r = git(['diff', '--no-index', '--unified=0', '--', a, b]);
  if (r.status !== 0 && r.status !== 1) throw new Error(`git diff epäonnistui: ${r.stderr}`);
  const out = [];
  for (const m of (r.stdout || '').matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)) {
    out.push({
      oldStart: Number(m[1]),
      oldCount: m[2] === undefined ? 1 : Number(m[2]),
      newStart: Number(m[3]),
      newCount: m[4] === undefined ? 1 : Number(m[4]),
    });
  }
  return out;
}

/* Kuvaa nykytiedoston rivin vastinriville vertailupohjassa diff-hunkkien avulla.
   Hunkin sisällä osuva rivi kuvataan hunkin vanhan puolen alkuun (tai loppuun,
   kun haetaan osion loppurajaa) — katselmusdiffille riittävä tarkkuus. */
function mapNewToOld(line, hunks, isEnd) {
  let delta = 0; // vanha rivi = uusi rivi - delta
  for (const h of hunks) {
    if (h.newCount === 0) {
      if (line > h.newStart) delta += -h.oldCount;
      else break;
    } else if (line >= h.newStart + h.newCount) {
      delta += h.newCount - h.oldCount;
    } else if (line >= h.newStart) {
      return isEnd ? h.oldStart + Math.max(h.oldCount - 1, 0) : h.oldStart;
    } else break;
  }
  return line - delta;
}

/* HTML -> pelkkä tekstisisältö. Tagit ja kommentit korvataan TYHJÄLLÄ, ei välilyönnillä:
   selaimen tekstisolmukävely liimaa tagirajan yli vierekkäiset merkit yhteen
   (esim. <strong>sana</strong>, -> "sana,"), ja sanadiffin molempien puolten on
   jäsennyttävä täsmälleen samoin — muuten raja kohinaa vääriä muutospareja. */
function textOf(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Rivit, jotka ovat pelkkää HTML-kommenttia: eivät näy sivulla, joten ne eivät
   saa leimata osiota muuttuneeksi katselmuksessa. */
function commentOnlyLines(text) {
  const stripped = text.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));
  const a = text.split('\n'), b = stripped.split('\n'), set = new Set();
  for (let i = 0; i < a.length; i++) if (a[i].trim() && !b[i].trim()) set.add(i + 1);
  return set;
}

function buildReviewManifest(langData) {
  const manifest = { changes: [] };
  const tmp = mkdtempSync(join(tmpdir(), 'sama-review-'));
  try {
    for (const { lang, source, pageMeta } of langData) {
      const L = LANGS[lang];
      let baseR = git(['show', `origin/main:${L.src}`]);
      let baseText = null;
      if (baseR.status === 0) baseText = baseR.stdout;
      else {
        const legacyR = git(['show', `origin/main:${L.legacySrc}`]);
        if (legacyR.status === 0) baseText = normalizeLegacy(legacyR.stdout, lang);
      }
      if (baseText === null) throw new Error(`origin/main-vertailukohtaa ei löytynyt (${L.src})`);

      const curText = normalizeCurrent(source.full);
      const hunks = diffHunks(baseText, curText, tmp, lang);
      const flagHunks = hunks
        .filter(h => h.newCount > 0)
        .map(h => ({ ...h, kind: h.oldCount === 0 ? 'new' : 'changed' }));

      /* rivinumero -> sivu -> osio */
      const lineOf = abs => source.full.slice(0, abs).split('\n').length;
      const pages = pageMeta.map(p => ({
        url: p.url,
        startLine: lineOf(source.mainAbs + p.start),
        endLine: lineOf(source.mainAbs + p.end),
        units: p.units.map(u => ({ id: u.id, line: lineOf(source.mainAbs + p.start + u.offset) })),
      }));

      const comments = commentOnlyLines(source.full);
      const seen = new Map(); // "url|id" -> kind
      for (const h of flagHunks) {
        for (let line = h.newStart; line < h.newStart + h.newCount; line++) {
          if (comments.has(line)) continue;
          const pg = pages.find(p => line >= p.startLine && line <= p.endLine);
          if (!pg) continue;
          let unit = null;
          for (const u of pg.units) if (u.line <= line) unit = u; else break;
          if (!unit) continue;
          const key = `${pg.url}|${unit.id}`;
          /* osio on "new" vain jos sen avausrivi itsessään on lisätty rivi */
          const isNew = h.kind === 'new' && unit.line >= h.newStart && unit.line < h.newStart + h.newCount;
          if (!seen.has(key)) seen.set(key, isNew ? 'new' : 'changed');
          else if (seen.get(key) === 'new' && !isNew) seen.set(key, 'new');
        }
      }

      /* muuttuneille osioille talteen aiempi tekstisisältö (sanadiffi selaimessa) */
      const baseLines = baseText.split('\n');
      for (const [key, kind] of seen) {
        const [page, sectionId] = key.split('|');
        const entry = { page, sectionId, kind };
        if (kind === 'changed') {
          const pg = pages.find(p => p.url === page);
          const idx = pg.units.findIndex(u => u.id === sectionId);
          const startLine = pg.units[idx].line;
          const endLine = idx + 1 < pg.units.length ? pg.units[idx + 1].line - 1 : pg.endLine;
          const oS = mapNewToOld(startLine, hunks, false);
          const oE = mapNewToOld(endLine, hunks, true);
          entry.prev = textOf(baseLines.slice(Math.max(oS - 1, 0), oE).join('\n'));
        }
        manifest.changes.push(entry);
      }
    }
  } catch (e) {
    manifest.changes = [];
    manifest.note = `katselmusdiff ei käytettävissä: ${e.message}`;
    console.warn('HUOM: ' + manifest.note);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return manifest;
}

/* ---------- ajo ---------- */

const written = [];
function emit(relPath, content) {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  written.push(relPath);
}

const allUrls = [];
const langData = [];
for (const lang of Object.keys(LANGS)) {
  const L = LANGS[lang];
  const source = parseSource(L.src);
  const pages = extractPages(source.mainInner, L.src);

  const expected = PAIRS.map(([f, e]) => (lang === 'fi' ? f : e)).sort();
  const actual = pages.map(p => p.slug).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`${L.src}: slugit eivät vastaa PAIRS-taulua.\n  odotettu: ${expected}\n  löytyi:   ${actual}`);
  }

  const pageMeta = [];
  for (const page of pages) {
    const url = L.url(page.slug);
    const { html, units } = annotateSections(page.html, page.slug);
    emit(url.replace(/^\//, '') + 'index.html', renderPage(lang, page, source, html));
    if (!UNLISTED.has(page.slug)) allUrls.push(url);
    pageMeta.push({ url, start: page.start, end: page.end, units });
  }
  langData.push({ lang, source, pageMeta });
}

/* sitemap.xml — molemmat kielet; kiitossivut (noindex) jätetään pois */
allUrls.sort();
emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}
</urlset>
`);

/* _headers — CSP sallii inline-skripteistä vain hash-shimin (hash-lähde, ei 'unsafe-inline') */
emit('_headers', `# GENEROITU: node scripts/build-pages.mjs — älä muokkaa käsin (CSP-hash lasketaan shimistä)
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-${SHIM_HASH}'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
`);

/* assets/review.json — katselmustilan manifesti */
const manifest = buildReviewManifest(langData);
emit('assets/review.json', JSON.stringify(manifest, null, 1) + '\n');

console.log(`OK — ${written.length} tiedostoa (review-osioita: ${manifest.changes.length}):`);
for (const f of written) console.log('  ' + f);
