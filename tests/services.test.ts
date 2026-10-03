import { describe, it, expect } from 'vitest';
import { SERVICES, serviceRewrites } from '@/lib/services';

describe('serviceRewrites', () => {
  it('uses localhost defaults', () => {
    const r = serviceRewrites({});
    expect(r).toContainEqual({ source: '/svc/core/:path*', destination: 'http://localhost:8082/:path*' });
    expect(r).toHaveLength(Object.keys(SERVICES).length);
  });
  it('honours env overrides and strips trailing slash', () => {
    const r = serviceRewrites({ SIM_FACE_URL: 'http://vps:9000/' });
    expect(r).toContainEqual({ source: '/svc/face/:path*', destination: 'http://vps:9000/:path*' });
  });
});
