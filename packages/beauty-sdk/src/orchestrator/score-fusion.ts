export function fuseDimensionScores(
  formScores: Record<string, number>,
  visionScores: Record<string, number>,
  weights: Record<string, { formWeight: number; visionWeight: number }> = {}
): Record<string, number> {
  const allKeys = Array.from(new Set([...Object.keys(formScores), ...Object.keys(visionScores)]));
  const fused: Record<string, number> = {};

  for (const key of allKeys) {
    const formVal = formScores[key];
    const visionVal = visionScores[key];
    const weightConfig = weights[key] || { formWeight: 0.5, visionWeight: 0.5 };

    if (formVal !== undefined && visionVal !== undefined) {
      const totalWeight = weightConfig.formWeight + weightConfig.visionWeight || 1;
      const normalizedFormWeight = weightConfig.formWeight / totalWeight;
      const normalizedVisionWeight = weightConfig.visionWeight / totalWeight;
      fused[key] = Math.round(formVal * normalizedFormWeight + visionVal * normalizedVisionWeight);
    } else if (formVal !== undefined) {
      fused[key] = Math.round(formVal);
    } else if (visionVal !== undefined) {
      fused[key] = Math.round(visionVal);
    }
  }

  return fused;
}
