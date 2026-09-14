'use client';

import { useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { TodaySummary } from '@/components/dashboard/TodaySummary';
import { WeeklySummary, type WeekMetrics } from '@/components/dashboard/WeeklySummary';
import { GoalOverview } from '@/components/dashboard/GoalOverview';
import { QuickActions, QuickActionsHeading } from '@/components/dashboard/QuickActions';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { calculateBMI } from '@/lib/calculations/bmi';
import { calculateStepCompletion } from '@/lib/calculations/steps';
import {
  buildHabitContext,
  calculateDayCompletion,
  calculateWeeklyCompletion,
  getHabitDayState,
} from '@/lib/calculations/habits';
import {
  addDays,
  formatLongDate,
  greeting,
  startOfWeek,
  toDateString,
  todayString,
} from '@/lib/calculations/dates';
import type { Habit } from '@/types/database';

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile();

  const today = todayString();
  const currentWeekStart = startOfWeek(new Date());
  const previousWeekStart = addDays(currentWeekStart, -7);
  const rangeFrom = toDateString(previousWeekStart);
  const rangeTo = toDateString(addDays(currentWeekStart, 6));

  const { activeHabits, loading: habitsLoading, error: habitsError } = useHabits();
  const {
    records: habitRecords,
    setRecord,
    loading: habitRecordsLoading,
  } = useHabitRecords({ from: rangeFrom, to: rangeTo });
  const {
    records: stepRecords,
    saveSteps,
    loading: stepsLoading,
  } = useStepRecords({ from: rangeFrom, to: rangeTo });
  const {
    records: weightRecords,
    saveWeight,
    loading: weightLoading,
  } = useWeightRecords({ from: toDateString(addDays(new Date(), -180)), to: today });
  const { goals, createGoal, loading: goalsLoading } = useGoals();

  const dailyStepsGoal = profile?.daily_steps_goal ?? 10000;

  const context = useMemo(
    () => buildHabitContext(habitRecords, stepRecords),
    [habitRecords, stepRecords],
  );

  const todayHabits = useMemo(
    () =>
      activeHabits
        .map((habit) => ({ habit, state: getHabitDayState(habit, today, context) }))
        .filter((entry) => entry.state.scheduled),
    [activeHabits, context, today],
  );

  const dayCompletion = calculateDayCompletion(activeHabits, today, context);
  const todaySteps = stepRecords.find((record) => record.date === today)?.steps ?? 0;
  const lastWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1] : null;
  const bmi = calculateBMI(lastWeight?.weight_kg ?? null, profile?.height_cm ?? null);

  const currentWeek = useMemo<WeekMetrics>(
    () => buildWeekMetrics(activeHabits, currentWeekStart),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeHabits, context, stepRecords, weightRecords, dailyStepsGoal],
  );

  const previousWeek = useMemo<WeekMetrics>(
    () => buildWeekMetrics(activeHabits, previousWeekStart),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeHabits, context, stepRecords, weightRecords, dailyStepsGoal],
  );

  function buildWeekMetrics(habits: Habit[], weekStart: Date): WeekMetrics {
    const from = toDateString(weekStart);
    const to = toDateString(addDays(weekStart, 6));
    const completion = calculateWeeklyCompletion(habits, from, to, context);
    const weekSteps = stepRecords.filter((record) => record.date >= from && record.date <= to);
    const averageSteps =
      weekSteps.length === 0
        ? 0
        : weekSteps.reduce((sum, record) => sum + record.steps, 0) / weekSteps.length;

    return {
      completionPercent: completion.percentage,
      completed: completion.completed,
      expected: completion.expected,
      averageSteps,
      stepGoalDays: weekSteps.filter((record) => record.steps >= dailyStepsGoal).length,
      weightRecords: weightRecords.filter((record) => record.date >= from && record.date <= to)
        .length,
    };
  }

  const weekRows = useMemo(
    () =>
      calculateWeeklyCompletion(
        activeHabits,
        toDateString(currentWeekStart),
        toDateString(addDays(currentWeekStart, 6)),
        context,
      ).byHabit,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeHabits, context],
  );

  const loading =
    profileLoading || habitsLoading || habitRecordsLoading || stepsLoading || weightLoading || goalsLoading;

  if (loading) return <LoadingState label="Cargando tu panel…" />;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          {greeting()}
        </h1>
        <p className="mt-1 text-sm capitalize text-neutral-500 dark:text-neutral-400">
          {formatLongDate(today)}
        </p>
      </header>

      {habitsError ? <ErrorState message={habitsError} /> : null}

      <section className="space-y-3">
        <QuickActionsHeading />
        <QuickActions
          heightCm={profile?.height_cm ?? null}
          dailyStepsGoal={dailyStepsGoal}
          todayHabits={todayHabits}
          onSaveWeight={saveWeight}
          onSaveSteps={saveSteps}
          onToggleHabit={(habit, date, next) =>
            setRecord({ habitId: habit.id, date, completed: next })
          }
          onCreateGoal={createGoal}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Hoy</h2>
        <TodaySummary
          steps={todaySteps}
          stepsGoal={dailyStepsGoal}
          stepsPercent={calculateStepCompletion(todaySteps, dailyStepsGoal)}
          habitsCompleted={dayCompletion.completed}
          habitsExpected={dayCompletion.expected}
          habitsPercent={dayCompletion.percentage}
          weightKg={lastWeight?.weight_kg ?? null}
          bmi={bmi}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <GoalOverview goals={goals} />
        <WeeklySummary
          current={currentWeek}
          previous={previousWeek.expected > 0 || previousWeek.averageSteps > 0 ? previousWeek : null}
          habitRows={weekRows}
        />
      </div>
    </div>
  );
}
