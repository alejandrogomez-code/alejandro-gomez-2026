'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CreditCard, LineChart, PieChart } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { MonthSwitcher, UsdRateCard, useUsdRate } from '@/components/finance/FinanceShared';
import { useRows } from '@/hooks/useRows';
import { FINANCE_META } from '@/lib/areas';
import {
  debtTotals,
  formatMoney,
  investmentTotals,
  monthKey,
  monthTotals,
  shiftMonth,
} from '@/lib/calculations/finance';
import { todayString } from '@/lib/calculations/dates';

function LinkAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-leaf-600 hover:underline dark:text-leaf-200">
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

export default function FinanzasPage() {
  const usdRate = useUsdRate();
  const { rows: movements } = useRows('finance_movements', { order: [{ column: 'date', ascending: false }] });
  const { rows: debts } = useRows('finance_debts', { order: [{ column: 'created_at', ascending: true }] });
  const { rows: investments } = useRows('finance_investments', { order: [{ column: 'start_date', ascending: false }] });
  const [month, setMonth] = useState(monthKey(todayString()));

  const totals = useMemo(() => monthTotals(movements, month, usdRate), [movements, month, usdRate]);
  const previous = useMemo(() => monthTotals(movements, shiftMonth(month, -1), usdRate), [movements, month, usdRate]);
  const debt = debtTotals(debts, usdRate);
  const invest = investmentTotals(investments, usdRate);
  const committed = totals.income > 0 ? (debt.monthly / totals.income) * 100 : null;
  const maxCategory = totals.byCategory[0]?.amount ?? 0;

  // Últimos seis meses, para ver la tendencia.
  const trend = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const key = shiftMonth(month, index - 5);
        const value = monthTotals(movements, key, usdRate);
        return { key, ...value };
      }),
    [movements, month, usdRate],
  );
  const trendMax = Math.max(1, ...trend.map((item) => Math.max(item.income, item.expense)));

  function delta(current: number, before: number) {
    if (!before) return undefined;
    const pct = ((current - before) / before) * 100;
    return `${pct >= 0 ? '+' : ''}${Math.round(pct)}% vs. mes anterior`;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={FINANCE_META.label}
        description="Ingresos, gastos, deudas e inversiones en un solo lugar."
        icon={FINANCE_META.icon}
        accent={FINANCE_META.accent}
        action={<MonthSwitcher value={month} onChange={setMonth} />}
      />

      <StatGrid>
        <StatCard label="Ingresos del mes" value={formatMoney(totals.income)} detail={delta(totals.income, previous.income)} fill="lime" />
        <StatCard label="Egresos del mes" value={formatMoney(totals.expense)} detail={delta(totals.expense, previous.expense)} fill="coral" />
        <StatCard
          label="Saldo del mes"
          value={formatMoney(totals.balance)}
          detail={totals.income > 0 ? `Tasa de ahorro ${Math.round((totals.balance / totals.income) * 100)}%` : undefined}
          fill={totals.balance >= 0 ? 'mint' : 'sun'}
        />
        <StatCard
          label="Patrimonio neto"
          value={formatMoney(invest.current - debt.balance)}
          detail="Inversiones menos deudas"
          fill="lilac"
        />
      </StatGrid>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Últimos 6 meses" action={<LinkAction href="/finanzas/movimientos" label="Movimientos" />} />
            <CardContent>
              <div className="flex h-40 items-end gap-3" role="img" aria-label="Ingresos y egresos de los últimos seis meses">
                {trend.map((item) => (
                  <div key={item.key} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-32 w-full items-end justify-center gap-1">
                      <div
                        className="w-1/3 max-w-[18px] rounded-t-md bg-leaf-400"
                        style={{ height: `${(item.income / trendMax) * 100}%` }}
                        title={`Ingresos ${formatMoney(item.income)}`}
                      />
                      <div
                        className="w-1/3 max-w-[18px] rounded-t-md bg-clay-300"
                        style={{ height: `${(item.expense / trendMax) * 100}%` }}
                        title={`Egresos ${formatMoney(item.expense)}`}
                      />
                    </div>
                    <span className="text-[11px] font-bold capitalize text-sand-500">
                      {new Date(Number(item.key.slice(0, 4)), Number(item.key.slice(5)) - 1, 1).toLocaleDateString('es-AR', { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-xs font-bold text-sand-500">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-leaf-400" />Ingresos</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-clay-300" />Egresos</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="¿En qué se va la plata?" description="Egresos del mes por categoría." />
            <CardContent>
              {totals.byCategory.length === 0 ? (
                <EmptyState
                  icon={<PieChart className="h-7 w-7" aria-hidden="true" />}
                  title="Sin egresos cargados en este mes"
                  className="py-6"
                />
              ) : (
                <ul className="space-y-2.5">
                  {totals.byCategory.map((item) => (
                    <li key={item.category}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-bold text-sand-900 dark:text-sand-100">{item.category}</span>
                        <span className="tabular text-sand-600 dark:text-sand-300">
                          {formatMoney(item.amount)} · {Math.round((item.amount / totals.expense) * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-sand-100 dark:bg-sand-800">
                        <div className="h-full rounded-full bg-leaf-400" style={{ width: `${(item.amount / maxCategory) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-leaf-300 dark:bg-leaf-300">
            <CardHeader
              title={<span className="text-brand-900">Deudas</span>}
              action={
                <Link href="/finanzas/deudas" className="inline-flex items-center gap-1 text-sm font-bold text-brand-900 hover:underline">
                  Plan de pago
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              }
            />
            <CardContent className="text-brand-900">
              {debt.count === 0 ? (
                <p className="flex items-center gap-2 text-sm font-bold">
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  No hay deudas activas cargadas.
                </p>
              ) : (
                <>
                  <p className="tabular text-3xl font-extrabold">{formatMoney(debt.balance)}</p>
                  <p className="text-sm font-semibold">
                    {debt.count} {debt.count === 1 ? 'deuda' : 'deudas'} · {formatMoney(debt.monthly)} de cuotas por mes
                  </p>
                  {committed !== null ? (
                    <p className="mt-2 rounded-xl bg-white/50 px-3 py-2 text-sm font-bold">
                      Las cuotas se llevan el {Math.round(committed)}% de los ingresos del mes.
                    </p>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Inversiones" action={<LinkAction href="/finanzas/inversiones" label="Ver" />} />
            <CardContent>
              {invest.count === 0 ? (
                <p className="flex items-center gap-2 text-sm text-sand-500">
                  <LineChart className="h-4 w-4" aria-hidden="true" />
                  Todavía no cargaste inversiones.
                </p>
              ) : (
                <>
                  <p className="tabular text-2xl font-extrabold text-sand-900 dark:text-sand-100">{formatMoney(invest.current)}</p>
                  <p className="text-sm text-sand-500">
                    {invest.count} activas · resultado {formatMoney(invest.gain)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <UsdRateCard />
        </div>
      </div>
    </div>
  );
}
