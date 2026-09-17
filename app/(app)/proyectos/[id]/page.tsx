'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, FolderKanban, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { Tabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { StageForm } from '@/components/projects/StageForm';
import { StageSection } from '@/components/projects/StageSection';
import { TaskForm } from '@/components/projects/TaskForm';
import { TaskCountBadges } from '@/components/projects/TaskCountBadges';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { daysRemainingLabel } from '@/lib/calculations/goals';
import { formatDate, formatPercent } from '@/lib/calculations/dates';
import {
  DEFAULT_STAGES,
  PROJECT_STATUS_LABELS,
  compareTasks,
  isTaskOverdue,
  plural,
  summarizeTasks,
} from '@/lib/calculations/projects';
import type { ProjectStage, ProjectTask, TaskStatus } from '@/types/database';

type Filter = 'all' | 'open' | TaskStatus | 'overdue';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'open', label: 'Sin terminar' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'completed', label: 'Completas' },
];

function matchesFilter(task: ProjectTask, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'open') return task.status !== 'completed';
  if (filter === 'overdue') return isTaskOverdue(task);
  return task.status === filter;
}

type StageDialog = { mode: 'create' } | { mode: 'rename'; stage: ProjectStage } | null;
type TaskDialog = { stageId: string; task: ProjectTask | null } | null;

export default function ProyectoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const {
    project,
    stages,
    tasks,
    loading,
    error,
    notFound,
    updateProject,
    deleteProject,
    createStages,
    renameStage,
    moveStage,
    deleteStage,
    createTask,
    updateTask,
    deleteTask,
  } = useProject(params.id);

  const [filter, setFilter] = useState<Filter>('all');
  const [editingProject, setEditingProject] = useState(false);
  const [confirmProjectDelete, setConfirmProjectDelete] = useState(false);
  const [stageDialog, setStageDialog] = useState<StageDialog>(null);
  const [pendingStageDelete, setPendingStageDelete] = useState<ProjectStage | null>(null);
  const [taskDialog, setTaskDialog] = useState<TaskDialog>(null);
  const [pendingTaskDelete, setPendingTaskDelete] = useState<ProjectTask | null>(null);
  const [seeding, setSeeding] = useState(false);

  const tasksByStage = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    for (const task of [...tasks].sort(compareTasks)) {
      const list = map.get(task.stage_id) ?? [];
      list.push(task);
      map.set(task.stage_id, list);
    }
    return map;
  }, [tasks]);

  const summary = summarizeTasks(tasks);

  async function run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      if (success) toast(success);
    } catch (actionError) {
      toast(actionError instanceof Error ? actionError.message : 'No se pudo completar la acción.', 'error');
    }
  }

  async function handleStatusChange(task: ProjectTask, status: TaskStatus) {
    await run(
      () => updateTask(task.id, { status }),
      status === 'completed' ? `"${task.title}" completa` : undefined,
    );
  }

  if (loading) return <LoadingState label="Cargando proyecto…" />;

  if (notFound || !project) {
    return (
      <div className="space-y-6">
        {error ? <ErrorState message={error} /> : null}
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" aria-hidden="true" />}
          title="No encontramos este proyecto"
          description="Puede que se haya eliminado."
          action={
            <Link href="/proyectos">
              <Button>Ver proyectos</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const theme = ACCENTS[project.color];
  const remaining = project.status === 'completed' ? null : daysRemainingLabel(project.target_date);

  return (
    <div className="space-y-6">
      <Link
        href="/proyectos"
        className="inline-flex items-center gap-1.5 text-sm text-mist-500 hover:text-mist-900 dark:text-mist-400 dark:hover:text-mist-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Proyectos
      </Link>

      <Card className="relative overflow-hidden">
        <div className={cn('h-2', theme.bar)} aria-hidden="true" />
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', theme.solid)}
                aria-hidden="true"
              >
                <FolderKanban className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-medium tracking-tight text-mist-900 dark:text-mist-100">
                  {project.name}
                </h1>
                {project.description ? (
                  <p className="mt-1 whitespace-pre-line text-sm text-mist-500 dark:text-mist-400">
                    {project.description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" aria-label="Editar proyecto" onClick={() => setEditingProject(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Eliminar proyecto"
                className="hover:text-red-600 dark:hover:text-red-400"
                onClick={() => setConfirmProjectDelete(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-mist-500 dark:text-mist-400">
                {summary.total === 0
                  ? 'Todavía no hay tareas'
                  : `${summary.completed} de ${plural(summary.total, 'tarea completa', 'tareas completas')}`}
              </span>
              <span className={cn('tabular text-3xl font-medium tracking-tight', theme.text)}>
                {formatPercent(summary.percentage, 0)}
              </span>
            </div>
            <Progress
              value={summary.percentage}
              className="mt-2 h-2.5"
              barClassName={theme.bar}
              label="Progreso del proyecto"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={project.status === 'completed' ? 'success' : project.status === 'active' ? 'accent' : 'neutral'}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
            <TaskCountBadges summary={summary} />
            {project.target_date ? (
              <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-mist-500 dark:text-mist-400">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                <span className="tabular">{formatDate(project.target_date)}</span>
                {remaining ? <span>· {remaining}</span> : null}
              </span>
            ) : null}
          </div>

          {summary.total > 0 && summary.completed === summary.total && project.status === 'active' ? (
            <div className={cn('flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 text-sm', ACCENTS.sage.soft)}>
              <span className="text-sage-800 dark:text-sage-200">Todas las tareas están completas.</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void run(() => updateProject({ status: 'completed' }), 'Proyecto completado')}
              >
                Marcar proyecto como completado
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {error ? <ErrorState message={error} /> : null}

      {stages.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Layers className="h-8 w-8" aria-hidden="true" />}
            title="Este proyecto no tiene etapas"
            description={`Creá las tuyas o empezá con ${DEFAULT_STAGES.join(', ')}.`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => setStageDialog({ mode: 'create' })}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nueva etapa
                </Button>
                <Button
                  variant="secondary"
                  loading={seeding}
                  onClick={async () => {
                    setSeeding(true);
                    await run(() => createStages(DEFAULT_STAGES), 'Etapas creadas');
                    setSeeding(false);
                  }}
                >
                  Usar etapas sugeridas
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Tabs items={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filtrar tareas" className="min-w-max" />
            </div>
            <Button variant="secondary" onClick={() => setStageDialog({ mode: 'create' })}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva etapa
            </Button>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => {
              const stageTasks = tasksByStage.get(stage.id) ?? [];
              return (
                <StageSection
                  key={stage.id}
                  stage={stage}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === stages.length - 1}
                  color={project.color}
                  tasks={stageTasks}
                  visibleTasks={stageTasks.filter((task) => matchesFilter(task, filter))}
                  filtered={filter !== 'all'}
                  onQuickAdd={async (target, title, dueDate) => {
                    try {
                      await createTask({ stage_id: target.id, title, due_date: dueDate });
                    } catch (addError) {
                      toast(addError instanceof Error ? addError.message : 'No se pudo agregar.', 'error');
                      throw addError;
                    }
                  }}
                  onStatusChange={handleStatusChange}
                  onEditTask={(task) => setTaskDialog({ stageId: task.stage_id, task })}
                  onDeleteTask={setPendingTaskDelete}
                  onRename={(target) => setStageDialog({ mode: 'rename', stage: target })}
                  onMove={(target, direction) => void run(() => moveStage(target.id, direction))}
                  onDelete={setPendingStageDelete}
                />
              );
            })}
          </div>
        </>
      )}

      <Modal open={editingProject} onClose={() => setEditingProject(false)} title="Editar proyecto">
        <ProjectForm
          project={project}
          onCancel={() => setEditingProject(false)}
          onSubmit={async (values) => {
            await updateProject(values);
            toast('Proyecto actualizado');
            setEditingProject(false);
          }}
        />
      </Modal>

      <Modal
        open={stageDialog !== null}
        onClose={() => setStageDialog(null)}
        title={stageDialog?.mode === 'rename' ? 'Renombrar etapa' : 'Nueva etapa'}
        description={stageDialog?.mode === 'create' ? 'Se agrega al final del proyecto.' : undefined}
      >
        {stageDialog ? (
          <StageForm
            key={stageDialog.mode === 'rename' ? stageDialog.stage.id : 'new'}
            initialName={stageDialog.mode === 'rename' ? stageDialog.stage.name : ''}
            submitLabel={stageDialog.mode === 'rename' ? 'Guardar' : 'Crear etapa'}
            onCancel={() => setStageDialog(null)}
            onSubmit={async (name) => {
              if (stageDialog.mode === 'rename') {
                await renameStage(stageDialog.stage.id, name);
                toast('Etapa renombrada');
              } else {
                await createStages([name]);
                toast('Etapa creada');
              }
              setStageDialog(null);
            }}
          />
        ) : null}
      </Modal>

      <Modal
        open={taskDialog !== null}
        onClose={() => setTaskDialog(null)}
        title={taskDialog?.task ? 'Editar tarea' : 'Nueva tarea'}
      >
        {taskDialog ? (
          <TaskForm
            key={taskDialog.task?.id ?? taskDialog.stageId}
            task={taskDialog.task}
            stages={stages}
            defaultStageId={taskDialog.stageId}
            onCancel={() => setTaskDialog(null)}
            onSubmit={async (values) => {
              if (taskDialog.task) {
                await updateTask(taskDialog.task.id, values);
                toast('Tarea actualizada');
              } else {
                await createTask(values);
                toast('Tarea agregada');
              }
              setTaskDialog(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmProjectDelete}
        title="Eliminar proyecto"
        description={`Se va a eliminar "${project.name}" con todas sus etapas y tareas.`}
        onCancel={() => setConfirmProjectDelete(false)}
        onConfirm={async () => {
          await run(async () => {
            await deleteProject();
            router.push('/proyectos');
          }, 'Proyecto eliminado');
        }}
      />

      <ConfirmDialog
        open={pendingStageDelete !== null}
        title="Eliminar etapa"
        description={`Se va a eliminar "${pendingStageDelete?.name ?? ''}" y sus ${
          tasksByStage.get(pendingStageDelete?.id ?? '')?.length ?? 0
        } tareas.`}
        onCancel={() => setPendingStageDelete(null)}
        onConfirm={async () => {
          if (!pendingStageDelete) return;
          await run(() => deleteStage(pendingStageDelete.id), 'Etapa eliminada');
          setPendingStageDelete(null);
        }}
      />

      <ConfirmDialog
        open={pendingTaskDelete !== null}
        title="Eliminar tarea"
        description={`Se va a eliminar "${pendingTaskDelete?.title ?? ''}".`}
        onCancel={() => setPendingTaskDelete(null)}
        onConfirm={async () => {
          if (!pendingTaskDelete) return;
          await run(() => deleteTask(pendingTaskDelete.id), 'Tarea eliminada');
          setPendingTaskDelete(null);
        }}
      />
    </div>
  );
}
