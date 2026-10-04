/**
 * Dynamic API Gateway Core Collection Resolver
 * Parameterizes all frontend interactive studios, Try-On features, runners,
 * and simulators via dynamic collections registered in the API Gateway.
 */
type CoreCollectionKey = 'form' | 'score' | 'match' | 'vision' | 'reference' | 'form-engine' | 'score-engine' | 'match-engine' | 'vision-engine' | 'reference-service' | 'colour' | 'colour-engine';
interface DynamicCollectionRoute {
    id?: string;
    name: string;
    method: string;
    originalPattern: string;
}
interface DynamicCollection {
    id: string;
    name: string;
    type: string;
    originalPrefix?: string;
    activeTargetHost?: string;
    activeEnvironmentId?: string;
    routes?: DynamicCollectionRoute[];
}
/**
 * Fetch all active Core Collections from the API Gateway database, through
 * the host app's collections route (HostRoutes.collections).
 */
declare function getActiveCoreCollections(collectionsPath: string, forceRefresh?: boolean): Promise<DynamicCollection[]>;
/**
 * Normalizes a collection key into standard original prefix
 */
declare function getCollectionPrefix(key: CoreCollectionKey): string;
/**
 * Resolves a dynamic endpoint path for a given Core Collection and Route
 */
declare function resolveDynamicEndpoint(key: CoreCollectionKey, routePattern: string, collections?: DynamicCollection[]): string;

/**
 * Tenant scope on core-engine list calls.
 *
 * `*` is core-engine's own wildcard for brand and application: a list asked
 * for `*` returns every tenant's rows (score RulesetRepo.ListRulesets, match
 * matchesScope). It is the engine's definition, not a choice made here.
 *
 * Always send the scope explicitly. A call that omits brand_id /
 * application_id gets whatever the gateway injects for the collection, and
 * that silently becomes the tenant the call runs as.
 */
declare const ALL_TENANTS = "*";
declare function tenantScopeQuery(brandId?: string, applicationId?: string): string;
/** Appends the tenant scope to a path that may already carry a query. */
declare function withTenantScope(path: string, brandId?: string, applicationId?: string): string;

export { ALL_TENANTS, type CoreCollectionKey, type DynamicCollection, type DynamicCollectionRoute, getActiveCoreCollections, getCollectionPrefix, resolveDynamicEndpoint, tenantScopeQuery, withTenantScope };
