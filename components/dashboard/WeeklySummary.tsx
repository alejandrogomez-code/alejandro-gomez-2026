'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import { ACCENTS } from '@/lib/accents';
import type { HabitCompletionRow } from '@/lib/calculations/habits';

export interface WeekMetrics {
  completionPercent: number;
  completed: number;
  expected: number;
  averageSteps: number;
  stepGoalDays: number;
  weightRecords: number;
}

export interface WeeklySummaryProps {
  current: WeekMetrics;
  previous: WeekMetrics | null;
  habitRows: HabitCompletionRow[];
  weightTarget?: number;
}

function Delta({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value === null || Math.abs(value) < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-sand-400">
        <Minus className="h-3 w-3" aria-hidden="true" />
        igual que la semana anterior
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-sand-500 dark:text-sand-400">
      {positive ? (
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
      )}
      <span className="tabular">
        {positive ? '+' : ''}
        {formatNumber(value, Math.abs(value) < 10 ? 1 : 0)}
        {suffix}
      </span>{' '}
      vs. semana anterior
    </span>
  );
}

export function WeeklySummary({
  current,
  previous,
  habitRows,
  weightTarget = 3,
}: WeeklySummaryProps) {
  return (
    <Card>
      <CardHeader
        title="Semana"
        description="De lunes a domingo, contando solo los días previstos."
        action={
          <span className={`tabular text-2xl font-medium tracking-tight ${ACCENTS.amber.text}`}>
            {formatPercent(current.completionPercent, 0)}
          </span>
        }
      />
      <CardContent className="space-y-5">
        <div>
          <Progress
            value={current.completionPercent}
            barClassName={ACCENTS.amber.bar}
            label="Cumplimiento semanal"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="tabular text-sm text-sand-500 dark:text-sand-400">
              {current.completed} de {current.expected} instancias
            </span>
            <Delta
              value={previous ? current.completionPercent - previous.completionPercent : null}
              suffix=" pts"
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-sand-100 pt-4 dark:border-sand-800 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-sand-500 dark:text-sand-400">Pasos promedio</dt>
            <dd className="tabular mt-1 text-lg font-medium text-sand-900 dark:text-sand-100">
              {formatNumber(current.averageSteps)}
            </dd>
            <Delta value={previous ? current.averageSteps - previous.averageSteps : null} />
          </div>
          <div>
            <dt className="text-sm text-sand-500 dark:text-sand-400">Días con objetivo</dt>
            <dd className="tabular mt-1 text-lg font-medium text-sand-900 dark:text-sand-100">
              {current.stepGoalDays} / 7
            </dd>
          </div>
          <div>
            <dt className="text-sm text-sand-500 dark:text-sand-400">Registros de peso</dt>
            <dd className="tabular mt-1 text-lg font-medium text-sand-900 dark:text-sand-100">
              {current.weightRecords} / {weightTarget}
            </dd>
          </div>
        </dl>

        {habitRows.length > 0 ? (
          <ul className="space-y-2 border-t border-sand-100 pt-4 dark:border-sand-800">
            {habitRows.map((row) => (
              <li key={row.habit.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-sand-600 dark:text-sand-300">
                  {row.habit.name}
                </span>
                <span className="tabular shrink-0 pl-3 text-sand-500 dark:text-sand-400">
                  {row.completed}/{row.expected} · {formatPercent(row.percentage, 0)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
