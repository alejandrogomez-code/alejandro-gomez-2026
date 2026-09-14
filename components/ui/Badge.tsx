import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'ocean' | 'plum' | 'honey';

const tones: Record<Tone, string> = {
  neutral:
    'bg-mist-100 text-mist-600 dark:bg-mist-800 dark:text-mist-300',
  success:
    'bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300',
  warning: 'bg-honey-100 text-honey-700 dark:bg-honey-500/15 dark:text-honey-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  accent: 'bg-sage-50 text-sage-600 dark:bg-sage-500/15 dark:text-sage-300',
  ocean: 'bg-ocean-50 text-ocean-600 dark:bg-ocean-500/15 dark:text-ocean-300',
  plum: 'bg-plum-50 text-plum-600 dark:bg-plum-500/15 dark:text-plum-300',
  honey: 'bg-honey-50 text-honey-600 dark:bg-honey-500/15 dark:text-honey-300',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
