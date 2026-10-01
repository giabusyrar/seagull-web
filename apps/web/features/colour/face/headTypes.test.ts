import { describe, expect, it } from 'vitest';
import type { FaceApiError } from './faceTypes';
import { headErrorText } from './headTypes';

const err = (status: number, code: string, entry: Record<string, unknown> = {}): FaceApiError => ({
  status,
  code,
  message: '',
  entries: [{ code, ...entry }],
});

describe('headErrorText', () => {
  it('names the photo a view gate rejected', () => {
    expect(headErrorText(err(422, 'wrong_side', { view: 'left' }))).toBe(
      'Foto samping kiri: menoleh ke arah yang salah untuk sisi ini.',
    );
  });

  it('tells an operator problem apart from a photo problem', () => {
    expect(headErrorText(err(503, 'fov_prior_unconfigured'))).toMatch(/belum dikonfigurasi/);
    expect(headErrorText(err(503, 'prior_scale_invalid'))).toMatch(/belum dikonfigurasi/);
    expect(headErrorText(err(422, 'fit_rejected'))).toMatch(/foto ulang/);
    // Server-side failures (evidence_failed, sigma_non_finite) read as the service's problem.
    expect(headErrorText(err(500, 'sigma_non_finite'))).toMatch(/sedang bermasalah/);
  });

  it('says the route is missing on a server without it', () => {
    expect(headErrorText(err(404, ''))).toMatch(/belum tersedia/);
  });
});
