import type { Bilingual } from '../i18n';
// Face-architecture response shapes, ported loosely from seagull-web
// features/colour/face/faceTypes.ts. Fields may be missing.

export interface FaceQuality { rollDeg?: number; yawDeg?: number; pitchDeg?: number; iodPx?: number; gatesPassed?: string[]; warnings?: string[] }

export interface Measurement {
  key: string;
  value?: number | number[] | null;
  unit?: string;
  band?: [number | null, number | null] | null;
  visibility?: string;
  /** Indices into the result's `landmarks` that this measurement spans. */
  landmarks?: number[];
  reason?: string | null;
}

export interface Classification { status?: string; primary?: string; secondary?: string; scores?: Record<string, number>; reason?: string }

/** measurements: the keys the trait was read from (core facearch/traits); missingMeasurements: those it needed but did not get. */
export interface Trait { status?: string; label?: string; alternative?: string; boundaryUncertain?: boolean; reason?: string; measurements?: string[]; missingMeasurements?: string[] }

export interface FaceArchitectureResult {
  quality?: FaceQuality;
  measurements?: Measurement[];
  measurementsMissing?: string[];
  classifications?: Record<string, Classification>;
  traits?: Record<string, Trait>;
  /**
   * Proportion guides in the same pixels as `landmarks` (core facearch/guides.go): the face oval and
   * lines keyed midline, thirds.glabella/subnasale/menton, hairline.estimate, fifths.0..5. null
   * without landmarks or a usable midline. `estimate`: placed by a profile factor, not found;
   * `unverified`: built from landmarks core could not verify.
   */
  guides?: { faceOval?: [number, number][]; lines?: { key: string; from: [number, number]; to: [number, number]; landmarks?: number[]; estimate?: boolean; unverified?: boolean }[] } | null;
  /** The 478-point mesh, [x, y] in pixels of the uploaded photo; null when core could not return all of it. */
  landmarks?: [number, number][] | null;
}

export const CLASSIFICATION_STATUS_LABEL: Bilingual = {
  en: { single: 'Single shape', blend: 'Blend', insufficient_evidence: 'Not enough evidence', unavailable: 'Unavailable' },
  id: { single: 'Satu bentuk', blend: 'Campuran', insufficient_evidence: 'Bukti belum cukup', unavailable: 'Tidak tersedia' },
};

export const TRAIT_STATUS_LABEL: Bilingual = {
  en: { assessed: 'Assessed', not_assessable: 'Not assessable', unavailable: 'Unavailable' },
  id: { assessed: 'Terbaca', not_assessable: 'Tidak bisa dinilai', unavailable: 'Tidak tersedia' },
};

/** Rejection details: core sends `detail` as one object or a list (one per failed gate). */
export function errorEntries(body: unknown): Record<string, unknown>[] {
  const detail = (body as { detail?: unknown } | null | undefined)?.detail;
  if (Array.isArray(detail)) return detail.filter((d): d is Record<string, unknown> => !!d && typeof d === 'object');
  if (detail && typeof detail === 'object') return [detail as Record<string, unknown>];
  return [];
}
