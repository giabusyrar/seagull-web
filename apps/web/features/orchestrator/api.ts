import type { AssessmentPayload, UnifiedAssessmentResponse } from '@gateway-experience/studio/orchestrator';

/** Runs the assessment pipeline server-side (/api/orchestrator/pipeline). Null on an error status. */
export async function runPipelineSimulation(payload: AssessmentPayload): Promise<UnifiedAssessmentResponse | null> {
  const res = await fetch('/api/orchestrator/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok ? ((await res.json()) as UnifiedAssessmentResponse) : null;
}
