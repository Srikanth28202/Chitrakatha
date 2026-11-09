'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  kannadaTitle?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AccordionItem({
  title,
  kannadaTitle,
  children,
  isOpen = false,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-b border-border transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-600 rounded-paper"
        aria-expanded={isOpen}
      >
        <div className="space-y-0.5 pr-4">
          <span className="font-serif text-lg sm:text-xl font-medium text-espresso-dark group-hover:text-terracotta-700 transition-colors block">
            {title}
          </span>
          {kannadaTitle && (
            <span className="font-kannada text-sm text-espresso-soft block">
              {kannadaTitle}
            </span>
          )}
        </div>
        <div
          className={cn(
            'w-7 h-7 rounded-paper bg-canvas-paper border border-border flex items-center justify-center shrink-0 transition-transform duration-200 text-espresso-muted group-hover:text-terracotta-700',
            isOpen && 'rotate-180 bg-terracotta-50 text-terracotta-700 border-terracotta-200'
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0 overflow-hidden'
        )}
      >
        <div className="overflow-hidden text-sm sm:text-base text-espresso-muted leading-relaxed font-sans">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface AccordionProps {
  items: {
    id: string;
    title: React.ReactNode;
    kannadaTitle?: React.ReactNode;
    content: React.ReactNode;
  }[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id].filter(Boolean));

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y-0', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          kannadaTitle={item.kannadaTitle}
          isOpen={openIds.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

