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

// reference-service is not addressed directly any more: the dashboard reaches
// it through the gateway's /reference collection (lib/proxy-handler.ts), which
// is also what carries the data-plane key. There is no REFERENCE_SERVICE_URL
// left to resolve.
