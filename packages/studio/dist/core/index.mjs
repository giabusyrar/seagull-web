// src/core/collection-resolver.ts
var cachedCollections = null;
var lastFetchedAt = 0;
var CACHE_TTL_MS = 3e4;
async function getActiveCoreCollections(collectionsPath, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedCollections && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCollections;
  }
  try {
    const res = await fetch(`${collectionsPath}?type=core`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch core collections: HTTP ${res.status}`);
    const data = await res.json();
    const cols = Array.isArray(data.collections) ? data.collections : [];
    cachedCollections = cols;
    lastFetchedAt = now;
    return cols;
  } catch (err) {
    console.warn("Dynamic collection discovery notice (using standard routing fallback):", err);
    return cachedCollections || [];
  }
}
function getCollectionPrefix(key) {
  const map = {
    form: "/core/form-engine",
    "form-engine": "/core/form-engine",
    score: "/core/score-engine",
    "score-engine": "/core/score-engine",
    match: "/core/match-engine",
    "match-engine": "/core/match-engine",
    vision: "/core/vision-engine",
    "vision-engine": "/core/vision-engine",
    reference: "/core/reference-service",
    "reference-service": "/core/reference-service",
    colour: "/core/colour-engine",
    "colour-engine": "/core/colour-engine"
  };
  return map[key] || `/core/${key}`;
}
function resolveDynamicEndpoint(key, routePattern, collections) {
  const prefix = getCollectionPrefix(key);
  const cleanPattern = routePattern.startsWith("/") ? routePattern : `/${routePattern}`;
  if (collections && collections.length > 0) {
    const matched = collections.find(
      (c) => c.originalPrefix === prefix || c.name.toLowerCase().includes(key.toLowerCase()) || c.id === key
    );
    if (matched && matched.originalPrefix) {
      return `${matched.originalPrefix}${cleanPattern}`;
    }
  }
  return `${prefix}${cleanPattern}`;
}

// src/core/scope.ts
var ALL_TENANTS = "*";
function tenantScopeQuery(brandId = ALL_TENANTS, applicationId = ALL_TENANTS) {
  return `brand_id=${encodeURIComponent(brandId || ALL_TENANTS)}&application_id=${encodeURIComponent(applicationId || ALL_TENANTS)}`;
}
function withTenantScope(path, brandId, applicationId) {
  return `${path}${path.includes("?") ? "&" : "?"}${tenantScopeQuery(brandId, applicationId)}`;
}

export { ALL_TENANTS, getActiveCoreCollections, getCollectionPrefix, resolveDynamicEndpoint, tenantScopeQuery, withTenantScope };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map