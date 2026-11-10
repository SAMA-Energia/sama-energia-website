/* Tests for /api/paikka and /api/ruutu with every upstream mocked (no network). Run: node --test scripts/api/api.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import paikka, { cleanQuery } from '../../netlify/functions/paikka.mjs';
import ruutu, { tileTouches } from '../../netlify/functions/ruutu.mjs';

const KEY = 'TEST-KEY-1234-5678';
let calls = [];
let routes = [];

function route(match, fn) { routes.push({ match, fn }); }
globalThis.fetch = async (url, init = {}) => {
  calls.push({ url: String(url), init });
  for (const r of routes) if (r.match(String(url))) return r.fn(String(url), init);
  return new Response('no route', { status: 500 });
};
const jsonRes = (o, ct = 'application/json') => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': ct } });

beforeEach(() => {
  calls = [];
  routes = [];
  process.env.MML_API_KEY = KEY;
  delete process.env.MML_LAYER;
});

const SITE = 'https://samaenergia.fi';
function post(body, headers = {}) {
  return new Request(SITE + '/api/paikka', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', origin: SITE, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const tile = (p, headers = { 'sec-fetch-site': 'same-origin' }) => new Request(SITE + p, { headers });
const noKeyAnywhere = () => {
  for (const c of calls) {
    assert.ok(!c.url.includes(KEY), 'key must never be in a URL');
  }
};

const MML_OK = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [22.8442, 62.7903] }, properties: { label: 'Teollisuustie 5', 'label:municipality': 'Seinäjoki', 'label:placeType': 'Osoite' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [18.0, 59.3] }, properties: { label: 'Outside Finland' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [22.85, 62.79] }, properties: { label: '<img src=x onerror=alert(1)>\u0007‮' } },
  ],
};
const INADS_OK = {
  addresses: [
    { ipikkaadress: 'Tööstuse tn 5, Kohila alev, Kohila vald, Rapla maakond', viitepunkt_l: '24.749695', viitepunkt_b: '59.170154', liikVal: 'EHITISHOONE' },
    { ipikkaadress: 'No coordinates', viitepunkt_l: '', viitepunkt_b: '' },
  ],
};

/* ---------- request hygiene ---------- */

test('only POST', async () => {
  const r = await paikka(new Request(SITE + '/api/paikka', { method: 'GET', headers: { 'sec-fetch-site': 'same-origin' } }));
  assert.equal(r.status, 405);
  assert.equal(calls.length, 0);
});

test('cross-site browser call is refused before any upstream call', async () => {
  const r1 = await paikka(post({ op: 'haku', q: 'Teollisuustie 5' }, { 'sec-fetch-site': 'cross-site', origin: 'https://evil.example' }));
  assert.equal(r1.status, 403);
  const r2 = await paikka(post({ op: 'haku', q: 'Teollisuustie 5' }, { 'sec-fetch-site': '', origin: 'https://evil.example' }));
  assert.equal(r2.status, 403);
  const r3 = await paikka(post({ op: 'haku', q: 'Teollisuustie 5' }, { 'sec-fetch-site': '', origin: 'null' }));
  assert.equal(r3.status, 403);
  assert.equal(calls.length, 0);
});

test('wrong content type, oversize body and bad JSON', async () => {
  assert.equal((await paikka(post('{"op":"haku","q":"abc"}', { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await paikka(post(JSON.stringify({ op: 'haku', q: 'a'.repeat(5000) })))).status, 413);
  assert.equal((await paikka(post('{not json'))).status, 400);
  assert.equal((await paikka(post('[1,2]'))).status, 400);
  assert.equal((await paikka(post({ op: 'delete' }))).status, 400);
  assert.equal(calls.length, 0);
});

test('query validation', () => {
  assert.equal(cleanQuery('Teollisuustie 5, Seinäjoki'), 'Teollisuustie 5, Seinäjoki');
  assert.equal(cleanQuery('  Tööstuse   5 Rapla '), 'Tööstuse 5 Rapla');
  assert.equal(cleanQuery('ab'), '');
  assert.equal(cleanQuery('x'.repeat(121)), '');
  assert.equal(cleanQuery('<script>alert(1)</script>'), '');
  assert.equal(cleanQuery('https://evil.example/?a=b'), '');
  assert.equal(cleanQuery({ q: 1 }), '');
});

/* ---------- search ---------- */

test('FI search: key in Authorization header only, results rebuilt and filtered', async () => {
  route(u => u.startsWith('https://avoin-paikkatieto.maanmittauslaitos.fi/geocoding/v2/pelias/search?'), () => jsonRes(MML_OK, 'application/geo+json'));
  const r = await paikka(post({ op: 'haku', q: 'Teollisuustie 5 Seinäjoki', lang: 'fi' }));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('cross-origin-resource-policy'), 'same-origin');
  assert.equal(r.headers.get('access-control-allow-origin'), null);
  const d = await r.json();
  assert.equal(d.fi, true);
  assert.equal(d.results.length, 2);
  assert.deepEqual(d.results[0], { t: 'Teollisuustie 5, Seinäjoki', lon: 22.8442, lat: 62.7903, k: 'Osoite', c: 'FI' });
  assert.ok(!/[\u0000-\u001f‮]/.test(d.results[1].t), 'control/format characters stripped');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(calls[0].init.headers.Authorization, 'Basic ' + Buffer.from(KEY + ':').toString('base64'));
  noKeyAnywhere();
});

test('no MML key: Finnish site falls back to In-ADS and reports fi:false', async () => {
  delete process.env.MML_API_KEY;
  route(u => u.startsWith('https://inaadress.maaamet.ee/inaadress/gazetteer?'), () => jsonRes(INADS_OK));
  const d = await (await paikka(post({ op: 'haku', q: 'Tööstuse 5 Rapla', lang: 'fi' }))).json();
  assert.equal(d.fi, false);
  assert.deepEqual(d.results, [{ t: 'Tööstuse tn 5, Kohila alev, Kohila vald, Rapla maakond', lon: 24.7497, lat: 59.17015, k: 'EHITISHOONE', c: 'EE' }]);
  assert.ok(!calls.some(c => c.url.includes('maanmittauslaitos')));
});

test('Estonian site asks In-ADS first and MML only when nothing is found', async () => {
  route(u => u.includes('inaadress'), () => jsonRes({ addresses: [] }));
  route(u => u.includes('maanmittauslaitos'), () => jsonRes(MML_OK));
  const d = await (await paikka(post({ op: 'haku', q: 'Teollisuustie 5', lang: 'et' }))).json();
  assert.ok(calls[0].url.includes('inaadress'));
  assert.ok(calls[1].url.includes('maanmittauslaitos'));
  assert.equal(d.results[0].c, 'FI');
});

test('upstream failure gives a generic 502, never upstream text', async () => {
  route(() => true, () => new Response('Internal detail: key=' + KEY, { status: 500 }));
  const r = await paikka(post({ op: 'haku', q: 'Teollisuustie 5', lang: 'fi' }));
  assert.equal(r.status, 502);
  const txt = await r.text();
  assert.equal(txt, '{"error":"upstream"}');
});

test('redirects are refused (fetch is told redirect:error)', async () => {
  route(() => true, () => { throw new TypeError('redirect mode is set to error'); });
  const r = await paikka(post({ op: 'haku', q: 'Teollisuustie 5', lang: 'fi' }));
  assert.equal(r.status, 502);
  assert.ok(calls.every(c => c.init.redirect === 'error'));
});

test('upstream with wrong content type is rejected', async () => {
  route(() => true, () => new Response('<html>login</html>', { status: 200, headers: { 'content-type': 'text/html' } }));
  const r = await paikka(post({ op: 'haku', q: 'Teollisuustie 5', lang: 'fi' }));
  assert.equal(r.status, 502);
});

/* ---------- solar ---------- */

const PV_OK = {
  inputs: { meteo_data: { radiation_db: 'PVGIS-SARAH3', year_min: 2005, year_max: 2023 }, mounting_system: { fixed: { slope: { value: 43, optimal: true } } } },
  outputs: { totals: { fixed: { E_y: 912.37 } } },
};

test('PV: rounded coordinates go upstream, result is rebuilt, second call is cached', async () => {
  route(u => u.startsWith('https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?'), () => jsonRes(PV_OK));
  const r = await paikka(post({ op: 'pv', lon: 23.761234, lat: 61.498765 }));
  assert.deepEqual(await r.json(), { ey: 912, slope: 43, db: 'PVGIS-SARAH3', y0: 2005, y1: 2023 });
  const u = new URL(calls[0].url);
  assert.equal(u.searchParams.get('lat'), '61.50');
  assert.equal(u.searchParams.get('lon'), '23.76');
  assert.equal(u.searchParams.get('optimalinclination'), '1');
  const r2 = await paikka(post({ op: 'pv', lon: 23.7612, lat: 61.4991 }));
  assert.equal(r2.status, 200);
  assert.equal(calls.length, 1, 'served from cache');
});

test('PV: coordinates outside Finland/Estonia, strings or NaN are refused', async () => {
  assert.equal((await paikka(post({ op: 'pv', lon: 2.35, lat: 48.85 }))).status, 400);
  assert.equal((await paikka(post({ op: 'pv', lon: '24.9', lat: '60.2' }))).status, 400);
  assert.equal((await paikka(post('{"op":"pv","lon":1e999,"lat":60}'))).status, 400);
  assert.equal(calls.length, 0);
});

test('PV: implausible upstream values are not passed on', async () => {
  route(() => true, () => jsonRes({ ...PV_OK, outputs: { totals: { fixed: { E_y: 99999 } } } }));
  assert.equal((await paikka(post({ op: 'pv', lon: 25.1, lat: 60.3 }))).status, 502);
});

/* ---------- tiles ---------- */

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
const pngRes = () => new Response(PNG, { status: 200, headers: { 'content-type': 'image/png' } });

test('EE tile: TMS y is flipped, CDN-cached, same-origin only', async () => {
  route(u => u.startsWith('https://tiles.maaamet.ee/'), pngRes);
  // z=12 tile over Rapla: x=2330, y=1211 (XYZ)
  const r = await ruutu(tile('/api/ruutu/ee/12/2330/1211.png'));
  assert.equal(r.status, 200);
  assert.equal(calls[0].url, 'https://tiles.maaamet.ee/tm/tms/1.0.0/hallkaart@GMC/12/2330/' + (4096 - 1 - 1211) + '.png');
  assert.equal(r.headers.get('content-type'), 'image/png');
  assert.equal(r.headers.get('cross-origin-resource-policy'), 'same-origin');
  assert.match(r.headers.get('netlify-cdn-cache-control'), /durable/);
});

test('FI tile: key in header, never in the URL; layer is allow-listed', async () => {
  route(u => u.startsWith('https://avoin-karttakuva.maanmittauslaitos.fi/'), pngRes);
  process.env.MML_LAYER = '../../evil';
  const r = await ruutu(tile('/api/ruutu/fi/10/583/290.png'));
  assert.equal(r.status, 200);
  assert.ok(calls[0].url.includes('/taustakartta/default/WGS84_Pseudo-Mercator/10/290/583.png'));
  assert.ok(calls[0].init.headers.Authorization.startsWith('Basic '));
  noKeyAnywhere();
});

test('tiles outside the country, bad zoom, bad paths and cross-site requests are refused without upstream calls', async () => {
  assert.equal((await ruutu(tile('/api/ruutu/fi/10/0/0.png'))).status, 404);            // mid-Pacific
  assert.equal((await ruutu(tile('/api/ruutu/ee/12/2330/1211.png'.replace('12', '19')))).status, 404);
  assert.equal((await ruutu(tile('/api/ruutu/fi/3/4/2.png'))).status, 404);             // zoom too low
  assert.equal((await ruutu(tile('/api/ruutu/xx/12/1/1.png'))).status, 404);
  assert.equal((await ruutu(tile('/api/ruutu/fi/10/583/290.png/../../x'))).status, 404);
  assert.equal((await ruutu(tile('/api/ruutu/fi/10/583/290.png', { 'sec-fetch-site': 'cross-site' }))).status, 403);
  assert.equal(calls.length, 0);
});

test('tile: no key -> 503; upstream non-image -> 502; errors are not cacheable', async () => {
  delete process.env.MML_API_KEY;
  const r1 = await ruutu(tile('/api/ruutu/fi/10/583/290.png'));
  assert.equal(r1.status, 503);
  assert.equal(r1.headers.get('cache-control'), 'no-store');
  route(() => true, () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } }));
  const r2 = await ruutu(tile('/api/ruutu/ee/12/2330/1211.png'));
  assert.equal(r2.status, 502);
  assert.equal(r2.headers.get('netlify-cdn-cache-control'), null);
});

test('tile: oversize upstream image is cut off', async () => {
  route(() => true, () => new Response(new Uint8Array(700_000), { status: 200, headers: { 'content-type': 'image/png' } }));
  assert.equal((await ruutu(tile('/api/ruutu/ee/12/2330/1211.png'))).status, 502);
});

test('tile bbox helper', () => {
  assert.equal(tileTouches(583, 290, 10, [19.0, 59.3, 31.7, 70.2]), true);
  assert.equal(tileTouches(0, 0, 10, [19.0, 59.3, 31.7, 70.2]), false);
});
