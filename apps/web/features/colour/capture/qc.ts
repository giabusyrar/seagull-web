// The WCPA engine's quality check (seagull-core qc_measure + qc_rules),
// measured on the camera frame before the photo is taken. Pure functions, no
// DOM: useCaptureCheck feeds them the detector result and a sampled copy of
// the frame. Feature names are qc_measure's, so the two can be compared.

import { ENGINE, LIGHT_COLOUR, QC_THRESHOLDS, type QcThresholds } from './config';

/**
 * Quality codes the live check raises; the same codes the engine returns in
 * qualityFailed (QC_ADVICE in ../types has the advice for each). Not measured
 * live: `tertutup` and `blur` need the full-resolution photo (colour-corrected
 * skin zones, eye sharpness). The engine still checks them after capture.
 */
export type LiveQcCode =
  | 'tidak_ada_wajah'
  | 'wajah_ganda'
  | 'terlalu_gelap'
  | 'terlalu_terang'
  | 'cahaya_campuran'
  | 'menoleh'
  | 'mendongak_menunduk'
  | 'miring'
  | 'ekspresi'
  | 'mata_tertutup'
  | 'wajah_kecil'
  | 'wajah_besar'
  | 'tidak_di_tengah';

export interface Point {
  x: number;
  y: number;
}

export interface DetectedFace {
  /** Face mesh, normalised to the frame (0-1). */
  landmarks: Point[];
  /** Blendshape scores by name; null when the detector gave none. */
  blendshapes: Record<string, number> | null;
  /** 4x4 facial transformation matrix (16 values); null when absent. */
  matrix: ArrayLike<number> | null;
}

export interface RgbaPixels {
  /** RGBA bytes, row by row. */
  data: ArrayLike<number>;
  width: number;
  height: number;
}

export interface FrameInput {
  faces: DetectedFace[];
  /** Size of the camera frame, px. */
  frameWidth: number;
  frameHeight: number;
  /** The whole frame, sampled down. Null skips the light measurements. */
  pixels: RgbaPixels | null;
}

/** qc_measure's features under the same names. NaN: not measured, which passes (as in qc_rules). */
export interface LiveMetrics {
  face_found: boolean;
  n_faces: number;
  L_med: number;
  clip_frac: number;
  mixed_hue: number;
  pitch: number;
  yaw: number;
  roll: number;
  abs_pitch: number;
  abs_yaw: number;
  abs_roll: number;
  expr_max: number;
  pucker_max: number;
  blink_max: number;
  face_w_px: number;
  face_frac: number;
  center_off: number;
  /** Correlated colour temperature of the Shades-of-Gray light estimate, K. Web only. */
  cct: number;
}

type Feature = Exclude<keyof LiveMetrics, 'face_found' | 'n_faces'>;

const FEATURES: readonly Feature[] = [
  'L_med',
  'clip_frac',
  'mixed_hue',
  'pitch',
  'yaw',
  'roll',
  'abs_pitch',
  'abs_yaw',
  'abs_roll',
  'expr_max',
  'pucker_max',
  'blink_max',
  'face_w_px',
  'face_frac',
  'center_off',
  'cct',
];

/** pipeline_03.py QC_RULES: (code, feature, fails when, threshold). */
const QC_RULES: readonly (readonly [LiveQcCode, Feature, '<' | '>', keyof typeof QC_THRESHOLDS])[] = [
  ['terlalu_gelap', 'L_med', '<', 'L_MEDIAN_MIN'],
  ['terlalu_terang', 'clip_frac', '>', 'CLIP_FRAC_MAX'],
  ['cahaya_campuran', 'mixed_hue', '>', 'MIXED_HUE_MAX'],
  ['menoleh', 'abs_yaw', '>', 'YAW_MAX'],
  ['mendongak_menunduk', 'abs_pitch', '>', 'PITCH_MAX'],
  ['miring', 'abs_roll', '>', 'ROLL_MAX'],
  ['ekspresi', 'expr_max', '>', 'EXPR_MAX'],
  ['ekspresi', 'pucker_max', '>', 'PUCKER_MAX'],
  ['mata_tertutup', 'blink_max', '>', 'BLINK_MAX'],
  ['wajah_kecil', 'face_w_px', '<', 'FACE_W_MIN'],
  ['wajah_besar', 'face_frac', '>', 'FACE_FRAC_MAX'],
  ['tidak_di_tengah', 'center_off', '>', 'CENTER_OFF_MAX'],
];

// --- colorimetry: sRGB (IEC 61966-2-1), D65, CIELAB as skimage.rgb2lab ----

const SRGB_TO_XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
] as const;
const D65_WHITE = [0.95047, 1.0, 1.08883] as const;

const LINEAR = (() => {
  const t = new Float64Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    t[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }
  return t;
})();

// LINEAR[i] ** SOG_P, for the Shades-of-Gray sums.
const LINEAR_P = LINEAR.map((v) => v ** ENGINE.SOG_P);

const labF = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const DEG = 180 / Math.PI;

/** Correlated colour temperature of a linear-RGB light colour, K (McCamy 1992). */
export function cctFromLinearRgb(r: number, g: number, b: number): number {
  const X = SRGB_TO_XYZ[0][0] * r + SRGB_TO_XYZ[0][1] * g + SRGB_TO_XYZ[0][2] * b;
  const Y = SRGB_TO_XYZ[1][0] * r + SRGB_TO_XYZ[1][1] * g + SRGB_TO_XYZ[1][2] * b;
  const Z = SRGB_TO_XYZ[2][0] * r + SRGB_TO_XYZ[2][1] * g + SRGB_TO_XYZ[2][2] * b;
  const s = X + Y + Z;
  if (!(s > 0)) return NaN;
  const n = (X / s - 0.332) / (0.1858 - Y / s);
  return 449 * n ** 3 + 3525 * n ** 2 + 6823.3 * n + 5520.33;
}

// --- geometry -------------------------------------------------------------

/** Convex hull (Andrew's monotone chain), counter-clockwise. */
export function convexHull(points: readonly Point[]): Point[] {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Point[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function polygonArea(poly: readonly Point[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/**
 * Pitch, yaw and roll in degrees from the facial transformation matrix, as
 * the engine's pose_from_matrix (Euler ZYX, columns normalised because the
 * matrix can carry scale). MediaPipe packs the matrix column-major; the
 * layout is read from where the translation sits, so either layout works.
 */
export function poseFromMatrix(m: ArrayLike<number> | null): { pitch: number; yaw: number; roll: number } | null {
  if (!m || m.length < 16) return null;
  const colMajor = Math.abs(m[3]) + Math.abs(m[7]) + Math.abs(m[11]) <= Math.abs(m[12]) + Math.abs(m[13]) + Math.abs(m[14]);
  const at = (r: number, c: number) => (colMajor ? m[c * 4 + r] : m[r * 4 + c]);
  const R = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let c = 0; c < 3; c++) {
    const n = Math.hypot(at(0, c), at(1, c), at(2, c)) || 1;
    for (let r = 0; r < 3; r++) R[r][c] = at(r, c) / n;
  }
  return {
    pitch: Math.atan2(R[2][1], R[2][2]) * DEG,
    yaw: Math.atan2(-R[2][0], Math.hypot(R[2][1], R[2][2])) * DEG,
    roll: Math.atan2(R[1][0], R[0][0]) * DEG,
  };
}

// --- pixels ---------------------------------------------------------------

let scratch: { size: number; L: Float64Array; aL: Float64Array; bL: Float64Array; aR: Float64Array; bR: Float64Array } | null = null;

function buffers(size: number) {
  if (!scratch || scratch.size < size) {
    scratch = {
      size,
      L: new Float64Array(size),
      aL: new Float64Array(size),
      bL: new Float64Array(size),
      aR: new Float64Array(size),
      bR: new Float64Array(size),
    };
  }
  return scratch;
}

function median(values: Float64Array, n: number): number {
  if (n === 0) return NaN;
  const s = values.slice(0, n).sort();
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/**
 * The light measurements of qc_measure on a sampled frame: L_med and
 * clip_frac inside the face hull, mixed_hue between the halves left and right
 * of the nose tip, and the colour temperature of the full-frame
 * Shades-of-Gray light estimate (pipeline_06).
 */
export function measurePixels(
  px: RgbaPixels,
  hull: readonly Point[],
  midX: number,
): Pick<LiveMetrics, 'L_med' | 'clip_frac' | 'mixed_hue' | 'cct'> {
  const { data, width: w, height: h } = px;
  const p = ENGINE.SOG_P;

  // Light estimate over the whole frame.
  let sr = 0;
  let sg = 0;
  let sb = 0;
  for (let i = 0; i < w * h * 4; i += 4) {
    sr += LINEAR_P[data[i]];
    sg += LINEAR_P[data[i + 1]];
    sb += LINEAR_P[data[i + 2]];
  }
  const n = w * h;
  const cct = n ? cctFromLinearRgb((sr / n) ** (1 / p), (sg / n) ** (1 / p), (sb / n) ** (1 / p)) : NaN;

  // Face pixels: rows of the convex hull, sampled at pixel centres.
  const buf = buffers(n);
  let nF = 0;
  let nL = 0;
  let nR = 0;
  let clipped = 0;
  for (let j = 0; j < h && hull.length >= 3; j++) {
    const yc = (j + 0.5) / h;
    let xl = Infinity;
    let xr = -Infinity;
    for (let k = 0; k < hull.length; k++) {
      const a = hull[k];
      const b = hull[(k + 1) % hull.length];
      if ((a.y <= yc && b.y > yc) || (b.y <= yc && a.y > yc)) {
        const x = a.x + ((yc - a.y) / (b.y - a.y)) * (b.x - a.x);
        if (x < xl) xl = x;
        if (x > xr) xr = x;
      }
    }
    if (xl > xr) continue;
    const i0 = Math.max(0, Math.ceil(xl * w - 0.5));
    const i1 = Math.min(w - 1, Math.floor(xr * w - 0.5));
    for (let i = i0; i <= i1; i++) {
      const o = (j * w + i) * 4;
      const r = LINEAR[data[o]];
      const g = LINEAR[data[o + 1]];
      const bl = LINEAR[data[o + 2]];
      const fx = labF((SRGB_TO_XYZ[0][0] * r + SRGB_TO_XYZ[0][1] * g + SRGB_TO_XYZ[0][2] * bl) / D65_WHITE[0]);
      const fy = labF((SRGB_TO_XYZ[1][0] * r + SRGB_TO_XYZ[1][1] * g + SRGB_TO_XYZ[1][2] * bl) / D65_WHITE[1]);
      const fz = labF((SRGB_TO_XYZ[2][0] * r + SRGB_TO_XYZ[2][1] * g + SRGB_TO_XYZ[2][2] * bl) / D65_WHITE[2]);
      const L = 116 * fy - 16;
      buf.L[nF++] = L;
      if (L > ENGINE.CLIP_L) clipped++;
      if ((i + 0.5) / w < midX) {
        buf.aL[nL] = 500 * (fx - fy);
        buf.bL[nL++] = 200 * (fy - fz);
      } else {
        buf.aR[nR] = 500 * (fx - fy);
        buf.bR[nR++] = 200 * (fy - fz);
      }
    }
  }

  let mixed = NaN;
  if (nL && nR) {
    const la = median(buf.aL, nL);
    const lb = median(buf.bL, nL);
    const ra = median(buf.aR, nR);
    const rb = median(buf.bR, nR);
    // Shadows change L*, not hue; a second light of another colour changes hue.
    if (Math.min(Math.hypot(la, lb), Math.hypot(ra, rb)) >= ENGINE.ZONE_C_MIN) {
      const d = Math.abs(Math.atan2(lb, la) * DEG - Math.atan2(rb, ra) * DEG) % 360;
      mixed = Math.min(d, 360 - d);
    }
  }

  return {
    L_med: median(buf.L, nF),
    clip_frac: nF ? clipped / nF : NaN,
    mixed_hue: mixed,
    cct,
  };
}

// --- one frame ------------------------------------------------------------

function emptyMetrics(nFaces: number): LiveMetrics {
  const m = { face_found: false, n_faces: nFaces } as LiveMetrics;
  for (const f of FEATURES) m[f] = NaN;
  return m;
}

export interface FrameResult {
  metrics: LiveMetrics;
  /** The face the check is about (the largest, as in qc_measure), or null. */
  subject: DetectedFace | null;
}

/** Everything qc_measure measures that the live frame allows. */
export function measureFrame(input: FrameInput): FrameResult {
  const { faces, frameWidth: W, frameHeight: H } = input;
  const m = emptyMetrics(faces.length);
  if (!faces.length) return { metrics: m, subject: null };

  let subject = faces[0];
  let hull: Point[] = [];
  let area = -1;
  for (const f of faces) {
    const h = convexHull(f.landmarks.slice(0, ENGINE.HULL_POINTS));
    const a = polygonArea(h);
    if (a > area) {
      area = a;
      hull = h;
      subject = f;
    }
  }
  if (subject.landmarks.length !== ENGINE.MESH_POINTS) return { metrics: m, subject };
  m.face_found = true;

  const pts = subject.landmarks;
  // The engine measures the photo with its longest side capped (load_img).
  const scale = Math.min(1, ENGINE.MAX_SIDE / Math.max(W, H));
  const [wa, wb] = ENGINE.FACE_WIDTH_LANDMARKS;
  m.face_w_px = Math.hypot((pts[wa].x - pts[wb].x) * W, (pts[wa].y - pts[wb].y) * H) * scale;
  m.face_frac = area; // normalised coordinates: hull area / frame area

  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ENGINE.HULL_POINTS; i++) {
    cx += pts[i].x;
    cy += pts[i].y;
  }
  cx /= ENGINE.HULL_POINTS;
  cy /= ENGINE.HULL_POINTS;
  m.center_off = Math.max(Math.abs(cx - 0.5) / ENGINE.CENTER_HALF_BOX.x, Math.abs(cy - 0.5) / ENGINE.CENTER_HALF_BOX.y);

  const pose = poseFromMatrix(subject.matrix);
  if (pose) {
    m.pitch = pose.pitch;
    m.yaw = pose.yaw;
    m.roll = pose.roll;
    m.abs_pitch = Math.abs(pose.pitch);
    m.abs_yaw = Math.abs(pose.yaw);
    m.abs_roll = Math.abs(pose.roll);
  }

  const bs = subject.blendshapes;
  if (bs) {
    let expr = 0;
    for (const [name, score] of Object.entries(bs)) {
      const counts =
        ENGINE.EXPRESSION_PREFIXES.some((p) => name.startsWith(p)) &&
        !(ENGINE.EXPRESSION_EXCLUDED as readonly string[]).includes(name);
      if (counts && score > expr) expr = score;
    }
    m.expr_max = expr;
    m.pucker_max = Math.max(...ENGINE.PUCKER_BLENDSHAPES.map((n) => bs[n] ?? 0));
    m.blink_max = Math.max(...ENGINE.BLINK_BLENDSHAPES.map((n) => bs[n] ?? 0));
  }

  if (input.pixels) {
    Object.assign(m, measurePixels(input.pixels, hull, pts[ENGINE.MIDLINE_LANDMARK].x));
  }
  return { metrics: m, subject };
}

/** qc_rules: the codes that fail, in the engine's order. */
export function qcFailures(m: LiveMetrics, thresholds: QcThresholds = QC_THRESHOLDS): LiveQcCode[] {
  if (!m.face_found) return ['tidak_ada_wajah'];
  const out: LiveQcCode[] = [];
  if (m.n_faces > 1) out.push('wajah_ganda');
  for (const [code, feature, op, key] of QC_RULES) {
    const x = m[feature];
    const t = thresholds[key];
    if (Number.isNaN(x)) continue;
    if ((op === '<' ? x < t : x > t) && !out.includes(code)) out.push(code);
  }
  return out;
}

/** Running average of every measurement, so the checks do not flicker. Restarts when the face is lost. */
export function smoothMetrics(prev: LiveMetrics | null, next: LiveMetrics, weight: number): LiveMetrics {
  if (!prev || !prev.face_found || !next.face_found) return next;
  const out = { ...next };
  for (const f of FEATURES) {
    const a = prev[f];
    const b = next[f];
    out[f] = Number.isNaN(a) || Number.isNaN(b) ? b : a + weight * (b - a);
  }
  return out;
}

// --- what the person sees -----------------------------------------------

export type CheckGroupId = 'light' | 'position' | 'pose' | 'expression';

/** The checks shown as chips, and the engine codes each one covers. */
export const CHECK_GROUPS: readonly { id: CheckGroupId; codes: readonly LiveQcCode[] }[] = [
  { id: 'light', codes: ['terlalu_gelap', 'terlalu_terang', 'cahaya_campuran'] },
  { id: 'position', codes: ['tidak_ada_wajah', 'wajah_ganda', 'wajah_kecil', 'wajah_besar', 'tidak_di_tengah'] },
  { id: 'pose', codes: ['menoleh', 'mendongak_menunduk', 'miring'] },
  { id: 'expression', codes: ['ekspresi'] },
];

/**
 * Codes that hold the capture back. Closed eyes do not: a blink is too short
 * to show, so the capture itself waits for a frame with the eyes open.
 */
export const GATING_CODES: readonly LiveQcCode[] = CHECK_GROUPS.flatMap((g) => g.codes);

/** Which advice is shown first: get into the frame, face the camera, then light and expression. */
export const ADVICE_ORDER: readonly LiveQcCode[] = [
  'tidak_ada_wajah',
  'wajah_ganda',
  'wajah_kecil',
  'wajah_besar',
  'tidak_di_tengah',
  'menoleh',
  'mendongak_menunduk',
  'miring',
  'terlalu_gelap',
  'terlalu_terang',
  'cahaya_campuran',
  'ekspresi',
];

export type CheckState = 'ok' | 'fail' | 'pending';

/** Per chip: failing, passing, or not measurable yet (no face, no pixels). */
export function checkStates(m: LiveMetrics | null, failed: readonly LiveQcCode[]): Record<CheckGroupId, CheckState> {
  const measured: Record<CheckGroupId, boolean> = {
    position: !!m,
    pose: !!m?.face_found && !Number.isNaN(m.yaw),
    light: !!m?.face_found && !Number.isNaN(m.L_med),
    expression: !!m?.face_found && !Number.isNaN(m.expr_max),
  };
  const out = {} as Record<CheckGroupId, CheckState>;
  for (const g of CHECK_GROUPS) {
    out[g.id] = !measured[g.id] ? 'pending' : g.codes.some((c) => failed.includes(c)) ? 'fail' : 'ok';
  }
  return out;
}

export function firstAdvice(failed: readonly LiveQcCode[]): LiveQcCode | null {
  return ADVICE_ORDER.find((c) => failed.includes(c)) ?? null;
}

export type LightColour = 'hangat' | 'netral' | 'sejuk';

export function lightColourOf(cct: number): LightColour | null {
  if (!Number.isFinite(cct)) return null;
  if (cct < LIGHT_COLOUR.WARM_BELOW_K) return 'hangat';
  if (cct > LIGHT_COLOUR.COOL_ABOVE_K) return 'sejuk';
  return 'netral';
}
