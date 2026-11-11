import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dueLabel, dueTone } from '@/lib/calculations/agenda';

const TONE_CLASSES = {
  overdue: 'bg-clay-500 text-white',
  today: 'bg-amber-300 text-brand-900',
  soon: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200',
  later: 'bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-300',
  none: '',
};

/** Píldora con la fecha límite, coloreada según cuán cerca está. */
export function DueBadge({
  date,
  soonDays = 3,
  className,
}: {
  date: string | null;
  soonDays?: number;
  className?: string;
}) {
  const label = dueLabel(date);
  if (!label) return null;
  const tone = dueTone(date, soonDays);
  return (
    <span
      className={cn(
        'tabular inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold',
        TONE_CLASSES[tone],
        className,
      )}
    >
      <CalendarClock className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
