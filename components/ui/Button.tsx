'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400',
  secondary:
    'border border-sand-300 bg-white text-sand-700 hover:bg-sand-50 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-200 dark:hover:bg-sand-800',
  ghost:
    'text-sand-600 hover:bg-sand-100 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-100',
  danger: 'bg-clay-500 text-white hover:bg-clay-600 dark:bg-clay-500 dark:hover:bg-clay-400',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-8 w-8',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-sand-950',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
