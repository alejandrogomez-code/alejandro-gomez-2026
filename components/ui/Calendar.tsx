'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CALENDAR_HEADERS,
  addMonths,
  endOfMonth,
  formatMonthYear,
  startOfMonth,
  toDateString,
  todayString,
} from '@/lib/calculations/dates';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface CalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selected?: string | null;
  onSelect?: (date: string) => void;
  /** Contenido extra dentro de cada celda (indicadores). */
  renderDay?: (date: string) => ReactNode;
}

/** Calendario mensual con la semana empezando en lunes. */
export function Calendar({ month, onMonthChange, selected, onSelect, renderDay }: CalendarProps) {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const today = todayString();

  // getDay(): 0 = domingo. Offset para que la grilla empiece en lunes.
  const leading = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push(toDateString(new Date(month.getFullYear(), month.getMonth(), day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mes anterior"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <p className="text-sm font-medium capitalize text-mist-900 dark:text-mist-100">
          {formatMonthYear(month)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mes siguiente"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {CALENDAR_HEADERS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="pb-1 text-center text-xs font-medium text-mist-400"
          >
            {label}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          const isToday = date === today;
          const isSelected = date === selected;
          const dayNumber = Number(date.slice(8, 10));

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect?.(date)}
              aria-label={date}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelected}
              className={cn(
                'flex aspect-square flex-col items-center justify-start gap-1 rounded-xl border p-1 text-xs transition-colors sm:p-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-900 dark:focus-visible:ring-mist-100',
                isSelected
                  ? 'border-mist-900 bg-mist-900 text-mist-50 dark:border-mist-100 dark:bg-mist-100 dark:text-mist-900'
                  : 'border-mist-200/70 bg-white text-mist-700 hover:border-mist-300 dark:border-mist-800 dark:bg-mist-900 dark:text-mist-300 dark:hover:border-mist-700',
              )}
            >
              <span className={cn('tabular-nums', isToday && !isSelected ? 'font-semibold' : '')}>
                {dayNumber}
              </span>
              {renderDay?.(date)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
