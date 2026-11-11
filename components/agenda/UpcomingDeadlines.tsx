'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { DueBadge } from './DueBadge';
import { useRows } from '@/hooks/useRows';
import { ACCENTS } from '@/lib/accents';
import { AREAS } from '@/lib/areas';
import { cn } from '@/lib/utils';
import type { WorkArea } from '@/types/database';

/** Las próximas fechas a tener en cuenta, de un área o de todas. */
export function UpcomingDeadlines({
  area,
  limit = 5,
  title = 'Próximas fechas',
  href,
}: {
  area?: WorkArea;
  limit?: number;
  title?: string;
  href?: string;
}) {
  const { rows, loading } = useRows('deadlines', {
    eq: area ? { area, done: false } : { done: false },
    order: [{ column: 'due_date', ascending: true }],
  });
  const upcoming = rows.slice(0, limit);

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-500 hover:text-brand-700 dark:text-brand-300"
            >
              Ver todo
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null
        }
      />
      <CardContent>
        {loading ? (
          <LoadingState className="py-4" />
        ) : upcoming.length === 0 ? (
          <EmptyState title="Sin fechas próximas" className="py-6" />
        ) : (
          <ul className="space-y-2">
            {upcoming.map((deadline) => {
              const meta = AREAS[deadline.area];
              return (
                <li key={deadline.id} className="flex items-center gap-3">
                  <span
                    className={cn('h-8 w-1.5 shrink-0 rounded-full', ACCENTS[meta.accent].chip)}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-sand-900 dark:text-sand-100">
                      {deadline.title}
                    </span>
                    {!area ? <span className="text-xs text-sand-500">{meta.label}</span> : null}
                  </span>
                  <DueBadge date={deadline.due_date} soonDays={deadline.remind_days} />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
