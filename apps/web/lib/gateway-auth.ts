import { hashApiKey, checkRateLimit } from './api-keys';
import { apiClient } from './api-client';

export interface ApiKeyRestrictionContext {
  allBrands?: boolean;
  allowedBrandIds?: string[];
  allApplications?: boolean;
  allowedAppIds?: string[];
}

export interface ResolvedApiKey extends ApiKeyRestrictionContext {
  id: string;
  allCollections: boolean;
  allowedMethods: string[] | null;
  allowedCollectionIds: string[];
  rateLimitPerMinute: number | null;
  allBrands?: boolean;
  allowedBrandIds?: string[];
  allApplications?: boolean;
  allowedAppIds?: string[];
}

export function validateApiKeyRestrictions(
  key: ApiKeyRestrictionContext,
  requestBrandId?: string | null,
  requestAppId?: string | null
): { allowed: boolean; reason?: string } {
  if (requestBrandId && key.allBrands === false) {
    const allowedList = key.allowedBrandIds || [];
    if (!allowedList.includes(requestBrandId)) {
      return { allowed: false, reason: `API key is not authorized for brand: ${requestBrandId}` };
    }
  }

  if (requestAppId && key.allApplications === false) {
    const allowedList = key.allowedAppIds || [];
    if (!allowedList.includes(requestAppId)) {
      return { allowed: false, reason: `API key is not authorized for application ID: ${requestAppId}` };
    }
  }

  return { allowed: true };
}

export function extractRestrictionsFromHeaders(headers: { get(name: string): string | null }): {
  brandId: string | null;
  appId: string | null;
} {
  const brandId = headers.get('x-brand-id') || headers.get('X-Brand-ID') || null;
  const appId =
    headers.get('x-application-id') ||
    headers.get('X-Application-ID') ||
    headers.get('x-app-id') ||
    headers.get('X-App-ID') ||
    null;
  return { brandId, appId };
}

export async function resolveApiKey(authHeader: string | null): Promise<ResolvedApiKey | null> {
  if (!authHeader) return null;
  const token = authHeader.replace(/^bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const keys = await apiClient.apiKeys.list();
    const tokenHash = hashApiKey(token);
    const record = (keys || []).find((k: any) => k.keyHash === tokenHash && k.status === 'active');
    if (!record) return null;

    const allowedCollectionIds: string[] = (record as any).allowedCollectionIds || [];
    const recordAny = record as any;

    return {
      id: record.id,
      allCollections: record.allCollections ?? true,
      allowedMethods: recordAny.allowedMethods
        ? recordAny.allowedMethods.split(',').map((m: string) => m.trim().toUpperCase())
        : null,
      allowedCollectionIds,
      rateLimitPerMinute: recordAny.rateLimitPerMinute || null,
      allBrands: recordAny.allBrands ?? true,
      allowedBrandIds: recordAny.allowedBrandIds ?? [],
      allApplications: recordAny.allApplications ?? true,
      allowedAppIds: recordAny.allowedAppIds ?? [],
    };
  } catch {
    return null;
  }
}

export function authorizeRoute(
  key: ResolvedApiKey,
  route: { collectionId: string; method: string; brandId?: string | null; appId?: string | null }
): { ok: true } | { ok: false; reason: string } {
  if (key.allowedMethods && !key.allowedMethods.includes(route.method.toUpperCase())) {
    return { ok: false, reason: 'method not allowed for this key' };
  }
  if (!key.allCollections && !key.allowedCollectionIds.includes(route.collectionId)) {
    return { ok: false, reason: 'key not granted access to this collection' };
  }
  if (route.brandId !== undefined || route.appId !== undefined) {
    const restrictionCheck = validateApiKeyRestrictions(key, route.brandId, route.appId);
    if (!restrictionCheck.allowed) {
      return { ok: false, reason: restrictionCheck.reason || 'restriction violation' };
    }
  }
  if (!checkRateLimit(key.id, key.rateLimitPerMinute)) {
    return { ok: false, reason: 'rate limit exceeded' };
  }
  return { ok: true };
}

export function authorizeCatalogRead(key: ResolvedApiKey | null): boolean {
  return key !== null;
}
