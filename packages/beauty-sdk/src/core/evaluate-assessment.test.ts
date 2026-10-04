import { describe, expect, it, vi } from 'vitest';
import { BeautyClient } from './client';
import { evaluateAssessment, gatewayAssessmentEvaluator } from './evaluate-assessment';

const config = { gatewayUrl: 'https://gw.test/', apiKey: 'k', token: 't', brandId: 'b', applicationId: 'a' };
const ok = () => vi.fn<typeof fetch>(async () => new Response('{"id":"as1"}'));

describe('evaluateAssessment', () => {
  it('posts to the survey path with the config scope and auth headers', async () => {
    const f = ok();
    await evaluateAssessment({ ...config, gatewayUrl: 'https://gw.test' }, 'skin q/1', { answers: { a: 1 } } as never, f);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://gw.test/core/form-engine/survey/skin%20q%2F1/evaluate');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json', 'X-API-Key': 'k', Authorization: 'Bearer t' });
    expect(JSON.parse(init?.body as string)).toEqual({ answers: { a: 1 }, brand_id: 'b', application_id: 'a' });
  });

  it('keeps a scope the request names', async () => {
    const f = ok();
    await evaluateAssessment(config, 's', { answers: {}, brand_id: 'x', application_id: 'y' } as never, f);
    expect(JSON.parse(f.mock.calls[0][1]?.body as string)).toMatchObject({ brand_id: 'x', application_id: 'y' });
  });

  it('needs a survey code and reports a failed evaluation', async () => {
    await expect(evaluateAssessment(config, '', {} as never, ok())).rejects.toThrow(/survey code/);
    const f = vi.fn<typeof fetch>(async () => new Response('no survey', { status: 404 }));
    await expect(evaluateAssessment(config, 's', {} as never, f)).rejects.toThrow('Assessment evaluation failed (404): no survey');
  });
});

describe('callers', () => {
  it('trim one trailing slash, through the evaluator and the legacy client alike', async () => {
    const f = ok();
    vi.stubGlobal('fetch', f);
    await gatewayAssessmentEvaluator(config).evaluateAssessment('s', {} as never);
    await new BeautyClient(config).evaluateAssessment('s', {} as never);
    vi.unstubAllGlobals();
    expect(f.mock.calls.map((c) => c[0])).toEqual([
      'https://gw.test/core/form-engine/survey/s/evaluate',
      'https://gw.test/core/form-engine/survey/s/evaluate',
    ]);
  });
});
