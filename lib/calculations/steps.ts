import type { StepRecord } from '@/types/database';
import { addDays, eachDayString, toDateString, todayString } from './dates';

/** Porcentaje de cumplimiento del objetivo diario de pasos (sin limitar). */
export function calculateStepCompletion(steps: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return (steps / goal) * 100;
}

export interface StepsSummary {
  todaySteps: number;
  todayPercent: number;
  average7: number;
  average30: number;
  bestDay: StepRecord | null;
  goalDays7: number;
  goalDaysTotal: number;
  totalRecords: number;
}

/** Promedio de pasos sobre los últimos `days` días de calendario. */
export function averageSteps(records: StepRecord[], days: number, reference = new Date()): number {
  const from = addDays(reference, -(days - 1));
  const range = new Set(eachDayString(from, reference));
  const relevant = records.filter((record) => range.has(record.date));
  if (relevant.length === 0) return 0;
  const total = relevant.reduce((sum, record) => sum + record.steps, 0);
  return total / relevant.length;
}

export function summarizeSteps(records: StepRecord[], goal: number): StepsSummary {
  const today = todayString();
  const todayRecord = records.find((record) => record.date === today);
  const todaySteps = todayRecord?.steps ?? 0;

  const bestDay = records.reduce<StepRecord | null>((best, record) => {
    if (!best || record.steps > best.steps) return record;
    return best;
  }, null);

  const last7From = toDateString(addDays(new Date(), -6));
  const goalDays7 = records.filter(
    (record) => record.date >= last7From && record.date <= today && record.steps >= goal,
  ).length;

  return {
    todaySteps,
    todayPercent: calculateStepCompletion(todaySteps, goal),
    average7: averageSteps(records, 7),
    average30: averageSteps(records, 30),
    bestDay,
    goalDays7,
    goalDaysTotal: records.filter((record) => record.steps >= goal).length,
    totalRecords: records.length,
  };
}

/** Serie continua (con ceros en días sin registro) lista para Recharts. */
export interface StepChartPoint {
  date: string;
  steps: number;
}

export function buildStepSeries(records: StepRecord[], days: number): StepChartPoint[] {
  const today = new Date();
  const from = addDays(today, -(days - 1));
  const byDate = new Map(records.map((record) => [record.date, record.steps]));
  return eachDayString(from, today).map((date) => ({
    date,
    steps: byDate.get(date) ?? 0,
  }));
}
