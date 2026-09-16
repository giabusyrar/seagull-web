interface NormalizedPoint {
    x: number;
    y: number;
}
interface FacialZoneData {
    zoneCode: string;
    zoneName: string;
    polygon: NormalizedPoint[];
    boundingBox: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
}
interface ZoneUvMetric {
    zoneCode: string;
    coverageScore: number;
    status: 'optimal' | 'mild_issue' | 'moderate_issue' | 'uncovered' | string;
    detectedIssues: string[];
}
interface AgingTimelinePoint {
    targetAge: number;
    yearsAhead: number;
    withRegimen: number;
    withoutRegimen: number;
}
interface AgingProgressionResult {
    currentAge: number;
    scoreNow: number;
    scorePlus10WithRegimen: number;
    scorePlus10WithoutRegimen: number;
    scorePlus20WithRegimen: number;
    scorePlus20WithoutRegimen: number;
    biologicalAgeOffset: number;
    timeline?: AgingTimelinePoint[];
}
interface ClinicalSummary {
    chronologicalAge: number;
    predictedBiologicalAge: number;
    biologicalAgeOffset: number;
    protectionLevel: string;
    longevityTier: string;
    missedZones: string[];
}
interface EnvironmentalContext {
    uvIndex: number;
    latitude?: number;
    longitude?: number;
    weatherCondition?: string;
}
interface VisionAnalysisOptions {
    dimensions?: string[];
    skinConcerns?: string[];
    currentAge?: number;
    chronologicalAge?: number;
    uvIndex?: number;
    baselineScore?: number;
    regimenEfficacyFactor?: number;
}
interface RecommendedProduct {
    sku: string;
    name: string;
    category: string;
    targetZones?: string[];
    reason: string;
}
interface VisionAnalysisResponse {
    success: boolean;
    zones: FacialZoneData[];
    zoneMetrics: Record<string, ZoneUvMetric>;
    overallCoverageScore: number;
    skinLongevityScore: number;
    globalScores: {
        UV_DEFENSE: number;
        SKIN_LONGEVITY: number;
        [key: string]: number;
    };
    agingSimulation?: AgingProgressionResult;
    clinicalSummary?: ClinicalSummary;
    environmentalContext?: EnvironmentalContext;
    recommendedProducts: RecommendedProduct[];
    executionTimeMs?: number;
    annotatedImageBase64?: string;
}
interface BeautyClientConfig {
    gatewayUrl: string;
    apiKey?: string;
    token?: string;
    brandId: string;
    applicationId: string;
}

export type { AgingProgressionResult, AgingTimelinePoint, BeautyClientConfig, ClinicalSummary, EnvironmentalContext, FacialZoneData, NormalizedPoint, RecommendedProduct, VisionAnalysisOptions, VisionAnalysisResponse, ZoneUvMetric };
