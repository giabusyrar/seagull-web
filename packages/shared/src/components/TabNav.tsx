'use client';

import React from 'react';
import { cn } from '../utils';

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

export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border text-xs overflow-x-auto max-w-full [scrollbar-width:none] shrink-0 select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {tab.stepNumber !== undefined && (
              <span
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.stepNumber}
              </span>
            )}
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground font-extrabold' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
