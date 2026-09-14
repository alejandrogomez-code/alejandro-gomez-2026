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
          className="mb-1.5 block text-sm font-medium text-mist-700 dark:text-mist-300"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border border-mist-200 bg-white px-3 pr-9 text-base text-mist-900',
            'focus:border-mist-400 focus:outline-none focus:ring-2 focus:ring-mist-900/10',
            'dark:border-mist-800 dark:bg-mist-950 dark:text-mist-100 dark:focus:border-mist-600 dark:focus:ring-mist-100/10',
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
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400"
          aria-hidden="true"
        />
      </div>
      {hint ? (
        <p className="mt-1.5 text-sm text-mist-500 dark:text-mist-400">{hint}</p>
      ) : null}
    </div>
  );
});
