import React from 'react';
import { FacialZoneData, ZoneUvMetric, AgingProgressionResult, BeautyClientConfig, VisionAnalysisResponse } from './types/index.js';

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

/** How a card is coloured. `neutral` when nothing graded the score. */
type DimensionScoreTone = 'good' | 'warning' | 'bad' | 'neutral';
interface DimensionScoreCardProps {
    dimension: string;
    title?: string;
    score: number;
    gradeName?: string;
    /** The engine's grading of this score (its severity or tier name). Colours
     *  the badge and bar when it is one of the known names; otherwise the card
     *  stays neutral. Omitted: neutral. */
    severity?: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical' | string;
    /** Colour to use, overriding `severity` — for an integrator whose grading
     *  uses other names. The card never derives a colour from the number. */
    tone?: DimensionScoreTone;
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
    /** Dimension codes to analyse, as the tenant's reference data names them.
     *  Omitted: no `dimensions` field is sent and the engine applies the
     *  application's own configuration. */
    dimensions?: string[];
    /** The customer's age in years, if known. Omitted: not sent. */
    initialAge?: number;
    /** The UV index at the customer's location, if known. Omitted: not sent. */
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
type index_DimensionScoreTone = DimensionScoreTone;
declare const index_DimensionSelector: typeof DimensionSelector;
type index_DimensionSelectorProps = DimensionSelectorProps;
declare const index_PolygonHeatmap: typeof PolygonHeatmap;
type index_PolygonHeatmapProps = PolygonHeatmapProps;
declare const index_ProductRecommendationCard: typeof ProductRecommendationCard;
type index_ProductRecommendationCardProps = ProductRecommendationCardProps;
declare namespace index {
  export { index_AgingProgressionSlider as AgingProgressionSlider, type index_AgingProgressionSliderProps as AgingProgressionSliderProps, index_BeautyExperienceWidget as BeautyExperienceWidget, type index_BeautyExperienceWidgetProps as BeautyExperienceWidgetProps, type index_DimensionOption as DimensionOption, index_DimensionScoreCard as DimensionScoreCard, type index_DimensionScoreCardProps as DimensionScoreCardProps, type index_DimensionScoreTone as DimensionScoreTone, index_DimensionSelector as DimensionSelector, type index_DimensionSelectorProps as DimensionSelectorProps, index_PolygonHeatmap as PolygonHeatmap, type index_PolygonHeatmapProps as PolygonHeatmapProps, index_ProductRecommendationCard as ProductRecommendationCard, type index_ProductRecommendationCardProps as ProductRecommendationCardProps };
}

export { AgingProgressionSlider as A, BeautyExperienceWidget as B, type DimensionOption as D, PolygonHeatmap as P, type AgingProgressionSliderProps as a, type BeautyExperienceWidgetProps as b, DimensionScoreCard as c, type DimensionScoreCardProps as d, type DimensionScoreTone as e, DimensionSelector as f, type DimensionSelectorProps as g, type PolygonHeatmapProps as h, ProductRecommendationCard as i, type ProductRecommendationCardProps as j, index as k };
