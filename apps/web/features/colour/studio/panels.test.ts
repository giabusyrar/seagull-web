import { describe, expect, it } from 'vitest';
import { resultPanels } from './panels';

describe('resultPanels', () => {
  it('shows the form alone when only the form is scored', () => {
    expect(resultPanels(false, true, 'colour')).toEqual({ panels: ['form'], panel: 'form' });
  });

  it('shows colour, face and form together once both are done, keeping the chosen tab', () => {
    expect(resultPanels(true, true, 'face')).toEqual({ panels: ['colour', 'face', 'form'], panel: 'face' });
  });

  it('falls back to the first tab when the chosen one has nothing to show', () => {
    expect(resultPanels(true, false, 'form')).toEqual({ panels: ['colour', 'face'], panel: 'colour' });
  });

  it('shows no tabs before anything is done', () => {
    expect(resultPanels(false, false, 'colour').panels).toEqual([]);
  });
});
