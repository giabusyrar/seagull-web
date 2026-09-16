import React from 'react';
export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    stepNumber?: number;
    badge?: string | number;
}
export interface TabNavProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}
export declare const TabNav: React.FC<TabNavProps>;
