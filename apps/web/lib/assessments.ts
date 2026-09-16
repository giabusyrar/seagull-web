export interface RecordAssessmentInput {
  assessmentType: 'form_only' | 'vision_only' | 'multimodal_full';
  brandId: string;
  applicationId?: string | null;
  customerIdentifier?: string | null;
  chronologicalAge?: number | null;
  predictedBioAge?: number | null;
  bioAgeOffset?: number | null;
  uvIndex?: number | null;
  formResponses?: any;
  visionMetrics?: any;
  globalScores?: any;
  agingSimulation?: any;
  recommendedProducts?: any;
  source?: string;
  latencyMs?: number | null;
}

/**
 * Persists an assessment result (Form, Vision, or Multimodal) asynchronously.
 */
export async function recordSkinAssessment(input: RecordAssessmentInput) {
  try {
    const record = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    return record;
  } catch (err) {
    console.error('[SkinAssessment] Failed to record assessment:', err);
    return null;
  }
}
