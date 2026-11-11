'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DueBadge } from '@/components/agenda/DueBadge';
import { ACCENTS } from '@/lib/accents';
import { AREAS } from '@/lib/areas';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/database';

/** Tareas de trabajo y personales que vencen hoy o ya vencieron. */
export function TodayTasks({ tasks, onDone }: { tasks: Task[]; onDone: (task: Task) => void }) {
  return (
    <Card>
      <CardHeader
        title="Para hoy"
        description="Tareas de Trabajo y Personal con fecha de hoy o atrasadas."
        action={
          tasks.length > 0 ? (
            <span className="tabular rounded-full bg-brand-800 px-2.5 py-1 text-xs font-extrabold text-white">
              {tasks.length}
            </span>
          ) : null
        }
      />
      {tasks.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-sand-600 dark:text-sand-400">
          No hay tareas con fecha para hoy. Podés sumar una con el botón{' '}
          <span className="font-extrabold">+</span> o desde{' '}
          <Link href="/trabajo" className="font-bold underline">
            Trabajo
          </Link>{' '}
          y{' '}
          <Link href="/personal" className="font-bold underline">
            Personal
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2 px-3 pb-4 sm:px-4">
          {tasks.map((task) => {
            const meta = AREAS[task.area];
            return (
              <li key={task.id} className={cn('flex items-center gap-3 rounded-2xl px-3 py-2.5', ACCENTS[meta.accent].soft)}>
                <button
                  type="button"
                  onClick={() => onDone(task)}
                  aria-label={`Marcar "${task.title}" como hecho`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-sand-400 bg-white text-transparent transition hover:border-brand-500 hover:text-brand-500 dark:bg-sand-900"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-sand-900 dark:text-sand-100">{task.title}</p>
                  <p className="text-xs text-sand-500">{meta.label}</p>
                </div>
                <DueBadge date={task.due_date} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
