'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { isProjectOpen, summarizeTasks } from '@/lib/calculations/projects';
import type { TaskBrief } from '@/hooks/useProjects';

type Filter = 'open' | 'completed' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'open', label: 'En curso' },
  { value: 'completed', label: 'Completados' },
  { value: 'all', label: 'Todos' },
];

export default function ProyectosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { projects, tasks, loading, error, createProject } = useProjects();
  const [filter, setFilter] = useState<Filter>('open');
  const [formOpen, setFormOpen] = useState(false);

  const tasksByProject = useMemo(() => {
    const map = new Map<string, TaskBrief[]>();
    for (const task of tasks) {
      const list = map.get(task.project_id) ?? [];
      list.push(task);
      map.set(task.project_id, list);
    }
    return map;
  }, [tasks]);

  const openProjects = projects.filter(isProjectOpen);
  const openTasks = summarizeTasks(
    tasks.filter((task) => openProjects.some((project) => project.id === task.project_id)),
  );

  const visible = projects.filter((project) => {
    if (filter === 'open') return isProjectOpen(project);
    if (filter === 'completed') return project.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FolderKanban}
        accent="coral"
        title="Proyectos"
        description="Dividí cada proyecto en etapas y seguí sus tareas."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo proyecto
          </Button>
        }
      />

      {!loading && projects.length > 0 ? (
        <StatGrid>
          <StatCard label="En curso" value={openProjects.length} accent="coral" />
          <StatCard label="Tareas pendientes" value={openTasks.pending} accent="honey" />
          <StatCard label="En proceso" value={openTasks.inProgress} accent="ocean" />
          <StatCard
            label="Vencidas"
            value={openTasks.overdue}
            accent={openTasks.overdue > 0 ? 'coral' : 'sage'}
            detail={openTasks.overdue > 0 ? 'Revisalas primero' : 'Todo al día'}
          />
        </StatGrid>
      ) : null}

      <Tabs items={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filtrar proyectos" />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && visible.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" aria-hidden="true" />}
          title={projects.length === 0 ? 'Todavía no hay proyectos' : 'No hay proyectos en este filtro'}
          description={
            projects.length === 0
              ? 'Creá un proyecto, sumale etapas y cargá las tareas de cada una.'
              : undefined
          }
          action={
            projects.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>Crear proyecto</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasksByProject.get(project.id) ?? []}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Nuevo proyecto">
        <ProjectForm
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            const created = await createProject(values);
            toast('Proyecto creado');
            setFormOpen(false);
            router.push(`/proyectos/${created.id}`);
          }}
        />
      </Modal>
    </div>
  );
}
