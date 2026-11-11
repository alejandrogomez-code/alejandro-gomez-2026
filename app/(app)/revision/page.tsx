'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { DueBadge } from '@/components/agenda/DueBadge';
import { useRows } from '@/hooks/useRows';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { buildHabitContext, calculateWeeklyCompletion } from '@/lib/calculations/habits';
import {
  addDays,
  addDaysString,
  formatPercent,
  formatShortDate,
  startOfWeek,
  toDateString,
} from '@/lib/calculations/dates';
import { AREAS } from '@/lib/areas';
import { ACCENTS } from '@/lib/accents';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/database';

const MOODS = [
  { value: 1, label: 'Muy difícil' },
  { value: 2, label: 'Pesada' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'Buena' },
  { value: 5, label: 'Excelente' },
];

export default function RevisionPage() {
  const { toast } = useToast();
  const [offset, setOffset] = useState(0);
  const weekStartDate = addDays(startOfWeek(new Date()), offset * 7);
  const from = toDateString(weekStartDate);
  const to = toDateString(addDays(weekStartDate, 6));
  const nextMonday = toDateString(addDays(weekStartDate, 7));

  const { rows: tasks, loading: tasksLoading, update: updateTask } = useRows('tasks', {
    order: [{ column: 'due_date', ascending: true }],
  });
  const { rows: books } = useRows('books', {});
  const { rows: reviews, create: createReview, update: updateReview } = useRows('weekly_reviews', {
    order: [{ column: 'week_start', ascending: false }],
  });
  const { activeHabits } = useHabits();
  const { records: habitRecords } = useHabitRecords({ from, to });
  const { records: stepRecords } = useStepRecords({ from, to });

  const context = useMemo(() => buildHabitContext(habitRecords, stepRecords), [habitRecords, stepRecords]);
  const habitWeek = calculateWeeklyCompletion(activeHabits, from, to, context);

  const doneThisWeek = tasks.filter(
    (task) => task.done && task.done_at && task.done_at.slice(0, 10) >= from && task.done_at.slice(0, 10) <= to,
  );
  const carryOver = tasks.filter((task) => !task.done && task.due_date && task.due_date <= to);
  const booksFinished = books.filter(
    (book) => book.status === 'leido' && book.finished_on && book.finished_on >= from && book.finished_on <= to,
  );

  const existing = reviews.find((review) => review.week_start === from) ?? null;
  const [highlights, setHighlights] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextFocus, setNextFocus] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHighlights(existing?.highlights ?? '');
    setBlockers(existing?.blockers ?? '');
    setNextFocus(existing?.next_focus ?? '');
    setMood(existing?.mood ?? null);
  }, [existing?.id, existing?.highlights, existing?.blockers, existing?.next_focus, existing?.mood, from]);

  async function moveToNextWeek(task: Task) {
    await updateTask(task.id, { due_date: nextMonday });
    toast(`"${task.title}" pasó al ${formatShortDate(nextMonday)}`);
  }

  async function markDone(task: Task) {
    await updateTask(task.id, { done: true, done_at: new Date().toISOString() });
  }

  async function saveReview() {
    setSaving(true);
    const values = {
      highlights: highlights.trim() || null,
      blockers: blockers.trim() || null,
      next_focus: nextFocus.trim() || null,
      mood,
    };
    try {
      if (existing) await updateReview(existing.id, values);
      else await createReview({ ...values, week_start: from });
      toast('Revisión guardada');
    } catch (saveError) {
      toast(saveError instanceof Error ? saveError.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Revisión semanal"
        description="Cinco minutos para cerrar la semana: qué salió, qué quedó y en qué enfocarte."
        icon={ClipboardCheck}
        accent="amber"
      />

      <div className="flex items-center justify-between gap-3 rounded-3xl bg-brand-800 px-4 py-3 text-white">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Semana anterior"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={() => setOffset((value) => value - 1)}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <p className="text-center text-sm font-extrabold sm:text-base">
          Semana del {formatShortDate(from)} al {formatShortDate(to)}
          {offset === 0 ? <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-xs text-brand-900">Esta semana</span> : null}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Semana siguiente"
          className="text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
          disabled={offset >= 0}
          onClick={() => setOffset((value) => Math.min(0, value + 1))}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <section aria-labelledby="paso-1" className="space-y-3">
        <h2 id="paso-1" className="text-lg font-extrabold text-sand-900 dark:text-sand-100">
          1 · Lo que cumpliste
        </h2>
        <StatGrid>
          <StatCard label="Tareas hechas" value={doneThisWeek.length} fill="lilac" />
          <StatCard
            label="Hábitos"
            value={habitWeek.expected === 0 ? '—' : formatPercent(habitWeek.percentage, 0)}
            detail={`${habitWeek.completed} de ${habitWeek.expected} previstos`}
            progress={habitWeek.expected === 0 ? null : habitWeek.percentage}
            fill="mint"
          />
          <StatCard label="Libros terminados" value={booksFinished.length} fill="coral" />
          <StatCard label="Quedaron pendientes" value={carryOver.length} fill="sun" />
        </StatGrid>
        {doneThisWeek.length > 0 ? (
          <Card>
            <CardContent className="pt-5">
              <ul className="flex flex-wrap gap-2">
                {doneThisWeek.map((task) => (
                  <li
                    key={task.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold',
                      ACCENTS[AREAS[task.area].accent].soft,
                    )}
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    {task.title}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <section aria-labelledby="paso-2" className="space-y-3">
        <h2 id="paso-2" className="text-lg font-extrabold text-sand-900 dark:text-sand-100">
          2 · Lo que quedó pendiente
        </h2>
        <Card>
          {tasksLoading ? (
            <LoadingState />
          ) : carryOver.length === 0 ? (
            <p className="px-5 py-6 text-sm text-sand-600 dark:text-sand-400">
              No quedó nada vencido de esta semana. ¡Bien ahí!
            </p>
          ) : (
            <ul className="space-y-2 p-3 sm:p-4">
              {carryOver.map((task) => (
                <li
                  key={task.id}
                  className={cn('flex flex-wrap items-center gap-3 rounded-2xl px-3 py-2.5', ACCENTS[AREAS[task.area].accent].soft)}
                >
                  <div className="min-w-0 flex-[1_1_180px]">
                    <p className="text-sm font-bold text-sand-900 dark:text-sand-100">{task.title}</p>
                    <p className="text-xs text-sand-500">{AREAS[task.area].label}</p>
                  </div>
                  <DueBadge date={task.due_date} />
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => void moveToNextWeek(task)}>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      Próxima semana
                    </Button>
                    <Button size="sm" onClick={() => void markDone(task)}>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Hecho
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section aria-labelledby="paso-3" className="space-y-3">
        <h2 id="paso-3" className="text-lg font-extrabold text-sand-900 dark:text-sand-100">
          3 · Tu reflexión
        </h2>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-sand-700 dark:text-sand-300">¿Cómo fue la semana?</legend>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={mood === option.value}
                    onClick={() => setMood(option.value)}
                    className={cn(
                      'min-h-[44px] rounded-full px-4 text-sm font-bold transition-colors',
                      mood === option.value
                        ? 'bg-brand-800 text-white dark:bg-brand-300 dark:text-brand-900'
                        : 'bg-sand-100 text-sand-700 hover:bg-sand-200 dark:bg-sand-800 dark:text-sand-300',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <Textarea
              label="Lo mejor de la semana"
              value={highlights}
              onChange={(event) => setHighlights(event.target.value)}
            />
            <Textarea
              label="Dónde me trabé"
              value={blockers}
              onChange={(event) => setBlockers(event.target.value)}
            />
            <Textarea
              label="En qué me enfoco la semana que viene"
              value={nextFocus}
              onChange={(event) => setNextFocus(event.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={() => void saveReview()} loading={saving}>
                {existing ? 'Actualizar revisión' : 'Guardar revisión'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {reviews.filter((review) => review.week_start !== from).length > 0 ? (
        <Card>
          <CardHeader title="Revisiones anteriores" />
          <ul className="space-y-2 px-5 pb-5">
            {reviews
              .filter((review) => review.week_start !== from)
              .slice(0, 8)
              .map((review) => (
                <li key={review.id} className="rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-400/10">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-200">
                    Semana del {formatShortDate(review.week_start)} al {formatShortDate(addDaysString(review.week_start, 6))}
                    {review.mood ? ` · ${MOODS[review.mood - 1]?.label}` : ''}
                  </p>
                  {review.next_focus ? (
                    <p className="mt-1 text-sm text-sand-800 dark:text-sand-200">
                      <strong>Foco:</strong> {review.next_focus}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
