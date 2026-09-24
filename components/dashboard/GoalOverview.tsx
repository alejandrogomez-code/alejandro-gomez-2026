'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { calculateGoalProgress, daysRemainingLabel, isGoalActive } from '@/lib/calculations/goals';
import { formatPercent } from '@/lib/calculations/dates';
import { ACCENTS } from '@/lib/accents';
import type { Goal } from '@/types/database';

export function GoalOverview({ goals }: { goals: Goal[] }) {
  const active = goals.filter(isGoalActive);

  return (
    <Card>
      <CardHeader
        title="Objetivos activos"
        action={
          <Link
            href="/objetivos"
            className="inline-flex items-center gap-1 text-sm text-sand-500 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
      <CardContent>
        {active.length === 0 ? (
          <EmptyState
            title="No hay objetivos activos"
            description="Definí un objetivo para ver su progreso acá."
            action={
              <Link href="/objetivos">
                <Button>Crear objetivo</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4">
            {active.map((goal) => {
              const progress = calculateGoalProgress(goal);
              const remaining = daysRemainingLabel(goal.target_date);
              return (
                <li key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-sand-700 dark:text-sand-300">
                      {goal.name}
                    </span>
                    <span className={`tabular shrink-0 font-medium ${ACCENTS.plum.text}`}>
                      {progress === null ? '—' : formatPercent(progress, 0)}
                    </span>
                  </div>
                  {progress !== null ? (
                    <Progress
                      value={progress}
                      barClassName={ACCENTS.plum.bar}
                      label={`Progreso de ${goal.name}`}
                    />
                  ) : null}
                  {remaining ? (
                    <p className="text-xs text-sand-400">{remaining}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
