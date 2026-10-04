import { describe, it, expect } from 'vitest';
import { SERVICES, serviceRewrites, sdkGatewayRewrites } from '@/lib/services';

describe('sdkGatewayRewrites', () => {
  it('routes core and reference like the gateway', () => {
    expect(sdkGatewayRewrites({})).toEqual([
      { source: '/svc/sdkgw/core/:path*', destination: 'http://localhost:8082/core/:path*' },
      { source: '/svc/sdkgw/reference/:path*', destination: 'http://localhost:8086/reference/:path*' },
    ]);
  });
  it('honours env overrides', () => {
    expect(sdkGatewayRewrites({ SIM_CORE_URL: 'http://vps:1/' })[0].destination).toBe('http://vps:1/core/:path*');
  });
});

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
