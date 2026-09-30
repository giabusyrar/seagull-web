import { describe, expect, it } from 'vitest';
import {
  anchorForMeasurementKeys,
  buildPins,
  faceErrorText,
  formatMeasurementValue,
  isRetryable,
  measurementGeometry,
  readFaceApiError,
  regionConfidence,
  type FaceApiError,
  type FaceArchitectureResult,
  type GuidanceRegion,
  type Measurement,
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

const measurement = (over: Partial<Measurement> = {}): Measurement => ({
  key: 'mouth_width',
  value: 1.23456,
  unit: 'iod',
  band: null,
  visibility: 'observed',
  proxy: false,
  landmarks: [0, 1],
  reason: null,
  ...over,
});

// Landmark index -> pixel position, as the engine returns them.
const LANDMARKS: [number, number][] = [
  [10, 20],
  [30, 40],
  [50, 60],
  [70, 80],
];

describe('measurementGeometry', () => {
  it('draws two landmarks as the distance between them', () => {
    expect(measurementGeometry(measurement(), LANDMARKS)).toEqual({
      kind: 'segment',
      points: [
        [10, 20],
        [30, 40],
      ],
      anchor: [20, 30],
    });
  });

  it('draws three landmarks of a degree measure as an angle at the middle one', () => {
    const g = measurementGeometry(measurement({ unit: 'deg', landmarks: [0, 1, 2] }), LANDMARKS);
    expect(g?.kind).toBe('angle');
    expect(g?.anchor).toEqual([30, 40]);
  });

  it('leaves any other set as unconnected points', () => {
    expect(measurementGeometry(measurement({ unit: 'ratio', landmarks: [0, 1, 2] }), LANDMARKS)?.kind).toBe('points');
    const g = measurementGeometry(measurement({ landmarks: [0, 1, 2, 3] }), LANDMARKS);
    expect(g?.kind).toBe('points');
    expect(g?.anchor).toEqual([40, 50]);
  });

  it('draws nothing when the engine sent no landmarks', () => {
    expect(measurementGeometry(measurement(), null)).toBeNull();
    expect(measurementGeometry(measurement(), undefined)).toBeNull();
  });

  it('draws nothing for a measurement without a value', () => {
    expect(measurementGeometry(measurement({ value: null }), LANDMARKS)).toBeNull();
  });

  it('draws nothing when an index is missing or not finite', () => {
    expect(measurementGeometry(measurement({ landmarks: [0, 9] }), LANDMARKS)).toBeNull();
    expect(measurementGeometry(measurement(), [[0, 0], [Number.NaN, 1]])).toBeNull();
    expect(measurementGeometry(measurement({ landmarks: [] }), LANDMARKS)).toBeNull();
  });
});

describe('formatMeasurementValue', () => {
  it('rounds for the photo label and names the unit', () => {
    expect(formatMeasurementValue(measurement())).toBe('1.23 IOD');
    expect(formatMeasurementValue(measurement({ unit: 'deg', value: 12.5 }))).toBe('12.5°');
    expect(formatMeasurementValue(measurement({ unit: 'ratio', value: 0.5 }))).toBe('0.5');
  });

  it('formats list values element by element', () => {
    expect(formatMeasurementValue(measurement({ unit: 'deg', value: [100.123, 120] }))).toBe('100.12°, 120°');
  });
});

describe('anchorForMeasurementKeys', () => {
  const ms = [measurement({ key: 'a', landmarks: [0, 1] }), measurement({ key: 'b', landmarks: [2, 3] })];

  it('centres on the landmarks behind the named measurements', () => {
    expect(anchorForMeasurementKeys(['a'], ms, LANDMARKS)).toEqual([20, 30]);
    expect(anchorForMeasurementKeys(['a', 'b'], ms, LANDMARKS)).toEqual([40, 50]);
  });

  it('has no place without measurement links or landmarks', () => {
    expect(anchorForMeasurementKeys(undefined, ms, LANDMARKS)).toBeNull();
    expect(anchorForMeasurementKeys([], ms, LANDMARKS)).toBeNull();
    expect(anchorForMeasurementKeys(['a'], ms, null)).toBeNull();
    expect(anchorForMeasurementKeys(['unknown'], ms, LANDMARKS)).toBeNull();
  });
});

describe('buildPins', () => {
  const base: FaceArchitectureResult = {
    quality: { rollDeg: 0, yawDeg: 0, pitchDeg: 0, iodPx: 100, gatesPassed: [], warnings: [], regionDeltaE: {} },
    regions: {},
    measurements: [measurement({ key: 'a', landmarks: [0, 1] })],
    classifications: {
      face_shape: { status: 'blend', primary: 'oval', secondary: 'heart', scores: {}, notAssessable: [], measurements: ['a'] },
    },
    traits: {
      lip_fullness: { status: 'assessed', label: 'full', boundaryUncertain: false },
    },
    guidance: { regions: [region()], droppedTemplates: [] },
    provenance: {
      model: { name: 'm', version: '1', manifestSha256: '' },
      catalogueVersion: 'c',
      profile: { id: 'p', code: 'p', version: 1, catalogueVersion: 'c' },
      calibration: { status: 'uncalibrated' },
    },
    landmarks: LANDMARKS,
  };

  it('pins every classification, trait and guidance area', () => {
    const pins = buildPins(base);
    expect(pins.map((p) => p.id)).toEqual(['classification:face_shape', 'trait:lip_fullness', 'guidance:0']);
    expect(pins[0].label).toBe('face_shape: oval + heart');
    expect(pins[0].anchor).toEqual([20, 30]);
  });

  it('leaves a trait without measurement links unplaced instead of guessing', () => {
    expect(buildPins(base)[1].anchor).toBeNull();
  });

  it('places guidance at its polygon centre, landmarks or not', () => {
    expect(buildPins({ ...base, landmarks: null })[2].anchor).toEqual([20 / 3, 10 / 3]);
  });
});
