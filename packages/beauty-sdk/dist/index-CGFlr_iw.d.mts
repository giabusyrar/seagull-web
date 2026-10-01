import { BeautyClientConfig } from './types/index.mjs';
import { A as AssessmentEvaluateRequest, a as AssessmentEvaluateResponse } from './assessment-types-atxVAW_S.mjs';

interface UseSkinAssessmentOptions extends BeautyClientConfig {
}
declare function useSkinAssessment(config: UseSkinAssessmentOptions): {
    evaluate: (surveyCode: string, request: Omit<AssessmentEvaluateRequest, "brand_id" | "application_id"> & {
        brand_id?: string;
        application_id?: string;
    }) => Promise<AssessmentEvaluateResponse>;
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
