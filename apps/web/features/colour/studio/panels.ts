import type { Panel } from './PhotoStage';

/**
 * The studio's result tabs, as in the simulator's one results view: colour
 * and face once the photo is analysed, the form once it is scored. Only tabs
 * with something to show; the chosen one if it is among them, else the first.
 */
export function resultPanels(photoAnalysed: boolean, formScored: boolean, chosen: Panel): { panels: Panel[]; panel: Panel } {
  const panels: Panel[] = [...(photoAnalysed ? (['colour', 'face'] as const) : []), ...(formScored ? (['form'] as const) : [])];
  return { panels, panel: panels.includes(chosen) ? chosen : panels[0] ?? 'colour' };
}
