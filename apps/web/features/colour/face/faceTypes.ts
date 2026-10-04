// Response shapes of the face-architecture endpoint
// (seagull-core docs/FACE-ARCHITECTURE.md, internal/facearch).
//
// POST /core/face-architecture/:brandId/:applicationId
// multipart field "image". Errors carry a "detail" object, or a list of
// them when the ai-worker rejected the photo on several counts.

export interface FaceQuality {
  rollDeg: number;
  yawDeg: number;
  pitchDeg: number;
  iodPx: number;
  gatesPassed: string[];
  warnings: string[];
  regionDeltaE: Record<string, number>;
}

export interface Measurement {
  key: string;
  /** A number, or a list of numbers for catalogue entries with shape "list". */
  value: number | number[] | null;
  unit: string;
  band: [number | null, number | null] | null;
  visibility: string;
  proxy: boolean;
  landmarks: number[];
  reason: string | null;
}

/** status: single | blend | insufficient_evidence | unavailable */
export interface Classification {
  status: string;
  primary?: string;
  secondary?: string;
  scores: Record<string, number>;
  notAssessable: string[];
  missingMeasurements?: string[];
  /** Measurement keys the classifier reads (profile spec). Newer engines only. */
  measurements?: string[];
  observedWeightShare?: number;
  reason?: string;
}

/** status: assessed | not_assessable | unavailable */
export interface Trait {
  status: string;
  label?: string;
  boundaryUncertain: boolean;
  alternative?: string;
  missingMeasurements?: string[];
  /** Measurement keys the trait reads (profile spec). Newer engines only. */
  measurements?: string[];
  reason?: string;
}

export interface GuidanceRegion {
  role: string;
  template: string;
  polygon: [number, number][];
  intensity: number;
  ruleId: string;
  /** primary, or secondary when matched on weaker evidence. */
  match: string;
  textKeys: string[];
  /** The rule flagged this placement as having no source. */
  placeholder?: boolean;
  /** observed only when every region behind the anchors was observed. */
  anchorVisibility: string;
  unverifiedRegions: string[];
}

export interface DroppedTemplate {
  template: string;
  ruleId: string;
  match: string;
  reason: string;
}

export interface Guidance {
  regions: GuidanceRegion[];
  droppedTemplates: DroppedTemplate[];
}

export interface CalibrationRef {
  status: string;
  benchmarkRunId?: string;
  target?: string;
}

export interface Provenance {
  model: { name: string; version: string; manifestSha256: string };
  catalogueVersion: string;
  profile: { id: string; code: string; version: number; catalogueVersion: string };
  calibration: CalibrationRef;
}

export interface FaceArchitectureResult {
  quality: FaceQuality;
  regions: Record<string, string>;
  measurements: Measurement[];
  measurementsMissing?: string[];
  classifications: Record<string, Classification>;
  traits: Record<string, Trait>;
  guidance: Guidance | null;
  provenance: Provenance;
  /**
   * The worker's landmarks in image pixels (same space as guidance
   * polygons), indexed by landmark index. Absent from engines that predate
   * the field, and null when the worker returned none — either way nothing
   * can be drawn, and nothing is estimated in its place.
   */
  landmarks?: [number, number][] | null;
}

export interface FaceApiError {
  status: number;
  code: string;
  message: string;
  /** Every detail entry, so a multi-gate rejection is not reduced to one. */
  entries: Record<string, unknown>[];
}

const CODE_NO_PROFILE = 'no_active_face_architecture_profile';

export async function readFaceApiError(res: Response): Promise<FaceApiError> {
  const text = await res.text();
  let entries: Record<string, unknown>[] = [];
  try {
    const body = JSON.parse(text);
    const detail = body?.detail;
    if (Array.isArray(detail)) entries = detail.filter((d) => d && typeof d === 'object');
    else if (detail && typeof detail === 'object') entries = [detail];
  } catch {
    // Not JSON: keep the body as the message and claim no code.
  }
  const first = entries[0] || {};
  return {
    status: res.status,
    code: typeof first.code === 'string' ? first.code : '',
    message: typeof first.reason === 'string' ? first.reason : entries.length ? '' : text,
    entries,
  };
}

/**
 * User-facing text per error. The wording separates what the person can act
 * on (the photo) from what only an operator can (no profile, model down).
 */
export function faceErrorText(err: FaceApiError): string {
  switch (err.code) {
    case CODE_NO_PROFILE:
      return 'Analisis bentuk wajah belum dikonfigurasi untuk brand dan aplikasi ini. Aktifkan profilnya lebih dulu di core-engine.';
    case 'quality_gate_failed':
      return 'Foto belum memenuhi syarat pengukuran. Coba foto ulang: wajah lurus ke kamera, cahaya rata, tanpa bagian yang tertutup.';
    case 'face_count':
    case 'no_face_detected':
      return 'Wajah tidak terdeteksi dengan jelas, atau ada lebih dari satu wajah. Foto sendiri dengan seluruh wajah masuk bingkai.';
    case 'invalid_image':
    case 'missing_image':
      return 'Foto tidak terbaca. Pakai file JPEG atau PNG.';
    case 'model_unavailable':
      return 'Model pengukuran sedang tidak tersedia. Coba lagi beberapa saat lagi.';
    case 'face_measure_unreachable':
      return 'Layanan pengukuran wajah tidak dapat dihubungi.';
    case 'timeout':
      return 'Pengukuran melebihi batas waktu. Coba lagi, atau pakai foto dengan ukuran lebih kecil.';
    default:
      if (err.status === 409) return 'Analisis bentuk wajah belum dikonfigurasi untuk brand dan aplikasi ini.';
      if (err.status === 422) return 'Foto belum memenuhi syarat pengukuran. Coba foto ulang.';
      if (err.status >= 500) return 'Layanan pengukuran wajah sedang bermasalah. Coba lagi beberapa saat lagi.';
      return err.message || 'Terjadi kesalahan. Coba lagi.';
  }
}

/** A 409 has no profile to find; retrying cannot create one. */
export function isRetryable(err: FaceApiError): boolean {
  return err.status !== 409 && err.code !== CODE_NO_PROFILE;
}

export type RegionConfidence = 'verified' | 'unverified' | 'unsourced';

/**
 * How much a placed polygon can be trusted on screen. `unsourced` wins over
 * visibility: the placement itself has no source, so confirming the anchors
 * would not make it right.
 */
export function regionConfidence(r: GuidanceRegion): RegionConfidence {
  if (r.placeholder) return 'unsourced';
  if (r.anchorVisibility !== 'observed') return 'unverified';
  return r.unverifiedRegions.length === 0 ? 'verified' : 'unverified';
}

export const CLASSIFICATION_STATUS_LABEL: Record<string, string> = {
  single: 'Satu bentuk',
  blend: 'Campuran',
  insufficient_evidence: 'Bukti belum cukup',
  unavailable: 'Tidak tersedia',
};

export const TRAIT_STATUS_LABEL: Record<string, string> = {
  assessed: 'Terbaca',
  not_assessable: 'Tidak bisa dinilai',
  unavailable: 'Tidak tersedia',
};

export const REGION_CONFIDENCE_LABEL: Record<RegionConfidence, string> = {
  verified: 'Anchor terlihat',
  unverified: 'Anchor belum terkonfirmasi',
  unsourced: 'Penempatan tanpa sumber',
};

export type MeasurementGeometry =
  | { kind: 'segment'; points: [[number, number], [number, number]]; anchor: [number, number] }
  | { kind: 'angle'; points: [[number, number], [number, number], [number, number]]; anchor: [number, number] }
  | { kind: 'points'; points: [number, number][]; anchor: [number, number] };

/**
 * Where a measurement sits on the photo, from the landmark indices it used.
 * Only what the indices alone say is drawn: two points are the distance
 * between them, three points of an angle are that angle (vertex in the
 * middle). Any other set is shown as its points, unconnected — joining them
 * in list order could draw a line the definition never measured.
 *
 * null when there is nothing honest to draw: no value, no landmarks from the
 * engine, or an index it did not return.
 */
export function measurementGeometry(
  m: Measurement,
  landmarks: [number, number][] | null | undefined,
): MeasurementGeometry | null {
  if (m.value === null || !landmarks || m.landmarks.length === 0) return null;
  const points: [number, number][] = [];
  for (const i of m.landmarks) {
    const p = landmarks[i];
    if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
    points.push([p[0], p[1]]);
  }
  if (points.length === 2) {
    const [a, b] = points;
    return { kind: 'segment', points: [a, b], anchor: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
  }
  if (points.length === 3 && m.unit === 'deg') {
    const [a, v, b] = points;
    return { kind: 'angle', points: [a, v, b], anchor: v };
  }
  const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return { kind: 'points', points, anchor: [cx, cy] };
}

// Display rounding for labels on the photo only; the card lists full values.
const LABEL_DECIMALS = 2;

const UNIT_SUFFIX: Record<string, string> = { iod: ' IOD', ratio: '', deg: '°' };

export function formatMeasurementValue(m: Measurement): string {
  if (m.value === null) return '';
  const suffix = UNIT_SUFFIX[m.unit] ?? ` ${m.unit}`;
  const fmt = (v: number) => `${Number(v.toFixed(LABEL_DECIMALS))}${suffix}`;
  return Array.isArray(m.value) ? m.value.map(fmt).join(', ') : fmt(m.value);
}

export type Point = [number, number];

function centroid(points: Point[]): Point | null {
  if (points.length === 0) return null;
  return [points.reduce((a, p) => a + p[0], 0) / points.length, points.reduce((a, p) => a + p[1], 0) / points.length];
}

/**
 * Where a trait or classification belongs on the photo: the centre of the
 * landmarks behind the measurements it reads. null when the engine did not
 * say which measurements those are, or sent no landmarks — the result is
 * then listed as not placeable rather than pinned somewhere plausible.
 */
export function anchorForMeasurementKeys(
  keys: string[] | undefined,
  measurements: Measurement[],
  landmarks: Point[] | null | undefined,
): Point | null {
  if (!keys?.length || !landmarks) return null;
  const byKey = new Map(measurements.map((m) => [m.key, m]));
  const points: Point[] = [];
  for (const key of keys) {
    for (const i of byKey.get(key)?.landmarks ?? []) {
      const p = landmarks[i];
      if (p && Number.isFinite(p[0]) && Number.isFinite(p[1])) points.push([p[0], p[1]]);
    }
  }
  return centroid(points);
}

export type PinKind = 'classification' | 'trait' | 'guidance';

export interface Pin {
  id: string;
  kind: PinKind;
  /** Short text for the on-photo label. */
  label: string;
  /** Image-pixel position, or null when the result has no place on the photo. */
  anchor: Point | null;
}

/** Every result that gets an information mark, placed where the data puts it. */
export function buildPins(result: FaceArchitectureResult): Pin[] {
  const pins: Pin[] = [];
  for (const [name, c] of Object.entries(result.classifications)) {
    const assessed = c.status === 'single' || c.status === 'blend';
    pins.push({
      id: `classification:${name}`,
      kind: 'classification',
      label: assessed ? `${name}: ${c.primary}${c.secondary ? ` + ${c.secondary}` : ''}` : `${name}: ${CLASSIFICATION_STATUS_LABEL[c.status] || c.status}`,
      anchor: anchorForMeasurementKeys(c.measurements, result.measurements, result.landmarks),
    });
  }
  for (const [name, t] of Object.entries(result.traits)) {
    pins.push({
      id: `trait:${name}`,
      kind: 'trait',
      label: `${name}: ${t.label || TRAIT_STATUS_LABEL[t.status] || t.status}`,
      anchor: anchorForMeasurementKeys(t.measurements, result.measurements, result.landmarks),
    });
  }
  (result.guidance?.regions ?? []).forEach((r, i) => {
    pins.push({ id: `guidance:${i}`, kind: 'guidance', label: `${r.role} · ${r.template}`, anchor: centroid(r.polygon) });
  });
  return pins;
}
