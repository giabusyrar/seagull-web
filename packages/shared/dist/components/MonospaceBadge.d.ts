import React from 'react';
export interface MonospaceBadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple';
    className?: string;
}
export declare const MonospaceBadge: React.FC<MonospaceBadgeProps>;
