import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}

export function Progress({ value, className, barClassName, label }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-mist-100 dark:bg-mist-800',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full bg-mist-900 transition-[width] duration-500 dark:bg-mist-100',
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
