import { describe, expect, it, vi } from 'vitest';

// The real pipeline is tested in packages/studio; this checks only how the
// route answers each outcome.
vi.mock('@gateway-experience/studio/orchestrator', () => {
  class PipelineInputError extends Error {
    constructor(public readonly missing: string[]) {
      super(`The assessment pipeline needs ${missing.join(', ')}; none was supplied and none is assumed.`);
      this.name = 'PipelineInputError';
    }
  }
  return {
    PipelineInputError,
    executeAssessmentPipeline: vi.fn(async (payload: { rulesetCode?: string; baseUrl?: string }) => {
      if (!payload.rulesetCode) throw new PipelineInputError(['rulesetCode']);
      if (payload.rulesetCode === 'boom') throw new Error('kaput');
      return { success: true, baseUrl: payload.baseUrl };
    }),
  };
});

import { POST } from './route';

const post = (body: unknown) =>
  POST(new Request('http://dash.test/api/orchestrator/pipeline', { method: 'POST', body: JSON.stringify(body) }));

describe('POST /api/orchestrator/pipeline', () => {
  it('answers 400 naming what is missing, rather than running against a guessed tenant', async () => {
    const res = await post({ brandId: 'b', applicationId: 'a', answers: {} });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.missing).toEqual(['rulesetCode']);
    expect(body.error).toMatch(/rulesetCode/);
  });

  it("runs the pipeline with this request's origin", async () => {
    const res = await post({ brandId: 'b', applicationId: 'a', rulesetCode: 'rs', answers: {} });
    expect(res.status).toBe(200);
    expect((await res.json()).baseUrl).toBe('http://dash.test');
  });

  it('answers 500 on an unexpected failure', async () => {
    const res = await post({ brandId: 'b', applicationId: 'a', rulesetCode: 'boom', answers: {} });
    expect(res.status).toBe(500);
  });
});
