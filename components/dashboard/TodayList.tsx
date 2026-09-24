'use client';

import Link from 'next/link';
import { Check, Footprints, Repeat, Scale } from 'lucide-react';
import { Card, CardHeader, ListRow } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import { useState } from 'react';
import { ACCENTS } from '@/lib/accents';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import { frequencyDescription, type HabitDayState } from '@/lib/calculations/habits';
import { calculateStepCompletion } from '@/lib/calculations/steps';
import type { Habit } from '@/types/database';

type Filter = 'all' | 'pending';

export interface TodayListProps {
  habits: { habit: Habit; state: HabitDayState }[];
  todaySteps: number;
  stepsGoal: number;
  stepsRecorded: boolean;
  weightRecordsThisWeek: number;
  weeklyByHabit: Map<string, { completed: number; expected: number }>;
  onToggleHabit: (habit: Habit, next: boolean) => void;
}

/** Todo lo que corresponde hoy, en una sola lista accionable. */
export function TodayList({
  habits,
  todaySteps,
  stepsGoal,
  stepsRecorded,
  weightRecordsThisWeek,
  weeklyByHabit,
  onToggleHabit,
}: TodayListProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = filter === 'pending' ? habits.filter((entry) => !entry.state.completed) : habits;
  const pending = habits.filter((entry) => !entry.state.completed).length;

  return (
    <Card>
      <CardHeader
        title="Hoy"
        action={
          <Tabs
            ariaLabel="Filtrar los hábitos de hoy"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'all', label: `Todo ${habits.length}` },
              { value: 'pending', label: `Pendiente ${pending}` },
            ]}
          />
        }
      />

      {visible.length === 0 ? (
        <EmptyState
          title={habits.length === 0 ? 'Hoy no hay hábitos previstos' : 'Todo cumplido por hoy'}
          className="py-8"
        />
      ) : (
        visible.map(({ habit, state }) => {
          const weekly = weeklyByHabit.get(habit.id);
          const accent = state.fromSteps ? ACCENTS.brand : ACCENTS.amber;

          return (
            <ListRow
              key={habit.id}
              icon={state.fromSteps ? <Footprints className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              iconClassName={accent.chip}
              title={habit.name}
              meta={
                state.fromSteps
                  ? `${state.value === null ? 'Sin registro' : formatNumber(state.value)} de ${formatNumber(habit.target_value ?? 0)} · desde el registro de pasos`
                  : `${frequencyDescription(habit)}${weekly ? ` · ${weekly.completed} de ${weekly.expected} esta semana` : ''}`
              }
              actions={
                state.fromSteps ? (
                  <Badge tone={state.completed ? 'brand' : 'amber'}>
                    {state.percent === null ? 'Sin datos' : formatPercent(state.percent, 0)}
                  </Badge>
                ) : state.completed ? (
                  <button
                    type="button"
                    onClick={() => onToggleHabit(habit, false)}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Hecho
                  </button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => onToggleHabit(habit, true)}>
                    Marcar
                  </Button>
                )
              }
            />
          );
        })
      )}

      <ListRow
        icon={<Footprints className="h-4 w-4" />}
        iconClassName={ACCENTS.brand.chip}
        title="Pasos de hoy"
        meta={`${formatNumber(todaySteps)} de ${formatNumber(stepsGoal)} · ${formatPercent(calculateStepCompletion(todaySteps, stepsGoal), 0)}`}
        actions={
          todaySteps >= stepsGoal ? (
            <Badge tone="brand">
              <Check className="h-3 w-3" aria-hidden="true" />
              Alcanzado
            </Badge>
          ) : (
            <Link href="/salud/pasos">
              <Button size="sm" variant="secondary">
                {stepsRecorded ? 'Actualizar' : 'Cargar'}
              </Button>
            </Link>
          )
        }
      />

      <ListRow
        icon={<Scale className="h-4 w-4" />}
        iconClassName={ACCENTS.ocean.chip}
        title="Registro de peso"
        meta={`${weightRecordsThisWeek} de 3 registros esta semana`}
        actions={
          <Link href="/salud/peso">
            <Button size="sm" variant="secondary">
              Cargar
            </Button>
          </Link>
        }
      />
    </Card>
  );
}
