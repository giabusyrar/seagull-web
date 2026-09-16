import React from 'react';
export interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
    className?: string;
}
export declare const StatusBadge: React.FC<StatusBadgeProps>;
