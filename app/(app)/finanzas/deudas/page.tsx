'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, CreditCard, HandCoins, Pencil, Plus, Snowflake, Trash2, TrendingDown } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { ChartTooltipBox } from '@/components/health/ChartTooltip';
import { UsdRateCard, parseAmount, useUsdRate } from '@/components/finance/FinanceShared';
import { useRows } from '@/hooks/useRows';
import { FINANCE_META } from '@/lib/areas';
import {
  CURRENCY_OPTIONS,
  DEBT_KIND_OPTIONS,
  debtTotals,
  formatMoney,
  labelOf,
  monthKey,
  monthTotals,
  monthsFromNow,
  simulatePayoff,
  type PayoffStrategy,
} from '@/lib/calculations/finance';
import { todayString } from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import type { Currency, DebtKind, FinanceDebt } from '@/types/database';

interface DebtDraft {
  name: string;
  creditor: string;
  kind: DebtKind;
  currency: Currency;
  original_amount: string;
  balance: string;
  rate_annual: string;
  monthly_payment: string;
  installments_left: string;
  due_day: string;
  notes: string;
}

const EMPTY_DEBT: DebtDraft = {
  name: '',
  creditor: '',
  kind: 'prestamo',
  currency: 'ARS',
  original_amount: '',
  balance: '',
  rate_annual: '',
  monthly_payment: '',
  installments_left: '',
  due_day: '',
  notes: '',
};

function optionalNumber(text: string): number | null {
  if (!text.trim()) return null;
  const value = parseAmount(text);
  return Number.isFinite(value) ? value : null;
}

export default function DeudasPage() {
  const { toast } = useToast();
  const usdRate = useUsdRate();
  const { rows: debts, loading, error, create, update, remove } = useRows('finance_debts', {
    order: [{ column: 'created_at', ascending: true }],
  });
  const { rows: movements, create: createMovement } = useRows('finance_movements', {
    order: [{ column: 'date', ascending: false }],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceDebt | null>(null);
  const [draft, setDraft] = useState<DebtDraft>(EMPTY_DEBT);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [paying, setPaying] = useState<FinanceDebt | null>(null);
  const [payment, setPayment] = useState({ amount: '', date: todayString() });

  const [strategy, setStrategy] = useState<PayoffStrategy>('avalancha');
  const [extra, setExtra] = useState('');

  const active = debts.filter((debt) => debt.status === 'activa');
  const closed = debts.filter((debt) => debt.status === 'cancelada');
  const totals = debtTotals(debts, usdRate);
  const hasUsd = active.some((debt) => debt.currency === 'USD');

  // Ingreso de referencia: el del mes pasado si este todavía no está completo.
  const thisMonth = monthKey(todayString());
  const income = useMemo(() => {
    const current = monthTotals(movements, thisMonth, usdRate).income;
    if (current > 0) return current;
    const [year, month] = thisMonth.split('-').map(Number);
    const previous = new Date(year, month - 2, 1);
    const key = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
    return monthTotals(movements, key, usdRate).income;
  }, [movements, thisMonth, usdRate]);

  const extraValue = Math.max(0, optionalNumber(extra) ?? 0);
  const budget = totals.monthly + extraValue;
  const plan = useMemo(() => simulatePayoff(debts, budget, strategy, usdRate), [debts, budget, strategy, usdRate]);
  const minimumOnly = useMemo(
    () => simulatePayoff(debts, totals.monthly, strategy, usdRate),
    [debts, totals.monthly, strategy, usdRate],
  );

  function openNew() {
    setEditing(null);
    setDraft(EMPTY_DEBT);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(debt: FinanceDebt) {
    setEditing(debt);
    const text = (value: number | null) => (value === null || value === undefined ? '' : String(value).replace('.', ','));
    setDraft({
      name: debt.name,
      creditor: debt.creditor ?? '',
      kind: debt.kind,
      currency: debt.currency,
      original_amount: text(debt.original_amount),
      balance: text(debt.balance),
      rate_annual: text(debt.rate_annual),
      monthly_payment: text(debt.monthly_payment),
      installments_left: text(debt.installments_left),
      due_day: text(debt.due_day),
      notes: debt.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const balance = parseAmount(draft.balance);
    if (!draft.name.trim()) return;
    if (!Number.isFinite(balance) || balance < 0) {
      setFormError('Ingresá el saldo que debés hoy.');
      return;
    }
    const dueDay = optionalNumber(draft.due_day);
    const values = {
      name: draft.name.trim(),
      creditor: draft.creditor.trim() || null,
      kind: draft.kind,
      currency: draft.currency,
      original_amount: optionalNumber(draft.original_amount),
      balance,
      rate_annual: optionalNumber(draft.rate_annual),
      monthly_payment: optionalNumber(draft.monthly_payment),
      installments_left: optionalNumber(draft.installments_left),
      due_day: dueDay && dueDay >= 1 && dueDay <= 31 ? Math.round(dueDay) : null,
      notes: draft.notes.trim() || null,
      status: balance > 0 ? ('activa' as const) : ('cancelada' as const),
    };
    setSaving(true);
    try {
      if (editing) await update(editing.id, values);
      else await create(values);
      toast(editing ? 'Deuda actualizada' : 'Deuda agregada');
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  function openPayment(debt: FinanceDebt) {
    setPaying(debt);
    setPayment({
      amount: debt.monthly_payment ? String(debt.monthly_payment).replace('.', ',') : '',
      date: todayString(),
    });
  }

  async function handlePayment(event: FormEvent) {
    event.preventDefault();
    if (!paying) return;
    const amount = parseAmount(payment.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const balance = Math.max(0, Number(paying.balance) - amount);
    await createMovement({
      kind: 'egreso',
      category: 'Deudas',
      description: `Pago ${paying.name}`,
      amount,
      currency: paying.currency,
      date: payment.date,
      debt_id: paying.id,
    });
    await update(paying.id, {
      balance,
      installments_left:
        paying.installments_left !== null ? Math.max(0, paying.installments_left - 1) : null,
      status: balance > 0 ? 'activa' : 'cancelada',
    });
    toast(balance > 0 ? 'Pago registrado' : `¡Cancelaste ${paying.name}!`);
    setPaying(null);
  }

  const committed = income > 0 ? (totals.monthly / income) * 100 : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deudas y plan de pago"
        description="Lo que debés, lo que pagás por mes y cuándo podés quedar libre."
        icon={CreditCard}
        accent={FINANCE_META.accent}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar deuda
          </Button>
        }
      />

      <StatGrid className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard label="Deuda total" value={formatMoney(totals.balance)} detail={`${totals.count} ${totals.count === 1 ? 'deuda activa' : 'deudas activas'}`} fill="coral" />
        <StatCard label="Cuotas por mes" value={formatMoney(totals.monthly)} detail="Suma de cuotas mínimas" fill="sun" />
        <StatCard
          label="De tus ingresos"
          value={committed === null ? '—' : `${Math.round(committed)}%`}
          detail={committed === null ? 'Cargá tus ingresos para calcularlo' : 'se va en cuotas de deudas'}
          progress={committed}
          fill="lime"
        />
      </StatGrid>

      {hasUsd && !usdRate ? <UsdRateCard compact /> : null}
      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && debts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CreditCard className="h-8 w-8" aria-hidden="true" />}
            title="Todavía no cargaste deudas"
            description="Cargá cada tarjeta, préstamo o deuda con su saldo actual, la tasa anual (TNA) y la cuota mínima. Con eso se arma el plan de pago."
            action={<Button onClick={openNew}>Agregar la primera</Button>}
          />
        </Card>
      ) : null}

      {active.length > 0 ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader title="Deudas activas" />
            <ul className="space-y-2 px-3 pb-4">
              {active.map((debt) => {
                const progress =
                  debt.original_amount && Number(debt.original_amount) > 0
                    ? Math.min(100, Math.max(0, (1 - Number(debt.balance) / Number(debt.original_amount)) * 100))
                    : null;
                const order = plan.debts.find((item) => item.id === debt.id);
                return (
                  <li key={debt.id} className="rounded-2xl bg-leaf-50 px-4 py-3 dark:bg-leaf-500/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-sand-900 dark:text-sand-100">
                          {order ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-900 text-[11px] text-white">
                              {order.order}
                            </span>
                          ) : null}
                          {debt.name}
                        </p>
                        <p className="mt-0.5 text-xs text-sand-500">
                          {labelOf(DEBT_KIND_OPTIONS, debt.kind)}
                          {debt.creditor ? ` · ${debt.creditor}` : ''}
                          {debt.due_day ? ` · vence el ${debt.due_day}` : ''}
                        </p>
                      </div>
                      <p className="tabular shrink-0 text-right text-base font-extrabold text-sand-900 dark:text-sand-100">
                        {formatMoney(Number(debt.balance), debt.currency)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone={debt.rate_annual ? 'clay' : 'neutral'}>
                        {debt.rate_annual !== null ? `TNA ${Number(debt.rate_annual).toLocaleString('es-AR')}%` : 'Sin tasa'}
                      </Badge>
                      <Badge tone="neutral">
                        Cuota {debt.monthly_payment ? formatMoney(Number(debt.monthly_payment), debt.currency) : '—'}
                      </Badge>
                      {debt.installments_left !== null ? (
                        <Badge tone="neutral">
                          {debt.installments_left} {debt.installments_left === 1 ? 'cuota restante' : 'cuotas restantes'}
                        </Badge>
                      ) : null}
                    </div>
                    {progress !== null ? (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white dark:bg-sand-800">
                          <div className="h-full rounded-full bg-leaf-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-sand-500">Pagaste el {Math.round(progress)}%</p>
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center gap-1">
                      <Button size="sm" onClick={() => openPayment(debt)}>
                        <HandCoins className="h-4 w-4" aria-hidden="true" />
                        Registrar pago
                      </Button>
                      <button
                        type="button"
                        onClick={() => openEdit(debt)}
                        aria-label={`Editar ${debt.name}`}
                        className="ml-auto rounded-full p-1.5 text-sand-400 hover:bg-white hover:text-sand-700 dark:hover:bg-sand-800"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(debt.id)}
                        aria-label={`Eliminar ${debt.name}`}
                        className="rounded-full p-1.5 text-sand-400 hover:bg-white hover:text-clay-500 dark:hover:bg-sand-800"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Plan de pago"
              description="Pagás todas las cuotas mínimas y lo que sumes de extra va a una deuda por vez. Cuando la cancelás, su cuota pasa a la siguiente."
            />
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Estrategia">
                {(
                  [
                    {
                      value: 'avalancha',
                      title: 'Avalancha',
                      text: 'Primero la de tasa más alta. Pagás menos intereses.',
                      icon: TrendingDown,
                    },
                    {
                      value: 'bola_de_nieve',
                      title: 'Bola de nieve',
                      text: 'Primero la de saldo más chico. Cancelás deudas antes.',
                      icon: Snowflake,
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={strategy === option.value}
                    onClick={() => setStrategy(option.value)}
                    className={cn(
                      'flex items-start gap-2 rounded-2xl border-2 p-3 text-left transition',
                      strategy === option.value
                        ? 'border-brand-900 bg-leaf-300 text-brand-900'
                        : 'border-sand-100 text-sand-700 hover:border-sand-300 dark:border-sand-800 dark:text-sand-300',
                    )}
                  >
                    <option.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-extrabold">{option.title}</span>
                      <span className="block text-xs">{option.text}</span>
                    </span>
                  </button>
                ))}
              </div>

              <Input
                label="¿Cuánto extra podés poner por mes, además de las cuotas?"
                inputMode="decimal"
                placeholder="Ej.: 100000"
                value={extra}
                onChange={(event) => setExtra(event.target.value)}
                hint={`Presupuesto mensual para deudas: ${formatMoney(budget)}`}
              />

              {plan.feasible && plan.months !== null ? (
                <div className="rounded-2xl bg-leaf-300 p-4 text-brand-900">
                  <p className="text-xs font-extrabold uppercase tracking-wide">Quedás sin deudas en</p>
                  <p className="tabular text-3xl font-extrabold">
                    {plan.months} {plan.months === 1 ? 'mes' : 'meses'}
                  </p>
                  <p className="text-sm font-semibold">
                    hacia {monthsFromNow(plan.months)} · intereses totales {formatMoney(plan.totalInterest)}
                  </p>
                  {extraValue > 0 && minimumOnly.feasible && minimumOnly.months !== null ? (
                    <p className="mt-1 text-xs font-semibold">
                      Solo con las mínimas serían {minimumOnly.months} meses y {formatMoney(minimumOnly.totalInterest)} de
                      intereses: con el extra te ahorrás {minimumOnly.months - plan.months} meses y{' '}
                      {formatMoney(Math.max(0, minimumOnly.totalInterest - plan.totalInterest))}.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl bg-clay-50 p-4 text-sm text-clay-600 dark:bg-clay-500/10 dark:text-clay-200">
                  Con {formatMoney(budget)} por mes la deuda no baja: los intereses son más que lo que pagás. Sumá un
                  extra o revisá las cuotas cargadas (una deuda sin cuota mínima solo baja con extra).
                </div>
              )}

              {plan.timeline.length > 1 ? (
                <div className="h-48" aria-label="Evolución del saldo total">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={plan.timeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e0daf0)" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(value) => `${value}m`} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        width={56}
                        tickFormatter={(value: number) =>
                          value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}k`
                        }
                      />
                      <Tooltip
                        content={({ active: isActive, payload }) =>
                          isActive && payload?.length ? (
                            <ChartTooltipBox
                              title={`Mes ${payload[0].payload.month}`}
                              rows={[{ label: 'Saldo', value: formatMoney(Number(payload[0].value)) }]}
                            />
                          ) : null
                        }
                      />
                      <Area type="monotone" dataKey="balance" stroke="#3f7d14" fill="#a3e06a" fillOpacity={0.5} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

              <ol className="space-y-1.5">
                {plan.debts.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">
                      {item.order}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-bold text-sand-900 dark:text-sand-100">{item.name}</span>
                    <span className="tabular shrink-0 text-xs text-sand-500">
                      {item.months !== null ? `cancelada en ${monthsFromNow(item.months)}` : 'sin fecha'}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-sand-500">
                Simulación con tasa fija (TNA/12) e importes en pesos; no contempla inflación, ajustes ni cargos de las
                tarjetas. Sirve para comparar caminos, no reemplaza el detalle del banco.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {closed.length > 0 ? (
        <Card>
          <CardHeader title="Canceladas" />
          <ul className="px-3 pb-4">
            {closed.map((debt) => (
              <li key={debt.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-sand-600 dark:text-sand-300">
                <CheckCircle2 className="h-4 w-4 text-leaf-500" aria-hidden="true" />
                <span className="flex-1">{debt.name}</span>
                <button
                  type="button"
                  onClick={() => openEdit(debt)}
                  aria-label={`Editar ${debt.name}`}
                  className="rounded-full p-1.5 text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar deuda' : 'Nueva deuda'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej.: Visa Galicia, Préstamo personal"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              options={DEBT_KIND_OPTIONS}
              value={draft.kind}
              onChange={(event) => setDraft({ ...draft, kind: event.target.value as DebtKind })}
            />
            <Input
              label="Acreedor"
              placeholder="Banco o persona"
              value={draft.creditor}
              onChange={(event) => setDraft({ ...draft, creditor: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Saldo que debés hoy"
              inputMode="decimal"
              value={draft.balance}
              onChange={(event) => setDraft({ ...draft, balance: event.target.value })}
              required
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
              label="Tasa anual (TNA)"
              inputMode="decimal"
              suffix="%"
              placeholder="Ej.: 65"
              value={draft.rate_annual}
              onChange={(event) => setDraft({ ...draft, rate_annual: event.target.value })}
            />
            <Input
              label="Cuota mensual"
              inputMode="decimal"
              placeholder="Mínimo o cuota fija"
              value={draft.monthly_payment}
              onChange={(event) => setDraft({ ...draft, monthly_payment: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Monto original"
              inputMode="decimal"
              placeholder="Opcional"
              value={draft.original_amount}
              onChange={(event) => setDraft({ ...draft, original_amount: event.target.value })}
            />
            <Input
              label="Cuotas restantes"
              inputMode="numeric"
              placeholder="Opcional"
              value={draft.installments_left}
              onChange={(event) => setDraft({ ...draft, installments_left: event.target.value })}
            />
            <Input
              label="Día de vencimiento"
              inputMode="numeric"
              placeholder="1 a 31"
              value={draft.due_day}
              onChange={(event) => setDraft({ ...draft, due_day: event.target.value })}
            />
          </div>
          <Textarea
            label="Notas"
            placeholder="Opcional: condiciones, refinanciación, etc."
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

      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={paying ? `Pago de ${paying.name}` : 'Registrar pago'}
        description="Se carga como egreso del mes y baja el saldo de la deuda."
      >
        <form onSubmit={handlePayment} className="space-y-4">
          <Input
            label={`Importe (${paying?.currency ?? 'ARS'})`}
            inputMode="decimal"
            value={payment.amount}
            onChange={(event) => setPayment({ ...payment, amount: event.target.value })}
            required
            autoFocus
          />
          <Input
            label="Fecha"
            type="date"
            value={payment.date}
            onChange={(event) => setPayment({ ...payment, date: event.target.value })}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setPaying(null)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
