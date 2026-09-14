'use client';

import { Progress } from '@/components/ui/Progress';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import type { Goal } from '@/types/database';
import { calculateGoalProgress } from '@/lib/calculations/goals';

export function GoalProgress({ goal, compact = false }: { goal: Goal; compact?: boolean }) {
  const progress = calculateGoalProgress(goal);
  if (progress === null) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} label={`Progreso de ${goal.name}`} />
      <div className="flex items-center justify-between text-sm">
        <span className="tabular font-medium text-neutral-900 dark:text-neutral-100">
          {formatPercent(progress)}
        </span>
        {!compact && goal.type === 'quantitative' && goal.target_value !== null ? (
          <span className="tabular text-neutral-500 dark:text-neutral-400">
            {formatNumber(goal.current_value ?? 0, decimalsFor(goal.current_value))} /{' '}
            {formatNumber(goal.target_value, decimalsFor(goal.target_value))}
            {goal.unit ? ` ${goal.unit}` : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function decimalsFor(value: number | null): number {
  if (value === null) return 0;
  return Number.isInteger(value) ? 0 : 1;
}
