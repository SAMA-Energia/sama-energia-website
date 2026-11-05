import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';

/* SAMA Energia — hero-kohteiden three.js-näyttämö (k-hero-*.webp, k-paev*.webp, k-objekt*.webp ja k-obj-*.webp).
   Renderöinti: node scripts/render-stills.mjs (ks. tiedoston otsake). ?scene= valitsee kohteen:
   toostus (oletus: teollisuushalli ja kylmävarasto — sama kuva kuin aiemmin), kuivati (viljankuivuri),
   hotell (hotelli ja hoivakoti), paike (aurinkopuisto). Kaikissa kohteissa sama järjestelmä samassa paikassa:
   pääkeskus rakennuksessa (kultainen viiva lähtee seinästä), neljä akkukaappia (ohjaus ja invertteri kaapissa),
   muuntamo + mittaus, pylväs ja linja; sähköasentaja ja omistaja. Ei tekstiä, ei merkkejä.
   ?look=tausta (05.11.2026, etusivun herotausta): hillitty grafiitti + kulta. Vain tarjoamamme osat: aurinkopaneelit
   katolla, neljä kaappia (1,35 × 1,01 × 2,45 m, väli 0,6 m), pääkeskus ja ohjausyksikkö sähkötilassa avoimen oven
   takana (kultainen viiva menee ovesta sisään), muuntamo ja mittaus, pylväslinja; yksi ihminen mittakaavaksi.
   Ei aitaa, autoa, puita eikä pysäköintiviivoja. Kuvat: shot=bg (työpöytä 3:2) ja shot=bgm (puhelin 4:3). */
const P = new URLSearchParams(location.search);
const W = +(P.get('w') || 1600), H = +(P.get('h') || 900);
const LIGHT = P.get('light') || 'dusk';
const SHOT = P.get('shot') || 'hero';
const SCENE = P.get('scene') || 'toostus';
const TAUSTA = P.get('look') === 'tausta';
const SYS = { peakilp: [14.1, 0.1, -13.5], salvesti: [21.8, 2.6, -6], liitumispunkt: [31.2, 2.5, -8.6], vork: [35.6, 9.8, -12.6], elektrik: [22.4, 1.9, -3.2], omanik: [25.3, 1.9, -2.6] };
const SITE_LABELS = {
  toostus: Object.assign({ paike: [8.0, 9.6, -14.9] }, SYS, TAUSTA ? { peakilp: [14.05, 1.75, -13.6], salvesti: [22.2, 2.62, -6.0], paike: [10.1, 9.85, -16.1] } : {}),
  kuivati: Object.assign({ paike: [11.0, 5.8, -13.3] }, SYS),
  hotell: Object.assign({ paike: [11.0, 4.9, -12.1] }, SYS),
  paike: Object.assign({ paike: [5.0, 1.8, -20.4] }, SYS),
};
const BGHEX = P.get('bg') ? '#' + P.get('bg') : (LIGHT === 'day' ? '#F2EEE6' : '#0A0A09');
const WRONG = P.get('wrong') || '';           // '', 'inverter', 'scale'
const SHOW = (P.get('show') || (TAUSTA ? 'nofence,novan,notrees' : 'all')).split(',');
const PRESETS = {
  hero:        { tx: 25, tz: -7, vh: 30, fx: 0.64, fy: 0.6, az: 0.62, el: 0.58, fc: [24, -9], r0: 13, r1: 36 },
  heroPortrait:{ tx: 25.5, tz: -6.5, vh: 25, fx: 0.5, fy: 0.55, az: 0.62, el: 0.6, fc: [25, -7], r0: 13, r1: 34 },
  /* puhelin, kohdepainikkeet: sama kulma kuin heroPortrait, rajaus mahduttaa kohteen (torni, julkisivu, paneelirivit),
     pääkeskuksen, kaapit ja muuntamon samaan 3:4-kuvaan; mittakaava sama kuin työpöydän hero-kuvassa (vh 30) */
  heroPortraitObj:{ tx: 16.97, tz: -11.68, vh: 30, fx: 0.5, fy: 0.5, az: 0.62, el: 0.6, fc: [22, -8], r0: 14, r1: 36 },
  connection:  { tx: 24.5, tz: -8.5, vh: 21, fx: 0.5, fy: 0.52, az: 0.62, el: 0.62, fc: [25, -8], r0: 15, r1: 36 },
  survey:      { tx: 15.9, tz: -14.4, ty: 1.0, vh: 7.4, fx: 0.5, fy: 0.5, az: 0.95, el: 0.42, fc: [16, -14], r0: 7, r1: 16 },
  surveyWide:  { tx: 15.6, tz: -14.9, ty: 1.1, vh: 8.6, fx: 0.69, fy: 0.5, az: 0.95, el: 0.42, fc: [16, -14], r0: 9, r1: 20 },
  people:      { tx: 0, tz: 0, ty: 0.95, vh: 2.6, fx: 0.5, fy: 0.5, az: 0.5, el: 0.22, fc: [0, 0], r0: 3, r1: 8 },
  scale:       { tx: 3.2, tz: 0, ty: 4.7, vh: 11.8, fx: 0.5, fy: 0.5, az: 0.3, el: 0.16, fc: [3, 0], r0: 18, r1: 32 },
  /* look=tausta: työpöydän herotausta 3:2 (teksti vasemmalla, kohde oikealla) ja puhelin 4:3 */
  bg:          { tx: 20.5, tz: -11, vh: 29.5, fx: 0.57, fy: 0.62, az: 0.62, el: 0.6, fc: [21, -11], r0: 13, r1: 31 },
  bgm:         { tx: 20.5, tz: -10.5, vh: 25.5, fx: 0.5, fy: 0.69, az: 0.62, el: 0.6, fc: [22, -10], r0: 11, r1: 27 },
};
const PR = Object.assign({}, PRESETS[SHOT] || PRESETS.hero);
for (const k of ['tx','tz','ty','vh','fx','fy','az','el','r0','r1']) if (P.get(k) !== null) PR[k] = +P.get(k);

// ---------- deterministic random ----------
let seed = +(P.get('seed') || 7);
function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, stencil: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const BG = new THREE.Color(BGHEX);
scene.background = BG.clone();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = LIGHT === 'dusk' ? 0.16 : 0.55;

// ---------- textures ----------
function canvasTex(w, h, draw, rep = [1, 1], srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function dots(g, w, h, cols, n, rmin, rmax, a0, a1) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, r = rmin + (rmax - rmin) * rnd();
    g.globalAlpha = a0 + (a1 - a0) * rnd();
    g.fillStyle = cols[Math.floor(rnd() * cols.length)];
    for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
      if (x + ox + r < 0 || x + ox - r > w || y + oy + r < 0 || y + oy - r > h) continue;
      g.beginPath(); g.arc(x + ox, y + oy, r, 0, 6.2832); g.fill();
    }
  }
  g.globalAlpha = 1;
}
const T = {};
T.grass = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = LIGHT === 'dusk' ? '#323b2b' : '#6b705a'; g.fillRect(0, 0, w, h);
  dots(g, w, h, LIGHT === 'dusk' ? ['#5d6644', '#3d4731', '#6d7150', '#454d36'] : ['#777c60', '#5f6450', '#80826a'], 200, 20, 70, 0.02, 0.06);
  dots(g, w, h, LIGHT === 'dusk' ? ['#636c48', '#3a4430', '#747a52', '#525c3e', '#7b7552'] : ['#7a7f63', '#5c6249', '#878a6c', '#666b52', '#8e8668'], 16000, 0.5, 1.6, 0.2, 0.55);
}, [40, 40]);
T.asphalt = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#3b3c3e'; g.fillRect(0, 0, w, h);
  dots(g, w, h, ['#47484b', '#303133', '#55565a', '#2a2b2d'], 180, 20, 70, 0.04, 0.12);
  dots(g, w, h, ['#5a5b5f', '#2c2d2f', '#6a6b6e'], 14000, 0.4, 1.4, 0.3, 0.8);
}, [12, 12]);
T.gravel = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#8f8b84'; g.fillRect(0, 0, w, h);
  dots(g, w, h, ['#a8a49b', '#76726b', '#bab5ab', '#69655f', '#9c968c'], 22000, 0.8, 2.6, 0.35, 0.9);
}, [10, 10]);
T.concrete = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#a7a39c'; g.fillRect(0, 0, w, h);
  dots(g, w, h, ['#b3afa8', '#99958e', '#bcb8b0'], 140, 8, 30, 0.04, 0.1);
  dots(g, w, h, ['#8e8a83', '#c2beb6'], 3000, 0.4, 1.0, 0.2, 0.5);
}, [2, 2]);
function claddingNormal(rep) {
  return canvasTex(64, 8, (g) => {
    const cols = [[0, 4, '#8080ff'], [4, 8, '#3480e6'], [8, 24, '#8080ff'], [24, 28, '#cc80e6'], [28, 32, '#8080ff']];
    for (let k = 0; k < 2; k++) for (const [a, b, c] of cols) { g.fillStyle = c; g.fillRect(a + 32 * k, 0, b - a, 8); }
  }, rep, false);
}
const louverTex = canvasTex(64, 128, (g, w, h) => {
  g.fillStyle = '#3a3c3f'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) { g.fillStyle = '#1c1d1f'; g.fillRect(0, y, w, 3); g.fillStyle = '#55585c'; g.fillRect(0, y + 3, w, 1); }
}, [1, 1]);
const solarTex = canvasTex(256, 512, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#16202e'); grd.addColorStop(1, '#0d141f');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(150,170,200,0.22)'; g.lineWidth = 2;
  for (let x = 0; x <= w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += h / 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = 'rgba(200,205,210,0.9)'; g.lineWidth = 6; g.strokeRect(0, 0, w, h);
});
const meshTex = canvasTex(64, 64, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#ffffff'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
  g.beginPath(); g.moveTo(-w / 2, h / 2); g.lineTo(w / 2, -h / 2); g.moveTo(w / 2, h * 1.5); g.lineTo(w * 1.5, h / 2); g.stroke();
  g.beginPath(); g.moveTo(w / 2, -h / 2); g.lineTo(w * 1.5, h / 2); g.moveTo(-w / 2, h / 2); g.lineTo(w / 2, h * 1.5); g.stroke();
}, [1, 1], false);

/* look=tausta: grafiitin sävyt (lämmin neutraali, sama suunta kuin sivun #0A0A09), ei vihreää eikä sinistä */
if (TAUSTA) {
  T.grass = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#34322e'; g.fillRect(0, 0, w, h);
    dots(g, w, h, ['#3b3934', '#2c2a27', '#403d38'], 200, 20, 70, 0.03, 0.08);
    dots(g, w, h, ['#43403a', '#292724', '#4a4740', '#363430'], 15000, 0.5, 1.6, 0.2, 0.45);
  }, [40, 40]);
  T.asphalt = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#2b2a28'; g.fillRect(0, 0, w, h);
    dots(g, w, h, ['#32312e', '#252422', '#373633'], 180, 20, 70, 0.04, 0.1);
    dots(g, w, h, ['#3d3c39', '#222120', '#454440'], 12000, 0.4, 1.3, 0.25, 0.65);
  }, [12, 12]);
  T.gravel = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#4b4843'; g.fillRect(0, 0, w, h);
    dots(g, w, h, ['#5a5751', '#3d3a36', '#66625b', '#36332f', '#524e48'], 22000, 0.8, 2.6, 0.35, 0.85);
  }, [10, 10]);
  T.concrete = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8f8b84'; g.fillRect(0, 0, w, h);
    dots(g, w, h, ['#9a968f', '#827e77', '#a29e96'], 140, 8, 30, 0.04, 0.1);
    dots(g, w, h, ['#77736c', '#a8a49c'], 3000, 0.4, 1.0, 0.2, 0.5);
  }, [2, 2]);
}

// ---------- materials ----------
const M = {};
const std = (o) => new THREE.MeshStandardMaterial(o);
M.grass = std({ map: T.grass, roughness: 1, metalness: 0 });
M.asphalt = std({ map: T.asphalt, roughness: 0.92 });
M.gravel = std({ map: T.gravel, roughness: 1 });
M.concrete = std({ map: T.concrete, roughness: 0.9 });
M.cab = std({ color: '#d9d6cf', roughness: 0.42, metalness: 0.12 });
M.cabDark = std({ color: '#2a2b2e', roughness: 0.6, metalness: 0.2 });
M.cabTop = std({ color: '#c9c6bf', roughness: 0.5, metalness: 0.15 });
M.louver = std({ map: louverTex, roughness: 0.7, metalness: 0.3 });
M.seam = std({ color: '#55565a', roughness: 0.6 });
M.goldLed = std({ color: '#1a140a', emissive: new THREE.Color('#F2CF7E'), emissiveIntensity: LIGHT === 'dusk' ? 9 : 3 });
M.energy = LIGHT === 'dusk' ? std({ color: '#2a2215', emissive: new THREE.Color('#E8C77A'), emissiveIntensity: 7, roughness: 0.4 })
  : std({ color: '#C7A45C', emissive: new THREE.Color('#D4A94F'), emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.35 });
M.energyGrid = LIGHT === 'dusk' ? std({ color: '#1a160f', emissive: new THREE.Color('#B89656'), emissiveIntensity: 2.2, roughness: 0.5 })
  : std({ color: '#97752F', emissive: new THREE.Color('#97752F'), emissiveIntensity: 0.35, roughness: 0.45, metalness: 0.3 });
M.kiosk = std({ map: T.concrete, color: '#b9b5ad', roughness: 0.85 });
M.kioskDoor = std({ color: '#4a4d51', roughness: 0.55, metalness: 0.35 });
M.metal = std({ color: '#9aa0a6', roughness: 0.35, metalness: 0.85 });
M.darkMetal = std({ color: '#3b3f44', roughness: 0.45, metalness: 0.6 });
M.wood = std({ color: '#5b4a39', roughness: 0.95 });
M.wire = std({ color: '#1d1f22', roughness: 0.6, metalness: 0.5 });
M.insul = std({ color: '#8a6d4a', roughness: 0.4 });
M.roof = std({ color: '#7d7f82', roughness: 0.85 });
M.parapet = std({ color: '#5c5f63', roughness: 0.7, metalness: 0.3 });
M.solar = std({ map: solarTex, roughness: 0.22, metalness: 0.45 });
M.frame = std({ color: '#b9bec4', roughness: 0.35, metalness: 0.8 });
M.glass = std({ color: '#1c2531', roughness: 0.08, metalness: 0.9 });
M.glassLit = std({ color: '#2a2016', emissive: new THREE.Color('#ffcf8f'), emissiveIntensity: 2.4, roughness: 0.2 });
M.door = std({ color: '#6c7076', roughness: 0.55, metalness: 0.4 });
M.fence = std({ color: '#8d9298', roughness: 0.5, metalness: 0.7 });
M.fenceMesh = std({ color: '#9aa0a6', alphaMap: meshTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6, depthWrite: true });
M.van = std({ color: LIGHT === 'dusk' ? '#4a4f56' : '#d9d8d4', roughness: 0.32, metalness: 0.3 });
M.tyre = std({ color: '#151617', roughness: 0.9 });
M.spruce = std({ color: '#1e3024', roughness: 1 });
M.spruce2 = std({ color: '#25392a', roughness: 1 });
M.birchBark = std({ color: '#d8d4cb', roughness: 0.9 });
M.birchLeaf = std({ color: '#7d8b45', roughness: 1 });
M.trunk = std({ color: '#3b2e22', roughness: 1 });
M.skin = std({ color: '#c79a7c', roughness: 0.7 });
M.navy = std({ color: '#1f2b3b', roughness: 0.8 });
M.trousers = std({ color: '#262a30', roughness: 0.85 });
M.reflect = std({ color: '#c9ccd0', roughness: 0.3, metalness: 0.4, emissive: new THREE.Color('#ffffff'), emissiveIntensity: LIGHT === 'dusk' ? 0.25 : 0.05 });
M.helmet = std({ color: '#efefec', roughness: 0.35 });
M.coat = std({ color: '#3a3330', roughness: 0.85 });
M.coat2 = std({ color: '#5d6a74', roughness: 0.85 });
M.hair = std({ color: '#2a221c', roughness: 0.9 });
M.shoe = std({ color: '#141414', roughness: 0.7 });
M.camera = std({ color: '#111214', roughness: 0.4, metalness: 0.3 });
M.lens = std({ color: '#0b0c0e', roughness: 0.1, metalness: 0.8 });
M.tablet = std({ color: '#0f1114', roughness: 0.15, metalness: 0.4, emissive: new THREE.Color('#9fb4c8'), emissiveIntensity: 0.15 });
M.inverter = std({ color: '#5a6d7d', roughness: 0.5, metalness: 0.2 });
M.switchboard = std({ color: '#c9cbc8', roughness: 0.5, metalness: 0.15 });
M.interior = std({ color: '#2e2c29', roughness: 0.9 });
if (TAUSTA) {
  // kaapit vaaleimpina (tuote), kaikki muu grafiittia; kulta vain energian tiellä ja kaapin merkkivalossa
  M.cab.color.set('#d3cec4'); M.cabTop.color.set('#c2bdb3');
  M.roof.color.set('#47453f'); M.parapet.color.set('#4d4b46');
  M.solar.map = canvasTex(256, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#1d1e20'); grd.addColorStop(1, '#151618');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(175,172,165,0.16)'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += h / 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(196,193,186,0.85)'; g.lineWidth = 6; g.strokeRect(0, 0, w, h);
  });
  M.solar.roughness = 0.3; M.solar.metalness = 0.4;
  M.glass.color.set('#1c1c1d');
  M.glassLit.emissive.set('#e9b978'); M.glassLit.emissiveIntensity = 0.42;
  M.door.color.set('#4e4c48');
  M.kiosk.color.set('#9c9891'); M.kioskDoor.color.set('#3e3c39');
  M.wood.color.set('#4a4540'); M.insul.color.set('#8a857c'); M.wire.color.set('#77736c');
  M.darkMetal.color.set('#393735'); M.metal.color.set('#8e8c88');
  M.skin.color.set('#b39886');
  M.energy.emissiveIntensity = 4.2; M.energyGrid.emissiveIntensity = 1.6;
}

// ---------- helpers ----------
function box(w, h, d, mat, x, y, z, parent = scene, cast = true, recv = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m;
}
function plane(w, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; parent.add(m); return m;
}
function cyl(r, h, mat, x, y, z, parent = scene, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function texMat(base, rx, ry) { const m = base.clone(); if (m.map) { m.map = m.map.clone(); m.map.repeat.set(rx, ry); m.map.needsUpdate = true; } return m; }

// ---------- ground ----------
const SITE = new THREE.Vector3(PR.fc[0], 0, PR.fc[1]);
function fadeGround(mat, r0, r1) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uC = { value: SITE }; sh.uniforms.uR = { value: new THREE.Vector2(r0, r1) }; sh.uniforms.uBg = { value: BG };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <fog_vertex>', '#include <fog_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;uniform vec3 uC;uniform vec2 uR;uniform vec3 uBg;')
      .replace('#include <fog_fragment>', '#include <fog_fragment>\nfloat fd=smoothstep(uR.x,uR.y,length((vWP.xz-uC.xz)*vec2(1.0,1.25)));gl_FragColor.rgb=mix(gl_FragColor.rgb,uBg,fd);');
  };
  mat.customProgramCacheKey = () => 'fade' + r0 + '_' + r1;
  return mat;
}
const R0 = PR.r0, R1 = PR.r1;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), fadeGround(texMat(M.grass, 60, 60), R0, R1));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
// asphalt yard in front of hall (aurinkopuistossa vain huoltotie)
const yard = TAUSTA ? null : SCENE === 'paike' ? plane(40, 5.5, fadeGround(texMat(M.asphalt, 9, 1.3), R0, R1), -2, 0.012, -2.2)
  : plane(46, 15, fadeGround(texMat(M.asphalt, 10, 3.5), R0, R1), -5, 0.012, -3.5);
// parking lines
if (SCENE === 'toostus' && !TAUSTA) for (let i = 0; i < 6; i++) box(0.12, 0.004, 4.8, std({ color: '#d8d6cf', roughness: 0.6 }), -24 + i * 3, 0.016, 1.2, scene, false, true);
// compound gravel
if (!TAUSTA) {
  plane(17, 13, fadeGround(texMat(M.gravel, 4, 3), R0, R1), 26.5, 0.014, -5.5);
  // path from compound to hall side
  plane(4, 9, fadeGround(texMat(M.asphalt, 1, 2), R0, R1), 16.5, 0.013, -10.5);
}

// ===================== kohteet: kuivati, hotell, paike (I-20261104-5) =====================
// Sama järjestelmä kaikissa: rakennuksen itäseinä x = 14, pääkeskuksen ovi z ≈ -13,6 (kultainen viiva lähtee siitä),
// kaapit, muuntamo, aita, pylväät ja ihmiset kuten toostus-kohteessa. Vain kohde vaihtuu.
const XB = 14;                    // rakennuksen itäseinä
function mesh(geo, mat, parent = scene, cast = true, recv = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m; }
function clad(color, len, ns = 0.9, rough = 0.55, metal = 0.45) {
  return std({ color, roughness: rough, metalness: metal, normalMap: claddingNormal([len / 0.25, 1]), normalScale: new THREE.Vector2(ns, ns) });
}
function plaster(color, rx, ry) { const m = std({ map: T.concrete.clone(), color, roughness: 0.92, metalness: 0 }); m.map.repeat.set(rx, ry); m.map.needsUpdate = true; return m; }
/* seinät tasoina (kuten hallissa) + varjon heittävä tilavuus; matFn(len) palauttaa seinämateriaalin */
function shell(g, b, matFn) {
  const L = b.x1 - b.x0, D = b.z1 - b.z0, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, h = b.h;
  const f = mesh(new THREE.PlaneGeometry(L, h), matFn(L), g); f.position.set(cx, h / 2, b.z1);
  const k = mesh(new THREE.PlaneGeometry(L, h), matFn(L), g); k.rotation.y = Math.PI; k.position.set(cx, h / 2, b.z0);
  const e = mesh(new THREE.PlaneGeometry(D, h), matFn(D), g); e.rotation.y = Math.PI / 2; e.position.set(b.x1, h / 2, cz);
  const w = mesh(new THREE.PlaneGeometry(D, h), matFn(D), g); w.rotation.y = -Math.PI / 2; w.position.set(b.x0, h / 2, cz);
  const vol = box(L - 0.1, h, D - 0.1, std({ color: '#222', colorWrite: false }), cx, h / 2, cz, g, true, false); vol.material.colorWrite = false;
}
function flatRoof(g, b, ph = 0.7) {
  const L = b.x1 - b.x0, D = b.z1 - b.z0, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, h = b.h, y = h + ph / 2 - 0.2;
  box(L, 0.2, D, M.roof, cx, h - 0.1, cz, g);
  box(L + 0.2, ph, 0.25, M.parapet, cx, y, b.z1, g); box(L + 0.2, ph, 0.25, M.parapet, cx, y, b.z0, g);
  box(0.25, ph, D, M.parapet, b.x1, y, cz, g); box(0.25, ph, D, M.parapet, b.x0, y, cz, g);
}
/* harjakatto: axis 'x' = harja x-suunnassa (lappeet ±z), 'z' = harja z-suunnassa (lappeet ±x) */
function gable(g, b, rh, axis, wallMat, roofMat, ov = 0.35) {
  const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, h = b.h;
  const span = axis === 'x' ? b.z1 - b.z0 : b.x1 - b.x0, len = axis === 'x' ? b.x1 - b.x0 : b.z1 - b.z0;
  const half = span / 2, ang = Math.atan2(rh, half), run = half + ov, sl = run / Math.cos(ang);
  const s = new THREE.Shape(); s.moveTo(-half, 0); s.lineTo(half, 0); s.lineTo(0, rh); s.closePath();
  for (const end of [0, 1]) {
    const t = mesh(new THREE.ShapeGeometry(s), wallMat, g);
    if (axis === 'x') { t.position.set(end ? b.x1 : b.x0, h, cz); t.rotation.y = end ? Math.PI / 2 : -Math.PI / 2; }
    else { t.position.set(cx, h, end ? b.z1 : b.z0); t.rotation.y = end ? 0 : Math.PI; }
  }
  const yc = h + rh - (run / 2) * Math.tan(ang) + 0.08;
  for (const sg of [1, -1]) {
    if (axis === 'x') { const r = box(len + 2 * ov, 0.16, sl, roofMat, cx, yc, cz + sg * run / 2, g); r.rotation.x = sg * ang; }
    else { const r = box(sl, 0.16, len + 2 * ov, roofMat, cx + sg * run / 2, yc, cz, g); r.rotation.z = -sg * ang; }
  }
  // harjapelti
  if (axis === 'x') box(len + 2 * ov, 0.12, 0.34, roofMat, cx, h + rh + 0.14, cz, g); else box(0.34, 0.12, len + 2 * ov, roofMat, cx, h + rh + 0.14, cz, g);
  return { ang, half, cx, cz, h, rh };
}
/* paneelit tasakatolle riveinä (kuten hallissa: 2,28 × 1,13 m, kallistus +z) */
function roofPanels(g, x0, x1, z0, z1, y, tilt = 0.21) {
  const pw = 2.28, pd = 1.13, rows = [], cols = Math.floor((x1 - x0) / (pw + 0.05));
  for (let z = z0; z <= z1 + 1e-6; z += 2.45) rows.push(z);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(pw, 0.035, pd), M.solar, rows.length * cols), d = new THREE.Object3D();
  let n = 0; const xs = x0 + ((x1 - x0) - cols * (pw + 0.05) + 0.05) / 2 + pw / 2;
  for (const z of rows) for (let i = 0; i < cols; i++) { d.position.set(xs + i * (pw + 0.05), y, z); d.rotation.set(tilt, 0, 0); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix); }
  inst.castShadow = true; inst.receiveShadow = true; g.add(inst);
  return { rows, cols };
}
/* ikkuna: kehys + lasi (valaistu tai ei); face 'z' = julkisivu +z, 'x' = itäjulkisivu +x */
function win(g, face, a, y, b, w, h, lit, frameMat) {
  if (face === 'z') { box(w + 0.14, h + 0.14, 0.05, frameMat, a, y, b + 0.02, g, false, true); box(w, h, 0.06, lit, a, y, b + 0.04, g, false, true); }
  else { box(0.05, h + 0.14, w + 0.14, frameMat, b + 0.02, y, a, g, false, true); box(0.06, h, w, lit, b + 0.04, y, a, g, false, true); }
}
function corrNormal(rep) {   // vaakasuora poimutus (siilot): normaali kallistuu v-suunnassa
  return canvasTex(4, 32, (g, w, h) => {
    for (let r = 0; r < h; r++) { const ny = 0.5 * Math.cos(r / h * Math.PI * 2); g.fillStyle = `rgb(128,${Math.round(128 + 120 * ny)},${Math.round(255 * Math.sqrt(1 - ny * ny))})`; g.fillRect(0, r, w, 1); }
  }, rep, false);
}
function tube(a, b, r, mat, parent = scene) {
  const m = mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b)), 1, r, 10, false), mat, parent);
  return m;
}
function door(x, z, face = 'x', mat = M.door) { return face === 'x' ? box(0.08, 2.2, 1.2, mat, x + 0.05, 1.1, z) : box(1.2, 2.2, 0.08, mat, x, 1.1, z + 0.05); }

/* ---------- 1. viljankuivuri (kuivati) ---------- */
function kuivati() {
  const g = new THREE.Group(); scene.add(g);
  const dark = (len) => clad(LIGHT === 'dusk' ? '#2c2f33' : '#4b5057', len);
  const galv = std({ color: '#8c9093', roughness: 0.48, metalness: 0.35 });
  const galvD = std({ color: '#676c70', roughness: 0.52, metalness: 0.4 });
  const binM = std({ color: '#93979a', roughness: 0.44, metalness: 0.38, normalMap: corrNormal([1, 82]), normalScale: new THREE.Vector2(0.75, 0.75) });
  const roofG = std({ color: '#7b8083', roughness: 0.52, metalness: 0.4 });
  const frame = std({ color: '#1d1f22', roughness: 0.6 });
  // konehalli taustalla (harjakatto, tumma pelti), ikkunoita ja ovi
  const FH = { x0: -27, x1: 3, z0: -35, z1: -18.5, h: 5.2 };
  shell(g, FH, dark); gable(g, FH, 3.2, 'x', dark(16), std({ color: '#3d4043', roughness: 0.7, metalness: 0.3 }));
  for (const x of [-22.5, -14.5, -6.5]) box(4.6, 4.2, 0.12, std({ color: '#5d6166', roughness: 0.5, metalness: 0.5, normalMap: claddingNormal([1, 17]), normalScale: new THREE.Vector2(0.6, 0.6) }), x, 2.1, FH.z1 + 0.06, g);
  for (const x of [-18.6, -10.6, -1.2]) win(g, 'z', x, 3.6, FH.z1, 1.4, 0.9, rnd() < 0.6 ? M.glassLit : M.glass, frame);
  // kuivaamon matala osa: uunihuone + sähkötila (pääkeskus), itäseinä x = 14
  const AN = { x0: 8, x1: XB, z0: -17, z1: -10, h: 5.2 };
  shell(g, AN, dark); flatRoof(g, AN);
  door(XB, -13.6); box(0.08, 2.2, 1.2, M.door, 8.0 - 0.05, 1.1, -12.0, g);
  win(g, 'x', -11.4, 3.5, XB, 1.3, 0.8, M.glassLit, frame); win(g, 'x', -15.6, 3.5, XB, 1.3, 0.8, M.glass, frame);
  win(g, 'z', 13.1, 3.5, AN.z1, 1.1, 0.8, M.glassLit, frame);
  roofPanels(g, 8.3, 13.7, -15.6, -11.0, AN.h + 0.45);
  cyl(0.24, 10.6, M.darkMetal, 8.35, 5.3, -16.6, g, 14); cyl(0.32, 0.25, M.darkMetal, 8.35, 10.7, -16.6, g, 14);
  // kuivuritorni (jatkuvatoiminen lämminilmakuivuri), 3,0 × 3,4 m, 12,4 m
  const TW = { x0: 9.4, x1: 12.4, z0: -8.6, z1: -5.2 };
  const tcx = (TW.x0 + TW.x1) / 2, tcz = (TW.z0 + TW.z1) / 2, tw = TW.x1 - TW.x0, td = TW.z1 - TW.z0;
  box(tw - 0.3, 1.3, td - 0.3, galvD, tcx, 0.65, tcz, g);                       // purkuosa
  box(tw, 9.4, td, galv, tcx, 1.3 + 4.7, tcz, g);                              // kuivausosa
  box(tw + 0.3, 1.6, td + 0.3, galv, tcx, 10.7 + 0.8, tcz, g);                 // varasäiliö
  box(tw + 0.5, 0.14, td + 0.5, roofG, tcx, 12.37, tcz, g);                    // kansi
  box(1.0, 0.5, 1.0, galvD, tcx - 0.3, 12.69, tcz + 0.2, g);
  const lv = louverTex.clone(); lv.repeat.set(1, 2.4); lv.needsUpdate = true;
  const lvM = std({ map: lv, roughness: 0.65, metalness: 0.3 });
  box(tw - 0.5, 7.6, 0.02, lvM, tcx, 6.0, TW.z1 + 0.012, g, false, true);        // poistoilma-säleiköt (+z)
  box(0.02, 7.6, td - 0.6, lvM, TW.x1 + 0.012, 6.0, tcz, g, false, true);        // (+x)
  for (let y = 1.3; y <= 10.8; y += 1.9) { box(tw + 0.04, 0.06, td + 0.04, galvD, tcx, y, tcz, g, false, true); }
  // tikkaat ja kaide itäpuolella
  for (const dz of [-0.22, 0.22]) box(0.05, 12.2, 0.05, galvD, TW.x1 + 0.28, 6.25, TW.z1 - 0.6 + dz, g, false);
  for (let y = 2.4; y < 12.2; y += 0.9) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.022, 4, 16, Math.PI), galvD); r.rotation.set(Math.PI / 2, 0, -Math.PI / 2); r.position.set(TW.x1 + 0.28, y, TW.z1 - 0.6); g.add(r); }
  for (const [x0, x1, z0, z1] of [[TW.x0 - 0.15, TW.x1 + 0.15, TW.z1 + 0.15, TW.z1 + 0.15], [TW.x1 + 0.15, TW.x1 + 0.15, TW.z0 - 0.15, TW.z1 + 0.15]]) {
    box(Math.max(0.04, x1 - x0), 0.04, Math.max(0.04, z1 - z0), galvD, (x0 + x1) / 2, 13.4, (z0 + z1) / 2, g, false);
  }
  // elevaattori + pää + putket siiloihin
  const EL = { x: 13.0, z: -7.4 };
  box(0.9, 1.1, 1.0, galvD, EL.x, 0.55, EL.z, g);
  box(0.24, 13.2, 0.32, galv, EL.x - 0.15, 6.6 + 0.5, EL.z, g); box(0.24, 13.2, 0.32, galv, EL.x + 0.15, 6.6 + 0.5, EL.z, g);
  box(0.95, 0.9, 0.8, galv, EL.x, 14.1, EL.z, g); box(0.95, 0.1, 0.85, roofG, EL.x, 14.6, EL.z, g);
  // siilot
  const BINS = [[5.6, -5.6], [2.4, -12.4]], R = 2.6, BH = 6.4, CH = 1.9;
  for (const [bx, bz] of BINS) {
    cyl(R + 0.3, 0.3, M.concrete, bx, 0.15, bz, g, 40);
    const w = mesh(new THREE.CylinderGeometry(R, R, BH, 56, 1, true), binM, g); w.position.set(bx, 0.3 + BH / 2, bz);
    const top = mesh(new THREE.ConeGeometry(R + 0.18, CH, 56, 1, true), roofG, g); top.position.set(bx, 0.3 + BH + CH / 2, bz);
    cyl(0.42, 0.42, galvD, bx, 0.3 + BH + CH - 0.05, bz, g, 16);
    cyl(R + 0.06, 0.12, galvD, bx, 0.3 + BH, bz, g, 56);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const st = box(0.09, BH, 0.05, galvD, bx + Math.cos(a) * (R + 0.02), 0.3 + BH / 2, bz + Math.sin(a) * (R + 0.02), g, false); st.rotation.y = -a + Math.PI / 2; }
    const ld = new THREE.Group(); ld.position.set(bx + R * Math.cos(0.6) + 0.12, 0, bz + R * Math.sin(0.6) + 0.12); ld.rotation.y = -0.6; g.add(ld);
    for (const dz of [-0.2, 0.2]) box(0.04, BH, 0.04, galvD, 0, 0.3 + BH / 2 + 0.6, dz, ld, false);
    // putki elevaattorin päästä siilon kattoon
    tube([EL.x - 0.3, 13.8, EL.z], [bx + 0.2, 0.3 + BH + CH + 0.3, bz], 0.12, galvD, g);
  }
  tube([EL.x - 0.3, 13.9, EL.z + 0.1], [tcx + 0.4, 12.9, tcz], 0.12, galvD, g);
  // lämminilmakanava uunihuoneesta torniin
  const du = cyl(0.5, 1.7, galvD, tcx - 0.2, 2.2, -9.45, g, 22); du.rotation.x = Math.PI / 2;
  // vastaanottokuoppa
  box(2.6, 0.08, 3.0, M.concrete, 14.9, 0.04, -5.0, g); box(1.8, 0.02, 2.2, std({ map: louverTex, roughness: 0.7, metalness: 0.4 }), 14.9, 0.09, -5.0, g, false);
}

/* ---------- 2. hotelli ja hoivakoti (hotell) ---------- */
function hotell() {
  const g = new THREE.Group(); scene.add(g);
  const MB = { x0: -15, x1: 8, z0: -20, z1: -6.5, h: 10.3 };              // kolme kerrosta (3,8 + 3,2 + 3,2 m)
  const facade = (len) => plaster(LIGHT === 'dusk' ? '#4e4842' : '#a39b8f', len / 3.2, 10.3 / 3.2);
  shell(g, MB, facade); flatRoof(g, MB, 0.8);
  const frame = std({ color: '#26231f', roughness: 0.6 });
  const litW = std({ color: '#2a2016', emissive: new THREE.Color('#ffcf8f'), emissiveIntensity: 1.7, roughness: 0.2 });
  const litW2 = std({ color: '#2a2016', emissive: new THREE.Color('#ffd9a6'), emissiveIntensity: 0.95, roughness: 0.2 });
  const pick = () => { const r = rnd(); return r < 0.2 ? M.glassLit : r < 0.4 ? litW2 : r < 0.47 ? litW : M.glass; };
  for (let f = 0; f < 3; f++) {
    const y = [1.9, 5.65, 8.85][f];
    // pohjakerros: aula ja ravintola lasitettuna (isot valaistut ikkunat), yläkerroksissa huoneiden ikkunat
    if (f === 0) {
      const lobby = std({ color: '#2a2016', emissive: new THREE.Color('#ffd09a'), emissiveIntensity: 0.85, roughness: 0.2 });
      let k = 0;
      for (let x = MB.x0 + 1.6; x < MB.x1 - 0.9; x += 2.7) { if (Math.abs(x + 2.95) < 2.4) continue; win(g, 'z', x, 1.55, MB.z1, 2.0, 1.9, k++ % 4 === 1 ? M.glass : lobby, frame); }
      win(g, 'x', -8.0, 1.55, MB.x1, 2.0, 1.9, lobby, frame);
      continue;
    }
    for (let x = MB.x0 + 1.6; x < MB.x1 - 0.9; x += 2.7) win(g, 'z', x, y, MB.z1, 1.35, 1.45, pick(), frame);
    for (let z = MB.z1 - 1.5; z > MB.z0 + 0.9; z -= 2.7) win(g, 'x', z, y, MB.x1, 1.35, 1.45, pick(), frame);
  }
  // sisäänkäynti: lasiovet + katos
  box(3.2, 2.5, 0.06, M.glassLit, -2.95, 1.25, MB.z1 + 0.04, g, false, true);
  box(5.2, 0.22, 2.6, M.parapet, -2.95, 3.05, MB.z1 + 1.3, g);
  for (const x of [-5.2, -0.7]) cyl(0.07, 2.95, M.metal, x, 1.47, MB.z1 + 2.45, g, 10);
  // katolla aurinkopaneelit ja IV-konehuone
  roofPanels(g, MB.x0 + 1.0, MB.x1 - 1.2, MB.z0 + 1.8, MB.z1 - 1.4, MB.h + 0.45);
  box(3.6, 1.8, 2.6, M.darkMetal, MB.x0 + 4, MB.h + 0.9, MB.z0 + 2.0, g);
  // keittiösiipi itäpuolella (yksi kerros), pääkeskuksen ovi itäseinässä
  const KW = { x0: MB.x1, x1: XB, z0: -17, z1: -8.5, h: 4.4 };
  shell(g, KW, (len) => clad(LIGHT === 'dusk' ? '#34363a' : '#5a5f66', len)); flatRoof(g, KW, 0.6);
  door(XB, -13.6);
  win(g, 'x', -10.2, 3.1, XB, 1.6, 0.7, M.glassLit, frame); win(g, 'x', -16.0, 3.1, XB, 1.0, 0.7, M.glass, frame);
  box(2.6, 2.7, 0.1, std({ color: '#6d7177', roughness: 0.5, metalness: 0.5, normalMap: claddingNormal([1, 11]), normalScale: new THREE.Vector2(0.6, 0.6) }), 11.6, 1.35, KW.z1 + 0.05, g);
  box(3.4, 0.16, 1.5, M.parapet, 11.6, 3.15, KW.z1 + 0.75, g);
  win(g, 'z', 9.2, 2.6, KW.z1, 1.2, 1.0, M.glassLit, frame);
  // keittiön poistoilma: huuvat katolla (takaosa) + kanava päärakennuksen seinää ylös; aurinkopaneelit katon etuosassa
  for (const x of [10.2, 12.6]) { box(1.0, 0.7, 1.0, M.darkMetal, x, KW.h + 0.35, -15.9, g); box(1.2, 0.08, 1.2, M.parapet, x, KW.h + 0.74, -15.9, g); }
  roofPanels(g, KW.x0 + 0.4, KW.x1 - 0.3, -13.4, -10.8, KW.h + 0.4);
  box(0.7, MB.h - KW.h + 1.2, 0.7, M.metal, MB.x1 + 0.4, KW.h + (MB.h - KW.h + 1.2) / 2, -12.05, g);
  box(0.9, 0.3, 0.9, M.darkMetal, MB.x1 + 0.4, MB.h + 1.35, -12.05, g);
  // jäteastiat keittiön oven vieressä
  box(1.2, 1.25, 1.0, std({ color: '#3f4a42', roughness: 0.7 }), 13.25, 0.63, -7.7, g); box(1.2, 1.25, 1.0, std({ color: '#454a50', roughness: 0.7 }), 13.25, 0.63, -6.5, g);
  // pysäköinti: ruutuviivat + autot
  const lineM = std({ color: '#d8d6cf', roughness: 0.6 });
  for (let i = 0; i < 9; i++) box(0.12, 0.004, 4.8, lineM, -14 + i * 2.7, 0.016, -2.0, scene, false, true);
  const CARS = [[-4.55, '#2b3036'], [-1.85, '#5a5f64'], [3.55, '#2c3850'], [6.25, '#4a2b28']];
  for (const [x, c] of CARS) car(x, -2.2, Math.PI / 2 + (rnd() - 0.5) * 0.04, c);
}
function car(x, z, rot, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const paint = std({ color: LIGHT === 'dusk' ? color : color, roughness: 0.32, metalness: 0.45 });
  const body = mesh(new RoundedBoxGeometry(4.4, 0.72, 1.78, 3, 0.2), paint, g); body.position.y = 0.62;
  const cab = mesh(new RoundedBoxGeometry(2.4, 0.66, 1.6, 3, 0.22), paint, g); cab.position.set(-0.3, 1.22, 0);
  for (const sz of [0.805, -0.805]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.42), M.glass); sw.position.set(-0.3, 1.26, sz); if (sz < 0) sw.rotation.y = Math.PI; g.add(sw); }
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.5), M.glass); ws.position.set(0.92, 1.24, 0); ws.rotation.y = Math.PI / 2; ws.rotateX(-0.5); g.add(ws);
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), M.glass); rw.position.set(-1.52, 1.25, 0); rw.rotation.y = -Math.PI / 2; rw.rotateX(-0.4); g.add(rw);
  for (const [wx, wz] of [[1.4, 0.82], [1.4, -0.82], [-1.4, 0.82], [-1.4, -0.82]]) { const t = cyl(0.33, 0.22, M.tyre, wx, 0.33, wz, g, 20); t.rotation.x = Math.PI / 2; }
  return g;
}

/* ---------- 3. aurinkopuisto (paike) ---------- */
function paike() {
  const g = new THREE.Group(); scene.add(g);
  // kytkinrakennus (pääkeskus): tumma pelti, tasakatto räystäin, pariovi itäseinässä, säleiköt — tekninen rakennus, ei asuinrakennus
  const SB = { x0: 9.4, x1: XB, z0: -16.6, z1: -11.0, h: 3.3 };
  shell(g, SB, (len) => clad(LIGHT === 'dusk' ? '#2f3236' : '#535960', len));
  box(SB.x1 - SB.x0 + 0.6, 0.32, SB.z1 - SB.z0 + 0.6, std({ color: '#3a3d40', roughness: 0.6, metalness: 0.35 }), (SB.x0 + SB.x1) / 2, SB.h + 0.16, (SB.z0 + SB.z1) / 2, g);
  door(XB, -12.98); door(XB, -14.22);
  const frame = std({ color: '#1d1f22', roughness: 0.6 });
  box(1.1, 0.55, 0.03, M.louver, 12.6, 2.5, SB.z1 + 0.02, g, false); box(0.03, 0.55, 1.1, M.louver, XB + 0.02, 2.6, -15.6, g, false);
  win(g, 'z', 10.7, 2.45, SB.z1, 0.9, 0.5, M.glassLit, frame);
  // paneelikenttä: kiinteät pöydät, 2 paneelia pystyssä, kallistus 25° etelään (+z)
  const tilt = 0.44, depth = 2 * 2.28 + 0.03, low = 0.75, pz = Math.cos(tilt) * depth, hy = Math.sin(tilt) * depth;
  const ROWS = []; for (let k = 0; k < 8; k++) ROWS.push([-10.9 - k * 7.5, -46 - k * 3, 7.2]);
  const solarF = fadeGround(M.solar.clone(), 20, 58), postM = fadeGround(M.darkMetal.clone(), 20, 58), frameF = fadeGround(M.frame.clone(), 20, 58);
  let count = 0; for (const [, xa, xb] of ROWS) count += Math.floor((xb - xa) / 1.16);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.13, 0.035, 2.28), solarF, count * 2), d = new THREE.Object3D();
  let n = 0;
  for (const [zf, xa, xb] of ROWS) {
    const zc = zf - pz / 2, yc = low + hy / 2 + 0.05;                       // pöydän keskikohta
    const cols = Math.floor((xb - xa) / 1.16);
    for (let i = 0; i < cols; i++) for (const k of [-1, 1]) {
      const s = k * (2.28 + 0.03) / 2;                                        // paneelin keskikohta kaltevuutta pitkin
      d.position.set(xa + 0.58 + i * 1.16, yc + Math.sin(tilt) * s, zc - Math.cos(tilt) * s);
      d.rotation.set(tilt, 0, 0); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix);
    }
    // jalat ja palkit
    for (let x = xa + 1.2; x < xb; x += 3.6) {
      cyl(0.05, low + 0.1, postM, x, (low + 0.1) / 2, zf - 0.35, g, 8);
      cyl(0.05, low + hy - 0.15, postM, x, (low + hy - 0.15) / 2, zf - pz + 0.35, g, 8);
    }
    const bm = box(xb - xa, 0.08, 0.08, frameF, (xa + xb) / 2, low + 0.12, zf - 0.35, g); bm.castShadow = false;
  }
  inst.count = n; inst.castShadow = true; inst.receiveShadow = true; g.add(inst);
  // kentän aita (sama verkkoaita kuin akkualueella, häivytetty kuten maa)
  const fm = { post: fadeGround(M.fence.clone(), 20, 58), mesh: fadeGround(M.fenceMesh.clone(), 20, 58) };
  fence([[-80, -9.4], [8.6, -9.4], [8.6, -72]], 2.0, fm);
}
const OBJECTS = { kuivati, hotell, paike };

/* look=tausta: sähkötilan ovi auki itäseinässä (x = 14, z ≈ -13,6). Aukossa näkyy valaistu tila: pääkeskus
   (vaaleat kennot) ja sen vieressä ohjausyksikkö, jonka merkkivalo on kultainen. Kultainen viiva menee ovesta sisään. */
function electricalRoomOpen(g) {
  const tex = canvasTex(240, 440, (c, w, h) => {
    const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1a1712'); bg.addColorStop(0.62, '#3a2f22'); bg.addColorStop(1, '#6b5536');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    // pääkeskus: kolme kennoa (oikealla, koska katse kulkee aukosta -z-suuntaan)
    for (let i = 0; i < 3; i++) {
      const x0 = 104 + i * 44;
      const pg = c.createLinearGradient(0, 120, 0, 420); pg.addColorStop(0, '#8d877c'); pg.addColorStop(1, '#bdb4a3');
      c.fillStyle = pg; c.fillRect(x0, 120, 40, 300);
      c.fillStyle = 'rgba(40,36,30,0.55)'; c.fillRect(x0 + 19, 132, 2, 276);
    }
    // ohjausyksikkö pääkeskuksen vieressä: pieni kotelo ja kultainen merkkivalo
    c.fillStyle = '#5c564c'; c.fillRect(46, 170, 44, 56);
    c.fillStyle = '#F2CF7E'; c.fillRect(56, 182, 12, 5);
  }, [1, 1]);
  const m = std({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.8, roughness: 0.9 });
  box(0.04, 2.2, 1.2, m, HALL.x1 + 0.03, 1.1, -13.6, g, false, false);
  // karmi
  box(0.07, 0.07, 1.34, M.darkMetal, HALL.x1 + 0.04, 2.235, -13.6, g, false);
  for (const z of [-12.97, -14.23]) box(0.07, 2.27, 0.07, M.darkMetal, HALL.x1 + 0.04, 1.135, z, g, false);
  // ovilehti auki ulospäin, saranat -z-reunassa (ei peitä aukkoa kamerasta katsottuna)
  const leaf = box(1.2, 2.2, 0.06, M.door, HALL.x1 + 0.59, 1.1, -14.3, g); leaf.rotation.y = 0.17;
}

// ---------- industrial hall ----------
const HALL = { x0: -28, x1: 14, z0: -33, z1: -11, h: 9 };
function hall() {
  const g = new THREE.Group(); scene.add(g);
  const L = HALL.x1 - HALL.x0, D = HALL.z1 - HALL.z0, h = HALL.h;
  const wallMat = (len) => std({ color: TAUSTA ? '#3a3935' : LIGHT === 'dusk' ? '#2c2f33' : '#4b5057', roughness: 0.55, metalness: 0.45, normalMap: claddingNormal([len / 0.25, 1]), normalScale: new THREE.Vector2(0.9, 0.9) });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(L, h), wallMat(L)); front.position.set((HALL.x0 + HALL.x1) / 2, h / 2, HALL.z1); front.receiveShadow = true; front.castShadow = true; g.add(front);
  const back = front.clone(); back.rotation.y = Math.PI; back.position.z = HALL.z0; g.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(D, h), wallMat(D)); side.rotation.y = Math.PI / 2; side.position.set(HALL.x1, h / 2, (HALL.z0 + HALL.z1) / 2); side.receiveShadow = true; side.castShadow = true; g.add(side);
  const side2 = side.clone(); side2.rotation.y = -Math.PI / 2; side2.position.x = HALL.x0; g.add(side2);
  // shadow caster volume
  const vol = box(L - 0.1, h, D - 0.1, std({ color: '#222', colorWrite: false }), (HALL.x0 + HALL.x1) / 2, h / 2, (HALL.z0 + HALL.z1) / 2, g, true, false); vol.material.colorWrite = false;
  // roof + parapet
  const roof = box(L, 0.2, D, M.roof, (HALL.x0 + HALL.x1) / 2, h - 0.1, (HALL.z0 + HALL.z1) / 2, g);
  box(L + 0.2, 0.7, 0.25, M.parapet, (HALL.x0 + HALL.x1) / 2, h + 0.15, HALL.z1, g);
  box(L + 0.2, 0.7, 0.25, M.parapet, (HALL.x0 + HALL.x1) / 2, h + 0.15, HALL.z0, g);
  box(0.25, 0.7, D, M.parapet, HALL.x1, h + 0.15, (HALL.z0 + HALL.z1) / 2, g);
  box(0.25, 0.7, D, M.parapet, HALL.x0, h + 0.15, (HALL.z0 + HALL.z1) / 2, g);
  // window band (front) with mullions, some lit
  const wy = 5.9, wh = 1.3;
  for (let x = HALL.x0 + 2; x < HALL.x1 - 2; x += 1.6) {
    const lit = LIGHT === 'dusk' && !TAUSTA && rnd() < 0.55;
    box(1.45, wh, 0.06, lit ? M.glassLit : M.glass, x + 0.8, wy, HALL.z1 + 0.03, g, false, true);
  }
  for (let z = HALL.z0 + 2; z < HALL.z1 - 2; z += 1.6) {
    const lit = LIGHT === 'dusk' && !TAUSTA && rnd() < 0.5;
    const m = box(0.06, wh, 1.45, lit ? M.glassLit : M.glass, HALL.x1 + 0.03, wy, z + 0.8, g, false, true);
  }
  // loading doors
  for (const dx of [-22, -15.5]) {
    box(4.2, 4.6, 0.12, std({ color: '#7d8187', roughness: 0.5, metalness: 0.5, normalMap: claddingNormal([1, 18]), normalScale: new THREE.Vector2(0.6, 0.6) }), dx, 2.3, HALL.z1 + 0.06, g);
    box(5.0, 0.18, 1.6, M.parapet, dx, 4.9, HALL.z1 + 0.8, g);
  }
  // personnel door + electrical room door on side facing compound
  box(1.1, 2.2, 0.08, M.door, -9, 1.1, HALL.z1 + 0.05, g);
  const elDoorOpen = SHOT === 'survey' || SHOT === 'surveyWide';
  if (TAUSTA) electricalRoomOpen(g);
  else if (!elDoorOpen) box(0.08, 2.2, 1.2, M.door, HALL.x1 + 0.05, 1.1, -13.6, g);
  // rooftop solar rows (tilted to +z)
  const pw = 2.28, pd = 1.13, tilt = 0.21;
  const panelGeo = new THREE.BoxGeometry(pw, 0.035, pd);
  const rows = [];
  for (let z = HALL.z0 + 2.2; z < HALL.z1 - 1.8; z += 2.45) rows.push(z);
  let count = 0; const cols = Math.floor((L - 4) / (pw + 0.05));
  const inst = new THREE.InstancedMesh(panelGeo, M.solar, rows.length * cols);
  const dmy = new THREE.Object3D();
  for (const z of rows) for (let i = 0; i < cols; i++) {
    dmy.position.set(HALL.x0 + 2 + pw / 2 + i * (pw + 0.05), h + 0.45, z);
    dmy.rotation.set(tilt, 0, 0); dmy.updateMatrix(); inst.setMatrixAt(count++, dmy.matrix);
  }
  inst.castShadow = true; inst.receiveShadow = true; g.add(inst);
  // rooftop units
  box(3.2, 1.6, 2.2, M.darkMetal, HALL.x0 + 6, h + 0.8, HALL.z0 + 1.6, g);
  box(2.4, 1.2, 1.8, M.darkMetal, HALL.x1 - 5, h + 0.6, HALL.z0 + 1.4, g);
  return g;
}
if (SCENE === 'toostus') hall(); else OBJECTS[SCENE]();

// ---------- battery cabinet (all-in-one: PCS integrated, no separate inverter) ----------
const CAB = { w: 1.35, d: 1.01, h: 2.45 };
function cabinet(x, z, rotY = 0, scale = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; g.scale.setScalar(scale); scene.add(g);
  const bodyH = CAB.h - 0.17;
  const body = new THREE.Mesh(new RoundedBoxGeometry(CAB.w, bodyH, CAB.d, 3, 0.025), M.cab);
  body.position.set(0, 0.1 + bodyH / 2, 0); body.castShadow = true; body.receiveShadow = true; g.add(body);
  box(CAB.w + 0.05, 0.07, CAB.d + 0.06, M.cabTop, 0, 0.1 + bodyH + 0.035, 0, g);
  box(CAB.w - 0.06, 0.1, CAB.d - 0.06, M.cabDark, 0, 0.05, 0, g);
  const fz = CAB.d / 2 + 0.002;
  box(0.008, bodyH - 0.12, 0.004, M.seam, 0, 0.1 + bodyH / 2, fz, g, false);
  for (const sx of [-1, 1]) {
    box(0.55, 0.42, 0.006, M.louver, sx * 0.33, 0.45, fz + 0.001, g, false);
    box(0.55, 0.32, 0.006, M.louver, sx * 0.33, 1.95, fz + 0.001, g, false);
    box(0.025, 0.24, 0.03, M.metal, sx * 0.06, 1.25, fz + 0.012, g, false);
  }
  box(0.16, 0.035, 0.008, M.goldLed, 0.42, 2.18, fz + 0.002, g, false);
  box(0.006, 0.6, 0.62, M.louver, CAB.w / 2 + 0.002, 1.5, 0, g, false);
  return g;
}
function cabinetsRow() {
  const n = +(P.get('n') || 4), gap = 0.6;
  const startX = 19.6;
  // plinth
  const len = n * CAB.w + (n - 1) * gap + 0.8;
  box(len, 0.15, CAB.d + 0.7, M.concrete, startX + len / 2 - 0.4, 0.075, -6.0);
  const pos = [];
  for (let i = 0; i < n; i++) {
    const x = startX + CAB.w / 2 + i * (CAB.w + gap);
    const s = WRONG === 'scale' ? 2.6 : 1;
    const c = cabinet(x + (WRONG === 'scale' ? i * (s - 1) * CAB.w : 0), -6.0, 0, s); c.position.y = 0.15; pos.push(c.position.clone());
  }
  return pos;
}
const cabPos = cabinetsRow();

// ---------- compact substation (kiosk) ----------
const KIOSK = new THREE.Vector3(31.2, 0, -8.6);
function kiosk() {
  const g = new THREE.Group(); g.position.copy(KIOSK); g.rotation.y = 0; scene.add(g);
  box(2.6, 2.25, 2.25, M.kiosk, 0, 1.125, 0, g);
  box(2.85, 0.14, 2.5, std({ color: '#7f7c76', roughness: 0.8 }), 0, 2.32, 0, g);
  box(0.9, 1.9, 0.04, M.kioskDoor, -0.55, 1.05, 1.14, g, false);
  box(0.9, 1.9, 0.04, M.kioskDoor, 0.55, 1.05, 1.14, g, false);
  box(0.7, 0.35, 0.03, M.louver, -0.55, 1.75, 1.165, g, false);
  box(0.7, 0.35, 0.03, M.louver, 0.55, 1.75, 1.165, g, false);
  box(0.03, 0.5, 1.4, M.louver, 1.31, 1.6, 0, g, false);
  return g;
}
kiosk();

// ---------- WRONG: separate inverter box ----------
if (WRONG === 'inverter') {
  const g = new THREE.Group(); g.position.set(26.8, 0, -3.2); scene.add(g);
  box(2.2, 2.0, 1.2, M.inverter, 0, 1.0, 0, g);
  box(1.6, 0.5, 0.02, M.louver, 0, 1.4, 0.61, g, false);
}

// ---------- fence ----------
function fence(pts, h = 2.0, fm) {
  const postM = fm ? fm.post : M.fence;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(pts[i][0], 0, pts[i][1]), b = new THREE.Vector3(pts[i + 1][0], 0, pts[i + 1][1]);
    const len = a.distanceTo(b), n = Math.max(1, Math.round(len / 2.5));
    for (let k = 0; k <= n; k++) { const p = a.clone().lerp(b, k / n); cyl(0.035, h, postM, p.x, h / 2, p.z, scene, 8); }
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, h - 0.1), fm ? fm.mesh.clone() : M.fenceMesh.clone());
    if (fm) mesh.material.onBeforeCompile = fm.mesh.onBeforeCompile, mesh.material.customProgramCacheKey = fm.mesh.customProgramCacheKey;
    mesh.material.alphaMap = meshTex.clone(); mesh.material.alphaMap.repeat.set(len / 0.12, (h - 0.1) / 0.12); mesh.material.alphaMap.needsUpdate = true;
    mesh.position.set(mid.x, h / 2, mid.z); mesh.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 6), postM); rail.position.set(mid.x, h, mid.z); rail.rotation.z = Math.PI / 2; rail.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); scene.add(rail);
  }
}
if (!SHOW.includes('nofence')) fence([[18.4, -2.6], [18.4, -12.0], [34.6, -12.0], [34.6, 0.6], [24.0, 0.6]]);

// ---------- energy lines (behind-the-meter path) ----------
function energyLine(points, r = 0.055, mat = M.energy) {
  const path = new THREE.CurvePath();
  for (let i = 0; i < points.length - 1; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i]), new THREE.Vector3(...points[i + 1])));
  const m = new THREE.Mesh(new THREE.TubeGeometry(path, points.length * 24, r, 8, false), mat);
  scene.add(m); return m;
}
const EY = 0.04;
const ER = Math.min(0.06, Math.max(0.016, 0.06 * PR.vh / 28));
if (!SHOW.includes('noenergy')) {
  // battery -> main switchboard (behind the meter): bright
  energyLine([[TAUSTA ? 25.9 : 26.5, EY, -7.25], [17.2, EY, -7.25], [17.2, EY, -13.5], [TAUSTA ? 13.8 : 14.1, EY, -13.5]], ER, M.energy);
  // site supply: transformer/meter kiosk -> main switchboard: dim
  energyLine([[29.9, EY, -9.2], [29.9, EY, -10.9], [16.8, EY, -10.9], [16.8, EY, -13.9], [TAUSTA ? 13.8 : 14.1, EY, -13.9]], ER * 0.75, M.energyGrid);
  // kiosk -> grid riser: dim
  energyLine([[32.5, EY, -8.6], [35.6, EY, -8.6], [35.6, EY, -12.4]], ER * 0.75, M.energyGrid);
}
// ---------- MV line to the grid ----------
function pole(x, z, hgt = 10) {
  cyl(0.15, hgt, M.wood, x, hgt / 2, z, scene, 10);
  const arm = box(2.2, 0.12, 0.12, M.darkMetal, x, hgt - 0.5, z); arm.rotation.y = Math.PI / 4;
  const pts = [];
  for (const k of [-0.9, 0, 0.9]) { const px = x + k * Math.cos(Math.PI / 4), pz = z - k * Math.sin(Math.PI / 4); cyl(0.05, 0.28, M.insul, px, hgt - 0.3, pz, scene, 8); pts.push(new THREE.Vector3(px, hgt - 0.18, pz)); }
  return pts;
}
const polesXZ = [[35.6, -12.6], [43.2, -21.2], [50.8, -29.8], [58.4, -38.4], [66.0, -47.0]];
const polePts = polesXZ.map(([x, z]) => pole(x, z));
for (let i = 0; i < polePts.length - 1; i++) for (let k = 0; k < 3; k++) {
  const a = polePts[i][k], b = polePts[i + 1][k];
  const mid = a.clone().add(b).multiplyScalar(0.5); mid.y -= 0.7;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.014, 5, false), M.wire); m.castShadow = true; scene.add(m);
}
// riser cable at first pole
cyl(0.05, 8.6, M.darkMetal, 35.6 + 0.22, 4.3, -12.6, scene, 8);

// ---------- van ----------
function van(x, z, rot) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const sh = new THREE.Shape();
  sh.moveTo(-2.95, 0.38); sh.lineTo(-2.95, 2.5); sh.quadraticCurveTo(-2.95, 2.62, -2.8, 2.62); sh.lineTo(1.55, 2.62);
  sh.quadraticCurveTo(1.75, 2.6, 1.85, 2.45); sh.lineTo(2.55, 1.42); sh.quadraticCurveTo(2.62, 1.32, 2.85, 1.25);
  sh.quadraticCurveTo(3.02, 1.2, 3.02, 1.0); sh.lineTo(3.02, 0.38); sh.lineTo(-2.95, 0.38);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 1.86, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -0.93);
  const body = new THREE.Mesh(geo, M.van); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // windshield on slope
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), M.glass); ws.position.set(2.22, 1.97, 0); ws.rotation.set(0, Math.PI / 2, 0); ws.rotateX(-0.97); g.add(ws);
  for (const sz of [1.005, -1.005]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.62), M.glass); sw.position.set(1.62, 1.95, sz); if (sz < 0) sw.rotation.y = Math.PI; g.add(sw); }
  box(0.9, 0.25, 1.9, M.tyre, 2.85, 0.48, 0, g, false);
  for (const [wx, wz] of [[2.0, 0.9], [2.0, -0.9], [-2.0, 0.9], [-2.0, -0.9]]) { const t = cyl(0.37, 0.24, M.tyre, wx, 0.37, wz, g, 22); t.rotation.x = Math.PI / 2; const hub = cyl(0.17, 0.25, M.metal, wx, 0.37, wz, g, 16); hub.rotation.x = Math.PI / 2; }
  box(5.9, 0.05, 0.02, std({ color: '#C7A45C', roughness: 0.35, metalness: 0.6 }), 0, 1.15, 1.005, g, false);
  return g;
}
if (!SHOW.includes('novan')) van(12.6, -1.6, 0.28);

// ---------- trees ----------
function spruce(x, z, h) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  cyl(0.18, h * 0.25, M.trunk, 0, h * 0.12, 0, g, 6);
  const n = 4; for (let i = 0; i < n; i++) { const r = h * 0.22 * (1 - i / (n + 0.5)); const c = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.42, 9), i % 2 ? M.spruce : M.spruce2); c.position.y = h * 0.22 + i * h * 0.19; c.castShadow = true; c.receiveShadow = true; g.add(c); }
}
function birch(x, z, h) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  cyl(0.12, h * 0.6, M.birchBark, 0, h * 0.3, 0, g, 8);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(h * (0.13 + rnd() * 0.07), 1), M.birchLeaf); s.position.set((rnd() - 0.5) * h * 0.28, h * (0.55 + rnd() * 0.3), (rnd() - 0.5) * h * 0.28); s.castShadow = true; s.receiveShadow = true; g.add(s); }
}
if (!SHOW.includes('notrees')) {
  const tz = SCENE === 'paike' ? [[15, -39.5, 12], [21, -43, 15], [27, -40, 13], [33, -47, 14], [12, -48, 13], [-20, -78, 15], [-6, -80, 14]]
    : [[-26, -40, 13], [-20, -42, 15], [-13, -39, 12], [-6, -43, 16], [1, -40, 13], [8, -42, 14], [15, -39.5, 12], [21, -43, 15], [27, -40, 13], [-33, -30, 14], [-34, -22, 12], [-32, -14, 13]];
  for (const [x, z, h] of tz) spruce(x, z, h);
}

// ---------- people (proportioned scale figures) ----------
function taper(r0, r1, h, mat, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, seg, 1), mat); m.castShadow = true; m.receiveShadow = true; return m;
}
function ball(r, mat, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; }
function seg(parent, len, r0, r1, mat, x, y, z) {
  // pivot at top, segment hangs down (-y)
  const pv = new THREE.Group(); pv.position.set(x, y, z); parent.add(pv);
  const t = taper(r1, r0, len, mat); t.position.y = -len / 2; pv.add(t);
  const j = ball(Math.min(r0, r1) * 1.02, mat); j.position.y = -len; pv.add(j);
  return pv;
}
const _down = new THREE.Vector3(0, -1, 0);
function ik(sh, el, S, Tg, pole, a = 0.30, b = 0.30) {
  const c = Math.min(S.distanceTo(Tg), a + b - 1e-3);
  const u = Tg.clone().sub(S).normalize();
  const cosA = THREE.MathUtils.clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  const v = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
  const E = S.clone().add(u.clone().multiplyScalar(a * cosA).add(v.multiplyScalar(a * sinA)));
  const d1 = E.clone().sub(S).normalize(), d2 = Tg.clone().sub(E).normalize();
  const q1 = new THREE.Quaternion().setFromUnitVectors(_down, d1);
  const q2 = new THREE.Quaternion().setFromUnitVectors(_down, d2.clone().applyQuaternion(q1.clone().invert()));
  sh.quaternion.copy(q1); el.quaternion.copy(q2);
}
function person(o) {
  const g = new THREE.Group(); g.position.set(o.x, 0.0, o.z); g.rotation.y = o.rot || 0; scene.add(g);
  g.scale.setScalar((o.h || 1.76) / 1.76);
  const top = o.top, bottom = o.bottom || M.trousers, skin = M.skin;
  // pelvis
  const pel = ball(0.158, bottom, 1, 0.5, 0.7); pel.position.y = 0.94; g.add(pel);
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = seg(g, 0.43, 0.088, 0.072, bottom, sx * 0.095, 0.93, 0);
    const knee = seg(hip, 0.42, 0.068, 0.052, bottom, 0, -0.43, 0);
    const shoe = new THREE.Mesh(new RoundedBoxGeometry(0.105, 0.075, 0.27, 2, 0.03), M.shoe); shoe.position.set(0, -0.455, 0.045); shoe.castShadow = true; knee.add(shoe);
    if (o.stripes) { const st = taper(0.062, 0.06, 0.035, M.reflect); st.position.y = -0.3; knee.add(st); }
    legs.push([hip, knee]);
  }
  // torso (lathe profile, flattened front-back)
  const prof = [[0.0, 0.0], [0.158, 0.0], [0.165, 0.08], [0.168, 0.2], [0.18, 0.32], [0.19, 0.42], [0.17, 0.5], [0.11, 0.56], [0.06, 0.58], [0.0, 0.58]].map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), top); torso.scale.set(1, 1, 0.66); torso.position.y = 0.9; torso.castShadow = true; torso.receiveShadow = true; g.add(torso);
  if (o.stripes) for (const yy of [1.06, 1.15]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.1705, 0.17, 0.035, 28, 1, true), M.reflect); st.scale.set(1, 1, 0.665); st.position.y = yy; g.add(st); }
  const neck = taper(0.052, 0.048, 0.1, skin); neck.position.y = 1.53; g.add(neck);
  const head = new THREE.Group(); head.position.y = 1.635; g.add(head);
  head.add(ball(0.092, skin, 0.95, 1.18, 1.05));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.04, 8), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, -0.005, 0.098); head.add(nose);
  for (const sx of [-1, 1]) { const ear = ball(0.02, skin, 0.5, 1, 0.8); ear.position.set(sx * 0.088, 0.0, 0.0); head.add(ear); }
  if (o.helmet) {
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.112, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.helmet); hm.scale.set(1, 0.92, 1.12); hm.position.y = 0.035; hm.castShadow = true; head.add(hm);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.128, 0.012, 24), M.helmet); brim.scale.set(1, 1, 1.22); brim.position.set(0, 0.036, 0.018); head.add(brim);
  } else {
    const hr = new THREE.Mesh(new THREE.SphereGeometry(0.097, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.85), o.hair || M.hair); hr.scale.set(1, 1.12, 1.08); hr.position.set(0, 0.02, -0.012); hr.castShadow = true; head.add(hr);
  }
  const arms = [];
  for (const sx of [-1, 1]) {
    const shb = ball(0.066, top); shb.position.set(sx * 0.19, 1.405, 0); g.add(shb);
    const sh = seg(g, 0.28, 0.058, 0.05, top, sx * 0.2, 1.405, 0);
    const el = seg(sh, 0.255, 0.048, 0.04, top, 0, -0.28, 0);
    const hand = ball(0.042, skin, 0.75, 1.25, 0.5); hand.position.y = -0.3; el.add(hand);
    if (o.stripes) { const st = taper(0.049, 0.047, 0.03, M.reflect); st.position.y = -0.15; el.add(st); }
    arms.push([sh, el]);
  }
  const pose = o.pose || 'stand';
  if (pose === 'camera') {
    for (const [i, [sh, el]] of arms.entries()) { const sx = i ? 1 : -1; ik(sh, el, new THREE.Vector3(sx * 0.2, 1.405, 0), new THREE.Vector3(sx * 0.082, 1.585, 0.25), new THREE.Vector3(sx * 0.9, -1, -0.15).normalize()); }
    const cam = new THREE.Group(); cam.position.set(0, 1.62, 0.27); g.add(cam);
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.1, 0.075, 2, 0.012), M.camera); cam.add(body);
    const grip = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.09, 0.05, 2, 0.01), M.camera); grip.position.set(0.06, -0.005, 0.02); cam.add(grip);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.036, 0.085, 24), M.lens); lens.rotation.x = Math.PI / 2; lens.position.z = 0.075; cam.add(lens);
    head.rotation.x = 0.06;
  } else if (pose === 'tablet') {
    for (const [i, [sh, el]] of arms.entries()) { const sx = i ? 1 : -1; ik(sh, el, new THREE.Vector3(sx * 0.2, 1.405, 0), new THREE.Vector3(sx * 0.115, 1.08, 0.3), new THREE.Vector3(sx * 0.3, -0.4, -1).normalize()); }
    const tb = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.012, 0.19, 2, 0.006), M.tablet); tb.position.set(0, 1.1, 0.33); tb.rotation.x = 0.5; tb.castShadow = true; g.add(tb);
    head.rotation.x = 0.32;
  } else if (pose === 'point') {
    const [sh, el] = arms[1]; sh.rotation.x = -1.4; sh.rotation.z = 0.2; el.rotation.x = -0.12;
    head.rotation.y = 0.1;
  } else if (pose === 'walk') {
    legs[0][0].rotation.x = -0.34; legs[0][1].rotation.x = 0.28; legs[1][0].rotation.x = 0.3; legs[1][1].rotation.x = 0.12;
    arms[0][0].rotation.x = 0.32; arms[1][0].rotation.x = -0.3; arms[0][1].rotation.x = -0.2; arms[1][1].rotation.x = -0.35;
  } else {
    arms[0][0].rotation.z = -0.07; arms[1][0].rotation.z = 0.07; arms[0][1].rotation.x = -0.12; arms[1][1].rotation.x = -0.12;
  }
  return g;
}
const PEOPLE = {};
if (TAUSTA) {
  // yksi ihminen mittakaavaksi: omistaja tabletin kanssa sähkötilan oven vieressä
  PEOPLE.owner = person({ x: 15.35, z: -15.35, rot: 0.55, top: M.coat, bottom: M.trousers, pose: 'tablet', h: 1.74 });
} else if (!SHOW.includes('nopeople')) {
  PEOPLE.electrician = person({ x: 22.4, z: -3.2, rot: Math.PI + 0.25, top: M.navy, bottom: M.trousers, stripes: true, helmet: true, pose: 'camera' });
  PEOPLE.owner = person({ x: 25.3, z: -2.6, rot: Math.PI - 0.35, top: M.coat, bottom: M.trousers, pose: 'tablet', h: 1.72 });
  if (SCENE === 'toostus') PEOPLE.walker = person({ x: 9.6, z: 0.4, rot: 0.9, top: M.coat2, bottom: M.trousers, pose: 'walk', h: 1.8, hair: M.hair });
}

// ---------- survey scene extras: open electrical room with main switchboard ----------
if (SHOT === 'survey' || SHOT === 'surveyWide') {
  // opening in the side wall: dark interior box visible through the door
  const dx = HALL.x1;
  box(0.1, 2.25, 1.25, M.interior, dx - 0.02, 1.12, -13.6, scene, false, true);
  const door = box(0.06, 2.2, 1.2, M.door, dx + 0.62, 1.1, -12.95, scene); door.rotation.y = 1.2;
  // main switchboard cabinets placed just outside for visibility (as if a wall-mounted outdoor main board)
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group(); g.position.set(dx + 0.35, 0, -16.4 + i * 0.86); scene.add(g);
    box(0.4, 2.0, 0.82, M.switchboard, 0, 1.0, 0, g);
    box(0.02, 1.8, 0.004, M.seam, 0.205, 1.0, 0, g, false).rotation.y = Math.PI / 2;
    box(0.01, 0.12, 0.3, M.goldLed, 0.205, 1.7, 0.18, g, false);
  }
  PEOPLE.surveyor = person({ x: dx + 2.25, z: -15.2, rot: -Math.PI / 2 - 0.15, top: M.navy, stripes: true, helmet: true, pose: 'camera' });
  PEOPLE.owner2 = person({ x: dx + 2.9, z: -13.6, rot: -Math.PI / 2 - 0.6, top: M.coat, pose: 'tablet', h: 1.72 });
}

// ---------- people studio ----------
if (SHOT === 'people') {
  scene.clear(); scene.background = BG.clone();
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 })); sg.rotation.x = -Math.PI / 2; sg.receiveShadow = true; scene.add(sg);
  person({ x: -0.75, z: 0, rot: 0.35, top: M.navy, stripes: true, helmet: true, pose: 'camera' });
  person({ x: 0.15, z: -0.2, rot: -0.2, top: M.coat, pose: 'tablet', h: 1.72 });
  person({ x: 1.0, z: 0.1, rot: -0.6, top: M.coat2, pose: 'point', h: 1.8 });
}
// ---------- scale lineup ----------
if (SHOT === 'scale') {
  scene.clear(); scene.background = BG.clone();
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.2 })); sg.rotation.x = -Math.PI / 2; sg.receiveShadow = true; scene.add(sg);
  const z = 0, ry = -0.32;
  person({ x: -10.9, z, rot: 0.25, top: M.navy, stripes: true, helmet: true, pose: 'stand' });
  const cb = cabinet(-8.5, z, ry); cb.position.y = 0;
  const kg = new THREE.Group(); kg.position.set(-4.4, 0, z); kg.rotation.y = ry; scene.add(kg);
  box(2.6, 2.25, 2.25, M.kiosk, 0, 1.125, 0, kg); box(2.85, 0.14, 2.5, std({ color: '#7f7c76', roughness: 0.8 }), 0, 2.32, 0, kg);
  box(0.9, 1.9, 0.04, M.kioskDoor, -0.55, 1.05, 1.14, kg, false); box(0.9, 1.9, 0.04, M.kioskDoor, 0.55, 1.05, 1.14, kg, false);
  const ct = new THREE.Group(); ct.position.set(1.9, 0, z); ct.rotation.y = ry; scene.add(ct);
  box(6.06, 2.59, 2.44, std({ color: '#d4d1ca', roughness: 0.5, metalness: 0.3, normalMap: claddingNormal([24, 1]), normalScale: new THREE.Vector2(0.8, 0.8) }), 0, 1.295, 0, ct);
  van(9.4, z, ry);
  const wall = new THREE.Group(); wall.position.set(15.6, 0, z - 0.5); wall.rotation.y = ry; scene.add(wall);
  box(3.2, 9, 0.3, std({ color: '#4b5057', roughness: 0.55, metalness: 0.45, normalMap: claddingNormal([13, 1]) }), 0, 4.5, 0, wall);
  box(3.4, 0.6, 0.4, M.parapet, 0, 9.3, 0, wall);
  window.SCALE_ANCHORS = true;
}
// ---------- lights ----------
const hemi = TAUSTA ? new THREE.HemisphereLight('#4a505a', '#26211b', 1.05)
  : new THREE.HemisphereLight(LIGHT === 'dusk' ? '#3a4a66' : '#dfe6ee', LIGHT === 'dusk' ? '#2a2015' : '#8a7f6c', LIGHT === 'dusk' ? 0.55 : 1.15);
scene.add(hemi);
const sun = new THREE.DirectionalLight(TAUSTA ? '#e6cba6' : LIGHT === 'dusk' ? '#ffb070' : '#fff6ea', TAUSTA ? 1.7 : LIGHT === 'dusk' ? 2.4 : 2.9);
const sunAz = +(P.get('sunaz') || (LIGHT === 'dusk' ? -0.75 : -0.55)), sunEl = +(P.get('sunel') || (LIGHT === 'dusk' ? 0.34 : 0.72));
sun.position.set(SITE.x + Math.sin(sunAz) * Math.cos(sunEl) * 120, Math.sin(sunEl) * 120, SITE.z + Math.cos(sunAz) * Math.cos(sunEl) * 120);
sun.target.position.copy(SITE); scene.add(sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
const sc = sun.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 10; sc.far = 300;
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
scene.add(sun);
if (LIGHT === 'dusk') {
  const fill = new THREE.DirectionalLight('#6f8fbf', 0.35); fill.position.set(SITE.x + 60, 40, SITE.z + 80); scene.add(fill);
  for (const p of cabPos) { const l = new THREE.PointLight('#f3c77a', TAUSTA ? 0.5 : 1.2, 6, 2); l.position.set(p.x, 2.9, p.z + 1.2); scene.add(l); }
  const yl = new THREE.PointLight('#ffd9a0', 30, 28, 2); yl.position.set(HALL.x1 - 1, 7.5, HALL.z1 + 2.5); scene.add(yl);
  if (SCENE === 'kuivati') yl.position.set(16.2, 6.8, -10.8);
  const lamp = (x, y, z, i, d) => { const l = new THREE.PointLight('#ffd9a0', i, d, 2); l.position.set(x, y, z); scene.add(l); };
  if (SCENE === 'kuivati') { lamp(9.6, 7.5, 0.6, 9, 18); lamp(12.9, 12.9, -4.6, 2.5, 7); }
  if (SCENE === 'hotell') { lamp(-2.95, 2.75, -5.3, 6, 9); lamp(11.6, 2.9, -7.7, 5, 8); }
  if (SCENE === 'paike') lamp(14.4, 2.6, -12.2, 5, 8);
  if (TAUSTA) { yl.intensity = 14; lamp(14.6, 1.9, -13.6, 9, 7); lamp(23.5, 10, -8.5, 34, 26); }
} else {
  const fill = new THREE.DirectionalLight('#ffffff', 0.45); fill.position.set(SITE.x + 60, 50, SITE.z + 80); scene.add(fill);
}

// ---------- camera ----------
const az = PR.az, el = PR.el;
const viewH = PR.vh;
const tgt = new THREE.Vector3(PR.tx, PR.ty || 0, PR.tz);
const aspect = W / H;
const offX = (PR.fx - 0.5) * viewH * aspect, offY = -(PR.fy - 0.5) * viewH;
const cam = new THREE.OrthographicCamera(-viewH * aspect / 2 - offX, viewH * aspect / 2 - offX, viewH / 2 - offY, -viewH / 2 - offY, 1, 1200);
const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
cam.position.copy(tgt).addScaledVector(dir, 400);
cam.lookAt(tgt); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
const fogNear = +(P.get('fn') || 0), fogFar = +(P.get('ff') || 0);
if (fogFar > 0) scene.fog = new THREE.Fog(BG, fogNear, fogFar);

// ---------- post ----------
const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
composer.addPass(new RenderPass(scene, cam));
const ao = new N8AOPostPass(scene, cam, W, H);
ao.configuration.aoRadius = +(P.get('aor') || 1.6);
ao.configuration.distanceFalloff = 0.6;
ao.configuration.intensity = +(P.get('aoi') || 2.6);
ao.configuration.aoSamples = 16; ao.configuration.denoiseSamples = 8; ao.configuration.denoiseRadius = 6;
ao.configuration.halfRes = false;
ao.configuration.color = new THREE.Color('#000000');
composer.addPass(ao);
const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: LIGHT === 'dusk' ? 0.85 : 1.1, luminanceSmoothing: 0.2, intensity: LIGHT === 'dusk' ? 1.1 : 0.35, radius: 0.7 });
const tm = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
renderer.toneMappingExposure = +(P.get('exp') || (TAUSTA ? 1.12 : LIGHT === 'dusk' ? 1.0 : 0.95));
composer.addPass(new EffectPass(cam, bloom, new SMAAEffect(), tm));

// ---------- anchors for labels ----------
function proj(v) { const p = v.clone().project(cam); return [Math.round((p.x + 1) / 2 * W), Math.round((1 - p.y) / 2 * H)]; }
/* Tarrojen ankkurit kaikille kohteille samoilla avaimilla (scripts/render-stills.mjs muuntaa murtoluvuiksi):
   peakilp = kohta, jossa kultainen viiva lähtee rakennuksesta; salvesti = kaappirivin yläreuna; liitumispunkt =
   muuntamon katto; vork = ensimmäisen pylvään eristimet; paike = näkyvien paneelien keskikohta. */
function LABELS() {
  const L = SITE_LABELS[SCENE] || SITE_LABELS.toostus, o = {};
  for (const k of Object.keys(L)) o[k] = proj(new THREE.Vector3(...L[k]));
  return o;
}
window.ANCHORS = SHOT === 'scale' ? {
  person: proj(new THREE.Vector3(-10.9, 1.76, 0)), personBase: proj(new THREE.Vector3(-10.9, 0, 0)),
  cabinet: proj(new THREE.Vector3(-8.5, 2.45, 0)), cabinetBase: proj(new THREE.Vector3(-8.5, 0, 0)),
  kiosk: proj(new THREE.Vector3(-4.4, 2.39, 0)), kioskBase: proj(new THREE.Vector3(-4.4, 0, 0)),
  container: proj(new THREE.Vector3(1.9, 2.59, 0)), containerBase: proj(new THREE.Vector3(1.9, 0, 0)),
  van: proj(new THREE.Vector3(9.4, 2.55, 0)), vanBase: proj(new THREE.Vector3(9.4, 0, 0)),
  wall: proj(new THREE.Vector3(15.6, 9.0, -0.5)), wallBase: proj(new THREE.Vector3(15.6, 0, -0.5)),
} : (SCENE !== 'toostus' || P.get('labels')) ? LABELS() : {
  cabinets: proj(new THREE.Vector3(21.8, 2.6, -6)),
  cabinetsBase: proj(new THREE.Vector3(21.8, 0.2, -5.4)),
  kiosk: proj(new THREE.Vector3(31.2, 2.5, -8.6)),
  switchboard: proj(new THREE.Vector3(14.1, 1.2, -13.6)),
  meter: proj(new THREE.Vector3(31.2, 2.4, -8.6)),
  grid: proj(new THREE.Vector3(43.2, 9.6, -21.2)),
  solar: proj(new THREE.Vector3(-4, 9.6, -22)),
  electrician: proj(new THREE.Vector3(22.4, 1.9, -3.2)),
  owner: proj(new THREE.Vector3(25.3, 1.9, -2.6)),
  hall: proj(new THREE.Vector3(-7, 6, -11)),
};

if (P.get('norender')) window.DONE = true;   // vain ankkurit (render-stills.mjs --anchors-only)
else requestAnimationFrame(() => {
  composer.render();
  requestAnimationFrame(() => { composer.render(); window.DONE = true; });
});
