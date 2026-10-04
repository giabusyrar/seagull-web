// Face-architecture response shapes, ported loosely from seagull-web
// features/colour/face/faceTypes.ts. Fields may be missing.

export interface FaceQuality { rollDeg?: number; yawDeg?: number; pitchDeg?: number; iodPx?: number; gatesPassed?: string[]; warnings?: string[] }

export interface Measurement {
  key: string;
  value?: number | number[] | null;
  unit?: string;
  band?: [number | null, number | null] | null;
  visibility?: string;
  reason?: string | null;
}

export interface Classification { status?: string; primary?: string; secondary?: string; scores?: Record<string, number>; reason?: string }

export interface Trait { status?: string; label?: string; alternative?: string; boundaryUncertain?: boolean; reason?: string }

export interface FaceArchitectureResult {
  quality?: FaceQuality;
  measurements?: Measurement[];
  measurementsMissing?: string[];
  classifications?: Record<string, Classification>;
  traits?: Record<string, Trait>;
}

export const CLASSIFICATION_STATUS_LABEL: Record<string, string> = {
  single: 'Satu bentuk', blend: 'Campuran', insufficient_evidence: 'Bukti belum cukup', unavailable: 'Tidak tersedia',
};

export const TRAIT_STATUS_LABEL: Record<string, string> = {
  assessed: 'Terbaca', not_assessable: 'Tidak bisa dinilai', unavailable: 'Tidak tersedia',
};

/** Rejection details: core sends `detail` as one object or a list (one per failed gate). */
export function errorEntries(body: unknown): Record<string, unknown>[] {
  const detail = (body as { detail?: unknown } | null | undefined)?.detail;
  if (Array.isArray(detail)) return detail.filter((d): d is Record<string, unknown> => !!d && typeof d === 'object');
  if (detail && typeof detail === 'object') return [detail as Record<string, unknown>];
  return [];
}
