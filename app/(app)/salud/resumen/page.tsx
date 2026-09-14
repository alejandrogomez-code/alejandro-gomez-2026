'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { HealthSummary } from '@/components/health/HealthSummary';
import { WeightChart } from '@/components/health/WeightChart';
import { StepsChart } from '@/components/health/StepsChart';
import { WeeklyHabitSummary } from '@/components/habits/WeeklyHabitSummary';
import { buildHabitContext, calculateWeeklyCompletion } from '@/lib/calculations/habits';
import { summarizeSteps } from '@/lib/calculations/steps';
import { addDays, formatNumber, startOfWeek, toDateString } from '@/lib/calculations/dates';

export default function ResumenPage() {
  const { profile, loading: profileLoading } = useProfile();

  const weekStart = startOfWeek(new Date());
  const weekFrom = toDateString(weekStart);
  const weekTo = toDateString(addDays(weekStart, 6));
  const monthFrom = useMemo(() => toDateString(addDays(new Date(), -29)), []);

  const { activeHabits, loading: habitsLoading } = useHabits({ onlyActive: true });
  const { records: habitRecords, loading: recordsLoading } = useHabitRecords({
    from: weekFrom,
    to: weekTo,
  });
  const { records: stepRecords, loading: stepsLoading } = useStepRecords({ from: monthFrom });
  const { records: weightRecords, loading: weightLoading } = useWeightRecords({ from: monthFrom });

  const dailyGoal = profile?.daily_steps_goal ?? 10000;
  const context = useMemo(
    () => buildHabitContext(habitRecords, stepRecords),
    [habitRecords, stepRecords],
  );
  const completion = useMemo(
    () => calculateWeeklyCompletion(activeHabits, weekFrom, weekTo, context),
    [activeHabits, weekFrom, weekTo, context],
  );
  const steps = summarizeSteps(stepRecords, dailyGoal);

  if (profileLoading || habitsLoading || recordsLoading || stepsLoading || weightLoading) {
    return <LoadingState label="Cargando tu resumen…" />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-mist-900 dark:text-mist-100">
          Resumen de salud
        </h1>
        <p className="mt-1 text-sm text-mist-500 dark:text-mist-400">
          Últimos 30 días de peso y pasos, y la semana en curso de hábitos.
        </p>
      </header>

      <HealthSummary
        records={weightRecords}
        heightCm={profile?.height_cm ?? null}
        initialWeightKg={profile?.initial_weight_kg ?? null}
      />

      <StatGrid className="lg:grid-cols-3">
        <StatCard
          label="Pasos de hoy"
          value={formatNumber(steps.todaySteps)}
          progress={steps.todayPercent}
          accent="sage"
        />
        <StatCard
          label="Promedio 7 días"
          value={formatNumber(steps.average7)}
          unit="pasos"
          accent="sage"
        />
        <StatCard
          label="Días con objetivo"
          value={`${steps.goalDays7} / 7`}
          detail="Últimos 7 días"
          accent="sage"
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Peso"
            action={
              <Link
                href="/salud/peso"
                className="inline-flex items-center gap-1 text-sm text-mist-500 hover:text-mist-900 dark:text-mist-400 dark:hover:text-mist-100"
              >
                Ver detalle
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <CardContent>
            <WeightChart records={weightRecords} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Pasos"
            action={
              <Link
                href="/salud/pasos"
                className="inline-flex items-center gap-1 text-sm text-mist-500 hover:text-mist-900 dark:text-mist-400 dark:hover:text-mist-100"
              >
                Ver detalle
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <CardContent>
            <StepsChart records={stepRecords} dailyGoal={dailyGoal} days={30} />
          </CardContent>
        </Card>
      </div>

      <WeeklyHabitSummary completion={completion} />
    </div>
  );
}
