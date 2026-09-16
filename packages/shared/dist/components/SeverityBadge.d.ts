import React from 'react';
export interface SeverityBadgeProps {
    severity: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical' | string;
    size?: 'sm' | 'md';
    className?: string;
}
export declare const SeverityBadge: React.FC<SeverityBadgeProps>;
