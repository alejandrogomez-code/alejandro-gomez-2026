'use client';

import { Activity, Footprints, ListChecks, Scale } from 'lucide-react';
import { StatCard, StatGrid } from './DashboardStats';
import { formatBMI } from '@/lib/calculations/bmi';
import { formatNumber, formatPercent } from '@/lib/calculations/dates';

export interface TodaySummaryProps {
  steps: number;
  stepsGoal: number;
  stepsPercent: number;
  habitsCompleted: number;
  habitsExpected: number;
  habitsPercent: number;
  weightKg: number | null;
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
  bmi,
}: TodaySummaryProps) {
  return (
    <StatGrid>
      <StatCard
        label="Pasos"
        value={formatNumber(steps)}
        detail={`${formatNumber(steps)} / ${formatNumber(stepsGoal)} · ${formatPercent(stepsPercent, 0)}`}
        progress={stepsPercent}
        icon={<Footprints className="h-4 w-4" aria-hidden="true" />}
      />
      <StatCard
        label="Hábitos de hoy"
        value={habitsExpected === 0 ? '—' : `${habitsCompleted} / ${habitsExpected}`}
        detail={habitsExpected === 0 ? 'Sin hábitos previstos' : formatPercent(habitsPercent, 0)}
        progress={habitsExpected === 0 ? null : habitsPercent}
        icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}
      />
      <StatCard
        label="Peso"
        value={weightKg === null ? '—' : formatNumber(weightKg, 1)}
        unit={weightKg === null ? undefined : 'kg'}
        detail={weightKg === null ? 'Sin registros' : 'Último registro'}
        icon={<Scale className="h-4 w-4" aria-hidden="true" />}
      />
      <StatCard
        label="IMC"
        value={formatBMI(bmi)}
        detail={bmi === null ? 'Completá tu altura' : 'Calculado con el último peso'}
        icon={<Activity className="h-4 w-4" aria-hidden="true" />}
      />
    </StatGrid>
  );
}
