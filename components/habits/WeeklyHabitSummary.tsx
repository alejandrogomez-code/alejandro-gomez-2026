'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/States';
import { formatPercent } from '@/lib/calculations/dates';
import { ACCENTS } from '@/lib/accents';
import type { OverallCompletion } from '@/lib/calculations/habits';

export interface WeeklyHabitSummaryProps {
  completion: OverallCompletion;
  title?: string;
  description?: string;
}

/**
 * El porcentaje general es instancias cumplidas / instancias previstas,
 * no el promedio de los porcentajes individuales.
 */
export function WeeklyHabitSummary({
  completion,
  title = 'Semana actual',
  description,
}: WeeklyHabitSummaryProps) {
  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        action={
          <span
            className={`tabular text-2xl font-medium tracking-tight ${ACCENTS.honey.text}`}
          >
            {formatPercent(completion.percentage, 0)}
          </span>
        }
      />
      <CardContent className="space-y-4">
        <div>
          <Progress
            value={completion.percentage}
            barClassName={ACCENTS.honey.bar}
            label="Cumplimiento general"
          />
          <p className="tabular mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {completion.completed} de {completion.expected} instancias previstas
          </p>
        </div>

        {completion.byHabit.length === 0 ? (
          <EmptyState
            title="Todavía no hay hábitos"
            description="Creá tu primer hábito para empezar a medir el cumplimiento."
          />
        ) : (
          <ul className="space-y-3">
            {completion.byHabit.map((row) => (
              <li key={row.habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate text-neutral-700 dark:text-neutral-300">
                    {row.habit.name}
                  </span>
                  <span className="tabular shrink-0 pl-3 text-neutral-500 dark:text-neutral-400">
                    {row.completed}/{row.expected} · {formatPercent(row.percentage, 0)}
                  </span>
                </div>
                <Progress
                  value={row.percentage}
                  barClassName={ACCENTS.honey.bar}
                  label={`Cumplimiento de ${row.habit.name}`}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
