'use client';

import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { bmiCategory, calculateBMI, formatBMI } from '@/lib/calculations/bmi';
import { formatDate, formatNumber } from '@/lib/calculations/dates';
import { formatWeightChange, summarizeWeight } from '@/lib/calculations/weight';
import type { WeightRecord } from '@/types/database';

export interface HealthSummaryProps {
  records: WeightRecord[];
  heightCm: number | null;
  initialWeightKg: number | null;
}

/** Indicadores de peso e IMC. El IMC siempre se calcula, nunca se guarda. */
export function HealthSummary({ records, heightCm, initialWeightKg }: HealthSummaryProps) {
  const summary = summarizeWeight(records, initialWeightKg);
  const currentWeight = summary.current?.weight_kg ?? null;
  const bmi = calculateBMI(currentWeight, heightCm);
  const category = bmiCategory(bmi);
  const losing = summary.change !== null && summary.change <= 0;

  return (
    <StatGrid>
      <StatCard
        label="Actual"
        value={currentWeight === null ? '—' : formatNumber(currentWeight, 1)}
        unit={currentWeight === null ? undefined : 'kg'}
        detail={summary.current ? formatDate(summary.current.date) : 'Sin registros'}
        accent="ocean"
      />
      <StatCard
        label="Inicial"
        value={summary.initial === null ? '—' : formatNumber(summary.initial, 1)}
        unit={summary.initial === null ? undefined : 'kg'}
        detail="peso de partida"
        accent="ocean"
      />
      <StatCard
        label="Variación"
        value={formatWeightChange(summary.change).replace(' kg', '')}
        unit={summary.change === null ? undefined : 'kg'}
        detail={`${summary.recordsThisWeek} de 3 registros esta semana`}
        accent={losing ? 'brand' : 'amber'}
      />
      <StatCard
        label="IMC"
        value={formatBMI(bmi)}
        note={category ?? undefined}
        detail={
          summary.min && summary.max
            ? `Mín ${formatNumber(summary.min.weight_kg, 1)} · Máx ${formatNumber(summary.max.weight_kg, 1)}`
            : 'Falta altura o peso'
        }
        accent={category === 'Peso normal' ? 'brand' : 'amber'}
      />
    </StatGrid>
  );
}
