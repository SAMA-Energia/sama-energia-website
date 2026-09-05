#!/usr/bin/env node
/**
 * SAMA Energia — sivugeneraattori (ulkoasu v5, 03.09.2026).
 *
 * Lähteet:  src/fi.html ja src/et.html (yksi lähdetiedosto per kieli).
 * Tuottaa:  / ja /<slug>/index.html (FI), /et/ ja /et/<slug>/index.html (ET; sisäkkäiset
 *           slugit kuten ajankohtaista/liityntarajoitus-2029 omaan alikansioonsa),
 *           404.html + et/404.html, sitemap.xml, llms-full.txt, _headers (CSP-hashit kaikille
 *           generoiduille inline-lohkoille) sekä assets/review.json (katselmustilan manifesti).
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

const BASE = 'https://samaenergia.fi';
/* ET-sivujen kanoninen host (päätös 2026-08-21): samaenergia.ee palvelee eestinkielisen
   sisällön natiivisti Netlify-rewritellä (_redirects: ee/* -> /et/:splat), joten ET-kanoniset
   osoitteet ovat .ee-hostilla ILMAN /et/-etuliitettä. Ohjaa canonicalit, hreflangit,
   sitemapin, kielivalitsimen, JSON-LD:n ja shimin. */
const ET_BASE = 'https://samaenergia.ee';
const etCanonical = s => ET_BASE + (s ? `/${s}/` : '/');

/* Slugiparit FI ↔ ET (kielivalitsin ja hreflang; tyhjä slug = etusivu). Ulkoasu v5.
   veni-energia ↔ soleron-energy on "aggregaattorisivu": eri kumppani per markkina, mutta sama
   sivu sivuston informaatioarkkitehtuurissa, joten hreflang-pari on oikein. */
const PAIRS = [
  ['', ''],
  ['aurinkosahko', 'paikeseelekter'],
  ['energiavarastot', 'energiasalvestid'],
  ['reservimarkkinat', 'reserviturg'],
  ['veni-energia', 'soleron-energy'],
  ['palvelut', 'teenused'],
  ['meista', 'meist'],
  ['ajankohtaista', 'ulevaated'],
  ['yhteystiedot', 'kontakt'],
  ['tietosuoja', 'andmekaitse'],
  ['kiitos', 'aitah'],
];
/* Parittomat sivut (artikkelit: kummallakin kielellä eri artikkeli): canonical + og,
   hreflang vain itseensä + x-default, mukana sitemapissa. Sisäkkäinen slug -> alikansio. */
const UNPAIRED = { fi: ['ajankohtaista/liityntarajoitus-2029'], et: ['ulevaated/reservitasu-2026'] };
/* Lomakkeen kiitossivut: generoidaan ja paritetaan, mutta ei sitemapiin, ei llms-full.txt:hen,
   ei legacy-shimiin eikä navigaatioon. Sivuilla on data-noindex="1". */
const UNLISTED = new Set(['kiitos', 'aitah']);
/* Ennen v5:tä julkaistut slugit -> uudet (legacy-hash-shim; _redirects hoitaa oikeat URL:t). */
const LEGACY = {
  fi: { 'aurinko-ja-akku': 'aurinkosahko', 'prosessi': 'palvelut' },
  et: { 'paike-ja-aku': 'paikeseelekter', 'reserviturud': 'reserviturg', 'protsess': 'teenused', 'uudised': 'ulevaated' },
};

const FI_TO_ET = new Map(PAIRS);
const ET_TO_FI = new Map(PAIRS.map(([f, e]) => [e, f]));

const LANGS = {
  fi: { src: 'src/fi.html', htmlLang: 'fi', ogLocale: 'fi_FI', url: s => (s ? `/${s}/` : '/'), abs: s => BASE + (s ? `/${s}/` : '/'), og: '/assets/og-fi.png', home: 'Etusivu' },
  et: { src: 'src/et.html', htmlLang: 'et', ogLocale: 'et_EE', url: s => (s ? `/et/${s}/` : '/et/'), abs: etCanonical, og: '/assets/og-et.png', home: 'Avaleht' },
};
const fiUrl = s => LANGS.fi.url(s);
const etUrl = s => LANGS.et.url(s);
const publicSlugs = lang => [
  ...PAIRS.map(([f, e]) => (lang === 'fi' ? f : e)).filter(s => !UNLISTED.has(s)),
  ...UNPAIRED[lang],
];

/* Päävalikon aktiivinen kohta: sivu -> data-nav-avain (pudotusvalikko tai suora linkki). */
const NAV_KEY = {
  fi: { 'aurinkosahko': 'ratkaisut', 'energiavarastot': 'ratkaisut', 'palvelut': 'ratkaisut', 'reservimarkkinat': 'reservimarkkinat', 'veni-energia': 'reservimarkkinat', 'ajankohtaista': 'ajankohtaista', 'ajankohtaista/liityntarajoitus-2029': 'ajankohtaista', 'meista': 'meista', 'yhteystiedot': 'yhteystiedot' },
  et: { 'paikeseelekter': 'lahendused', 'energiasalvestid': 'lahendused', 'teenused': 'lahendused', 'reserviturg': 'reserviturg', 'soleron-energy': 'reserviturg', 'ulevaated': 'ulevaated', 'ulevaated/reservitasu-2026': 'ulevaated', 'meist': 'meist', 'kontakt': 'kontakt' },
};

/* Legacy-hash-shim: vanhat #/-osoitteet (sekä v4:n että v5-luonnoksen #/slug-muodot) ohjataan
   oikeille URL-osoitteille. Vain tunnetut polut (whitelist); kaikki muu jätetään huomiotta.
   Sama skripti molemmilla etusivuilla -> yksi CSP-hash. */
const SHIM_MAP = {};
for (const lang of ['fi', 'et']) {
  for (const s of publicSlugs(lang)) if (s) SHIM_MAP[`#/${s}`] = LANGS[lang].abs(s);
  for (const [old, now] of Object.entries(LEGACY[lang])) SHIM_MAP[`#/${old}`] = LANGS[lang].abs(now);
}
const SHIM = `(function(){var m=${JSON.stringify(SHIM_MAP)};var t=m[location.hash];if(t)location.replace(t)})()`;

/* Kaikkien generoitujen inline-skriptien (shim + JSON-LD-datalohkot) CSP-hashit. JSON-LD on
   datalohko eikä suoritu, mutta hashit listataan silti, jotta mikään selainten tulkintaero ei
   koskaan kaadu CSP:hen. */
const INLINE_HASHES = new Set();
const cspHash = s => { INLINE_HASHES.add(createHash('sha256').update(s, 'utf8').digest('base64')); return s; };
cspHash(SHIM);

/* ---------- HTML -> teksti ---------- */
function textOf(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
/* Tasapainotettu lohko: annetun avaustagin sisältö (sisäkkäiset divit huomioiden). */
function blockAfter(html, openTag) {
  const i = html.indexOf(openTag);
  if (i < 0) return null;
  const tok = /<div\b|<\/div>/g;
  tok.lastIndex = i;
  let depth = 0, t;
  while ((t = tok.exec(html))) {
    depth += t[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(i + openTag.length, t.index);
  }
  throw new Error('div-tasapaino rikki: ' + openTag);
}

/* ---------- rakenteinen data (JSON-LD) ----------
   ProfessionalService etusivuille, BreadcrumbList jokaiselle alasivulle (sivun omista
   murupoluista), FAQPage jokaiselle sivulle jolla on .faq-list (details/summary), Article
   artikkelisivuille. Tekstit poimitaan sivun omasta HTML:stä, jotta merkintä vastaa näkyvää. */
const ORG = {
  '@type': 'Organization',
  name: 'SAMA Energia',
  legalName: 'SAMA Energia Oy',
  url: BASE + '/',
  logo: BASE + '/assets/mark.png',
};

function orgJsonLd(lang, canon) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': canon + '#organization',
    name: 'SAMA Energia',
    legalName: 'SAMA Energia Oy',
    vatID: 'FI36476833',
    url: canon,
    logo: BASE + '/assets/mark.png',
    image: (lang === 'fi' ? BASE : ET_BASE) + LANGS[lang].og,
    address: { '@type': 'PostalAddress', addressLocality: 'Helsinki', addressCountry: 'FI' },
    areaServed: [{ '@type': 'Country', name: 'Finland' }, { '@type': 'Country', name: 'Estonia' }],
    availableLanguage: ['fi', 'et'],
    founder: [
      { '@type': 'Person', name: 'Martin Rautio' },
      { '@type': 'Person', name: 'Madis Maastik' },
    ],
    knowsAbout: [
      'battery energy storage', 'reserve markets FCR, aFRR and mFRR', 'peak shaving',
      'solar PV', 'Fingrid', 'Elering',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+358 449 654 614',
      email: 'madis.maastik@samaenergia.fi',
      contactType: 'customer service',
      availableLanguage: ['fi', 'et'],
    },
  };
}

function breadcrumbJsonLd(pageHtml, lang, canon, src) {
  const m = /<p class="crumbs"[^>]*>([\s\S]*?)<\/p>/.exec(pageHtml);
  if (!m) return null;
  const items = [];
  for (const a of m[1].matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = a[1];
    if (!href.startsWith('/')) throw new Error(`${src}: murupolun linkki ei ole sisäinen: ${href}`);
    items.push({ name: textOf(a[2]), item: (lang === 'fi' ? BASE : ET_BASE) + href });
  }
  const last = [...m[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].pop();
  if (!last) throw new Error(`${src}: murupolun viimeinen kohta puuttuu`);
  items.push({ name: textOf(last[1]), item: canon });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.item })),
  };
}

function faqJsonLd(pageHtml, src) {
  const list = blockAfter(pageHtml, '<div class="faq-list">');
  if (list === null) return null;
  const pairs = [...list.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<span class="plus">[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g)]
    .map(m => [textOf(m[1]), textOf(m[2].replace(/<\/p>/g, '</p> '))]);
  if (!pairs.length) throw new Error(`${src}: .faq-list ilman details/summary-pareja`);
  for (const [q, a] of pairs) if (!q || !a) throw new Error(`${src}: tyhjä UKK-kysymys tai -vastaus`);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

const MONTHS = {
  fi: ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'],
  et: ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'],
};
function isoDate(visible, lang, src) {
  const m = /^(\d{1,2})\.\s*([^\s]+)\s+(\d{4})$/.exec(visible.trim());
  const mi = m ? MONTHS[lang].indexOf(m[2].toLowerCase()) : -1;
  if (!m || mi < 0) throw new Error(`${src}: artikkelin päivämäärää ei voi jäsentää: "${visible}"`);
  return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
function articleJsonLd(page, lang, canon, src) {
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(page.html);
  const meta = /<div class="ameta">([\s\S]*?)<\/div>/.exec(page.html);
  if (!h1 || !meta) throw new Error(`${src}: artikkelin h1 tai ameta puuttuu (${page.slug})`);
  const spans = [...meta[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(m => textOf(m[1]));
  const visibleDate = spans.find(s => /^\d{1,2}\.\s*\S+\s+\d{4}$/.test(s));
  if (!visibleDate) throw new Error(`${src}: artikkelin näkyvä päivämäärä puuttuu (${page.slug})`);
  const date = isoDate(visibleDate, lang, src);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: textOf(h1[1]),
    description: page.desc,
    datePublished: date,
    dateModified: date,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canon },
    image: (lang === 'fi' ? BASE : ET_BASE) + LANGS[lang].og,
    author: { '@type': 'Person', name: 'Madis Maastik', jobTitle: lang === 'fi' ? 'Myyntijohtaja ja perustaja' : 'Müügijuht ja asutaja' },
    publisher: ORG,
  };
}

function jsonLdFor(page, lang, canon) {
  const src = LANGS[lang].src;
  const blocks = [];
  if (page.id === 'p-home') blocks.push(orgJsonLd(lang, canon));
  else {
    const bc = breadcrumbJsonLd(page.html, lang, canon, src);
    if (!bc) throw new Error(`${src}: alasivulta ${page.slug} puuttuu murupolku (.crumbs)`);
    blocks.push(bc);
  }
  if (page.id.startsWith('p-art-')) blocks.push(articleJsonLd(page, lang, canon, src));
  const faq = faqJsonLd(page.html, src);
  if (faq) blocks.push(faq);
  return blocks.map(b => `<script type="application/ld+json">${cspHash(JSON.stringify(b))}</script>\n`).join('');
}

/* Kaheksakand-favicon kullalla (v5); vaalea sivusto -> theme-color valkoinen */
const ICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23C9A227' d='M12 1 13.76 7.75 19.78 4.22 16.25 10.24 23 12 16.25 13.76 19.78 19.78 13.76 16.25 12 23 10.24 16.25 4.22 19.78 7.75 13.76 1 12 7.75 10.24 4.22 4.22 10.24 7.75 Z'/%3E%3C/svg%3E">`;
const THEME = '<meta name="theme-color" content="#FFFFFF">';

/* Kriittiset esilataukset: otsikkofontti (pysty + kursiivi, jokaisessa h1:ssä on kursiivi) ja
   leipäfontti. Latin-osajoukot kattavat suomen ja viron perusmerkit; latin-ext latautuu tarvittaessa. */
const PRELOADS = [
  '<link rel="preload" href="/assets/fonts/newsreader-latin-variable-normal.woff2" as="font" type="font/woff2" crossorigin>',
  '<link rel="preload" href="/assets/fonts/newsreader-latin-variable-italic.woff2" as="font" type="font/woff2" crossorigin>',
  '<link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
].join('\n');
/* Etusivujen hero-kuvakokeilu (05.09.2026): kuva on LCP-ehdokas, esiladataan vain etusivuilla. */
const HERO_IMG_PRELOAD = '<link rel="preload" as="image" href="/assets/hero-voimalinja-sky.webp" fetchpriority="high">';

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

/* Osioiden id:t katselmustilaa varten: <section>-elementit ja hero-divit saavat vakaan id:n
   (olemassa oleva id säilyy). Sama funktio tuottaa sekä sivun HTML:n että manifestin osiorajat. */
function annotateSections(pageHtml, slug) {
  const key = (slug || 'etusivu').replace(/\//g, '-');
  let n = 0;
  const units = [];
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

/* Yhteinen kromi: kielivalitsin kanoniseen ristihostiin, aktiivinen valikkokohta. */
function chrome(lang, source, page, fiAbs, etAbs) {
  const swap = s => (lang === 'fi'
    ? s.split('<a href="/et/" lang="et">EE</a>').join(`<a href="${etAbs}" lang="et">EE</a>`)
    : s.split('<a href="/" lang="fi">FI</a>').join(`<a href="${fiAbs}" lang="fi">FI</a>`));
  let pre = swap(source.preMain);
  const post = swap(source.postMain);
  const key = page && NAV_KEY[lang][page.slug];
  if (key) {
    pre = pre
      .replace(`<div class="dd" data-nav="${key}">`, `<div class="dd active" data-nav="${key}">`)
      .replace(new RegExp(`(<a href="[^"]*" data-nav="${key}")>`), '$1 class="active">');
  }
  return { pre, post };
}

function head(lang, { title, desc, canon, fiAbs, etAbs, unpaired, noindex, jsonld, front }) {
  const L = LANGS[lang];
  const ogAbs = (lang === 'fi' ? BASE : ET_BASE) + L.og;
  const alternates = unpaired
    ? [`<link rel="alternate" hreflang="${lang === 'fi' ? 'fi-FI' : 'et-EE'}" href="${canon}">`, `<link rel="alternate" hreflang="x-default" href="${canon}">`]
    : [`<link rel="alternate" hreflang="fi-FI" href="${fiAbs}">`, `<link rel="alternate" hreflang="et-EE" href="${etAbs}">`, `<link rel="alternate" hreflang="x-default" href="${fiAbs}">`];
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">${noindex ? '\n<meta name="robots" content="noindex">' : ''}
${canon ? `<link rel="canonical" href="${canon}">\n${alternates.join('\n')}` : ''}
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${L.ogLocale}">${canon ? `\n<meta property="og:url" content="${canon}">` : ''}
<meta property="og:image" content="${ogAbs}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${jsonld}${ICON}
${THEME}
${PRELOADS}${front ? '\n' + HERO_IMG_PRELOAD : ''}
<link href="/assets/fonts.css" rel="stylesheet">
<link href="/assets/site.css" rel="stylesheet">`;
}

const MARKER = L => `<!-- GENEROITU TIEDOSTO — ÄLÄ MUOKKAA TÄTÄ TIEDOSTOA: kaikki tekstit muokataan tiedostoissa src/fi.html ja src/et.html; build ylikirjoittaa tämän tiedoston. / GENEREERITUD FAIL — ÄRA MUUDA SEDA FAILI: kõik tekstid muudetakse failides src/et.html ja src/fi.html; build kirjutab selle faili üle. Lähde/allikas: ${L.src} · node scripts/build-pages.mjs -->`;

/* Julkaistuista sivuista riisutaan HTML-kommentit (työkommentit ym. jäävät vain lähteisiin);
   ainoaksi kommentiksi lisätään generointimerkintä. verify-pages.mjs valvoo. */
function finalize(doc, L) {
  const stripped = doc
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n[ \t]*\n([ \t]*\n)+/g, '\n\n');
  return stripped.replace('<!DOCTYPE html>\n', `<!DOCTYPE html>\n${MARKER(L)}\n`);
}

function renderPage(lang, page, source, annotatedHtml) {
  const L = LANGS[lang];
  const isFront = page.slug === '';
  const unpaired = UNPAIRED[lang].includes(page.slug);
  const pairSlug = lang === 'fi' ? FI_TO_ET.get(page.slug) : ET_TO_FI.get(page.slug);
  if (!unpaired && pairSlug === undefined) throw new Error(`${L.src}: slugilla ${page.slug} ei ole paria eikä se ole UNPAIRED-listalla`);
  const fiSlug = lang === 'fi' ? page.slug : pairSlug;
  const etSlug = lang === 'et' ? page.slug : pairSlug;
  const fiAbs = unpaired ? (lang === 'fi' ? L.abs(page.slug) : BASE + '/') : LANGS.fi.abs(fiSlug);
  const etAbs = unpaired ? (lang === 'et' ? L.abs(page.slug) : ET_BASE + '/') : LANGS.et.abs(etSlug);
  const canon = L.abs(page.slug);

  /* authoring-attribuutit pois julkaistusta sivusta */
  const cleanOpen = page.openTag.replace(/ data-(slug|title|desc|noindex)="[^"]*"/g, '');
  const pageHtml = cleanOpen + annotatedHtml.slice(page.openTag.length);

  const { pre, post } = chrome(lang, source, page, fiAbs, etAbs);
  const shim = isFront ? `<script>${SHIM}</script>\n` : '';
  const jsonld = jsonLdFor(page, lang, canon);

  const doc = `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
${head(lang, { title: page.title, desc: page.desc, canon, fiAbs, etAbs, unpaired, noindex: page.noindex, jsonld, front: isFront })}
</head>
<body class="t3">${pre}<main id="main">
${pageHtml}
</main>${post}
${shim}<script src="/assets/site.js"></script>
</body>
</html>
`;
  return finalize(doc, L);
}

/* 404-sivut: FI-versio juuressa (/404.html), ET-versio et/404.html (.ee-hostin sääntö _redirectsissä).
   Kumpikin kaksikielinen, oma kieli ensin; noindex; ei canonicalia. */
const NOT_FOUND = {
  fi: { title: 'Sivua ei löytynyt · Lehte ei leitud — SAMA Energia', desc: 'Sivua ei löytynyt. Osoite on voinut muuttua — etusivulta löydätte kaiken.', h: 'Sivua ei löytynyt.', p: 'Osoite on voinut muuttua — sivusto siirtyi uusiin osoitteisiin. Etusivulta löydätte kaiken.', btn: 'Suomeksi etusivulle', href: '/' },
  et: { title: 'Lehte ei leitud · Sivua ei löytynyt — SAMA Energia', desc: 'Lehte ei leitud. Aadress võib olla muutunud — avalehelt leiate kõik.', h: 'Lehte ei leitud.', p: 'Aadress võib olla muutunud — sait kolis uutele aadressidele. Avalehelt leiate kõik.', btn: 'Eesti keeles avalehele', href: '/et/' },
};
function render404(lang, sources) {
  const L = LANGS[lang];
  const me = NOT_FOUND[lang], other = NOT_FOUND[lang === 'fi' ? 'et' : 'fi'];
  const otherLang = lang === 'fi' ? 'et' : 'fi';
  const { pre, post } = chrome(lang, sources[lang], null, BASE + '/', ET_BASE + '/');
  const doc = `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
${head(lang, { title: me.title, desc: me.desc, canon: '', fiAbs: '', etAbs: '', unpaired: true, noindex: true, jsonld: '' })}
</head>
<body class="t3">${pre}<main id="main">
<div class="page" id="p-404">
<section class="subhero plain">
  <div class="wrap">
    <p class="crumbs"><span>404</span></p>
    <h1>${me.h}</h1>
    <p class="lead">${me.p}</p>
    <div class="hero-cta" style="margin-top:26px"><a class="btn btn-primary" href="${me.href}">${me.btn}</a></div>
  </div>
</section>
<section class="section" lang="${otherLang}">
  <div class="wrap">
    <h2>${other.h}</h2>
    <p class="lead" style="margin-top:14px">${other.p}</p>
    <div class="hero-cta" style="margin-top:26px"><a class="btn btn-ghost" href="${other.href}">${other.btn}</a></div>
  </div>
</section>
</div>
</main>${post}
<script src="/assets/site.js"></script>
</body>
</html>
`;
  return finalize(doc, L);
}

/* ---------- llms-full.txt: jokaisen julkisen sivun pelkkä teksti ---------- */
function plainText(pageHtml) {
  return pageHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .replace(/<p hidden[\s\S]*?<\/p>/g, '')
    .replace(/<\/(h1|h2|h3|h4|p|li|tr|dd|dt|summary|details|blockquote|figcaption|div|section|article|ul|ol|table|form)>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(td|th)>/g, ' · ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?· ?\n/g, '\n')
    .replace(/^ +| +$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ---------- katselmustilan manifesti (assets/review.json) ----------
   Diffaa lähdetiedostot origin/mainia vasten ja kartoittaa muuttuneet rivit ympäröivään osioon.
   Mainissa diff on tyhjä -> tyhjä manifesti -> ei vaikutusta. Ei koskaan kaada buildia. */

function git(args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

/* Nykylähteestä riisutaan authoring-attribuutit ennen diffiä (rivimäärä ei muutu). */
function normalizeCurrent(text) {
  return text.replace(/ data-(slug|title|desc|noindex)="[^"]*"/g, '');
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

function mapNewToOld(line, hunks, isEnd) {
  let delta = 0;
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
      const baseR = git(['show', `origin/main:${L.src}`]);
      if (baseR.status !== 0) throw new Error(`origin/main-vertailukohtaa ei löytynyt (${L.src})`);
      const baseText = baseR.stdout;
      const curText = normalizeCurrent(source.full);
      const hunks = diffHunks(baseText, curText, tmp, lang);
      const baseLines = baseText.split('\n');
      const curLines = curText.split('\n');
      const hunkTextSame = h => {
        const oldT = textOf(baseLines.slice(h.oldStart - 1, h.oldStart - 1 + h.oldCount).join(' '));
        const newT = textOf(curLines.slice(h.newStart - 1, h.newStart - 1 + h.newCount).join(' '));
        return oldT === newT;
      };
      const flagHunks = hunks
        .filter(h => h.newCount > 0 && !hunkTextSame(h))
        .map(h => ({ ...h, kind: h.oldCount === 0 ? 'new' : 'changed' }));

      const lineOf = abs => source.full.slice(0, abs).split('\n').length;
      const pages = pageMeta.map(p => ({
        url: p.url,
        startLine: lineOf(source.mainAbs + p.start),
        endLine: lineOf(source.mainAbs + p.end),
        units: p.units.map(u => ({ id: u.id, line: lineOf(source.mainAbs + p.start + u.offset) })),
      }));

      const comments = commentOnlyLines(source.full);
      const seen = new Map();
      for (const h of flagHunks) {
        for (let line = h.newStart; line < h.newStart + h.newCount; line++) {
          if (comments.has(line)) continue;
          const pg = pages.find(p => line >= p.startLine && line <= p.endLine);
          if (!pg) continue;
          let unit = null;
          for (const u of pg.units) if (u.line <= line) unit = u; else break;
          if (!unit) continue;
          const key = `${pg.url}|${unit.id}`;
          const isNew = h.kind === 'new' && unit.line >= h.newStart && unit.line < h.newStart + h.newCount;
          if (!seen.has(key)) seen.set(key, isNew ? 'new' : 'changed');
          else if (seen.get(key) === 'new' && !isNew) seen.set(key, 'new');
        }
      }
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
          /* Lähes kokonaan uudelleenkirjoitettu osio (alle neljännes sanoista yhteisiä) merkitään
             UUDEKSI ilman prev-tekstiä: sanadiffi olisi pelkkää kohinaa, eikä vanhaa tekstiä
             kanneta manifestissa mukana. */
          const cur = textOf(curLines.slice(startLine - 1, endLine).join('\n'));
          const words = t => new Set(t.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 2));
          const a = words(entry.prev), b = words(cur);
          let common = 0; for (const w of a) if (b.has(w)) common++;
          if (!a.size || common / Math.max(a.size, b.size) < 0.25) { entry.kind = 'new'; delete entry.prev; }
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
const sources = {};
const llmsParts = [];
for (const lang of Object.keys(LANGS)) {
  const L = LANGS[lang];
  const source = parseSource(L.src);
  sources[lang] = source;
  const pages = extractPages(source.mainInner, L.src);

  const expected = [...PAIRS.map(([f, e]) => (lang === 'fi' ? f : e)), ...UNPAIRED[lang]].sort();
  const actual = pages.map(p => p.slug).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`${L.src}: slugit eivät vastaa PAIRS + UNPAIRED -tauluja.\n  odotettu: ${expected}\n  löytyi:   ${actual}`);
  }
  const ids = pages.map(p => p.id);
  if (new Set(ids).size !== ids.length) throw new Error(`${L.src}: sivun id toistuu`);

  const pageMeta = [];
  for (const page of pages) {
    const url = L.url(page.slug);
    const { html, units } = annotateSections(page.html, page.slug);
    emit(url.replace(/^\//, '') + 'index.html', renderPage(lang, page, source, html));
    if (!UNLISTED.has(page.slug)) {
      allUrls.push(L.abs(page.slug));
      llmsParts.push({ lang, slug: page.slug, title: page.title, url: L.abs(page.slug), text: plainText(page.html) });
    }
    /* katselmusmanifestiin NÄKYVÄ polku: ET-alasivut paljaalla slugilla, ET-etusivu /et/ */
    const revUrl = lang === 'fi' ? url : (page.slug ? `/${page.slug}/` : '/et/');
    pageMeta.push({ url: revUrl, start: page.start, end: page.end, units });
  }
  langData.push({ lang, source, pageMeta });
}
/* sivuavainten on oltava samat molemmissa kielissä (parittomia artikkeleita lukuun ottamatta) */
{
  const keys = lang => new Set(extractPages(sources[lang].mainInner, LANGS[lang].src).map(p => p.id).filter(id => !id.startsWith('p-art-')));
  const a = [...keys('fi')].sort(), b = [...keys('et')].sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`sivujen id-avaimet eroavat kielittäin:\n  fi: ${a}\n  et: ${b}`);
}

emit('404.html', render404('fi', sources));
emit('et/404.html', render404('et', sources));

/* sitemap.xml — molemmat kielet + parittomat artikkelit; kiitossivut (noindex) jätetään pois */
allUrls.sort();
emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);

/* llms-full.txt — jokaisen julkisen sivun teksti molemmilla kielillä */
emit('llms-full.txt', `# SAMA Energia — full text of every public page (Finnish: samaenergia.fi, Estonian: samaenergia.ee)

> Generated by node scripts/build-pages.mjs from the same page HTML that is served. The customer-facing
> content is Finnish and Estonian; llms.txt carries the English summary. One heading per page: title — URL.

${llmsParts.map(p => `# ${p.title} — ${p.url}\n\n${p.text}\n`).join('\n')}`);

/* _headers — CSP sallii inline-lohkoista vain generoidut (shim + JSON-LD) hash-lähteinä,
   ei 'unsafe-inline'. Kaikki sivut on generoitu ennen tätä. */
const hashList = [...INLINE_HASHES].sort().map(h => `'sha256-${h}'`).join(' ');
emit('_headers', `# GENEROITU: node scripts/build-pages.mjs — älä muokkaa käsin (CSP-hashit lasketaan inline-lohkoista)
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' ${hashList}; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
`);

/* assets/review.json — katselmustilan manifesti */
const manifest = buildReviewManifest(langData);
emit('assets/review.json', JSON.stringify(manifest, null, 1) + '\n');

console.log(`OK — ${written.length} tiedostoa (review-osioita: ${manifest.changes.length}):`);
for (const f of written) console.log('  ' + f);
