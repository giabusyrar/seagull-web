import { afterEach, describe, expect, it, vi } from 'vitest';
import { listAssessments } from './api';

const stub = (body: unknown, status = 200) => {
  const f = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', f);
  return f;
};
afterEach(() => vi.unstubAllGlobals());

describe('listAssessments', () => {
  it('reads the scope history, or one customer when given', async () => {
    const f = stub({ assessments: [{ id: 'a' }] });
    expect(await listAssessments({ brandId: 'b', applicationId: 'app' })).toEqual([{ id: 'a' }]);
    await listAssessments({ brandId: 'b', applicationId: 'app', customerId: ' c/1 ' });
    expect(f.mock.calls.map((c) => c[0])).toEqual([
      '/core/assessments/history?brand_id=b&application_id=app&limit=100',
      '/core/assessments/customers/c%2F1?brand_id=b&application_id=app&limit=100',
    ]);
    expect(f.mock.calls[0][1]).toEqual({ cache: 'no-store' });
  });

  it('throws the API error, or the status', async () => {
    stub({ error: 'scope required' }, 400);
    await expect(listAssessments({ brandId: '', applicationId: '' })).rejects.toThrow('scope required');
    stub(null, 503);
    await expect(listAssessments({ brandId: 'b', applicationId: 'a' })).rejects.toThrow('Could not read assessments (HTTP 503).');
  });
});
