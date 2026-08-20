#!/usr/bin/env node
/**
 * SAMA Energia — sivugeneraattori.
 *
 * Lähteet:  src/fi.html ja src/et.html (yksi lähdetiedosto per kieli).
 * Tuottaa:  / ja /<slug>/index.html (FI), /et/ ja /et/<slug>/index.html (ET),
 *           sitemap.xml sekä _headers (CSP-hash etusivujen hash-shimille).
 * Ajo:      node scripts/build-pages.mjs   (ei npm-riippuvuuksia)
 *
 * Generoidut tiedostot committoidaan — Netlify julkaisee repon sellaisenaan,
 * build-vaihetta ei ole palvelimella.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* TODO (2026-08-20): canonical- ja hreflang-URL:t osoittavat .fi-hostiin myös
   ET-sivuilla, koska samaenergia.ee 301-ohjaa tänne eikä palvele sisältöä.
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
];
const FI_TO_ET = new Map(PAIRS);
const ET_TO_FI = new Map(PAIRS.map(([f, e]) => [e, f]));

const LANGS = {
  fi: { src: 'src/fi.html', htmlLang: 'fi', ogLocale: 'fi_FI', url: s => (s ? `/${s}/` : '/') },
  et: { src: 'src/et.html', htmlLang: 'et', ogLocale: 'et_EE', url: s => (s ? `/et/${s}/` : '/et/') },
};
const fiUrl = s => LANGS.fi.url(s);
const etUrl = s => LANGS.et.url(s);

/* Legacy-hash-shim: vanhat #/-osoitteet ohjataan oikeille URL-osoitteille.
   Vain tunnetut polut (whitelist); kaikki muu jätetään huomiotta.
   Sama skripti molemmilla etusivuilla -> yksi CSP-hash. */
const SHIM_MAP = Object.fromEntries(
  PAIRS.filter(([f]) => f).flatMap(([f, e]) => [
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
  const body = html.slice(bodyOpen + '<body class="t3">'.length, bodyClose);

  const mainOpen = body.indexOf('<main id="main">');
  const mainClose = body.lastIndexOf('</main>');
  if (mainOpen < 0 || mainClose < 0) throw new Error(`${file}: <main id="main"> puuttuu`);
  return {
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
      openTag: m[0],
      html: mainInner.slice(m.index, end),
    });
  }
  if (!pages.length) throw new Error(`${file}: yhtään .page-diviä ei löytynyt`);
  return pages;
}

/* ---------- sivun kokoaminen ---------- */

function renderPage(lang, page, source) {
  const L = LANGS[lang];
  const url = L.url(page.slug);
  const isFront = page.slug === '';
  const pairSlug = lang === 'fi' ? FI_TO_ET.get(page.slug) : ET_TO_FI.get(page.slug);
  const fi = fiUrl(lang === 'fi' ? page.slug : pairSlug ?? '');
  const et = etUrl(lang === 'et' ? page.slug : pairSlug ?? '');

  /* sivun oma div aktiiviseksi; authoring-attribuutit pois julkaistusta sivusta */
  const cleanOpen = page.openTag
    .replace('class="page"', 'class="page active"')
    .replace(/ data-(slug|title|desc)="[^"]*"/g, '');
  const pageHtml = cleanOpen + page.html.slice(page.openTag.length);

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

  return `<!DOCTYPE html>
<!-- GENEROITU TIEDOSTO — älä muokkaa käsin. Lähde: ${L.src} · node scripts/build-pages.mjs -->
<html lang="${L.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${page.title}</title>
<meta name="description" content="${page.desc}">
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

/* ---------- ajo ---------- */

const written = [];
function emit(relPath, content) {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  written.push(relPath);
}

const allUrls = [];
for (const lang of Object.keys(LANGS)) {
  const L = LANGS[lang];
  const source = parseSource(L.src);
  const pages = extractPages(source.mainInner, L.src);

  const expected = PAIRS.map(([f, e]) => (lang === 'fi' ? f : e)).sort();
  const actual = pages.map(p => p.slug).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`${L.src}: slugit eivät vastaa PAIRS-taulua.\n  odotettu: ${expected}\n  löytyi:   ${actual}`);
  }

  for (const page of pages) {
    const url = L.url(page.slug);
    emit(url.replace(/^\//, '') + 'index.html', renderPage(lang, page, source));
    allUrls.push(url);
  }
}

/* sitemap.xml — molemmat kielet */
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

console.log(`OK — ${written.length} tiedostoa:`);
for (const f of written) console.log('  ' + f);
