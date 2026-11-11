'use client';

import { StatCard, StatGrid } from './DashboardStats';
import { bmiCategory, formatBMI } from '@/lib/calculations/bmi';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';
import { formatWeightChange } from '@/lib/calculations/weight';

export interface TodaySummaryProps {
  steps: number;
  stepsGoal: number;
  stepsPercent: number;
  habitsCompleted: number;
  habitsExpected: number;
  habitsPercent: number;
  weightKg: number | null;
  weightChange: number | null;
  bmi: number | null;
}

export function TodaySummary({
  steps,
  stepsGoal,
  stepsPercent,
  habitsCompleted,
  habitsExpected,
  habitsPercent,
  weightKg,
  weightChange,
  bmi,
}: TodaySummaryProps) {
  const category = bmiCategory(bmi);

  return (
    <StatGrid className="grid-cols-1 sm:grid-cols-2">
      <StatCard
        label="Pasos"
        value={formatNumber(steps)}
        note={formatPercent(stepsPercent, 0)}
        detail={`de ${formatNumber(stepsGoal)}`}
        progress={stepsPercent}
        fill="coral"
      />
      <StatCard
        label="Hábitos"
        value={habitsExpected === 0 ? '—' : formatPercent(habitsPercent, 0)}
        note={habitsExpected === 0 ? undefined : `${habitsCompleted} de ${habitsExpected}`}
        detail={habitsExpected === 0 ? 'Sin hábitos previstos' : 'previstos para hoy'}
        progress={habitsExpected === 0 ? null : habitsPercent}
        fill="lilac"
      />
      <StatCard
        label="Peso"
        value={weightKg === null ? '—' : formatNumber(weightKg, 1)}
        unit={weightKg === null ? undefined : 'kg'}
        note={weightChange === null ? undefined : formatWeightChange(weightChange)}
        detail={weightKg === null ? 'Sin registros' : 'último registro'}
        fill="mint"
      />
      <StatCard
        label="IMC"
        value={formatBMI(bmi)}
        note={category ?? undefined}
        detail={bmi === null ? 'Completá tu altura' : 'con el último peso'}
        fill="sun"
      />
    </StatGrid>
  );
}
