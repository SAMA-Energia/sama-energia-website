/* SAMA Energia — /api/paikka (address search and solar estimate for the map card). 08.11.2026.
   Contract (unchanged from the v51 client, assets/kartta-paikka.js):
     POST {op:'haku', q, lang:'fi'|'et'} -> {results:[{t, lon, lat, k, c:'FI'|'EE'}], fi:boolean}
     POST {op:'pv', lon, lat}            -> {ey, slope, db, y0, y1}
   Upstreams (fixed hosts): Maanmittauslaitos geocoding v2 (key, Basic auth), Maa- ja Ruumiamet In-ADS
   (no key), EU JRC PVGIS 5.3 (no key; browser calls are not allowed, so it must go through us).
   Security rules are in ../lib/guard.mjs. */
import {
  json, fail, env, basicAuth, crossSite, readCapped, upstreamJson, cleanText, TtlCache, BOX, inBox,
} from '../lib/guard.mjs';

const MAX_BODY = 2048;
const MAX_RESULTS = 6;
const Q_OK = /^[\p{L}\p{N}\s.,'’\-–/()#&:]+$/u;
const MML = 'https://avoin-paikkatieto.maanmittauslaitos.fi/geocoding/v2/pelias/search';
const INADS = 'https://inaadress.maaamet.ee/inaadress/gazetteer';
const PVGIS = 'https://re.jrc.ec.europa.eu/api/v5_3/PVcalc';
const pvCache = new TtlCache(2000, 7 * 24 * 3600 * 1000);

export const config = {
  path: '/api/paikka',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

export default async function paikka(req) {
  if (req.method !== 'POST') return fail(405, 'method', { Allow: 'POST' });
  if (crossSite(req)) return fail(403, 'origin');
  const ct = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (ct !== 'application/json') return fail(415, 'type');
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return fail(413, 'size');

  let body;
  try {
    const raw = await readCapped(req.body, MAX_BODY);
    body = JSON.parse(new TextDecoder('utf-8').decode(raw));
  } catch (e) {
    return e && e.code === 'size' ? fail(413, 'size') : fail(400, 'json');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(400, 'json');

  try {
    if (body.op === 'haku') return await haku(body);
    if (body.op === 'pv') return await pv(body);
    return fail(400, 'op');
  } catch (e) {
    console.error('paikka', String(body.op).slice(0, 8), e && e.code ? e.code : 'error');
    return fail(502, 'upstream');
  }
}

/* ---------- address search ---------- */

export function cleanQuery(q) {
  if (typeof q !== 'string') return '';
  const s = q.normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (s.length < 3 || s.length > 120 || !Q_OK.test(s)) return '';
  return s;
}

async function haku(body) {
  const q = cleanQuery(body.q);
  if (!q) return fail(400, 'q');
  const lang = body.lang === 'et' ? 'et' : 'fi';
  const key = env('MML_API_KEY');
  const order = lang === 'fi' ? ['FI', 'EE'] : ['EE', 'FI'];
  let results = [];
  let answered = 0;
  let lastErr = null;
  for (const c of order) {
    if (c === 'FI' && !key) continue;
    try {
      results = c === 'FI' ? await searchFI(q, key) : await searchEE(q);
      answered++;
    } catch (e) {
      lastErr = e;
      continue;
    }
    if (results.length) break;
  }
  if (!answered && lastErr) throw lastErr;
  return json(200, { results: results.slice(0, MAX_RESULTS), fi: Boolean(key) });
}

function round5(n) {
  return Math.round(n * 1e5) / 1e5;
}

async function searchFI(q, key) {
  const u = new URL(MML);
  u.searchParams.set('text', q);
  u.searchParams.set('sources', 'addresses,interpolated-road-addresses,geographic-names');
  u.searchParams.set('lang', 'fi');
  u.searchParams.set('size', String(MAX_RESULTS));
  const d = await upstreamJson(u.toString(), { headers: { Authorization: basicAuth(key) } });
  const feats = Array.isArray(d && d.features) ? d.features : [];
  const out = [];
  const seen = new Set();
  for (const f of feats) {
    const g = f && f.geometry;
    const p = (f && f.properties) || {};
    if (!g || g.type !== 'Point' || !Array.isArray(g.coordinates)) continue;
    const lon = Number(g.coordinates[0]);
    const lat = Number(g.coordinates[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || !inBox(lon, lat, BOX.FI)) continue;
    let t = cleanText(p.label);
    const muni = cleanText(p['label:municipality'], 60);
    if (muni && t && !t.includes(muni)) t = t + ', ' + muni;
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push({ t, lon: round5(lon), lat: round5(lat), k: cleanText(p['label:placeType'], 40), c: 'FI' });
    if (out.length >= MAX_RESULTS) break;
  }
  return out;
}

async function searchEE(q) {
  const u = new URL(INADS);
  u.searchParams.set('results', String(MAX_RESULTS));
  u.searchParams.set('address', q);
  const d = await upstreamJson(u.toString());
  const list = Array.isArray(d && d.addresses) ? d.addresses : [];
  const out = [];
  const seen = new Set();
  for (const a of list) {
    if (!a || typeof a !== 'object') continue;
    const lon = Number(a.viitepunkt_l);
    const lat = Number(a.viitepunkt_b);
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || !inBox(lon, lat, BOX.EE)) continue;
    const t = cleanText(a.ipikkaadress || a.pikkaadress);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push({ t, lon: round5(lon), lat: round5(lat), k: cleanText(a.liikVal, 40), c: 'EE' });
    if (out.length >= MAX_RESULTS) break;
  }
  return out;
}

/* ---------- solar estimate ---------- */

async function pv(body) {
  const lon = body.lon;
  const lat = body.lat;
  if (typeof lon !== 'number' || typeof lat !== 'number' || !Number.isFinite(lon) || !Number.isFinite(lat)) {
    return fail(400, 'coords');
  }
  if (!inBox(lon, lat, BOX.FI) && !inBox(lon, lat, BOX.EE)) return fail(400, 'coords');
  /* Rounded to 0.01° (about 1 km): enough for a yearly kWh/kWp figure, and the exact site never leaves us. */
  const la = Math.round(lat * 100) / 100;
  const lo = Math.round(lon * 100) / 100;
  const ck = la.toFixed(2) + ',' + lo.toFixed(2);
  const hit = pvCache.get(ck);
  if (hit) return json(200, hit);

  const u = new URL(PVGIS);
  u.searchParams.set('lat', la.toFixed(2));
  u.searchParams.set('lon', lo.toFixed(2));
  u.searchParams.set('peakpower', '1');
  u.searchParams.set('loss', '14');
  u.searchParams.set('optimalinclination', '1');
  u.searchParams.set('aspect', '0');
  u.searchParams.set('outputformat', 'json');
  const d = await upstreamJson(u.toString(), { timeoutMs: 9000 });

  const ey = Number(d?.outputs?.totals?.fixed?.E_y);
  const slope = Number(d?.inputs?.mounting_system?.fixed?.slope?.value);
  const dbRaw = String(d?.inputs?.meteo_data?.radiation_db ?? '');
  const y0 = Number(d?.inputs?.meteo_data?.year_min);
  const y1 = Number(d?.inputs?.meteo_data?.year_max);
  if (!Number.isFinite(ey) || ey < 200 || ey > 1600 || !Number.isFinite(slope) || slope < 0 || slope > 90) {
    const e = new Error('shape');
    e.code = 'shape';
    throw e;
  }
  const out = {
    ey: Math.round(ey),
    slope: Math.round(slope),
    db: /^[A-Za-z0-9-]{1,32}$/.test(dbRaw) ? dbRaw : 'PVGIS',
  };
  if (Number.isInteger(y0) && Number.isInteger(y1) && y0 >= 1990 && y1 <= 2100 && y0 <= y1) {
    out.y0 = y0;
    out.y1 = y1;
  }
  pvCache.set(ck, out);
  return json(200, out);
}
