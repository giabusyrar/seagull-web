export interface CoreBand {
    max: number;
    label: string;
}
/** Score Range: a coarse 3-bucket collapse of the Severity Level scale. */
export declare const CORE_DEFAULT_SCORE_RANGE_BANDS: readonly CoreBand[];
/** Severity Level: the clinical 5-level scale (Scoring Method doc). */
export declare const CORE_DEFAULT_SEVERITY_BANDS: readonly CoreBand[];
