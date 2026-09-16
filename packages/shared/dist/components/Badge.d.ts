import React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';
    size?: 'sm' | 'md';
}
export declare const Badge: React.FC<BadgeProps>;
