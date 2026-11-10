/* SAMA Energia — shared guard for the /api functions (paikka, ruutu). No dependencies.
   Rules (08.11.2026):
   - Only our own pages may call these endpoints (same-origin check + no CORS headers).
   - Fixed upstream hosts only; nothing from the request ever becomes part of a hostname.
   - The MML key lives only in the environment (Netlify env var MML_API_KEY) and travels to MML
     in an Authorization header, never in a URL, a log line or a response.
   - Every upstream call has a timeout, refuses redirects and has a size cap.
   - Upstream bodies are never passed through: responses are rebuilt from validated fields.
   - No query text, coordinates or IP addresses are logged or stored. */

export const UA = 'SAMA-Energia-site/1.0 (+https://samaenergia.fi)';

export const BASE_HEADERS = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex',
});

export function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });
}

export function fail(status, code, extra = {}) {
  return json(status, { error: code }, extra);
}

export function env(name) {
  try {
    const N = globalThis.Netlify;
    if (N && N.env && typeof N.env.get === 'function') {
      const v = N.env.get(name);
      if (v) return String(v);
    }
  } catch { /* not on Netlify */ }
  return (typeof process !== 'undefined' && process.env && process.env[name]) ? String(process.env[name]) : '';
}

export function basicAuth(key) {
  return 'Basic ' + Buffer.from(key + ':', 'utf8').toString('base64');
}

/* A browser on another site must not use our endpoints (they carry our key and our quota).
   Sec-Fetch-Site is set by every current browser; Origin is checked as a second line. */
export function crossSite(req) {
  const sfs = (req.headers.get('sec-fetch-site') || '').toLowerCase();
  if (sfs && sfs !== 'same-origin' && sfs !== 'same-site' && sfs !== 'none') return true;
  const origin = req.headers.get('origin');
  if (origin && origin !== 'null') {
    try {
      if (new URL(origin).host !== new URL(req.url).host) return true;
    } catch {
      return true;
    }
  } else if (origin === 'null') {
    return true;
  }
  return false;
}

export class UpstreamError extends Error {
  constructor(code) {
    super('upstream');
    this.code = String(code);
  }
}

export async function readCapped(stream, maxBytes) {
  if (!stream) return new Uint8Array(0);
  const reader = stream.getReader();
  const parts = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch { /* ignore */ }
      throw new UpstreamError('size');
    }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.byteLength; }
  return out;
}

/* One upstream GET: fixed URL built by the caller, timeout, no redirects, content-type allow-list, size cap. */
export async function upstream(url, { headers = {}, timeoutMs = 6000, maxBytes = 1_000_000, types = [] } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA, Accept: types.join(', ') || '*/*', ...headers },
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new UpstreamError(e && e.name === 'TimeoutError' ? 'timeout' : 'network');
  }
  if (res.status === 429) throw new UpstreamError('busy');
  if (!res.ok) {
    try { await res.body?.cancel(); } catch { /* ignore */ }
    throw new UpstreamError('status-' + res.status);
  }
  const ct = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (types.length && !types.includes(ct)) {
    try { await res.body?.cancel(); } catch { /* ignore */ }
    throw new UpstreamError('type');
  }
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared > maxBytes) {
    try { await res.body?.cancel(); } catch { /* ignore */ }
    throw new UpstreamError('size');
  }
  const buf = await readCapped(res.body, maxBytes);
  return { ct, buf };
}

export async function upstreamJson(url, opts = {}) {
  const { buf } = await upstream(url, { types: ['application/json', 'application/geo+json'], ...opts });
  try {
    return JSON.parse(new TextDecoder('utf-8').decode(buf));
  } catch {
    throw new UpstreamError('json');
  }
}

/* Visible text from an upstream: no control or format characters, single spaces, capped length. */
export function cleanText(s, max = 160) {
  return String(s ?? '')
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/* Small in-memory TTL cache (per function instance; lost on cold start). */
export class TtlCache {
  constructor(max, ttlMs) {
    this.max = max;
    this.ttl = ttlMs;
    this.m = new Map();
  }
  get(k) {
    const e = this.m.get(k);
    if (!e) return undefined;
    if (e.t < Date.now()) { this.m.delete(k); return undefined; }
    return e.v;
  }
  set(k, v) {
    if (this.m.size >= this.max) this.m.delete(this.m.keys().next().value);
    this.m.set(k, { v, t: Date.now() + this.ttl });
  }
}

/* Coverage boxes [west, south, east, north], WGS84. */
export const BOX = Object.freeze({
  FI: [19.0, 59.3, 31.7, 70.2],
  EE: [21.5, 57.4, 28.3, 59.9],
});

export function inBox(lon, lat, b) {
  return lon >= b[0] && lon <= b[2] && lat >= b[1] && lat <= b[3];
}
