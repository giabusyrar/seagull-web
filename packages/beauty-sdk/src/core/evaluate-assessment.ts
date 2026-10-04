import type { BeautyClientConfig } from './types';
import type { AssessmentEvaluateRequest, AssessmentEvaluateResponse } from './assessment-types';

/** An assessment request whose scope may come from the client config instead. */
export type AssessmentEvaluateInput = Omit<AssessmentEvaluateRequest, 'brand_id' | 'application_id'> & {
  brand_id?: string;
  application_id?: string;
};

/** Anything that can evaluate a survey into a stored assessment. */
export interface AssessmentEvaluator {
  evaluateAssessment(surveyCode: string, request: AssessmentEvaluateInput): Promise<AssessmentEvaluateResponse>;
}

/**
 * Evaluate one survey and store the result as a customer assessment.
 *
 * core-engine takes the survey code from the path: its handler reads :code
 * and looks the survey up with it, so a call without one finds nothing. The
 * gateway's own /api/v1/assessments/evaluate is being retired.
 *
 * The client/ transport has no forms.evaluate operation yet (see
 * client/operations.ts), so this is the one place the call is made.
 * `config.gatewayUrl` is used as given; gatewayAssessmentEvaluator trims a
 * trailing slash first, as the legacy client's constructor does.
 */
export async function evaluateAssessment(
  config: BeautyClientConfig,
  surveyCode: string,
  request: AssessmentEvaluateInput,
  doFetch: typeof fetch = fetch,
): Promise<AssessmentEvaluateResponse> {
  if (!surveyCode) {
    throw new Error('evaluateAssessment needs a survey code: core-engine looks the survey up by it.');
  }
  const payload: AssessmentEvaluateRequest = {
    ...request,
    brand_id: request.brand_id || config.brandId,
    application_id: request.application_id || config.applicationId,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }
  if (config.token) {
    headers['Authorization'] = `Bearer ${config.token}`;
  }

  const url = `${config.gatewayUrl}/core/form-engine/survey/${encodeURIComponent(surveyCode)}/evaluate`;
  const response = await doFetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Assessment evaluation failed (${response.status}): ${errBody}`);
  }

  return response.json();
}

/** An AssessmentEvaluator that calls the gateway directly with this config. */
export function gatewayAssessmentEvaluator(config: BeautyClientConfig): AssessmentEvaluator {
  const normalized = { ...config, gatewayUrl: config.gatewayUrl.replace(/\/$/, '') };
  return { evaluateAssessment: (surveyCode, request) => evaluateAssessment(normalized, surveyCode, request) };
}
