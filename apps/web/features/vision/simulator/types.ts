export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type ImageAngle = 'FRONT' | 'LEFT' | 'RIGHT';

export interface AngleSlot {
  angle: ImageAngle;
  file: File | null;
  previewUrl: string | null;
  status: 'empty' | 'uploading' | 'analyzed' | 'error';
}

export interface LayerHUDState {
  showZones: boolean;
  showDefectHeatmap: boolean;
}

export interface MetricValue {
  score: number;
  severity?: string;
  detectedCount?: number;
  priority?: string;
}

export interface ZoneMetrics {
  dimensions: Record<string, MetricValue>;
  skinConditions: Record<string, MetricValue>;
}

export interface ZoneDiagnosticMetric {
  zoneCode: string;
  zoneName: string;
  sourceAngle: ImageAngle;
  polygon: NormalizedPoint[];
  boundingBox: BoundingBox;
  /** False when the zone was out of frame in every image. Nothing measures
   *  occlusion, so there is no isOccluded any more, and no per-zone
   *  confidence: both were constants dressed as measurements. */
  isVisible: boolean;
  metrics: ZoneMetrics;
}

export interface StructuredWarning {
  code: string;
  zoneCode?: string;
  confidence?: number;
  message: string;
}

export interface ProcessedImageMeta {
  angle: ImageAngle;
  fileName: string;
  landmarkDetected: boolean;
}

export interface CaptureContext {
  captureMode: 'SINGLE_ANGLE' | 'MULTI_ANGLE';
  inputCount: number;
  providedAngles: ImageAngle[];
  coverageCompleteness: string;
  processedImages: ProcessedImageMeta[];
}

export interface GlobalAggregation {
  /** Null when nothing was scored — no face, or no model for the requested
   *  capabilities. It used to be 0.0, which reads as a measured zero. */
  overallSkinHealthScore: number | null;
  dimensions: Record<string, MetricValue>;
  skinConditions: Record<string, MetricValue>;
}

export interface ExecutionMetrics {
  totalLatencyMs: number;
  executedModelsCount: number;
  skippedModelsCount: number;
  executedModels: string[];
}

export interface VisionAnalysisResult {
  analysisId: string;
  brandId: string;
  applicationId: string;
  status: string;
  captureContext: CaptureContext;
  globalAggregation: GlobalAggregation;
  zoneBreakdown: ZoneDiagnosticMetric[];
  warnings: StructuredWarning[];
  executionMetrics: ExecutionMetrics;
}
