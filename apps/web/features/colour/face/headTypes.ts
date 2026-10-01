// The 3D head: a GLB from
// POST /core/vision-engine/face-architecture/:brandId/:applicationId/head
// (Seagull-core docs/superpowers/specs/2026-10-01-3d-head-fit-phase2-design.md).
// Multipart "front" (required), "left", "right" (three-quarter views,
// optional). asset.extras is the HeadReport below, whose source is the Go
// struct HeadReport in seagull-core apps/core-engine/internal/facearch/headreport.go.
//
// The head is a visualisation. The 2D measurements stay the source of truth;
// nothing is measured from it.

import type { FaceApiError } from './faceTypes';

export type HeadViewName = 'front' | 'left' | 'right';
export const HEAD_VIEWS: HeadViewName[] = ['front', 'left', 'right'];

export interface HeadView {
  name: HeadViewName;
  yawDeg: number;
  pitchDeg: number;
  rollDeg: number;
  /** Normalised landmark error of the fit in this view; a gross-failure gate only. */
  nme: number;
  focalPx: number;
  /** Keyed by MediaPipe index; iris points are absent, never zero-filled. */
  residualsPx: Record<string, number>;
}

export interface HeadReport {
  kind: 'fitted';
  model: { name: string; version: string; sha256: string };
  correspondence: { version: number; sha256: string };
  /** fovSource: "estimated", or "prior_dominated" (always for one view). */
  camera: { fovDeg: number; fovSdDeg: number; fovSource: string; priorDeg: number; priorLogSd: number };
  views: HeadView[];
  nmeLimit: number;
  /** Null for a front-only request. Report-only, never a rejection. */
  viewConsistency: { rmsMm: number | null; thresholdMm: number | null; flag: string } | null;
  shapeEvidence: { effectiveComponents: number; distanceFromMean: number };
  /** "model_lower_bound": _SIGMA_MM is at least this uncertain, not an interval. */
  sigmaKind: string;
  components: { identity: number; lowerFace: number; eye: number };
  /**
   * 468 × [v0, v1, v2, w0, w1, w2], dense in MediaPipe order. The v are GNM
   * model vertex indices, NOT indices into the GLB's re-indexed primitives,
   * so the web cannot place a landmark from these alone.
   */
  landmarkVertices: number[][];
  /**
   * 468 × [x, y, z] in the GLB's mesh space (metres), dense in MediaPipe
   * order: each landmark's point on the fitted head. Requested from
   * Seagull-core; absent from heads built before it — markers are then not
   * drawn on the head.
   */
  landmarkPoints?: [number, number, number][];
  observedBits: Record<string, number>;
  /** The photo segmenter behind _OBSERVED (realism A); absent from older heads. */
  segmenter?: { name: string; version: string; sha256: string };
  /** Per GLB part: textured, and whether any of it was observed from a photo (realism A). */
  parts?: { name: string; textured: boolean; observedFromPhoto: boolean }[];
  notice: string;
}

export const HEAD_VIEW_LABEL: Record<HeadViewName, string> = {
  front: 'Depan',
  left: 'Samping kiri',
  right: 'Samping kanan',
};

const VIEW_REASON: Record<string, string> = {
  no_face: 'wajah tidak terdeteksi',
  multiple_faces: 'ada lebih dari satu wajah',
  yaw_out_of_range: 'sudut wajah di luar rentang (depan: lurus ke kamera; samping: menoleh sebagian, bukan profil penuh)',
  wrong_side: 'menoleh ke arah yang salah untuk sisi ini',
  empty_image: 'file kosong',
  unreadable_image: 'foto tidak terbaca',
  missing_image: 'foto belum ada',
};

/**
 * User-facing text per error. Separates what the person can fix (a photo)
 * from what only an operator can (policy env, model file, worker down).
 */
export function headErrorText(err: FaceApiError): string {
  const view = err.entries[0]?.view as HeadViewName | undefined;
  const which = view && HEAD_VIEW_LABEL[view] ? `Foto ${HEAD_VIEW_LABEL[view].toLowerCase()}: ` : '';
  if (VIEW_REASON[err.code]) return `${which}${VIEW_REASON[err.code]}.`;
  switch (err.code) {
    case 'missing_front':
      return 'Foto depan wajib ada.';
    case 'upload_too_large':
      return 'Ukuran foto terlalu besar. Pakai foto yang lebih kecil.';
    case 'fit_rejected':
    case 'fit_failed':
      return 'Model kepala tidak cocok dengan titik wajah di foto. Coba foto ulang dengan wajah lebih jelas dan cahaya rata.';
    case 'fov_prior_unconfigured':
    case 'fit_threshold_unconfigured':
    case 'prior_scale_invalid':
      return 'Kepala 3D belum dikonfigurasi di deployment ini (policy env face worker belum diisi).';
    case 'head_model_unavailable':
      return 'File model kepala 3D belum tersedia di server.';
    case 'face_head_timeout':
      return 'Pembuatan kepala 3D melebihi batas waktu. Coba lagi.';
    case 'face_head_unreachable':
      return 'Layanan kepala 3D tidak dapat dihubungi.';
    case 'no_active_face_architecture_profile':
      return 'Analisis bentuk wajah belum dikonfigurasi untuk brand dan aplikasi ini.';
    default:
      if (err.status === 404) return 'Endpoint kepala 3D belum tersedia di server ini.';
      if (err.status >= 500) return 'Layanan kepala 3D sedang bermasalah. Coba lagi beberapa saat lagi.';
      return err.message || 'Terjadi kesalahan saat membuat kepala 3D.';
  }
}
