'use client';
import { useState, useCallback } from 'react';
import { BeautyClient } from '../core/client';
import type { BeautyClientConfig } from '../core/types';
import type { UnifiedAssessmentRequest, UnifiedAssessmentResponse } from '@gateway-experience/contracts';

export interface UseSkinAssessmentOptions extends BeautyClientConfig {}

export function useSkinAssessment(config: UseSkinAssessmentOptions) {
  const [client] = useState(() => new BeautyClient(config));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<UnifiedAssessmentResponse | null>(null);

  const evaluate = useCallback(
    async (
      request: Omit<UnifiedAssessmentRequest, 'brand_id' | 'application_id'> & {
        brand_id?: string;
        application_id?: string;
      }
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await client.evaluateAssessment(request);
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
    [client]
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
