'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { ErrorState } from '@/components/ui/States';
import { cn } from '@/lib/utils';
import { WEEKDAY_LABELS, WEEKDAY_SHORT, todayString } from '@/lib/calculations/dates';
import { FREQUENCY_LABELS, HABIT_TYPE_LABELS } from '@/lib/calculations/habits';
import type {
  FrequencyType,
  Goal,
  Habit,
  HabitFormValues,
  HabitInsert,
  HabitType,
} from '@/types/database';

const TYPE_OPTIONS = (Object.keys(HABIT_TYPE_LABELS) as HabitType[]).map((type) => ({
  value: type,
  label: HABIT_TYPE_LABELS[type],
}));

const FREQUENCY_OPTIONS = (Object.keys(FREQUENCY_LABELS) as FrequencyType[]).map((type) => ({
  value: type,
  label: FREQUENCY_LABELS[type],
}));

// Orden de la semana empezando en lunes (0 = domingo en la base de datos).
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function emptyValues(): HabitFormValues {
  return {
    name: '',
    description: '',
    type: 'check',
    target_value: '',
    unit: '',
    frequency_type: 'daily',
    weekdays: [],
    start_date: todayString(),
    end_date: '',
    active: true,
    use_step_records: false,
    goal_id: '',
  };
}

function toFormValues(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    description: habit.description ?? '',
    type: habit.type,
    target_value: habit.target_value === null ? '' : String(habit.target_value),
    unit: habit.unit ?? '',
    frequency_type: habit.frequency_type,
    weekdays: habit.weekdays,
    start_date: habit.start_date,
    end_date: habit.end_date ?? '',
    active: habit.active,
    use_step_records: habit.use_step_records,
    goal_id: habit.goal_id ?? '',
  };
}

export interface HabitFormProps {
  habit?: Habit | null;
  goals: Goal[];
  onSubmit: (values: Omit<HabitInsert, 'user_id'>) => Promise<void>;
  onCancel: () => void;
}

export function HabitForm({ habit = null, goals, onSubmit, onCancel }: HabitFormProps) {
  const [values, setValues] = useState<HabitFormValues>(habit ? toFormValues(habit) : emptyValues());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(habit ? toFormValues(habit) : emptyValues());
  }, [habit]);

  function update<K extends keyof HabitFormValues>(key: K, value: HabitFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleWeekday(day: number) {
    setValues((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((entry) => entry !== day)
        : [...current.weekdays, day].sort((a, b) => a - b),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError('El hábito necesita un nombre.');
      return;
    }

    if (values.frequency_type !== 'daily' && values.weekdays.length === 0) {
      setError('Elegí al menos un día de la semana.');
      return;
    }

    if (values.type === 'quantitative' && values.target_value === '') {
      setError('Un hábito con meta numérica necesita un valor objetivo.');
      return;
    }

    const payload: Omit<HabitInsert, 'user_id'> = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      type: values.type,
      target_value: values.type === 'quantitative' ? Number(values.target_value) : null,
      unit: values.type === 'quantitative' ? values.unit.trim() || null : null,
      frequency_type: values.frequency_type,
      weekdays: values.frequency_type === 'daily' ? [] : values.weekdays,
      start_date: values.start_date || todayString(),
      end_date: values.end_date || null,
      active: values.active,
      use_step_records: values.type === 'quantitative' ? values.use_step_records : false,
      goal_id: values.goal_id || null,
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

  const goalOptions = [
    { value: '', label: 'Sin objetivo asociado' },
    ...goals.map((goal) => ({ value: goal.id, label: goal.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Ir al gimnasio"
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
        onChange={(event) => update('type', event.target.value as HabitType)}
      />

      {values.type === 'quantitative' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Meta"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="10000"
              value={values.target_value}
              onChange={(event) => update('target_value', event.target.value)}
            />
            <Input
              label="Unidad"
              placeholder="pasos, litros, minutos…"
              value={values.unit}
              onChange={(event) => update('unit', event.target.value)}
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-mist-200 p-4 text-sm dark:border-mist-800">
            <input
              type="checkbox"
              checked={values.use_step_records}
              onChange={(event) => update('use_step_records', event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-mist-300 dark:border-mist-600"
            />
            <span>
              <span className="font-medium text-mist-800 dark:text-mist-200">
                Tomar el valor del registro de pasos
              </span>
              <span className="mt-0.5 block text-mist-500 dark:text-mist-400">
                El cumplimiento se calcula con los pasos cargados ese día, así no tenés que
                ingresarlos dos veces.
              </span>
            </span>
          </label>
        </>
      ) : null}

      <Select
        label="Frecuencia"
        options={FREQUENCY_OPTIONS}
        value={values.frequency_type}
        onChange={(event) => update('frequency_type', event.target.value as FrequencyType)}
        hint="Los días no previstos nunca cuentan como incumplimiento."
      />

      {values.frequency_type !== 'daily' ? (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-mist-700 dark:text-mist-300">
            Días
          </legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_ORDER.map((day) => {
              const selected = values.weekdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  aria-pressed={selected}
                  aria-label={WEEKDAY_LABELS[day]}
                  className={cn(
                    'h-10 w-10 rounded-lg border text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-900 dark:focus-visible:ring-mist-100',
                    selected
                      ? 'border-mist-900 bg-mist-900 text-mist-50 dark:border-mist-100 dark:bg-mist-100 dark:text-mist-900'
                      : 'border-mist-200 bg-white text-mist-600 dark:border-mist-700 dark:bg-mist-950 dark:text-mist-300',
                  )}
                >
                  {WEEKDAY_SHORT[day]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Fecha de inicio"
          value={values.start_date}
          onChange={(event) => update('start_date', event.target.value)}
          required
        />
        <DatePicker
          label="Fecha final"
          hint="Opcional"
          value={values.end_date}
          onChange={(event) => update('end_date', event.target.value)}
        />
      </div>

      <Select
        label="Objetivo asociado"
        options={goalOptions}
        value={values.goal_id}
        onChange={(event) => update('goal_id', event.target.value)}
      />

      <label className="flex items-center gap-3 text-sm text-mist-700 dark:text-mist-300">
        <input
          type="checkbox"
          checked={values.active}
          onChange={(event) => update('active', event.target.checked)}
          className="h-4 w-4 rounded border-mist-300 dark:border-mist-600"
        />
        Hábito activo
      </label>

      {error ? <ErrorState message={error} /> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {habit ? 'Guardar cambios' : 'Crear hábito'}
        </Button>
      </div>
    </form>
  );
}
