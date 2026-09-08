/* SAMA Energia — Open Graph -kuvien renderöinti (1200×630).
   Riippuvuudeton: käyttää koneelta löytyvää Google Chromea headless-tilassa.
   Aja repon juuresta:  node scripts/og/render-og.mjs
   Tulos: assets/og-fi.png ja assets/og-et.png (committoidaan). */
import { execFileSync } from 'node:child_process';
import { existsSync, renameSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(existsSync);
if (!CHROME) { console.error('Chromea ei löytynyt — asenna Google Chrome tai Chromium.'); process.exit(1); }

const tpl = resolve('scripts/og/og-template.html');
if (!existsSync(tpl)) { console.error(`Mallia ei löydy: ${tpl} (aja repon juuresta)`); process.exit(1); }

for (const lang of ['fi', 'et']) {
  const dir = mkdtempSync(join(tmpdir(), 'sama-og-'));
  const shot = join(dir, 'screenshot.png');
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=6000',
    `--screenshot=${shot}`, `file://${tpl}?lang=${lang}`,
  ], { stdio: 'ignore' });
  if (!existsSync(shot)) { console.error(`${lang}: kuvaa ei syntynyt`); process.exit(1); }
  const out = resolve(`assets/og-${lang}.png`);
  renameSync(shot, out);
  rmSync(dir, { recursive: true, force: true });
  console.log(`assets/og-${lang}.png`);
}
