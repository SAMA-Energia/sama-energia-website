#!/usr/bin/env node
/**
 * SAMA Energia — etusivun "Näin työ etenee / Kuidas töö käib" -video (05.11.2026).
 * Renderöi scripts/stills/hero3d.js:n animaation (?anim=proc&look=kriit) kuva kerrallaan headless-Chromiumissa ja koodaa
 *   assets/k-proc.mp4 (H.264, 1200×900, 4:3 v48:sta alkaen) ja assets/k-proc.webm (VP9) sekä puhelimelle k-proc-m.mp4 / .webm (800×600),
 *   vaiheiden pysäytyskuvat assets/k-proc-{1..5}.webp (reduced-motion) ja julisteen k-proc-poster.webp.
 * Ajo repon juuresta: node scripts/render-proc.mjs --modules /polku/node_modules [--fps 24] [--frames /polku/kehyksiin] [--from 0 --to 30]
 * Vaatii ffmpegin. Kamera on paikallaan; avainkuvat vaiheiden alussa (nopea siirtyminen vaiheeseen hiirellä).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, extname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const MODULES = opt('modules', process.env.STILLS_MODULES);
if (!MODULES || !existsSync(join(MODULES, 'three', 'build', 'three.module.js'))) { console.error('Anna --modules /polku/node_modules'); process.exit(2); }
const FPS = +opt('fps', 24), T0 = +opt('from', 0), T1 = +opt('to', 30), W = +opt('w', 1200), H = +opt('h', 900);
const even = (v) => Math.round(v / 2) * 2, MW = even(W * 2 / 3), MH = even(H * 2 / 3);   // puhelinversio 2/3
const FR = opt('frames', join(ROOT, 'dist-preview', 'proc-frames'));
const ENCODE_ONLY = argv.includes('--encode-only'), NO_ENCODE = argv.includes('--no-encode');
mkdirSync(FR, { recursive: true });
const require = createRequire(import.meta.url);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
function serve() {
  const roots = { stills: join(ROOT, 'scripts', 'stills'), node_modules: resolve(MODULES) };
  return new Promise((ok) => {
    const srv = createServer((req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname); const [, top, ...rest] = path.split('/');
      const base = roots[top]; const file = base && normalize(join(base, ...rest));
      if (!file || !file.startsWith(base) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
    }).listen(0, '127.0.0.1', () => ok({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}
if (!ENCODE_ONLY) {
  const { chromium } = require('playwright');
  const { srv, base } = await serve();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const logs = []; page.on('pageerror', (e) => logs.push('ERR ' + e));
    await page.goto(`${base}/stills/hero3d.html?scene=toostus&shot=proc&light=day&look=kriit&anim=proc&w=${W}&h=${H}&t=${T0}`, { waitUntil: 'commit', timeout: 120000 });
    await page.waitForFunction('window.DONE===true||!!window.FAIL', null, { timeout: 600000, polling: 300 });
    const fail = await page.evaluate('window.FAIL||null'); if (fail) throw new Error(fail + ' ' + logs.join(' | '));
    const n0 = Math.round(T0 * FPS), n1 = Math.round(T1 * FPS), t0 = Date.now();
    for (let n = n0; n < n1; n++) {
      const file = join(FR, `f${String(n).padStart(4, '0')}.jpg`);
      if (existsSync(file)) continue;
      const url = await page.evaluate((t) => { window.FRAME(t); return document.querySelector('canvas').toDataURL('image/jpeg', 0.96); }, n / FPS);
      writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
      if (n % 24 === 0) console.log(`kuva ${n}/${n1}  ${((Date.now() - t0) / 1000 / Math.max(1, n - n0 + 1)).toFixed(2)} s/kuva`);
    }
  } finally { await browser.close(); srv.close(); }
}
// ---------- koodaus ----------
if (NO_ENCODE) process.exit(0);
const A = join(ROOT, 'assets');
const kf = '0,5.5,11,17,22';   // vaiheiden alut avainkuviksi
const vf = (w, h) => `scale=${w}:${h}:flags=lanczos,fade=t=in:st=0:d=0.35:color=0xF7F4EE,fade=t=out:st=${(T1 - 0.45).toFixed(2)}:d=0.45:color=0xF7F4EE,format=yuv420p`;
const run = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const inp = ['-framerate', String(FPS), '-i', join(FR, 'f%04d.jpg')];
for (const [suf, w, h, crf264, crf9] of [['', W, H, 26, 36], ['-m', MW, MH, 27, 37]]) {
  run([...inp, '-vf', vf(w, h), '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-crf', String(crf264), '-g', String(FPS), '-keyint_min', '1', '-force_key_frames', kf, '-movflags', '+faststart', '-an', join(A, `k-proc${suf}.mp4`)]);
  run([...inp, '-vf', vf(w, h), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf9), '-row-mt', '1', '-g', String(FPS), '-force_key_frames', kf, '-an', join(A, `k-proc${suf}.webm`)]);
  for (const f of [`k-proc${suf}.mp4`, `k-proc${suf}.webm`]) console.log(f, (statSync(join(A, f)).size / 1024).toFixed(0), 'kt');
}
// vaiheiden pysäytyskuvat (reduced-motion ja juliste): vaiheen lopun "valmis" hetki
const KEY = [4.6, 10.4, 16.2, 21.3, 29.2];
const frames = readdirSync(FR).filter((f) => f.endsWith('.jpg')).sort();
KEY.forEach((t, i) => {
  const n = Math.min(frames.length - 1, Math.round(t * FPS));
  run(['-i', join(FR, frames[n]), '-vf', `scale=${W}:${H}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '82', join(A, `k-proc-${i + 1}.webp`)]);
});
// juliste = videon ensimmäinen valmis kuva (0,4 s, häivytyksen jälkeen): toiston alku jatkuu julisteesta ilman hyppyä
run(['-i', join(FR, frames[Math.min(frames.length - 1, Math.round(0.4 * FPS))]), '-vf', `scale=${W}:${H}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', join(A, 'k-proc-poster.webp')]);
console.log('valmis');
