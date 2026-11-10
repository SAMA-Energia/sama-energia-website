/* SAMA Energia — /api/ruutu/{fi|ee}/{z}/{x}/{y}.png (map tiles for the small map in the place card). 08.11.2026.
   Web Mercator XYZ tiles, y from the top (as the client computes them).
     fi -> Maanmittauslaitos WMTS, layer from MML_LAYER (default taustakartta), key in an Authorization header
     ee -> Maa- ja Ruumiamet TMS hallkaart@GMC (no key; TMS counts y from the bottom)
   Only tiles that touch Finland or Estonia are served, so the proxy can't be used as a free world tile CDN.
   Good tiles are cached on Netlify's CDN for 30 days, so most views never reach this function or the upstream.
   Cross-Origin-Resource-Policy: same-origin stops other sites from hotlinking the tiles in a browser. */
import { BASE_HEADERS, fail, env, basicAuth, crossSite, upstream, BOX } from '../lib/guard.mjs';

const RE = /^\/api\/ruutu\/(fi|ee)\/(\d{1,2})\/(\d{1,6})\/(\d{1,6})\.png$/;
const LIM = {
  fi: { zmin: 5, zmax: 16, box: BOX.FI },
  ee: { zmin: 5, zmax: 18, box: BOX.EE },
};
const MML_LAYERS = new Set(['taustakartta', 'selkokartta', 'maastokartta']);

export const config = {
  path: '/api/ruutu/*',
  rateLimit: { windowLimit: 600, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

function tileLon(x, n) {
  return (x / n) * 360 - 180;
}
function tileLat(y, n) {
  return (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
}
export function tileTouches(x, y, z, b) {
  const n = 2 ** z;
  const w = tileLon(x, n);
  const e = tileLon(x + 1, n);
  const north = tileLat(y, n);
  const south = tileLat(y + 1, n);
  return e >= b[0] && w <= b[2] && north >= b[1] && south <= b[3];
}

export default async function ruutu(req) {
  if (req.method !== 'GET') return fail(405, 'method', { Allow: 'GET' });
  if (crossSite(req)) return fail(403, 'origin');
  const m = RE.exec(new URL(req.url).pathname);
  if (!m) return fail(404, 'tile');
  const c = m[1];
  const z = Number(m[2]);
  const x = Number(m[3]);
  const y = Number(m[4]);
  const L = LIM[c];
  const n = 2 ** z;
  if (z < L.zmin || z > L.zmax || x >= n || y >= n || !tileTouches(x, y, z, L.box)) return fail(404, 'tile');

  let url;
  const headers = {};
  if (c === 'fi') {
    const key = env('MML_API_KEY');
    if (!key) return fail(503, 'unavailable');
    const layer = MML_LAYERS.has(env('MML_LAYER')) ? env('MML_LAYER') : 'taustakartta';
    url = `https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/${layer}/default/WGS84_Pseudo-Mercator/${z}/${y}/${x}.png`;
    headers.Authorization = basicAuth(key);
  } else {
    url = `https://tiles.maaamet.ee/tm/tms/1.0.0/hallkaart@GMC/${z}/${x}/${n - 1 - y}.png`;
  }

  try {
    const { ct, buf } = await upstream(url, { headers, maxBytes: 600_000, types: ['image/png', 'image/jpeg'] });
    return new Response(buf, {
      status: 200,
      headers: {
        ...BASE_HEADERS,
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=604800',
        'Netlify-CDN-Cache-Control': 'public, durable, max-age=2592000, stale-while-revalidate=604800',
      },
    });
  } catch (e) {
    console.error('ruutu', c, e && e.code ? e.code : 'error');
    return fail(502, 'upstream');
  }
}
