'use client';

import { useState } from 'react';
import { CalendarClock, NotebookText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { calculateDaysRemaining, formatShortDate } from '@/lib/calculations/dates';
import { isTaskOverdue, taskDueLabel } from '@/lib/calculations/projects';
import type { ProjectTask, TaskStatus } from '@/types/database';
import { TaskStatusButton } from './TaskStatusButton';

export function TaskRow({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: ProjectTask;
  onStatusChange: (task: ProjectTask, status: TaskStatus) => Promise<void>;
  onEdit: (task: ProjectTask) => void;
  onDelete: (task: ProjectTask) => void;
}) {
  const [working, setWorking] = useState(false);
  const done = task.status === 'completed';
  const overdue = isTaskOverdue(task);
  const remaining = calculateDaysRemaining(task.due_date);
  const soon = !done && !overdue && remaining !== null && remaining <= 2;

  async function handleStatus(next: TaskStatus) {
    setWorking(true);
    try {
      await onStatusChange(task, next);
    } finally {
      setWorking(false);
    }
  }

  return (
    <li
      className={cn(
        'group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-mist-50 dark:hover:bg-mist-800/40',
        overdue ? 'bg-red-50/70 dark:bg-red-950/20' : '',
      )}
    >
      <TaskStatusButton status={task.status} onChange={handleStatus} disabled={working} />

      <div className="min-w-0 flex-1 pt-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className={cn(
            'block w-full text-left text-sm leading-snug focus-visible:outline-none focus-visible:underline',
            done
              ? 'text-mist-400 line-through decoration-mist-300 dark:text-mist-500'
              : 'text-mist-800 dark:text-mist-100',
          )}
        >
          {task.title}
        </button>
        {task.due_date || task.notes ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {task.due_date ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  overdue
                    ? 'font-medium text-red-600 dark:text-red-400'
                    : soon
                      ? 'font-medium text-honey-700 dark:text-honey-300'
                      : 'text-mist-500 dark:text-mist-400',
                )}
              >
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular">{formatShortDate(task.due_date)}</span>
                {!done ? <span>· {taskDueLabel(task.due_date)}</span> : null}
              </span>
            ) : null}
            {task.notes ? (
              <span className="inline-flex items-center gap-1 text-mist-400" title={task.notes}>
                <NotebookText className="h-3.5 w-3.5" aria-hidden="true" />
                Con notas
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:inline-flex" aria-label={`Editar ${task.title}`} onClick={() => onEdit(task)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-red-600 dark:hover:text-red-400"
          aria-label={`Eliminar ${task.title}`}
          onClick={() => onDelete(task)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
