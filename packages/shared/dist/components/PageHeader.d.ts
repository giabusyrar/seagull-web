import React from 'react';
import { BreadcrumbItem } from './Breadcrumb';
export interface PageHeaderProps {
    icon?: React.ReactNode;
    eyebrow?: string;
    breadcrumbs?: BreadcrumbItem[];
    title: string;
    description?: string;
    badge?: React.ReactNode;
    onBack?: () => void;
    backLabel?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}
export declare const PageHeader: React.FC<PageHeaderProps>;
