'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { ACCENTS, type Accent } from '@/lib/accents';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  detail?: ReactNode;
  progress?: number | null;
  icon?: ReactNode;
  accent?: Accent;
  className?: string;
}

/** Tarjeta de indicador: el número es el protagonista, el color indica el área. */
export function StatCard({
  label,
  value,
  unit,
  detail,
  progress = null,
  icon,
  accent = 'neutral',
  className,
}: StatCardProps) {
  const theme = ACCENTS[accent];

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-mist-500 dark:text-mist-400">{label}</p>
        {icon ? (
          <span
            className={cn('flex h-8 w-8 items-center justify-center rounded-lg', theme.chip)}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="tabular mt-3 text-2xl font-medium tracking-tight text-mist-900 dark:text-mist-100">
        {value}
        {unit ? (
          <span className="ml-1 text-base font-normal text-mist-400">{unit}</span>
        ) : null}
      </p>
      {progress !== null ? (
        <Progress value={progress} className="mt-3" barClassName={theme.bar} label={label} />
      ) : null}
      {detail ? (
        <div className="mt-2 text-sm text-mist-500 dark:text-mist-400">{detail}</div>
      ) : null}
    </Card>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
