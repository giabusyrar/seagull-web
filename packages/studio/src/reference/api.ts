import type { HostRoutes } from '@gateway-experience/shared';

/**
 * Reference-data calls made by the reference studio, against each entity's
 * endpoint: the host app's reference route for its `resource`.
 */

/**
 * The item list in a reference response. reference-service wraps every
 * collection as `{ data: [...], success: true }`; older routes used a key
 * named after the entity or its kind. Anything else is an empty list.
 */
export function entityListFrom(data: Record<string, unknown>, config: { dataKey?: string; slug?: string }): unknown[] {
  const rawList =
    data.data ||
    (config.dataKey ? data[config.dataKey] : null) ||
    (config.slug ? data[config.slug] : null) ||
    data.items ||
    data.brands ||
    data.products ||
    data.ingredients ||
    data.eventTypes ||
    data.reference ||
    [];
  return Array.isArray(rawList) ? rawList : [];
}

/** Throws when the route answers with an error status. */
export async function listEntityItems(apiEndpoint: string, config: { dataKey?: string; slug?: string }): Promise<unknown[]> {
  const res = await fetch(apiEndpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reference items');
  return entityListFrom(await res.json(), config);
}

/** POST a new item or PUT an edited one. Throws the route's error message. */
export async function saveEntityItem(apiEndpoint: string, payload: unknown, isEdit: boolean): Promise<void> {
  const res = await fetch(apiEndpoint, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to ${isEdit ? 'update' : 'create'} item`);
  }
}

/**
 * DELETE by `?id=`, falling back to `/{id}` for routes that key the item in
 * the path. Throws when both fail.
 */
export async function deleteEntityItem(apiEndpoint: string, id: string): Promise<void> {
  const url = apiEndpoint.includes('?') ? `${apiEndpoint}&id=${id}` : `${apiEndpoint}?id=${id}`;
  let res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    res = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
  }
  if (!res.ok) throw new Error('Failed to delete item');
}

/**
 * Options for a relation field, from the host's reference route for the
 * entity. Null unless the route reports success with a list.
 */
export async function listRelationOptions(routes: Pick<HostRoutes, 'reference'>, entity: string): Promise<unknown[] | null> {
  const data = await (await fetch(routes.reference(entity))).json();
  const list =
    data.data || data[entity] || data.dimensions || data.items || data.brands || data.products || data.ingredients || [];
  return data.success && Array.isArray(list) ? list : null;
}
