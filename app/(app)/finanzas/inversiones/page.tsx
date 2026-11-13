'use client';

import { useState, type FormEvent } from 'react';
import { LineChart, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { UsdRateCard, parseAmount, useUsdRate } from '@/components/finance/FinanceShared';
import { useRows } from '@/hooks/useRows';
import { FINANCE_META } from '@/lib/areas';
import {
  CURRENCY_OPTIONS,
  INVESTMENT_KIND_OPTIONS,
  formatMoney,
  investmentTotals,
  labelOf,
} from '@/lib/calculations/finance';
import { formatShortDate, todayString } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Currency, FinanceInvestment, InvestmentKind } from '@/types/database';

interface Draft {
  name: string;
  kind: InvestmentKind;
  currency: Currency;
  amount: string;
  current_value: string;
  rate_annual: string;
  start_date: string;
  maturity_date: string;
  notes: string;
}

const EMPTY: Draft = {
  name: '',
  kind: 'plazo_fijo',
  currency: 'ARS',
  amount: '',
  current_value: '',
  rate_annual: '',
  start_date: todayString(),
  maturity_date: '',
  notes: '',
};

function optional(text: string): number | null {
  if (!text.trim()) return null;
  const value = parseAmount(text);
  return Number.isFinite(value) ? value : null;
}

export default function InversionesPage() {
  const { toast } = useToast();
  const usdRate = useUsdRate();
  const { rows: investments, loading, error, create, update, remove } = useRows('finance_investments', {
    order: [{ column: 'start_date', ascending: false }],
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceInvestment | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totals = investmentTotals(investments, usdRate);
  const active = investments.filter((item) => item.active);
  const finished = investments.filter((item) => !item.active);
  const hasUsd = active.some((item) => item.currency === 'USD');

  function openNew() {
    setEditing(null);
    setDraft({ ...EMPTY, start_date: todayString() });
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(item: FinanceInvestment) {
    const text = (value: number | null) => (value === null ? '' : String(value).replace('.', ','));
    setEditing(item);
    setDraft({
      name: item.name,
      kind: item.kind,
      currency: item.currency,
      amount: text(item.amount),
      current_value: text(item.current_value),
      rate_annual: text(item.rate_annual),
      start_date: item.start_date,
      maturity_date: item.maturity_date ?? '',
      notes: item.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseAmount(draft.amount);
    if (!draft.name.trim()) return;
    if (!Number.isFinite(amount) || amount < 0) {
      setFormError('Ingresá el monto invertido.');
      return;
    }
    const values = {
      name: draft.name.trim(),
      kind: draft.kind,
      currency: draft.currency,
      amount,
      current_value: optional(draft.current_value),
      rate_annual: optional(draft.rate_annual),
      start_date: draft.start_date,
      maturity_date: draft.maturity_date || null,
      notes: draft.notes.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) await update(editing.id, values);
      else await create(values);
      toast(editing ? 'Inversión actualizada' : 'Inversión agregada');
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  function renderItem(item: FinanceInvestment) {
    const current = Number(item.current_value ?? item.amount);
    const gain = current - Number(item.amount);
    const pct = Number(item.amount) > 0 ? (gain / Number(item.amount)) * 100 : 0;
    return (
      <li key={item.id} className={cn('rounded-2xl px-4 py-3', item.active ? 'bg-leaf-50 dark:bg-leaf-500/10' : 'bg-sand-50 dark:bg-sand-800/50')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-sand-900 dark:text-sand-100">{item.name}</p>
            <p className="mt-0.5 text-xs text-sand-500">
              {labelOf(INVESTMENT_KIND_OPTIONS, item.kind)} · desde {formatShortDate(item.start_date)}
              {item.maturity_date ? ` · vence ${formatShortDate(item.maturity_date)}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="tabular text-base font-extrabold text-sand-900 dark:text-sand-100">
              {formatMoney(current, item.currency, item.currency === 'USD' ? 2 : 0)}
            </p>
            {item.current_value !== null ? (
              <p className={cn('tabular text-xs font-bold', gain >= 0 ? 'text-leaf-600 dark:text-leaf-200' : 'text-clay-500')}>
                {gain >= 0 ? '+' : ''}
                {pct.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">Invertido {formatMoney(Number(item.amount), item.currency)}</Badge>
          {item.rate_annual !== null ? <Badge tone="leaf">TNA {Number(item.rate_annual).toLocaleString('es-AR')}%</Badge> : null}
          <div className="ml-auto flex">
            <button
              type="button"
              onClick={() => void update(item.id, { active: !item.active })}
              className="rounded-full px-2.5 py-1 text-xs font-bold text-sand-500 hover:bg-white dark:hover:bg-sand-800"
            >
              {item.active ? 'Finalizar' : 'Reactivar'}
            </button>
            <button
              type="button"
              onClick={() => openEdit(item)}
              aria-label={`Editar ${item.name}`}
              className="rounded-full p-1.5 text-sand-400 hover:bg-white hover:text-sand-700 dark:hover:bg-sand-800"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => void remove(item.id)}
              aria-label={`Eliminar ${item.name}`}
              className="rounded-full p-1.5 text-sand-400 hover:bg-white hover:text-clay-500 dark:hover:bg-sand-800"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inversiones"
        description="Dónde tenés tu plata invertida y cómo rinde."
        icon={LineChart}
        accent={FINANCE_META.accent}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar inversión
          </Button>
        }
      />

      <StatGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard label="Invertido" value={formatMoney(totals.invested)} detail={`${totals.count} activas`} fill="mint" />
        <StatCard label="Valor actual" value={formatMoney(totals.current)} fill="lime" />
        <StatCard
          label="Resultado"
          value={formatMoney(totals.gain)}
          detail={totals.invested > 0 ? `${((totals.gain / totals.invested) * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 })}% sobre lo invertido` : undefined}
          fill={totals.gain >= 0 ? 'sun' : 'coral'}
        />
      </StatGrid>

      {hasUsd && !usdRate ? <UsdRateCard compact /> : null}
      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && investments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<LineChart className="h-8 w-8" aria-hidden="true" />}
            title="Todavía no cargaste inversiones"
            description="Plazos fijos, fondos, dólares, acciones… Cargá cuánto pusiste y actualizá el valor actual cuando quieras ver el rendimiento."
            action={<Button onClick={openNew}>Agregar la primera</Button>}
          />
        </Card>
      ) : null}

      {active.length > 0 ? (
        <Card>
          <CardHeader title="Activas" />
          <ul className="space-y-2 px-3 pb-4">{active.map(renderItem)}</ul>
        </Card>
      ) : null}
      {finished.length > 0 ? (
        <Card>
          <CardHeader title="Finalizadas" />
          <ul className="space-y-2 px-3 pb-4">{finished.map(renderItem)}</ul>
        </Card>
      ) : null}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar inversión' : 'Nueva inversión'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej.: Plazo fijo Banco Nación"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              options={INVESTMENT_KIND_OPTIONS}
              value={draft.kind}
              onChange={(event) => setDraft({ ...draft, kind: event.target.value as InvestmentKind })}
            />
            <Select
              label="Moneda"
              options={CURRENCY_OPTIONS}
              value={draft.currency}
              onChange={(event) => setDraft({ ...draft, currency: event.target.value as Currency })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monto invertido"
              inputMode="decimal"
              value={draft.amount}
              onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
              required
            />
            <Input
              label="Valor actual"
              inputMode="decimal"
              placeholder="Opcional"
              value={draft.current_value}
              onChange={(event) => setDraft({ ...draft, current_value: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="TNA"
              inputMode="decimal"
              suffix="%"
              placeholder="Opcional"
              value={draft.rate_annual}
              onChange={(event) => setDraft({ ...draft, rate_annual: event.target.value })}
            />
            <Input
              label="Desde"
              type="date"
              value={draft.start_date}
              onChange={(event) => setDraft({ ...draft, start_date: event.target.value })}
            />
            <Input
              label="Vence"
              type="date"
              value={draft.maturity_date}
              onChange={(event) => setDraft({ ...draft, maturity_date: event.target.value })}
            />
          </div>
          <Textarea
            label="Notas"
            placeholder="Opcional"
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
          {formError ? <p className="text-sm text-clay-600">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Guardar' : 'Agregar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
