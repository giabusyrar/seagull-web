// Looks: a brand's authored makeup looks, resolved to shades for one customer's
// skin and rendered on their photo (seagull-core colour-engine
// /core/colour-engine/looks…, service/look.go). List is a GET; resolve and
// try-on are dry-run routes that store nothing.
import { svcPath } from './services';
import type { Brand, BuiltRequest } from './photo';

const LOOKS = '/core/colour-engine/looks';

/** One look as listed: its makeup slots ("roles", e.g. lip, eyeshadow.crease) and colourway codes. */
export interface LookSummary { id?: string; code: string; version?: number; name?: string; story?: string; roles?: string[]; colourways?: string[] }

/** Why a shade was chosen: matched to the skin or in harmony with it, and how far it sits from the skin (CIEDE2000). */
export interface LookWhy { rule?: 'skin_match' | 'harmony' | string; rating?: string; temperature?: string; skinDeltaE00?: number; skinBand?: string }

/** How a face-shape rule moved a role's placement, or why it did not (`neutral`). */
export interface LookPlacement { faceShape?: string; ruleId?: string; placeholder?: boolean; textKeys?: string[]; adjust?: Record<string, number>; neutral?: string }

export interface ResolvedRole {
  shadeId?: string;
  productId?: string;
  product?: string;
  shade?: string;
  hexColor?: string;
  lab?: [number, number, number];
  colourSource?: string;
  why?: LookWhy;
  technique?: { style?: string; amount?: number; finish?: string };
  /** Why the role got no shade; core never stands one in. */
  unresolved?: string;
  placement?: LookPlacement;
}

export interface ResolvedLook {
  look?: { id?: string; code?: string; version?: number; colourway?: string };
  roles?: Record<string, ResolvedRole>;
  elements?: { element?: string; zone?: string; density?: number }[];
  skin?: { lab?: [number, number, number]; v?: number; c?: number; quadrant?: string };
  /** role (or element) → why it would not be drawn. */
  notRendered?: Record<string, string>;
  faceShape?: { class?: string; status?: string; calibration?: string };
}

const scope = (b: Brand) => `brand_id=${encodeURIComponent(b.brandId)}&application_id=${encodeURIComponent(b.applicationId)}`;

export function listLooks(brand: Brand): BuiltRequest {
  return { url: svcPath('core', `${LOOKS}?${scope(brand)}`), init: { method: 'GET', cache: 'no-store' } };
}

/** The form resolve and try-on share: the brand, the colourway, and the photo the skin and face shape are read from. */
function lookForm(brand: Brand, photo: File, opts: { colourway?: string; hijab: boolean; hairVisible: boolean }): FormData {
  const fd = new FormData();
  fd.append('brand_id', brand.brandId);
  fd.append('application_id', brand.applicationId);
  if (opts.colourway) fd.append('colourway', opts.colourway);
  fd.append('image', photo);
  fd.append('hijab', opts.hijab ? 'true' : 'false');
  fd.append('hairVisible', opts.hairVisible ? 'true' : 'false');
  return fd;
}

export function resolveLook(brand: Brand, code: string, photo: File, opts: { colourway?: string; hijab: boolean; hairVisible: boolean }): BuiltRequest {
  return { url: svcPath('core', `${LOOKS}/${encodeURIComponent(code)}/resolve`), init: { method: 'POST', body: lookForm(brand, photo, opts) } };
}

export function tryOnLook(brand: Brand, code: string, photo: File, opts: { colourway?: string; hijab: boolean; hairVisible: boolean }): BuiltRequest {
  return { url: svcPath('core', `${LOOKS}/${encodeURIComponent(code)}/tryon`), init: { method: 'POST', body: lookForm(brand, photo, opts) } };
}

/** The try-on's X-Not-Rendered header (role → reason), when the browser could read it. */
export function notRenderedHeader(headers: [string, string][]): Record<string, string> | null {
  const h = headers.find(([k]) => k.toLowerCase() === 'x-not-rendered')?.[1];
  if (!h) return null;
  try {
    const v = JSON.parse(h);
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : null;
  } catch {
    return null;
  }
}
