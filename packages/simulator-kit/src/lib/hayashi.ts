// The Hayashi acne severity scale: inflammatory eruptions counted on half the
// face. Published, not a deployment setting (Hayashi N, Akamatsu H, Kawashima M
// et al. "Establishment of grading criteria for acne severity." J Dermatol
// 2008;35(5):255-260): mild 0-5, moderate 6-20, severe 21-50, very severe > 50.
// Core grades with the same edges (seagull-core vision/domain/acne.go); this
// copy only draws the scale, the grade shown is core's.

export type HayashiGrade = 'mild' | 'moderate' | 'severe' | 'very_severe';

/** Each grade's upper edge (inclusive) in inflammatory lesions per half face; the last has none. */
export const HAYASHI_BANDS: readonly { grade: HayashiGrade; upTo: number | null }[] = [
  { grade: 'mild', upTo: 5 },
  { grade: 'moderate', upTo: 20 },
  { grade: 'severe', upTo: 50 },
  { grade: 'very_severe', upTo: null },
];

/**
 * Where a count sits on a bar drawn with four equal-width bands, 0..1: linear
 * inside its band. The open last band (> 50) is drawn as wide as the band
 * before it (21-50), and a count beyond that sits at the end.
 */
export function hayashiPosition(count: number): number {
  const edges = [0, ...HAYASHI_BANDS.slice(0, -1).map((b) => b.upTo as number)]; // 0, 5, 20, 50
  const last = edges[edges.length - 1];
  const ends = [...edges.slice(1), last + (last - edges[edges.length - 2])]; // 5, 20, 50, 80
  const n = ends.length;
  const c = Math.max(0, count);
  for (let i = 0; i < n; i++) {
    if (c <= ends[i] || i === n - 1) return Math.min(1, (i + Math.min(1, (c - edges[i]) / (ends[i] - edges[i]))) / n);
  }
  return 1;
}
