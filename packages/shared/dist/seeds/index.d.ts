export declare const MASTER_SEEDS: {
    readonly scoring: {
        gradingAxes: never[];
    };
    readonly matching: {
        boosterRules: {
            id: string;
            name: string;
            targetField: string;
            operator: string;
            value: string;
            boostScore: number;
            boostCategory: string;
        }[];
        ingredientConflicts: {
            conditionCode: string;
            conflictingIngredient: string;
            reason: string;
        }[];
    };
};
export type MasterSeeds = typeof MASTER_SEEDS;
export declare const MASTER_GRADING_AXES: never[];
export declare const MASTER_GRADING_RULES: any;
export declare const MASTER_SKIN_PROFILES: any;
export declare const MASTER_BOOSTER_RULES: {
    id: string;
    name: string;
    targetField: string;
    operator: string;
    value: string;
    boostScore: number;
    boostCategory: string;
}[];
export declare const MASTER_INGREDIENT_CONFLICTS: {
    conditionCode: string;
    conflictingIngredient: string;
    reason: string;
}[];
