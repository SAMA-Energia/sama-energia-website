/* SAMA Energia — esikatselutiedoston osoitehaku (v52 7.11.2026; 9.11.2026 vain esikatselussa).
   Julkaistu sivu hakee osoitteet omalta palvelimelta (netlify/functions/paikka.mjs: Suomi Maanmittauslaitos avaimella,
   Viro In-ADS). Esikatselutiedostolla ei ole palvelinta, joten scripts/build-standalone.py upottaa tämän ja kunnat.mjs:n
   tiedostoon ilman import/export-rivejä ja vastaa /api/paikka-kutsuihin suoraan selaimesta (molemmat rekisterit sallivat
   selainkutsun, CORS *). Madis 9.11.2026: haku ei toiminut sovelluksen esikatselussa.
   Viro: Maa- ja Ruumiamet, In-ADS (ei avainta).
   Suomi: Suomen ympäristökeskus (Syke), Rakennetun ympäristön tietojärjestelmä Ryhti, avoimet osoitteet (OGC API Features,
   CC BY 4.0, ei avainta; https://www.syke.fi/en/environmental-data/use-license-and-responsibilities).
   Suomen haku: "Katu 5, Kunta" | "Katu 5 Kunta" | "Katu 5b, 60100 Kunta" | "Katu 5" | "Katu, Kunta" | "Katu Kunta".
   Kadun nimi alkuosana (kirjainkoolla ei väliä, suomeksi tai ruotsiksi), numero tarkkana, kunta postitoimipaikkana tai
   kuntanumerona (KUNNAT). Pelkkä kunnan nimi ei anna pistettä (Ryhtissä ei ole kuntakeskuksia): vastaus need: 'katu'. */
import { KUNNAT } from './kunnat.mjs';

export const RYHTI = 'https://paikkatiedot.ymparisto.fi/geoserver/ryhti_building/ogc/features/v1/collections/open_address/items';
export const INADS = 'https://inaadress.maaamet.ee/inaadress/gazetteer?results=6&address=';

const low = (s) => String(s || '').toLocaleLowerCase('fi');
const up = (s) => String(s || '').toLocaleUpperCase('fi');
const lit = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const title = (s) => low(s).replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + up(b));

/* kunnan nimi tai sen alku → kuntanumerot (tarkka nimi voittaa alun) */
export function kunnat(t) {
  t = low(t).trim();
  if (t.length < 2) return [];
  const ex = KUNNAT.filter((k) => k.slice(1).some((n) => low(n) === t));
  return (ex.length ? ex : KUNNAT.filter((k) => k.slice(1).some((n) => low(n).startsWith(t)))).map((k) => k[0]);
}
const isKunta = (t) => { t = low(t).trim(); return KUNNAT.some((k) => k.slice(1).some((n) => low(n) === t)); };

export function parseFi(q) {
  q = String(q || '').replace(/[\u0000-\u001f%_\\*"]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
  if (q.length < 3) return null;
  let street = q, town = '', num = null, letter = '', zip = '', guess = false;
  const c = q.indexOf(',');
  if (c >= 0) { street = q.slice(0, c).trim(); town = q.slice(c + 1).replace(/,/g, ' ').trim(); }
  /* katu, numero, jakokirjain (5b tai 1 A), väli (5-7) ja loppu kunnaksi */
  const m = street.match(/^(.*?[^\d\s])\s*(\d{1,4})(?:\s*([a-zåäö])(?![a-zåäö]))?(?:\s*[-–]\s*\d{1,4}[a-zåäö]?)?(?:\s+(.+))?$/i);
  if (m) { street = m[1].trim(); num = +m[2]; letter = m[3] ? low(m[3]) : ''; if (m[4]) town = (m[4] + ' ' + town).trim(); }
  const z = town.match(/\b(\d{5})\b/);
  if (z) { zip = z[1]; town = town.replace(z[0], ' ').replace(/\s+/g, ' ').trim(); }
  if (!m && !town) {   /* "Katu Kunta" ilman numeroa: viimeinen sana kunnaksi, jos se on kunnan nimi tai sen alku */
    const w = street.split(' '), last = w[w.length - 1];
    if (w.length > 1 && last.length >= 3 && kunnat(last).length) { town = w.pop(); street = w.join(' '); guess = true; }
  }
  if (street.length < 2) return null;
  return { street, num, letter, town, zip, guess };
}

export function fiUrl(p) {
  const st = lit(p.street + '%');
  const w = ['(address_name_fin ILIKE ' + st + ' OR address_name_swe ILIKE ' + st + ')'];
  if (p.num != null) w.push('number_part_of_address_number = ' + p.num);
  if (p.zip) w.push('postal_code = ' + lit(p.zip));
  if (p.town) {
    const T = lit(up(p.town) + '%'), k = kunnat(p.town);
    w.push('(postal_office_fin LIKE ' + T + ' OR postal_office_swe LIKE ' + T + (k.length ? ' OR municipality_number IN (' + k.map(lit).join(',') + ')' : '') + ')');
  }
  return RYHTI + '?f=application/json&limit=40&sortby=number_part_of_address_number&filter-lang=cql-text&filter=' + encodeURIComponent(w.join(' AND '));
}

/* Ryhtin vastaus → hakutulokset: sama osoite kerran (rakennuksia voi olla useita), tarkka kadunnimi, jakokirjain
   ja kunta ensin, muuten numerojärjestys. Nimi sillä kielellä, jolla lukija kirjoitti kadun. */
export function fiRows(d, p) {
  const seen = new Set(), out = [], s = low(p.street), T = p.town ? up(p.town) : '';
  ((d && d.features) || []).forEach((f) => {
    const a = f.properties || {}, g = f.geometry && f.geometry.coordinates;
    if (!g || !a.address_fin) return;
    const sv = !!a.address_swe && low(a.address_name_swe).startsWith(s) && !low(a.address_name_fin).startsWith(s);
    const po = sv ? (a.postal_office_swe || a.postal_office_fin) : a.postal_office_fin;
    const t = (sv ? a.address_swe : a.address_fin) + ', ' + (a.postal_code ? a.postal_code + ' ' : '') + title(po);
    if (seen.has(t)) return;
    seen.add(t);
    const lt = low(a.subdivision_letter_of_address_number);
    const score = (low(sv ? a.address_name_swe : a.address_name_fin) === s ? 0 : 4)
      + (p.num != null && lt !== p.letter ? 1 : 0)
      + (T && !(up(a.postal_office_fin).startsWith(T) || up(a.postal_office_swe).startsWith(T)) ? 2 : 0);
    out.push({ t, lon: +(+g[0]).toFixed(5), lat: +(+g[1]).toFixed(5), k: 'osoite', c: 'FI', r: score * 100 + out.length });
  });
  return out.sort((a, b) => a.r - b.r).slice(0, 6);
}

/* get(url) → JSON tai null. Palauttaa { rows, need } */
export async function searchFi(q, get) {
  const p = parseFi(q);
  if (!p) return { rows: [], need: '' };
  let rows = fiRows(await get(fiUrl(p)), p);
  if (!rows.length && p.guess) {   /* "Katu Kunta" -arvaus ei osunut: koko teksti kaduksi */
    const p2 = { street: p.street + ' ' + p.town, num: null, letter: '', town: '', zip: p.zip, guess: false };
    rows = fiRows(await get(fiUrl(p2)), p2);
  }
  return { rows, need: !rows.length && p.num == null && !p.town && isKunta(p.street) ? 'katu' : '' };
}

export async function searchEe(q, get) {
  const d = await get(INADS + encodeURIComponent(q));
  return ((d && d.addresses) || []).filter((a) => a.viitepunkt_l && a.viitepunkt_b).map((a, i) => ({
    t: a.ipikkaadress || a.pikkaadress, lon: +(+a.viitepunkt_l).toFixed(5), lat: +(+a.viitepunkt_b).toFixed(5), k: a.liikVal || '', c: 'EE', r: i
  }));
}

/* molemmat maat rinnakkain; lukijan oman maan tulokset ensin. Vastaus: { results, fi, need } */
export async function search(q, lang, get) {
  q = String(q || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 120);
  if (q.length < 3) return { results: [], fi: true, need: '' };
  const [e, f] = await Promise.allSettled([searchEe(q, get), searchFi(q, get)]);
  const out = (e.status === 'fulfilled' ? e.value : []).concat(f.status === 'fulfilled' ? f.value.rows : []);
  const home = lang === 'et' ? 'EE' : 'FI';
  out.sort((a, b) => (a.c === home ? 0 : 1) - (b.c === home ? 0 : 1) || a.r - b.r);
  const need = !out.length && f.status === 'fulfilled' ? f.value.need : '';
  if (e.status === 'rejected' && f.status === 'rejected') throw new Error('upstream');
  return { results: out.slice(0, 8).map(({ r, ...x }) => x), fi: true, need, src: { FI: 'ryhti', EE: 'inads' } };
}
