import { describe, expect, it } from 'vitest';
import { ALL_TENANTS, tenantScopeQuery, withTenantScope } from './scope';

describe('tenant scope', () => {
  it('asks for every tenant when none is given', () => {
    expect(tenantScopeQuery()).toBe(`brand_id=${encodeURIComponent(ALL_TENANTS)}&application_id=${encodeURIComponent(ALL_TENANTS)}`);
    expect(tenantScopeQuery('', '')).toBe(tenantScopeQuery());
  });

  it('sends the selected tenant, encoded', () => {
    expect(tenantScopeQuery('wardah', 'skin verse')).toBe('brand_id=wardah&application_id=skin%20verse');
  });

  it('appends to a path with or without a query', () => {
    expect(withTenantScope('/api/matching/conflicts', 'b', 'a')).toBe('/api/matching/conflicts?brand_id=b&application_id=a');
    expect(withTenantScope('/api/matching/products?x=1', 'b', 'a')).toBe('/api/matching/products?x=1&brand_id=b&application_id=a');
  });
});
