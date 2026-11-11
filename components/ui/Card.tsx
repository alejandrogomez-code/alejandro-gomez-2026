import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white shadow-card',
        'dark:bg-sand-900',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-5 pb-2 pt-5',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold text-sand-900 dark:text-sand-100">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-sand-500 dark:text-sand-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5 pt-3', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-t border-sand-100 px-5 py-3 dark:border-sand-800', className)}
      {...props}
    />
  );
}

/**
 * Fila con chip de icono, título, metadatos y acciones a la derecha.
 * Es el patrón que se repite en hábitos, pesos, pasos y objetivos.
 */
export function ListRow({
  icon,
  iconClassName,
  title,
  meta,
  actions,
  className,
}: {
  icon?: ReactNode;
  iconClassName?: string;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-sand-100 px-4 py-2.5 first:border-t-0 dark:border-sand-800',
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            iconClassName,
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-sand-900 dark:text-sand-100">{title}</p>
        {meta ? (
          <p className="tabular truncate text-xs text-sand-500 dark:text-sand-400">{meta}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  );
}
