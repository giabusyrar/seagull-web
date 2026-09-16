import React from 'react';
export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}
export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    onItemClick?: (item: BreadcrumbItem) => void;
}
export declare const Breadcrumb: React.FC<BreadcrumbProps>;
