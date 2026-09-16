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
  ingredients?: string;
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
  referencePhotoUrl?: string;
  extractionStatus: 'pending' | 'processing' | 'ready' | 'failed';
  failureReason?: string;
  assetId?: string;
  createdAt?: string;
}

export interface ProductMatchItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  texture: string;
  matchScore: number;
  whySelected?: string[];
  keyActives?: string[];
}

export interface RegimenStep {
  stepNumber: number;
  stepName: string;
  category: string;
  recommendedTexture?: string;
  primaryProduct: ProductMatchItem;
  alternatives?: ProductMatchItem[];
}

export interface ClinicalMatchResult {
  matchId: string;
  brandId: string;
  applicationId: string;
  profileSummary: {
    skinType: string;
    primaryConcerns: string[];
    overallSuitabilityScore: number;
  };
  regimens: {
    amRoutine?: RegimenStep[];
    pmRoutine?: RegimenStep[];
    phases?: Record<string, RegimenStep[]>;
  };
  clinicalConflictMatrix: {
    conflictsDetected: number;
    layeringRulesApplied: string[];
  };
  evaluatedAt: string;
}
