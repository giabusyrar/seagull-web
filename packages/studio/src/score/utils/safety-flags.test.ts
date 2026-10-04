import { describe, expect, it } from 'vitest';
import { safetyFlagsFromSurveys } from './safety-flags';

const schema = (...choices: unknown[]) => JSON.stringify({ pages: [{ elements: [{ choices }] }] });

describe('safetyFlagsFromSurveys', () => {
  const surveys = [
    { code: 'a', schema: schema({ value: 'x', condition_map: { is_pregnant: true } }, 'plain-choice') },
    { code: 'b', schema: schema({ value: 'y', conditionMap: { uses_retinol: true, is_pregnant: false } }) },
    { code: 'c', schema: '{not json' },
    { code: 'd' },
  ];

  it('collects condition-map keys from every survey, without duplicates', () => {
    expect(safetyFlagsFromSurveys(surveys)).toEqual(['is_pregnant', 'uses_retinol']);
  });

  it('reads only the linked survey when a code is given', () => {
    expect(safetyFlagsFromSurveys(surveys, 'b')).toEqual(['uses_retinol', 'is_pregnant']);
    expect(safetyFlagsFromSurveys(surveys, 'missing')).toEqual([]);
  });

  it('yields nothing for a response that is not a list', () => {
    expect(safetyFlagsFromSurveys({ error: 'x' })).toEqual([]);
    expect(safetyFlagsFromSurveys(null, 'a')).toEqual([]);
  });

  it('tolerates pages and elements without choices', () => {
    expect(safetyFlagsFromSurveys([{ schema: JSON.stringify({ pages: [{}, { elements: [{}] }] }) }])).toEqual([]);
  });
});
