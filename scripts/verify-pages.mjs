#!/usr/bin/env node
/**
 * SAMA Energia — generoidun sivuston tarkistus (ulkoasu v5, 03.09.2026).
 * Ajo: node scripts/verify-pages.mjs   (ajetaan aina buildin jälkeen, ei npm-riippuvuuksia)
 *
 * Tarkistaa: sisäiset linkit ja ankkurit, hash-linkkien ja luonnosjäämien poissaolon, metadatan
 * (title/description/canonical/hreflang/og), semanttisen rungon (yksi h1, main, header, footer,
 * nav), FI–ET-rakennepariteetin, Netlify-lomakkeet, kolmansien osapuolten resurssien poissaolon,
 * JSON-LD:n, sitemapin, llms-full.txt:n, _redirects-säännöt, 404-sivut ja CSP-hashit.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://samaenergia.fi';
/* ET-kanoninen host — pidettävä samana kuin build-pages.mjs:n ET_BASE */
const ET_BASE = 'https://samaenergia.ee';
/* sivun kanoninen absoluuttinen URL: FI .fi-hostilla, ET .ee-hostilla ilman /et/-etuliitettä */
const abs = (lang, url) => (lang === 'fi' ? BASE + url : ET_BASE + (url === '/et/' ? '/' : url.replace(/^\/et/, '')));

/* Tietoiset kohatäitteet draft-haaralla (sivu+merkintä-parit). Lista on TYHJÄ: kaikki kohatäitteet
   kaatavat buildin. Uusi waiver vain perustajan päätöksellä, syy kommenttiin. */
const PLACEHOLDER_WAIVERS = [];

/* Pidettävä samana kuin build-pages.mjs:n PAIRS / UNPAIRED / UNLISTED / LEGACY. */
const PAIRS = [
  ['', ''], ['aurinkosahko', 'paikeseelekter'], ['energiavarastot', 'energiasalvestid'],
  ['reservimarkkinat', 'reserviturg'], ['veni-energia', 'soleron-energy'], ['palvelut', 'teenused'],
  ['meista', 'meist'], ['ajankohtaista', 'ulevaated'], ['yhteystiedot', 'kontakt'],
  ['tietosuoja', 'andmekaitse'], ['kiitos', 'aitah'],
];
const UNPAIRED = { fi: ['ajankohtaista/liityntarajoitus-2029'], et: ['ulevaated/reservitasu-2026'] };
const UNLISTED = new Set(['kiitos', 'aitah']);
const LEGACY = {
  fi: { 'aurinko-ja-akku': 'aurinkosahko', 'prosessi': 'palvelut' },
  et: { 'paike-ja-aku': 'paikeseelekter', 'reserviturud': 'reserviturg', 'protsess': 'teenused', 'uudised': 'ulevaated' },
};
const FI = PAIRS.map(p => p[0]);
const ET = PAIRS.map(p => p[1]);
const fiUrl = s => (s ? `/${s}/` : '/');
const etUrl = s => (s ? `/et/${s}/` : '/et/');
const pages = [
  ...FI.map((s, i) => ({ lang: 'fi', slug: s, url: fiUrl(s), pair: etUrl(ET[i]), unpaired: false })),
  ...UNPAIRED.fi.map(s => ({ lang: 'fi', slug: s, url: fiUrl(s), pair: null, unpaired: true })),
  ...ET.map((s, i) => ({ lang: 'et', slug: s, url: etUrl(s), pair: fiUrl(FI[i]), unpaired: false })),
  ...UNPAIRED.et.map(s => ({ lang: 'et', slug: s, url: etUrl(s), pair: null, unpaired: true })),
];
/* ylätason slugit (sisäkkäisen slugin ensimmäinen osa kuuluu ylätason sivulle) */
const FI_TOP = new Set([...FI, ...UNPAIRED.fi.map(s => s.split('/')[0])].filter(Boolean));
const ET_TOP = new Set([...ET, ...UNPAIRED.et.map(s => s.split('/')[0])].filter(Boolean));

let errors = 0;
const err = msg => { errors++; console.error('VIRHE: ' + msg); };
const count = (html, re) => (html.match(re) ?? []).length;
const read = rel => readFileSync(join(ROOT, rel), 'utf8');

function resolves(path) {
  let clean = path.split('#')[0].split('?')[0];
  /* paljas ET-slug palvellaan et/-kansiosta _redirectsin yleisellä uudelleenkirjoituksella */
  const seg = clean.split('/')[1];
  if (ET_TOP.has(seg)) clean = '/et' + clean;
  const file = join(ROOT, clean.replace(/^\//, ''));
  if (existsSync(file)) {
    const st = statSync(file);
    if (st.isDirectory()) return clean.endsWith('/') && existsSync(join(file, 'index.html'));
    return true;
  }
  return false;
}

const headers = read('_headers');
const forms = [];

for (const p of pages) {
  const file = join(ROOT, p.url.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) { err(`${p.url} — tiedosto puuttuu`); continue; }
  const html = readFileSync(file, 'utf8');
  const where = p.url;
  const isFront = p.slug === '';
  const canonExp = abs(p.lang, p.url);

  /* luonnosjäämät ja hash-linkit */
  if (/href="#\//.test(html)) err(`${where} — vanha #/-linkki jäljellä`);
  if (/googleapis|gstatic/.test(html)) err(`${where} — Google Fonts -viittaus`);
  if (/<aside class="note"/.test(html)) err(`${where} — katselmuslappu (aside.note) julkaistussa HTML:ssä`);
  if (/review-pill|data-slot=|standalone\.html/.test(html)) err(`${where} — luonnoksen katselmuselementtejä jäljellä`);
  if (/src="data:image\/png/.test(html)) err(`${where} — base64-kuva jäljellä (kuvat pitää irrottaa assets/-kansioon)`);

  /* täsmälleen yksi title, description, canonical */
  if (count(html, /<title>/g) !== 1) err(`${where} — title-määrä ≠ 1`);
  if (count(html, /<meta name="description"/g) !== 1) err(`${where} — description-määrä ≠ 1`);
  if (count(html, /<link rel="canonical"/g) !== 1) err(`${where} — canonical-määrä ≠ 1`);
  const canon = /<link rel="canonical" href="([^"]+)">/.exec(html)?.[1];
  if (canon !== canonExp) err(`${where} — canonical väärin: ${canon} (odotettu ${canonExp})`);
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  if (!title.trim() || !desc.trim()) err(`${where} — tyhjä title tai description`);

  /* hreflang: parit kolmikkona, parittomat vain itseensä + x-default */
  const hl = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]);
  if (p.unpaired) {
    const own = p.lang === 'fi' ? 'fi-FI' : 'et-EE';
    const want = [[own, canonExp], ['x-default', canonExp]];
    if (JSON.stringify(hl) !== JSON.stringify(want)) err(`${where} — parittoman sivun hreflang väärin: ${JSON.stringify(hl)}`);
  } else {
    const fiAbs = p.lang === 'fi' ? canonExp : abs('fi', p.pair);
    const etAbs = p.lang === 'et' ? canonExp : abs('et', p.pair);
    const want = [['fi-FI', fiAbs], ['et-EE', etAbs], ['x-default', fiAbs]];
    if (JSON.stringify(hl) !== JSON.stringify(want)) err(`${where} — hreflang-kolmikko väärin: ${JSON.stringify(hl)} (odotettu ${JSON.stringify(want)})`);
  }

  /* og + twitter */
  for (const prop of ['og:title', 'og:description', 'og:type', 'og:locale', 'og:url', 'og:image', 'og:image:width', 'og:image:height']) {
    if (count(html, new RegExp(`property="${prop.replace(/:/g, '\\:')}"`, 'g')) !== 1) err(`${where} — ${prop} puuttuu tai toistuu`);
  }
  const ogUrl = /property="og:url" content="([^"]+)"/.exec(html)?.[1];
  if (ogUrl !== canonExp) err(`${where} — og:url ≠ canonical`);
  const ogImg = /property="og:image" content="([^"]+)"/.exec(html)?.[1] ?? '';
  const ogPath = ogImg.replace(/^https:\/\/(www\.)?samaenergia\.(fi|ee)/, '');
  if (!ogPath.startsWith('/assets/og-') || !resolves(ogPath)) err(`${where} — og:image ei osoita olemassa olevaan kuvaan: ${ogImg}`);
  if (!html.includes('<meta name="twitter:card" content="summary_large_image">')) err(`${where} — twitter:card puuttuu`);

  /* kiitossivut noindex; muut eivät */
  const noindex = html.includes('<meta name="robots" content="noindex">');
  if (UNLISTED.has(p.slug) && !noindex) err(`${where} — noindex puuttuu kiitossivulta`);
  if (!UNLISTED.has(p.slug) && noindex) err(`${where} — noindex ei kuulu tälle sivulle`);
  /* näkyvissä URL:eissä ei /et/-etuliitettä — millään sivulla */
  if (/(?:href|action)="\/et\//.test(html)) err(`${where} — /et/-etuliitteinen linkki julkaistussa HTML:ssä`);

  /* kiitossivuihin ei linkitetä navigaatiosta eikä jalasta */
  if (!UNLISTED.has(p.slug)) {
    for (const s of ['/kiitos/', '/aitah/']) {
      const re = new RegExp(`<(nav|footer)[\\s\\S]*?href="${s.replace(/\//g, '\\/')}"[\\s\\S]*?</\\1>`);
      if (re.test(html)) err(`${where} — kiitossivu linkitetty navigaatiossa/jalassa (${s})`);
    }
  }

  /* semanttinen runko */
  if (count(html, /<h1[\s>]/g) !== 1) err(`${where} — h1-määrä ≠ 1 (${count(html, /<h1[\s>]/g)})`);
  if (count(html, /<main id="main">/g) !== 1) err(`${where} — <main id="main"> puuttuu`);
  if (!/<header class="header"/.test(html) || !/<footer class="footer"/.test(html)) err(`${where} — header/footer puuttuu`);
  if (!/<nav class="nav" aria-label="/.test(html) || !/<nav class="mobile-nav" id="mobile-nav" aria-label="/.test(html)) err(`${where} — nav aria-label puuttuu`);
  if (!/<a href="#main" class="skip">/.test(html)) err(`${where} — skip-linkki puuttuu`);
  if (/<header class="header"[\s\S]*?<nav class="mobile-nav"[\s\S]*?<\/header>/.test(html)) err(`${where} — mobiilivalikko on headerin sisällä (backdrop-filter vangitsee position:fixed)`);
  if (!/<img src="\/assets\/mark\.png" alt="SAMA Energia"/.test(html)) err(`${where} — logon alt-teksti puuttuu`);
  if (count(html, /aria-expanded="false"/g) < 3) err(`${where} — aria-expanded puuttuu valikkonapeista`);
  if (/<html lang="(fi|et)">/.exec(html)?.[1] !== p.lang) err(`${where} — html lang väärin`);
  if (!/<a href="[^"]*" lang="(fi|et)">(FI|EE)<\/a>/.test(html)) err(`${where} — kielivalitsimen lang-attribuutti puuttuu`);

  /* kommentit riisuttu julkaisusta: vain generointimerkintä saa jäädä */
  const comments = html.match(/<!--[\s\S]*?-->/g) ?? [];
  if (comments.length !== 1 || !comments[0].includes('GENEROITU')) err(`${where} — kommentteja julkaistussa HTML:ssä ${comments.length} kpl (sallittu vain GENEROITU-merkintä)`);

  /* katselmustilan luokat eivät saa esiintyä staattisessa HTML:ssä (vain client-side) */
  if (/rev-mark|rev-lab|rev-banner|rev-diff|rev-del|rev-ins|rev-toggle|rev-add|rev-hide-del/.test(html)) err(`${where} — katselmusmerkintöjä staattisessa HTML:ssä`);

  /* kohatäitteitä ei saa jäädä julkaistuun sisältöön */
  const placeholderCounts = [
    ['KONTROLLITAKSE', count(html, /KONTROLLITAKSE/g)],
    ['TARKISTETAAN', count(html, /TARKISTETAAN/g)],
    ['[X-PLACEHOLDER]', count(html, /\[X[,X\s–]|\[XX–XX/g)],
    ['[CHECK]', count(html, /\[CHECK\]|\[DECISION\]/g)],
  ];
  for (const [token, n] of placeholderCounts) {
    if (!n) continue;
    const w = PLACEHOLDER_WAIVERS.find(w => w.page === p.url && w.token === token);
    if (!w || n > w.max) err(`${where} — ${token}-kohatäite jäljellä (${n} kpl, waiver kattaa ${w ? w.max : 0})`);
    else console.warn(`HUOM (waiver): ${where} — ${n} × ${token} tietoisesti jäljellä`);
  }

  /* kaikki sisäiset linkit ja resurssit osoittavat olemassa oleviin tiedostoihin; sivun sisäiset
     ankkurit olemassa olevaan id:hen samalla sivulla */
  for (const m of html.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
    const u = m[1];
    if (u.startsWith('http://')) { err(`${where} — salaamaton http-linkki: ${u}`); continue; }
    if (u.startsWith('https://') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('data:')) continue;
    if (u.startsWith('#')) {
      const id = u.slice(1);
      if (!id || !new RegExp(` id="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html)) err(`${where} — ankkuri ${u} ei osoita id:hen tällä sivulla`);
      continue;
    }
    if (!u.startsWith('/')) { err(`${where} — suhteellinen polku: ${u}`); continue; }
    if (!resolves(u)) err(`${where} — linkki ei osoita tiedostoon: ${u}`);
  }

  /* ladattavat resurssit vain omalta palvelimelta */
  for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*?(?:src|href)="((https?:)?\/\/[^"]*)"/g)) {
    if (m[2].startsWith(BASE + '/') || m[2].startsWith(ET_BASE + '/')) continue;
    err(`${where} — kolmannen osapuolen resurssi: ${m[0].slice(0, 100)}`);
  }
  if (/<form\b[^>]*action="https?:/.test(html)) err(`${where} — lomake postittaa ulos`);
  if (/<link[^>]*rel="preconnect"|rel="dns-prefetch"/.test(html)) err(`${where} — preconnect kolmanteen osapuoleen`);

  /* inline-skripti vain etusivuilla, ja vain yksi (shim); JSON-LD on erillinen datalohko */
  const inline = count(html, /<script>/g);
  if (isFront && inline !== 1) err(`${where} — etusivulla oltava täsmälleen 1 inline-skripti (shim), oli ${inline}`);
  if (!isFront && inline !== 0) err(`${where} — alasivulla ei saa olla inline-skriptejä, oli ${inline}`);

  /* JSON-LD: etusivu ProfessionalService, alasivut BreadcrumbList, artikkelit lisäksi Article,
     .faq-list-sivut lisäksi FAQPage; kaikki hashattu CSP:hen */
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const types = [];
  for (const b of ldBlocks) {
    try {
      const d = JSON.parse(b[1]);
      types.push(d['@type']);
      if (d['@context'] !== 'https://schema.org') err(`${where} — JSON-LD @context väärin`);
      const h = createHash('sha256').update(b[1], 'utf8').digest('base64');
      if (!headers.includes(`'sha256-${h}'`)) err(`${where} — JSON-LD-hash puuttuu CSP:stä`);
      if (d['@type'] === 'ProfessionalService') {
        if (d.legalName !== 'SAMA Energia Oy' || d.vatID !== 'FI36476833' || !Array.isArray(d.founder) || d.founder.length !== 2 || !Array.isArray(d.knowsAbout) || d.knowsAbout.length < 5 || !d.address?.addressLocality) err(`${where} — ProfessionalService-tiedot puutteelliset`);
      } else if (d['@type'] === 'BreadcrumbList') {
        const items = d.itemListElement ?? [];
        if (items.length < 2 || items.at(-1).item !== canonExp || items[0].item !== (p.lang === 'fi' ? BASE + '/' : ET_BASE + '/')) err(`${where} — BreadcrumbList väärin`);
        for (const it of items) if (!it.name || !it.item || !it.position) err(`${where} — BreadcrumbList-kohta puutteellinen`);
      } else if (d['@type'] === 'FAQPage') {
        if (!Array.isArray(d.mainEntity) || !d.mainEntity.length) err(`${where} — FAQPage ilman kysymyksiä`);
        for (const q of d.mainEntity ?? []) if (!q.name || !q.acceptedAnswer?.text) err(`${where} — FAQPage-kysymys puutteellinen`);
        if (d.mainEntity.length !== count(html, /<details/g) - count(html, /<details class="more"/g)) err(`${where} — FAQPage-kysymysten määrä ≠ sivun details-lohkot`);
      } else if (d['@type'] === 'Article') {
        if (!d.headline || !/^\d{4}-\d{2}-\d{2}$/.test(d.datePublished ?? '') || d.author?.name !== 'Madis Maastik' || d.publisher?.name !== 'SAMA Energia' || d.inLanguage !== p.lang || d.mainEntityOfPage?.['@id'] !== canonExp) err(`${where} — Article-tiedot puutteelliset`);
      } else err(`${where} — odottamaton JSON-LD-tyyppi ${d['@type']}`);
    } catch (e) { err(`${where} — JSON-LD ei jäsenny: ${e.message}`); }
  }
  const wantTypes = [];
  if (isFront) wantTypes.push('ProfessionalService'); else wantTypes.push('BreadcrumbList');
  if (/<div class="page active"? id="p-art-/.test(html) || /id="p-art-/.test(html)) wantTypes.push('Article');
  if (/<div class="faq-list">/.test(html)) wantTypes.push('FAQPage');
  if (JSON.stringify(types) !== JSON.stringify(wantTypes)) err(`${where} — JSON-LD-tyypit ${JSON.stringify(types)}, odotettu ${JSON.stringify(wantTypes)}`);

  /* lomakkeet talteen ristiintarkistusta varten */
  for (const f of html.matchAll(/<form[^>]*data-netlify="true"[\s\S]*?<\/form>/g)) {
    const form = f[0];
    const controls = [...form.matchAll(/<(?:input|select|textarea)\b[^>]*/g)].map(m => m[0]);
    const nameOf = c => /\bname="([^"]+)"/.exec(c)?.[1];
    forms.push({
      where, lang: p.lang, slug: p.slug,
      id: /<form[^>]*\bid="([^"]+)"/.exec(form)?.[1],
      name: /<form[^>]*\bname="([^"]+)"/.exec(form)?.[1],
      action: /<form[^>]*\baction="([^"]+)"/.exec(form)?.[1],
      method: /<form[^>]*\bmethod="([^"]+)"/.exec(form)?.[1],
      novalidate: /<form[^>]*\bnovalidate/.test(form),
      hidden: form.includes('name="form-name" value="kohdekartoitus"'),
      honeypot: /netlify-honeypot="bot-field"/.test(form) && form.includes('name="bot-field"'),
      privacy: form.includes(`href="${p.lang === 'fi' ? '/tietosuoja/' : '/andmekaitse/'}"`),
      fields: controls.map(nameOf).filter(Boolean).sort().join(','),
      required: controls.filter(c => /\brequired\b/.test(c)).map(nameOf).sort().join(','),
    });
  }
  const isContact = p.slug === 'yhteystiedot' || p.slug === 'kontakt';
  const nForms = count(html, /data-netlify="true"/g);
  if ((isFront || isContact) && nForms !== 1) err(`${where} — odotettiin 1 Netlify-lomake, oli ${nForms}`);
  if (!isFront && !isContact && nForms !== 0) err(`${where} — odottamaton lomake`);
}

/* Netlify-lomakkeet: sama nimi ja kenttäjoukko kaikissa (etusivu + yhteyssivu, FI + ET),
   action-kiitossivu no-JS-varapoluksi, pakollisina vain nimi + email, tietosuojalinkki */
if (forms.length !== 4) err(`Netlify-lomakkeita ${forms.length}, odotettu 4`);
const fieldSets = new Set(forms.map(f => f.fields));
if (fieldSets.size !== 1) err(`lomakekentät eroavat:\n${forms.map(f => `  ${f.where}: ${f.fields}`).join('\n')}`);
for (const f of forms) {
  if (f.name !== 'kohdekartoitus') err(`${f.where} — lomakkeen nimi väärin (${f.name})`);
  if (f.method !== 'POST') err(`${f.where} — lomakkeen method väärin`);
  if (f.action !== (f.lang === 'fi' ? '/kiitos/' : '/aitah/')) err(`${f.where} — lomakkeen action väärin: ${f.action}`);
  if (!f.hidden) err(`${f.where} — form-name-piilokenttä puuttuu`);
  if (!f.honeypot) err(`${f.where} — honeypot puuttuu`);
  if (!f.privacy) err(`${f.where} — tietosuojalinkki puuttuu lomakkeesta`);
  if (f.novalidate) err(`${f.where} — novalidate estäisi natiivin validoinnin ilman JS:ää`);
  if (f.required !== 'email,nimi') err(`${f.where} — pakollisina oltava täsmälleen nimi + email, oli [${f.required}]`);
  const wantId = f.slug === '' ? 'ctFormHome' : 'ctForm';
  if (f.id !== wantId) err(`${f.where} — lomakkeen id ${f.id}, odotettu ${wantId}`);
  if (!f.fields.split(',').includes('viesti')) err(`${f.where} — viesti-kenttä puuttuu`);
}

/* 404-sivut: FI juuressa, ET et/-kansiossa; noindex, yksi h1, ei canonicalia, vain GENEROITU-kommentti */
for (const f of ['404.html', 'et/404.html']) {
  if (!existsSync(join(ROOT, f))) { err(`${f} puuttuu`); continue; }
  const html = read(f);
  if (!html.includes('<meta name="robots" content="noindex">')) err(`${f} — noindex puuttuu`);
  if (count(html, /<h1[\s>]/g) !== 1) err(`${f} — h1-määrä ≠ 1`);
  if (/rel="canonical"/.test(html)) err(`${f} — 404-sivulla ei saa olla canonicalia`);
  if (/href="#\//.test(html) || /googleapis/.test(html)) err(`${f} — luonnosjäämiä`);
  const comments = html.match(/<!--[\s\S]*?-->/g) ?? [];
  if (comments.length !== 1 || !comments[0].includes('GENEROITU')) err(`${f} — kommentteja ${comments.length} kpl`);
  if (!/<html lang="(fi|et)">/.test(html)) err(`${f} — html lang puuttuu`);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) if (!m[1].startsWith('/et/') && !resolves(m[1])) err(`${f} — linkki ei osoita tiedostoon: ${m[1]}`);
}

/* FI- ja ET-slugijoukkojen (ylätaso) on oltava erilliset — muuten _redirectsin yleinen
   ET-uudelleenkirjoitus voisi varjostaa FI-sivun (kova ehto) */
const overlap = [...FI_TOP].filter(s => ET_TOP.has(s));
if (overlap.length) err(`FI- ja ET-slugit leikkaavat: ${overlap} — yleiset uudelleenkirjoitukset varjostaisivat FI-sivuja`);
for (const s of [...Object.keys(LEGACY.fi), ...Object.keys(LEGACY.et)]) if (FI_TOP.has(s) || ET_TOP.has(s)) err(`vanha slug ${s} on yhä käytössä`);

/* _redirects: jokaisella ET-ylätason slugilla yleinen uudelleenkirjoitus JA .fi-hostin 301:t;
   jokaisella FI-ylätason slugilla .ee-hostin 301:t; vanhat slugit ohjataan uusiin omalla hostillaan;
   jokainen ET-sivun sisäinen linkki osuu tunnettuun sääntöön */
{
  const rules = read('_redirects');
  const line = re => new RegExp(re, 'm').test(rules);
  for (const s of ET_TOP) {
    if (!line(`^/${s}/\\*\\s+/et/${s}/:splat\\s+200\\s*$`)) err(`_redirects: yleinen uudelleenkirjoitus puuttuu slugilta ${s}`);
    if (!line(`^https://samaenergia\\.fi/${s}/\\*\\s+https://samaenergia\\.ee/${s}/:splat\\s+301!\\s*$`)) err(`_redirects: .fi-hostin 301 puuttuu slugilta ${s}`);
    if (!line(`^https://www\\.samaenergia\\.fi/${s}/\\*\\s+https://samaenergia\\.ee/${s}/:splat\\s+301!\\s*$`)) err(`_redirects: www..fi-hostin 301 puuttuu slugilta ${s}`);
  }
  for (const s of FI_TOP) {
    if (!line(`^https://samaenergia\\.ee/${s}/\\*\\s+https://samaenergia\\.fi/${s}/:splat\\s+301!\\s*$`)) err(`_redirects: .ee-hostin 301 .fi:lle puuttuu FI-slugilta ${s}`);
    if (!line(`^https://www\\.samaenergia\\.ee/${s}/\\*\\s+https://samaenergia\\.fi/${s}/:splat\\s+301!\\s*$`)) err(`_redirects: www..ee-hostin 301 .fi:lle puuttuu FI-slugilta ${s}`);
  }
  for (const [old, now] of Object.entries(LEGACY.fi)) {
    for (const h of ['samaenergia\\.fi', 'www\\.samaenergia\\.fi']) if (!line(`^https://${h}/${old}/\\*\\s+https://samaenergia\\.fi/${now}/\\s+301!\\s*$`)) err(`_redirects: vanhan FI-slugin ${old} ohjaus puuttuu hostilta ${h}`);
    for (const h of ['samaenergia\\.ee', 'www\\.samaenergia\\.ee']) if (!line(`^https://${h}/${old}/\\*\\s+https://samaenergia\\.fi/${old}/:splat\\s+301!\\s*$`)) err(`_redirects: vanhan FI-slugin ${old} peiliohjaus puuttuu hostilta ${h}`);
  }
  for (const [old, now] of Object.entries(LEGACY.et)) {
    for (const h of ['samaenergia\\.ee', 'www\\.samaenergia\\.ee']) if (!line(`^https://${h}/${old}/\\*\\s+https://samaenergia\\.ee/${now}/\\s+301!\\s*$`)) err(`_redirects: vanhan ET-slugin ${old} ohjaus puuttuu hostilta ${h}`);
    for (const h of ['samaenergia\\.fi', 'www\\.samaenergia\\.fi']) if (!line(`^https://${h}/${old}/\\*\\s+https://samaenergia\\.ee/${old}/:splat\\s+301!\\s*$`)) err(`_redirects: vanhan ET-slugin ${old} peiliohjaus puuttuu hostilta ${h}`);
    if (line(`^/${old}/\\*\\s+/et/`)) err(`_redirects: vanhan ET-slugin ${old} yleinen uudelleenkirjoitus osoittaisi tyhjään`);
  }
  if (!line('^https://samaenergia\\.ee/\\s+/et/index\\.html\\s+200!\\s*$')) err('_redirects: .ee-juuren pakotettu uudelleenkirjoitus puuttuu');
  if (!line('^https://samaenergia\\.ee/\\*\\s+/et/:splat\\s+200\\s*$')) err('_redirects: .ee-hostin yleinen uudelleenkirjoitus puuttuu');
  if (!line('^https://samaenergia\\.ee/\\*\\s+/et/404\\.html\\s+404\\s*$')) err('_redirects: .ee-hostin 404-sivun sääntö puuttuu');
  for (const guard of ['/src/*', '/scripts/*', '/docs/*', '/CLAUDE.md', '/README.md', '/OHJE.md']) if (!rules.includes(`${guard} `)) err(`_redirects: suojasääntö puuttuu: ${guard}`);
  for (const p of pages.filter(p => p.lang === 'et')) {
    const html = read(p.url.replace(/^\//, '') + 'index.html');
    for (const m of html.matchAll(/(?:href|action)="(\/[^"]*)"/g)) {
      const seg = m[1].split('/')[1]?.split('#')[0]?.split('?')[0] ?? '';
      const ok = seg === '' || seg === 'assets' || ET_TOP.has(seg);
      if (!ok) err(`${p.url} — ET-sivun sisäiselle linkille ${m[1]} ei ole uudelleenkirjoitussääntöä`);
    }
  }
}

/* sitemap kattaa täsmälleen kaikki julkiset sivut (kiitossivut pois, parittomat mukana) */
const sitemap = read('sitemap.xml');
const smUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).sort();
const publicPages = pages.filter(p => !UNLISTED.has(p.slug));
const expect = publicPages.map(p => abs(p.lang, p.url)).sort();
if (JSON.stringify(smUrls) !== JSON.stringify(expect)) err('sitemap.xml ei vastaa sivujoukkoa (kiitossivujen pitää jäädä pois, artikkelien olla mukana)');
if (!read('robots.txt').includes('Sitemap: ' + BASE + '/sitemap.xml')) err('robots.txt ei viittaa sitemapiin');
if (/Disallow:\s*\/\S/.test(read('robots.txt'))) err('robots.txt estää polkuja — AI-indeksoijia ei estetä');

/* llms.txt + llms-full.txt: jokainen julkinen sivu otsikoituna, ei kiitossivuja */
{
  const full = read('llms-full.txt');
  for (const p of publicPages) {
    const html = read(p.url.replace(/^\//, '') + 'index.html');
    const title = /<title>([^<]*)<\/title>/.exec(html)[1];
    if (!full.includes(`# ${title} — ${abs(p.lang, p.url)}`)) err(`llms-full.txt: sivu puuttuu: ${abs(p.lang, p.url)}`);
  }
  if (/kiitos\/|aitah\//.test(full)) err('llms-full.txt sisältää kiitossivun');
  const llms = read('llms.txt');
  for (const p of publicPages.filter(p => !p.unpaired)) if (!llms.includes(abs(p.lang, p.url))) err(`llms.txt: sivu puuttuu: ${abs(p.lang, p.url)}`);
  if (!/English summary/i.test(llms)) err('llms.txt: huomautus englanninkielisestä tiivistelmästä puuttuu');
}

/* CSP-hash vastaa etusivujen shimiä, molempien etusivujen shim identtinen */
const shimOf = f => /<script>([\s\S]*?)<\/script>/.exec(read(f))?.[1];
const shimFi = shimOf('index.html'), shimEt = shimOf('et/index.html');
if (shimFi !== shimEt) err('etusivujen shimit eroavat (CSP-hash kattaa vain yhden)');
const hash = createHash('sha256').update(shimFi ?? '', 'utf8').digest('base64');
if (!headers.includes(`'sha256-${hash}'`)) err('_headers-CSP-hash ei vastaa shimiä');
if (/script-src[^;]*'unsafe-inline'/.test(headers)) err("CSP sallii yhä 'unsafe-inline' -skriptit");
if (!/font-src 'self';/.test(headers) || !/X-Frame-Options: DENY/.test(headers) || !/Strict-Transport-Security/.test(headers)) err('_headers: turvaotsakkeita puuttuu');

/* shim kattaa kaikki julkiset slugit (uudet + vanhat), ei kiitossivuja */
for (const p of publicPages) if (p.slug && !shimFi?.includes(`"#/${p.slug}"`)) err(`shim ei tunne polkua #/${p.slug}`);
for (const s of [...Object.keys(LEGACY.fi), ...Object.keys(LEGACY.et)]) if (!shimFi?.includes(`"#/${s}"`)) err(`shim ei tunne vanhaa polkua #/${s}`);
for (const s of UNLISTED) if (shimFi?.includes(`"#/${s}"`)) err(`shimissä ylimääräinen polku #/${s}`);

/* resurssibudjetit (suorituskykytavoite: CSS ≤ 70 kt, JS ≤ 20 kt, ei kolmansia osapuolia) */
const cssBytes = statSync(join(ROOT, 'assets/site.css')).size;
const jsBytes = statSync(join(ROOT, 'assets/site.js')).size;
if (cssBytes > 70 * 1024) err(`assets/site.css ${cssBytes} tavua > 70 kt`);
if (jsBytes > 20 * 1024) err(`assets/site.js ${jsBytes} tavua > 20 kt`);
for (const f of ['assets/site.css', 'assets/fonts.css', 'assets/site.js']) if (/googleapis|gstatic|https?:\/\//.test(read(f))) err(`${f} viittaa ulkoiseen osoitteeseen`);
if (!/font-display:swap/.test(read('assets/fonts.css'))) err('fonts.css: font-display: swap puuttuu');

/* katselmusmanifesti: olemassa, jäsentyy, kohtuukokoinen, viittaa olemassa oleviin sivuihin ja osioihin */
try {
  const raw = read('assets/review.json');
  if (raw.length > 200_000) err(`review.json liian suuri (${raw.length} tavua > 200 kt)`);
  const man = JSON.parse(raw);
  if (!Array.isArray(man.changes)) err('review.json: changes ei ole taulukko');
  else for (const c of man.changes) {
    if (!['new', 'changed'].includes(c.kind)) { err(`review.json: tuntematon kind "${c.kind}"`); continue; }
    if (c.kind === 'changed' && typeof c.prev !== 'string') err(`review.json: ${c.page} ${c.sectionId} — prev-teksti puuttuu`);
    const seg = c.page.split('/')[1] ?? '';
    const filePage = ET_TOP.has(seg) ? '/et' + c.page : c.page;
    const pg = pages.find(p => p.url === filePage);
    if (!pg) { err(`review.json: tuntematon sivu ${c.page}`); continue; }
    const html = read(filePage.replace(/^\//, '') + 'index.html');
    if (!html.includes(`id="${c.sectionId}"`)) err(`review.json: osiota ${c.sectionId} ei ole sivulla ${c.page}`);
  }
} catch (e) {
  err('review.json puuttuu tai ei jäsenny: ' + e.message);
}

if (errors) { console.error(`\n${errors} virhettä.`); process.exit(1); }
console.log(`OK — ${pages.length} sivua + 2 × 404 tarkistettu, ei virheitä.`);
console.log(`HUOM (soft-404): staattisesti ei voi todentaa, että tuntematon polku palauttaa aidon
HTTP 404:n eikä 200:aa, eikä .ee-hostin 404-sääntöä — tarkista tuotannossa julkaisun jälkeen:
  curl -sI https://samaenergia.fi/ei-ole-olemassa/ | head -1   (odotettu: 404)
  curl -sI https://samaenergia.ee/pole-olemas/ | head -1       (odotettu: 404)`);
