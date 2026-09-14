'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { ErrorState } from '@/components/ui/States';
import { GOAL_STATUS_LABELS, GOAL_TYPE_LABELS } from '@/lib/calculations/goals';
import { todayString } from '@/lib/calculations/dates';
import type { Goal, GoalFormValues, GoalInsert, GoalStatus, GoalType } from '@/types/database';

const TYPE_OPTIONS = (Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((type) => ({
  value: type,
  label: GOAL_TYPE_LABELS[type],
}));

const STATUS_OPTIONS = (Object.keys(GOAL_STATUS_LABELS) as GoalStatus[]).map((status) => ({
  value: status,
  label: GOAL_STATUS_LABELS[status],
}));

function emptyValues(): GoalFormValues {
  return {
    name: '',
    description: '',
    type: 'quantitative',
    start_date: todayString(),
    target_date: '',
    initial_value: '',
    target_value: '',
    current_value: '',
    unit: '',
    status: 'in_progress',
  };
}

function toFormValues(goal: Goal): GoalFormValues {
  return {
    name: goal.name,
    description: goal.description ?? '',
    type: goal.type,
    start_date: goal.start_date,
    target_date: goal.target_date ?? '',
    initial_value: goal.initial_value === null ? '' : String(goal.initial_value),
    target_value: goal.target_value === null ? '' : String(goal.target_value),
    current_value: goal.current_value === null ? '' : String(goal.current_value),
    unit: goal.unit ?? '',
    status: goal.status,
  };
}

export interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: (values: Omit<GoalInsert, 'user_id'>) => Promise<void>;
  onCancel: () => void;
}

export function GoalForm({ goal = null, onSubmit, onCancel }: GoalFormProps) {
  const [values, setValues] = useState<GoalFormValues>(goal ? toFormValues(goal) : emptyValues());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(goal ? toFormValues(goal) : emptyValues());
  }, [goal]);

  function update<K extends keyof GoalFormValues>(key: K, value: GoalFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError('El objetivo necesita un nombre.');
      return;
    }

    if (values.type === 'quantitative') {
      if (values.initial_value === '' || values.target_value === '') {
        setError('Un objetivo cuantitativo necesita valor inicial y valor objetivo.');
        return;
      }
    }

    if (values.type === 'date' && !values.target_date) {
      setError('Un objetivo por fecha necesita una fecha objetivo.');
      return;
    }

    const payload: Omit<GoalInsert, 'user_id'> = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      type: values.type,
      start_date: values.start_date || todayString(),
      target_date: values.target_date || null,
      status: values.status,
      initial_value: values.type === 'quantitative' ? Number(values.initial_value) : null,
      target_value: values.type === 'quantitative' ? Number(values.target_value) : null,
      current_value:
        values.type === 'quantitative'
          ? values.current_value === ''
            ? Number(values.initial_value)
            : Number(values.current_value)
          : null,
      unit: values.type === 'quantitative' ? values.unit.trim() || null : null,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
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
        placeholder="Leer 12 libros"
        value={values.name}
        onChange={(event) => update('name', event.target.value)}
        required
      />
      <Textarea
        label="Descripción"
        placeholder="Opcional"
        value={values.description}
        onChange={(event) => update('description', event.target.value)}
      />
      <Select
        label="Tipo"
        options={TYPE_OPTIONS}
        value={values.type}
        onChange={(event) => update('type', event.target.value as GoalType)}
        hint={
          values.type === 'quantitative'
            ? 'Se mide con números y muestra barra de progreso.'
            : values.type === 'completion'
              ? 'Se controla cambiando el estado.'
              : 'Solo cuenta los días hasta la fecha.'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Fecha de inicio"
          value={values.start_date}
          onChange={(event) => update('start_date', event.target.value)}
          required
        />
        <DatePicker
          label="Fecha objetivo"
          value={values.target_date}
          onChange={(event) => update('target_date', event.target.value)}
          required={values.type === 'date'}
        />
      </div>

      {values.type === 'quantitative' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Valor inicial"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={values.initial_value}
              onChange={(event) => update('initial_value', event.target.value)}
            />
            <Input
              label="Valor objetivo"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={values.target_value}
              onChange={(event) => update('target_value', event.target.value)}
            />
            <Input
              label="Valor actual"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={values.current_value}
              onChange={(event) => update('current_value', event.target.value)}
            />
          </div>
          <Input
            label="Unidad"
            placeholder="libros, kg, km…"
            value={values.unit}
            onChange={(event) => update('unit', event.target.value)}
          />
        </>
      ) : null}

      <Select
        label="Estado"
        options={STATUS_OPTIONS}
        value={values.status}
        onChange={(event) => update('status', event.target.value as GoalStatus)}
      />

      {error ? <ErrorState message={error} /> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {goal ? 'Guardar cambios' : 'Crear objetivo'}
        </Button>
      </div>
    </form>
  );
}
