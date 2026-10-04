import { BeautyClientConfig, VisionAnalysisOptions, VisionAnalysisResponse, AgingProgressionResult, AgingTimelinePoint, ClinicalSummary, EnvironmentalContext, FacialZoneData, NormalizedPoint, RecommendedProduct, ZoneUvMetric } from './types/index.mjs';
import { A as AssessmentEvaluateInput, b as AssessmentEvaluateResponse, c as AssessmentEvaluateRequest, a as AssessmentEvaluator, e as evaluateAssessment, g as gatewayAssessmentEvaluator } from './evaluate-assessment-wMND-bNb.mjs';

declare class FormSubClient {
    private client;
    constructor(client: BeautyClient);
    evaluate(code: string, payload: {
        answers: any;
        customer_conditions?: Record<string, boolean>;
        brand_id?: string;
        application_id?: string;
    }): Promise<any>;
    getQuestionnaire(code: string): Promise<any>;
}
declare class VisionSubClient {
    private client;
    constructor(client: BeautyClient);
    analyzeImages(images: Blob | Blob[], options?: VisionAnalysisOptions): Promise<VisionAnalysisResponse>;
    analyzeImage(imageBlob: Blob, options?: VisionAnalysisOptions): Promise<VisionAnalysisResponse>;
}
declare class MatchSubClient {
    private client;
    constructor(client: BeautyClient);
    evaluate(payload: {
        dimension_scores: Record<string, number>;
        customer_conditions?: Record<string, boolean>;
        preferences?: any;
        brand_id?: string;
        application_id?: string;
    }): Promise<any>;
}
declare class ReferenceSubClient {
    private client;
    constructor(client: BeautyClient);
    getSkinDimensions(): Promise<any>;
}
declare class AssessmentsSubClient {
    private client;
    constructor(client: BeautyClient);
    evaluate(surveyCode: string, request: Omit<AssessmentEvaluateRequest, 'brand_id' | 'application_id'> & {
        brand_id?: string;
        application_id?: string;
    }): Promise<AssessmentEvaluateResponse>;
}
/**
 * @deprecated The legacy gateway client. New code should use
 * `createBeautyClient` from `@gateway-experience/beauty-sdk/client`, which
 * goes through a brand proxy in the browser. For assessment evaluation,
 * which that client does not cover yet, use `evaluateAssessment` or
 * `gatewayAssessmentEvaluator` from this module. Kept, unchanged in
 * behaviour, for existing integrations.
 */
declare class BeautyClient {
    config: BeautyClientConfig;
    form: FormSubClient;
    vision: VisionSubClient;
    match: MatchSubClient;
    reference: ReferenceSubClient;
    assessments: AssessmentsSubClient;
    constructor(config: BeautyClientConfig);
    /**
     * Internal generic request helper with auth headers
     */
    request<T = any>(path: string, options?: RequestInit): Promise<T>;
    /** Evaluate one survey and store the result as a customer assessment (see evaluateAssessment). */
    evaluateAssessment(surveyCode: string, request: AssessmentEvaluateInput): Promise<AssessmentEvaluateResponse>;
    /**
     * Submits unlabelled face captures to Vision Engine in a single call.
     * Head pose and 8-zone arbitration are executed autonomously on the backend.
     */
    analyzeImages(images: Blob | Blob[], options?: VisionAnalysisOptions): Promise<VisionAnalysisResponse>;
    /**
     * Submits a single captured face image to Vision Engine.
     */
    analyzeImage(imageBlob: Blob, options?: VisionAnalysisOptions): Promise<VisionAnalysisResponse>;
}

declare const index_AgingProgressionResult: typeof AgingProgressionResult;
declare const index_AgingTimelinePoint: typeof AgingTimelinePoint;
declare const index_AssessmentEvaluateInput: typeof AssessmentEvaluateInput;
declare const index_AssessmentEvaluator: typeof AssessmentEvaluator;
type index_AssessmentsSubClient = AssessmentsSubClient;
declare const index_AssessmentsSubClient: typeof AssessmentsSubClient;
type index_BeautyClient = BeautyClient;
declare const index_BeautyClient: typeof BeautyClient;
declare const index_BeautyClientConfig: typeof BeautyClientConfig;
declare const index_ClinicalSummary: typeof ClinicalSummary;
declare const index_EnvironmentalContext: typeof EnvironmentalContext;
declare const index_FacialZoneData: typeof FacialZoneData;
type index_FormSubClient = FormSubClient;
declare const index_FormSubClient: typeof FormSubClient;
type index_MatchSubClient = MatchSubClient;
declare const index_MatchSubClient: typeof MatchSubClient;
declare const index_NormalizedPoint: typeof NormalizedPoint;
declare const index_RecommendedProduct: typeof RecommendedProduct;
type index_ReferenceSubClient = ReferenceSubClient;
declare const index_ReferenceSubClient: typeof ReferenceSubClient;
declare const index_VisionAnalysisOptions: typeof VisionAnalysisOptions;
declare const index_VisionAnalysisResponse: typeof VisionAnalysisResponse;
type index_VisionSubClient = VisionSubClient;
declare const index_VisionSubClient: typeof VisionSubClient;
declare const index_ZoneUvMetric: typeof ZoneUvMetric;
declare const index_evaluateAssessment: typeof evaluateAssessment;
declare const index_gatewayAssessmentEvaluator: typeof gatewayAssessmentEvaluator;
declare namespace index {
  export { index_AgingProgressionResult as AgingProgressionResult, index_AgingTimelinePoint as AgingTimelinePoint, index_AssessmentEvaluateInput as AssessmentEvaluateInput, index_AssessmentEvaluator as AssessmentEvaluator, index_AssessmentsSubClient as AssessmentsSubClient, index_BeautyClient as BeautyClient, index_BeautyClientConfig as BeautyClientConfig, index_ClinicalSummary as ClinicalSummary, index_EnvironmentalContext as EnvironmentalContext, index_FacialZoneData as FacialZoneData, index_FormSubClient as FormSubClient, index_MatchSubClient as MatchSubClient, index_NormalizedPoint as NormalizedPoint, index_RecommendedProduct as RecommendedProduct, index_ReferenceSubClient as ReferenceSubClient, index_VisionAnalysisOptions as VisionAnalysisOptions, index_VisionAnalysisResponse as VisionAnalysisResponse, index_VisionSubClient as VisionSubClient, index_ZoneUvMetric as ZoneUvMetric, index_evaluateAssessment as evaluateAssessment, index_gatewayAssessmentEvaluator as gatewayAssessmentEvaluator };
}

export { AssessmentsSubClient as A, BeautyClient as B, FormSubClient as F, MatchSubClient as M, ReferenceSubClient as R, VisionSubClient as V, index as i };
