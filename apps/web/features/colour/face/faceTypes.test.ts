import { describe, expect, it } from 'vitest';
import {
  faceErrorText,
  isRetryable,
  readFaceApiError,
  regionConfidence,
  type FaceApiError,
  type GuidanceRegion,
} from './faceTypes';

function response(status: number, body: string, contentType = 'application/json'): Response {
  return new Response(body, { status, headers: { 'content-type': contentType } });
}

const region = (over: Partial<GuidanceRegion> = {}): GuidanceRegion => ({
  role: 'contour',
  template: 'forehead_sides',
  polygon: [
    [0, 0],
    [10, 0],
    [10, 10],
  ],
  intensity: 0.5,
  ruleId: 'r1',
  match: 'primary',
  textKeys: [],
  anchorVisibility: 'observed',
  unverifiedRegions: [],
  ...over,
});

describe('readFaceApiError', () => {
  it('reads the detail object the engine returns', async () => {
    const err = await readFaceApiError(response(409, JSON.stringify({ detail: { code: 'no_active_face_architecture_profile', brandId: 'b1' } })));
    expect(err).toMatchObject({ status: 409, code: 'no_active_face_architecture_profile' });
  });

  it('keeps every entry when the worker sends a detail list', async () => {
    const body = JSON.stringify({ detail: [{ code: 'quality_gate_failed', gate: 'yaw' }, { code: 'quality_gate_failed', gate: 'blur' }] });
    const err = await readFaceApiError(response(422, body));
    expect(err.entries).toHaveLength(2);
    expect(err.entries.map((e) => e.gate)).toEqual(['yaw', 'blur']);
  });

  it('does not invent a code when the body is not JSON', async () => {
    const err = await readFaceApiError(response(502, '<html>bad gateway</html>', 'text/html'));
    expect(err.code).toBe('');
    expect(err.status).toBe(502);
  });
});

describe('faceErrorText', () => {
  const err = (over: Partial<FaceApiError>): FaceApiError => ({ status: 500, code: '', message: '', entries: [], ...over });

  it('states that the brand is not configured on 409, without blaming the photo', () => {
    const text = faceErrorText(err({ status: 409, code: 'no_active_face_architecture_profile' }));
    expect(text).toMatch(/belum dikonfigurasi/i);
    expect(text).not.toMatch(/foto/i);
  });

  it('is not retryable on 409 — retrying cannot create a profile', () => {
    expect(isRetryable(err({ status: 409, code: 'no_active_face_architecture_profile' }))).toBe(false);
  });

  it('is retryable when the model is unavailable', () => {
    expect(isRetryable(err({ status: 503, code: 'model_unavailable' }))).toBe(true);
  });

  it('asks for a new photo when a quality gate fails', () => {
    expect(faceErrorText(err({ status: 422, code: 'quality_gate_failed' }))).toMatch(/foto/i);
  });

  it('falls back without pretending to know the cause', () => {
    const text = faceErrorText(err({ status: 500, code: '' }));
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('regionConfidence', () => {
  it('is verified only when anchors are observed and nothing is unverified', () => {
    expect(regionConfidence(region())).toBe('verified');
  });

  it('is unverified when the worker could not confirm the anchors', () => {
    expect(regionConfidence(region({ anchorVisibility: 'unknown' }))).toBe('unverified');
  });

  it('is unverified when any region behind it was not observed', () => {
    expect(regionConfidence(region({ unverifiedRegions: ['brows'] }))).toBe('unverified');
  });

  it('treats a placeholder placement as unsourced, whatever its visibility', () => {
    expect(regionConfidence(region({ placeholder: true }))).toBe('unsourced');
  });
});
