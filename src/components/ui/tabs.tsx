'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  kannadaLabel?: string;
  badge?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 rounded-paper border border-border bg-canvas-paper/80 backdrop-blur-sm gap-1',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 rounded-[3px] text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 select-none',
              isActive
                ? 'bg-canvas-card text-espresso-dark shadow-subtle font-semibold border border-border-subtle'
                : 'text-espresso-muted hover:text-espresso-dark hover:bg-canvas-card/50'
            )}
          >
            <span>{tab.label}</span>
            {tab.kannadaLabel && (
              <span className="font-kannada text-xs opacity-75">
                ({tab.kannadaLabel})
              </span>
            )}
            {tab.badge && (
              <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-paper bg-terracotta-100 text-terracotta-700">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

