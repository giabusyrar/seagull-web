import { BeautyClientConfig, VisionAnalysisOptions, VisionAnalysisResponse } from '../types/index.js';
import { U as UnifiedAssessmentRequest, a as UnifiedAssessmentResponse } from '../index-C88w3aAT.js';

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
    evaluate(request: Omit<UnifiedAssessmentRequest, 'brand_id' | 'application_id'> & {
        brand_id?: string;
        application_id?: string;
    }): Promise<UnifiedAssessmentResponse>;
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
     * Unified single-hit multi-modal assessment evaluation (<50ms).
     */
    evaluateAssessment(request: Omit<UnifiedAssessmentRequest, 'brand_id' | 'application_id'> & {
        brand_id?: string;
        application_id?: string;
    }): Promise<UnifiedAssessmentResponse>;
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
