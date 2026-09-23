export { ScoreManager } from './components/ScoreManager';
export { ProfileMappingTable } from './components/reusable/ProfileMappingTable';
export { ClinicalDimensionCard, ClinicalAxisCard } from './components/reusable/ClinicalAxisCard';
export { SeverityTierTable } from './components/reusable/SeverityTierTable';
export { BandTable } from './components/reusable/BandTable';
export {
  compileVisualToJDM,
  decompileJDMToVisual,
  decompileJDMToVisualComponents,
  defaultConcernLabel,
  DEFAULT_STARTER_AXES,
  DEFAULT_STARTER_PROFILES,
} from './utils/jdm-compiler';
export {
  DEFAULT_SCORE_RANGE_BANDS,
  DEFAULT_SEVERITY_BANDS,
} from './types';
export type {
  ScoreRuleset,
  DecisionTableContent,
  JDMDecisionModel,
  VisualAxisConfig,
  VisualBand,
  VisualSeverityTier,
  VisualProfileEntry,
  VisualProfileMappingConfig,
  ProfileStrategyType,
  RulesetSimulationRequest,
  RulesetSimulationResponse,
  ScoreEvaluationResult,
  SkinProfileItem,
} from './types';
