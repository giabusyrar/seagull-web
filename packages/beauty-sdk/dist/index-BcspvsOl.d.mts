import React from 'react';
import { FacialZoneData, ZoneUvMetric, AgingProgressionResult, BeautyClientConfig, VisionAnalysisResponse } from './types/index.mjs';

interface DimensionOption {
    value: string;
    label: string;
    description?: string;
}
interface DimensionSelectorProps {
    dimension: string;
    label?: string;
    options: (string | DimensionOption)[];
    value?: string | string[];
    mode?: 'single' | 'multi';
    onChange?: (val: string | string[]) => void;
    className?: string;
}
declare const DimensionSelector: React.FC<DimensionSelectorProps>;

interface DimensionScoreCardProps {
    dimension: string;
    title?: string;
    score: number;
    gradeName?: string;
    severity?: 'mild' | 'moderate' | 'severe' | string;
    variant?: 'gauge' | 'spectrum-bar';
    className?: string;
}
declare const DimensionScoreCard: React.FC<DimensionScoreCardProps>;

interface ProductRecommendationCardProps {
    sku: string;
    name: string;
    brand?: string;
    category?: string;
    matchReason?: string;
    scoreConfidence?: number;
    imageURL?: string;
    activeIngredients?: string[];
    onAddToCart?: (sku: string) => void;
    className?: string;
}
declare const ProductRecommendationCard: React.FC<ProductRecommendationCardProps>;

interface PolygonHeatmapProps {
    imageSrc: string;
    zones: FacialZoneData[];
    zoneMetrics?: Record<string, ZoneUvMetric>;
    selectedZoneCode?: string | null;
    onSelectZone?: (zoneCode: string) => void;
    className?: string;
}
declare const PolygonHeatmap: React.FC<PolygonHeatmapProps>;

interface AgingProgressionSliderProps {
    agingData?: AgingProgressionResult;
    className?: string;
}
declare const AgingProgressionSlider: React.FC<AgingProgressionSliderProps>;

interface BeautyExperienceWidgetProps extends BeautyClientConfig {
    onComplete?: (result: VisionAnalysisResponse) => void;
    onAddToCart?: (sku: string) => void;
    initialAge?: number;
    initialUvIndex?: number;
    className?: string;
}
declare const BeautyExperienceWidget: React.FC<BeautyExperienceWidgetProps>;

declare const index_AgingProgressionSlider: typeof AgingProgressionSlider;
type index_AgingProgressionSliderProps = AgingProgressionSliderProps;
declare const index_BeautyExperienceWidget: typeof BeautyExperienceWidget;
type index_BeautyExperienceWidgetProps = BeautyExperienceWidgetProps;
type index_DimensionOption = DimensionOption;
declare const index_DimensionScoreCard: typeof DimensionScoreCard;
type index_DimensionScoreCardProps = DimensionScoreCardProps;
declare const index_DimensionSelector: typeof DimensionSelector;
type index_DimensionSelectorProps = DimensionSelectorProps;
declare const index_PolygonHeatmap: typeof PolygonHeatmap;
type index_PolygonHeatmapProps = PolygonHeatmapProps;
declare const index_ProductRecommendationCard: typeof ProductRecommendationCard;
type index_ProductRecommendationCardProps = ProductRecommendationCardProps;
declare namespace index {
  export { index_AgingProgressionSlider as AgingProgressionSlider, type index_AgingProgressionSliderProps as AgingProgressionSliderProps, index_BeautyExperienceWidget as BeautyExperienceWidget, type index_BeautyExperienceWidgetProps as BeautyExperienceWidgetProps, type index_DimensionOption as DimensionOption, index_DimensionScoreCard as DimensionScoreCard, type index_DimensionScoreCardProps as DimensionScoreCardProps, index_DimensionSelector as DimensionSelector, type index_DimensionSelectorProps as DimensionSelectorProps, index_PolygonHeatmap as PolygonHeatmap, type index_PolygonHeatmapProps as PolygonHeatmapProps, index_ProductRecommendationCard as ProductRecommendationCard, type index_ProductRecommendationCardProps as ProductRecommendationCardProps };
}

export { AgingProgressionSlider as A, BeautyExperienceWidget as B, type DimensionOption as D, PolygonHeatmap as P, type AgingProgressionSliderProps as a, type BeautyExperienceWidgetProps as b, DimensionScoreCard as c, type DimensionScoreCardProps as d, DimensionSelector as e, type DimensionSelectorProps as f, type PolygonHeatmapProps as g, ProductRecommendationCard as h, type ProductRecommendationCardProps as i, index as j };
