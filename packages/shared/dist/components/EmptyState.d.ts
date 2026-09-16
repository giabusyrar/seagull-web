import React from 'react';
export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: React.ReactNode;
    className?: string;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
