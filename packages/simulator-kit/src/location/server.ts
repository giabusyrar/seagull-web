// Country → province → city lists for the customer's location. Server only:
// the world list is a large package that loads its data from disk, so hosts
// expose it as a route (`export { GET } from
// '@gateway-experience/simulator-kit/locations-server'`) and the browser asks
// that route (lib/locations.ts).
//
// Sources, both free and open:
// - Indonesia: the Kemendagri decree's provinces and kabupaten/kota with their
//   official codes, via cahyadsn/wilayah (MIT), built into data/id-regions.json
//   by scripts/build-id-regions.mjs.
// - Everywhere else, and the country list: the Countries States Cities
//   Database (ODbL 1.0, attribution required) via @countrystatecity/countries.
import { getCitiesOfState, getCountries, getStatesOfCountry } from '@countrystatecity/countries';
import idRegions from './data/id-regions.json';
import type { LocationOption, LocationsResponse } from './types';

/** The country whose provinces and cities come from its government's own list. */
const OFFICIAL_COUNTRY = 'ID';

/** The world list's "states" include island groups for some countries (ID: Jawa, Sumatera…); they are not provinces. */
const NOT_A_PROVINCE = 'geographical unit';

const WORLD_SOURCE = {
  name: 'Countries States Cities Database',
  license: 'ODbL 1.0',
  url: 'https://github.com/dr5hn/countries-states-cities-database',
};
const ID_SOURCE = {
  name: `${idRegions.source.decree} (via ${idRegions.source.repo})`,
  license: idRegions.source.license,
  url: `https://github.com/${idRegions.source.repo}`,
};

const byName = (a: LocationOption, b: LocationOption) => a.name.localeCompare(b.name);

export async function locations(country?: string | null, province?: string | null): Promise<LocationsResponse> {
  const c = country?.trim().toUpperCase();
  const p = province?.trim();
  if (!c) {
    const data = (await getCountries()).map((x) => ({ code: x.iso2, name: x.name, flag: x.emoji })).sort(byName);
    return { level: 'country', data, source: WORLD_SOURCE };
  }
  if (c === OFFICIAL_COUNTRY) {
    if (!p) return { level: 'province', data: idRegions.provinces.map(({ code, name }) => ({ code, name })).sort(byName), source: ID_SOURCE };
    // Kabupaten then kota, in the decree's code order.
    const cities = idRegions.provinces.find((x) => x.code === p)?.cities ?? [];
    return { level: 'city', data: cities, source: ID_SOURCE };
  }
  if (!p) {
    const states = (await getStatesOfCountry(c)).filter((s) => s.type !== NOT_A_PROVINCE);
    return { level: 'province', data: states.map((s) => ({ code: s.iso2, name: s.name })).sort(byName), source: WORLD_SOURCE };
  }
  const cities = await getCitiesOfState(c, p);
  return { level: 'city', data: cities.map((x) => ({ code: String(x.id), name: x.name })).sort(byName), source: WORLD_SOURCE };
}

/** GET ?country=&province=: countries, a country's provinces, or a province's cities. */
export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams;
  try {
    return Response.json(await locations(q.get('country'), q.get('province')), {
      // The lists change with a new package or data build, not per request.
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
