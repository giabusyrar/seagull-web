// Centralized Service URL Configuration Resolver
// Single source of truth for all frontend backend service URL resolution.

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (typeof window === 'undefined') {
    return trimmed.replace('://localhost:', '://127.0.0.1:');
  }
  return trimmed;
}

function getBaseHost(): string {
  if (process.env.SERVICE_BASE_HOST) return process.env.SERVICE_BASE_HOST;
  if (typeof window !== 'undefined') return window.location.hostname;
  return '127.0.0.1';
}

function getProtocol(): string {
  return process.env.SERVICE_PROTOCOL || 'http';
}

export function getGatewayEngineUrl(): string {
  const rawUrl =
    process.env.GATEWAY_ENGINE_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_ENGINE_URL ||
    `${getProtocol()}://${getBaseHost()}:8081`;
  return normalizeUrl(rawUrl);
}

export function getGatewayProxyUrl(): string {
  const rawUrl =
    process.env.GATEWAY_PROXY_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL ||
    `${getProtocol()}://${getBaseHost()}:8080`;
  return normalizeUrl(rawUrl);
}

export function getReferenceServiceUrl(): string {
  const rawUrl =
    process.env.REFERENCE_SERVICE_URL ||
    `${getProtocol()}://${getBaseHost()}:8086`;
  return normalizeUrl(rawUrl);
}

/**
 * worker-skin: segment-and-pose only. It was called the "vision ai worker"
 * until Seagull-core split one worker per app; the host and port did not
 * change, but VISION_AI_WORKER_URL is no longer the service's name, and
 * core-engine now refuses to start when that variable is set.
 */
export function getSkinWorkerUrl(): string {
  const rawUrl =
    process.env.SKIN_WORKER_URL ||
    `${getProtocol()}://${getBaseHost()}:8088`;
  return normalizeUrl(rawUrl);
}

/**
 * worker-models: the model registry and ONNX capability dispatch
 * (/api/v1/models/*). It left the skin worker in Seagull-core's model-server
 * split; the routes and bodies are unchanged, only the host.
 */
export function getModelServerUrl(): string {
  const rawUrl =
    process.env.MODEL_SERVER_URL ||
    `${getProtocol()}://${getBaseHost()}:8096`;
  return normalizeUrl(rawUrl);
}

export type ServiceKey =
  | 'GATEWAY_ENGINE_URL'
  | 'GATEWAY_PROXY_URL'
  | 'REFERENCE_SERVICE_URL'
  | 'SKIN_WORKER_URL'
  | 'MODEL_SERVER_URL';

export function getServiceUrl(serviceKey: ServiceKey): string {
  switch (serviceKey) {
    case 'GATEWAY_ENGINE_URL':
      return getGatewayEngineUrl();
    case 'GATEWAY_PROXY_URL':
      return getGatewayProxyUrl();
    case 'REFERENCE_SERVICE_URL':
      return getReferenceServiceUrl();
    case 'SKIN_WORKER_URL':
      return getSkinWorkerUrl();
    case 'MODEL_SERVER_URL':
      return getModelServerUrl();
  }
}


