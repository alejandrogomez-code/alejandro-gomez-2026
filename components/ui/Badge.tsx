import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ACCENTS, type Accent } from '@/lib/accents';

type Tone = Accent | 'success' | 'warning' | 'danger';

const TONE_TO_ACCENT: Record<Tone, Accent> = {
  brand: 'brand',
  ocean: 'ocean',
  amber: 'amber',
  plum: 'plum',
  clay: 'clay',
  leaf: 'leaf',
  neutral: 'neutral',
  success: 'brand',
  warning: 'amber',
  danger: 'clay',
};

/** Píldora de estado: fondo tenue y texto del mismo color, sin bordes. */
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
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold',
        ACCENTS[TONE_TO_ACCENT[tone]].pill,
        className,
      )}
    >
      {children}
    </span>
  );
}
