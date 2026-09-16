import React from 'react';
export interface StatWidgetProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtext?: string;
    description?: string;
    trend?: {
        value: string;
        isPositive?: boolean;
    };
    onClick?: () => void;
    className?: string;
}
export declare const StatWidget: React.FC<StatWidgetProps>;
