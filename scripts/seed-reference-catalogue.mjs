// Seed reference-service with the brands' own catalogue data
// (scripts/seed-data/brand-catalogue.json, read from the official sites).
//
// Dry run by default — it prints what it would create and changes nothing.
// Pass --apply to write.
//
//   node scripts/seed-reference-catalogue.mjs                       # dry run, local
//   node scripts/seed-reference-catalogue.mjs --apply               # write, local
//   REFERENCE_API=https://host/api/reference node ... --apply       # elsewhere
//
// It resolves brand, category and texture ids by their code against the live
// service rather than assuming an id format, creates only the textures that
// are missing, and skips a product whose name already exists for that brand,
// so running it twice does not duplicate anything.

import { readFileSync } from 'node:fs';
import path from 'node:path';

const API = (process.env.REFERENCE_API || 'http://127.0.0.1:3000/api/reference').replace(/\/+$/, '');
const APPLY = process.argv.includes('--apply');

const dataPath = path.resolve(import.meta.dirname, 'seed-data', 'brand-catalogue.json');
const { textures, products } = JSON.parse(readFileSync(dataPath, 'utf8'));

async function get(entity) {
  const res = await fetch(`${API}/${entity}`);
  if (!res.ok) throw new Error(`GET ${API}/${entity} -> HTTP ${res.status}`);
  const body = await res.json();
  const list = body?.data ?? body?.[entity] ?? [];
  if (!Array.isArray(list)) throw new Error(`GET ${API}/${entity} returned no list`);
  return list;
}

async function post(entity, payload) {
  const res = await fetch(`${API}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${API}/${entity} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

const byCode = (list) => new Map(list.map((x) => [String(x.code || '').toLowerCase(), x]));

const [brands, categories, existingTextures, existingProducts] = await Promise.all([
  get('brands'),
  get('categories'),
  get('textures'),
  get('products'),
]);

const brandByCode = byCode(brands);
const categoryByCode = byCode(categories);
const textureByCode = byCode(existingTextures);
const existingNames = new Set(existingProducts.map((p) => `${p.brandId}::${String(p.name).toLowerCase()}`));

console.log(`${API}`);
console.log(`brands ${brands.length} · categories ${categories.length} · textures ${existingTextures.length} · products ${existingProducts.length}`);
console.log(APPLY ? '\nAPPLYING\n' : '\nDRY RUN — nothing will be written (pass --apply)\n');

// 1. Textures the catalogue needs and the service does not have yet.
for (const t of textures) {
  if (textureByCode.has(t.code)) continue;
  console.log(`texture + ${t.code} (${t.name})`);
  if (APPLY) {
    const created = await post('textures', t);
    const row = created?.data ?? created;
    if (row?.id) textureByCode.set(t.code, row);
  }
}

// 2. Products, skipping any this brand already has under the same name.
let created = 0;
let skipped = 0;
const problems = [];

for (const p of products) {
  const brand = brandByCode.get(p.brand.toLowerCase());
  const category = categoryByCode.get(p.category);
  if (!brand) {
    problems.push(`${p.name}: no brand with code ${p.brand}`);
    continue;
  }
  if (!category) {
    problems.push(`${p.name}: no category with code ${p.category}`);
    continue;
  }
  if (existingNames.has(`${brand.id}::${p.name.toLowerCase()}`)) {
    skipped += 1;
    continue;
  }

  const texture = p.texture ? textureByCode.get(p.texture) : null;
  if (p.texture && !texture && !APPLY) {
    // In a dry run the texture does not exist yet; that is expected.
    console.log(`  (texture ${p.texture} would exist by now)`);
  }

  const payload = {
    brandId: brand.id,
    categoryId: category.id,
    name: p.name,
    // The brands' catalogues do not publish a product code; leaving it unset
    // is honest, and reference-service does not require one.
    ...(texture?.id ? { textureId: texture.id } : {}),
  };

  console.log(`product + ${p.brand} / ${p.category}${p.texture ? ` / ${p.texture}` : ''} — ${p.name}`);
  if (APPLY) {
    try {
      await post('products', payload);
      created += 1;
    } catch (err) {
      problems.push(`${p.name}: ${err.message}`);
    }
  } else {
    created += 1;
  }
}

console.log(`\n${APPLY ? 'created' : 'would create'} ${created} product(s), skipped ${skipped} already present`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
