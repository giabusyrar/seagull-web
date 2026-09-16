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

export function getCoreEngineUrl(): string {
  const rawUrl =
    process.env.CORE_ENGINE_URL ||
    `${getProtocol()}://${getBaseHost()}:8082`;
  return normalizeUrl(rawUrl);
}

export function getReferenceServiceUrl(): string {
  const rawUrl =
    process.env.REFERENCE_SERVICE_URL ||
    `${getProtocol()}://${getBaseHost()}:8086`;
  return normalizeUrl(rawUrl);
}

export function getVisionAiWorkerUrl(): string {
  const rawUrl =
    process.env.VISION_AI_WORKER_URL ||
    `${getProtocol()}://${getBaseHost()}:8088`;
  return normalizeUrl(rawUrl);
}

export type ServiceKey =
  | 'GATEWAY_ENGINE_URL'
  | 'GATEWAY_PROXY_URL'
  | 'CORE_ENGINE_URL'
  | 'REFERENCE_SERVICE_URL'
  | 'VISION_AI_WORKER_URL';

export function getServiceUrl(serviceKey: ServiceKey): string {
  switch (serviceKey) {
    case 'GATEWAY_ENGINE_URL':
      return getGatewayEngineUrl();
    case 'GATEWAY_PROXY_URL':
      return getGatewayProxyUrl();
    case 'REFERENCE_SERVICE_URL':
      return getReferenceServiceUrl();
    case 'VISION_AI_WORKER_URL':
      return getVisionAiWorkerUrl();
    case 'CORE_ENGINE_URL':
    default:
      return getCoreEngineUrl();
  }
}


