'use client';

import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, CalendarPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { formatPercent } from '@/lib/calculations/dates';
import { summarizeTasks } from '@/lib/calculations/projects';
import type { ProjectColor, ProjectStage, ProjectTask, TaskStatus } from '@/types/database';
import { TaskRow } from './TaskRow';

export interface StageSectionProps {
  stage: ProjectStage;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  color: ProjectColor;
  /** Todas las tareas de la etapa (para el progreso). */
  tasks: ProjectTask[];
  /** Tareas a mostrar, ya filtradas y ordenadas. */
  visibleTasks: ProjectTask[];
  filtered: boolean;
  onQuickAdd: (stage: ProjectStage, title: string, dueDate: string | null) => Promise<void>;
  onStatusChange: (task: ProjectTask, status: TaskStatus) => Promise<void>;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onRename: (stage: ProjectStage) => void;
  onMove: (stage: ProjectStage, direction: -1 | 1) => void;
  onDelete: (stage: ProjectStage) => void;
}

export function StageSection({
  stage,
  index,
  isFirst,
  isLast,
  color,
  tasks,
  visibleTasks,
  filtered,
  onQuickAdd,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onRename,
  onMove,
  onDelete,
}: StageSectionProps) {
  const theme = ACCENTS[color];
  const summary = summarizeTasks(tasks);
  const complete = summary.total > 0 && summary.completed === summary.total;
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    try {
      await onQuickAdd(stage, title.trim(), dueDate || null);
      setTitle('');
      setDueDate('');
      setShowDate(false);
    } catch {
      // El error ya se informó; se conserva lo escrito para reintentar.
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5">
        <span
          className={cn(
            'tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
            complete ? ACCENTS.brand.solid : theme.solid,
          )}
          aria-hidden="true"
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-medium text-sand-900 dark:text-sand-100">
            {stage.name}
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <Progress
              value={summary.percentage}
              className="h-1.5 max-w-[12rem]"
              barClassName={complete ? ACCENTS.brand.bar : theme.bar}
              label={`Progreso de ${stage.name}`}
            />
            <span className="tabular shrink-0 text-xs text-sand-500 dark:text-sand-400">
              {summary.total === 0
                ? 'Sin tareas'
                : `${summary.completed}/${summary.total} · ${formatPercent(summary.percentage, 0)}`}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Subir etapa" disabled={isFirst} onClick={() => onMove(stage, -1)}>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Bajar etapa" disabled={isLast} onClick={() => onMove(stage, 1)}>
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Renombrar etapa" onClick={() => onRename(stage)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-clay-600 dark:hover:text-clay-400"
            aria-label="Eliminar etapa"
            onClick={() => onDelete(stage)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="px-2 sm:px-3">
        {visibleTasks.length > 0 ? (
          <ul className="space-y-0.5">
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </ul>
        ) : (
          <p className="px-2 pb-2 text-sm text-sand-400">
            {filtered && summary.total > 0
              ? 'Ninguna tarea de esta etapa coincide con el filtro.'
              : 'Todavía no hay tareas en esta etapa.'}
          </p>
        )}
      </div>

      <form
        onSubmit={handleAdd}
        className={cn('mt-2 flex flex-wrap items-center gap-2 border-t px-4 py-3 sm:px-5', 'border-sand-100 dark:border-sand-800', theme.soft)}
      >
        <label htmlFor={`add-${stage.id}`} className="sr-only">
          Nueva tarea en {stage.name}
        </label>
        <input
          id={`add-${stage.id}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Agregar una tarea…"
          className="h-9 min-w-0 flex-1 basis-40 rounded-lg border border-transparent bg-white px-3 text-sm text-sand-900 placeholder:text-sand-400 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:bg-sand-950 dark:text-sand-100"
        />
        {showDate ? (
          <>
            <label htmlFor={`due-${stage.id}`} className="sr-only">
              Vencimiento
            </label>
            <input
              id={`due-${stage.id}`}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="h-9 rounded-lg border border-transparent bg-white px-2 text-sm text-sand-900 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:bg-sand-950 dark:text-sand-100"
            />
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Agregar vencimiento"
            title="Agregar vencimiento"
            onClick={() => setShowDate(true)}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        <Button type="submit" size="sm" className="h-9" loading={adding} disabled={!title.trim()}>
          {adding ? null : <Plus className="h-4 w-4" aria-hidden="true" />}
          Agregar
        </Button>
      </form>
    </Card>
  );
}
