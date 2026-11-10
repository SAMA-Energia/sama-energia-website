#!/usr/bin/env node
/**
 * SAMA Energia — vie hero3d.js-näyttämön (sama rajaus, kaapelit, kaapit ja valot kuin three.js-renderissä) GLB:ksi ja
 * JSON-metatiedoksi Blenderin polunseurantaa varten (scripts/blender/render_hero.py).
 *
 * Ajo repon juuresta:
 *   node scripts/blender/export-scene.mjs --modules /polku/node_modules --out /polku/kansio [--shots bg:2400x1600,bgm:1170x878]
 * Kirjoittaa <out>/<shot>.glb ja <out>/<shot>.json. Riippuvuudet kuten render-stills.mjs (three@0.180.0,
 * postprocessing@6.39.6, n8ao@2.0.1; Playwright globaalisti).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const MODULES = opt('modules', process.env.STILLS_MODULES);
if (!MODULES || !existsSync(join(MODULES, 'three', 'build', 'three.module.js'))) { console.error('Anna --modules /polku/node_modules'); process.exit(2); }
const OUT = resolve(opt('out', join(ROOT, 'dist-preview', 'blender')));
const LOOK = opt('look', 'tausta');
const SHOTS = String(opt('shots', 'bg:2400x1600,bgm:1170x878')).split(',').map((s) => { const [shot, wh] = s.split(':'); const [w, h] = wh.split('x').map(Number); return { shot, w, h }; });
mkdirSync(OUT, { recursive: true });
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const roots = { stills: join(ROOT, 'scripts', 'stills'), node_modules: resolve(MODULES), assets: join(ROOT, 'assets') };
const srv = await new Promise((ok) => {
  const s = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname); const [, top, ...rest] = path.split('/');
    const base = roots[top]; const file = base && normalize(join(base, ...rest));
    if (!file || !file.startsWith(base) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
  }).listen(0, '127.0.0.1', () => ok(s));
});
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch();
try {
  for (const S of SHOTS) {
    const page = await browser.newPage({ viewport: { width: 64, height: 64 } });
    const logs = []; page.on('pageerror', (e) => logs.push('ERR ' + e));
    await page.goto(`${base}/stills/hero3d.html?scene=toostus&shot=${S.shot}&w=${S.w}&h=${S.h}&light=dusk&look=${LOOK}&norender=1&export=glb`, { waitUntil: 'commit', timeout: 120000 });
    await page.waitForFunction('window.DONE===true||!!window.FAIL', null, { timeout: 600000, polling: 300 });
    const fail = await page.evaluate('window.FAIL||null');
    if (fail) throw new Error(`${S.shot}: ${fail} ${logs.join(' | ')}`);
    const glb = await page.evaluate('window.EXPORT_GLB');
    const meta = await page.evaluate('window.EXPORT_META');
    writeFileSync(join(OUT, `${S.shot}.glb`), Buffer.from(glb, 'base64'));
    writeFileSync(join(OUT, `${S.shot}.json`), JSON.stringify(meta, null, 1));
    console.log(`${S.shot} ${S.w}×${S.h}: ${(Buffer.byteLength(glb, 'base64') / 1048576).toFixed(1)} Mt, ${meta.lights.length} valoa, ${Object.keys(meta.fades).length} häivytettyä materiaalia`);
    await page.close();
  }
} finally { await browser.close(); srv.close(); }
