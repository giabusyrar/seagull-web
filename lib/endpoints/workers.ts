import type { EndpointDef } from '../endpoint';

export const wColour: EndpointDef[] = [
  { id: 'wc-analyze', title: 'PCA analyze (raw measurement)', service: 'colour', method: 'POST', path: '/pca/analyze', body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'hijab', kind: 'bool', default: false }, { name: 'hairVisible', kind: 'bool', default: true },
  ] },
  { id: 'wc-render', title: 'VTO render (PNG)', service: 'colour', method: 'POST', path: '/vto/render', body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true },
    { name: 'request', kind: 'text', default: '{"layers":[{"category":"lip","hexColor":"#B5485D","alpha":0.6}]}', help: 'JSON string {layers:[{category, hexColor, alpha, specular?, mode?}]}' },
  ] },
  { id: 'wc-params', title: 'Render params', service: 'colour', method: 'GET', path: '/vto/render-params', body: 'none', brand: 'none', fields: [] },
  { id: 'wc-munsell', title: 'Munsell', service: 'colour', method: 'POST', path: '/colour/munsell', body: 'json', brand: 'none', fields: [{ name: 'hexes', kind: 'json', default: '["#C68642"]' }] },
];

export const wFace: EndpointDef[] = [
  { id: 'wf-catalogue', title: 'Measurement catalogue', service: 'face', method: 'GET', path: '/api/v1/face-measure/catalogue', body: 'none', brand: 'none', fields: [] },
  { id: 'wf-measure', title: 'Face measure', service: 'face', method: 'POST', path: '/api/v1/face-measure', body: 'multipart', brand: 'none', fields: [{ name: 'image', kind: 'file', required: true }, { name: 'landmarks', kind: 'bool', default: false }] },
  { id: 'wf-head', title: 'Face head (GLB)', service: 'face', method: 'POST', path: '/api/v1/face-head', body: 'multipart', brand: 'none', fields: [
    { name: 'front', kind: 'file', required: true }, { name: 'left', kind: 'file' }, { name: 'right', kind: 'file' },
  ] },
];

export const wSkin: EndpointDef[] = [
  { id: 'ws-segment', title: 'Segment and pose', service: 'skin', method: 'POST', path: '/api/v1/segment-and-pose', body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'declaredAngle', kind: 'select', options: ['', 'front', 'left', 'right'] },
  ] },
  { id: 'ws-healthz', title: 'Features (/healthz)', service: 'skin', method: 'GET', path: '/healthz', body: 'none', brand: 'none', fields: [] },
];

export const wTryon: EndpointDef[] = [
  { id: 'wt-extract', title: 'Extract shade', service: 'tryon', method: 'POST', path: '/extract', body: 'json', brand: 'none',
    note: 'Async: returns 202 only. The result is posted to core-engine /shades/{id}/extraction-callback, not back here.',
    fields: [
      { name: 'shade_id', kind: 'text', required: true }, { name: 'reference_photo_url', kind: 'text', required: true },
      { name: 'hex_color', kind: 'text', default: '#B5485D' }, { name: 'region', kind: 'select', options: ['lip', 'eye', 'cheek', 'skin'], default: 'lip' },
    ] },
];
