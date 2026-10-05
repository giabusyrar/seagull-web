import { describe, it, expect } from 'vitest';
import { decompileJDMToVisualComponents, compileVisualToJDM, scoreRangeLetters } from './jdm-compiler';
import { DEFAULT_SCORE_RANGE_BANDS } from '../types';

// A minimal but structurally real schema: 4 axis_codes-driven dimensions
// (aging/sebum/sensitivity/pigmentation, all represented in the visual
// editor) plus a hand-authored decisionTableNode + field_mapping entry for
// pore_severity — a dimension whose node writes to sub_classification, not
// an axis_values letter, matching the real Skinverse ruleset exactly. It
// has no axis letter of its own, but it still shows up in the editor as a
// single-source (vision-only) axis, since it's still part of the scoring
// output.
const schemaWithCustomNode = JSON.stringify({
  nodes: [
    { id: 'input_node', name: 'Input', type: 'inputNode', position: { x: 40, y: 40 } },
    {
      id: 'pore-band',
      name: 'Pore Severity',
      type: 'decisionTableNode',
      content: {
        hitPolicy: 'first',
        inputs: [{ id: 'pore', field: 'dimension_scores.pore_severity' }],
        outputs: [{ id: 'pore_out', field: 'sub_classification.pore_severity' }],
        rules: [{ pore: '[90..100]', pore_out: '"Smooth"' }],
      },
    },
    {
      id: 'sensitivity-subtype',
      name: 'Sensitivity Subtype',
      type: 'decisionTableNode',
      content: {
        hitPolicy: 'first',
        inputs: [{ id: 'acne', field: 'customer_condition.has_acne' }],
        outputs: [{ id: 'out', field: 'sub_classification.sensitivity_subtype' }],
        rules: [{ acne: 'true', out: '"Sensitive Acne"' }],
      },
    },
  ],
  edges: [],
  axis_codes: {
    aging: { low: 'W', high: 'T', threshold: 90 },
    sebum: { low: 'O', high: 'D', threshold: 56 },
    sensitivity: { low: 'S', high: 'R', threshold: 50 },
    pigmentation: { low: 'P', high: 'N', threshold: 50 },
  },
  field_mapping: {
    aging: { form: 'age_over_30', vision: 'score_wrinkle' },
    sebum: { form: 'sebum' },
    sensitivity: { form: 'sensitivity' },
    pigmentation: { form: 'pigmentation', vision: 'score_darkspot' },
    pore_severity: { vision: 'Pores' },
  },
  dimension_fusion: {
    aging: { form: 0.5, vision: 0.5 },
    pigmentation: { form: 0.8, vision: 0.2 },
  },
  dimension_weights: { aging: 1, sebum: 1, sensitivity: 1, pigmentation: 1 },
  vision_source_code: 'paradev_skin_analyzer',
  form_survey_code: 'skinverse_q1_q6',
  suppress_severity_labels: true,
});

describe('compileVisualToJDM save round-trip', () => {
  it('preserves custom decisionTableNodes the visual editor does not own', () => {
    const decompiled = decompileJDMToVisualComponents(schemaWithCustomNode);
    const recompiled = compileVisualToJDM(
      decompiled.axes,
      decompiled.profileConfig,
      decompiled.scoreRangeBands,
      decompiled.severityBands,
      schemaWithCustomNode,
    );
    const after = JSON.parse(recompiled);
    const nodeIds = after.nodes.map((n: { id: string }) => n.id);

    expect(nodeIds).toContain('pore-band');
    expect(nodeIds).toContain('sensitivity-subtype');
  });

  it('converts the legacy blend to sources + dimension_inputs, keeping a dimension it does not show as an axis letter (pore_severity)', () => {
    const decompiled = decompileJDMToVisualComponents(schemaWithCustomNode);
    expect(decompiled.convertedBlend).toBe(true);
    const after = JSON.parse(compileVisualToJDM(
      decompiled.axes, decompiled.profileConfig, decompiled.scoreRangeBands, decompiled.severityBands, schemaWithCustomNode,
    ));

    // Only the new shape is saved: core reads a ruleset as all-new or all-legacy.
    expect(after.field_mapping).toBeUndefined();
    expect(after.dimension_fusion).toBeUndefined();
    expect(after.sources).toEqual({ form: { scale: [0, 100], direction: 'concern' }, vision: { scale: [0, 100], direction: 'health' } });
    expect(after.dimension_inputs).toEqual({
      // form's field is the dimension key, except the date-of-birth field.
      aging: { inputs: { form: 'age_over_30', vision: 'score_wrinkle' }, weights: { form: 0.5, vision: 0.5 } },
      pigmentation: { inputs: { form: 'pigmentation', vision: 'score_darkspot' }, weights: { form: 0.8, vision: 0.2 } },
      sebum: { inputs: { form: 'sebum' }, weights: { form: 1 } },
      sensitivity: { inputs: { form: 'sensitivity' }, weights: { form: 1 } },
      pore_severity: { inputs: { vision: 'Pores' }, weights: { vision: 1 } },
    });
  });

  it('surfaces every blended dimension as an editable axis, even one with no axis letter', () => {
    const decompiled = decompileJDMToVisualComponents(schemaWithCustomNode);
    const pore = decompiled.axes.find((a) => a.dimensionKey === 'pore_severity')!;
    expect(pore.inputs).toEqual([{ source: 'vision', field: 'Pores', label: 'Pores', weight: 100 }]);
    // No axis_codes/band node exists for it -> no bands, and recompiling
    // must never invent an axis_codes entry (it must never gain a letter).
    expect(pore.bands ?? []).toHaveLength(0);
    const after = JSON.parse(compileVisualToJDM(
      decompiled.axes, decompiled.profileConfig, decompiled.scoreRangeBands, decompiled.severityBands, schemaWithCustomNode,
    ));
    expect(after.axis_codes.pore_severity).toBeUndefined();
  });

  it('keeps the blend of a dimension the caller does not pass as an axis, converted', () => {
    const decompiled = decompileJDMToVisualComponents(schemaWithCustomNode);
    const onlySebum = decompiled.axes.filter((a) => a.dimensionKey === 'sebum');
    const after = JSON.parse(compileVisualToJDM(
      onlySebum, decompiled.profileConfig, decompiled.scoreRangeBands, decompiled.severityBands, schemaWithCustomNode,
    ));
    expect(after.dimension_inputs.pigmentation).toEqual({ inputs: { form: 'pigmentation', vision: 'score_darkspot' }, weights: { form: 0.8, vision: 0.2 } });
    expect(after.dimension_inputs.pore_severity).toEqual({ inputs: { vision: 'Pores' }, weights: { vision: 1 } });
  });

  it('preserves top-level ruleset config the editor does not manage', () => {
    const decompiled = decompileJDMToVisualComponents(schemaWithCustomNode);
    const recompiled = compileVisualToJDM(
      decompiled.axes,
      decompiled.profileConfig,
      decompiled.scoreRangeBands,
      decompiled.severityBands,
      schemaWithCustomNode,
    );
    const after = JSON.parse(recompiled);

    expect(after.vision_source_code).toBe('paradev_skin_analyzer');
    expect(after.form_survey_code).toBe('skinverse_q1_q6');
    expect(after.suppress_severity_labels).toBe(true);
  });
});

describe('hand-authored band nodes', () => {
  // baumann_16_types' sebum-band names its columns 'sebum'/'sebum_axis', not 'in'/'out'.
  const schema = JSON.stringify({
    nodes: [{
      id: 'sebum-band', name: 'Sebum', type: 'decisionTableNode',
      content: {
        hitPolicy: 'first',
        inputs: [{ id: 'sebum', field: 'dimension_scores.sebum' }],
        outputs: [{ id: 'sebum_axis', field: 'axis_values.SEBUM' }],
        rules: [{ sebum: '[60..100]', sebum_axis: '"D"' }, { sebum: '[45..55]', sebum_axis: '"C"' }, { sebum: '[0..40]', sebum_axis: '"O"' }],
      },
    }],
    edges: [],
    dimension_weights: { sebum: 1 },
    dimension_fusion: { sebum: { form: 1, vision: 0 } },
  });

  it('reads its bands by the node’s own column ids, so a save keeps the axis letter', () => {
    const d = decompileJDMToVisualComponents(schema);
    expect(d.axes[0].bands?.map((b) => [b.min, b.max, b.letter])).toEqual([[60, 100, 'D'], [45, 55, 'C'], [0, 40, 'O']]);
    const after = JSON.parse(compileVisualToJDM(d.axes, d.profileConfig, d.scoreRangeBands, d.severityBands, schema));
    const node = after.nodes.find((n: { id: string }) => n.id === 'sebum-band');
    expect(node.content.outputs[0].field).toBe('axis_values.SEBUM');
    expect(node.content.rules).toHaveLength(3);
  });
});

describe('nothing is filled in for the author', () => {
  it('an empty schema decompiles to no dimensions and no profiles', () => {
    const d = decompileJDMToVisualComponents('');
    expect(d.axes).toEqual([]);
    expect(d.profileConfig.profiles).toEqual([]);
  });

  it('a profile table with no rows stays empty', () => {
    const d = decompileJDMToVisualComponents(JSON.stringify({
      nodes: [{ id: 'profile', type: 'decisionTableNode', content: { inputs: [{ id: 'in', field: 'total_score' }], outputs: [{ id: 'code', field: 'skin_profile.code' }], rules: [] } }],
      dimension_weights: { sebum: 1 },
    }));
    expect(d.profileConfig.profiles).toEqual([]);
  });

  it('writes a concern label only when the author set one (core names the rest)', () => {
    const axes = [
      { id: 'a', axisCode: 'SEBUM', name: 'Sebum', dimensionKey: 'sebum', weight: 1 },
      { id: 'b', axisCode: 'ACNE', name: 'Acne', dimensionKey: 'acne', weight: 1, concernLabel: 'Breakouts' },
    ];
    const out = JSON.parse(compileVisualToJDM(axes));
    expect(out.concern_labels).toEqual({ acne: 'Breakouts' });
    expect(decompileJDMToVisualComponents(JSON.stringify(out)).axes.find((a) => a.dimensionKey === 'sebum')?.concernLabel).toBeUndefined();
  });

  it('does not compile an axis whose dimension is not picked yet', () => {
    const out = JSON.parse(compileVisualToJDM([{ id: 'a', axisCode: '', name: 'Dimension 1', dimensionKey: '', weight: 1 }]));
    expect(out.dimension_weights).toEqual({});
  });
});

describe('scoreRangeLetters', () => {
  // core axisValuesFromScores: strings.ToUpper(label[:1]) of the band a score falls in.
  it('is the initial of each Score Range band label, lowest band first', () => {
    expect(scoreRangeLetters(DEFAULT_SCORE_RANGE_BANDS)).toEqual(['P', 'S', 'O']);
  });

  it('follows the ruleset’s own bands', () => {
    expect(scoreRangeLetters([{ id: 'x', max: 100, label: 'high' }, { id: 'y', max: 50, label: 'low' }])).toEqual(['L', 'H']);
  });
});
