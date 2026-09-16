import { describe, it, expect } from 'vitest';
import { buildInjectedValues } from './collection-parameters';

describe('buildInjectedValues', () => {
  it('separates headers and query params by kind', () => {
    const result = buildInjectedValues(
      [
        { kind: 'header', key: 'X-Tenant-Id', value: 'paragon-prod', enabled: true },
        { kind: 'query', key: 'apiVersion', value: 'v2', enabled: true },
      ],
      {}
    );
    expect(result.headers).toEqual({ 'X-Tenant-Id': 'paragon-prod' });
    expect(result.queryParams).toEqual({ apiVersion: 'v2' });
  });

  it('skips disabled parameters', () => {
    const result = buildInjectedValues(
      [{ kind: 'header', key: 'X-Disabled', value: 'x', enabled: false }],
      {}
    );
    expect(result.headers).toEqual({});
  });

  it('interpolates {{variables}} in parameter values', () => {
    const result = buildInjectedValues(
      [{ kind: 'header', key: 'Authorization', value: 'Bearer {{auth_token}}', enabled: true }],
      { auth_token: 'abc123' }
    );
    expect(result.headers).toEqual({ Authorization: 'Bearer abc123' });
  });

  it('returns empty objects when there are no parameters', () => {
    const result = buildInjectedValues([], {});
    expect(result).toEqual({ headers: {}, queryParams: {} });
  });
});
