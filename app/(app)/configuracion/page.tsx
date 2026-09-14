'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/providers/theme-provider';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { SignOutButton } from '@/components/layout/SignOutButton';
import { cn } from '@/lib/utils';
import { calculateBMI, formatBMI } from '@/lib/calculations/bmi';
import type { FontSize, ThemePreference } from '@/types/database';

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Automático', icon: Monitor },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Pequeña' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grande' },
];

export default function ConfiguracionPage() {
  const { profile, email, updateProfile } = useProfile();
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const { toast } = useToast();

  const [height, setHeight] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [stepsGoal, setStepsGoal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setHeight(profile.height_cm === null ? '' : String(profile.height_cm));
    setInitialWeight(profile.initial_weight_kg === null ? '' : String(profile.initial_weight_kg));
    setStepsGoal(String(profile.daily_steps_goal));
  }, [profile]);

  const previewBMI = calculateBMI(Number(initialWeight) || null, Number(height) || null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await updateProfile({
        height_cm: height === '' ? null : Number(height),
        initial_weight_kg: initialWeight === '' ? null : Number(initialWeight),
        daily_steps_goal: Number(stepsGoal) || 10000,
      });
      toast('Perfil actualizado');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{email}</p>
      </header>

      <Card>
        <CardHeader title="Perfil" description="Se usa para calcular el IMC y los porcentajes." />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Altura"
                type="number"
                inputMode="decimal"
                step="0.1"
                suffix="cm"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
              <Input
                label="Peso inicial"
                type="number"
                inputMode="decimal"
                step="0.1"
                suffix="kg"
                value={initialWeight}
                onChange={(event) => setInitialWeight(event.target.value)}
              />
              <Input
                label="Objetivo diario de pasos"
                type="number"
                inputMode="numeric"
                step="100"
                value={stepsGoal}
                onChange={(event) => setStepsGoal(event.target.value)}
              />
            </div>
            {previewBMI !== null ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                IMC con el peso inicial:{' '}
                <span className="tabular font-medium">{formatBMI(previewBMI)}</span>
              </p>
            ) : null}
            {error ? <ErrorState message={error} /> : null}
            <Button type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Apariencia" />
        <CardContent className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Tema
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((option) => {
                const Icon = option.icon;
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    aria-pressed={active}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100',
                      active
                        ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Tamaño de fuente
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZES.map((option) => {
                const active = fontSize === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFontSize(option.value)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100',
                      active
                        ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Sesión" />
        <CardContent>
          <SignOutButton full={false} />
        </CardContent>
      </Card>
    </div>
  );
}
