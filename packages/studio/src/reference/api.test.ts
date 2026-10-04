import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteEntityItem, entityListFrom, listRelationOptions, saveEntityItem } from './api';

const routes = { reference: (r: string) => `/api/reference/${r}` };

const stub = (...responses: Array<[unknown, number?]>) => {
  const f = vi.fn<typeof fetch>();
  for (const [body, status] of responses) f.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: status ?? 200 }));
  vi.stubGlobal('fetch', f);
  return f;
};
afterEach(() => vi.unstubAllGlobals());

describe('entityListFrom', () => {
  it('prefers data, then the configured key, then the slug, then known keys', () => {
    expect(entityListFrom({ data: [1], brands: [2] }, {})).toEqual([1]);
    expect(entityListFrom({ rows: [3] }, { dataKey: 'rows' })).toEqual([3]);
    expect(entityListFrom({ shades: [4] }, { slug: 'shades' })).toEqual([4]);
    expect(entityListFrom({ eventTypes: [5] }, {})).toEqual([5]);
  });

  it('is empty for anything that is not a list', () => {
    expect(entityListFrom({ data: { not: 'a list' } }, {})).toEqual([]);
    expect(entityListFrom({}, {})).toEqual([]);
  });
});

describe('reference entity writes', () => {
  it('saves with POST or PUT and surfaces the route error', async () => {
    const f = stub([{}], [{ error: 'duplicate code' }, 409]);
    await saveEntityItem('/api/reference/brands', { a: 1 }, false);
    expect(f.mock.calls[0][1]?.method).toBe('POST');
    await expect(saveEntityItem('/api/reference/brands', { a: 1 }, true)).rejects.toThrow('duplicate code');
    expect(f.mock.calls[1][1]?.method).toBe('PUT');
  });

  it('deletes by query id, falling back to a path id', async () => {
    const f = stub([{}, 404], [{}]);
    await deleteEntityItem('/api/reference/x?kind=y', 'i1');
    expect(f.mock.calls.map((c) => c[0])).toEqual(['/api/reference/x?kind=y&id=i1', '/api/reference/x?kind=y/i1']);
  });

  it('throws when both deletes fail', async () => {
    stub([{}, 404], [{}, 404]);
    await expect(deleteEntityItem('/api/reference/x', 'i1')).rejects.toThrow('Failed to delete item');
  });
});

describe('listRelationOptions', () => {
  it('returns the list only on success', async () => {
    stub([{ success: true, data: [{ id: 'b' }] }], [{ success: false, data: [] }]);
    expect(await listRelationOptions(routes, 'brands')).toEqual([{ id: 'b' }]);
    expect(await listRelationOptions(routes, 'brands')).toBeNull();
  });
});
