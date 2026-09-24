'use client';

import { Check, Footprints, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import { HABIT_TYPE_LABELS, frequencyDescription, type HabitDayState } from '@/lib/calculations/habits';
import { ACCENTS } from '@/lib/accents';
import type { Habit } from '@/types/database';

export interface HabitCardProps {
  habit: Habit;
  state: HabitDayState;
  weeklyPercent: number;
  weeklyLabel: string;
  goalName?: string | null;
  onToggle: (habit: Habit, next: boolean) => void;
  onValueChange?: (habit: Habit, value: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  state,
  weeklyPercent,
  weeklyLabel,
  goalName,
  onToggle,
  onValueChange,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const quantitative = habit.type === 'quantitative';

  return (
    <Card className={cn(!habit.active && 'opacity-60')}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-sand-900 dark:text-sand-100">
              {habit.name}
            </h3>
            {habit.description ? (
              <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
                {habit.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" aria-label="Editar hábito" onClick={() => onEdit(habit)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Eliminar hábito"
              onClick={() => onDelete(habit)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{frequencyDescription(habit)}</Badge>
          <Badge tone="neutral">{HABIT_TYPE_LABELS[habit.type]}</Badge>
          {state.fromSteps ? (
            <Badge tone="success">
              <Footprints className="h-3 w-3" aria-hidden="true" />
              Usa el registro de pasos
            </Badge>
          ) : null}
          {goalName ? <Badge tone="plum">{goalName}</Badge> : null}
          {!habit.active ? <Badge tone="neutral">Inactivo</Badge> : null}
        </div>

        <div className="rounded-xl bg-sand-50 p-4 dark:bg-sand-800/50">
          {!state.scheduled ? (
            <p className="text-sm text-sand-500 dark:text-sand-400">
              Hoy no corresponde este hábito.
            </p>
          ) : state.fromSteps ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="tabular text-sm text-sand-600 dark:text-sand-300">
                  {state.value === null ? 'Sin registro' : formatNumber(state.value)} /{' '}
                  {formatNumber(habit.target_value ?? 0)} {habit.unit ?? ''}
                </span>
                <span className="tabular text-sm font-medium text-sand-900 dark:text-sand-100">
                  {state.percent === null ? '—' : formatPercent(state.percent)}
                </span>
              </div>
              <Progress
                value={state.percent ?? 0}
                barClassName={ACCENTS.brand.bar}
                label={habit.name}
              />
              <p className="text-xs text-sand-500 dark:text-sand-400">
                {state.completed ? 'Cumplido hoy' : 'Se completa al cargar los pasos del día'}
              </p>
            </div>
          ) : quantitative ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  aria-label={`Valor de ${habit.name} hoy`}
                  defaultValue={state.value ?? ''}
                  onBlur={(event) => {
                    const value = Number(event.target.value);
                    if (event.target.value !== '' && !Number.isNaN(value)) {
                      onValueChange?.(habit, value);
                    }
                  }}
                  className="tabular h-10 w-28 rounded-lg border border-sand-200 bg-white px-3 text-base dark:border-sand-700 dark:bg-sand-950"
                />
                <span className="text-sm text-sand-500 dark:text-sand-400">
                  de {formatNumber(habit.target_value ?? 0)} {habit.unit ?? ''}
                </span>
              </div>
              <Progress
                value={state.percent ?? 0}
                barClassName={ACCENTS.amber.bar}
                label={habit.name}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(habit, !state.completed)}
              aria-pressed={state.completed}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-900 dark:focus-visible:ring-sand-100',
                state.completed
                  ? 'bg-amber-500 text-white dark:bg-amber-400 dark:text-sand-900'
                  : 'border border-sand-200 bg-white text-sand-600 hover:border-amber-300 hover:bg-amber-50 dark:border-sand-700 dark:bg-sand-950 dark:text-sand-300 dark:hover:bg-amber-500/10',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md border',
                  state.completed
                    ? 'border-transparent bg-white/20'
                    : 'border-sand-300 dark:border-sand-600',
                )}
              >
                {state.completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </span>
              {state.completed ? 'Hecho hoy' : 'Marcar como hecho'}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sand-500 dark:text-sand-400">Esta semana</span>
            <span className={`tabular font-medium ${ACCENTS.amber.text}`}>
              {weeklyLabel} · {formatPercent(weeklyPercent, 0)}
            </span>
          </div>
          <Progress
            value={weeklyPercent}
            barClassName={ACCENTS.amber.bar}
            label={`Cumplimiento semanal de ${habit.name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
