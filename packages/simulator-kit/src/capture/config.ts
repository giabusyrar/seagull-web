// Settings of the live capture check (CameraCapture with `check`). Every number
// the check uses is defined here, once.
//
// QC_THRESHOLDS and ENGINE mirror the WCPA colour engine in seagull-core
// (apps/workers/colour/worker_colour/wcpa/cells/): pipeline_03.py holds the
// thresholds and QC_RULES, pca_base_c.py (qc_measure, load_img, BS_EXPR) and
// pipeline_06.py say how each feature is measured. They must stay equal to the
// engine's, so that a photo the live check passes also passes the engine's
// quality check: change the engine first, then here (tests/capture-qc.test.ts
// pins these values). The tags are the notebook's: [KARANGAN] is set by hand
// and still to be calibrated; [SPEK], [PROKSI] and [TERUKUR] have a source.

import { simulatorConfig } from '../lib/services';

/** pipeline_03.py: the quality-check thresholds the live frame can be checked against. */
export const QC_THRESHOLDS = {
  /** [KARANGAN] Lower bound of the ITA "brown" class. Median face L*. */
  L_MEDIAN_MIN: 35.0,
  /** [KARANGAN] Normal highlight is 3-5 %. Share of face pixels above ENGINE.CLIP_L. */
  CLIP_FRAC_MAX: 0.08,
  /** [KARANGAN] Hue difference of the left and right face halves, degrees. */
  MIXED_HUE_MAX: 10.0,
  /** [PROKSI] MST-E: facing_camera p90 13.6°, side p10 19.6°. */
  YAW_MAX: 16.5,
  /** [SPEK] MST-E: facing_camera p10..p90 -13..+11°, bottom median -29°. */
  PITCH_MAX: 15.0,
  /** [SPEK] Degrees. */
  ROLL_MAX: 10.0,
  /** [KARANGAN] Blendshape score 0-1. */
  EXPR_MAX: 0.5,
  /** [KARANGAN] Blendshape score 0-1. */
  BLINK_MAX: 0.5,
  /** [KARANGAN] Face width in px: patches and the iris need pixels, not a share of the frame. */
  FACE_W_MIN: 150.0,
  /** [TERUKUR] Above this, grey-world neutralises the skin. Face hull area / frame area. */
  FACE_FRAC_MAX: 0.35,
  /** [KARANGAN] 1.0 = face centre inside x 0.25-0.75, y 0.20-0.80. */
  CENTER_OFF_MAX: 1.0,
} as const;

export type QcThresholds = { [K in keyof typeof QC_THRESHOLDS]: number };

/** How the engine measures, so the live numbers are the engine's numbers. */
export const ENGINE = {
  /** pca_base_a.py DETECTOR num_faces: a second face is reported, not silently dropped. */
  NUM_FACES: 2,
  /** pca_base_c.py load_img(max_side): the engine measures the photo at most this long, px. */
  MAX_SIDE: 1400,
  /** qc_measure: face mesh points (without the iris) whose convex hull is the face mask. */
  HULL_POINTS: 468,
  /** qc_measure: the face mesh the engine accepts has this many points. */
  MESH_POINTS: 478,
  /** qc_measure: face width is the distance between these two landmarks. */
  FACE_WIDTH_LANDMARKS: [234, 454] as const,
  /** qc_measure: the nose tip splits the face into the halves compared by mixed_hue. */
  MIDLINE_LANDMARK: 1,
  /** qc_measure: clip_frac counts face pixels with L* above this. */
  CLIP_L: 92,
  /** pca_base_c.py ZONE_C_MIN [KARANGAN]: below this chroma a half counts as colourless and mixed_hue is not measured. */
  ZONE_C_MIN: 6.0,
  /** qc_measure: center_off = max(|cx - 0.5| / X, |cy - 0.5| / Y). */
  CENTER_HALF_BOX: { x: 0.25, y: 0.3 },
  /** pipeline_06.py SOG_P: Shades-of-Gray p-norm of the full-frame light estimate. */
  SOG_P: 6,
  /** pca_base_c.py BS_EXPR: blendshapes that change the sampled regions (mouth, jaw, cheek, nose). */
  EXPRESSION_PREFIXES: ['mouth', 'jaw', 'cheek', 'nose'] as const,
  /** pca_base_c.py BS_EXPR leaves out only mouthClose (pucker and funnel count as expression). */
  EXPRESSION_EXCLUDED: ['mouthClose'] as const,
  /** qc_measure blink_max. */
  BLINK_BLENDSHAPES: ['eyeBlinkLeft', 'eyeBlinkRight'] as const,
} as const;

/**
 * Web-only settings: how often and how the camera frame is checked. They
 * change responsiveness, not what counts as a good photo.
 */
export const LIVE = {
  /** Detection runs at most this often, ms (about 15 per second). */
  DETECT_INTERVAL_MS: 66,
  /** Width of the frame copy the light is measured on, px. Sampled without smoothing, so highlights keep their values. */
  ANALYSIS_WIDTH: 320,
  /** Weight of the newest frame in the running average of each measurement (0-1). */
  SMOOTHING: 0.4,
  /** Every check has to pass this long before the photo can be taken, ms. */
  READY_HOLD_MS: 600,
  /** On capture, wait at most this long for a frame with the eyes open, ms. */
  CAPTURE_WAIT_MS: 1000,
  /** After this many failed detections in a row the check stops and the camera works unchecked. */
  MAX_DETECT_ERRORS: 30,
} as const;

/**
 * Colour of the light (web only; the engine records it but has no threshold).
 * The engine corrects the colour cast (Shades-of-Gray + Bradford to D65), so
 * a warm or cool light only warns and never blocks the photo.
 */
export const LIGHT_COLOUR = {
  /**
   * [KARANGAN] Below this correlated colour temperature the light reads warm
   * (yellowish), K. On the test frames neutral light read 6,100-6,400 K, a
   * clearly yellow cast 4,900 K and a clearly blue one 7,700 K.
   */
  WARM_BELOW_K: 5300,
  /** [KARANGAN] Above this the light reads cool (bluish), K. */
  COOL_ABOVE_K: 7300,
  /** Range the colour temperature meter shows, K. */
  SCALE_MIN_K: 2000,
  SCALE_MAX_K: 10000,
} as const;

/**
 * Where the browser loads MediaPipe from (configureSimulator: faceLandmarker).
 * Both are needed for the live check; without them the camera works
 * unchecked and says so. wasmUrl: the @mediapipe/tasks-vision "wasm" folder of
 * the installed version; modelUrl: face_landmarker.task, the model the engine
 * uses. See docs/CAPTURE-CHECK.md.
 */
export const mediapipeAssets = () => simulatorConfig().faceLandmarker;
