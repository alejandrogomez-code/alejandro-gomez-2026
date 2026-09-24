'use client';

import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { ErrorState } from '@/components/ui/States';
import { cn } from '@/lib/utils';
import { ACCENTS, PROJECT_COLORS, PROJECT_COLOR_LABELS } from '@/lib/accents';
import { PROJECT_STATUS_LABELS } from '@/lib/calculations/projects';
import { todayString } from '@/lib/calculations/dates';
import type { Project, ProjectColor, ProjectInsert, ProjectStatus } from '@/types/database';

const STATUS_OPTIONS = (Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((status) => ({
  value: status,
  label: PROJECT_STATUS_LABELS[status],
}));

export type ProjectFormValues = Omit<ProjectInsert, 'user_id'>;

export function ProjectForm({
  project = null,
  onSubmit,
  onCancel,
}: {
  project?: Project | null;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [color, setColor] = useState<ProjectColor>(project?.color ?? 'brand');
  const [startDate, setStartDate] = useState(project?.start_date ?? todayString());
  const [targetDate, setTargetDate] = useState(project?.target_date ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'active');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('El proyecto necesita un nombre.');
      return;
    }
    if (targetDate && targetDate < startDate) {
      setError('La fecha objetivo no puede ser anterior a la de inicio.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        color,
        start_date: startDate || todayString(),
        target_date: targetDate || null,
        status,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Reforma de la cocina"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        required
      />
      <Textarea
        label="Descripción"
        placeholder="Opcional"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-sand-700 dark:text-sand-300">
          Color
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((option) => {
            const selected = option === color;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-pressed={selected}
                aria-label={PROJECT_COLOR_LABELS[option]}
                title={PROJECT_COLOR_LABELS[option]}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-transform',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-sand-900',
                  ACCENTS[option].solid,
                  selected ? 'scale-110 ring-2 ring-sand-900/80 ring-offset-2 dark:ring-white/80 dark:ring-offset-sand-900' : 'hover:scale-105',
                )}
              >
                {selected ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Inicio"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
        <DatePicker
          label="Fecha objetivo"
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
          hint="Opcional"
        />
      </div>

      {project ? (
        <Select
          label="Estado"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => setStatus(event.target.value as ProjectStatus)}
        />
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {project ? 'Guardar cambios' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  );
}
