import type { OperationId } from '../client/operations';

// Each default is the core-engine timeout for the work behind the operation
// (Seagull-core apps/core-engine/internal/config/config.go) plus a margin, so
// core's own error body arrives instead of being cut off by the proxy.
const MARGIN_MS = 5_000;
const CORE_FACE_MEASURE_MS = 20_000; // DefaultFaceMeasureTimeout
const CORE_FACE_HEAD_MS = 30_000; // DefaultFaceHeadTimeout
const CORE_COLOUR_WORKER_MS = 60_000; // DefaultColourWorkerTimeout
const CORE_VISION_DAG_MS = 30_000; // DefaultVisionDAGTimeout

/** For operations with no core-engine timeout to derive from (reference
 *  reads). A proxy-side choice,
 *  overridable per operation. */
export const DEFAULT_PROXY_TIMEOUT_MS = 15_000;

export const OPERATION_TIMEOUT_MS: Record<OperationId, number> = {
  'colour.analyze': CORE_COLOUR_WORKER_MS + MARGIN_MS,
  'colour.tryOn': CORE_COLOUR_WORKER_MS + MARGIN_MS,
  'colour.catalog': CORE_COLOUR_WORKER_MS + MARGIN_MS,
  'face.analyze': CORE_FACE_MEASURE_MS + MARGIN_MS,
  'face.head': CORE_FACE_HEAD_MS + MARGIN_MS,
  'skin.analyze': CORE_VISION_DAG_MS + MARGIN_MS,
  'reference.brands': DEFAULT_PROXY_TIMEOUT_MS,
  'reference.products': DEFAULT_PROXY_TIMEOUT_MS,
};
