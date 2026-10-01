import { BeautyClientConfig, VisionAnalysisOptions, VisionAnalysisResponse } from '../types/index.js';
import { A as AssessmentEvaluateRequest, a as AssessmentEvaluateResponse } from '../assessment-types-atxVAW_S.js';

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
    /**
     * Evaluate one survey and store the result as a customer assessment.
     *
     * core-engine takes the survey code from the path: its handler reads :code
     * and looks the survey up with it, so a call without one finds nothing. The
     * gateway's own /api/v1/assessments/evaluate is being retired.
     */
    evaluateAssessment(surveyCode: string, request: Omit<AssessmentEvaluateRequest, 'brand_id' | 'application_id'> & {
        brand_id?: string;
        application_id?: string;
    }): Promise<AssessmentEvaluateResponse>;
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

export { AssessmentsSubClient, BeautyClient, FormSubClient, MatchSubClient, ReferenceSubClient, VisionSubClient };
