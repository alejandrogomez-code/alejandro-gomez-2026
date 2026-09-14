'use client';

import { CalendarClock, Link2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { GoalProgress } from './GoalProgress';
import {
  GOAL_STATUS_LABELS,
  GOAL_TYPE_LABELS,
  daysRemainingLabel,
  isGoalOverdue,
} from '@/lib/calculations/goals';
import { formatDate, formatPercent } from '@/lib/calculations/dates';
import type { Goal, GoalStatus, Habit } from '@/types/database';

const STATUS_OPTIONS = (Object.keys(GOAL_STATUS_LABELS) as GoalStatus[]).map((status) => ({
  value: status,
  label: GOAL_STATUS_LABELS[status],
}));

export interface GoalCardProps {
  goal: Goal;
  linkedHabits?: Habit[];
  /** Cumplimiento semanal de los hábitos asociados. */
  linkedCompletion?: number | null;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onStatusChange: (goal: Goal, status: GoalStatus) => void;
}

export function GoalCard({
  goal,
  linkedHabits = [],
  linkedCompletion = null,
  onEdit,
  onDelete,
  onStatusChange,
}: GoalCardProps) {
  const overdue = isGoalOverdue(goal);
  const remaining = daysRemainingLabel(goal.target_date);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-mist-900 dark:text-mist-100">
              {goal.name}
            </h3>
            {goal.description ? (
              <p className="mt-1 text-sm text-mist-500 dark:text-mist-400">
                {goal.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" aria-label="Editar objetivo" onClick={() => onEdit(goal)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Eliminar objetivo"
              onClick={() => onDelete(goal)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="plum">{GOAL_TYPE_LABELS[goal.type]}</Badge>
          <Badge tone={goal.status === 'completed' ? 'success' : 'neutral'}>
            {GOAL_STATUS_LABELS[goal.status]}
          </Badge>
          {overdue ? <Badge tone="danger">Vencido</Badge> : null}
        </div>

        {goal.type !== 'date' ? <GoalProgress goal={goal} /> : null}

        {goal.target_date ? (
          <div className="flex items-center gap-2 text-sm text-mist-500 dark:text-mist-400">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            <span className="tabular">{formatDate(goal.target_date)}</span>
            {remaining ? <span>· {remaining}</span> : null}
          </div>
        ) : null}

        {goal.type === 'completion' ? (
          <Select
            aria-label={`Estado de ${goal.name}`}
            options={STATUS_OPTIONS}
            value={goal.status}
            onChange={(event) => onStatusChange(goal, event.target.value as GoalStatus)}
          />
        ) : null}

        {linkedHabits.length > 0 ? (
          <div className="rounded-xl bg-mist-50 p-4 dark:bg-mist-800/50">
            <div className="flex items-center gap-2 text-sm font-medium text-mist-700 dark:text-mist-200">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Hábitos asociados
            </div>
            <ul className="mt-2 space-y-1 text-sm text-mist-500 dark:text-mist-400">
              {linkedHabits.map((habit) => (
                <li key={habit.id}>{habit.name}</li>
              ))}
            </ul>
            {linkedCompletion !== null ? (
              <p className="mt-3 text-sm text-mist-600 dark:text-mist-300">
                Cumplimiento esta semana:{' '}
                <span className="tabular font-medium text-mist-900 dark:text-mist-100">
                  {formatPercent(linkedCompletion, 0)}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
