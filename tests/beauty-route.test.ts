import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/beauty/[...path]/route';

const ctx = (path: string[]) => ({ params: Promise.resolve({ path }) });

describe('beauty proxy route', () => {
  it('refuses without brand and application headers', async () => {
    const r = await GET(new Request('http://localhost:3100/api/beauty/colour/catalog'), ctx(['colour', 'catalog']));
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ detail: { code: 'pick_brand_and_application' } });
  });
  it('unknown SDK path is the proxy 404', async () => {
    const r = await GET(new Request('http://localhost:3100/api/beauty/nope', { headers: { 'x-sim-brand': 'wardah', 'x-sim-app': 'skinverse' } }), ctx(['nope']));
    expect(r.status).toBe(404);
  });
});
