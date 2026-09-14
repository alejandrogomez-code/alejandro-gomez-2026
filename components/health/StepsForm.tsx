'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { formatPercent, todayString } from '@/lib/calculations/dates';
import { calculateStepCompletion } from '@/lib/calculations/steps';

export interface StepsFormProps {
  onSave: (date: string, steps: number) => Promise<unknown>;
  dailyGoal: number;
  initialDate?: string;
  initialSteps?: string;
  submitLabel?: string;
  onSaved?: () => void;
}

export function StepsForm({
  onSave,
  dailyGoal,
  initialDate,
  initialSteps = '',
  submitLabel = 'Guardar',
  onSaved,
}: StepsFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState(initialDate ?? todayString());
  const [steps, setSteps] = useState(initialSteps);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(initialDate ?? todayString());
    setSteps(initialSteps);
  }, [initialDate, initialSteps]);

  const preview = steps === '' ? null : calculateStepCompletion(Number(steps), dailyGoal);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = Number(steps);
    if (steps === '' || Number.isNaN(value) || value < 0) {
      setError('Ingresá una cantidad de pasos válida.');
      return;
    }

    setSaving(true);
    try {
      await onSave(date, Math.round(value));
      toast('Pasos registrados correctamente');
      onSaved?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudieron guardar los pasos.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="Fecha"
          value={date}
          max={todayString()}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <Input
          label="Pasos"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          placeholder="8432"
          value={steps}
          onChange={(event) => setSteps(event.target.value)}
          required
          hint={preview !== null ? `${formatPercent(preview)} del objetivo diario` : undefined}
        />
      </div>
      {error ? <ErrorState message={error} /> : null}
      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
