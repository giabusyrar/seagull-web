import findMyWay from 'find-my-way';
import { apiClient } from './api-client';
import Redis from 'ioredis';

export interface RouteMatch {
  routeId?: string;
  collectionId: string;
  method: string;
  groupId: string | null;
  targetHost: string;
  originalPattern: string;
  targetPattern: string | null;
  healthCheckPath: string;
  status: string;
}

let routerInstance = findMyWay();
let isInitialized = false;

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;

function methodsFor(method: string) {
  return method === 'ANY' ? [...METHODS] : [method.toUpperCase() as (typeof METHODS)[number]];
}

function buildPattern(prefix: string | null, originalPattern: string): string {
  let cleanPrefix = (prefix || '').trim().replace(/\/+$/, '');
  if (cleanPrefix && !cleanPrefix.startsWith('/')) {
    cleanPrefix = '/' + cleanPrefix;
  }
  const cleanPattern = (originalPattern || '').trim().replace(/^\/+/, '');
  const rawPath = cleanPrefix ? `${cleanPrefix}/${cleanPattern}` : `/${cleanPattern}`;
  return rawPath.replace(/\[([^\]]+)\]/g, ':$1');
}

export async function rebuildRouter() {
  console.log('Rebuilding routing table...');
  const newRouter = findMyWay();

  try {
    const collections = await apiClient.collections.list();
    let registeredCount = 0;

    for (const collection of collections || []) {
      if (collection.type !== 'proxy' && collection.type !== 'core-engine') continue;

      const targetHost = collection.environments?.find(
        (e: any) => e.id === collection.activeEnvironmentId
      )?.targetHost;

      if (!targetHost) continue;

      for (const route of collection.routes || []) {
        const finalPattern = buildPattern(collection.originalPrefix || null, route.originalPattern);

        const store: RouteMatch = {
          routeId: route.id,
          collectionId: collection.id,
          method: route.method,
          groupId: route.groupId || null,
          targetHost,
          originalPattern: route.originalPattern,
          targetPattern: route.targetPattern || null,
          healthCheckPath: collection.healthCheckPath || '',
          status: collection.status || 'healthy',
        };

        try {
          newRouter.on(methodsFor(route.method), finalPattern, () => {}, store);
          registeredCount++;
        } catch (err) {
          console.error(`Failed to register route "${finalPattern}":`, err);
        }
      }
    }

    routerInstance = newRouter;
    isInitialized = true;
    console.log(`Router rebuilt. Registered ${registeredCount} route(s).`);

    if (process.env.REDIS_URL) {
      try {
        const redis = new Redis(process.env.REDIS_URL, {
          connectTimeout: 5000,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          retryStrategy: (times) => (times > 2 ? null : 100),
        });
        await redis.connect().catch(() => {});
        if (redis.status === 'ready' || redis.status === 'connecting') {
          await redis.publish('gateway:cache_invalidation', JSON.stringify({ type: 'router', action: 'rebuild' })).catch(() => {});
          await redis.quit().catch(() => {});
        }
      } catch (err) {
        console.error('Failed to publish router rebuild event to Redis:', err);
      }
    }
  } catch (err) {
    console.error('Error rebuilding router:', err);
  }
}

export async function ensureRouterInitialized() {
  if (!isInitialized) {
    await rebuildRouter();
  }
}

export async function validateRoutePattern(
  candidatePatterns: { method: string; pattern: string }[],
  _excludeRouteIds?: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const testRouter = findMyWay();

  for (const { method, pattern } of candidatePatterns) {
    const formattedPattern = pattern.replace(/\[([^\]]+)\]/g, ':$1');
    try {
      testRouter.on(methodsFor(method), formattedPattern, () => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'conflicts with an existing registration';
      return { ok: false, error: `"${pattern}": ${message}` };
    }
  }

  return { ok: true };
}

export function matchRoute(method: string, path: string) {
  const match = routerInstance.find(method as findMyWay.HTTPMethod, path);
  if (!match) return null;
  return {
    route: match.store as RouteMatch,
    params: match.params,
  };
}
