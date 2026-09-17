import type { Project, ProjectStatus, ProjectTask, TaskStatus } from '@/types/database';
import { calculateDaysRemaining, isPast } from './dates';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Activo',
  paused: 'En pausa',
  completed: 'Completado',
  archived: 'Archivado',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completa',
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];

/** Pendiente → En proceso → Completa → Pendiente. */
export function nextTaskStatus(status: TaskStatus): TaskStatus {
  const index = TASK_STATUS_ORDER.indexOf(status);
  return TASK_STATUS_ORDER[(index + 1) % TASK_STATUS_ORDER.length];
}

type TaskLike = Pick<ProjectTask, 'status' | 'due_date'>;

export function isTaskOverdue(task: TaskLike): boolean {
  return task.status !== 'completed' && isPast(task.due_date);
}

export interface TaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  /** Tareas completas / total * 100. 0 si no hay tareas. */
  percentage: number;
}

/**
 * Resumen de un conjunto de tareas. El progreso cuenta solo las completas:
 * 3 completas de 8 da 37,5%, sin importar cuántas estén en proceso.
 */
export function summarizeTasks(tasks: TaskLike[]): TaskSummary {
  const summary: TaskSummary = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    percentage: 0,
  };
  for (const task of tasks) {
    if (task.status === 'pending') summary.pending += 1;
    else if (task.status === 'in_progress') summary.inProgress += 1;
    else summary.completed += 1;
    if (isTaskOverdue(task)) summary.overdue += 1;
  }
  summary.percentage = summary.total === 0 ? 0 : (summary.completed / summary.total) * 100;
  return summary;
}

/** Orden de tareas: primero sin completar, por vencimiento (sin fecha al final). */
export function compareTasks<T extends TaskLike & { created_at: string }>(a: T, b: T): number {
  const doneA = a.status === 'completed' ? 1 : 0;
  const doneB = b.status === 'completed' ? 1 : 0;
  if (doneA !== doneB) return doneA - doneB;
  if (a.due_date !== b.due_date) {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  }
  return a.created_at < b.created_at ? -1 : 1;
}

export function isProjectOpen(project: Project): boolean {
  return project.status === 'active' || project.status === 'paused';
}

/** Texto corto del vencimiento de una tarea. */
export function taskDueLabel(dueDate: string | null): string | null {
  const remaining = calculateDaysRemaining(dueDate);
  if (remaining === null) return null;
  if (remaining === 0) return 'Vence hoy';
  if (remaining === 1) return 'Vence mañana';
  if (remaining > 1) return `En ${remaining} días`;
  const overdue = Math.abs(remaining);
  return overdue === 1 ? 'Venció ayer' : `Venció hace ${overdue} días`;
}

/** '1 pendiente', '3 pendientes'. */
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Etapas que se ofrecen para arrancar un proyecto vacío. */
export const DEFAULT_STAGES = ['Planificación', 'Ejecución', 'Cierre'];
