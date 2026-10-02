import { describe, expect, it } from 'vitest';
import { OPERATIONS, gatewayUrl, injectScope, matchOperation, sdkUrl } from './operations';

const scope = { brandId: 'brd-1', applicationId: 'app/1', customerId: 'cus 7' };
const op = (id: string) => OPERATIONS.find((o) => o.id === id)!;

describe('operations', () => {
  it('matches only allowlisted method + path pairs', () => {
    expect(matchOperation('POST', '/colour/analyze')?.op.id).toBe('colour.analyze');
    expect(matchOperation('GET', '/colour/analyze')).toBeNull();
    expect(matchOperation('GET', '/core/anything')).toBeNull();
  });

  it('extracts client path params', () => {
    expect(matchOperation('POST', '/forms/skin%20quiz/evaluate')?.params).toEqual({ code: 'skin quiz' });
  });

  it('builds the SDK url with encoded params', () => {
    expect(sdkUrl(op('forms.evaluate'), { code: 'skin quiz' })).toBe('/forms/skin%20quiz/evaluate');
  });

  it('writes brand and application into the gateway path, encoded', () => {
    expect(gatewayUrl(op('face.head'), {}, scope)).toBe('/core/vision-engine/face-architecture/brd-1/app%2F1/head');
  });

  it('writes the customer from the scope, never from the request', () => {
    expect(gatewayUrl(op('assessments.history'), { customerId: 'someone-else' }, scope)).toBe('/core/assessments/customers/cus%207');
  });

  it('injects scope into JSON bodies as brand_id / application_id', () => {
    expect(injectScope(op('forms.evaluate'), { answers: {}, brand_id: 'spoofed' }, scope)).toEqual({
      answers: {},
      brand_id: 'brd-1',
      application_id: 'app/1',
    });
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
    it('rejects matchOperation with . in path', () => {
      expect(matchOperation('POST', '/forms/./evaluate')).toBeNull();
    });

    it('rejects matchOperation with .. in path', () => {
      expect(matchOperation('POST', '/forms/../evaluate')).toBeNull();
    });

    it('rejects matchOperation with encoded .. (%2e%2e)', () => {
      expect(matchOperation('POST', '/forms/%2e%2e/evaluate')).toBeNull();
    });

    it('rejects matchOperation with encoded . (%2e)', () => {
      expect(matchOperation('POST', '/forms/%2e/evaluate')).toBeNull();
    });

    it('rejects matchOperation with encoded slash (%2F) in param', () => {
      expect(matchOperation('POST', '/forms/a%2Fb/evaluate')).toBeNull();
    });

    it('rejects matchOperation with backslash in decoded param', () => {
      expect(matchOperation('POST', '/forms/a%5Cb/evaluate')).toBeNull();
    });

    it('throws sdkUrl for . in params', () => {
      expect(() => sdkUrl(op('forms.evaluate'), { code: '.' })).toThrow();
    });

    it('throws sdkUrl for .. in params', () => {
      expect(() => sdkUrl(op('forms.evaluate'), { code: '..' })).toThrow();
    });

    it('throws sdkUrl for / in params', () => {
      expect(() => sdkUrl(op('forms.evaluate'), { code: 'a/b' })).toThrow();
    });

    it('throws gatewayUrl for . in scope brandId', () => {
      expect(() => gatewayUrl(op('face.head'), {}, { ...scope, brandId: '.' })).toThrow();
    });

    it('throws gatewayUrl for .. in scope applicationId', () => {
      expect(() => gatewayUrl(op('face.head'), {}, { ...scope, applicationId: '..' })).toThrow();
    });

    it('throws gatewayUrl for .. in scope customerId', () => {
      expect(() => gatewayUrl(op('assessments.history'), {}, { ...scope, customerId: '..' })).toThrow();
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
      expect(() => injectScope(op('forms.evaluate'), fd, scope)).toThrow();
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
      const result = injectScope(op('forms.evaluate'), undefined, scope);
      expect(result).toEqual({
        brand_id: 'brd-1',
        application_id: 'app/1',
      });
    });
  });

  // Security: Malformed percent-encoding
  describe('malformed percent-encoding', () => {
    it('returns null for incomplete percent-encoding in matchOperation', () => {
      expect(matchOperation('POST', '/forms/%E0%A4%A/evaluate')).toBeNull();
    });
  });
});
