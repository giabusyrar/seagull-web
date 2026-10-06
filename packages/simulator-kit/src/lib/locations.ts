// The browser's side of the location lists: asks the host's route
// (configureSimulator: locationsPath), which runs location/server.ts.
import { simulatorConfig } from './services';
import type { LocationsResponse } from '../location/types';

export type { LocationOption, LocationSource, LocationsResponse } from '../location/types';

export function locationsUrl(country?: string, province?: string): string {
  const q = new URLSearchParams();
  if (country) q.set('country', country);
  if (country && province) q.set('province', province);
  const s = q.toString();
  return `${simulatorConfig().locationsPath}${s ? `?${s}` : ''}`;
}

export async function fetchLocations(country?: string, province?: string, signal?: AbortSignal): Promise<LocationsResponse> {
  const r = await fetch(locationsUrl(country, province), { signal });
  if (!r.ok) throw new Error(`locations ${r.status}`);
  return (await r.json()) as LocationsResponse;
}
