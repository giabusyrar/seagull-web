// Skin analysis (vision-engine analyze-image) shapes, ported loosely from
// seagull-web features/vision/simulator/types.ts. Fields may be missing.

export interface MetricValue { score?: number; severity?: string; detectedCount?: number; priority?: string }

export interface ZoneDiagnosticMetric {
  zoneCode?: string;
  zoneName?: string;
  sourceAngle?: string;
  isVisible?: boolean;
  metrics?: { dimensions?: Record<string, MetricValue>; skinConditions?: Record<string, MetricValue> };
}

export interface StructuredWarning { code?: string; zoneCode?: string; message?: string }

export interface VisionAnalysisResult {
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
