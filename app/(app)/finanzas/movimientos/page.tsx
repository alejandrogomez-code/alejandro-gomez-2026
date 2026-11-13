'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Copy, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
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
import { MonthSwitcher, UsdRateCard, parseAmount, useUsdRate } from '@/components/finance/FinanceShared';
import { useRows } from '@/hooks/useRows';
import { FINANCE_META } from '@/lib/areas';
import {
  CURRENCY_OPTIONS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  MOVEMENT_KIND_OPTIONS,
  formatMoney,
  formatMonthKey,
  monthKey,
  monthTotals,
  shiftMonth,
} from '@/lib/calculations/finance';
import { formatShortDate, todayString } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Currency, FinanceMovement, MovementKind } from '@/types/database';

interface Draft {
  kind: MovementKind;
  category: string;
  description: string;
  amount: string;
  currency: Currency;
  date: string;
  recurring: boolean;
  debt_id: string;
  notes: string;
}

const emptyDraft = (kind: MovementKind = 'egreso'): Draft => ({
  kind,
  category: kind === 'ingreso' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
  description: '',
  amount: '',
  currency: 'ARS',
  date: todayString(),
  recurring: false,
  debt_id: '',
  notes: '',
});

function sameDayNextMonth(date: string, targetMonth: string): string {
  const day = Number(date.slice(8, 10));
  const [year, month] = targetMonth.split('-').map(Number);
  const last = new Date(year, month, 0).getDate();
  return `${targetMonth}-${String(Math.min(day, last)).padStart(2, '0')}`;
}

export default function MovimientosPage() {
  const { toast } = useToast();
  const usdRate = useUsdRate();
  const { rows: movements, loading, error, create, update, remove } = useRows('finance_movements', {
    order: [
      { column: 'date', ascending: false },
      { column: 'created_at', ascending: false },
    ],
  });
  const { rows: debts } = useRows('finance_debts', { order: [{ column: 'name', ascending: true }] });
  const [month, setMonth] = useState(monthKey(todayString()));
  const [filter, setFilter] = useState<'todos' | MovementKind>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceMovement | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => monthTotals(movements, month, usdRate), [movements, month, usdRate]);
  const inMonth = movements.filter((movement) => monthKey(movement.date) === month);
  const visible = inMonth.filter((movement) => filter === 'todos' || movement.kind === filter);
  const previousRecurring = movements.filter(
    (movement) => movement.recurring && monthKey(movement.date) === shiftMonth(month, -1),
  );
  const pendingCopies = previousRecurring.filter(
    (movement) =>
      !inMonth.some(
        (current) =>
          current.recurring &&
          current.kind === movement.kind &&
          current.category === movement.category &&
          (current.description ?? '') === (movement.description ?? ''),
      ),
  );

  const categories = draft.kind === 'ingreso' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function openNew(kind: MovementKind) {
    setEditing(null);
    const base = emptyDraft(kind);
    // Si se mira otro mes, la fecha sugerida cae dentro de ese mes.
    if (month !== monthKey(todayString())) base.date = `${month}-01`;
    setDraft(base);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(movement: FinanceMovement) {
    setEditing(movement);
    setDraft({
      kind: movement.kind,
      category: movement.category,
      description: movement.description ?? '',
      amount: String(movement.amount).replace('.', ','),
      currency: movement.currency,
      date: movement.date,
      recurring: movement.recurring,
      debt_id: movement.debt_id ?? '',
      notes: movement.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseAmount(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Ingresá un importe mayor a cero.');
      return;
    }
    const values = {
      kind: draft.kind,
      category: draft.category,
      description: draft.description.trim() || null,
      amount,
      currency: draft.currency,
      date: draft.date,
      recurring: draft.recurring,
      debt_id: draft.kind === 'egreso' && draft.debt_id ? draft.debt_id : null,
      notes: draft.notes.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, values);
        toast('Movimiento actualizado');
      } else {
        await create(values);
        toast(draft.kind === 'ingreso' ? 'Ingreso cargado' : 'Egreso cargado');
      }
      setMonth(monthKey(draft.date));
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function copyRecurring() {
    for (const movement of pendingCopies) {
      await create({
        kind: movement.kind,
        category: movement.category,
        description: movement.description,
        amount: Number(movement.amount),
        currency: movement.currency,
        date: sameDayNextMonth(movement.date, month),
        recurring: true,
        debt_id: movement.debt_id,
        notes: movement.notes,
      });
    }
    toast(`${pendingCopies.length} ${pendingCopies.length === 1 ? 'movimiento fijo copiado' : 'movimientos fijos copiados'}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ingresos y egresos"
        description="Todo lo que entra y sale, mes a mes."
        icon={ArrowLeftRight}
        accent={FINANCE_META.accent}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openNew('ingreso')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ingreso
            </Button>
            <Button onClick={() => openNew('egreso')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Egreso
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthSwitcher value={month} onChange={setMonth} />
        {pendingCopies.length > 0 ? (
          <Button size="sm" variant="secondary" onClick={() => void copyRecurring()}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copiar {pendingCopies.length} {pendingCopies.length === 1 ? 'fijo' : 'fijos'} de {formatMonthKey(shiftMonth(month, -1)).split(' ')[0].toLowerCase()}
          </Button>
        ) : null}
      </div>

      <StatGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard label="Ingresos" value={formatMoney(totals.income)} fill="lime" />
        <StatCard label="Egresos" value={formatMoney(totals.expense)} fill="coral" />
        <StatCard
          label="Saldo del mes"
          value={formatMoney(totals.balance)}
          detail={
            totals.income > 0
              ? `Ahorrás el ${Math.round((totals.balance / totals.income) * 100)}% de lo que entra`
              : undefined
          }
          fill={totals.balance >= 0 ? 'mint' : 'sun'}
        />
      </StatGrid>

      {totals.missingRate ? <UsdRateCard compact /> : null}

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading ? (
        <Card>
          <CardHeader
            title="Movimientos"
            action={
              <div className="flex gap-1" role="group" aria-label="Filtrar movimientos">
                {(['todos', 'ingreso', 'egreso'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={filter === option}
                    onClick={() => setFilter(option)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-bold',
                      filter === option ? 'bg-leaf-300 text-brand-900' : 'text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800',
                    )}
                  >
                    {option === 'todos' ? 'Todos' : option === 'ingreso' ? 'Ingresos' : 'Egresos'}
                  </button>
                ))}
              </div>
            }
          />
          {visible.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight className="h-8 w-8" aria-hidden="true" />}
              title="No hay movimientos en este mes"
              description="Cargá tus ingresos y gastos. Marcá como fijos los que se repiten todos los meses (sueldo, alquiler, servicios, cuotas) y el mes que viene los copiás con un clic."
            />
          ) : (
            <ul className="px-2 pb-3">
              {visible.map((movement) => {
                const income = movement.kind === 'ingreso';
                const debt = movement.debt_id ? debts.find((item) => item.id === movement.debt_id) : null;
                return (
                  <li
                    key={movement.id}
                    className="flex items-center gap-3 border-t border-sand-100 px-3 py-2.5 first:border-t-0 dark:border-sand-800"
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-900',
                        income ? 'bg-leaf-300' : 'bg-clay-300',
                      )}
                      aria-hidden="true"
                    >
                      {income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-sand-900 dark:text-sand-100">
                        {movement.description || movement.category}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-sand-500">
                        <span>{formatShortDate(movement.date)}</span>
                        <span>·</span>
                        <span>{movement.category}</span>
                        {movement.recurring ? (
                          <Badge tone="leaf" className="px-2 py-0.5">
                            <Repeat className="h-3 w-3" aria-hidden="true" />
                            Fijo
                          </Badge>
                        ) : null}
                        {debt ? <Badge tone="clay" className="px-2 py-0.5">Pago: {debt.name}</Badge> : null}
                      </div>
                    </div>
                    <p
                      className={cn(
                        'tabular shrink-0 text-sm font-extrabold',
                        income ? 'text-leaf-600 dark:text-leaf-200' : 'text-sand-900 dark:text-sand-100',
                      )}
                    >
                      {income ? '+' : '−'}
                      {formatMoney(Number(movement.amount), movement.currency, movement.currency === 'USD' ? 2 : 0)}
                    </p>
                    <div className="flex shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(movement)}
                        aria-label="Editar movimiento"
                        className="rounded-full p-1.5 text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-sand-800"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(movement.id)}
                        aria-label="Eliminar movimiento"
                        className="rounded-full p-1.5 text-sand-400 hover:bg-sand-100 hover:text-clay-500 dark:hover:bg-sand-800"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar movimiento' : draft.kind === 'ingreso' ? 'Nuevo ingreso' : 'Nuevo egreso'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              options={MOVEMENT_KIND_OPTIONS}
              value={draft.kind}
              onChange={(event) => {
                const kind = event.target.value as MovementKind;
                setDraft({ ...draft, kind, category: (kind === 'ingreso' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] });
              }}
            />
            <Select
              label="Categoría"
              options={categories.map((category) => ({ value: category, label: category }))}
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            />
          </div>
          <Input
            label="Descripción"
            placeholder={draft.kind === 'ingreso' ? 'Ej.: Sueldo DEAM' : 'Ej.: Alquiler'}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            autoFocus
          />
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-3">
            <Input
              label="Importe"
              inputMode="decimal"
              placeholder="0"
              value={draft.amount}
              onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
              required
            />
            <Select
              label="Moneda"
              options={CURRENCY_OPTIONS}
              value={draft.currency}
              onChange={(event) => setDraft({ ...draft, currency: event.target.value as Currency })}
            />
          </div>
          <Input
            label="Fecha"
            type="date"
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            required
          />
          {draft.kind === 'egreso' && debts.length > 0 ? (
            <Select
              label="¿Es el pago de una deuda?"
              options={[
                { value: '', label: 'No' },
                ...debts.map((debt) => ({ value: debt.id, label: debt.name })),
              ]}
              value={draft.debt_id}
              onChange={(event) =>
                setDraft({ ...draft, debt_id: event.target.value, category: event.target.value ? 'Deudas' : draft.category })
              }
              hint="Para registrar un pago y bajar el saldo de la deuda, usá “Registrar pago” en Deudas."
            />
          ) : null}
          <label className="flex items-center gap-2 text-sm font-medium text-sand-700 dark:text-sand-300">
            <input
              type="checkbox"
              checked={draft.recurring}
              onChange={(event) => setDraft({ ...draft, recurring: event.target.checked })}
              className="h-4 w-4 rounded border-sand-300 accent-leaf-500"
            />
            Es fijo: se repite todos los meses
          </label>
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
