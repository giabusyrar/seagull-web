import { describe, it, expect } from 'vitest';
import { SERVICES, serviceRewrites } from '@/lib/services';

describe('serviceRewrites', () => {
  it('uses localhost defaults', () => {
    const r = serviceRewrites({});
    expect(r).toContainEqual({ source: '/svc/core/:path*', destination: 'http://localhost:8082/:path*' });
    expect(r).toHaveLength(Object.keys(SERVICES).length);
    expect(Object.keys(SERVICES)).toEqual(['core', 'ref', 'conv']);
  });
  it('honours env overrides and strips trailing slash', () => {
    const r = serviceRewrites({ SIM_REFERENCE_URL: 'http://vps:9000/' });
    expect(r).toContainEqual({ source: '/svc/ref/:path*', destination: 'http://vps:9000/:path*' });
  });
});
