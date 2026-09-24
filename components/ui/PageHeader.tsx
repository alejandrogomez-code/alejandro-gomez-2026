import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENTS, type Accent } from '@/lib/accents';

/** Encabezado de página con el ícono de la sección en su color. */
export function PageHeader({
  title,
  description,
  icon: Icon,
  accent = 'neutral',
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
              ACCENTS[accent].solid,
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-medium tracking-tight text-sand-900 dark:text-sand-100">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 text-sm text-sand-500 dark:text-sand-400">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
