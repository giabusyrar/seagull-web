import { BeautyClientConfig } from './types/index.js';
import { a as AssessmentEvaluator, A as AssessmentEvaluateInput, b as AssessmentEvaluateResponse } from './evaluate-assessment-DuXD2_Q7.js';

interface UseSkinAssessmentOptions extends BeautyClientConfig {
    /**
     * Evaluates the survey. Defaults to calling the gateway directly with this
     * config, as the hook always has.
     */
    evaluator?: AssessmentEvaluator;
}
declare function useSkinAssessment(config: UseSkinAssessmentOptions): {
    evaluate: (surveyCode: string, request: AssessmentEvaluateInput) => Promise<AssessmentEvaluateResponse>;
    reset: () => void;
    isLoading: boolean;
    error: Error | null;
    result: AssessmentEvaluateResponse | null;
};

declare function useRegimenMatch(): {
    selectedProducts: string[];
    toggleProduct: (sku: string) => void;
    clearSelection: () => void;
};

type index_UseSkinAssessmentOptions = UseSkinAssessmentOptions;
declare const index_useRegimenMatch: typeof useRegimenMatch;
declare const index_useSkinAssessment: typeof useSkinAssessment;
declare namespace index {
  export { type index_UseSkinAssessmentOptions as UseSkinAssessmentOptions, index_useRegimenMatch as useRegimenMatch, index_useSkinAssessment as useSkinAssessment };
}

export { type UseSkinAssessmentOptions as U, useSkinAssessment as a, index as i, useRegimenMatch as u };
