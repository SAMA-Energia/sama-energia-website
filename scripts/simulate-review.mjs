#!/usr/bin/env node
/**
 * SAMA Energia — katselmusannotoinnin simulaatio ilman selainta.
 * Ajo: node scripts/simulate-review.mjs [sivu-url osio-id] ...
 *      (ilman argumentteja ajetaan edustavat vakio-osiot)
 *
 * Viipaloi assets/site.js:stä samat puhtaat funktiot (tokenizeWithPos, wordDiff,
 * computeOps), joita selain käyttää, jäsentää generoidun sivun osion pseudo-
 * tekstisolmuiksi ja tulostaa annotoidun tekstin lineaarisesti:
 *   ⟦+lisätty⟧ = rev-add-span, ⟦−poistettu⟧ = rev-del-mark.
 * Näin raportoitava tulos on täsmälleen se, minkä selainlogiikka tuottaisi.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Samat funktiot kuin selaimessa — viipaloidaan omasta assets/site.js:stä (sama
   luottamustaso kuin tällä skriptillä) ja ladataan väliaikaisena ES-moduulina,
   jotta simulaatio ajaa täsmälleen selaimen koodin, ei kopiota. */
const js = readFileSync(join(ROOT, 'assets/site.js'), 'utf8');
const pure = js.slice(js.indexOf('function tokenizeWithPos'), js.indexOf('/* ===== DOM-osuus'));
const tmp = mkdtempSync(join(tmpdir(), 'sama-sim-'));
const modPath = join(tmp, 'pure.mjs');
writeFileSync(modPath, pure + '\nexport { tokenizeWithPos, wordDiff, computeOps };\n');
const { tokenizeWithPos, wordDiff, computeOps } = await import(pathToFileURL(modPath).href);
rmSync(tmp, { recursive: true, force: true });

function decode(t) {
  return t.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

/* Pseudo-DOM: osion HTML -> tekstisolmulista dokumenttijärjestyksessä.
   script/style ohitetaan, svg-syvyys merkitsee solmun lukituksi (kuten selaimessa). */
function extractTextNodes(sectionHtml) {
  const h = sectionHtml.replace(/<!--[\s\S]*?-->/g, '');
  const nodes = [];
  let skip = 0, svg = 0;
  for (const m of h.matchAll(/<[^>]+>|[^<]+/g)) {
    const s = m[0];
    if (s[0] === '<') {
      const close = s[1] === '/';
      const tag = /^[a-zA-Z0-9-]+/.exec(close ? s.slice(2) : s.slice(1))?.[0]?.toLowerCase();
      const selfClosing = /\/>$/.test(s) || ['br', 'img', 'input', 'hr', 'meta', 'link'].includes(tag);
      if (['script', 'style', 'template'].includes(tag)) { if (!selfClosing) skip += close ? -1 : 1; }
      else if (tag === 'svg' && !selfClosing) svg += close ? -1 : 1;
    } else if (skip <= 0 && s.trim() !== '' || skip <= 0) {
      nodes.push({ text: decode(s), locked: svg > 0 });
    }
  }
  return nodes;
}

function sectionHtmlOf(pageUrl, sectionId) {
  const html = readFileSync(join(ROOT, pageUrl.replace(/^\//, ''), 'index.html'), 'utf8');
  const start = html.indexOf(`id="${sectionId}"`);
  if (start < 0) throw new Error(`${sectionId} ei löydy sivulta ${pageUrl}`);
  const from = html.lastIndexOf('<', start);
  const nextId = html.indexOf('id="rev-', start + 10);
  const end = nextId < 0 ? html.indexOf('</main>', start) : html.lastIndexOf('<', nextId);
  return html.slice(from, end);
}

function simulate(pageUrl, sectionId) {
  const man = JSON.parse(readFileSync(join(ROOT, 'assets/review.json'), 'utf8'));
  const c = man.changes.find(x => x.page === pageUrl && x.sectionId === sectionId);
  console.log(`\n=== ${pageUrl} ${sectionId} — ${c ? c.kind : 'EI MANIFESTISSA'} ===`);
  if (!c) return;
  if (c.kind === 'new') { console.log('uusi osio: pelkkä UUSI-ääriviiva, ei sanakohtaista annotointia (speksin kohta 1)'); return; }

  const nodes = extractTextNodes(sectionHtmlOf(pageUrl, sectionId));
  const offs = []; let concat = '';
  nodes.forEach(n => { offs.push(concat.length); concat += n.text; });
  const tok = tokenizeWithPos(concat);
  if (tok.words.length < 10) { console.log('alle 10 sanaa: ääriviiva riittää'); return; }
  const ops = computeOps(wordDiff(tokenizeWithPos(c.prev).words, tok.words), tok, concat);

  /* renderöi annotoitu teksti lineaarisesti solmu kerrallaan (kuten selain tekisi) */
  let out = '', nAdd = 0, nDel = 0, dropped = 0;
  nodes.forEach((n, idx) => {
    const ns = offs[idx], ne = ns + n.text.length;
    if (n.locked) {
      const hits = ops.addRanges.some(r => Math.max(r[0], ns) < Math.min(r[1], ne))
        || ops.markers.some(mk => mk.at >= ns && mk.at < ne);
      if (hits) dropped++;
      out += n.text;
      return;
    }
    const items = [];
    ops.markers.forEach(mk => { if (mk.at >= ns && mk.at < ne) items.push({ p: mk.at - ns, type: 'del', text: mk.text }); });
    ops.addRanges.forEach(r => {
      const s = Math.max(r[0], ns), e = Math.min(r[1], ne);
      if (s < e && !/^[\s\u00a0]*$/.test(n.text.slice(s - ns, e - ns))) items.push({ p: s - ns, e: e - ns, type: 'add' });
    });
    items.sort((a, b) => a.p - b.p || (a.type === 'del' ? -1 : 1));
    let cur = 0;
    items.forEach(it => {
      if (it.p > cur) { out += n.text.slice(cur, it.p); cur = it.p; }
      if (it.type === 'del') { out += `⟦−${it.text}⟧`; nDel++; }
      else if (it.e > cur) { out += `⟦+${n.text.slice(Math.max(it.p, cur), it.e)}⟧`; nAdd++; cur = it.e; }
    });
    out += n.text.slice(cur);
  });
  ops.markers.forEach(mk => { if (mk.at === Infinity) { out += ` ⟦−${mk.text}⟧`; nDel++; } });

  console.log(`lisäys-spaneja: ${nAdd} · poistomerkkejä: ${nDel} · lukittuihin (svg) osuneita, pudotettu: ${dropped}`);
  console.log(out.replace(/\s+/g, ' ').trim());
}

const args = process.argv.slice(2);
const targets = args.length
  ? Array.from({ length: args.length / 2 }, (_, i) => [args[2 * i], args[2 * i + 1]])
  : [['/', 'rev-etusivu-1'], ['/yhteystiedot/', 'rev-yhteystiedot-2'], ['/et/energiasalvestid/', 'rev-energiasalvestid-3']];
for (const [p, s] of targets) simulate(p, s);
