// Response shapes of the face-architecture endpoint
// (seagull-core docs/FACE-ARCHITECTURE.md, internal/facearch).
//
// POST /core/vision-engine/face-architecture/:brandId/:applicationId
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
  value: number | null;
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
