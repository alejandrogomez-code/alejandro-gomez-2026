'use client';

import { cn } from '@/lib/utils';

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex gap-0.5 rounded-lg bg-sand-100 p-0.5 dark:bg-sand-800', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              active
                ? 'bg-white text-sand-900 dark:bg-sand-950 dark:text-sand-100'
                : 'text-sand-500 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
