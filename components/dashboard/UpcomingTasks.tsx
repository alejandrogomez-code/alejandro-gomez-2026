'use client';

import Link from 'next/link';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { TaskStatusButton } from '@/components/projects/TaskStatusButton';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { addDaysString, formatShortDate, todayString } from '@/lib/calculations/dates';
import { compareTasks, isProjectOpen, isTaskOverdue, taskDueLabel } from '@/lib/calculations/projects';
import type { TaskBrief } from '@/hooks/useProjects';
import type { Project, TaskStatus } from '@/types/database';

const HORIZON_DAYS = 7;
const MAX_ITEMS = 6;

/** Tareas sin terminar que vencen en los próximos 7 días (o ya vencieron). */
export function UpcomingTasks({
  projects,
  tasks,
  onStatusChange,
}: {
  projects: Project[];
  tasks: TaskBrief[];
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}) {
  const { toast } = useToast();
  const limit = addDaysString(todayString(), HORIZON_DAYS);
  const projectById = new Map(projects.filter(isProjectOpen).map((project) => [project.id, project]));

  const upcoming = tasks
    .filter(
      (task) =>
        task.status !== 'completed' &&
        task.due_date !== null &&
        task.due_date <= limit &&
        projectById.has(task.project_id),
    )
    .sort(compareTasks);

  const shown = upcoming.slice(0, MAX_ITEMS);

  async function handleStatus(task: TaskBrief, next: TaskStatus) {
    try {
      await onStatusChange(task.id, next);
      if (next === 'completed') toast(`"${task.title}" completa`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'No se pudo actualizar.', 'error');
    }
  }

  return (
    <Card>
      <CardHeader
        title="Tareas por vencer"
        description={`Próximos ${HORIZON_DAYS} días y atrasadas`}
        action={
          <Link
            href="/proyectos"
            className="inline-flex items-center gap-1 text-sm text-sand-500 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
          >
            Ver proyectos
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
      <CardContent>
        {shown.length === 0 ? (
          <EmptyState
            className="py-8"
            icon={<CalendarCheck className="h-8 w-8" aria-hidden="true" />}
            title="Nada vence esta semana"
            description="Las tareas con fecha de tus proyectos en curso aparecen acá."
          />
        ) : (
          <ul className="divide-y divide-sand-100 dark:divide-sand-800">
            {shown.map((task) => {
              const project = projectById.get(task.project_id);
              const overdue = isTaskOverdue(task);
              return (
                <li key={task.id} className="flex items-center gap-3 py-2.5">
                  <TaskStatusButton
                    status={task.status}
                    compact
                    onChange={(next) => void handleStatus(task, next)}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/proyectos/${task.project_id}`}
                      className="block truncate text-sm text-sand-800 hover:underline dark:text-sand-100"
                    >
                      {task.title}
                    </Link>
                    <p className="flex items-center gap-1.5 truncate text-xs text-sand-500 dark:text-sand-400">
                      {project ? (
                        <>
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', ACCENTS[project.color].dot)} aria-hidden="true" />
                          <span className="truncate">{project.name}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className={cn('tabular', overdue ? 'font-medium text-clay-600 dark:text-clay-400' : 'text-sand-700 dark:text-sand-200')}>
                      {task.due_date ? formatShortDate(task.due_date) : ''}
                    </p>
                    <p className={cn(overdue ? 'text-clay-500 dark:text-clay-400' : 'text-sand-400')}>
                      {taskDueLabel(task.due_date)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {upcoming.length > MAX_ITEMS ? (
          <p className="mt-2 text-xs text-sand-400">
            Y {upcoming.length - MAX_ITEMS} más en tus proyectos.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
