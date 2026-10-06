import type { SkinProfile, SkinGradingTier } from '@gateway-experience/shared';

export type { SkinProfile, SkinGradingTier };

export interface SkinGradingRule {
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

export interface ConflictMatrixRule {
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

export interface ProductCatalogItem {
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

export interface ProductGroup {
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

export interface Shade {
  id: string;
  productId: string;
  name: string;
  hexColor: string;
  region: 'lip' | 'eye' | 'cheek' | 'skin';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * One shade of the colour engine's try-on catalog (core-engine
 * CatalogShadeOut). `status` is empty when no analysis ran, as for the
 * catalog-only GET; `mode` is the engine's render style.
 */
export interface ColourCatalogShade {
  shadeId: string;
  productId: string;
  productName: string;
  shadeName: string;
  hexColor: string;
  hueName: string;
  status: string;
  colourSource: string;
  mode: string;
}

/** GET /catalog's `catalog`: shades keyed by category (lip, blush, ...). */
export type ColourCatalog = Record<string, ColourCatalogShade[]>;

/*
 * The match engine's evaluate result, mapped from its snake_case response
 * (api.ts toClinicalMatchResult). A field the engine did not send is absent,
 * never filled with a stand-in; optional marks what the engine may omit.
 */

export interface ProductMatchItem {
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

export interface RegimenStep {
  stepNumber: number;
  stepName: string;
  category: string;
  recommendedTexture?: string;
  primaryProduct?: ProductMatchItem;
  alternatives?: ProductMatchItem[];
}

/** A routine slot nothing in the catalogue filled, and why. */
export interface UnfilledSlot {
  slotId?: string;
  category?: string;
  required?: boolean;
  reason?: string;
}

export interface ClinicalMatchResult {
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
