/**
 * Dynamic API Gateway Core Collection Resolver
 * Parameterizes all frontend interactive studios, Try-On features, runners,
 * and simulators via dynamic collections registered in the API Gateway.
 */

export type CoreCollectionKey =
  | 'form'
  | 'score'
  | 'match'
  | 'vision'
  | 'reference'
  | 'form-engine'
  | 'score-engine'
  | 'match-engine'
  | 'vision-engine'
  | 'reference-service'
  | 'colour'
  | 'colour-engine';

export interface DynamicCollectionRoute {
  id?: string;
  name: string;
  method: string;
  originalPattern: string;
}

export interface DynamicCollection {
  id: string;
  name: string;
  type: string;
  originalPrefix?: string;
  activeTargetHost?: string;
  activeEnvironmentId?: string;
  routes?: DynamicCollectionRoute[];
}

let cachedCollections: DynamicCollection[] | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 30000; // 30 seconds cache

/**
 * Fetch all active Core Collections from the API Gateway database
 */
export async function getActiveCoreCollections(forceRefresh = false): Promise<DynamicCollection[]> {
  const now = Date.now();
  if (!forceRefresh && cachedCollections && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCollections;
  }

  try {
    const res = await fetch('/api/collections?type=core', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch core collections: HTTP ${res.status}`);
    const data = await res.json();
    const cols = Array.isArray(data.collections) ? data.collections : [];
    cachedCollections = cols;
    lastFetchedAt = now;
    return cols;
  } catch (err) {
    console.warn('Dynamic collection discovery notice (using standard routing fallback):', err);
    return cachedCollections || [];
  }
}

/**
 * Normalizes a collection key into standard original prefix
 */
export function getCollectionPrefix(key: CoreCollectionKey): string {
  const map: Record<string, string> = {
    form: '/core/form-engine',
    'form-engine': '/core/form-engine',
    score: '/core/score-engine',
    'score-engine': '/core/score-engine',
    match: '/core/match-engine',
    'match-engine': '/core/match-engine',
    vision: '/core/vision-engine',
    'vision-engine': '/core/vision-engine',
    reference: '/core/reference-service',
    'reference-service': '/core/reference-service',
    colour: '/core/colour-engine',
    'colour-engine': '/core/colour-engine',
  };
  return map[key] || `/core/${key}`;
}

/**
 * Resolves a dynamic endpoint path for a given Core Collection and Route
 */
export function resolveDynamicEndpoint(
  key: CoreCollectionKey,
  routePattern: string,
  collections?: DynamicCollection[]
): string {
  const prefix = getCollectionPrefix(key);
  const cleanPattern = routePattern.startsWith('/') ? routePattern : `/${routePattern}`;

  // If collections are provided, check if a custom originalPrefix or activeTargetHost is registered
  if (collections && collections.length > 0) {
    const matched = collections.find(
      (c) =>
        c.originalPrefix === prefix ||
        c.name.toLowerCase().includes(key.toLowerCase()) ||
        c.id === key
    );
    if (matched && matched.originalPrefix) {
      return `${matched.originalPrefix}${cleanPattern}`;
    }
  }

  return `${prefix}${cleanPattern}`;
}
