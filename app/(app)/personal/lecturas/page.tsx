'use client';

import { useState, type FormEvent } from 'react';
import { BookOpen, BookmarkCheck, Play, Plus, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { useRows } from '@/hooks/useRows';
import { useGoals } from '@/hooks/useGoals';
import { isGoalActive } from '@/lib/calculations/goals';
import { formatShortDate, todayString } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Book, BookStatus, Goal } from '@/types/database';

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'pendiente', label: 'Quiero leerlo' },
  { value: 'leyendo', label: 'Leyendo' },
  { value: 'leido', label: 'Leído' },
];

const COLUMNS: { status: BookStatus; title: string; soft: string }[] = [
  { status: 'leyendo', title: 'Leyendo', soft: 'bg-clay-50 dark:bg-clay-500/10' },
  { status: 'pendiente', title: 'Para leer', soft: 'bg-amber-50 dark:bg-amber-400/10' },
  { status: 'leido', title: 'Leídos', soft: 'bg-ocean-50 dark:bg-ocean-500/10' },
];

/** Un objetivo de lectura activo, para sumarle avance al terminar un libro. */
function findReadingGoal(goals: Goal[]): Goal | null {
  return (
    goals.find(
      (goal) =>
        isGoalActive(goal) &&
        goal.type === 'quantitative' &&
        /libro/i.test(`${goal.name} ${goal.unit ?? ''}`),
    ) ?? null
  );
}

export default function LecturasPage() {
  const { toast } = useToast();
  const { rows: books, loading, error, create, update, remove } = useRows('books', {
    order: [{ column: 'updated_at', ascending: false }],
  });
  const { goals, updateGoal } = useGoals();
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', author: '', status: 'pendiente' as BookStatus });

  const year = String(new Date().getFullYear());
  const readThisYear = books.filter((book) => book.status === 'leido' && book.finished_on?.startsWith(year));
  const readingGoal = findReadingGoal(goals);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const today = todayString();
    await create({
      title: draft.title.trim(),
      author: draft.author.trim() || null,
      status: draft.status,
      started_on: draft.status !== 'pendiente' ? today : null,
      finished_on: draft.status === 'leido' ? today : null,
    });
    if (draft.status === 'leido') await bumpGoal();
    setDraft({ title: '', author: '', status: 'pendiente' });
    setFormOpen(false);
    toast('Libro agregado');
  }

  async function bumpGoal() {
    if (!readingGoal) return;
    const current = Number(readingGoal.current_value ?? readingGoal.initial_value ?? 0);
    await updateGoal(readingGoal.id, { current_value: current + 1 });
    toast(`Sumado a "${readingGoal.name}"`);
  }

  async function start(book: Book) {
    await update(book.id, { status: 'leyendo', started_on: book.started_on ?? todayString() });
  }

  async function finish(book: Book) {
    await update(book.id, { status: 'leido', finished_on: todayString() });
    toast(`Terminaste "${book.title}"`);
    await bumpGoal();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lecturas"
        description="Lo que estás leyendo, lo que querés leer y lo que ya terminaste."
        icon={BookOpen}
        accent="clay"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar libro
          </Button>
        }
      />

      <StatGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard label="Leídos este año" value={readThisYear.length} fill="coral" />
        <StatCard label="Leyendo" value={books.filter((book) => book.status === 'leyendo').length} fill="sun" />
        <StatCard
          label={readingGoal ? 'Objetivo de lectura' : 'Para leer'}
          value={
            readingGoal
              ? `${Number(readingGoal.current_value ?? 0)} / ${Number(readingGoal.target_value ?? 0)}`
              : books.filter((book) => book.status === 'pendiente').length
          }
          detail={readingGoal ? 'Se suma solo al terminar un libro' : undefined}
          fill="mint"
        />
      </StatGrid>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && books.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-8 w-8" aria-hidden="true" />}
            title="Todavía no cargaste libros"
            action={<Button onClick={() => setFormOpen(true)}>Agregar el primero</Button>}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-3">
          {COLUMNS.map((column) => {
            const items = books.filter((book) => book.status === column.status);
            return (
              <Card key={column.status}>
                <CardHeader title={column.title} action={<span className="tabular text-sm font-bold text-sand-500">{items.length}</span>} />
                <ul className="space-y-2 px-3 pb-4">
                  {items.length === 0 ? (
                    <li className="px-2 py-4 text-center text-sm text-sand-500">Vacío</li>
                  ) : null}
                  {items.map((book) => (
                    <li key={book.id} className={cn('group rounded-2xl px-3 py-3', column.soft)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-sand-900 dark:text-sand-100">{book.title}</p>
                          {book.author ? <p className="text-xs text-sand-600 dark:text-sand-400">{book.author}</p> : null}
                          {book.finished_on ? (
                            <p className="mt-0.5 text-xs text-sand-500">Terminado el {formatShortDate(book.finished_on)}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => void remove(book.id)}
                          aria-label={`Eliminar ${book.title}`}
                          className="rounded-full p-1.5 text-sand-400 hover:bg-white hover:text-clay-500 dark:hover:bg-sand-800"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      {book.status === 'pendiente' ? (
                        <Button size="sm" variant="secondary" className="mt-2" onClick={() => void start(book)}>
                          <Play className="h-3.5 w-3.5" aria-hidden="true" />
                          Empezar
                        </Button>
                      ) : null}
                      {book.status === 'leyendo' ? (
                        <Button size="sm" className="mt-2" onClick={() => void finish(book)}>
                          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                          Lo terminé
                        </Button>
                      ) : null}
                      {book.status === 'leido' ? (
                        <div className="mt-2 flex gap-0.5" role="group" aria-label={`Puntaje de ${book.title}`}>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              aria-label={`${value} de 5`}
                              aria-pressed={(book.rating ?? 0) >= value}
                              onClick={() => void update(book.id, { rating: value })}
                              className="rounded p-0.5"
                            >
                              <Star
                                className={cn(
                                  'h-4 w-4',
                                  (book.rating ?? 0) >= value ? 'fill-amber-400 text-amber-400' : 'text-sand-300',
                                )}
                                aria-hidden="true"
                              />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Agregar libro">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Título"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            required
          />
          <Input
            label="Autor"
            placeholder="Opcional"
            value={draft.author}
            onChange={(event) => setDraft({ ...draft, author: event.target.value })}
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={draft.status}
            onChange={(event) => setDraft({ ...draft, status: event.target.value as BookStatus })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
