'use client';

import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, options, hint, id, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-sand-700 dark:text-sand-300"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border border-sand-200 bg-white px-3 pr-9 text-base text-sand-900',
            'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            'dark:border-sand-800 dark:bg-sand-950 dark:text-sand-100 dark:focus:border-brand-500 dark:focus:ring-brand-400/20',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-400"
          aria-hidden="true"
        />
      </div>
      {hint ? (
        <p className="mt-1.5 text-sm text-sand-500 dark:text-sand-400">{hint}</p>
      ) : null}
    </div>
  );
});
