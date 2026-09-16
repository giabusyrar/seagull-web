import scoringMaster from '../../../../data/seed/scoring-master.json';
import matchingMaster from '../../../../data/seed/matching-master.json';
export const MASTER_SEEDS = {
    scoring: scoringMaster,
    matching: matchingMaster,
};
export const MASTER_GRADING_AXES = scoringMaster.gradingAxes;
export const MASTER_GRADING_RULES = scoringMaster.gradingRules || [];
export const MASTER_SKIN_PROFILES = scoringMaster.skinProfiles || [];
export const MASTER_BOOSTER_RULES = matchingMaster.boosterRules;
export const MASTER_INGREDIENT_CONFLICTS = matchingMaster.ingredientConflicts;
