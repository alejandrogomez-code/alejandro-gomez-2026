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
      className={cn(
        'inline-flex gap-1 rounded-lg bg-mist-100 p-1 dark:bg-mist-800/70',
        className,
      )}
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
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-900 dark:focus-visible:ring-mist-100',
              active
                ? 'bg-white text-mist-900 shadow-card dark:bg-mist-950 dark:text-mist-100'
                : 'text-mist-500 hover:text-mist-800 dark:text-mist-400 dark:hover:text-mist-200',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
