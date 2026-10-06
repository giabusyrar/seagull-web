import { describe, expect, it } from 'vitest';
import { uvByCapability } from '@/lib/types/uv';
import { uvAnalyze } from '@/lib/photo';

const R = {
  measurements: {
    ZONE_FOREHEAD: { 'uv.Spots': { darknessArea: 0.0123 }, 'uv.Porphyrin': { count: 4, areaFraction: 0.002, meanRelativeIntensity: 1.3 } },
    ZONE_CHIN_JAWLINE: { 'uv.Porphyrin': { count: 0, areaFraction: 0 } },
  },
  capabilityInfo: {
    'uv.Spots': { status: 'uncalibrated', levels: [], unit: 'darknessArea: …' },
    'uv.Porphyrin': { status: 'ranked', levels: ['populationRank'], unit: 'count: …' },
    'uv.Sebum': { status: 'uncalibrated', levels: [], unit: 'count: …', proxy: 'glare looks the same' },
  },
  telemetry: { ZONE_FOREHEAD: { 'uv.Porphyrin': { count: 81.5 } } },
  skippedZones: [{ zone: 'ZONE_T_ZONE_NOSE', capability: 'uv.Sebum', reason: 'BASELINE_TOO_BRIGHT' }],
};

describe('uvByCapability', () => {
  it('regroups zone-first measurements capability first, in capabilityInfo order', () => {
    const v = uvByCapability(R);
    expect(v.map((c) => c.capability)).toEqual(['uv.Spots', 'uv.Porphyrin', 'uv.Sebum']);
    const p = v[1];
    expect(p.info.status).toBe('ranked');
    expect(p.metrics).toEqual(['count', 'areaFraction', 'meanRelativeIntensity']);
    expect(p.zones).toEqual([
      { zone: 'ZONE_FOREHEAD', values: { count: 4, areaFraction: 0.002, meanRelativeIntensity: 1.3 }, rank: { count: 81.5 } },
      { zone: 'ZONE_CHIN_JAWLINE', values: { count: 0, areaFraction: 0 }, rank: {} },
    ]);
  });

  it('keeps a skipped zone as skipped, never as a measured 0', () => {
    const s = uvByCapability(R)[2];
    expect(s.zones).toEqual([]);
    expect(s.skipped).toEqual([{ zone: 'ZONE_T_ZONE_NOSE', reason: 'BASELINE_TOO_BRIGHT' }]);
    expect(s.info.proxy).toMatch(/glare/);
  });

  it('is empty for an empty or odd response', () => {
    expect(uvByCapability(undefined)).toEqual([]);
    expect(uvByCapability({ measurements: { Z: 'x' as never } })).toEqual([]);
  });
});

describe('uvAnalyze', () => {
  it('posts the photo with an overlay request and never contributes', () => {
    const photo = new File(['x'], 'uv.jpg', { type: 'image/jpeg' });
    const { url, init } = uvAnalyze(photo);
    expect(url).toBe('/svc/core/core/vision-engine/uv/analyze');
    const fd = init.body as FormData;
    expect(fd.get('image')).toBeInstanceOf(File);
    expect(fd.get('include_overlay')).toBe('true');
    expect(fd.has('contribute')).toBe(false);
  });
});
