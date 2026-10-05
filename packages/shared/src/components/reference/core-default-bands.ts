// The bands core-engine applies to a ruleset that sets none of its own
// (seagull-core apps/core-engine/internal/score/service/score_service.go:
// defaultScoreRangeBands, defaultSeverityBands). Mirrored here, once, so an
// editor can SHOW what applies; never written into a ruleset on its behalf —
// a ruleset that sets no bands keeps getting core's, and one that sets them is
// the authority. Health-oriented: a score up to `max` gets `label`.

export interface CoreBand {
  max: number;
  label: string;
}

/** Score Range: a coarse 3-bucket collapse of the Severity Level scale. */
export const CORE_DEFAULT_SCORE_RANGE_BANDS: readonly CoreBand[] = [
  { max: 40, label: 'Perlu Perhatian Khusus' },
  { max: 60, label: 'Sedang' },
  { max: 100, label: 'Optimal' },
];

/** Severity Level: the clinical 5-level scale (Scoring Method doc). */
export const CORE_DEFAULT_SEVERITY_BANDS: readonly CoreBand[] = [
  { max: 20, label: 'Sangat Parah' },
  { max: 40, label: 'Parah' },
  { max: 60, label: 'Sedang' },
  { max: 80, label: 'Ringan' },
  { max: 100, label: 'Sehat' },
];
