'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { ErrorState } from '@/components/ui/States';
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '@/lib/calculations/projects';
import type { ProjectStage, ProjectTask, TaskStatus } from '@/types/database';

export interface TaskFormValues {
  title: string;
  notes: string | null;
  due_date: string | null;
  status: TaskStatus;
  stage_id: string;
}

const STATUS_OPTIONS = TASK_STATUS_ORDER.map((status) => ({
  value: status,
  label: TASK_STATUS_LABELS[status],
}));

export function TaskForm({
  task = null,
  stages,
  defaultStageId,
  onSubmit,
  onCancel,
}: {
  task?: ProjectTask | null;
  stages: ProjectStage[];
  defaultStageId: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'pending');
  const [stageId, setStageId] = useState(task?.stage_id ?? defaultStageId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('La tarea necesita un título.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        notes: notes.trim() || null,
        due_date: dueDate || null,
        status,
        stage_id: stageId,
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
        label="Tarea"
        placeholder="Pedir presupuesto al proveedor"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        autoFocus
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Vencimiento"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          hint="Opcional"
        />
        <Select
          label="Estado"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
        />
      </div>
      {stages.length > 1 ? (
        <Select
          label="Etapa"
          options={stages.map((stage, index) => ({
            value: stage.id,
            label: `${index + 1}. ${stage.name}`,
          }))}
          value={stageId}
          onChange={(event) => setStageId(event.target.value)}
        />
      ) : null}
      <Textarea
        label="Notas"
        placeholder="Opcional"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      {error ? <ErrorState message={error} /> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {task ? 'Guardar cambios' : 'Agregar tarea'}
        </Button>
      </div>
    </form>
  );
}
