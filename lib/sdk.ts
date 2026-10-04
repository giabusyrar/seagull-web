import type { CallInit, OperationId } from '@gateway-experience/beauty-sdk/client';
import { buildRequest, type Brand, type Field, type FieldValue } from './endpoint';

export const SIM_BRAND_HEADER = 'x-sim-brand';
export const SIM_APP_HEADER = 'x-sim-app';

export interface SdkOpDef { id: OperationId; title: string; directId: string; body: 'none' | 'multipart'; fields: Field[] }

const img = (name: string, required = false): Field => ({ name, kind: 'file', required });

export const SDK_OPS: SdkOpDef[] = [
  { id: 'colour.analyze', title: 'colour.analyze', directId: 'colour-analyze', body: 'multipart', fields: [img('image', true), { name: 'hijab', kind: 'bool', default: false }, { name: 'hairVisible', kind: 'bool', default: true }] },
  { id: 'colour.tryOn', title: 'colour.tryOn', directId: 'colour-tryon', body: 'multipart', fields: [img('image', true), { name: 'shadeIds', kind: 'text', repeat: true, required: true, help: 'comma list of shade ids' }] },
  { id: 'colour.catalog', title: 'colour.catalog', directId: 'colour-catalog', body: 'none', fields: [] },
  { id: 'face.analyze', title: 'face.analyze', directId: 'facearch-measure', body: 'multipart', fields: [img('image', true)] },
  { id: 'face.head', title: 'face.head', directId: 'facearch-head', body: 'multipart', fields: [img('front', true), img('left'), img('right')] },
  { id: 'skin.analyze', title: 'skin.analyze', directId: 'vision-analyze', body: 'multipart', fields: [img('image_front', true), img('image_left'), img('image_right'), { name: 'dimensions', kind: 'text', help: 'comma list' }, { name: 'skinConditions', kind: 'text', help: 'comma list' }] },
  { id: 'reference.brands', title: 'reference.brands', directId: 'ref-brands', body: 'none', fields: [] },
  { id: 'reference.products', title: 'reference.products', directId: 'ref-products', body: 'none', fields: [{ name: 'brandId', kind: 'text', help: 'ref brand id (brd-…)' }] },
];

/** Turns form values into the SDK's CallInit, reusing buildRequest's encoding rules. The proxy adds brand/app itself. */
export function sdkInit(def: SdkOpDef, values: Record<string, FieldValue>): CallInit {
  const built = buildRequest(
    { id: def.id, title: def.title, service: 'core', method: def.body === 'multipart' ? 'POST' : 'GET', path: '/', body: def.body, brand: 'none', fields: def.fields },
    values,
    { brandId: '', applicationId: '' },
  );
  if (def.body === 'multipart') return { body: built.init.body as FormData };
  const q = new URL(built.url, 'http://sim.local').searchParams;
  return q.size ? { query: Object.fromEntries(q) } : {};
}

export function withBrandHeaders(brand: Brand, f: typeof fetch = fetch): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set(SIM_BRAND_HEADER, brand.brandId);
    headers.set(SIM_APP_HEADER, brand.applicationId);
    return f(input, { ...init, headers });
  };
}
