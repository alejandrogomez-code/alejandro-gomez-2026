import { addMonths, calculateDaysRemaining, formatShortDate, parseDate, toDateString } from './dates';
import type { Deadline, Recurrence, Task } from '@/types/database';

export type DueTone = 'overdue' | 'today' | 'soon' | 'later' | 'none';

/** Estado de una fecha límite respecto de hoy. */
export function dueTone(date: string | null, soonDays = 3): DueTone {
  const remaining = calculateDaysRemaining(date);
  if (remaining === null) return 'none';
  if (remaining < 0) return 'overdue';
  if (remaining === 0) return 'today';
  if (remaining <= soonDays) return 'soon';
  return 'later';
}

/** 'Hoy', 'Mañana', 'En 4 días', 'Venció hace 2 días', '14 dic'. */
export function dueLabel(date: string | null): string | null {
  const remaining = calculateDaysRemaining(date);
  if (remaining === null || !date) return null;
  if (remaining === 0) return 'Hoy';
  if (remaining === 1) return 'Mañana';
  if (remaining === -1) return 'Ayer';
  if (remaining < 0) return `Hace ${Math.abs(remaining)} días`;
  if (remaining <= 14) return `En ${remaining} días`;
  return formatShortDate(date);
}

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'Una sola vez',
  monthly: 'Todos los meses',
  yearly: 'Todos los años',
};

/** Próxima fecha de un vencimiento recurrente, después de cumplirlo. */
export function nextOccurrence(deadline: Pick<Deadline, 'due_date' | 'recurrence'>): string | null {
  if (deadline.recurrence === 'none') return null;
  const months = deadline.recurrence === 'monthly' ? 1 : 12;
  return toDateString(addMonths(parseDate(deadline.due_date), months));
}

/** Tareas pendientes ordenadas: primero las que tienen fecha, por fecha. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
}

/** ¿Hay que avisar de este vencimiento? (dentro de su anticipación o vencido) */
export function needsAttention(deadline: Deadline): boolean {
  if (deadline.done) return false;
  const remaining = calculateDaysRemaining(deadline.due_date);
  return remaining !== null && remaining <= deadline.remind_days;
}
