import type { WeightRecord } from '@/types/database';
import { endOfWeek, startOfWeek, toDateString } from './dates';

export interface WeightSummary {
  current: WeightRecord | null;
  initial: number | null;
  change: number | null;
  min: WeightRecord | null;
  max: WeightRecord | null;
  recordsThisWeek: number;
}

/** Variación entre el peso actual y el peso inicial del perfil. */
export function calculateWeightChange(
  currentWeight: number | null,
  initialWeight: number | null,
): number | null {
  if (currentWeight === null || initialWeight === null) return null;
  return currentWeight - initialWeight;
}

/**
 * Los registros deben venir ordenados por fecha ascendente.
 */
export function summarizeWeight(
  records: WeightRecord[],
  initialWeightKg: number | null,
): WeightSummary {
  const current = records.length > 0 ? records[records.length - 1] : null;
  const initial = initialWeightKg ?? (records.length > 0 ? records[0].weight_kg : null);

  const min = records.reduce<WeightRecord | null>(
    (best, record) => (!best || record.weight_kg < best.weight_kg ? record : best),
    null,
  );
  const max = records.reduce<WeightRecord | null>(
    (best, record) => (!best || record.weight_kg > best.weight_kg ? record : best),
    null,
  );

  const now = new Date();
  const from = toDateString(startOfWeek(now));
  const to = toDateString(endOfWeek(now));
  const recordsThisWeek = records.filter(
    (record) => record.date >= from && record.date <= to,
  ).length;

  return {
    current,
    initial,
    change: calculateWeightChange(current?.weight_kg ?? null, initial),
    min,
    max,
    recordsThisWeek,
  };
}

/** Variación formateada con signo: '-0,7 kg'. */
export function formatWeightChange(change: number | null): string {
  if (change === null) return '—';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toLocaleString('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} kg`;
}
