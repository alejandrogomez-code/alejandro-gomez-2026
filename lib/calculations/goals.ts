import type { Goal, GoalStatus } from '@/types/database';
import { calculateDaysRemaining, isPast } from './dates';

/**
 * Progreso de un objetivo cuantitativo:
 * (actual - inicial) / (objetivo - inicial) * 100
 * Limitado entre 0 y 100 solo para visualización.
 */
export function calculateGoalProgress(goal: Goal): number | null {
  if (goal.type !== 'quantitative') {
    if (goal.type === 'completion') {
      if (goal.status === 'completed') return 100;
      if (goal.status === 'in_progress') return 50;
      return 0;
    }
    return null;
  }

  const initial = goal.initial_value;
  const target = goal.target_value;
  const current = goal.current_value;

  if (initial === null || target === null || current === null) return null;
  if (target === initial) return current >= target ? 100 : 0;

  const progress = ((current - initial) / (target - initial)) * 100;
  return clampProgress(progress);
}

/** Progreso sin limitar, útil para mostrar sobrecumplimiento. */
export function calculateRawGoalProgress(goal: Goal): number | null {
  if (goal.type !== 'quantitative') return null;
  const { initial_value: initial, target_value: target, current_value: current } = goal;
  if (initial === null || target === null || current === null) return null;
  if (target === initial) return current >= target ? 100 : 0;
  return ((current - initial) / (target - initial)) * 100;
}

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const GOAL_TYPE_LABELS: Record<Goal['type'], string> = {
  quantitative: 'Cuantitativo',
  completion: 'Completar',
  date: 'Fecha',
};

export function isGoalActive(goal: Goal): boolean {
  return goal.status === 'pending' || goal.status === 'in_progress';
}

export function isGoalOverdue(goal: Goal): boolean {
  if (goal.status === 'completed' || goal.status === 'cancelled') return false;
  return isPast(goal.target_date);
}

/** Texto para la fecha objetivo: "faltan 12 días", "hoy", "vencido hace 3 días". */
export function daysRemainingLabel(targetDate: string | null): string | null {
  const remaining = calculateDaysRemaining(targetDate);
  if (remaining === null) return null;
  if (remaining === 0) return 'Vence hoy';
  if (remaining === 1) return 'Falta 1 día';
  if (remaining > 1) return `Faltan ${remaining} días`;
  const overdue = Math.abs(remaining);
  return overdue === 1 ? 'Vencido hace 1 día' : `Vencido hace ${overdue} días`;
}
