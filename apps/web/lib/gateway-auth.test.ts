import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashApiKey, _resetRateLimitStateForTests } from './api-keys';

vi.mock('./api-client', () => ({
  apiClient: {
    apiKeys: {
      list: vi.fn(),
    },
  },
}));

import { apiClient } from './api-client';
import {
  resolveApiKey,
  authorizeRoute,
  authorizeCatalogRead,
  validateApiKeyRestrictions,
  extractRestrictionsFromHeaders,
} from './gateway-auth';

describe('resolveApiKey', () => {
  beforeEach(() => {
    vi.mocked(apiClient.apiKeys.list).mockReset();
  });

  it('returns null when there is no auth header', async () => {
    expect(await resolveApiKey(null)).toBeNull();
  });

  it('returns null when no active key matches the hash', async () => {
    vi.mocked(apiClient.apiKeys.list).mockResolvedValue([]);
    expect(await resolveApiKey('Bearer wpk_unknown')).toBeNull();
  });

  it('resolves a matching key with allCollections=true and no method restriction', async () => {
    vi.mocked(apiClient.apiKeys.list).mockResolvedValue([
      {
        id: 'key-1',
        keyHash: hashApiKey('wpk_valid'),
        status: 'active',
        allCollections: true,
        allowedMethods: null,
        rateLimitPerMinute: 100,
      } as any,
    ]);

    const resolved = await resolveApiKey('Bearer wpk_valid');
    expect(resolved).toEqual({
      id: 'key-1',
      allCollections: true,
      allowedMethods: null,
      allowedCollectionIds: [],
      rateLimitPerMinute: 100,
      allBrands: true,
      allowedBrandIds: [],
      allApplications: true,
      allowedAppIds: [],
    });
  });

  it('parses a comma-separated allowedMethods string', async () => {
    vi.mocked(apiClient.apiKeys.list).mockResolvedValue([
      {
        id: 'key-2',
        keyHash: hashApiKey('wpk_valid'),
        status: 'active',
        allCollections: true,
        allowedMethods: 'get, post',
        rateLimitPerMinute: null,
      } as any,
    ]);

    const resolved = await resolveApiKey('Bearer wpk_valid');
    expect(resolved?.allowedMethods).toEqual(['GET', 'POST']);
  });

  it('fetches scoped collection ids when allCollections=false', async () => {
    vi.mocked(apiClient.apiKeys.list).mockResolvedValue([
      {
        id: 'key-3',
        keyHash: hashApiKey('wpk_valid'),
        status: 'active',
        allCollections: false,
        allowedMethods: null,
        allowedCollectionIds: ['col-a', 'col-b'],
        rateLimitPerMinute: null,
      } as any,
    ]);

    const resolved = await resolveApiKey('Bearer wpk_valid');
    expect(resolved?.allowedCollectionIds).toEqual(['col-a', 'col-b']);
  });
});

describe('authorizeRoute', () => {
  beforeEach(() => {
    _resetRateLimitStateForTests();
  });

  const baseKey = {
    id: 'key-1',
    allCollections: true,
    allowedMethods: null as string[] | null,
    allowedCollectionIds: [] as string[],
    rateLimitPerMinute: null as number | null,
    allBrands: true,
    allowedBrandIds: [] as string[],
    allApplications: true,
    allowedAppIds: [] as string[],
  };

  it('accepts any collection when allCollections=true', () => {
    const result = authorizeRoute(baseKey, { collectionId: 'col-1', method: 'GET' });
    expect(result.ok).toBe(true);
  });

  it('rejects when the method is not in allowedMethods', () => {
    const key = { ...baseKey, allowedMethods: ['GET'] };
    const result = authorizeRoute(key, { collectionId: 'col-1', method: 'POST' });
    expect(result.ok).toBe(false);
  });

  it('accepts when the method is in allowedMethods', () => {
    const key = { ...baseKey, allowedMethods: ['GET'] };
    const result = authorizeRoute(key, { collectionId: 'col-1', method: 'GET' });
    expect(result.ok).toBe(true);
  });

  it('rejects when allCollections=false and the collection is not in scope', () => {
    const key = { ...baseKey, allCollections: false, allowedCollectionIds: ['col-a'] };
    const result = authorizeRoute(key, { collectionId: 'col-b', method: 'GET' });
    expect(result.ok).toBe(false);
  });

  it('accepts when allCollections=false and the collection is in scope', () => {
    const key = { ...baseKey, allCollections: false, allowedCollectionIds: ['col-a'] };
    const result = authorizeRoute(key, { collectionId: 'col-a', method: 'GET' });
    expect(result.ok).toBe(true);
  });

  it('rejects when brandId restriction is violated', () => {
    const key = { ...baseKey, allBrands: false, allowedBrandIds: ['brand-1'] };
    const result = authorizeRoute(key, { collectionId: 'col-1', method: 'GET', brandId: 'brand-2' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('brand');
    }
  });

  it('accepts when brandId restriction matches allowedBrandIds', () => {
    const key = { ...baseKey, allBrands: false, allowedBrandIds: ['brand-1'] };
    const result = authorizeRoute(key, { collectionId: 'col-1', method: 'GET', brandId: 'brand-1' });
    expect(result.ok).toBe(true);
  });

  it('rejects when appId restriction is violated', () => {
    const key = { ...baseKey, allApplications: false, allowedAppIds: ['app-1'] };
    const result = authorizeRoute(key, { collectionId: 'col-1', method: 'GET', appId: 'app-2' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('application');
    }
  });

  it('accepts when appId restriction matches allowedAppIds', () => {
    const key = { ...baseKey, allApplications: false, allowedAppIds: ['app-1'] };
    const result = authorizeRoute(key, { collectionId: 'col-1', method: 'GET', appId: 'app-1' });
    expect(result.ok).toBe(true);
  });

  it('rejects once the rate limit is exceeded', () => {
    const key = { ...baseKey, rateLimitPerMinute: 1 };
    const route = { collectionId: 'col-1', method: 'GET' };
    expect(authorizeRoute(key, route).ok).toBe(true);
    expect(authorizeRoute(key, route).ok).toBe(false);
  });
});

describe('authorizeCatalogRead', () => {
  it('accepts any resolved key', () => {
    expect(
      authorizeCatalogRead({
        id: 'k',
        allCollections: true,
        allowedMethods: null,
        allowedCollectionIds: [],
        rateLimitPerMinute: null,
      })
    ).toBe(true);
  });

  it('rejects a null key', () => {
    expect(authorizeCatalogRead(null)).toBe(false);
  });
});

describe('validateApiKeyRestrictions', () => {
  it('should allow request when key has allBrands and allApplications set to true', () => {
    const key = {
      allBrands: true,
      allowedBrandIds: [],
      allApplications: true,
      allowedAppIds: [],
    };
    const result = validateApiKeyRestrictions(key, 'brand-1', 'app-1');
    expect(result.allowed).toBe(true);
  });

  it('should reject request when brand is not in allowedBrandIds', () => {
    const key = {
      allBrands: false,
      allowedBrandIds: ['brand-a'],
      allApplications: true,
      allowedAppIds: [],
    };
    const result = validateApiKeyRestrictions(key, 'brand-b', null);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('brand');
    expect(result.reason).toBe('API key is not authorized for brand: brand-b');
  });

  it('should allow request when brand is in allowedBrandIds', () => {
    const key = {
      allBrands: false,
      allowedBrandIds: ['brand-a', 'brand-b'],
      allApplications: true,
      allowedAppIds: [],
    };
    const result = validateApiKeyRestrictions(key, 'brand-a', null);
    expect(result.allowed).toBe(true);
  });

  it('should reject request when app ID is not in allowedAppIds', () => {
    const key = {
      allBrands: true,
      allowedBrandIds: [],
      allApplications: false,
      allowedAppIds: ['app-x'],
    };
    const result = validateApiKeyRestrictions(key, null, 'app-y');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('application');
    expect(result.reason).toBe('API key is not authorized for application ID: app-y');
  });

  it('should allow request when app ID is in allowedAppIds', () => {
    const key = {
      allBrands: true,
      allowedBrandIds: [],
      allApplications: false,
      allowedAppIds: ['app-x', 'app-y'],
    };
    const result = validateApiKeyRestrictions(key, null, 'app-x');
    expect(result.allowed).toBe(true);
  });

  it('should allow request when brandId and appId are omitted even if restrictions exist', () => {
    const key = {
      allBrands: false,
      allowedBrandIds: ['brand-a'],
      allApplications: false,
      allowedAppIds: ['app-x'],
    };
    const result = validateApiKeyRestrictions(key, null, null);
    expect(result.allowed).toBe(true);
  });

  it('should reject if either brand or app restriction fails when both are configured', () => {
    const key = {
      allBrands: false,
      allowedBrandIds: ['brand-a'],
      allApplications: false,
      allowedAppIds: ['app-x'],
    };

    // Valid brand, invalid app
    const res1 = validateApiKeyRestrictions(key, 'brand-a', 'app-z');
    expect(res1.allowed).toBe(false);
    expect(res1.reason).toBe('API key is not authorized for application ID: app-z');

    // Invalid brand, valid app
    const res2 = validateApiKeyRestrictions(key, 'brand-z', 'app-x');
    expect(res2.allowed).toBe(false);
    expect(res2.reason).toBe('API key is not authorized for brand: brand-z');

    // Both valid
    const res3 = validateApiKeyRestrictions(key, 'brand-a', 'app-x');
    expect(res3.allowed).toBe(true);
  });

  it('should handle undefined allowedBrandIds and allowedAppIds arrays gracefully', () => {
    const key = {
      allBrands: false,
      allApplications: false,
    };
    const resBrand = validateApiKeyRestrictions(key, 'brand-1', null);
    expect(resBrand.allowed).toBe(false);

    const resApp = validateApiKeyRestrictions(key, null, 'app-1');
    expect(resApp.allowed).toBe(false);
  });
});

describe('extractRestrictionsFromHeaders', () => {
  it('extracts brandId and appId from standard headers', () => {
    const headers = new Map<string, string>([
      ['x-brand-id', 'wardah'],
      ['x-application-id', 'pos-app'],
    ]);
    const extracted = extractRestrictionsFromHeaders({
      get: (k: string) => headers.get(k.toLowerCase()) ?? null,
    });
    expect(extracted).toEqual({
      brandId: 'wardah',
      appId: 'pos-app',
    });
  });

  it('extracts appId from alternative X-App-ID header', () => {
    const headers = new Map<string, string>([
      ['x-brand-id', 'makeover'],
      ['x-app-id', 'mobile-checkout'],
    ]);
    const extracted = extractRestrictionsFromHeaders({
      get: (k: string) => headers.get(k.toLowerCase()) ?? null,
    });
    expect(extracted).toEqual({
      brandId: 'makeover',
      appId: 'mobile-checkout',
    });
  });

  it('returns nulls when headers are missing', () => {
    const headers = new Map<string, string>();
    const extracted = extractRestrictionsFromHeaders({
      get: (k: string) => headers.get(k.toLowerCase()) ?? null,
    });
    expect(extracted).toEqual({
      brandId: null,
      appId: null,
    });
  });
});
