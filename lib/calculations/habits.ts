import type { Habit, HabitRecord, StepRecord } from '@/types/database';
import { eachDayString, parseDate, todayString } from './dates';

/**
 * Un día "cuenta" para un hábito solo si el hábito estaba vigente y ese día
 * estaba previsto según su frecuencia. Los días no previstos nunca se cuentan
 * como incumplimiento.
 */
export function isHabitScheduledOn(habit: Habit, date: string): boolean {
  if (date < habit.start_date) return false;
  if (habit.end_date && date > habit.end_date) return false;
  if (habit.frequency_type === 'daily') return true;
  const weekday = parseDate(date).getDay(); // 0 = domingo
  return habit.weekdays.includes(weekday);
}

/** Días previstos de un hábito dentro de un rango (inclusive). */
export function scheduledDates(habit: Habit, from: string, to: string): string[] {
  return eachDayString(parseDate(from), parseDate(to)).filter((date) =>
    isHabitScheduledOn(habit, date),
  );
}

/** Días previstos por semana según la configuración. */
export function expectedPerWeek(habit: Habit): number {
  if (habit.frequency_type === 'daily') return 7;
  return habit.weekdays.length;
}

export interface HabitDayContext {
  /** Registros de hábito indexados por `${habit_id}|${date}`. */
  records: Map<string, HabitRecord>;
  /** Pasos por fecha, para hábitos integrados con step_records. */
  steps: Map<string, number>;
}

export function buildHabitContext(
  records: HabitRecord[],
  stepRecords: StepRecord[] = [],
): HabitDayContext {
  return {
    records: new Map(records.map((record) => [`${record.habit_id}|${record.date}`, record])),
    steps: new Map(stepRecords.map((record) => [record.date, record.steps])),
  };
}

export interface HabitDayState {
  scheduled: boolean;
  completed: boolean;
  /** Valor cargado (o pasos del día si el hábito usa step_records). */
  value: number | null;
  /** Porcentaje respecto de la meta, solo para hábitos cuantitativos. */
  percent: number | null;
  /** true si el valor viene de step_records y no se carga a mano. */
  fromSteps: boolean;
}

/** Estado de un hábito en un día concreto. */
export function getHabitDayState(
  habit: Habit,
  date: string,
  context: HabitDayContext,
): HabitDayState {
  const scheduled = isHabitScheduledOn(habit, date);
  const record = context.records.get(`${habit.id}|${date}`);

  // Hábito cuantitativo enganchado al registro de pasos: el valor y el
  // cumplimiento se derivan de step_records, no se cargan dos veces.
  if (habit.type === 'quantitative' && habit.use_step_records) {
    const steps = context.steps.get(date) ?? null;
    const target = habit.target_value ?? 0;
    const percent = steps !== null && target > 0 ? (steps / target) * 100 : null;
    return {
      scheduled,
      completed: steps !== null && target > 0 ? steps >= target : false,
      value: steps,
      percent,
      fromSteps: true,
    };
  }

  if (habit.type === 'quantitative') {
    const value = record?.value ?? null;
    const target = habit.target_value ?? 0;
    const percent = value !== null && target > 0 ? (value / target) * 100 : null;
    const completed =
      value !== null && target > 0 ? value >= target : Boolean(record?.completed);
    return { scheduled, completed, value, percent, fromSteps: false };
  }

  return {
    scheduled,
    completed: Boolean(record?.completed),
    value: null,
    percent: null,
    fromSteps: false,
  };
}

export interface CompletionResult {
  expected: number;
  completed: number;
  percentage: number;
}

/**
 * Cumplimiento de un hábito en un rango: completados / previstos * 100.
 * Los días futuros del rango no se cuentan como previstos.
 */
export function calculateHabitCompletion(
  habit: Habit,
  from: string,
  to: string,
  context: HabitDayContext,
  options: { includeFuture?: boolean } = {},
): CompletionResult {
  const today = todayString();
  const limit = options.includeFuture ? to : to < today ? to : today;
  if (limit < from) return { expected: 0, completed: 0, percentage: 0 };

  const dates = scheduledDates(habit, from, limit);
  let completed = 0;
  for (const date of dates) {
    if (getHabitDayState(habit, date, context).completed) completed += 1;
  }

  return {
    expected: dates.length,
    completed,
    percentage: dates.length === 0 ? 0 : (completed / dates.length) * 100,
  };
}

export interface HabitCompletionRow extends CompletionResult {
  habit: Habit;
}

export interface OverallCompletion extends CompletionResult {
  byHabit: HabitCompletionRow[];
}

/**
 * Cumplimiento general: suma de instancias cumplidas sobre suma de instancias
 * previstas. NO es el promedio de los porcentajes de cada hábito.
 */
export function calculateWeeklyCompletion(
  habits: Habit[],
  from: string,
  to: string,
  context: HabitDayContext,
): OverallCompletion {
  let expected = 0;
  let completed = 0;
  const byHabit: HabitCompletionRow[] = [];

  for (const habit of habits) {
    const result = calculateHabitCompletion(habit, from, to, context);
    expected += result.expected;
    completed += result.completed;
    byHabit.push({ habit, ...result });
  }

  return {
    expected,
    completed,
    percentage: expected === 0 ? 0 : (completed / expected) * 100,
    byHabit,
  };
}

/** Cumplimiento de un solo día, usado en el dashboard y el calendario. */
export function calculateDayCompletion(
  habits: Habit[],
  date: string,
  context: HabitDayContext,
): CompletionResult {
  let expected = 0;
  let completed = 0;
  for (const habit of habits) {
    const state = getHabitDayState(habit, date, context);
    if (!state.scheduled) continue;
    expected += 1;
    if (state.completed) completed += 1;
  }
  return {
    expected,
    completed,
    percentage: expected === 0 ? 0 : (completed / expected) * 100,
  };
}

export const FREQUENCY_LABELS: Record<Habit['frequency_type'], string> = {
  daily: 'Todos los días',
  weekly_days: 'Días de la semana',
  custom: 'Personalizado',
};

export const HABIT_TYPE_LABELS: Record<Habit['type'], string> = {
  check: 'Marcar como hecho',
  quantitative: 'Con meta numérica',
};

/** Descripción legible de la frecuencia: "Lun, Mié, Vie". */
export function frequencyDescription(habit: Habit): string {
  if (habit.frequency_type === 'daily') return 'Todos los días';
  const short = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const ordered = [...habit.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (ordered.length === 0) return 'Sin días definidos';
  return ordered.map((day) => short[day]).join(', ');
}
