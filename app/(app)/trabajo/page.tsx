'use client';

import Link from 'next/link';
import { ArrowRight, FolderKanban } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { TaskList } from '@/components/agenda/TaskList';
import { UpcomingDeadlines } from '@/components/agenda/UpcomingDeadlines';
import { useProjects } from '@/hooks/useProjects';
import { AREAS } from '@/lib/areas';
import { ACCENTS, accentFor } from '@/lib/accents';

export default function TrabajoPage() {
  const { projects, tasks, loading } = useProjects();
  const active = projects.filter((project) => project.status === 'active' && (project.area ?? 'trabajo') === 'trabajo');

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trabajo"
        description="Pendientes, proyectos, vencimientos y reuniones."
        icon={AREAS.trabajo.icon}
        accent={AREAS.trabajo.accent}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TaskList area="trabajo" placeholder="Ej.: Mandar informe a los socios" />

        <div className="space-y-5">
          <UpcomingDeadlines area="trabajo" title="Próximos vencimientos" href="/trabajo/vencimientos" />

          <Card>
            <CardHeader
              title="Proyectos en curso"
              action={
                <Link
                  href="/proyectos"
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand-500 hover:text-brand-700 dark:text-brand-300"
                >
                  Ver todos
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              }
            />
            <CardContent>
              {loading ? (
                <LoadingState className="py-4" />
              ) : active.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban className="h-7 w-7" aria-hidden="true" />}
                  title="No hay proyectos en curso"
                  className="py-6"
                />
              ) : (
                <ul className="space-y-4">
                  {active.map((project) => {
                    const own = tasks.filter((task) => task.project_id === project.id);
                    const done = own.filter((task) => task.status === 'completed').length;
                    const percent = own.length === 0 ? 0 : (done / own.length) * 100;
                    return (
                      <li key={project.id}>
                        <Link href={`/proyectos/${project.id}`} className="block rounded-xl hover:opacity-80">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate font-bold text-sand-900 dark:text-sand-100">{project.name}</span>
                            <span className="tabular shrink-0 text-xs text-sand-500">
                              {done}/{own.length} tareas
                            </span>
                          </div>
                          <Progress
                            value={percent}
                            className="mt-2"
                            barClassName={accentFor(project.color).bar}
                            label={`Avance de ${project.name}`}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
