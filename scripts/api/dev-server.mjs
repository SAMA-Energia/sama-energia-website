/* Local contract test: serves a standalone page and the two functions; every upstream is mocked.
   Run: node scripts/api/dev-server.mjs <standalone.html> <port> */
import http from 'node:http';
import fs from 'node:fs';
import zlib from 'node:zlib';
const [,, page, port] = process.argv;
process.env.MML_API_KEY = 'LOCAL-TEST-KEY';
const realFetch = globalThis.fetch;
const png = (() => { // 256x256 grey PNG
  const w = 256, h = 256, raw = Buffer.alloc((w * 3 + 1) * h, 0x55); for (let y = 0; y < h; y++) raw[y * (w * 3 + 1)] = 0;
  const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 0xff] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
})();
const log = [];
globalThis.fetch = async (url, init) => {
  const u = String(url); log.push(u.replace(/\?.*/, '?…'));
  const J = (o, ct = 'application/json') => new Response(JSON.stringify(o), { headers: { 'content-type': ct } });
  if (u.includes('maanmittauslaitos.fi/geocoding')) return J({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [22.8442, 62.7903] }, properties: { label: 'Teollisuustie 5', 'label:municipality': 'Seinäjoki', 'label:placeType': 'Osoite' } }] }, 'application/geo+json');
  if (u.includes('inaadress')) return J({ addresses: [{ ipikkaadress: 'Tööstuse tn 5, Kohila alev, Kohila vald, Rapla maakond', viitepunkt_l: '24.749695', viitepunkt_b: '59.170154', liikVal: 'EHITISHOONE' }] });
  if (u.includes('re.jrc.ec.europa.eu')) return J({ inputs: { meteo_data: { radiation_db: 'PVGIS-SARAH3', year_min: 2005, year_max: 2023 }, mounting_system: { fixed: { slope: { value: 43 } } } }, outputs: { totals: { fixed: { E_y: 912.4 } } } });
  if (u.includes('karttakuva.maanmittauslaitos.fi') || u.includes('tiles.maaamet.ee')) return new Response(png, { headers: { 'content-type': 'image/png' } });
  return realFetch(url, init);
};
const { default: paikka } = await import('../../netlify/functions/paikka.mjs');
const { default: ruutu } = await import('../../netlify/functions/ruutu.mjs');
const html = fs.readFileSync(page);
http.createServer(async (req, res) => {
  const url = 'http://127.0.0.1:' + port + req.url;
  if (req.url === '/__log') { res.end(JSON.stringify(log)); return; }
  if (req.url.startsWith('/api/')) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = new Request(url, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
    const out = await (req.url.startsWith('/api/paikka') ? paikka(r) : ruutu(r));
    res.writeHead(out.status, Object.fromEntries(out.headers)); res.end(Buffer.from(await out.arrayBuffer())); return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html);
}).listen(Number(port), '127.0.0.1');
