#!/usr/bin/env node
/**
 * SAMA Energia — generoidun sivuston tarkistus.
 * Ajo: node scripts/verify-pages.mjs   (ajetaan aina buildin jälkeen, ei npm-riippuvuuksia)
 *
 * Tarkistaa: sisäiset linkit, hash-linkkien poissaolon, metadatan (title/description/
 * canonical/hreflang), FI–ET-rakennepariteetin, Netlify-lomakkeen, kolmansien osapuolten
 * resurssien poissaolon, sitemapin ja CSP-hashin.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://samaenergia.fi';

const FI = ['', 'energiavarastot', 'aurinko-ja-akku', 'reservimarkkinat', 'prosessi', 'meista', 'yhteystiedot', 'ajankohtaista', 'tietosuoja', 'kiitos'];
const ET = ['', 'energiasalvestid', 'paike-ja-aku', 'reserviturud', 'protsess', 'meist', 'kontakt', 'uudised', 'andmekaitse', 'aitah'];
/* kiitossivut: noindex, ei sitemapissa, ei navigaatiossa, ei legacy-shimissä */
const UNLISTED = new Set(['kiitos', 'aitah']);
const pages = [
  ...FI.map((s, i) => ({ lang: 'fi', slug: s, url: s ? `/${s}/` : '/', pair: ET[i] ? `/et/${ET[i]}/` : '/et/' })),
  ...ET.map((s, i) => ({ lang: 'et', slug: s, url: s ? `/et/${s}/` : '/et/', pair: FI[i] ? `/${FI[i]}/` : '/' })),
];

let errors = 0;
const err = msg => { errors++; console.error('VIRHE: ' + msg); };

function resolves(path) {
  const clean = path.split('#')[0].split('?')[0];
  const abs = join(ROOT, clean.replace(/^\//, ''));
  if (existsSync(abs)) {
    const st = statSync(abs);
    if (st.isDirectory()) return clean.endsWith('/') && existsSync(join(abs, 'index.html'));
    return true;
  }
  return false;
}

const count = (html, re) => (html.match(re) ?? []).length;

for (const p of pages) {
  const file = join(ROOT, p.url.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) { err(`${p.url} — tiedosto puuttuu`); continue; }
  const html = readFileSync(file, 'utf8');
  const where = p.url;

  // hash-linkkejä ei saa olla
  if (/href="#\//.test(html)) err(`${where} — vanha #/-linkki jäljellä`);

  // täsmälleen yksi title, description, canonical
  if (count(html, /<title>/g) !== 1) err(`${where} — title-määrä ≠ 1`);
  if (count(html, /<meta name="description"/g) !== 1) err(`${where} — description-määrä ≠ 1`);
  if (count(html, /<link rel="canonical"/g) !== 1) err(`${where} — canonical-määrä ≠ 1`);
  const canon = /<link rel="canonical" href="([^"]+)">/.exec(html)?.[1];
  if (canon !== BASE + p.url) err(`${where} — canonical väärin: ${canon}`);

  // tyhjät tai jaetut otsikot/kuvaukset
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  if (!title.trim() || !desc.trim()) err(`${where} — tyhjä title tai description`);

  // hreflang-pari + x-default
  const self = p.lang === 'fi' ? 'fi-FI' : 'et-EE';
  const other = p.lang === 'fi' ? 'et-EE' : 'fi-FI';
  if (!html.includes(`<link rel="alternate" hreflang="${self}" href="${BASE}${p.url}">`)) err(`${where} — oma hreflang (${self}) väärin`);
  if (!html.includes(`<link rel="alternate" hreflang="${other}" href="${BASE}${p.pair}">`)) err(`${where} — vastinkielen hreflang väärin (odotettu ${p.pair})`);
  const xdef = p.lang === 'fi' ? p.url : p.pair;
  if (!html.includes(`<link rel="alternate" hreflang="x-default" href="${BASE}${xdef}">`)) err(`${where} — x-default väärin`);

  // og:title/og:description
  if (count(html, /property="og:title"/g) !== 1 || count(html, /property="og:description"/g) !== 1) err(`${where} — og-metat väärin`);
  if (/og:image/.test(html) && !/og:image jätetty/.test(html)) err(`${where} — og:image ei kuulu vielä sivuille`);

  // kiitossivut noindex; muut eivät
  const noindex = html.includes('<meta name="robots" content="noindex">');
  if (UNLISTED.has(p.slug) && !noindex) err(`${where} — noindex puuttuu kiitossivulta`);
  if (!UNLISTED.has(p.slug) && noindex) err(`${where} — noindex ei kuulu tälle sivulle`);
  // kiitossivuihin ei linkitetä navigaatiosta eikä jalasta
  if (!UNLISTED.has(p.slug)) {
    for (const s of ['/kiitos/', '/et/aitah/']) {
      const re = new RegExp(`<(nav|footer)[\\s\\S]*?href="${s.replace(/\//g, '\\/')}"[\\s\\S]*?</\\1>`);
      if (re.test(html)) err(`${where} — kiitossivu linkitetty navigaatiossa/jalassa (${s})`);
    }
  }

  // katselmustilan luokat eivät saa esiintyä staattisessa HTML:ssä (vain client-side)
  if (/rev-mark|rev-lab|rev-banner/.test(html)) err(`${where} — katselmusmerkintöjä staattisessa HTML:ssä`);

  // kaikki sisäiset linkit ja resurssit osoittavat olemassa oleviin tiedostoihin
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (u.startsWith('http://')) { err(`${where} — salaamaton http-linkki: ${u}`); continue; }
    if (u.startsWith('https://') || u.startsWith('mailto:') || u.startsWith('data:') || u.startsWith('#')) continue;
    if (!u.startsWith('/')) { err(`${where} — suhteellinen polku: ${u}`); continue; }
    if (!resolves(u)) err(`${where} — linkki ei osoita tiedostoon: ${u}`);
  }

  // ladattavat resurssit vain omalta palvelimelta (sisältölinkit <a>-elementeissä ja
  // oma host canonical/hreflang-metassa ovat sallittuja)
  for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*?(?:src|href)="((https?:)?\/\/[^"]*)"/g)) {
    if (m[2].startsWith(BASE + '/')) continue;
    err(`${where} — kolmannen osapuolen resurssi: ${m[0].slice(0, 100)}`);
  }
  if (/<form\b[^>]*action="https?:/.test(html)) err(`${where} — lomake postittaa ulos`);

  // inline-skripti vain etusivuilla, ja vain yksi (shim)
  const inline = count(html, /<script>/g);
  const isFront = p.slug === '';
  if (isFront && inline !== 1) err(`${where} — etusivulla oltava täsmälleen 1 inline-skripti (shim), oli ${inline}`);
  if (!isFront && inline !== 0) err(`${where} — alasivulla ei saa olla inline-skriptejä, oli ${inline}`);
}

// Netlify-lomake: molemmilla kielillä, identtiset kenttänimet ja lomakenimi,
// action-kiitossivu no-JS-varapoluksi, pakollisina vain nimi + email
const formFields = html => {
  const form = /<form[^>]*data-netlify="true"[\s\S]*?<\/form>/.exec(html)?.[0];
  if (!form) return null;
  const controls = [...form.matchAll(/<(?:input|select|textarea)\b[^>]*/g)].map(m => m[0]);
  const nameOf = c => /\bname="([^"]+)"/.exec(c)?.[1];
  return {
    name: /<form[^>]*\bname="([^"]+)"/.exec(form)?.[1],
    action: /<form[^>]*\baction="([^"]+)"/.exec(form)?.[1],
    hidden: form.includes('name="form-name" value="kohdekartoitus"'),
    honeypot: /netlify-honeypot="bot-field"/.test(form) && form.includes('name="bot-field"'),
    fields: controls.map(nameOf).filter(Boolean).sort().join(','),
    required: controls.filter(c => /\brequired\b/.test(c)).map(nameOf).sort().join(','),
  };
};
const fiForm = formFields(readFileSync(join(ROOT, 'yhteystiedot/index.html'), 'utf8'));
const etForm = formFields(readFileSync(join(ROOT, 'et/kontakt/index.html'), 'utf8'));
if (!fiForm || !etForm) err('Netlify-lomake puuttuu yhteyssivulta');
else {
  if (fiForm.name !== 'kohdekartoitus' || etForm.name !== 'kohdekartoitus') err('lomakkeen nimi väärin');
  if (fiForm.action !== '/kiitos/') err(`FI-lomakkeen action väärin: ${fiForm.action}`);
  if (etForm.action !== '/et/aitah/') err(`ET-lomakkeen action väärin: ${etForm.action}`);
  if (!fiForm.hidden || !etForm.hidden) err('form-name-piilokenttä puuttuu');
  if (!fiForm.honeypot || !etForm.honeypot) err('honeypot puuttuu');
  if (fiForm.fields !== etForm.fields) err(`lomakekentät eroavat kielittäin:\n  FI: ${fiForm.fields}\n  ET: ${etForm.fields}`);
  if (fiForm.required !== 'email,nimi' || etForm.required !== 'email,nimi') {
    err(`pakollisina oltava täsmälleen nimi + email — FI: [${fiForm.required}] ET: [${etForm.required}]`);
  }
}

// sitemap kattaa täsmälleen kaikki julkiset sivut (kiitossivut pois)
const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const smUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).sort();
const expect = pages.filter(p => !UNLISTED.has(p.slug)).map(p => BASE + p.url).sort();
if (JSON.stringify(smUrls) !== JSON.stringify(expect)) err('sitemap.xml ei vastaa sivujoukkoa (kiitossivujen pitää jäädä pois)');
if (!readFileSync(join(ROOT, 'robots.txt'), 'utf8').includes('Sitemap: ' + BASE + '/sitemap.xml')) err('robots.txt ei viittaa sitemapiin');

// CSP-hash vastaa etusivujen shimiä, molempien etusivujen shim identtinen
const shimOf = f => /<script>([\s\S]*?)<\/script>/.exec(readFileSync(join(ROOT, f), 'utf8'))?.[1];
const shimFi = shimOf('index.html'), shimEt = shimOf('et/index.html');
if (shimFi !== shimEt) err('etusivujen shimit eroavat (CSP-hash kattaa vain yhden)');
const hash = createHash('sha256').update(shimFi ?? '', 'utf8').digest('base64');
const headers = readFileSync(join(ROOT, '_headers'), 'utf8');
if (!headers.includes(`'sha256-${hash}'`)) err('_headers-CSP-hash ei vastaa shimiä');
if (headers.includes("script-src 'self' 'unsafe-inline'")) err("CSP sallii yhä 'unsafe-inline' -skriptit");

// shim kattaa kaikki vanhat slugit (kiitossivut eivät ole legacy-polkuja)
for (const s of [...FI, ...ET].filter(s => s && !UNLISTED.has(s))) {
  if (!shimFi?.includes(`"#/${s}"`)) err(`shim ei tunne vanhaa polkua #/${s}`);
}
for (const s of UNLISTED) {
  if (shimFi?.includes(`"#/${s}"`)) err(`shimissä ylimääräinen polku #/${s}`);
}

// katselmusmanifesti: olemassa, jäsentyy, viittaa olemassa oleviin sivuihin ja osioihin
try {
  const man = JSON.parse(readFileSync(join(ROOT, 'assets/review.json'), 'utf8'));
  if (!Array.isArray(man.changes)) err('review.json: changes ei ole taulukko');
  else for (const c of man.changes) {
    if (!['new', 'changed'].includes(c.kind)) { err(`review.json: tuntematon kind "${c.kind}"`); continue; }
    const pg = pages.find(p => p.url === c.page);
    if (!pg) { err(`review.json: tuntematon sivu ${c.page}`); continue; }
    const html = readFileSync(join(ROOT, c.page.replace(/^\//, ''), 'index.html'), 'utf8');
    if (!html.includes(`id="${c.sectionId}"`)) err(`review.json: osiota ${c.sectionId} ei ole sivulla ${c.page}`);
  }
} catch (e) {
  err('review.json puuttuu tai ei jäsenny: ' + e.message);
}

if (errors) { console.error(`\n${errors} virhettä.`); process.exit(1); }
console.log(`OK — ${pages.length} sivua tarkistettu, ei virheitä.`);
