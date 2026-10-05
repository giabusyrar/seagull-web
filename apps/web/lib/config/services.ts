// Centralized Service URL Configuration Resolver
// Single source of truth for all frontend backend service URL resolution.

/**
 * The data plane's local port: APISIX (docs/PORTS.md). It was gateway-proxy
 * on 8080 until that was removed (2026-09-16). Deployments set
 * GATEWAY_PROXY_URL instead.
 */
export const DEFAULT_DATA_PLANE_PORT = 9080;

/** The control plane's local port: gateway-engine (docs/PORTS.md). */
export const DEFAULT_CONTROL_PLANE_PORT = 8081;

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
    `${getProtocol()}://${getBaseHost()}:${DEFAULT_CONTROL_PLANE_PORT}`;
  return normalizeUrl(rawUrl);
}

export function getGatewayProxyUrl(): string {
  const rawUrl =
    process.env.GATEWAY_PROXY_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL ||
    `${getProtocol()}://${getBaseHost()}:${DEFAULT_DATA_PLANE_PORT}`;
  return normalizeUrl(rawUrl);
}

// reference-service is not addressed directly any more: the dashboard reaches
// it through the gateway's /reference collection (lib/proxy-handler.ts), which
// is also what carries the data-plane key. There is no REFERENCE_SERVICE_URL
// left to resolve.

/**
 * The data plane as the browser addresses it — the default for an
 * environment's `host`: NEXT_PUBLIC_GATEWAY_PROXY_URL when set, else this
 * app's own origin, whose server proxy forwards to the data plane
 * (lib/proxy-handler.ts). One definition for every browser-side caller.
 */
export function browserDataPlaneHost(): string {
  return process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL || (typeof window !== 'undefined' ? window.location.origin : '');
}
