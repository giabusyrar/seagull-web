import type { EndpointDef } from '../endpoint';

const R = '/api/reference';
const list = (res: string, title: string): EndpointDef => ({ id: `ref-${res}`, title, service: 'ref', method: 'GET', path: `${R}/${res}`, body: 'none', brand: 'none', fields: [] });

export const reference: EndpointDef[] = [
  list('brands', 'Brands'),
  list('applications', 'Applications'),
  list('dimensions', 'Dimensions'),
  list('skin-conditions', 'Skin conditions'),
  { id: 'ref-products', title: 'Products', service: 'ref', method: 'GET', path: `${R}/products`, body: 'none', brand: 'none', fields: [{ name: 'brandId', kind: 'text', help: 'ref brand id (brd-…)' }] },
  list('all', 'Everything (/all)'),
];
