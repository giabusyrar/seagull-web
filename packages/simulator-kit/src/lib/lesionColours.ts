// Lesion colours on the photo. They should be the Geti project's label colours
// (Research doc "Panduan Anotasi", tab "Warna per lesi"); until those are
// supplied, an interim Okabe–Ito colour-blind-safe palette is used and says so.
import type { ContrastBand } from './types/skin';

export const LESION_COLOURS_SOURCE = 'Interim Okabe–Ito palette, not yet the Geti label colours';

const COLOURS: Record<string, string> = {
  papule: '#D55E00',
  pustule: '#E69F00',
  nodule_cyst: '#CC79A7',
  whitehead: '#56B4E9',
  blackhead: '#0072B2',
};
const UNKNOWN = '#999999';

export const lesionColour = (label: string) => COLOURS[label] ?? UNKNOWN;

// Fill opacity per contrast band in the gradient view: a presentation choice,
// light enough that the skin under the box stays visible. No band: outline only.
export const BAND_FILL_OPACITY: Record<ContrastBand, number> = { imperceptible: 0, faint: 0.15, clear: 0.3, marked: 0.45 };
