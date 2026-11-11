'use client';

import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
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

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function Delta({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value === null || Math.abs(value) < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-brand-200">
        <Minus className="h-3 w-3" aria-hidden="true" />
        igual que la semana anterior
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-brand-100">
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

function Metric({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <dt className="text-xs text-brand-200">{label}</dt>
      <dd className="tabular mt-0.5 text-xl font-extrabold">{value}</dd>
      {children}
    </div>
  );
}

export function WeeklySummary({
  current,
  previous,
  habitRows,
  weightTarget = 3,
}: WeeklySummaryProps) {
  // Lunes = 0 … Domingo = 6
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <Card className="bg-brand-800 text-white dark:bg-brand-900">
      <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">Semana</h2>
          <p className="mt-0.5 text-xs text-brand-200">
            De lunes a domingo, contando solo los días previstos.
          </p>
        </div>
        <span className="tabular shrink-0 rounded-full bg-amber-300 px-3.5 py-1 text-xl font-extrabold text-brand-900">
          {formatPercent(current.completionPercent, 0)}
        </span>
      </div>

      <CardContent className="space-y-5">
        <ol className="grid grid-cols-7 gap-1.5" aria-label="Días de la semana">
          {WEEK_DAYS.map((day, index) => {
            const isToday = index === todayIndex;
            return (
              <li
                key={day}
                aria-current={isToday ? 'date' : undefined}
                className={cn(
                  'text-center text-xs font-extrabold',
                  isToday ? 'text-clay-300' : 'text-brand-200',
                )}
              >
                {day}
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1 block h-7 rounded-xl',
                    isToday
                      ? 'border-2 border-clay-300'
                      : index < todayIndex
                        ? 'bg-white/15'
                        : 'bg-white/5',
                  )}
                />
              </li>
            );
          })}
        </ol>

        <div>
          <Progress
            value={current.completionPercent}
            className="bg-white/15 dark:bg-white/15"
            barClassName="bg-amber-300 dark:bg-amber-300"
            label="Cumplimiento semanal"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="tabular text-sm text-brand-100">
              {current.completed} de {current.expected} instancias
            </span>
            <Delta
              value={previous ? current.completionPercent - previous.completionPercent : null}
              suffix=" pts"
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Metric label="Pasos promedio" value={formatNumber(current.averageSteps)}>
            <Delta value={previous ? current.averageSteps - previous.averageSteps : null} />
          </Metric>
          <Metric label="Días con objetivo" value={`${current.stepGoalDays} / 7`} />
          <Metric label="Registros de peso" value={`${current.weightRecords} / ${weightTarget}`} />
        </dl>

        {habitRows.length > 0 ? (
          <ul className="space-y-2 border-t border-white/15 pt-4">
            {habitRows.map((row) => (
              <li key={row.habit.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-brand-50">{row.habit.name}</span>
                <span className="tabular shrink-0 pl-3 text-brand-200">
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
