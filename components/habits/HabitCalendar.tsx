'use client';

import { useMemo } from 'react';
import { Check, Footprints } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Calendar } from '@/components/ui/Calendar';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/utils';
import { formatDayMonth, formatNumber, formatPercent } from '@/lib/calculations/dates';
import { calculateStepCompletion } from '@/lib/calculations/steps';
import {
  buildHabitContext,
  calculateDayCompletion,
  getHabitDayState,
} from '@/lib/calculations/habits';
import type { Habit, HabitRecord, StepRecord } from '@/types/database';

export interface HabitCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habits: Habit[];
  habitRecords: HabitRecord[];
  stepRecords: StepRecord[];
  dailyStepsGoal: number;
  onToggleHabit: (habit: Habit, date: string, next: boolean) => void;
}

export function HabitCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  habits,
  habitRecords,
  stepRecords,
  dailyStepsGoal,
  onToggleHabit,
}: HabitCalendarProps) {
  const context = useMemo(
    () => buildHabitContext(habitRecords, stepRecords),
    [habitRecords, stepRecords],
  );

  const stepsByDate = useMemo(
    () => new Map(stepRecords.map((record) => [record.date, record.steps])),
    [stepRecords],
  );

  const selectedSteps = stepsByDate.get(selectedDate) ?? null;
  const selectedHabits = habits
    .map((habit) => ({ habit, state: getHabitDayState(habit, selectedDate, context) }))
    .filter((entry) => entry.state.scheduled);
  const dayCompletion = calculateDayCompletion(habits, selectedDate, context);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardContent>
          <Calendar
            month={month}
            onMonthChange={onMonthChange}
            selected={selectedDate}
            onSelect={onSelectDate}
            renderDay={(date) => {
              const completion = calculateDayCompletion(habits, date, context);
              const steps = stepsByDate.get(date);
              const stepsReached = steps !== undefined && steps >= dailyStepsGoal;

              return (
                <span className="flex flex-col items-center gap-1">
                  {completion.expected > 0 ? (
                    <span className="flex gap-0.5">
                      {Array.from({ length: Math.min(completion.expected, 4) }).map((_, index) => (
                        <span
                          key={index}
                          className={cn(
                            'h-1 w-1 rounded-full',
                            index < completion.completed
                              ? 'bg-honey-500 dark:bg-honey-400'
                              : 'bg-mist-300 dark:bg-mist-600',
                          )}
                        />
                      ))}
                    </span>
                  ) : null}
                  {steps !== undefined ? (
                    <span
                      className={cn(
                        'h-1 w-4 rounded-full',
                        stepsReached ? 'bg-sage-500 dark:bg-sage-400' : 'bg-mist-200 dark:bg-mist-700',
                      )}
                    />
                  ) : null}
                </span>
              );
            }}
          />
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-mist-500 dark:text-mist-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-honey-500 dark:bg-honey-400" />
              Hábito cumplido
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-mist-300 dark:bg-mist-600" />
              Hábito pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-4 rounded-full bg-sage-500 dark:bg-sage-400" />
              Objetivo de pasos alcanzado
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader
          title={<span className="capitalize">{formatDayMonth(selectedDate)}</span>}
          description={
            dayCompletion.expected > 0
              ? `${dayCompletion.completed} de ${dayCompletion.expected} hábitos · ${formatPercent(dayCompletion.percentage, 0)}`
              : 'Sin hábitos previstos'
          }
        />
        <CardContent className="space-y-5">
          <section>
            <h3 className="text-sm font-medium text-mist-700 dark:text-mist-300">Pasos</h3>
            {selectedSteps === null ? (
              <p className="mt-2 text-sm text-mist-500 dark:text-mist-400">
                No hay registro de pasos ese día.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="tabular text-sm text-mist-600 dark:text-mist-300">
                  {formatNumber(selectedSteps)} / {formatNumber(dailyStepsGoal)}
                </p>
                <Progress
                  value={calculateStepCompletion(selectedSteps, dailyStepsGoal)}
                  barClassName="bg-sage-500 dark:bg-sage-400"
                  label="Pasos del día"
                />
                <p className="tabular text-sm font-medium text-mist-900 dark:text-mist-100">
                  {formatPercent(calculateStepCompletion(selectedSteps, dailyStepsGoal))}
                </p>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-medium text-mist-700 dark:text-mist-300">Hábitos</h3>
            {selectedHabits.length === 0 ? (
              <EmptyState title="Sin hábitos previstos para este día" className="py-6" />
            ) : (
              <ul className="mt-2 space-y-1.5">
                {selectedHabits.map(({ habit, state }) => (
                  <li key={habit.id}>
                    <button
                      type="button"
                      disabled={state.fromSteps}
                      aria-pressed={state.completed}
                      onClick={() => onToggleHabit(habit, selectedDate, !state.completed)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-900 dark:focus-visible:ring-mist-100',
                        state.completed
                          ? 'bg-honey-50 text-mist-900 dark:bg-honey-500/10 dark:text-mist-100'
                          : 'text-mist-600 hover:bg-mist-50 dark:text-mist-300 dark:hover:bg-mist-800/60',
                        state.fromSteps ? 'cursor-default' : '',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                          state.completed
                            ? 'border-honey-500 bg-honey-500 text-white dark:border-honey-400 dark:bg-honey-400 dark:text-mist-900'
                            : 'border-mist-300 dark:border-mist-600',
                        )}
                      >
                        {state.completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{habit.name}</span>
                      {state.fromSteps ? (
                        <Footprints
                          className="h-4 w-4 shrink-0 text-mist-400"
                          aria-label="Se calcula con los pasos del día"
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
