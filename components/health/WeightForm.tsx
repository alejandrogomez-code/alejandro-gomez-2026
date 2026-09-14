'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { todayString } from '@/lib/calculations/dates';
import { calculateBMI, formatBMI } from '@/lib/calculations/bmi';

export interface WeightFormProps {
  /** Guarda (crea o actualiza) el peso de ese día. */
  onSave: (date: string, weightKg: number) => Promise<unknown>;
  heightCm?: number | null;
  initialDate?: string;
  initialWeight?: string;
  submitLabel?: string;
  onSaved?: () => void;
}

export function WeightForm({
  onSave,
  heightCm = null,
  initialDate,
  initialWeight = '',
  submitLabel = 'Guardar',
  onSaved,
}: WeightFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState(initialDate ?? todayString());
  const [weight, setWeight] = useState(initialWeight);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(initialDate ?? todayString());
    setWeight(initialWeight);
  }, [initialDate, initialWeight]);

  const bmi = calculateBMI(Number(weight) || null, heightCm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = Number(weight);
    if (!value || value <= 0) {
      setError('Ingresá un peso válido.');
      return;
    }

    setSaving(true);
    try {
      await onSave(date, value);
      toast('Peso registrado correctamente');
      onSaved?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el peso.');
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
          label="Peso"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="1"
          suffix="kg"
          placeholder="103.8"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          required
          hint={bmi !== null ? `IMC con este peso: ${formatBMI(bmi)}` : undefined}
        />
      </div>
      {error ? <ErrorState message={error} /> : null}
      <Button type="submit" loading={saving} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
