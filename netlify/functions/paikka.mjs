/* SAMA Energia — kartan paikkapalvelu (perustajan päätös 6.11.2026, Madis: valtion rekisterit oman funktion kautta).
   Selain puhuu vain tälle omalle osoitteelle; funktio kysyy:
     - osoitehaku (netlify/lib/osoite.mjs, v52 7.11.2026): Viro Maa- ja Ruumiamet In-ADS, Suomi Suomen ympäristökeskuksen (Syke)
       Ryhti-osoitteet (CC BY 4.0); kumpikaan ei vaadi avainta;
     - aurinkotuotto: EU JRC PVGIS (PVcalc, 1 kWp, häviöt 14 %, optimikulma);
     - taustakartan ruudut: Maa- ja Ruumiamet (hallkaart, GMC) ja MML (taustakartta, WGS84 Pseudo-Mercator, MML_API_KEY ympäristömuuttujana).
   Ei lokitusta, ei tallennusta, ei evästeitä. Käyttäjän IP-osoite ei välity lähteille (pyyntö lähtee palvelimelta).
   Haku ja PVGIS: POST /api/paikka { op: 'haku', q, lang } | { op: 'pv', lon, lat }. Ruudut: GET /api/ruutu/{ee|fi}/{z}/{x}/{y}.png */
import { search as osoitehaku } from '../lib/osoite.mjs';

export const config = { path: ['/api/paikka', '/api/ruutu/*'] };

const UA = 'SAMA-Energia-kartta/1.0 (+https://samaenergia.fi)';
const KEY = () => (typeof Netlify !== 'undefined' && Netlify.env ? Netlify.env.get('MML_API_KEY') : process.env.MML_API_KEY) || '';
const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
const get = (u, h = {}, ms = 7000) => fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json,image/*', ...h }, signal: AbortSignal.timeout(ms) });
const basic = (k) => 'Basic ' + btoa(k + ':');

export default async (req) => {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/ruutu/')) return tile(url);
  if (req.method !== 'POST') return json({ error: 'method' }, 405, { Allow: 'POST' });
  if (!/^application\/json/.test(req.headers.get('content-type') || '')) return json({ error: 'type' }, 415);
  let b;
  try { b = await req.json(); } catch { return json({ error: 'json' }, 400); }
  try {
    if (b && b.op === 'haku') return await search(b);
    if (b && b.op === 'pv') return await pv(b);
  } catch { return json({ error: 'upstream' }, 502); }
  return json({ error: 'op' }, 400);
};

async function search({ q, lang }) {
  const getJson = async (u) => { const r = await get(u, {}, 8000); return r.ok ? r.json() : null; };
  return json(await osoitehaku(q, lang, getJson));
}

async function pv({ lon, lat }) {
  lon = +lon; lat = +lat;
  if (!(lon > 19 && lon < 32.5 && lat > 57 && lat < 70.5)) return json({ error: 'range' }, 400);
  lon = Math.round(lon * 50) / 50; lat = Math.round(lat * 50) / 50;   // noin 1–2 km:n tarkkuus riittää säteilyaineistolle
  const base = `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=14&optimalangles=1&outputformat=json`;
  let r = await get(base, {}, 12000), d = r.ok ? await r.json() : null;
  if (!d || !d.outputs) { r = await get(base + '&raddatabase=PVGIS-ERA5', {}, 12000); d = r.ok ? await r.json() : null; }
  if (!d || !d.outputs) return json({ error: 'pvgis' }, 502);
  const m = d.inputs || {}, fx = (m.mounting_system || {}).fixed || {}, md = m.meteo_data || {};
  return json({ ey: Math.round(d.outputs.totals.fixed.E_y), slope: fx.slope ? fx.slope.value : null, db: md.radiation_db || '', y0: md.year_min || null, y1: md.year_max || null },
    200, { 'Cache-Control': 'public, max-age=86400' });
}

async function tile(url) {
  const m = url.pathname.match(/^\/api\/ruutu\/(ee|fi)\/(\d{1,2})\/(\d{1,6})\/(\d{1,6})\.png$/);
  if (!m) return new Response('', { status: 404 });
  const src = m[1], z = +m[2], x = +m[3], y = +m[4], n = 1 << z;
  if (z < 5 || z > 17 || x >= n || y >= n) return new Response('', { status: 404 });
  let u, h = {};
  if (src === 'ee') u = `https://tiles.maaamet.ee/tm/tms/1.0.0/hallkaart@GMC/${z}/${x}/${n - 1 - y}.png`;   // TMS: y alhaalta
  else {
    if (!KEY()) return new Response('', { status: 404 });
    u = `https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/taustakartta/default/WGS84_Pseudo-Mercator/${z}/${y}/${x}.png`;
    h.Authorization = basic(KEY());
  }
  let r;
  try { r = await get(u, h, 8000); } catch { return new Response('', { status: 504 }); }
  if (!r.ok) return new Response('', { status: r.status === 404 ? 404 : 502 });
  return new Response(r.body, { status: 200, headers: {
    'Content-Type': r.headers.get('content-type') || 'image/png', 'Cache-Control': 'public, max-age=604800',
    'Netlify-CDN-Cache-Control': 'public, max-age=2592000, durable', 'X-Content-Type-Options': 'nosniff' } });
}
