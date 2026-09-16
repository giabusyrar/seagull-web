import { AgingProgressionResult, AgingTimelinePoint, BeautyClientConfig, ClinicalSummary, EnvironmentalContext, FacialZoneData, NormalizedPoint, RecommendedProduct, VisionAnalysisOptions, VisionAnalysisResponse, ZoneUvMetric } from './types/index.js';
import { AssessmentsSubClient, BeautyClient, FormSubClient, MatchSubClient, ReferenceSubClient, VisionSubClient } from './client/index.js';

/**
 * Dynamic API Gateway Core Collection Resolver
 * Parameterizes all frontend interactive studios, Try-On features, runners,
 * and simulators via dynamic collections registered in the API Gateway.
 */
type CoreCollectionKey = 'form' | 'score' | 'match' | 'vision' | 'reference' | 'form-engine' | 'score-engine' | 'match-engine' | 'vision-engine' | 'reference-service';
interface DynamicCollectionRoute {
    id?: string;
    name: string;
    method: string;
    originalPattern: string;
}
interface DynamicCollection {
    id: string;
    name: string;
    type: string;
    originalPrefix?: string;
    activeTargetHost?: string;
    activeEnvironmentId?: string;
    routes?: DynamicCollectionRoute[];
}
/**
 * Fetch all active Core Collections from the API Gateway database
 */
declare function getActiveCoreCollections(forceRefresh?: boolean): Promise<DynamicCollection[]>;
/**
 * Normalizes a collection key into standard original prefix
 */
declare function getCollectionPrefix(key: CoreCollectionKey): string;
/**
 * Resolves a dynamic endpoint path for a given Core Collection and Route
 */
declare function resolveDynamicEndpoint(key: CoreCollectionKey, routePattern: string, collections?: DynamicCollection[]): string;

declare const index_AgingProgressionResult: typeof AgingProgressionResult;
declare const index_AgingTimelinePoint: typeof AgingTimelinePoint;
declare const index_AssessmentsSubClient: typeof AssessmentsSubClient;
declare const index_BeautyClient: typeof BeautyClient;
declare const index_BeautyClientConfig: typeof BeautyClientConfig;
declare const index_ClinicalSummary: typeof ClinicalSummary;
type index_CoreCollectionKey = CoreCollectionKey;
type index_DynamicCollection = DynamicCollection;
type index_DynamicCollectionRoute = DynamicCollectionRoute;
declare const index_EnvironmentalContext: typeof EnvironmentalContext;
declare const index_FacialZoneData: typeof FacialZoneData;
declare const index_FormSubClient: typeof FormSubClient;
declare const index_MatchSubClient: typeof MatchSubClient;
declare const index_NormalizedPoint: typeof NormalizedPoint;
declare const index_RecommendedProduct: typeof RecommendedProduct;
declare const index_ReferenceSubClient: typeof ReferenceSubClient;
declare const index_VisionAnalysisOptions: typeof VisionAnalysisOptions;
declare const index_VisionAnalysisResponse: typeof VisionAnalysisResponse;
declare const index_VisionSubClient: typeof VisionSubClient;
declare const index_ZoneUvMetric: typeof ZoneUvMetric;
declare const index_getActiveCoreCollections: typeof getActiveCoreCollections;
declare const index_getCollectionPrefix: typeof getCollectionPrefix;
declare const index_resolveDynamicEndpoint: typeof resolveDynamicEndpoint;
declare namespace index {
  export { index_AgingProgressionResult as AgingProgressionResult, index_AgingTimelinePoint as AgingTimelinePoint, index_AssessmentsSubClient as AssessmentsSubClient, index_BeautyClient as BeautyClient, index_BeautyClientConfig as BeautyClientConfig, index_ClinicalSummary as ClinicalSummary, type index_CoreCollectionKey as CoreCollectionKey, type index_DynamicCollection as DynamicCollection, type index_DynamicCollectionRoute as DynamicCollectionRoute, index_EnvironmentalContext as EnvironmentalContext, index_FacialZoneData as FacialZoneData, index_FormSubClient as FormSubClient, index_MatchSubClient as MatchSubClient, index_NormalizedPoint as NormalizedPoint, index_RecommendedProduct as RecommendedProduct, index_ReferenceSubClient as ReferenceSubClient, index_VisionAnalysisOptions as VisionAnalysisOptions, index_VisionAnalysisResponse as VisionAnalysisResponse, index_VisionSubClient as VisionSubClient, index_ZoneUvMetric as ZoneUvMetric, index_getActiveCoreCollections as getActiveCoreCollections, index_getCollectionPrefix as getCollectionPrefix, index_resolveDynamicEndpoint as resolveDynamicEndpoint };
}

export { type CoreCollectionKey as C, type DynamicCollection as D, type DynamicCollectionRoute as a, getCollectionPrefix as b, getActiveCoreCollections as g, index as i, resolveDynamicEndpoint as r };
