'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ACCENTS, type Accent } from '@/lib/accents';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Texto corto alineado a la derecha del rótulo, como estado. */
  note?: ReactNode;
  detail?: ReactNode;
  progress?: number | null;
  accent?: Accent;
  className?: string;
}

/**
 * Tarjeta de indicador: rótulo y estado arriba, número grande, y la barra
 * de progreso apoyada contra el borde inferior de la tarjeta.
 */
export function StatCard({
  label,
  value,
  unit,
  note,
  detail,
  progress = null,
  accent = 'neutral',
  className,
}: StatCardProps) {
  const theme = ACCENTS[accent];
  const clamped = progress === null ? null : Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-sand-200 bg-white dark:border-sand-800 dark:bg-sand-900',
        className,
      )}
    >
      <div className="flex-1 px-4 pb-3 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs text-sand-500 dark:text-sand-400">{label}</p>
          {note ? (
            <span className={cn('tabular shrink-0 text-xs font-medium', theme.text)}>{note}</span>
          ) : null}
        </div>
        <p className="tabular mt-1 text-2xl font-medium tracking-tight text-sand-900 dark:text-sand-100">
          {value}
          {unit ? <span className="ml-1 text-sm font-normal text-sand-500">{unit}</span> : null}
        </p>
        {detail ? (
          <div className="mt-1 text-xs text-sand-500 dark:text-sand-400">{detail}</div>
        ) : null}
      </div>
      {clamped !== null ? (
        <div
          role="progressbar"
          aria-valuenow={Math.round(clamped)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="h-[3px] w-full bg-sand-100 dark:bg-sand-800"
        >
          <div className={cn('h-full transition-[width] duration-500', theme.bar)} style={{ width: `${clamped}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>{children}</div>
  );
}
