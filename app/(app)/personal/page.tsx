'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { TaskList } from '@/components/agenda/TaskList';
import { UpcomingDeadlines } from '@/components/agenda/UpcomingDeadlines';
import { useRows } from '@/hooks/useRows';
import { AREAS } from '@/lib/areas';

export default function PersonalPage() {
  const { rows: books } = useRows('books', { order: [{ column: 'updated_at', ascending: false }] });
  const reading = books.filter((book) => book.status === 'leyendo');
  const year = String(new Date().getFullYear());
  const readThisYear = books.filter((book) => book.status === 'leido' && book.finished_on?.startsWith(year)).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Personal"
        description="Casa, trámites, familia, lecturas y notas."
        icon={AREAS.personal.icon}
        accent={AREAS.personal.accent}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TaskList
          area="personal"
          title="Pendientes personales"
          placeholder="Ej.: Renovar el registro"
        />

        <div className="space-y-5">
          <UpcomingDeadlines area="personal" title="Fechas importantes" href="/personal/fechas" />

          <Card className="bg-clay-300 dark:bg-clay-300">
            <CardHeader
              title={<span className="text-brand-900">Leyendo ahora</span>}
              action={
                <Link
                  href="/personal/lecturas"
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand-900 hover:underline"
                >
                  Lecturas
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              }
            />
            <CardContent className="text-brand-900">
              {reading.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-7 w-7 text-brand-900" aria-hidden="true" />}
                  title="No hay ningún libro en curso"
                  className="py-4 [&_p]:text-brand-900"
                />
              ) : (
                <ul className="space-y-2">
                  {reading.map((book) => (
                    <li key={book.id} className="rounded-2xl bg-white/50 px-3 py-2">
                      <p className="text-sm font-extrabold">{book.title}</p>
                      {book.author ? <p className="text-xs">{book.author}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-sm font-bold">
                {readThisYear} {readThisYear === 1 ? 'libro leído' : 'libros leídos'} en {year}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
