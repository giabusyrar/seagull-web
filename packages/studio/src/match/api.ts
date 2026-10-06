import type { HostRoutes } from '@gateway-experience/shared';
import { resolveDynamicEndpoint } from '../core/collection-resolver';
import { withTenantScope } from '../core/scope';
import type {
  ClinicalMatchResult,
  ColourCatalog,
  ConflictMatrixRule,
  ProductCatalogItem,
  ProductGroup,
  ProductMatchItem,
  RegimenStep,
  Shade,
  UnfilledSlot,
} from './types';

/**
 * Match-engine calls made by the match studio. Each resolves through the
 * dashboard's collection routing. List calls send the explicit all-tenant
 * scope so the gateway's collection params can never pick the tenant; they
 * resolve to null when the response has no list. Network and HTTP errors are
 * left to the caller.
 */

const ep = (path: string) => resolveDynamicEndpoint('match', path);

async function list<T>(path: string, field: string, doFetch: typeof fetch): Promise<T[] | null> {
  const data = await (await doFetch(path)).json();
  return Array.isArray(data[field]) ? (data[field] as T[]) : null;
}

const sendJson = (doFetch: typeof fetch, url: string, method: 'POST' | 'PUT', body: unknown) =>
  doFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** A collection the studio lists, creates (POST), updates (PUT) and deletes by `?id=`. */
function resource<T>(path: string, field: string) {
  return {
    list: (doFetch: typeof fetch = fetch) => list<T>(ep(withTenantScope(path)), field, doFetch),
    create: (item: T, doFetch: typeof fetch = fetch) => sendJson(doFetch, ep(path), 'POST', item),
    update: (item: T, doFetch: typeof fetch = fetch) => sendJson(doFetch, ep(path), 'PUT', item),
    remove: (id: string, doFetch: typeof fetch = fetch) => doFetch(ep(`${path}?id=${id}`), { method: 'DELETE' }),
  };
}

export const productGroupsApi = resource<ProductGroup>('/product-groups', 'groups');

export const productsApi = {
  list: (doFetch: typeof fetch = fetch) =>
    list<ProductCatalogItem>(ep(withTenantScope('/products')), 'products', doFetch),
  /** One brand's products ('' means every brand). */
  listForBrand: (brandId: string, doFetch: typeof fetch = fetch) =>
    list<ProductCatalogItem>(ep(`/products?brand_id=${encodeURIComponent(brandId || '*')}`), 'products', doFetch),
};

/** A reference-service save or delete that was refused, with its error text. */
export class ReferenceApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ReferenceApiError';
  }
}

async function ensureOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  const text = await res.text();
  let message = text || `HTTP ${res.status}`;
  try {
    const j = JSON.parse(text) as { error?: unknown; message?: unknown };
    message = String(j.error || j.message || message);
  } catch {}
  throw new ReferenceApiError(res.status, message);
}

/**
 * A reference-service collection (owned there since 2026-10-06): listed from
 * `{ data: [...] }`, saved by POST (new) or PUT (edit) of the item, deleted by
 * id in the path. Saves and deletes throw ReferenceApiError when refused (for
 * example a 400 for a hex that is not #RRGGBB).
 */
function referenceResource<T extends { id: string }>(resource: string) {
  return {
    list: async (routes: Pick<HostRoutes, 'reference'>, query = '', doFetch: typeof fetch = fetch): Promise<T[] | null> => {
      const data = await (await doFetch(routes.reference(resource) + query)).json();
      return Array.isArray(data.data) ? (data.data as T[]) : null;
    },
    create: async (routes: Pick<HostRoutes, 'reference'>, item: T, doFetch: typeof fetch = fetch) =>
      ensureOk(await sendJson(doFetch, routes.reference(resource), 'POST', item)),
    update: async (routes: Pick<HostRoutes, 'reference'>, item: T, doFetch: typeof fetch = fetch) =>
      ensureOk(await sendJson(doFetch, routes.reference(resource), 'PUT', item)),
    remove: async (routes: Pick<HostRoutes, 'reference'>, id: string, doFetch: typeof fetch = fetch) =>
      ensureOk(await doFetch(routes.reference(`${resource}/${encodeURIComponent(id)}`), { method: 'DELETE' })),
  };
}

const conflictRules = referenceResource<ConflictMatrixRule>('ingredient-conflict-rules');
const productShades = referenceResource<Shade>('shades');

/** Ingredient conflict rules (reference-service). Lists every brand and application; the tabs narrow it. */
export const conflictsApi = {
  ...conflictRules,
  list: (routes: Pick<HostRoutes, 'reference'>, doFetch: typeof fetch = fetch) => conflictRules.list(routes, '', doFetch),
};

/** Product shades (reference-service). Deleting a shade also deletes its colorimetry. */
export const shadesApi = {
  ...productShades,
  /** Shades of one product. */
  list: (routes: Pick<HostRoutes, 'reference'>, productId: string, doFetch: typeof fetch = fetch) =>
    productShades.list(routes, `?productId=${encodeURIComponent(productId)}`, doFetch),
};

/** A match evaluate the engine refused (or failed), with its error text. */
export class MatchApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MatchApiError';
  }
}

/**
 * POST match-engine /evaluate, mapped to ClinicalMatchResult. Throws
 * MatchApiError with the engine's message when it answers with an error
 * status (e.g. 400 "dimension_scores is required").
 */
export async function runMatch(payload: Record<string, unknown>, doFetch: typeof fetch = fetch): Promise<ClinicalMatchResult> {
  const res = await sendJson(doFetch, ep('/evaluate'), 'POST', payload);
  if (!res.ok) {
    const text = await res.text();
    let message = text || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text) as { error?: unknown; message?: unknown };
      message = String(j.error || j.message || message);
    } catch {}
    throw new MatchApiError(res.status, message);
  }
  return toClinicalMatchResult(await res.json());
}

// The engine answers in snake_case; the studio reads camelCase. These copy a
// field only when the engine sent it with the right type: a missing field stays
// absent, never a stand-in value.
type Json = Record<string, unknown>;
const obj = (v: unknown): Json | undefined => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : undefined);
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const bool = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined);
const strs = (v: unknown): string[] | undefined => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined);
/** Drops the keys whose value is undefined, so an absent field is not even a key. */
const defined = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

function toProduct(v: unknown): ProductMatchItem | undefined {
  const p = obj(v);
  if (!p) return undefined;
  return defined({
    id: str(p.id),
    name: str(p.name),
    brand: str(p.brand),
    category: str(p.category),
    texture: str(p.texture),
    matchScore: num(p.match_score),
    whySelected: strs(p.why_selected),
    keyActives: strs(p.key_actives),
    imageUrl: str(p.image_url),
  }) as ProductMatchItem;
}

function toSteps(v: unknown): RegimenStep[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((raw) => {
    const s = obj(raw) ?? {};
    return defined({
      stepNumber: num(s.step_number),
      stepName: str(s.step_name),
      category: str(s.category),
      recommendedTexture: str(s.recommended_texture),
      primaryProduct: toProduct(s.primary_product),
      alternatives: Array.isArray(s.alternatives)
        ? s.alternatives.map(toProduct).filter((x): x is ProductMatchItem => !!x)
        : undefined,
    }) as RegimenStep;
  });
}

function toUnfilled(v: unknown): UnfilledSlot[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((raw) => {
    const u = obj(raw) ?? {};
    return defined({ slotId: str(u.slot_id), category: str(u.category), required: bool(u.required), reason: str(u.reason) });
  });
}

/** Maps each entry of an object with `each`, dropping the entries it cannot map. */
function mapEntries<T>(v: unknown, each: (x: unknown) => T | undefined): Record<string, T> | undefined {
  const m = obj(v);
  if (!m) return undefined;
  const out: Record<string, T> = {};
  for (const [k, x] of Object.entries(m)) {
    const mapped = each(x);
    if (mapped !== undefined) out[k] = mapped;
  }
  return out;
}

/** Maps core-engine's MatchResponse (snake_case) to ClinicalMatchResult. */
export function toClinicalMatchResult(body: unknown): ClinicalMatchResult {
  const r = obj(body) ?? {};
  const ps = obj(r.profile_summary) ?? {};
  const rg = obj(r.regimens) ?? {};
  const cm = obj(r.clinical_conflict_matrix) ?? {};
  return defined({
    matchId: str(r.match_id),
    brandId: str(r.brand_id),
    applicationId: str(r.application_id),
    dryRun: bool(r.dry_run),
    profileSummary: defined({
      // The engine sends "" with skin_type_unavailable when it has no skin type.
      skinType: str(ps.skin_type) || undefined,
      profileCode: str(ps.profile_code),
      skinTypeSource: str(ps.skin_type_source),
      skinTypeUnavailable: str(ps.skin_type_unavailable),
      primaryConcerns: strs(ps.primary_concerns),
    }),
    regimens: defined({
      amRoutine: toSteps(rg.am_routine),
      pmRoutine: toSteps(rg.pm_routine),
      phases: mapEntries(rg.phases, toSteps),
      unfilledSlots: mapEntries(rg.unfilled_slots, toUnfilled),
    }),
    clinicalConflictMatrix: defined({
      conflictsDetected: num(cm.conflicts_detected),
      layeringRulesApplied: strs(cm.layering_rules_applied),
      warnings: strs(cm.warnings),
    }),
    evaluatedAt: str(r.evaluated_at),
  }) as ClinicalMatchResult;
}

const colourEp = (path: string) => resolveDynamicEndpoint('colour', path);

/** A failed colour-engine call: the HTTP status and the engine's own error text. */
export class ColourApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ColourApiError';
  }
}

/** Reads the engine's JSON error body ({ error, code }); a non-JSON body is kept as text. */
async function colourError(res: Response): Promise<ColourApiError> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { error?: unknown; message?: unknown; code?: unknown };
    return new ColourApiError(res.status, String(j.code ?? ''), String(j.error || j.message || `HTTP ${res.status}`));
  } catch {
    return new ColourApiError(res.status, '', text || `HTTP ${res.status}`);
  }
}

/** GET colour-engine /catalog: every shade available to try, by category. Throws ColourApiError. */
export async function fetchColourCatalog(doFetch: typeof fetch = fetch): Promise<ColourCatalog> {
  const res = await doFetch(colourEp('/catalog'));
  if (!res.ok) throw await colourError(res);
  const data = (await res.json()) as { catalog?: ColourCatalog };
  return data.catalog ?? {};
}

/**
 * POST colour-engine /tryon: the photo with the chosen shades rendered on it
 * (a PNG). Shades are sent by id only, at most one per category; the engine
 * resolves their colours from its catalog. Throws ColourApiError.
 */
export async function colourTryOn(image: Blob, shadeIds: string[], doFetch: typeof fetch = fetch): Promise<Blob> {
  const fd = new FormData();
  fd.append('image', image);
  shadeIds.filter(Boolean).forEach((id) => fd.append('shadeIds', id));
  const res = await doFetch(colourEp('/tryon'), { method: 'POST', body: fd });
  if (!res.ok) throw await colourError(res);
  return res.blob();
}

/** Ingredient options for conflict rules, from the host app's reference route. */
export async function listReferenceIngredients(
  routes: Pick<HostRoutes, 'reference'>,
  doFetch: typeof fetch = fetch,
): Promise<Array<{ code: string; name: string }>> {
  const data = await (await doFetch(routes.reference('ingredients'))).json();
  // reference-service answers { data: [...] }; older routes used `ingredients` or a bare list.
  const raw = Array.isArray(data.data) ? data.data : Array.isArray(data.ingredients) ? data.ingredients : Array.isArray(data) ? data : [];
  return raw.map((i: { code?: string; name: string }) => ({ code: i.code || i.name, name: i.name }));
}
