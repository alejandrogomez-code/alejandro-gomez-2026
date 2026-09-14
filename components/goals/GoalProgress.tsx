'use client';

import { Progress } from '@/components/ui/Progress';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import type { Goal } from '@/types/database';
import { calculateGoalProgress } from '@/lib/calculations/goals';
import { ACCENTS } from '@/lib/accents';

export function GoalProgress({ goal, compact = false }: { goal: Goal; compact?: boolean }) {
  const progress = calculateGoalProgress(goal);
  if (progress === null) return null;

  return (
    <div className="space-y-2">
      <Progress
        value={progress}
        barClassName={ACCENTS.plum.bar}
        label={`Progreso de ${goal.name}`}
      />
      <div className="flex items-center justify-between text-sm">
        <span className={`tabular font-medium ${ACCENTS.plum.text}`}>
          {formatPercent(progress)}
        </span>
        {!compact && goal.type === 'quantitative' && goal.target_value !== null ? (
          <span className="tabular text-mist-500 dark:text-mist-400">
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
