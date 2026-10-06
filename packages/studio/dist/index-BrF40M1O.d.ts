import React from 'react';

declare const MatchManager: React.FC;

interface SkinGradingRule {
    id: string;
    brandId?: string;
    applicationId?: string;
    dimensionKey: string;
    minScore: number;
    maxScore: number;
    gradeName: string;
    tierSeverity: 'mild' | 'moderate' | 'severe' | 'critical';
    recommendedTexture?: string;
    avoidFormulationTypes?: string;
    createdAt?: string;
}
interface ConflictMatrixRule {
    id: string;
    brandId?: string;
    applicationId?: string;
    ingredientA: string;
    ingredientB: string;
    conflictType: 'incompatible' | 'pH_clash' | 'over_exfoliation';
    resolutionAction: 'split_am_pm' | 'spacing_15_mins' | 'alternate_days' | 'strict_block';
    severity: 'low' | 'moderate' | 'high' | 'critical';
    warningMessage?: string;
    createdAt?: string;
}
interface ProductCatalogItem {
    id: string;
    brandId: string;
    name: string;
    category: string;
    texture: string;
    /** Ingredient names, whole: an INCI name may contain a comma (1,2-Hexanediol). */
    ingredients?: string[];
    keyActives?: string;
    imageUrl?: string;
    isActive?: boolean;
    createdAt?: string;
}
interface ProductGroup {
    id: string;
    brandId: string;
    applicationId?: string;
    name: string;
    code?: string;
    description?: string;
    productIds: string[];
    categories: string[];
    isActive: boolean;
    createdAt?: string;
}
interface ProductMatchItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    texture: string;
    matchScore: number;
    whySelected?: string[];
    keyActives?: string[];
    imageUrl?: string;
}
interface RegimenStep {
    stepNumber: number;
    stepName: string;
    category: string;
    recommendedTexture?: string;
    primaryProduct?: ProductMatchItem;
    alternatives?: ProductMatchItem[];
}
/** A routine slot nothing in the catalogue filled, and why. */
interface UnfilledSlot {
    slotId?: string;
    category?: string;
    required?: boolean;
    reason?: string;
}
interface ClinicalMatchResult {
    /** Labels the response; absent on a dry run. */
    matchId?: string;
    brandId: string;
    applicationId: string;
    dryRun?: boolean;
    profileSummary: {
        /** Absent when the request carried no skin profile; skinTypeUnavailable says why. */
        skinType?: string;
        profileCode?: string;
        skinTypeSource?: string;
        skinTypeUnavailable?: string;
        primaryConcerns?: string[];
        /** Dropped by the match engine on 2026-10-01: it was the constant 94.5
         *  for every request. Optional so a caller must check before showing it. */
        overallSuitabilityScore?: number;
    };
    regimens: {
        amRoutine?: RegimenStep[];
        pmRoutine?: RegimenStep[];
        phases?: Record<string, RegimenStep[]>;
        unfilledSlots?: Record<string, UnfilledSlot[]>;
    };
    clinicalConflictMatrix: {
        conflictsDetected?: number;
        layeringRulesApplied?: string[];
        warnings?: string[];
    };
    evaluatedAt: string;
}

type index_ClinicalMatchResult = ClinicalMatchResult;
type index_ConflictMatrixRule = ConflictMatrixRule;
declare const index_MatchManager: typeof MatchManager;
type index_ProductCatalogItem = ProductCatalogItem;
type index_ProductGroup = ProductGroup;
type index_ProductMatchItem = ProductMatchItem;
type index_RegimenStep = RegimenStep;
type index_SkinGradingRule = SkinGradingRule;
declare namespace index {
  export { type index_ClinicalMatchResult as ClinicalMatchResult, type index_ConflictMatrixRule as ConflictMatrixRule, index_MatchManager as MatchManager, type index_ProductCatalogItem as ProductCatalogItem, type index_ProductGroup as ProductGroup, type index_ProductMatchItem as ProductMatchItem, type index_RegimenStep as RegimenStep, type index_SkinGradingRule as SkinGradingRule };
}

export { type ClinicalMatchResult as C, MatchManager as M, type ProductCatalogItem as P, type RegimenStep as R, type SkinGradingRule as S, type ConflictMatrixRule as a, type ProductGroup as b, type ProductMatchItem as c, index as i };
