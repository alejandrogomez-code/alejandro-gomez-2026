'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  BookOpen,
  Briefcase,
  CalendarClock,
  Footprints,
  NotebookPen,
  Plus,
  Scale,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { WeightForm } from '@/components/health/WeightForm';
import { StepsForm } from '@/components/health/StepsForm';
import { GoalForm } from '@/components/goals/GoalForm';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import { useProfile } from '@/hooks/useProfile';
import { notifyDataChanged } from '@/hooks/useRows';
import { ACCENTS, type Accent } from '@/lib/accents';
import { AREA_OPTIONS, WORK_AREA_OPTIONS } from '@/lib/areas';
import { todayString } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Area, GoalInsert, WorkArea } from '@/types/database';

type Kind = 'trabajo' | 'personal' | 'vencimiento' | 'nota' | 'libro' | 'peso' | 'pasos' | 'objetivo';

const OPTIONS: { kind: Kind; label: string; icon: LucideIcon; accent: Accent }[] = [
  { kind: 'trabajo', label: 'Tarea de trabajo', icon: Briefcase, accent: 'plum' },
  { kind: 'personal', label: 'Pendiente personal', icon: Sparkles, accent: 'clay' },
  { kind: 'vencimiento', label: 'Vencimiento o fecha', icon: CalendarClock, accent: 'plum' },
  { kind: 'nota', label: 'Nota', icon: NotebookPen, accent: 'clay' },
  { kind: 'libro', label: 'Libro', icon: BookOpen, accent: 'clay' },
  { kind: 'peso', label: 'Peso', icon: Scale, accent: 'ocean' },
  { kind: 'pasos', label: 'Pasos', icon: Footprints, accent: 'ocean' },
  { kind: 'objetivo', label: 'Objetivo', icon: Target, accent: 'amber' },
];

const TITLES: Record<Kind, string> = {
  trabajo: 'Nueva tarea de trabajo',
  personal: 'Nuevo pendiente personal',
  vencimiento: 'Nuevo vencimiento o fecha',
  nota: 'Nueva nota',
  libro: 'Agregar libro',
  peso: 'Registrar peso',
  pasos: 'Registrar pasos',
  objetivo: 'Nuevo objetivo',
};

/** Botón "+" fijo para cargar cualquier cosa desde cualquier pantalla. */
export function QuickAdd() {
  const { toast } = useToast();
  const userId = useUserId();
  const { profile } = useProfile();
  const supabase = useMemo(() => createClient() as any, []);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind | null>(null);

  function close() {
    setOpen(false);
    setKind(null);
  }

  async function insert(table: string, values: Record<string, unknown>, message: string) {
    const { error } = await supabase.from(table).insert({ ...values, user_id: userId });
    if (error) throw new Error(error.message);
    notifyDataChanged(table);
    toast(message);
    close();
  }

  async function upsertDaily(table: 'weight_records' | 'step_records', values: Record<string, unknown>) {
    const { error } = await supabase
      .from(table)
      .upsert({ ...values, user_id: userId }, { onConflict: 'user_id,date' });
    if (error) throw new Error(error.message);
    notifyDataChanged(table);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agregar algo rápido"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-clay-300 text-brand-900 shadow-float transition hover:scale-105 hover:bg-clay-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 lg:bottom-8 lg:right-8 lg:h-16 lg:w-16"
      >
        <Plus className="h-7 w-7" strokeWidth={2.6} aria-hidden="true" />
      </button>

      <Modal open={open} onClose={close} title={kind ? TITLES[kind] : '¿Qué querés agregar?'}>
        {!kind ? (
          <ul className="grid grid-cols-2 gap-2">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <li key={option.kind}>
                  <button
                    type="button"
                    onClick={() => setKind(option.kind)}
                    className={cn(
                      'flex min-h-[64px] w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold text-sand-900 transition hover:brightness-95 dark:text-sand-100',
                      ACCENTS[option.accent].soft,
                    )}
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ACCENTS[option.accent].chip)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {kind === 'trabajo' || kind === 'personal' ? (
          <TaskQuickForm
            area={kind}
            onCancel={() => setKind(null)}
            onSubmit={(values) => insert('tasks', { ...values, area: kind }, 'Pendiente agregado')}
          />
        ) : null}

        {kind === 'vencimiento' ? (
          <DeadlineQuickForm
            onCancel={() => setKind(null)}
            onSubmit={(values) => insert('deadlines', values, 'Fecha agregada')}
          />
        ) : null}

        {kind === 'nota' ? (
          <NoteQuickForm onCancel={() => setKind(null)} onSubmit={(values) => insert('notes', values, 'Nota guardada')} />
        ) : null}

        {kind === 'libro' ? (
          <BookQuickForm onCancel={() => setKind(null)} onSubmit={(values) => insert('books', values, 'Libro agregado')} />
        ) : null}

        {kind === 'peso' ? (
          <WeightForm
            heightCm={profile?.height_cm ?? null}
            onSave={(date, weightKg) => upsertDaily('weight_records', { date, weight_kg: weightKg })}
            onSaved={() => {
              toast('Peso registrado');
              close();
            }}
          />
        ) : null}

        {kind === 'pasos' ? (
          <StepsForm
            dailyGoal={profile?.daily_steps_goal ?? 10000}
            onSave={(date, steps) => upsertDaily('step_records', { date, steps })}
            onSaved={() => {
              toast('Pasos registrados');
              close();
            }}
          />
        ) : null}

        {kind === 'objetivo' ? (
          <GoalForm
            onCancel={() => setKind(null)}
            onSubmit={async (values: Omit<GoalInsert, 'user_id'>) => {
              await insert('goals', values, 'Objetivo creado');
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}

function FormActions({ onCancel, saving }: { onCancel: () => void; saving: boolean }) {
  return (
    <div className="flex justify-between gap-2 pt-1">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Volver
      </Button>
      <Button type="submit" loading={saving}>
        Guardar
      </Button>
    </div>
  );
}

function useSubmit(onSubmit: () => Promise<void>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handle(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }
  return { saving, error, handle };
}

function TaskQuickForm({
  area,
  onSubmit,
  onCancel,
}: {
  area: WorkArea;
  onSubmit: (values: { title: string; due_date: string | null; notes: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const { saving, error, handle } = useSubmit(() =>
    onSubmit({ title: title.trim(), due_date: dueDate || null, notes: notes.trim() || null }),
  );
  return (
    <form onSubmit={handle} className="space-y-4">
      <Input
        label="Qué hay que hacer"
        placeholder={area === 'trabajo' ? 'Ej.: Revisar conciliación' : 'Ej.: Pagar el seguro'}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        autoFocus
      />
      <Input label="Para cuándo" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      <Textarea label="Notas" placeholder="Opcional" value={notes} onChange={(event) => setNotes(event.target.value)} />
      {error ? <p className="text-sm text-clay-600">{error}</p> : null}
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}

function DeadlineQuickForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayString());
  const [area, setArea] = useState<WorkArea>('trabajo');
  const [recurrence, setRecurrence] = useState('none');
  const { saving, error, handle } = useSubmit(() =>
    onSubmit({
      title: title.trim(),
      due_date: date,
      area,
      kind: area === 'personal' && recurrence === 'yearly' ? 'fecha' : 'vencimiento',
      recurrence,
    }),
  );
  return (
    <form onSubmit={handle} className="space-y-4">
      <Input label="Título" value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        <Select
          label="Área"
          options={WORK_AREA_OPTIONS}
          value={area}
          onChange={(event) => setArea(event.target.value as WorkArea)}
        />
      </div>
      <Select
        label="Se repite"
        options={[
          { value: 'none', label: 'Una sola vez' },
          { value: 'monthly', label: 'Todos los meses' },
          { value: 'yearly', label: 'Todos los años' },
        ]}
        value={recurrence}
        onChange={(event) => setRecurrence(event.target.value)}
        hint="Te aviso por mail 3 días antes. Podés cambiarlo después."
      />
      {error ? <p className="text-sm text-clay-600">{error}</p> : null}
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}

function NoteQuickForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [body, setBody] = useState('');
  const [area, setArea] = useState<Area>('personal');
  const { saving, error, handle } = useSubmit(() => onSubmit({ body: body.trim(), area }));
  return (
    <form onSubmit={handle} className="space-y-4">
      <Textarea label="Nota" rows={4} value={body} onChange={(event) => setBody(event.target.value)} required autoFocus />
      <Select label="Área" options={AREA_OPTIONS} value={area} onChange={(event) => setArea(event.target.value as Area)} />
      {error ? <p className="text-sm text-clay-600">{error}</p> : null}
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}

function BookQuickForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('pendiente');
  const { saving, error, handle } = useSubmit(() =>
    onSubmit({
      title: title.trim(),
      author: author.trim() || null,
      status,
      started_on: status === 'leyendo' ? todayString() : null,
    }),
  );
  return (
    <form onSubmit={handle} className="space-y-4">
      <Input label="Título" value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus />
      <Input label="Autor" placeholder="Opcional" value={author} onChange={(event) => setAuthor(event.target.value)} />
      <Select
        label="Estado"
        options={[
          { value: 'pendiente', label: 'Quiero leerlo' },
          { value: 'leyendo', label: 'Lo estoy leyendo' },
        ]}
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      />
      {error ? <p className="text-sm text-clay-600">{error}</p> : null}
      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
