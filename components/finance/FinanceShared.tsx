'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/hooks/useProfile';
import { formatMonthKey, formatMoney, shiftMonth } from '@/lib/calculations/finance';

/** Cotización del dólar guardada en el perfil. */
export function useUsdRate(): number | null {
  const { profile } = useProfile();
  const rate = Number(profile?.usd_rate ?? 0);
  return rate > 0 ? rate : null;
}

/** Tarjeta para cargar la cotización con la que se pasan los dólares a pesos. */
export function UsdRateCard({ compact = false }: { compact?: boolean }) {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const current = profile?.usd_rate ? Number(profile.usd_rate) : null;
  const [value, setValue] = useState(current ? String(current) : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(current ? String(current) : '');
  }, [current]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const rate = Number(value.replace(',', '.'));
    if (!rate || rate <= 0) return;
    setSaving(true);
    try {
      await updateProfile({ usd_rate: rate });
      toast('Cotización actualizada');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={compact ? 'p-4' : 'p-5'}>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-sand-900 dark:text-sand-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-leaf-300 text-brand-900" aria-hidden="true">
            <DollarSign className="h-4 w-4" />
          </span>
          Dólar
        </div>
        <div className="w-36">
          <Input
            aria-label="Cotización del dólar en pesos"
            inputMode="decimal"
            placeholder="Ej.: 1450"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-9"
          />
        </div>
        <Button type="submit" size="sm" variant="secondary" loading={saving}>
          Guardar
        </Button>
        <p className="w-full text-xs text-sand-500 dark:text-sand-400">
          {current
            ? `Los importes en dólares se pasan a pesos a ${formatMoney(current)} por US$ 1.`
            : 'Cargá la cotización para que los importes en dólares sumen en los totales en pesos.'}
        </p>
      </form>
    </Card>
  );
}

/** Selector de mes: ‹ Noviembre de 2026 › */
export function MonthSwitcher({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-card dark:bg-sand-900">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Mes anterior"
        className="rounded-full p-1.5 text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[9.5rem] text-center text-sm font-extrabold text-sand-900 dark:text-sand-100">
        {formatMonthKey(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Mes siguiente"
        className="rounded-full p-1.5 text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Convierte lo que se escribe en un campo de importe ("1.234,50" o "1234.5") a número. */
export function parseAmount(text: string): number {
  const clean = text.trim().replace(/\s/g, '').replace(/\$/g, '');
  if (!clean) return NaN;
  // Formato argentino: punto de miles y coma decimal.
  if (clean.includes(',')) return Number(clean.replace(/\./g, '').replace(',', '.'));
  // Varios puntos: son de miles.
  if ((clean.match(/\./g) ?? []).length > 1) return Number(clean.replace(/\./g, ''));
  // Un punto seguido de tres cifras: también es de miles (1.500).
  if (/^\d{1,3}\.\d{3}$/.test(clean)) return Number(clean.replace('.', ''));
  return Number(clean);
}
