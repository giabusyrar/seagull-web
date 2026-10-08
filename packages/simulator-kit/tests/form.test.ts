import { describe, it, expect } from 'vitest';
import { withDryRun } from '@/lib/http';
import { dimensionRows } from '@/lib/breakdown';
import { evaluateSurvey, evaluateSurveyWithPhoto, listSurveys, selectableSurveys, surveySchema } from '@/lib/form';

const brand = { brandId: 'WARDAH', applicationId: 'skinverse' };
const who = { consentDataProcessing: true, consentMarketing: false };

describe('form requests', () => {
  it('lists the scope’s surveys through the core rewrite', () => {
    const { url, init } = listSurveys(brand);
    expect(url).toBe('/svc/core/core/form-engine/survey?brand_id=WARDAH&application_id=skinverse');
    expect(init.method).toBe('GET');
  });

  it('evaluates answers as JSON with the customer’s details and no customer id', () => {
    const { url, init } = evaluateSurvey('q 1', brand, { Q1: ['a'] }, { ...who, fullName: ' Sim ', email: '', dateOfBirth: '1990-01-02' });
    expect(url).toBe('/svc/core/core/form-engine/survey/q%201/evaluate');
    expect(JSON.parse(init.body as string)).toEqual({ brand_id: 'WARDAH', application_id: 'skinverse', full_name: 'Sim', date_of_birth: '1990-01-02', data: { Q1: ['a'] } });
  });

  it('evaluates answers with the photo as multipart, consent as "true"/"false"', () => {
    const photo = new File([new Uint8Array([1])], 'front.jpg', { type: 'image/jpeg' });
    const { url, init } = evaluateSurveyWithPhoto('q1', brand, { Q1: 'yes' }, photo, { ...who, fullName: 'Sim' });
    expect(url.split('?')[0]).toBe('/svc/core/core/form-engine/survey/q1/evaluate-with-photos');
    // The brand goes in the query too: the gateway adds a default brand to a query without one.
    expect(new URL(url, 'http://x').searchParams.get('brand_id')).toBeTruthy();
    const fd = init.body as FormData;
    expect(fd.get('data')).toBe('{"Q1":"yes"}');
    expect(fd.get('consent_data_processing')).toBe('true');
    expect(fd.get('consent_marketing')).toBe('false');
    expect(fd.get('full_name')).toBe('Sim');
    expect(fd.get('email')).toBeNull();
    expect(fd.get('customer_id')).toBeNull();
    expect((fd.get('photo') as File).name).toBe('front.jpg');
  });
});

describe('survey rows', () => {
  it('drops archived and malformed rows', () => {
    expect(selectableSurveys([{ code: 'a', status: 'active' }, { code: 'b', status: 'archived' }, { title: 'no code' }, null]).map((r) => r.code)).toEqual(['a']);
    expect(selectableSurveys({ surveys: [{ code: 'c' }] }).map((r) => r.code)).toEqual(['c']);
    expect(selectableSurveys({ error: 'x' })).toEqual([]);
  });

  it('parses the schema, or gives null', () => {
    expect(surveySchema({ code: 'a', schema: '{"pages":[]}' })).toEqual({ pages: [] });
    expect(surveySchema({ code: 'a', schema: '{broken' })).toBeNull();
    expect(surveySchema(undefined)).toBeNull();
  });
});

describe('dry run', () => {
  it('marks every core call, and only core calls, as a dry run', () => {
    const core = withDryRun(evaluateSurvey('q1', brand, {}, who));
    expect(new Headers(core.init.headers).get('X-Dry-Run')).toBe('true');
    expect(new Headers(core.init.headers).get('Content-Type')).toBe('application/json');
    expect(new Headers(withDryRun(listSurveys(brand)).init.headers).get('X-Dry-Run')).toBe('true');
    const conv = withDryRun({ url: '/svc/conv/conversation/sessions', init: { method: 'POST' } });
    expect(new Headers(conv.init.headers).get('X-Dry-Run')).toBeNull();
  });
});

describe('dimension breakdown', () => {
  it('lists scored dimensions with their sources by weight, then unscored ones', () => {
    const rows = dimensionRows({
      dimension_scores: { sebum: 41.2, hydration: 60 },
      dimension_breakdown: {
        sebum: { scored: true, score: 41.2, contributions: { form: { score: 36.8, weight: 0.4 }, device: { score: 47.8, weight: 0.6 } }, missing: ['vision'] },
        aging: { scored: false, contributions: {}, missing: ['form', 'vision'], reason: 'no source arrived' },
      },
    });
    expect(rows.map((r) => [r.key, r.scored, r.hasBreakdown])).toEqual([['sebum', true, true], ['hydration', true, false], ['aging', false, true]]);
    expect(rows[0].contributions.map(([s]) => s)).toEqual(['device', 'form']);
    expect(rows[0].missing).toEqual(['vision']);
    expect(rows[2]).toMatchObject({ score: undefined, reason: 'no source arrived' });
  });

  it('works on an older core without a breakdown', () => {
    expect(dimensionRows({ dimension_scores: { a: 1 } })).toEqual([{ key: 'a', score: 1, scored: true, contributions: [], missing: [], reason: undefined, hasBreakdown: false }]);
    expect(dimensionRows({})).toEqual([]);
  });
});
