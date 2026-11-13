import type {
  Currency,
  DebtKind,
  FinanceDebt,
  FinanceInvestment,
  FinanceMovement,
  InvestmentKind,
  MovementKind,
} from '@/types/database';

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'ARS', label: 'Pesos (ARS)' },
  { value: 'USD', label: 'Dólares (USD)' },
];

export const MOVEMENT_KIND_OPTIONS: { value: MovementKind; label: string }[] = [
  { value: 'egreso', label: 'Egreso' },
  { value: 'ingreso', label: 'Ingreso' },
];

export const INCOME_CATEGORIES = ['Sueldo', 'Aguinaldo', 'Honorarios', 'Alquileres', 'Rendimientos', 'Ventas', 'Otros ingresos'];

export const EXPENSE_CATEGORIES = [
  'Vivienda',
  'Servicios',
  'Supermercado',
  'Transporte',
  'Salud',
  'Educación',
  'Hijos',
  'Seguros',
  'Impuestos',
  'Deudas',
  'Ocio',
  'Ropa',
  'Regalos',
  'Ahorro',
  'Otros',
];

export const DEBT_KIND_OPTIONS: { value: DebtKind; label: string }[] = [
  { value: 'tarjeta', label: 'Tarjeta de crédito' },
  { value: 'prestamo', label: 'Préstamo' },
  { value: 'hipoteca', label: 'Hipotecario / prendario' },
  { value: 'personal', label: 'Deuda con una persona' },
  { value: 'otro', label: 'Otro' },
];

export const INVESTMENT_KIND_OPTIONS: { value: InvestmentKind; label: string }[] = [
  { value: 'plazo_fijo', label: 'Plazo fijo' },
  { value: 'fci', label: 'Fondo común de inversión' },
  { value: 'dolares', label: 'Dólares' },
  { value: 'acciones', label: 'Acciones' },
  { value: 'cedears', label: 'CEDEARs' },
  { value: 'bonos', label: 'Bonos / ONs' },
  { value: 'cripto', label: 'Cripto' },
  { value: 'otro', label: 'Otro' },
];

export function labelOf<T extends string>(options: { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Pasa un importe a pesos con la cotización cargada (si es USD y no hay cotización, cuenta 0). */
export function toArs(amount: number | null | undefined, currency: Currency, usdRate: number | null): number {
  const value = Number(amount ?? 0);
  if (currency === 'ARS') return value;
  return usdRate ? value * usdRate : 0;
}

/** $ 1.234.567 o US$ 1.234 */
export function formatMoney(value: number, currency: Currency = 'ARS', decimals = 0): string {
  const formatted = Math.abs(value).toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = value < 0 ? '−' : '';
  return `${sign}${currency === 'USD' ? 'US$' : '$'} ${formatted}`;
}

/** 'YYYY-MM' de una fecha 'YYYY-MM-DD'. */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthKey(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export interface MonthTotals {
  income: number;
  expense: number;
  balance: number;
  byCategory: { category: string; amount: number }[];
  missingRate: boolean;
}

/** Totales en pesos de los movimientos de un mes. */
export function monthTotals(movements: FinanceMovement[], key: string, usdRate: number | null): MonthTotals {
  let income = 0;
  let expense = 0;
  let missingRate = false;
  const categories = new Map<string, number>();
  for (const movement of movements) {
    if (monthKey(movement.date) !== key) continue;
    if (movement.currency === 'USD' && !usdRate) missingRate = true;
    const amount = toArs(movement.amount, movement.currency, usdRate);
    if (movement.kind === 'ingreso') income += amount;
    else {
      expense += amount;
      categories.set(movement.category, (categories.get(movement.category) ?? 0) + amount);
    }
  }
  const byCategory = Array.from(categories.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  return { income, expense, balance: income - expense, byCategory, missingRate };
}

export function activeDebts(debts: FinanceDebt[]): FinanceDebt[] {
  return debts.filter((debt) => debt.status === 'activa' && Number(debt.balance) > 0);
}

export function debtTotals(debts: FinanceDebt[], usdRate: number | null) {
  const active = activeDebts(debts);
  return {
    count: active.length,
    balance: active.reduce((sum, debt) => sum + toArs(debt.balance, debt.currency, usdRate), 0),
    monthly: active.reduce((sum, debt) => sum + toArs(debt.monthly_payment, debt.currency, usdRate), 0),
  };
}

export function investmentTotals(investments: FinanceInvestment[], usdRate: number | null) {
  const active = investments.filter((investment) => investment.active);
  const invested = active.reduce((sum, item) => sum + toArs(item.amount, item.currency, usdRate), 0);
  const current = active.reduce(
    (sum, item) => sum + toArs(item.current_value ?? item.amount, item.currency, usdRate),
    0,
  );
  return { count: active.length, invested, current, gain: current - invested };
}

// Plan de pago ------------------------------------------------------------------

export type PayoffStrategy = 'avalancha' | 'bola_de_nieve';

export interface PayoffDebtResult {
  id: string;
  name: string;
  order: number;
  startBalance: number;
  months: number | null;
  interest: number;
}

export interface PayoffPlan {
  feasible: boolean;
  /** Suma de cuotas mínimas del primer mes. */
  minimums: number;
  months: number | null;
  totalInterest: number;
  totalPaid: number;
  debts: PayoffDebtResult[];
  /** Saldo total al final de cada mes, para el gráfico. */
  timeline: { month: number; balance: number }[];
}

const MAX_MONTHS = 360;

/**
 * Simula mes a mes: se suman los intereses (TNA / 12), se paga la cuota mínima
 * de cada deuda y todo lo que sobra del presupuesto va a la deuda prioritaria.
 * Cuando una deuda se cancela, su cuota pasa a la siguiente ("efecto bola").
 * Avalancha: primero la de mayor tasa. Bola de nieve: primero la de menor saldo.
 * Todo en pesos, con la cotización cargada.
 */
export function simulatePayoff(
  debts: FinanceDebt[],
  monthlyBudget: number,
  strategy: PayoffStrategy,
  usdRate: number | null,
): PayoffPlan {
  const items = activeDebts(debts).map((debt) => ({
    id: debt.id,
    name: debt.name,
    rate: Number(debt.rate_annual ?? 0) / 100 / 12,
    minimum: toArs(debt.monthly_payment, debt.currency, usdRate),
    balance: toArs(debt.balance, debt.currency, usdRate),
    startBalance: toArs(debt.balance, debt.currency, usdRate),
    interest: 0,
    months: null as number | null,
  }));

  const priority = [...items].sort((a, b) =>
    strategy === 'avalancha'
      ? b.rate - a.rate || a.balance - b.balance
      : a.balance - b.balance || b.rate - a.rate,
  );
  const orderOf = new Map(priority.map((item, index) => [item.id, index + 1]));
  const minimums = items.reduce((sum, item) => sum + Math.min(item.minimum, item.balance), 0);

  const timeline: { month: number; balance: number }[] = [
    { month: 0, balance: items.reduce((sum, item) => sum + item.balance, 0) },
  ];
  let totalPaid = 0;
  let month = 0;
  let stalled = false;

  while (items.some((item) => item.balance > 0.5) && month < MAX_MONTHS) {
    month += 1;
    for (const item of items) {
      if (item.balance <= 0) continue;
      const interest = item.balance * item.rate;
      item.balance += interest;
      item.interest += interest;
    }
    let available = monthlyBudget;
    // Cuotas mínimas.
    for (const item of items) {
      if (item.balance <= 0 || available <= 0) continue;
      const pay = Math.min(item.minimum, item.balance, available);
      item.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    // Lo que sobra va en orden de prioridad.
    for (const target of priority) {
      if (available <= 0) break;
      const item = items.find((candidate) => candidate.id === target.id)!;
      if (item.balance <= 0) continue;
      const pay = Math.min(item.balance, available);
      item.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    for (const item of items) {
      if (item.balance <= 0.5 && item.months === null) {
        item.balance = 0;
        item.months = month;
      }
    }
    const total = items.reduce((sum, item) => sum + Math.max(0, item.balance), 0);
    // Si la deuda total crece mes a mes, el presupuesto no alcanza ni para los intereses.
    if (month > 1 && total >= timeline[timeline.length - 1].balance - 0.5) {
      stalled = true;
      timeline.push({ month, balance: total });
      break;
    }
    timeline.push({ month, balance: total });
  }

  const done = items.every((item) => item.months !== null);
  return {
    feasible: done && !stalled,
    minimums,
    months: done && !stalled ? month : null,
    totalInterest: items.reduce((sum, item) => sum + item.interest, 0),
    totalPaid,
    debts: items
      .map((item) => ({
        id: item.id,
        name: item.name,
        order: orderOf.get(item.id) ?? 0,
        startBalance: item.startBalance,
        months: item.months,
        interest: item.interest,
      }))
      .sort((a, b) => a.order - b.order),
    timeline,
  };
}

/** Mes calendario en que termina un plan que empieza el mes que viene: 'marzo de 2027'. */
export function monthsFromNow(months: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}
