import type { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingState({ label = 'Cargando…', className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-10 text-sm text-sand-500 dark:text-sand-400',
        className,
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-700',
        'dark:border-clay-800/50 dark:bg-clay-900/30 dark:text-clay-300',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  title = 'No hay registros todavía',
  description,
  action,
  icon,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon ? <div className="mb-3 text-sand-300 dark:text-sand-600">{icon}</div> : null}
      <p className="text-sm font-medium text-sand-700 dark:text-sand-200">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-sand-500 dark:text-sand-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
