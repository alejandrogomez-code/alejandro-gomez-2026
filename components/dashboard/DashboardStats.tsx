'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  detail?: ReactNode;
  progress?: number | null;
  icon?: ReactNode;
  className?: string;
}

/** Tarjeta de indicador: el número es el protagonista. */
export function StatCard({
  label,
  value,
  unit,
  detail,
  progress = null,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        {icon ? <span className="text-neutral-300 dark:text-neutral-600">{icon}</span> : null}
      </div>
      <p className="tabular mt-3 text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
        {value}
        {unit ? (
          <span className="ml-1 text-base font-normal text-neutral-400">{unit}</span>
        ) : null}
      </p>
      {progress !== null ? <Progress value={progress} className="mt-3" label={label} /> : null}
      {detail ? (
        <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{detail}</div>
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
