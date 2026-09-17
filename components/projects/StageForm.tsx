'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/States';

export function StageForm({
  initialName = '',
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('La etapa necesita un nombre.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit(name.trim());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre de la etapa"
        placeholder="Diseño, Compras, Lanzamiento…"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        required
      />
      {error ? <ErrorState message={error} /> : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
