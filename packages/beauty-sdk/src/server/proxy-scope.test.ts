import { describe, expect, it, vi } from 'vitest';

// forms.evaluate and assessments.history are out of OPERATIONS until phase 5,
// but the proxy's JSON-scope and customer paths stay live code. Exercise them
// with operations the table does not hold.
vi.mock('../client/operations', async (orig) => {
  const actual = await orig<typeof import('../client/operations')>();
  const json = { id: 'forms.evaluate', method: 'POST', sdkPath: '/t/json', gatewayPath: '/t/json', scope: 'json', customer: false, query: [] } as const;
  const cust = { id: 'assessments.history', method: 'GET', sdkPath: '/t/cust', gatewayPath: '/t/cust/{customerId}', scope: 'none', customer: true, query: [] } as const;
  return {
    ...actual,
    matchOperation: (method: string, path: string) =>
      path === '/t/json' && method === 'POST' ? { op: json, params: {} } : path === '/t/cust' && method === 'GET' ? { op: cust, params: {} } : actual.matchOperation(method, path),
  };
});

const { createBeautyProxy } = await import('./proxy');
const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const base = {
  gatewayUrl: 'https://gw.test',
  apiKey: 'secret',
  brandId: 'brd',
  applicationId: 'app',
  // the synthetic ops have no table entry, so give them timeouts (cast: not OperationIds)
  timeouts: { 'forms.evaluate': 1000, 'assessments.history': 1000 } as Record<string, number>,
};

describe('createBeautyProxy scope paths', () => {
  it('overwrites brand/application in JSON bodies, including case variants', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    const { POST } = createBeautyProxy({ ...base, fetch });
    await POST(
      new Request('https://brand.test/api/beauty/t/json', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers: { a: 1 }, brand_id: 'spoofed', BRAND_ID: 'spoofed' }),
      }),
      ctx('t', 'json'),
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ answers: { a: 1 }, brand_id: 'brd', application_id: 'app' });
  });

  it('answers 400 invalid_body for unparseable JSON, without calling the gateway', async () => {
    const fetch = vi.fn();
    const { POST } = createBeautyProxy({ ...base, fetch });
    const res = await POST(
      new Request('https://brand.test/api/beauty/t/json', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{not json' }),
      ctx('t', 'json'),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ detail: { code: 'invalid_body' } });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses customer routes without authorize', async () => {
    const fetch = vi.fn();
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/t/cust'), ctx('t', 'cust'));
    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the customer from authorize', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('[]'));
    const { GET } = createBeautyProxy({ ...base, fetch, authorize: () => ({ customerId: 'cus-1' }) });
    await GET(new Request('https://brand.test/api/beauty/t/cust'), ctx('t', 'cust'));
    expect(fetch.mock.calls[0][0]).toBe('https://gw.test/t/cust/cus-1');
  });
});
