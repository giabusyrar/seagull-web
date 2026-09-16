declare const CONTRACT_SCHEMAS: {
    readonly evaluateRequest: {
        $schema: string;
        $id: string;
        properties: {
            brand_id: {
                type: string;
            };
            application_id: {
                type: string;
            };
            customer_token: {
                type: string;
            };
            customer_conditions: {
                additionalProperties: {
                    type: string;
                };
                type: string;
            };
            form: {
                properties: {
                    form_id: {
                        type: string;
                    };
                    answers: {
                        type: string;
                    };
                };
                additionalProperties: boolean;
                type: string;
                required: string[];
            };
            vision: {
                properties: {
                    photo_url: {
                        type: string;
                    };
                    analysis_type: {
                        type: string;
                    };
                    metrics: {
                        additionalProperties: {
                            type: string;
                        };
                        type: string;
                    };
                };
                additionalProperties: boolean;
                type: string;
            };
            fusion_config: {
                properties: {
                    strategy: {
                        type: string;
                    };
                    default_weights: {
                        properties: {
                            form: {
                                type: string;
                            };
                            vision: {
                                type: string;
                            };
                        };
                        additionalProperties: boolean;
                        type: string;
                        required: string[];
                    };
                    dimension_weights: {
                        additionalProperties: {
                            properties: {
                                form: {
                                    type: string;
                                };
                                vision: {
                                    type: string;
                                };
                            };
                            additionalProperties: boolean;
                            type: string;
                            required: string[];
                        };
                        type: string;
                    };
                };
                additionalProperties: boolean;
                type: string;
            };
            metadata: {
                type: string;
            };
        };
        additionalProperties: boolean;
        type: string;
        required: string[];
        description: string;
    };
    readonly evaluateResponse: {
        $schema: string;
        $id: string;
        properties: {
            success: {
                type: string;
            };
            brand_id: {
                type: string;
            };
            application_id: {
                type: string;
            };
            total_score: {
                type: string;
            };
            dimension_scores: {
                additionalProperties: {
                    type: string;
                };
                type: string;
            };
            skin_profile: {
                properties: {
                    code: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    axis_values: {
                        additionalProperties: {
                            type: string;
                        };
                        type: string;
                    };
                    traits: {
                        items: {
                            type: string;
                        };
                        type: string;
                    };
                };
                additionalProperties: boolean;
                type: string;
                required: string[];
            };
            skin_grading_tiers: {
                items: {
                    properties: {
                        dimension_key: {
                            type: string;
                        };
                        score: {
                            type: string;
                        };
                        grade_name: {
                            type: string;
                        };
                        severity: {
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                    type: string;
                    required: string[];
                };
                type: string;
            };
            recommended_products: {
                items: {
                    properties: {
                        sku: {
                            type: string;
                        };
                        name: {
                            type: string;
                        };
                        brand: {
                            type: string;
                        };
                        category: {
                            type: string;
                        };
                        match_reason: {
                            type: string;
                        };
                        score_confidence: {
                            type: string;
                        };
                        image_url: {
                            type: string;
                        };
                        active_actives: {
                            items: {
                                type: string;
                            };
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                    type: string;
                    required: string[];
                };
                type: string;
            };
            execution_time_ms: {
                type: string;
            };
        };
        additionalProperties: boolean;
        type: string;
        required: string[];
        description: string;
    };
    readonly fusionConfig: {
        $schema: string;
        $id: string;
        properties: {
            strategy: {
                type: string;
            };
            default_weights: {
                properties: {
                    form: {
                        type: string;
                    };
                    vision: {
                        type: string;
                    };
                };
                additionalProperties: boolean;
                type: string;
                required: string[];
            };
            dimension_weights: {
                additionalProperties: {
                    properties: {
                        form: {
                            type: string;
                        };
                        vision: {
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                    type: string;
                    required: string[];
                };
                type: string;
            };
        };
        additionalProperties: boolean;
        type: string;
        description: string;
    };
    readonly skinProfile: {
        $schema: string;
        $id: string;
        properties: {
            code: {
                type: string;
            };
            name: {
                type: string;
            };
            description: {
                type: string;
            };
            axis_values: {
                additionalProperties: {
                    type: string;
                };
                type: string;
            };
            traits: {
                items: {
                    type: string;
                };
                type: string;
            };
        };
        additionalProperties: boolean;
        type: string;
        required: string[];
        description: string;
    };
    readonly productRecommend: {
        $schema: string;
        $id: string;
        properties: {
            sku: {
                type: string;
            };
            name: {
                type: string;
            };
            brand: {
                type: string;
            };
            category: {
                type: string;
            };
            match_reason: {
                type: string;
            };
            score_confidence: {
                type: string;
            };
            image_url: {
                type: string;
            };
            active_actives: {
                items: {
                    type: string;
                };
                type: string;
            };
        };
        additionalProperties: boolean;
        type: string;
        required: string[];
        description: string;
    };
    readonly skinGradingTier: {
        $schema: string;
        $id: string;
        properties: {
            dimension_key: {
                type: string;
            };
            score: {
                type: string;
            };
            grade_name: {
                type: string;
            };
            severity: {
                type: string;
            };
        };
        additionalProperties: boolean;
        type: string;
        required: string[];
        description: string;
    };
};
interface DimensionWeight {
    form: number;
    vision: number;
}
interface FusionConfig {
    strategy?: string;
    default_weights?: DimensionWeight;
    dimension_weights?: Record<string, DimensionWeight>;
}
interface FormPayload {
    form_id: string;
    answers: Record<string, any>;
}
interface VisionPayload {
    photo_url?: string;
    analysis_type?: string;
    metrics?: Record<string, number>;
}
interface UnifiedAssessmentRequest {
    brand_id: string;
    application_id: string;
    customer_token?: string;
    customer_conditions?: Record<string, boolean>;
    form?: FormPayload;
    vision?: VisionPayload;
    fusion_config?: FusionConfig;
    metadata?: Record<string, any>;
}
interface SkinGradingTier {
    dimension_key: string;
    score: number;
    grade_name: string;
    severity: string;
}
interface SkinProfile {
    code: string;
    name: string;
    description: string;
    axis_values?: Record<string, string>;
    traits?: string[];
}
interface RecommendedProduct {
    sku: string;
    name: string;
    brand: string;
    category: string;
    match_reason: string;
    score_confidence: number;
    image_url?: string;
    active_actives?: string[];
}
interface UnifiedAssessmentResponse {
    success: boolean;
    brand_id: string;
    application_id: string;
    total_score: number;
    dimension_scores: Record<string, number>;
    skin_profile: SkinProfile;
    skin_grading_tiers: SkinGradingTier[];
    recommended_products: RecommendedProduct[];
    execution_time_ms: number;
}

declare const index_CONTRACT_SCHEMAS: typeof CONTRACT_SCHEMAS;
type index_DimensionWeight = DimensionWeight;
type index_FormPayload = FormPayload;
type index_FusionConfig = FusionConfig;
type index_RecommendedProduct = RecommendedProduct;
type index_SkinGradingTier = SkinGradingTier;
type index_SkinProfile = SkinProfile;
type index_UnifiedAssessmentRequest = UnifiedAssessmentRequest;
type index_UnifiedAssessmentResponse = UnifiedAssessmentResponse;
type index_VisionPayload = VisionPayload;
declare namespace index {
  export { index_CONTRACT_SCHEMAS as CONTRACT_SCHEMAS, type index_DimensionWeight as DimensionWeight, type index_FormPayload as FormPayload, type index_FusionConfig as FusionConfig, type index_RecommendedProduct as RecommendedProduct, type index_SkinGradingTier as SkinGradingTier, type index_SkinProfile as SkinProfile, type index_UnifiedAssessmentRequest as UnifiedAssessmentRequest, type index_UnifiedAssessmentResponse as UnifiedAssessmentResponse, type index_VisionPayload as VisionPayload };
}

export { CONTRACT_SCHEMAS as C, type DimensionWeight as D, type FormPayload as F, type RecommendedProduct as R, type SkinGradingTier as S, type UnifiedAssessmentRequest as U, type VisionPayload as V, type UnifiedAssessmentResponse as a, type FusionConfig as b, type SkinProfile as c, index as i };
