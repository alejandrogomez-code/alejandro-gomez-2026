'use client';

import { useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { AreaOverview } from '@/components/dashboard/AreaOverview';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { UpcomingDeadlines } from '@/components/agenda/UpcomingDeadlines';
import { useRows } from '@/hooks/useRows';
import { calculateGoalProgress, isGoalActive } from '@/lib/calculations/goals';
import { needsAttention } from '@/lib/calculations/agenda';
import { formatNumber, formatPercent, formatShortDate } from '@/lib/calculations/dates';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { WeeklySummary, type WeekMetrics } from '@/components/dashboard/WeeklySummary';
import { GoalOverview } from '@/components/dashboard/GoalOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TodayList } from '@/components/dashboard/TodayList';
import { LoadingState, ErrorState } from '@/components/ui/States';
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
import type { Habit, Task } from '@/types/database';

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
  const { rows: taskRows, update: updateTask } = useRows('tasks', {
    eq: { done: false },
    order: [{ column: 'due_date', ascending: true }],
  });
  const { rows: deadlines } = useRows('deadlines', {
    eq: { done: false },
    order: [{ column: 'due_date', ascending: true }],
  });

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
  const tasks = taskRows.filter((task) => !task.done);
  const tasksForToday = tasks.filter((task) => task.due_date !== null && task.due_date <= today);
  const activeGoals = goals.filter(isGoalActive);
  const goalProgress = activeGoals
    .map((goal) => calculateGoalProgress(goal))
    .filter((value): value is number => value !== null);
  const nextPersonalDate = deadlines.find((deadline) => deadline.area === 'personal') ?? null;
  const weekday = new Date().getDay();
  const reviewTime = weekday === 0 || weekday === 5 || weekday === 6;

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

  const pendingToday =
    Math.max(0, dayCompletion.expected - dayCompletion.completed) + tasksForToday.length;

  const weeklyByHabit = useMemo(
    () =>
      new Map(
        weekRows.map((row) => [row.habit.id, { completed: row.completed, expected: row.expected }]),
      ),
    [weekRows],
  );

  const loading =
    profileLoading || habitsLoading || habitRecordsLoading || stepsLoading || weightLoading || goalsLoading;

  if (loading) return <LoadingState label="Cargando tu panel…" />;

  return (
    <div className="space-y-5 lg:space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand-800 px-6 py-6 text-white sm:px-7">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {greeting()}
          </h1>
          <p className="mt-1 text-sm capitalize text-brand-200">
            {formatLongDate(today)}
            {pendingToday > 0 ? (
              <strong className="normal-case text-amber-300"> · {pendingToday} pendientes</strong>
            ) : null}
          </p>
        </div>
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
      </header>

      {habitsError ? <ErrorState message={habitsError} /> : null}

      <AreaOverview
        work={{
          pending: tasks.filter((task) => task.area === 'trabajo').length,
          dueSoon: deadlines.filter((deadline) => deadline.area === 'trabajo' && needsAttention(deadline)).length,
        }}
        personal={{
          pending: tasks.filter((task) => task.area === 'personal').length,
          nextDate: nextPersonalDate ? formatShortDate(nextPersonalDate.due_date) : null,
        }}
        health={{
          habitsLabel:
            dayCompletion.expected === 0 ? '—' : `${dayCompletion.completed}/${dayCompletion.expected}`,
          stepsLabel: `${formatNumber(todaySteps)} pasos (${formatPercent(
            dailyStepsGoal > 0 ? (todaySteps / dailyStepsGoal) * 100 : 0,
            0,
          )})`,
        }}
        goals={{
          active: activeGoals.length,
          averageProgress:
            goalProgress.length === 0
              ? null
              : goalProgress.reduce((sum, value) => sum + value, 0) / goalProgress.length,
        }}
      />

      {reviewTime ? (
        <Link
          href="/revision"
          className="flex items-center gap-3 rounded-3xl bg-amber-100 px-5 py-4 text-sm font-bold text-amber-800 transition hover:bg-amber-200 dark:bg-amber-400/15 dark:text-amber-100"
        >
          <ClipboardCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1">Se termina la semana: hacé tu revisión semanal guiada (5 minutos).</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
        <TodayTasks
          tasks={tasksForToday}
          onDone={(task: Task) => void updateTask(task.id, { done: true, done_at: new Date().toISOString() })}
        />
        <TodayList
          habits={todayHabits}
          todaySteps={todaySteps}
          stepsGoal={dailyStepsGoal}
          stepsRecorded={stepRecords.some((record) => record.date === today)}
          weightRecordsThisWeek={currentWeek.weightRecords}
          weeklyByHabit={weeklyByHabit}
          onToggleHabit={(habit, next) =>
            void setRecord({ habitId: habit.id, date: today, completed: next })
          }
        />
        </div>
        <div className="space-y-5">
          <UpcomingDeadlines title="Próximas fechas" limit={5} />
          <GoalOverview goals={goals} />
          <WeeklySummary
            current={currentWeek}
            previous={
              previousWeek.expected > 0 || previousWeek.averageSteps > 0 ? previousWeek : null
            }
            habitRows={weekRows}
          />
        </div>
      </div>
    </div>
  );
}
