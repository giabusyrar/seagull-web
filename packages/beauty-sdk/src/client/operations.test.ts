import { describe, expect, it } from 'vitest';
import { OPERATIONS, gatewayUrl, injectScope, matchOperation, sdkUrl, type Operation } from './operations';

const scope = { brandId: 'brd-1', applicationId: 'app/1', customerId: 'cus 7' };
const op = (id: string) => OPERATIONS.find((o) => o.id === id)!;

// The table no longer holds a JSON-scoped, path-param or customer operation
// (forms.evaluate and assessments.history return in phase 5), so the helpers
// that serve them are tested against operations built here.
const shape = { method: 'POST', customer: false, query: [] } as const;
const jsonOp = { ...shape, id: 'forms.evaluate', sdkPath: '/forms/:code/evaluate', gatewayPath: '/core/form-engine/survey/:code/evaluate', scope: 'json' } as unknown as Operation; // ids that are not OperationIds on purpose
const customerOp = { ...shape, method: 'GET', id: 'assessments.history', sdkPath: '/assessments/history', gatewayPath: '/core/assessments/customers/{customerId}', scope: 'none', customer: true } as unknown as Operation; // ids that are not OperationIds on purpose

describe('operations', () => {
  it('matches only allowlisted method + path pairs', () => {
    expect(matchOperation('POST', '/colour/analyze')?.op.id).toBe('colour.analyze');
    expect(matchOperation('GET', '/colour/analyze')).toBeNull();
    expect(matchOperation('GET', '/core/anything')).toBeNull();
  });

  it('does not match the operations removed until phase 5', () => {
    expect(OPERATIONS.map((o) => o.id)).not.toContain('forms.evaluate');
    expect(OPERATIONS.map((o) => o.id)).not.toContain('assessments.history');
    expect(matchOperation('POST', '/forms/quiz/evaluate')).toBeNull();
    expect(matchOperation('GET', '/assessments/history')).toBeNull();
  });

  it('builds the SDK url with encoded params', () => {
    expect(sdkUrl(jsonOp, { code: 'skin quiz' })).toBe('/forms/skin%20quiz/evaluate');
  });

  it('writes brand and application into the gateway path, encoded', () => {
    expect(gatewayUrl(op('face.head'), {}, scope)).toBe('/core/face-architecture/brd-1/app%2F1/head');
  });

  it('writes the customer from the scope, never from the request', () => {
    expect(gatewayUrl(customerOp, { customerId: 'someone-else' }, scope)).toBe('/core/assessments/customers/cus%207');
  });

  it('injects scope into JSON bodies as brand_id / application_id', () => {
    expect(injectScope(jsonOp, { answers: {}, brand_id: 'spoofed' }, scope)).toEqual({
      answers: {},
      brand_id: 'brd-1',
      application_id: 'app/1',
    });
  });

  it('strips every case variant of the scope keys from JSON bodies; only the server values survive', () => {
    const out = injectScope(jsonOp, { answers: {}, BRAND_ID: 'evil', brandId: 'evil', Brand_Id: 'evil', ApplicationId: 'evil', APPLICATION_ID: 'evil' }, scope) as Record<string, unknown>;
    expect(out).toEqual({ answers: {}, brand_id: 'brd-1', application_id: 'app/1' });
  });

  it('keeps repeated multipart keys and still overwrites scope', () => {
    const fd = new FormData();
    fd.append('image', new Blob([new Uint8Array([1])]), 'a.jpg');
    fd.append('image', new Blob([new Uint8Array([2])]), 'b.jpg');
    fd.append('brandId', 'x');
    fd.append('brandId', 'y');
    const out = injectScope(op('skin.analyze'), fd, scope) as FormData;
    expect(out.getAll('image')).toHaveLength(2);
    expect(out.getAll('brandId')).toEqual(['brd-1']);
    expect(out.getAll('applicationId')).toEqual(['app/1']);
  });

  it('injects scope into multipart bodies as brandId / applicationId', () => {
    const fd = new FormData();
    fd.set('brandId', 'spoofed');
    const out = injectScope(op('skin.analyze'), fd, scope) as FormData;
    expect(out.get('brandId')).toBe('brd-1');
    expect(out.get('applicationId')).toBe('app/1');
  });

  it('leaves bodies alone for operations without body scope', () => {
    const fd = new FormData();
    expect(injectScope(op('colour.analyze'), fd, scope)).toBe(fd);
  });

  // Security: Dot-segment traversal prevention
  describe('dot-segment traversal prevention', () => {
    it('throws sdkUrl for . in params', () => {
      expect(() => sdkUrl(jsonOp, { code: '.' })).toThrow();
    });

    it('throws sdkUrl for .. in params', () => {
      expect(() => sdkUrl(jsonOp, { code: '..' })).toThrow();
    });

    it('throws sdkUrl for / in params', () => {
      expect(() => sdkUrl(jsonOp, { code: 'a/b' })).toThrow();
    });

    it('throws gatewayUrl for . in scope brandId', () => {
      expect(() => gatewayUrl(op('face.head'), {}, { ...scope, brandId: '.' })).toThrow();
    });

    it('throws gatewayUrl for .. in scope applicationId', () => {
      expect(() => gatewayUrl(op('face.head'), {}, { ...scope, applicationId: '..' })).toThrow();
    });

    it('throws gatewayUrl for .. in scope customerId', () => {
      expect(() => gatewayUrl(customerOp, {}, { ...scope, customerId: '..' })).toThrow();
    });
  });

  // Security: injectScope fails closed
  describe('injectScope security', () => {
    it('throws for multipart when body is not FormData', () => {
      expect(() => injectScope(op('skin.analyze'), { some: 'object' }, scope)).toThrow();
    });

    it('throws for multipart when body is null', () => {
      expect(() => injectScope(op('skin.analyze'), null as any, scope)).toThrow();
    });

    it('throws for json when body is FormData', () => {
      const fd = new FormData();
      expect(() => injectScope(jsonOp, fd, scope)).toThrow();
    });

    it('returns new FormData for multipart (does not mutate input)', () => {
      const inputFd = new FormData();
      inputFd.set('brandId', 'original');
      inputFd.set('other', 'data');
      const outputFd = injectScope(op('skin.analyze'), inputFd, scope) as FormData;
      expect(outputFd).not.toBe(inputFd);
      expect(outputFd.get('brandId')).toBe('brd-1');
      expect(outputFd.get('other')).toBe('data');
      // Input should be unchanged
      expect(inputFd.get('brandId')).toBe('original');
    });

    it('allows undefined for json scope', () => {
      const result = injectScope(jsonOp, undefined, scope);
      expect(result).toEqual({
        brand_id: 'brd-1',
        application_id: 'app/1',
      });
    });
  });

  // Security: Malformed percent-encoding / traversal in matchOperation, using
  // a real path-param operation shape is not possible until phase 5; the
  // fixed-segment operations must still reject them.
  describe('malformed percent-encoding', () => {
    it('returns null for incomplete percent-encoding in matchOperation', () => {
      expect(matchOperation('POST', '/colour/%E0%A4%A')).toBeNull();
    });
    it('returns null for dot segments', () => {
      expect(matchOperation('POST', '/colour/../analyze')).toBeNull();
      expect(matchOperation('POST', '/colour/%2e%2e/analyze')).toBeNull();
    });
  });
});
