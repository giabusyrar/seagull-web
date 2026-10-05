// How a severity word from core is coloured, once. Core grades with a fixed
// vocabulary (optimal, mild, moderate, severe, critical — the severity of a
// grading tier); only those words are read, exactly, and anything else stays
// neutral rather than guessed at. beauty-sdk (a standalone package) carries an
// identical copy in ui/primitives/DimensionScoreCard.tsx.

export type SeverityTone = 'good' | 'warning' | 'bad' | 'neutral';

export const SEVERITY_TONES: Readonly<Record<string, SeverityTone>> = {
  optimal: 'good',
  mild: 'good',
  moderate: 'warning',
  severe: 'bad',
  critical: 'bad',
};

export function severityToneOf(severity: unknown): SeverityTone {
  return typeof severity === 'string' ? SEVERITY_TONES[severity.trim().toLowerCase()] ?? 'neutral' : 'neutral';
}
