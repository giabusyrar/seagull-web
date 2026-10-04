'use client';
import { useState, useCallback } from 'react';
import type { BeautyClientConfig } from '../core/types';
import type { AssessmentEvaluateResponse } from '../core/assessment-types';
import {
  gatewayAssessmentEvaluator,
  type AssessmentEvaluateInput,
  type AssessmentEvaluator,
} from '../core/evaluate-assessment';

export interface UseSkinAssessmentOptions extends BeautyClientConfig {
  /**
   * Evaluates the survey. Defaults to calling the gateway directly with this
   * config, as the hook always has.
   */
  evaluator?: AssessmentEvaluator;
}

export function useSkinAssessment(config: UseSkinAssessmentOptions) {
  // Fixed on first render, as the client it replaces was.
  const [evaluator] = useState<AssessmentEvaluator>(() => config.evaluator ?? gatewayAssessmentEvaluator(config));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AssessmentEvaluateResponse | null>(null);

  const evaluate = useCallback(
    async (surveyCode: string, request: AssessmentEvaluateInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await evaluator.evaluateAssessment(surveyCode, request);
        setResult(data);
        return data;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [evaluator]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    evaluate,
    reset,
    isLoading,
    error,
    result,
  };
}
