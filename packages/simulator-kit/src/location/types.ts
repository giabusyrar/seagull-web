// The location route's shape, shared by the server (location/server.ts) and
// the browser (lib/locations.ts).

export type LocationLevel = 'country' | 'province' | 'city';

/** One choice. `code` is what the next level is asked by; `name` is what is stored. */
export interface LocationOption { code: string; name: string; flag?: string }

/** Where a list comes from, shown under the pickers (the world list's license asks for attribution). */
export interface LocationSource { name: string; license: string; url: string }

export interface LocationsResponse { level: LocationLevel; data: LocationOption[]; source: LocationSource }
