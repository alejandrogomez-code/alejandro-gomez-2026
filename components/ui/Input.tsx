'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, suffix, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-sand-700 dark:text-sand-300"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'h-11 w-full rounded-lg border border-sand-200 bg-white px-3 text-base text-sand-900 tabular-nums',
            'placeholder:text-sand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            'dark:border-sand-800 dark:bg-sand-950 dark:text-sand-100 dark:focus:border-brand-500 dark:focus:ring-brand-400/20',
            'disabled:cursor-not-allowed disabled:opacity-60',
            suffix ? 'pr-12' : '',
            error ? 'border-red-400 dark:border-red-500' : '',
            className,
          )}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-sand-400">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-sand-500 dark:text-sand-400">{hint}</p>
      ) : null}
    </div>
  );
});

export interface TextareaProps
  extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-sm font-medium text-sand-700 dark:text-sand-300"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        rows={3}
        className={cn(
          'w-full rounded-lg border border-sand-200 bg-white p-3 text-base text-sand-900',
          'placeholder:text-sand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          'dark:border-sand-800 dark:bg-sand-950 dark:text-sand-100 dark:focus:border-brand-500 dark:focus:ring-brand-400/20',
          className,
        )}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    </div>
  );
}
