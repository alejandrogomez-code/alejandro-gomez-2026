'use client';

import { Scale, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { Badge } from '@/components/ui/Badge';
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
  const losing = summary.change !== null && summary.change < 0;

  return (
    <StatGrid>
      <StatCard
        label="Peso actual"
        value={currentWeight === null ? '—' : formatNumber(currentWeight, 1)}
        unit={currentWeight === null ? undefined : 'kg'}
        icon={<Scale className="h-4 w-4" aria-hidden="true" />}
        detail={summary.current ? formatDate(summary.current.date) : 'Sin registros'}
      />
      <StatCard
        label="Peso inicial"
        value={summary.initial === null ? '—' : formatNumber(summary.initial, 1)}
        unit={summary.initial === null ? undefined : 'kg'}
        detail={`Variación ${formatWeightChange(summary.change)}`}
        icon={
          losing ? (
            <TrendingDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          )
        }
      />
      <StatCard
        label="IMC actual"
        value={formatBMI(bmi)}
        icon={<Activity className="h-4 w-4" aria-hidden="true" />}
        detail={category ? <Badge tone="neutral">{category}</Badge> : 'Falta altura o peso'}
      />
      <StatCard
        label="Mínimo / máximo"
        value={
          summary.min && summary.max
            ? `${formatNumber(summary.min.weight_kg, 1)} / ${formatNumber(summary.max.weight_kg, 1)}`
            : '—'
        }
        unit={summary.min ? 'kg' : undefined}
        detail={`Registros esta semana: ${summary.recordsThisWeek} / 3`}
      />
    </StatGrid>
  );
}
