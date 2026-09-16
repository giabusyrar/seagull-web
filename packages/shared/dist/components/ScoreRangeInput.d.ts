import React from 'react';
export interface ScoreRangeInputProps {
    minScore: number;
    maxScore: number;
    minLimit?: number;
    maxLimit?: number;
    onChange: (min: number, max: number) => void;
    disabled?: boolean;
    className?: string;
}
export declare const ScoreRangeInput: React.FC<ScoreRangeInputProps>;
