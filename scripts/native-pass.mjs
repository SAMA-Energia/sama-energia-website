#!/usr/bin/env node
/**
 * SAMA Energia — natiivikatselmuspaketti (10.09.2026).
 *
 * Syy: qa/ on .gitignoressa, joten jokainen aiemmin tehty native-pass.md on ollut Madisille
 * näkymätön. Tämä kokoaa YHDEN dokumentin per kieli tiedostoon docs/native-pass/<LANG>.md.
 * docs/ on seurattu mutta _redirects palauttaa /docs/* -> 404!, joten sitä ei koskaan tarjoilla.
 *
 * Sisältö: jokainen asiakkaalle näkyvä merkkijono, joka MUUTTUU kun draft julkaistaan —
 * eli mikä tahansa teksti, jota ei ole mainissa (b74d5ab) sellaisenaan. Missä mainissa on
 * lähin vastine, se näytetään rinnalla. Ryhmittely sivuittain sivujärjestyksessä.
 *
 * Teksti poimitaan GENEROIDUISTA sivuista (ei lähteistä eikä käsin), jotta katselmoitava
 * teksti on täsmälleen se, jonka lukija näkee.
 *
 * Ajo (buildin jälkeen):  node scripts/native-pass.mjs
 * Riippuvuudet: ei mitään repossa — sama playwright-core-haku kuin qa-layout.mjs:ssä.
 */
import { readFileSync, existsSync, statSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAIN = 'b74d5ab';
const OUT = join(ROOT, 'docs', 'native-pass');

/* Sivut FI/ET-paketteihin, sivujärjestyksessä. new = tämän haaran polku,
   old = vastaava polku mainissa (null = sivu on kokonaan uusi). */
const PAGES = {
  FI: [
    ['/', 'index.html', 'Etusivu'],
    ['/energiavarastot/', 'energiavarastot/index.html', 'Energiavarastot'],
    ['/aurinkosahko/', 'aurinko-ja-akku/index.html', 'Aurinkosähkö'],
    ['/reservimarkkinat/', 'reservimarkkinat/index.html', 'Reservimarkkinat'],
    ['/veni-energia/', null, 'VENI Energia'],
    ['/palvelut/', 'prosessi/index.html', 'Palvelut'],
    ['/laitevaatimukset/', null, 'Laitevaatimukset'],
    ['/equipment-requirements/', null, 'Equipment requirements (EN)'],
    ['/meista/', 'meista/index.html', 'Meistä'],
    ['/ajankohtaista/', 'ajankohtaista/index.html', 'Ajankohtaista'],
    ['/ajankohtaista/liityntarajoitus-2029/', null, 'Ajankohtaista — Liityntärajoitus 2029'],
    ['/yhteystiedot/', 'yhteystiedot/index.html', 'Yhteystiedot'],
    ['/tietosuoja/', 'tietosuoja/index.html', 'Tietosuoja'],
    ['/kiitos/', 'kiitos/index.html', 'Kiitos'],
    ['/404.html', null, '404'],
  ],
  ET: [
    ['/et/', 'et/index.html', 'Avaleht'],
    ['/et/energiasalvestid/', 'et/energiasalvestid/index.html', 'Energiasalvestid'],
    ['/et/paikeseelekter/', 'et/paike-ja-aku/index.html', 'Päikeseelekter'],
    ['/et/reserviturg/', 'et/reserviturud/index.html', 'Reserviturg'],
    ['/et/soleron-energy/', null, 'Soleron Energy'],
    ['/et/teenused/', 'et/protsess/index.html', 'Teenused'],
    ['/et/seadmete-nouded/', null, 'Seadmete nõuded'],
    ['/et/meist/', 'et/meist/index.html', 'Meist'],
    ['/et/uudised/', 'et/uudised/index.html', 'Uudised'],
    ['/et/uudised/reservitasu-2026/', null, 'Uudised — Reservitasu 2026'],
    ['/et/kontakt/', 'et/kontakt/index.html', 'Kontakt'],
    ['/et/andmekaitse/', 'et/andmekaitse/index.html', 'Andmekaitse'],
    ['/et/aitah/', 'et/aitah/index.html', 'Aitäh'],
    ['/et/404.html', null, '404'],
  ],
};

/* ⚠-merkintä: perustajan päätös tai lukukorjaus, ei käännösasia. Madis katsoo nämä ensin.
   Lista on tarkoituksella eksplisiittinen ja päivätty — jokainen kohta on projektin
   päätöslokista tai verify-pages.mjs:n sisältövartijasta. */
const FOUNDER_MARKS = [
  [/omaksi eduksenne|enda kasuks tööle/i, 'perustajan päätös 10.09.2026 — hero-otsikko (FI sai ajatusviivan; ET avoin, ks. kohta 2)'],
  [/maksaa itsensä takaisin nopeimmin|end kõige kiiremini ära tasub/i, 'perustajan päätös 10.09.2026 — varaus "usein"/"sageli" poistettu, kumoaa päätöksen D16 (08.09)'],
  [/Myyntijohtaja|Müügijuht|Talousjohtaja|Finantsjuht|Asennuspäällikkö|Paigaldusjuht/, 'tittelit hyväksytty 03.09.2026; "perustaja"/"asutaja" pudotettu 08.09.2026 (vartija titteli-perustaja)'],
  [/VENI Energia|Soleron Energy|Ralos|JSM Automaatiosähkö|Scanoffice/, 'kumppaninimet: sallittu lista, perustajan päätös 03.09. ja 08.09.2026 (Scanoffice vain FI)'],
  [/leasing|omalla pääomalla|oma kapitaliga|liisin/i, 'rahoitus kuvataan yleisesti — rahoitusyhtiöitä ei nimetä (perustajan päätös 03.09.2026 ilta)'],
  [/Sörnäisten Rantatie/, 'osoite vahvistettu 06.09.2026'],
  [/kvalifitseerunud|kvalifitseeritud|säätökokein todennettu|prekvalifioitu/i, 'lukukorjaus: reservien osuudet ovat todennettua KAPASITEETTIA, ei tuotantoa (Fingrid 10.2.2025; vartijat reservi-*)'],
  [/Miten akku toimii\?|Kuidas aku toimib\?/, 'perustajan päätös 05.09. ilta / 08.09.2026 — toissijainen hero-painike'],
];

/* Luku = numero, jolla on yksikkö tai prosentti/valuutta. Näiden rinnalla on aina
   näytettävä osion lähderivi (toimeksianto: ei lukuja ilman lähdettä). */
/* Yksikön jälkeen ei saa tulla kirjainta, muuten esim. askelnumero "07" + "Võrk" tulkittaisiin luvuksi. */
const FIGURE = /(?<![\w.])\d[\d\s\u00a0\u202f,.]*\s*(%|€|kW|MW|GW|kWh|MWh|TWh|kV|euroa|eurot)(?![\p{L}])/iu;
const SRC_LINE = /^(Lähde|Lähteet|Allikas|Allikad|Source|Sources)\s*[:.]/i;
/* Lähde voi olla myös merkkijonon SISÄLLÄ ("… Allikas: Elering, …") — silloin luvulla on lähde. */
const SRC_INLINE = /(Lähde|Lähteet|Allikas|Allikad|Source|Sources)\s*:/i;

/* ---------- playwright-core ---------- */
async function loadPlaywright() {
  const cands = [];
  if (process.env.PLAYWRIGHT_CORE) cands.push(process.env.PLAYWRIGHT_CORE);
  try { cands.push(join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(), 'playwright-core')); } catch { /* npm puuttuu */ }
  cands.push(join(ROOT, 'node_modules', 'playwright-core'));
  for (let c of cands) {
    if (existsSync(c) && statSync(c).isDirectory()) c = join(c, 'index.mjs');
    if (existsSync(c)) return (await import(pathToFileURL(c).href)).chromium;
  }
  console.error('playwright-core ei löydy. Asenna `npm i -g playwright-core`.');
  process.exit(2);
}

/* ---------- staattinen palvelin: nykyinen puu tai mainin (b74d5ab) versio ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };
const ET_TOP = new Set(readdirSync(join(ROOT, 'et')).filter(d => statSync(join(ROOT, 'et', d)).isDirectory()));
function serve(fromGitRef) {
  return new Promise(resolve => {
    const srv = createServer((req, res) => {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (!fromGitRef && ET_TOP.has(path.split('/')[1])) path = '/et' + path;
      let rel = path.replace(/^\//, '');
      if (rel === '' || rel.endsWith('/')) rel += 'index.html';
      let body = null;
      if (fromGitRef) {
        try { body = execFileSync('git', ['show', `${fromGitRef}:${rel}`], { cwd: ROOT, maxBuffer: 1 << 28 }); } catch { body = null; }
      } else {
        const f = join(ROOT, rel);
        if (existsSync(f) && !statSync(f).isDirectory()) body = readFileSync(f);
      }
      if (!body) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    }).listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

/* ---------- selaimessa: näkyvät tekstilohkot järjestyksessä ---------- */
function extract() {
  const BLOCK = 'h1,h2,h3,h4,h5,p,li,dt,dd,summary,figcaption,blockquote,td,th,label,a.btn,button.btn,.role,.duty,.kicker-rule+*,.tagline,.badges span,.chip';
  const out = [];
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const seen = new Set();
  for (const el of document.querySelectorAll(BLOCK)) {
    if (el.closest('script,style,svg,template,.crumbs')) continue;
    const isSrc = !!el.closest('.sources-list') || el.classList.contains('src');
    /* vain lehtilohkot: jos sisällä on toinen lohko jossa on tekstiä, ohita tämä */
    if ([...el.querySelectorAll(BLOCK)].some(c => norm(c.textContent))) continue;
    const t = norm(el.textContent);
    if (!t || t.length < 2) continue;
    const zone = el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'main';
    const sec = el.closest('section[id],article[id],div[id]');
    const key = zone + '|' + t;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ tag: el.tagName.toLowerCase(), zone, section: sec ? '#' + sec.id : '', text: t, isSrc });
  }
  return out;
}

/* ---------- samankaltaisuus (vanhan vastineen etsintään) ---------- */
function bigrams(s) { const g = new Set(); const t = s.toLowerCase(); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; }
function dice(a, b) {
  const A = bigrams(a), B = bigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0; for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size);
}

/* ---------- ajo ---------- */
const chromium = await loadPlaywright();
const browser = await chromium.launch({ channel: 'chrome' });

async function grab(base, url) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  let items = [];
  try {
    const r = await pg.goto(base + url, { waitUntil: 'domcontentloaded' });
    if (r && r.ok()) {
      await pg.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
      items = await pg.evaluate(extract);
    }
  } catch { /* sivua ei ole */ }
  await ctx.close();
  return items;
}

const cur = await serve(null);
const old = await serve(MAIN);

const stats = {};
mkdirSync(OUT, { recursive: true });

for (const [lang, pages] of Object.entries(PAGES)) {
  const L = lang === 'FI'
    ? { ask: 'Merkitse jokainen rivi joko **OK** tai kirjoita korjaus sen alle.', title: 'Natiivikatselmus — suomi' }
    : { ask: 'Märgi iga rida kas **OK** või kirjuta parandus selle alla.', title: 'Natiivikatselmus — eesti keel' };

  /* mainin koko tekstivarasto tälle kielelle: jos merkkijono löytyy täältä, se on jo julkaistu */
  const oldPool = new Set();
  const oldByPage = new Map();
  for (const [newUrl, oldPath] of pages) {
    if (!oldPath) continue;
    const u = '/' + oldPath.replace(/index\.html$/, '');
    const items = await grab(old.base, u);
    oldByPage.set(newUrl, items);
    for (const it of items) oldPool.add(it.text);
  }

  const lines = [];
  let nItems = 0, nWarn = 0, nChanged = 0, nNew = 0, nSkipped = 0, nUnsourced = 0;

  for (const [newUrl, oldPath, pageName] of pages) {
    const items = await grab(cur.base, newUrl);
    if (!items.length) continue;
    const oldItems = oldByPage.get(newUrl) || [];
    const oldTexts = oldItems.map(o => o.text);

    /* header/footer vain kerran, ensimmäisen sivun kohdalla */
    const isFirst = newUrl === pages[0][0];
    const rows = [];
    let curSec = null;
    /* osion lähderivit, jotta lukuja ei esitetä ilman lähdettä */
    const srcOfSection = new Map();
    for (const it of items) if (it.isSrc || SRC_LINE.test(it.text)) {
      const k = it.section || '(sivu)';
      if (!srcOfSection.has(k)) srcOfSection.set(k, []);
      srcOfSection.get(k).push(it.text);
    }

    const pageSeen = new Set();
    for (const it of items) {
      if (it.zone !== 'main' && !isFirst) { nSkipped++; continue; }
      if (oldPool.has(it.text)) { nSkipped++; continue; }   // muuttumaton -> ei katselmoitavaa
      if (pageSeen.has(it.text)) { nSkipped++; continue; }   // sama merkkijono kahdesti samalla sivulla
      if (it.isSrc || SRC_LINE.test(it.text)) continue;      // lähderivit näytetään osion otsakkeessa

      /* lähin vanha vastine samalta sivulta */
      let best = null, bestScore = 0;
      for (const t of oldTexts) { const s = dice(it.text, t); if (s > bestScore) { bestScore = s; best = t; } }
      const changed = bestScore >= 0.55;

      const marks = FOUNDER_MARKS.filter(([re]) => re.test(it.text)).map(([, why]) => why);
      const isFig = FIGURE.test(it.text);
      const warn = marks.length > 0 || isFig;

      pageSeen.add(it.text);
      nItems++; if (warn) nWarn++; if (changed) nChanged++; else nNew++;

      const secKey = (it.zone !== 'main' ? `(${it.zone})` : it.section || '(sivu)');
      if (secKey !== curSec) {
        curSec = secKey;
        rows.push('');
        rows.push(`### ${secKey}`);
        const srcs = srcOfSection.get(it.section || '(sivu)');
        if (srcs) for (const s of srcs) rows.push(`> Lähde tälle osiolle: ${s}`);
        rows.push('');
      }
      const flag = warn ? '⚠ ' : '';
      rows.push(`- [ ] ${flag}\`${it.tag}\` ${changed ? '**muutettu**' : '**uusi**'} — ${it.text}`);
      if (changed) rows.push(`      - main: ${best}`);
      for (const m of marks) rows.push(`      - ⚠ ${m}`);
      if (isFig && !srcOfSection.has(it.section || '(sivu)') && !SRC_INLINE.test(it.text)) {
        rows.push(`      - ⚠ lähdettä ei löytynyt automaattisesti (ei osion lähderiviä, ei "Lähde:"-mainintaa tekstissä) — varmista näkyvä lähde ennen julkaisua`);
        nUnsourced++;
      }
      rows.push(`      - **Korjaus:**`);
    }
    if (rows.length) {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push(`## ${pageName} — \`${newUrl}\``);
      lines.push(oldPath ? `Vastine mainissa: \`/${oldPath.replace(/index\.html$/, '')}\`` : '**Uusi sivu** — ei vastinetta mainissa.');
      lines.push(...rows);
    }
  }

  const head = [
    `# ${L.title}`,
    '',
    `Tarkistettava: **kaikki asiakkaalle näkyvä teksti, joka muuttuu kun \`draft\` julkaistaan.**`,
    `Vertailukohta on \`main\` (${MAIN}) eli tällä hetkellä julkaistu sivusto.`,
    '',
    `**Mitä pyydetään:** ${L.ask}`,
    '',
    '**Merkinnät**',
    '',
    '| | |',
    '|---|---|',
    '| **uusi** | tekstiä ei ole nykyisellä sivustolla lainkaan |',
    '| **muutettu** | nykyisellä sivustolla on lähin vastine, se näkyy rivillä `main:` |',
    '| ⚠ | **katso nämä ensin** — perustajan päätös tai luku, ei käännösasia |',
    '',
    'Luvut esitetään aina osionsa lähderivin kanssa (`> Lähde tälle osiolle:`).',
    'Jos luvulla ei ole lähderiviä, se on merkitty erikseen.',
    '',
    `Muuttumattomat merkkijonot on jätetty pois: ne ovat jo julkaistuja.`,
    '',
    `_Generoitu: \`node scripts/native-pass.mjs\` generoiduista sivuista. Älä muokkaa käsin — kirjoita korjaukset **Korjaus:**-riveille._`,
    '',
    `**Yhteenveto:** ${nItems} katselmoitavaa riviä — ${nNew} uutta, ${nChanged} muutettua, joista **${nWarn} on merkitty ⚠**. Muuttumattomia ohitettiin ${nSkipped}.`
      + (nUnsourced ? `\n\n**Huomio:** ${nUnsourced} luvun kohdalla lähdettä ei löytynyt automaattisesti. Osalla lähde on tekstissä sanallisesti ("Fingridin 24.9.2025 julkaiseman tiedotteen mukaan"), jolloin merkintä on aiheeton — mutta jokainen on silmäiltävä, koska repo-sääntö on: ei lukuja ilman dokumentoitua lähdettä.` : ''),
  ];
  writeFileSync(join(OUT, `${lang}.md`), head.concat(lines).join('\n') + '\n', 'utf8');
  stats[lang] = { nItems, nWarn, nChanged, nNew, nSkipped, nUnsourced };
  console.log(`${lang}.md — ${nItems} riviä (${nNew} uutta, ${nChanged} muutettua, ${nWarn} ⚠, ${nUnsourced} lukua ilman lähdettä), ohitettu ${nSkipped}`);
}

await browser.close();
cur.srv.close(); old.srv.close();
