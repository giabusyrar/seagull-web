import React from 'react';
export interface FeatureCardProps {
    title: string;
    badgeKey?: string;
    description?: string;
    statsText?: string;
    actionLabel?: string;
    onAction?: () => void;
    children?: React.ReactNode;
    className?: string;
}
export declare const FeatureCard: React.FC<FeatureCardProps>;
