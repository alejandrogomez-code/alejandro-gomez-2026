/**
 * Todas las fechas de registro diario se manejan como strings 'YYYY-MM-DD'
 * construidos con los componentes LOCALES de la fecha. Nunca se usa toISOString()
 * para fechas de día, porque desplazaría el día según el huso horario.
 */

/** Convierte un Date local a 'YYYY-MM-DD'. */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Convierte 'YYYY-MM-DD' a un Date local a medianoche. */
export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** Fecha de hoy como 'YYYY-MM-DD' local. */
export function todayString(): string {
  return toDateString(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysString(value: string, days: number): string {
  return toDateString(addDays(parseDate(value), days));
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

/** Lunes de la semana de la fecha dada. */
export function startOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

/** Domingo de la semana de la fecha dada. */
export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Lista de fechas 'YYYY-MM-DD' entre dos fechas, ambas inclusive. */
export function eachDayString(from: Date, to: Date): string[] {
  const days: string[] = [];
  let cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const limit = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cursor <= limit) {
    days.push(toDateString(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

/** Diferencia en días completos (b - a). */
export function diffInDays(a: string | Date, b: string | Date): number {
  const dateA = typeof a === 'string' ? parseDate(a) : a;
  const dateB = typeof b === 'string' ? parseDate(b) : b;
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((utcB - utcA) / msPerDay);
}

/**
 * Días restantes hasta una fecha objetivo.
 * Negativo si la fecha ya pasó. null si no hay fecha.
 */
export function calculateDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null;
  return diffInDays(todayString(), targetDate);
}

export function isPast(targetDate: string | null): boolean {
  const remaining = calculateDaysRemaining(targetDate);
  return remaining !== null && remaining < 0;
}

const LOCALE = 'es-AR';

/** '14/09/2026' */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return date.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** '14 de septiembre' */
export function formatDayMonth(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' });
}

/** 'lunes, 14 de septiembre de 2026' */
export function formatLongDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return date.toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** '14 sep' */
export function formatShortDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

/** 'septiembre 2026' */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

export const WEEKDAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const WEEKDAY_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/** Encabezados del calendario, con la semana empezando en lunes. */
export const CALENDAR_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Número formateado con separador de miles local: 8432 -> '8.432'. */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Porcentaje con un decimal: 84.32 -> '84,3%'. */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/** Saludo según la hora local. */
export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 6) return 'Buenas noches';
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
