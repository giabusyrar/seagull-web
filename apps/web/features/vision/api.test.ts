import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyzeImages, describeAnalysisError, listReferenceBrands, listVisionConfigs } from './api';

const endpoint = (key: string, route: string) => `/core/${key}-engine${route}`;
const stub = (body: string, status = 200, type = 'application/json') => {
  const f = vi.fn<typeof fetch>(async () => new Response(body, { status, headers: { 'content-type': type } }));
  vi.stubGlobal('fetch', f);
  return f;
};
afterEach(() => vi.unstubAllGlobals());

describe('describeAnalysisError', () => {
  it('lists invalid parameters for a 400', () => {
    expect(describeAnalysisError(400, { invalidParameters: [{ field: 'brandId', value: 'x', reason: 'unknown' }] })).toBe(
      'brandId "x": unknown',
    );
    expect(describeAnalysisError(400, {})).toBe('Invalid analysis request');
  });

  it('names the unavailable service for 503 and 502', () => {
    expect(describeAnalysisError(503, {})).toMatch(/reference-service/);
    expect(describeAnalysisError(502, {})).toMatch(/vision-ai-worker/);
    expect(describeAnalysisError(500, { message: 'boom' })).toBe('boom');
  });
});

describe('vision api', () => {
  it('posts captures to analyze-image and throws a readable error', async () => {
    const f = stub(JSON.stringify({ message: 'nope' }), 502);
    await expect(analyzeImages(endpoint, new FormData())).rejects.toThrow(/vision-ai-worker/);
    expect(f.mock.calls[0][0]).toBe('/core/vision-engine/analyze-image');
  });

  it('reads a non-JSON config list answer as null', async () => {
    stub('404 page not found', 404, 'text/plain');
    expect(await listVisionConfigs(endpoint)).toEqual({ status: 404, json: null });
  });

  it('reads brands from any known key', async () => {
    stub(JSON.stringify({ data: [{ id: 'b', name: 'B' }] }));
    expect(await listReferenceBrands()).toEqual([{ id: 'b', name: 'B' }]);
  });
});
