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
export const ALL_TENANTS = '*';

export function tenantScopeQuery(brandId: string = ALL_TENANTS, applicationId: string = ALL_TENANTS): string {
  return `brand_id=${encodeURIComponent(brandId || ALL_TENANTS)}&application_id=${encodeURIComponent(applicationId || ALL_TENANTS)}`;
}

/** Appends the tenant scope to a path that may already carry a query. */
export function withTenantScope(path: string, brandId?: string, applicationId?: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}${tenantScopeQuery(brandId, applicationId)}`;
}
