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
});
