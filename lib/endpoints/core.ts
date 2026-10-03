import type { EndpointDef } from '../endpoint';

const P = '/core';
const PERSONAL = [
  { name: 'customer_id', kind: 'text', default: 'sim-customer' },
  { name: 'full_name', kind: 'text' }, { name: 'email', kind: 'text' }, { name: 'phone_number', kind: 'text' },
  { name: 'date_of_birth', kind: 'text', help: 'YYYY-MM-DD' },
  { name: 'consent_data_processing', kind: 'bool', default: true }, { name: 'consent_marketing', kind: 'bool', default: false },
] as const satisfies EndpointDef['fields'];

export const form: EndpointDef[] = [
  { id: 'form-list', title: 'List surveys', service: 'core', method: 'GET', path: `${P}/form-engine/survey`, body: 'none', brand: 'snake', fields: [] },
  { id: 'form-get', title: 'Get survey', service: 'core', method: 'GET', path: `${P}/form-engine/survey/:code`, body: 'none', brand: 'snake', fields: [{ name: 'code', kind: 'text', required: true }] },
  { id: 'form-evaluate', title: 'Evaluate survey', service: 'core', method: 'POST', path: `${P}/form-engine/survey/:code/evaluate`, body: 'json', brand: 'snake', fields: [
    { name: 'code', kind: 'text', required: true }, { name: 'customer_id', kind: 'text', default: 'sim-customer' },
    { name: 'data', kind: 'json', default: '{}', help: '{ "question": answer }' },
    { name: 'customer_conditions', kind: 'json', default: '{}' }, { name: 'vision_signals', kind: 'json', default: '{}' },
  ] },
  { id: 'form-evaluate-photos', title: 'Evaluate with photo', service: 'core', method: 'POST', path: `${P}/form-engine/survey/:code/evaluate-with-photos`, body: 'multipart', brand: 'snake', fields: [
    { name: 'code', kind: 'text', required: true }, { name: 'photo', kind: 'file', required: true }, ...PERSONAL,
    { name: 'data', kind: 'text', default: '{}', help: 'JSON string' }, { name: 'customer_conditions', kind: 'text', default: '{}', help: 'JSON string' },
  ] },
];

export const score: EndpointDef[] = [
  { id: 'score-evaluate', title: 'Evaluate (JSON)', service: 'core', method: 'POST', path: `${P}/score-engine/evaluate`, body: 'json', brand: 'snake', fields: [
    { name: 'code', kind: 'text' }, { name: 'answer_list', kind: 'json', default: '[]' }, { name: 'customer_condition', kind: 'json', default: '{}' },
    { name: 'dimensions', kind: 'json', default: '[]' }, { name: 'vision_signals', kind: 'json', default: '{}' },
  ] },
  { id: 'score-evaluate-v2', title: 'Evaluate V2 (multipart, optional photo)', service: 'core', method: 'POST', path: `${P}/score-engine/evaluate/:code`, body: 'multipart', brand: 'snake', fields: [
    { name: 'code', kind: 'text', required: true }, { name: 'photo', kind: 'file' }, ...PERSONAL, { name: 'data', kind: 'text', default: '{}', help: 'JSON string' },
  ] },
  { id: 'score-rulesets', title: 'List rulesets', service: 'core', method: 'GET', path: `${P}/score-engine/rulesets`, body: 'none', brand: 'snake', fields: [] },
  { id: 'score-ruleset-active', title: 'Active ruleset', service: 'core', method: 'GET', path: `${P}/score-engine/rulesets/active`, body: 'none', brand: 'snake', fields: [] },
  { id: 'score-simulate', title: 'Simulate ruleset', service: 'core', method: 'POST', path: `${P}/score-engine/simulate`, body: 'json', brand: 'none', fields: [
    { name: 'schema', kind: 'text', required: true, help: 'ruleset JSON as a string (copy from Active ruleset)' },
    { name: 'form_scores', kind: 'json', default: '{}' }, { name: 'vision_scores', kind: 'json', default: '{}', help: 'health space, 100 = optimal' },
    { name: 'age_years', kind: 'number' }, { name: 'customer_condition', kind: 'json', default: '{}' },
  ] },
];

export const match: EndpointDef[] = [
  { id: 'match-evaluate', title: 'Evaluate match', service: 'core', method: 'POST', path: `${P}/match-engine/evaluate`, body: 'json', brand: 'snake', fields: [
    { name: 'dimension_scores', kind: 'json', default: '{}', required: true, help: 'paste dimension_scores from a score result' },
    { name: 'strategy_id', kind: 'text' }, { name: 'customer_conditions', kind: 'json', default: '{}' }, { name: 'preferences', kind: 'json', default: '{}' },
  ] },
  { id: 'match-products', title: 'Products', service: 'core', method: 'GET', path: `${P}/match-engine/products`, body: 'none', brand: 'snake', fields: [] },
  { id: 'match-shades', title: 'Shades of a product', service: 'core', method: 'GET', path: `${P}/match-engine/shades`, body: 'none', brand: 'none', fields: [{ name: 'product_id', kind: 'text', required: true }] },
];

export const vision: EndpointDef[] = [
  { id: 'vision-registry', title: 'Registry (dimensions, conditions)', service: 'core', method: 'GET', path: `${P}/vision-engine/registry`, body: 'none', brand: 'none', fields: [] },
  { id: 'vision-analyze', title: 'Analyze image', service: 'core', method: 'POST', path: `${P}/vision-engine/analyze-image`, body: 'multipart', brand: 'camel', fields: [
    { name: 'image_front', kind: 'file', required: true }, { name: 'image_left', kind: 'file' }, { name: 'image_right', kind: 'file' },
    { name: 'dimensions', kind: 'text', help: 'comma list of dimension codes' }, { name: 'skinConditions', kind: 'text', help: 'comma list' },
  ] },
];

export const colour: EndpointDef[] = [
  { id: 'colour-analyze', title: 'Analyze', service: 'core', method: 'POST', path: `${P}/colour-engine/analyze`, body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'hijab', kind: 'bool', default: false }, { name: 'hairVisible', kind: 'bool', default: true },
  ] },
  { id: 'colour-catalog', title: 'Catalog', service: 'core', method: 'GET', path: `${P}/colour-engine/catalog`, body: 'none', brand: 'none', fields: [] },
  { id: 'colour-quadrants', title: 'Quadrants', service: 'core', method: 'GET', path: `${P}/colour-engine/quadrants`, body: 'none', brand: 'none', fields: [] },
  { id: 'colour-tryon', title: 'Try-on (PNG)', service: 'core', method: 'POST', path: `${P}/colour-engine/tryon`, body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'shadeIds', kind: 'text', repeat: true, required: true, help: 'comma list of shade ids from Catalog' },
  ] },
];

export const faceArch: EndpointDef[] = [
  { id: 'facearch-measure', title: 'Face architecture', service: 'core', method: 'POST', path: `${P}/vision-engine/face-architecture/:brandId/:applicationId`, body: 'multipart', brand: 'path', fields: [{ name: 'image', kind: 'file', required: true }] },
  { id: 'facearch-head', title: '3D head (GLB)', service: 'core', method: 'POST', path: `${P}/vision-engine/face-architecture/:brandId/:applicationId/head`, body: 'multipart', brand: 'path', fields: [
    { name: 'front', kind: 'file', required: true }, { name: 'left', kind: 'file' }, { name: 'right', kind: 'file' },
  ] },
];

export const assessments: EndpointDef[] = [
  { id: 'assess-history', title: 'Brand history', service: 'core', method: 'GET', path: `${P}/assessments/history`, body: 'none', brand: 'snake', fields: [{ name: 'limit', kind: 'number', default: 20 }] },
  { id: 'assess-customer', title: 'Customer assessments', service: 'core', method: 'GET', path: `${P}/assessments/customers/:customerId`, body: 'none', brand: 'snake', fields: [{ name: 'customerId', kind: 'text', required: true }, { name: 'limit', kind: 'number', default: 20 }] },
];

export const flows: EndpointDef[] = [
  { id: 'flows-list', title: 'Conversation flows', service: 'core', method: 'GET', path: `${P}/conversation-flows`, body: 'none', brand: 'snake', fields: [] },
  { id: 'flows-active', title: 'Active flow', service: 'core', method: 'GET', path: `${P}/conversation-flows/active`, body: 'none', brand: 'snake', fields: [{ name: 'survey_code', kind: 'text', required: true }] },
];
