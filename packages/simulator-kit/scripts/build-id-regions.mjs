// Builds src/location/data/id-regions.json: Indonesia's provinces and
// kabupaten/kota with their official Kemendagri codes, from cahyadsn/wilayah
// (MIT). Pinned to one commit so a rebuild is reproducible; to update, change
// COMMIT to a newer one of db/wilayah_level_1_2.sql and run:
//   node packages/simulator-kit/scripts/build-id-regions.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'cahyadsn/wilayah';
const COMMIT = 'cb05064af1ccc6c6ae5ee33e498ad69a62034a0a'; // 2026-05-11
const FILE = 'db/wilayah_level_1_2.sql';

const sql = await (await fetch(`https://raw.githubusercontent.com/${REPO}/${COMMIT}/${FILE}`)).text();
const decree = sql.match(/sesuai (Kepmendagri No [^\n]+)/)?.[1]?.trim();
if (!decree) throw new Error('decree line not found: is this still the wilayah_level_1_2.sql layout?');

// Rows start ('kode','nama', …): kode is 2 digits for a province, 2.2 for a kabupaten/kota
// (01-69 kabupaten, 71-99 kota, Permendagri 72/2019).
const rows = [...sql.matchAll(/\('(\d{2}(?:\.\d{2})?)','([^']*)'/g)].map((m) => [m[1], m[2].trim()]);
const provinces = rows.filter(([k]) => k.length === 2).map(([code, name]) => ({
  code,
  name,
  cities: rows.filter(([k]) => k.length === 5 && k.startsWith(`${code}.`)).map(([c, n]) => ({ code: c, name: n })),
}));
const cities = provinces.reduce((n, p) => n + p.cities.length, 0);
if (provinces.length < 34 || cities < 500) throw new Error(`unexpected counts: ${provinces.length} provinces, ${cities} cities`);

const out = {
  source: { repo: REPO, commit: COMMIT, file: FILE, license: 'MIT', decree },
  provinces,
};
const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'location', 'data', 'id-regions.json');
writeFileSync(target, JSON.stringify(out) + '\n');
console.log(`${provinces.length} provinces, ${cities} kabupaten/kota (${decree}) → ${target}`);
