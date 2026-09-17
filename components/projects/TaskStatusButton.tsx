'use client';

import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_STATUS_LABELS, nextTaskStatus } from '@/lib/calculations/projects';
import type { TaskStatus } from '@/types/database';

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  pending:
    'bg-honey-100 text-honey-800 hover:bg-honey-200 dark:bg-honey-500/15 dark:text-honey-300 dark:hover:bg-honey-500/25',
  in_progress:
    'bg-ocean-100 text-ocean-700 hover:bg-ocean-200 dark:bg-ocean-500/20 dark:text-ocean-300 dark:hover:bg-ocean-500/30',
  completed:
    'bg-sage-100 text-sage-700 hover:bg-sage-200 dark:bg-sage-500/20 dark:text-sage-300 dark:hover:bg-sage-500/30',
};

const ICONS = { pending: Circle, in_progress: CircleDot, completed: CheckCircle2 };

/**
 * Muestra el estado de una tarea. Al tocarlo pasa al siguiente:
 * Pendiente → En proceso → Completa → Pendiente.
 */
export function TaskStatusButton({
  status,
  onChange,
  compact = false,
  disabled = false,
}: {
  status: TaskStatus;
  onChange: (next: TaskStatus) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const Icon = ICONS[status];
  const next = nextTaskStatus(status);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(next)}
      title={`Cambiar a ${TASK_STATUS_LABELS[next].toLowerCase()}`}
      aria-label={`Estado: ${TASK_STATUS_LABELS[status]}. Cambiar a ${TASK_STATUS_LABELS[next].toLowerCase()}`}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 dark:focus-visible:ring-ocean-300',
        'disabled:opacity-60',
        TASK_STATUS_STYLES[status],
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className={cn(compact ? 'sr-only' : 'hidden w-[4.75rem] text-left sm:inline')}>
        {TASK_STATUS_LABELS[status]}
      </span>
    </button>
  );
}
