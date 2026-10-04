// Where the dashboard's own engine calls (/core/*, /reference/*) go: the data
// plane of the environment selected in the UI first, then .env.
//
// The browser cannot be trusted to name a host the server will fetch, so the
// selected environment's host is only used when it is one of the hosts the
// gateway itself stores in its environments; anything else falls back to
// .env, the same as no selection.
import type { NextRequest } from 'next/server';
import { getGatewayEngineUrl, getGatewayProxyUrl } from '@/lib/config/services';
import { DATA_PLANE_COOKIE } from '@/lib/data-plane-cookie';

/** Which source chose the data plane; sent back as X-Data-Plane-Source. */
export type DataPlaneSource = 'environment' | 'env-file';

/**
 * How long the gateway's environment hosts are reused before they are read
 * again. Short, so an environment edited in the gateway takes effect quickly;
 * long enough that a page's burst of engine calls reads them once.
 */
const ENVIRONMENT_HOSTS_TTL_MS = 30_000;

let cached: { at: number; hosts: Set<string> } | null = null;

/** A host as compared: trimmed, without trailing slashes. Not a URL: null. */
export function normalizeHost(raw: string | undefined | null): string | null {
  const v = (raw || '').trim().replace(/\/+$/, '');
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? v : null;
  } catch {
    return null;
  }
}

/** The enabled `host` values of every environment, from the gateway's response. */
export function environmentHosts(json: unknown): Set<string> {
  const envs = (json as { environments?: unknown })?.environments;
  const hosts = new Set<string>();
  for (const env of Array.isArray(envs) ? envs : []) {
    const variables = (env as { variables?: unknown })?.variables;
    for (const v of Array.isArray(variables) ? variables : []) {
      const variable = v as { key?: string; value?: string; enabled?: boolean };
      if (variable?.key?.trim() !== 'host' || variable.enabled === false) continue;
      const h = normalizeHost(variable.value);
      if (h) hosts.add(h);
    }
  }
  return hosts;
}

async function gatewayEnvironmentHosts(authorization: string | undefined, fetchImpl: typeof fetch): Promise<Set<string>> {
  if (cached && Date.now() - cached.at < ENVIRONMENT_HOSTS_TTL_MS) return cached.hosts;
  try {
    const res = await fetchImpl(`${getGatewayEngineUrl()}/api/global-environments`, {
      headers: authorization ? { authorization } : {},
      cache: 'no-store',
    });
    if (!res.ok) return new Set();
    const hosts = environmentHosts(await res.json());
    cached = { at: Date.now(), hosts };
    return hosts;
  } catch {
    return new Set();
  }
}

/** For tests: forget the cached environment hosts. */
export function resetDataPlaneCache() {
  cached = null;
}

/**
 * The data plane for this request: the selected environment's host when the
 * gateway knows it, else GATEWAY_PROXY_URL from .env (or its local default).
 */
export async function resolveDataPlane(
  request: Pick<NextRequest, 'cookies'>,
  authorization: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<{ url: string; source: DataPlaneSource }> {
  const selected = normalizeHost(decodeURIComponentSafe(request.cookies.get(DATA_PLANE_COOKIE)?.value));
  if (selected && (await gatewayEnvironmentHosts(authorization, fetchImpl)).has(selected)) {
    return { url: selected, source: 'environment' };
  }
  return { url: getGatewayProxyUrl(), source: 'env-file' };
}

function decodeURIComponentSafe(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  try {
    return decodeURIComponent(v);
  } catch {
    return undefined;
  }
}
