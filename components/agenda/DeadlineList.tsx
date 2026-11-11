'use client';

import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { DueBadge } from './DueBadge';
import { useRows } from '@/hooks/useRows';
import { RECURRENCE_LABELS, nextOccurrence } from '@/lib/calculations/agenda';
import { formatDayMonth, formatShortDate, todayString } from '@/lib/calculations/dates';
import { ACCENTS, type Accent } from '@/lib/accents';
import { cn } from '@/lib/utils';
import type { Deadline, DeadlineKind, Recurrence, WorkArea } from '@/types/database';

const RECURRENCE_OPTIONS = (Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((value) => ({
  value,
  label: RECURRENCE_LABELS[value],
}));

interface FormValues {
  title: string;
  due_date: string;
  recurrence: Recurrence;
  remind_days: string;
  notes: string;
}

export interface DeadlineListProps {
  area: WorkArea;
  kind: DeadlineKind;
  title: string;
  description?: string;
  addLabel?: string;
  defaultRecurrence?: Recurrence;
  accent?: Accent;
  placeholder?: string;
}

/** Vencimientos o fechas importantes, con recurrencia y aviso anticipado. */
export function DeadlineList({
  area,
  kind,
  title,
  description,
  addLabel = 'Agregar',
  defaultRecurrence = 'none',
  accent = area === 'trabajo' ? 'plum' : 'clay',
  placeholder = 'Ej.: Presentación de IVA',
}: DeadlineListProps) {
  const { toast } = useToast();
  const { rows, loading, error, create, update, remove } = useRows('deadlines', {
    eq: { area, kind },
    order: [{ column: 'due_date', ascending: true }],
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deadline | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Deadline | null>(null);
  const [values, setValues] = useState<FormValues>(empty());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const theme = ACCENTS[accent];

  function empty(): FormValues {
    return { title: '', due_date: todayString(), recurrence: defaultRecurrence, remind_days: '3', notes: '' };
  }

  function openCreate() {
    setEditing(null);
    setValues(empty());
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(deadline: Deadline) {
    setEditing(deadline);
    setValues({
      title: deadline.title,
      due_date: deadline.due_date,
      recurrence: deadline.recurrence,
      remind_days: String(deadline.remind_days),
      notes: deadline.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const remind = Number(values.remind_days);
    if (!values.title.trim()) return setFormError('Poné un título.');
    if (!values.due_date) return setFormError('Elegí la fecha.');
    if (!Number.isInteger(remind) || remind < 0 || remind > 60) {
      return setFormError('El aviso tiene que ser entre 0 y 60 días antes.');
    }
    const payload = {
      title: values.title.trim(),
      due_date: values.due_date,
      recurrence: values.recurrence,
      remind_days: remind,
      notes: values.notes.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, { ...payload, done: false });
        toast('Actualizado');
      } else {
        await create({ ...payload, area, kind });
        toast('Agregado');
      }
      setFormOpen(false);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function markDone(deadline: Deadline) {
    const next = nextOccurrence(deadline);
    if (next) {
      await update(deadline.id, { due_date: next, last_done: todayString() });
      toast(`Listo. Próximo: ${formatShortDate(next)}`);
    } else {
      await update(deadline.id, { done: true, last_done: todayString() });
      toast('Marcado como cumplido');
    }
  }

  const pending = rows.filter((row) => !row.done);
  const done = rows.filter((row) => row.done);

  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {addLabel}
          </Button>
        }
      />
      {error ? <ErrorState message={error} className="mx-5 my-3" /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && pending.length === 0 ? (
        <EmptyState
          title="No hay nada cargado"
          description="Cargá fechas con anticipación y te aviso por mail antes de que lleguen."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2 px-3 pb-4 pt-2 sm:px-4">
          {pending.map((deadline) => (
            <li key={deadline.id} className={cn('flex flex-wrap items-center gap-3 rounded-2xl px-3 py-3', theme.soft)}>
              <div className={cn('flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl leading-none', theme.chip)}>
                <span className="text-lg font-extrabold">{deadline.due_date.slice(8, 10)}</span>
                <span className="text-[10px] font-bold uppercase">
                  {formatShortDate(deadline.due_date).split(' ')[1]?.replace('.', '')}
                </span>
              </div>
              <div className="min-w-0 flex-[1_1_160px]">
                <p className="text-sm font-bold text-sand-900 dark:text-sand-100">{deadline.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-sand-500 dark:text-sand-400">
                  {deadline.recurrence !== 'none' ? (
                    <span className="inline-flex items-center gap-1">
                      <Repeat className="h-3 w-3" aria-hidden="true" />
                      {RECURRENCE_LABELS[deadline.recurrence]}
                    </span>
                  ) : null}
                  <span>
                    {kind === 'fecha' ? formatDayMonth(deadline.due_date) : `Aviso ${deadline.remind_days} días antes`}
                  </span>
                  {deadline.notes ? <span className="truncate">· {deadline.notes}</span> : null}
                </p>
              </div>
              <DueBadge date={deadline.due_date} soonDays={deadline.remind_days} />
              <div className="flex items-center gap-1">
                <Button size="sm" variant="secondary" onClick={() => void markDone(deadline)}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {kind === 'fecha' ? 'Listo' : 'Cumplido'}
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Editar ${deadline.title}`} onClick={() => openEdit(deadline)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Eliminar ${deadline.title}`} onClick={() => setPendingDelete(deadline)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 ? (
        <p className="border-t border-sand-100 px-5 py-3 text-xs text-sand-500 dark:border-sand-800">
          {done.length} cumplido{done.length === 1 ? '' : 's'}:{' '}
          {done
            .slice(0, 5)
            .map((row) => row.title)
            .join(', ')}
        </p>
      ) : null}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar' : addLabel}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            placeholder={placeholder}
            value={values.title}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Fecha"
              type="date"
              value={values.due_date}
              onChange={(event) => setValues({ ...values, due_date: event.target.value })}
              required
            />
            <Select
              label="Se repite"
              options={RECURRENCE_OPTIONS}
              value={values.recurrence}
              onChange={(event) => setValues({ ...values, recurrence: event.target.value as Recurrence })}
            />
          </div>
          <Input
            label="Avisarme por mail con"
            type="number"
            min={0}
            max={60}
            suffix="días"
            value={values.remind_days}
            onChange={(event) => setValues({ ...values, remind_days: event.target.value })}
            hint="Días de anticipación. 0 = el mismo día."
          />
          <Textarea
            label="Notas"
            placeholder="Opcional"
            value={values.notes}
            onChange={(event) => setValues({ ...values, notes: event.target.value })}
          />
          {formError ? <p className="text-sm text-clay-600">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar"
        description={`Se va a eliminar "${pendingDelete?.title ?? ''}".`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
          toast('Eliminado');
        }}
      />
    </Card>
  );
}
