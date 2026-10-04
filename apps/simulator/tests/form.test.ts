import { describe, it, expect } from 'vitest';
import { evaluateSurvey, evaluateSurveyWithPhoto, listSurveys, selectableSurveys, surveySchema } from '@/lib/form';

const brand = { brandId: 'WARDAH', applicationId: 'skinverse' };
const who = { customerId: 'sim-customer', consentDataProcessing: true, consentMarketing: false };

describe('form requests', () => {
  it('lists the scope’s surveys through the core rewrite', () => {
    const { url, init } = listSurveys(brand);
    expect(url).toBe('/svc/core/core/form-engine/survey?brand_id=WARDAH&application_id=skinverse');
    expect(init.method).toBe('GET');
  });

  it('evaluates answers as JSON', () => {
    const { url, init } = evaluateSurvey('q 1', brand, { Q1: ['a'] }, who);
    expect(url).toBe('/svc/core/core/form-engine/survey/q%201/evaluate');
    expect(JSON.parse(init.body as string)).toEqual({ brand_id: 'WARDAH', application_id: 'skinverse', customer_id: 'sim-customer', data: { Q1: ['a'] } });
  });

  it('evaluates answers with the photo as multipart, consent as "true"/"false"', () => {
    const photo = new File([new Uint8Array([1])], 'front.jpg', { type: 'image/jpeg' });
    const { url, init } = evaluateSurveyWithPhoto('q1', brand, { Q1: 'yes' }, photo, { ...who, fullName: 'Sim' });
    expect(url).toBe('/svc/core/core/form-engine/survey/q1/evaluate-with-photos');
    const fd = init.body as FormData;
    expect(fd.get('data')).toBe('{"Q1":"yes"}');
    expect(fd.get('consent_data_processing')).toBe('true');
    expect(fd.get('consent_marketing')).toBe('false');
    expect(fd.get('full_name')).toBe('Sim');
    expect(fd.get('email')).toBeNull();
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
