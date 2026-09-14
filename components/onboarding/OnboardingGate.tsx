'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProfileContext } from '@/components/providers/profile-provider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Modal } from '@/components/ui/Modal';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { calculateBMI, formatBMI } from '@/lib/calculations/bmi';
import { todayString } from '@/lib/calculations/dates';

/**
 * Se muestra solo si el perfil todavía no tiene altura o peso inicial.
 * Al completarlo crea el primer registro de peso con la fecha elegida.
 */
export function OnboardingGate() {
  const { userId, profile, updateProfile, refresh } = useProfileContext();
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [stepsGoal, setStepsGoal] = useState('10000');
  const [date, setDate] = useState(todayString());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const needsOnboarding =
    profile !== null && (profile.height_cm === null || profile.initial_weight_kg === null);

  const previewBMI = calculateBMI(Number(weight) || null, Number(height) || null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const heightValue = Number(height);
    const weightValue = Number(weight);
    const goalValue = Number(stepsGoal);

    if (!heightValue || heightValue <= 0) {
      setError('Ingresá una altura válida en centímetros.');
      return;
    }
    if (!weightValue || weightValue <= 0) {
      setError('Ingresá un peso válido en kilos.');
      return;
    }
    if (!goalValue || goalValue <= 0) {
      setError('Ingresá un objetivo diario de pasos mayor a cero.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        height_cm: heightValue,
        initial_weight_kg: weightValue,
        daily_steps_goal: goalValue,
      });

      const { error: weightError } = await supabase
        .from('weight_records')
        .upsert(
          { user_id: userId, date, weight_kg: weightValue },
          { onConflict: 'user_id,date' },
        );

      if (weightError) throw new Error(weightError.message);

      await refresh();
      toast('Perfil configurado');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (!needsOnboarding) return null;

  return (
    <Modal
      open
      onClose={() => undefined}
      title="Configurá tu perfil"
      description="Solo necesito estos tres datos para empezar a calcular todo lo demás."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Altura"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="1"
          placeholder="178"
          suffix="cm"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
          required
        />
        <Input
          label="Peso inicial"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="1"
          placeholder="104.5"
          suffix="kg"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          required
        />
        <DatePicker
          label="Fecha del peso inicial"
          value={date}
          max={todayString()}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <Input
          label="Objetivo diario de pasos"
          type="number"
          inputMode="numeric"
          step="100"
          min="1"
          value={stepsGoal}
          onChange={(event) => setStepsGoal(event.target.value)}
          required
        />

        {previewBMI !== null ? (
          <p className="text-sm text-mist-500 dark:text-mist-400">
            IMC inicial: <span className="tabular font-medium">{formatBMI(previewBMI)}</span>
          </p>
        ) : null}

        {error ? <ErrorState message={error} /> : null}

        <Button type="submit" className="w-full" loading={saving}>
          Guardar y empezar
        </Button>
      </form>
    </Modal>
  );
}
