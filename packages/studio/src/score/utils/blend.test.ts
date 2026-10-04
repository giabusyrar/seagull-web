import { describe, it, expect } from 'vitest';
import { convertLegacyDimension, readBlend, toDimensionInputs, validateBlend } from './blend';
import { compileVisualToJDM, decompileJDMToVisualComponents } from './jdm-compiler';
import { LEGACY_SOURCES } from '../types';
import type { VisualAxisConfig } from '../types';

// The conversion rules come from core (Core session, 2026-10-04); each case
// below is one of them, so a change that would alter a live score fails here.
describe('legacy conversion', () => {
  it('drops a source weighted 0 together with its input (skinverse sebum {form:1, vision:0})', () => {
    expect(convertLegacyDimension('sebum', { form: 1, vision: 0 }, { form: 'skin_lifestyle', vision: 'x.Oiliness' }))
      .toEqual([{ source: 'form', field: 'sebum', weight: 100 }]);
  });

  it('uses the dimension key as the form field, never field_mapping.form, except the date-of-birth field', () => {
    expect(convertLegacyDimension('sebum', { form: 0.4, vision: 0.6 }, { form: 'skin_lifestyle', vision: 'v.Oil' }))
      .toEqual([{ source: 'form', field: 'sebum', weight: 40 }, { source: 'vision', field: 'v.Oil', weight: 60 }]);
    expect(convertLegacyDimension('aging', { form: 0.5, vision: 0.5 }, { form: 'age_over_30', vision: 'v.Wrinkle' })[0].field).toBe('age_over_30');
  });

  it('makes a fusion-only ruleset (no field_mapping) form-only from each dimension key', () => {
    const b = readBlend({ dimension_fusion: { sebum: { form: 1, vision: 0 }, hydration: { form: 1, vision: 0 } } });
    expect(b.converted).toBe(true);
    expect(b.sources).toEqual({ form: LEGACY_SOURCES.form });
    expect(b.dims.hydration.inputs).toEqual([{ source: 'form', field: 'hydration', weight: 100 }]);
  });

  it('declares vision as health space: the vendor fields arrive raw', () => {
    expect(readBlend({ field_mapping: { pores: { vision: 'v.Pores' } } }).sources).toEqual({ vision: { scale: [0, 100], direction: 'health' } });
  });

  it('gives a vision weight to form alone when vision was weighted but never mapped', () => {
    expect(convertLegacyDimension('acne', { form: 0.3, vision: 0.7 }, undefined)).toEqual([{ source: 'form', field: 'acne', weight: 100 }]);
  });

  it('leaves two mapped sources without fusion weights unweighted, for validation to show', () => {
    expect(convertLegacyDimension('x', undefined, { form: 'a', vision: 'v' }).map((i) => i.weight)).toEqual([undefined, undefined]);
  });

  it('prefers the new keys and ignores legacy ones when both are present', () => {
    const b = readBlend({
      sources: { device: { scale: [0, 1], direction: 'concern' } },
      dimension_inputs: { sebum: { inputs: { device: 'sebumeter' }, weights: { device: 1 }, required: ['device'] } },
      field_mapping: { sebum: { form: 'sebum' } },
    });
    expect(b.converted).toBe(false);
    expect(b.dims).toEqual({ sebum: { inputs: [{ source: 'device', field: 'sebumeter', weight: 100 }], required: ['device'] } });
  });
});

describe('new shape round trip', () => {
  const schema = JSON.stringify({
    nodes: [],
    edges: [],
    dimension_weights: { sebum: 1 },
    sources: {
      form: { scale: [0, 100], direction: 'concern' },
      vision: { scale: [0, 100], direction: 'health' },
      device: { scale: [0, 1], direction: 'concern' },
    },
    dimension_inputs: {
      sebum: { inputs: { form: 'sebum', vision: 'v.Oil', device: 'sebumeter' }, weights: { form: 0.3, vision: 0.5, device: 0.2 }, required: ['form'] },
    },
  });

  it('saves what it read, unchanged', () => {
    const d = decompileJDMToVisualComponents(schema);
    const after = JSON.parse(compileVisualToJDM(d.axes, d.profileConfig, d.scoreRangeBands, d.severityBands, schema, d.sources));
    const before = JSON.parse(schema);
    expect(after.sources).toEqual(before.sources);
    expect(after.dimension_inputs).toEqual(before.dimension_inputs);
  });

  it('writes fractional weights from percentages', () => {
    expect(toDimensionInputs({ inputs: [{ source: 'form', field: 'a', weight: 30 }, { source: 'device', field: 'b', weight: 70 }] }))
      .toEqual({ inputs: { form: 'a', device: 'b' }, weights: { form: 0.3, device: 0.7 } });
    expect(toDimensionInputs({ inputs: [] })).toBeUndefined();
  });
});

describe('validateBlend (the checks core runs on save)', () => {
  const sources = { form: LEGACY_SOURCES.form, device: { scale: [0, 1] as [number, number], direction: 'concern' as const } };
  const axis = (inputs: VisualAxisConfig['inputs'], required: string[] = []): VisualAxisConfig =>
    ({ id: 'a', axisCode: 'SEBUM', name: 'Sebum', dimensionKey: 'sebum', weight: 1, inputs, required });

  it('accepts weights summing to 100%', () => {
    expect(validateBlend(sources, [axis([{ source: 'form', field: 'sebum', weight: 30 }, { source: 'device', field: 's', weight: 70 }])])).toEqual([]);
  });

  it('names every problem', () => {
    const problems = validateBlend(
      { ...sources, bad: { scale: [5, 1], direction: 'up' as never } },
      [axis([{ source: 'form', field: 'sebum', weight: 30 }, { source: 'lab', field: '', weight: 0 }], ['vision'])],
    );
    expect(problems).toEqual([
      'Source "bad": scale needs two numbers, min below max.',
      'Source "bad": direction must be concern or health.',
      'Sebum: source "lab" is not declared.',
      'Sebum: source "lab" has no field.',
      'Sebum: source "lab" weight must be above 0.',
      'Sebum: weights add up to 30%, not 100%.',
      'Sebum: required source "vision" is not one of its inputs.',
    ]);
  });

  it('flags a missing weight instead of assuming one', () => {
    expect(validateBlend(sources, [axis([{ source: 'form', field: 'sebum' }, { source: 'device', field: 's', weight: 100 }])]))
      .toEqual(['Sebum: source "form" has no weight.']);
  });
});
