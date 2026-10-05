// How a severity word from core is coloured, once. Core grades with a fixed
// vocabulary (optimal, mild, moderate, severe, critical — the severity of a
// grading tier); only those words are read, exactly, and anything else stays
// neutral rather than guessed at. beauty-sdk (a standalone package) carries an
// identical copy in ui/primitives/DimensionScoreCard.tsx.
export const SEVERITY_TONES = {
    optimal: 'good',
    mild: 'good',
    moderate: 'warning',
    severe: 'bad',
    critical: 'bad',
};
export function severityToneOf(severity) {
    var _a;
    return typeof severity === 'string' ? (_a = SEVERITY_TONES[severity.trim().toLowerCase()]) !== null && _a !== void 0 ? _a : 'neutral' : 'neutral';
}
