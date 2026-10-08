// Skin analysis (vision-engine analyze-image) shapes, ported loosely from
// seagull-web features/vision/simulator/types.ts. Fields may be missing.

/**
 * A raw reading the skin worker took but could not turn into a score, because
 * no calibration maps it yet (core: CAPABILITY_UNCALIBRATED). `value` is in
 * `unit`, NOT 0-100, so it is never drawn on a score scale. `proxy` says what
 * a visual stand-in really measures (e.g. firmness, dryness).
 */
export interface Measurement { value?: number; unit?: string; calibrated?: boolean; proxy?: string }

export interface MetricValue { score?: number | null; severity?: string; detectedCount?: number; priority?: string; measurement?: Measurement }

/** How one metric can honestly be shown: a score, an uncalibrated measurement, or nothing. */
export type MetricDisplay =
  | { kind: 'score'; score: number; severity?: string }
  | { kind: 'measurement'; value: number; unit: string; proxy?: string }
  | { kind: 'none' };

export function metricDisplay(m: MetricValue | undefined): MetricDisplay {
  if (typeof m?.score === 'number' && Number.isFinite(m.score)) return { kind: 'score', score: m.score, severity: m.severity };
  const v = m?.measurement;
  if (v && typeof v.value === 'number' && Number.isFinite(v.value)) {
    return { kind: 'measurement', value: v.value, unit: v.unit || '', ...(v.proxy ? { proxy: v.proxy } : {}) };
  }
  return { kind: 'none' };
}

export interface ZoneDiagnosticMetric {
  zoneCode?: string;
  zoneName?: string;
  sourceAngle?: string;
  isVisible?: boolean;
  /** Normalised 0-1 on the `sourceAngle` photo; all zero when the zone is not visible. */
  boundingBox?: { minX: number; minY: number; maxX: number; maxY: number };
  metrics?: { dimensions?: Record<string, MetricValue>; skinConditions?: Record<string, MetricValue> };
}

export interface StructuredWarning { code?: string; zoneCode?: string; message?: string }

export type ContrastBand = 'imperceptible' | 'faint' | 'clear' | 'marked';
export interface AcneLesion {
  label?: string;
  box?: { x?: number; y?: number; w?: number; h?: number };
  score?: number;
  inflammatory?: boolean;
  deltaE00?: number | null;
  deltaA?: number | null;
  deltaL?: number | null;
  contrastBand?: ContrastBand | null;
}
export interface AcneResult {
  detector?: string;
  sourceAngle?: string;
  colourCalibrated?: boolean;
  lesions?: AcneLesion[];
  hayashi?: { inflammatoryCount?: number; halfFaceCount?: number; grade?: 'mild' | 'moderate' | 'severe' | 'very_severe'; source?: string };
}

export interface VisionAnalysisResult {
  acne?: AcneResult;
  analysisId?: string;
  status?: string;
  globalAggregation?: {
    overallSkinHealthScore?: number | null;
    dimensions?: Record<string, MetricValue>;
    skinConditions?: Record<string, MetricValue>;
  };
  zoneBreakdown?: ZoneDiagnosticMetric[];
  warnings?: StructuredWarning[];
}

export const zoneMetricCount = (z: ZoneDiagnosticMetric) =>
  Object.keys(z.metrics?.dimensions ?? {}).length + Object.keys(z.metrics?.skinConditions ?? {}).length;
