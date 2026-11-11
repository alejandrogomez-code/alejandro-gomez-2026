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

const GOAL_TONES = [ACCENTS.ocean, ACCENTS.plum, ACCENTS.clay, ACCENTS.amber];

export function GoalOverview({ goals }: { goals: Goal[] }) {
  const active = goals.filter(isGoalActive);

  return (
    <Card>
      <CardHeader
        title="Objetivos activos"
        action={
          <Link
            href="/objetivos"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-500 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
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
          <ul className="space-y-3">
            {active.map((goal, index) => {
              const progress = calculateGoalProgress(goal);
              const remaining = daysRemainingLabel(goal.target_date);
              const theme = GOAL_TONES[index % GOAL_TONES.length];
              return (
                <li key={goal.id} className={`space-y-2 rounded-2xl p-4 ${theme.soft}`}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-bold text-sand-900 dark:text-sand-100">
                      {goal.name}
                    </span>
                    <span className={`tabular shrink-0 font-bold ${theme.text}`}>
                      {progress === null ? '—' : formatPercent(progress, 0)}
                    </span>
                  </div>
                  {progress !== null ? (
                    <Progress
                      value={progress}
                      className="bg-white/70 dark:bg-sand-800"
                      barClassName={theme.bar}
                      label={`Progreso de ${goal.name}`}
                    />
                  ) : null}
                  {remaining ? (
                    <p className="text-xs text-sand-600 dark:text-sand-400">{remaining}</p>
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
