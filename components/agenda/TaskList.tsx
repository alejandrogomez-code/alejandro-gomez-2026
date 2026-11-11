'use client';

import { useState, type FormEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { DueBadge } from './DueBadge';
import { useRows } from '@/hooks/useRows';
import { sortTasks } from '@/lib/calculations/agenda';
import { ACCENTS, type Accent } from '@/lib/accents';
import { cn } from '@/lib/utils';
import type { Task, WorkArea } from '@/types/database';

export interface TaskListProps {
  area: WorkArea;
  title?: string;
  description?: string;
  /** Solo las tareas de una reunión (compromisos). */
  meetingId?: string;
  accent?: Accent;
  placeholder?: string;
  emptyTitle?: string;
  className?: string;
}

/** Lista de pendientes con alta rápida, fecha opcional y tildado. */
export function TaskList({
  area,
  title = 'Pendientes',
  description,
  meetingId,
  accent = area === 'trabajo' ? 'plum' : 'clay',
  placeholder = 'Agregar un pendiente…',
  emptyTitle = 'Nada pendiente por acá',
  className,
}: TaskListProps) {
  const { toast } = useToast();
  const { rows, loading, error, create, update, remove } = useRows('tasks', {
    eq: meetingId ? { meeting_id: meetingId } : { area },
  });
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const theme = ACCENTS[accent];

  const pending = sortTasks(rows.filter((task) => !task.done));
  const done = rows.filter((task) => task.done);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await create({
        area,
        title: newTitle.trim(),
        due_date: newDate || null,
        meeting_id: meetingId ?? null,
      });
      setNewTitle('');
      setNewDate('');
    } catch (addError) {
      toast(addError instanceof Error ? addError.message : 'No se pudo agregar');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(task: Task) {
    const next = !task.done;
    await update(task.id, { done: next, done_at: next ? new Date().toISOString() : null });
    if (next) toast(`Hecho: ${task.title}`);
  }

  return (
    <Card className={className}>
      <CardHeader
        title={title}
        description={description}
        action={
          pending.length > 0 ? (
            <span className={cn('tabular rounded-full px-2.5 py-1 text-xs font-extrabold', theme.chip)}>
              {pending.length}
            </span>
          ) : null
        }
      />

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 px-5 pb-2 pt-2">
        <label className="sr-only" htmlFor={`task-title-${area}-${meetingId ?? 'all'}`}>
          Nuevo pendiente
        </label>
        <input
          id={`task-title-${area}-${meetingId ?? 'all'}`}
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder={placeholder}
          className="h-11 min-w-0 flex-[3_1_200px] rounded-full border border-sand-200 bg-sand-50 px-4 text-sm text-sand-900 placeholder:text-sand-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-100"
        />
        <label className="sr-only" htmlFor={`task-date-${area}-${meetingId ?? 'all'}`}>
          Fecha límite (opcional)
        </label>
        <input
          id={`task-date-${area}-${meetingId ?? 'all'}`}
          type="date"
          value={newDate}
          onChange={(event) => setNewDate(event.target.value)}
          className="h-11 flex-[1_1_140px] rounded-full border border-sand-200 bg-sand-50 px-4 text-sm text-sand-700 focus:border-brand-400 focus:outline-none dark:border-sand-800 dark:bg-sand-950 dark:text-sand-200"
        />
        <Button type="submit" size="lg" loading={saving} disabled={!newTitle.trim()} className="h-11 px-4">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar
        </Button>
      </form>

      {error ? <ErrorState message={error} className="mx-5 my-3" /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && pending.length === 0 ? (
        <EmptyState title={emptyTitle} className="py-8" />
      ) : (
        <ul className="space-y-2 px-3 pb-3 pt-2 sm:px-4">
          {pending.map((task) => (
            <TaskItem key={task.id} task={task} softClass={theme.soft} onToggle={toggle} onDelete={(t) => void remove(t.id)} />
          ))}
        </ul>
      )}

      {done.length > 0 ? (
        <div className="border-t border-sand-100 px-5 py-3 dark:border-sand-800">
          <button
            type="button"
            onClick={() => setShowDone((value) => !value)}
            className="text-sm font-bold text-sand-500 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
            aria-expanded={showDone}
          >
            {showDone ? 'Ocultar' : 'Ver'} hechas ({done.length})
          </button>
          {showDone ? (
            <ul className="mt-2 space-y-1">
              {done.map((task) => (
                <TaskItem key={task.id} task={task} softClass="" onToggle={toggle} onDelete={(t) => void remove(t.id)} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function TaskItem({
  task,
  softClass,
  onToggle,
  onDelete,
}: {
  task: Task;
  softClass: string;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <li className={cn('group flex items-center gap-3 rounded-2xl px-3 py-2.5', softClass)}>
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-pressed={task.done}
        aria-label={task.done ? `Marcar "${task.title}" como pendiente` : `Marcar "${task.title}" como hecho`}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          task.done
            ? 'border-brand-800 bg-brand-800 text-white dark:border-brand-300 dark:bg-brand-300 dark:text-brand-900'
            : 'border-sand-400 bg-white hover:border-brand-500 dark:bg-sand-900',
        )}
      >
        {task.done ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-bold text-sand-900 dark:text-sand-100',
            task.done ? 'text-sand-500 line-through dark:text-sand-500' : '',
          )}
        >
          {task.title}
        </p>
        {task.notes ? <p className="truncate text-xs text-sand-500">{task.notes}</p> : null}
      </div>
      {!task.done ? <DueBadge date={task.due_date} /> : null}
      <button
        type="button"
        onClick={() => onDelete(task)}
        aria-label={`Eliminar "${task.title}"`}
        className="rounded-full p-2 text-sand-400 opacity-60 transition hover:bg-white hover:text-clay-500 group-hover:opacity-100 dark:hover:bg-sand-800"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}
