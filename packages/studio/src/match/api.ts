import { resolveDynamicEndpoint } from '../core/collection-resolver';
import { withTenantScope } from '../core/scope';
import type { ClinicalMatchResult, ConflictMatrixRule, ProductCatalogItem, ProductGroup, Shade } from './types';
import type { ShadeAsset } from './components/tryon/ShadeAssetTypes';

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

export const conflictsApi = resource<ConflictMatrixRule>('/api/matching/conflicts', 'conflicts');
export const productGroupsApi = resource<ProductGroup>('/api/matching/product-groups', 'groups');

export const productsApi = {
  list: (doFetch: typeof fetch = fetch) =>
    list<ProductCatalogItem>(ep(withTenantScope('/api/matching/products')), 'products', doFetch),
  /** One brand's products ('' means every brand). */
  listForBrand: (brandId: string, doFetch: typeof fetch = fetch) =>
    list<ProductCatalogItem>(ep(`/api/matching/products?brand_id=${encodeURIComponent(brandId || '*')}`), 'products', doFetch),
};

export const shadesApi = {
  ...resource<Shade>('/api/matching/shades', 'shades'),
  /** Shades of one product; unscoped, as the engine keys them by product. */
  list: (productId: string, doFetch: typeof fetch = fetch) =>
    list<Shade>(ep(`/api/matching/shades?product_id=${encodeURIComponent(productId)}`), 'shades', doFetch),
};

/** POST /api/matching/match. Null when the engine answers with an error status. */
export async function runMatch(payload: Record<string, unknown>, doFetch: typeof fetch = fetch): Promise<ClinicalMatchResult | null> {
  const res = await sendJson(doFetch, ep('/api/matching/match'), 'POST', payload);
  return res.ok ? ((await res.json()) as ClinicalMatchResult) : null;
}

/** GET a shade's extracted try-on asset; undefined when the engine has none. */
export async function fetchShadeAsset(assetId: string, doFetch: typeof fetch = fetch): Promise<ShadeAsset | undefined> {
  const data = (await (await doFetch(ep(`/api/matching/shade-assets/${assetId}`))).json()) as { asset?: ShadeAsset };
  return data.asset;
}

/**
 * Ingredient options for conflict rules, from the host app's reference route.
 * The path belongs to the dashboard, not this package (audit item 4: host
 * paths should be injected); it is unchanged here, only moved.
 */
export async function listReferenceIngredients(doFetch: typeof fetch = fetch): Promise<Array<{ code: string; name: string }>> {
  const data = await (await doFetch('/api/reference/ingredients')).json();
  const raw = Array.isArray(data.ingredients) ? data.ingredients : Array.isArray(data) ? data : [];
  return raw.map((i: { code?: string; name: string }) => ({ code: i.code || i.name, name: i.name }));
}
