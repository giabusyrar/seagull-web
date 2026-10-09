import { describe, expect, it } from 'vitest';
import { ENGINE, QC_THRESHOLDS } from '@/capture/config';
import { checkStates, convexHull, firstAdvice, measureFrame, poseFromMatrix, qcFailures, smoothMetrics, type DetectedFace, type LiveMetrics } from '@/capture/qc';

// The live check must equal the colour engine's (seagull-core
// apps/workers/colour/worker_colour/wcpa/cells/pipeline_03.py and
// pca_base_c.py, as of 2026-10-09). A change there changes these numbers.
describe("the engine's quality rules", () => {
  it('has the engine thresholds', () => {
    expect(QC_THRESHOLDS).toEqual({
      L_MEDIAN_MIN: 35, CLIP_FRAC_MAX: 0.08, MIXED_HUE_MAX: 10, YAW_MAX: 16.5, PITCH_MAX: 15, ROLL_MAX: 10,
      EXPR_MAX: 0.5, BLINK_MAX: 0.5, FACE_W_MIN: 150, FACE_FRAC_MAX: 0.35, CENTER_OFF_MAX: 1,
    });
  });
  it('counts pucker and funnel as expression, as BS_EXPR does (only mouthClose is left out)', () => {
    expect(ENGINE.EXPRESSION_EXCLUDED).toEqual(['mouthClose']);
  });
});

/** A 478-point face: a ring of points around (cx, cy) with radius r, plus the nose tip at the centre. */
function face(cx = 0.5, cy = 0.5, r = 0.15, blendshapes: Record<string, number> = {}): DetectedFace {
  const landmarks = Array.from({ length: ENGINE.MESH_POINTS }, (_, i) => {
    const a = (i / ENGINE.HULL_POINTS) * 2 * Math.PI;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  landmarks[ENGINE.MIDLINE_LANDMARK] = { x: cx, y: cy };
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -50, 1];
  return { landmarks, blendshapes, matrix: identity };
}

const frame = (faces: DetectedFace[]) => measureFrame({ faces, frameWidth: 1280, frameHeight: 960, pixels: null });

describe('measureFrame + qcFailures', () => {
  it('passes a centred, straight, neutral face of a good size', () => {
    const { metrics } = frame([face()]);
    expect(metrics.face_found).toBe(true);
    expect(qcFailures(metrics)).toEqual([]);
  });

  it('reports no face and a second face', () => {
    expect(qcFailures(frame([]).metrics)).toEqual(['tidak_ada_wajah']);
    expect(qcFailures(frame([face(0.5, 0.5, 0.15), face(0.8, 0.8, 0.05)]).metrics)).toContain('wajah_ganda');
  });

  it('checks size and centring', () => {
    expect(qcFailures(frame([face(0.5, 0.5, 0.03)]).metrics)).toContain('wajah_kecil');
    expect(qcFailures(frame([face(0.5, 0.5, 0.45)]).metrics)).toContain('wajah_besar');
    expect(qcFailures(frame([face(0.85, 0.5, 0.1)]).metrics)).toContain('tidak_di_tengah');
  });

  it('flags expression from mouth/jaw/cheek/nose blendshapes, pucker included, mouthClose not', () => {
    expect(qcFailures(frame([face(0.5, 0.5, 0.15, { mouthSmileLeft: 0.7 })]).metrics)).toContain('ekspresi');
    expect(qcFailures(frame([face(0.5, 0.5, 0.15, { mouthPucker: 0.6 })]).metrics)).toContain('ekspresi');
    expect(qcFailures(frame([face(0.5, 0.5, 0.15, { mouthClose: 0.9 })]).metrics)).not.toContain('ekspresi');
    expect(qcFailures(frame([face(0.5, 0.5, 0.15, { eyeBlinkLeft: 0.8 })]).metrics)).toContain('mata_tertutup');
  });

  it('advises getting into the frame before anything else', () => {
    expect(firstAdvice(['ekspresi', 'terlalu_gelap', 'tidak_di_tengah'])).toBe('tidak_di_tengah');
    expect(firstAdvice([])).toBeNull();
  });

  it('leaves light pending without pixels and the other chips decided', () => {
    const { metrics } = frame([face()]);
    expect(checkStates(metrics, qcFailures(metrics))).toEqual({ light: 'pending', position: 'ok', pose: 'ok', expression: 'ok' });
  });
});

describe('geometry and smoothing', () => {
  it('reads yaw from a rotation about the vertical axis', () => {
    const a = (20 * Math.PI) / 180;
    // column-major 4x4: rotation about Y by 20°, translation in the last column
    const m = [Math.cos(a), 0, -Math.sin(a), 0, 0, 1, 0, 0, Math.sin(a), 0, Math.cos(a), 0, 0, 0, -50, 1];
    expect(Math.abs(poseFromMatrix(m)!.yaw)).toBeCloseTo(20, 5);
    expect(poseFromMatrix(null)).toBeNull();
  });

  it('builds a convex hull', () => {
    const hull = convexHull([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0.5, y: 0.5 }]);
    expect(hull).toHaveLength(4);
  });

  it('smooths towards the new frame and restarts when the face is lost', () => {
    const a = frame([face()]).metrics;
    const b = { ...a, expr_max: 1 } as LiveMetrics;
    expect(smoothMetrics({ ...a, expr_max: 0 }, b, 0.4).expr_max).toBeCloseTo(0.4);
    const lost = frame([]).metrics;
    expect(smoothMetrics(a, lost, 0.4)).toBe(lost);
  });
});
