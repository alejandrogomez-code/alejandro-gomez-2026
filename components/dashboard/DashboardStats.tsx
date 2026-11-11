'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ACCENTS, type Accent } from '@/lib/accents';

/** Colores sólidos para las tarjetas de indicadores destacados. */
export type StatFill = 'coral' | 'lilac' | 'mint' | 'sun';

const FILLS: Record<StatFill, { bg: string; ring: string }> = {
  coral: { bg: 'bg-clay-300', ring: 'stroke-clay-200' },
  lilac: { bg: 'bg-plum-300', ring: 'stroke-plum-200' },
  mint: { bg: 'bg-ocean-300', ring: 'stroke-ocean-200' },
  sun: { bg: 'bg-amber-300', ring: 'stroke-amber-200' },
};

export interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Texto corto alineado a la derecha del rótulo, como estado. */
  note?: ReactNode;
  detail?: ReactNode;
  progress?: number | null;
  accent?: Accent;
  /** Si se indica, la tarjeta va con fondo de color sólido y anillo de progreso. */
  fill?: StatFill;
  className?: string;
}

function ProgressRing({ value, trackClassName, label }: { value: number; trackClassName: string; label: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(value > 0 ? 4 : 2, (value / 100) * circumference);
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14 shrink-0 -rotate-90"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="8" className={trackClassName} />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        className="stroke-brand-900 transition-[stroke-dasharray] duration-500"
        strokeDasharray={`${dash} ${circumference}`}
      />
    </svg>
  );
}

/**
 * Tarjeta de indicador. En su versión con color (`fill`) usa fondo sólido,
 * tinta oscura y un anillo de progreso; si no, es blanca con barra al pie.
 */
export function StatCard({
  label,
  value,
  unit,
  note,
  detail,
  progress = null,
  accent = 'neutral',
  fill,
  className,
}: StatCardProps) {
  const theme = ACCENTS[accent];
  const clamped = progress === null ? null : Math.min(100, Math.max(0, progress));

  if (fill) {
    const colors = FILLS[fill];
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-3xl p-4 text-brand-900 sm:p-5',
          colors.bg,
          className,
        )}
      >
        {clamped !== null ? (
          <ProgressRing value={clamped} trackClassName={colors.ring} label={label} />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="truncate text-xs font-extrabold uppercase tracking-wide">{label}</p>
            {note ? (
              <span className="tabular shrink-0 rounded-full bg-brand-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {note}
              </span>
            ) : null}
          </div>
          <p className="tabular mt-1 text-3xl font-extrabold tracking-tight">
            {value}
            {unit ? <span className="ml-1 text-base font-bold">{unit}</span> : null}
          </p>
          {detail ? <div className="mt-0.5 text-xs font-medium">{detail}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-3xl bg-white shadow-card dark:bg-sand-900',
        className,
      )}
    >
      <div className="flex-1 px-5 pb-4 pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs font-bold text-sand-500 dark:text-sand-400">{label}</p>
          {note ? (
            <span className={cn('tabular shrink-0 text-xs font-bold', theme.text)}>{note}</span>
          ) : null}
        </div>
        <p className="tabular mt-1 text-2xl font-extrabold tracking-tight text-sand-900 dark:text-sand-100">
          {value}
          {unit ? <span className="ml-1 text-sm font-medium text-sand-500">{unit}</span> : null}
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
          className="h-1 w-full bg-sand-100 dark:bg-sand-800"
        >
          <div className={cn('h-full transition-[width] duration-500', theme.bar)} style={{ width: `${clamped}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4', className)}>
      {children}
    </div>
  );
}
