import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { ACCENTS } from '@/lib/accents';
import { formatDate, formatPercent, formatShortDate } from '@/lib/calculations/dates';
import { PROJECT_STATUS_LABELS, compareTasks, summarizeTasks } from '@/lib/calculations/projects';
import { TaskCountBadges } from './TaskCountBadges';
import type { TaskBrief } from '@/hooks/useProjects';
import type { Project } from '@/types/database';

export function ProjectCard({ project, tasks }: { project: Project; tasks: TaskBrief[] }) {
  const theme = ACCENTS[project.color];
  const summary = summarizeTasks(tasks);
  const nextTask = tasks
    .filter((task) => task.status !== 'completed' && task.due_date)
    .sort(compareTasks)[0];

  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
    >
      <Card
        className={cn(
          'relative h-full overflow-hidden p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-float',
          project.status === 'archived' ? 'opacity-70' : '',
        )}
      >
        <span className={cn('absolute inset-y-0 left-0 w-1.5', theme.bar)} aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-mist-900 dark:text-mist-100">
              {project.name}
            </h3>
            {project.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-mist-500 dark:text-mist-400">
                {project.description}
              </p>
            ) : null}
          </div>
          <span className={cn('tabular shrink-0 text-2xl font-medium tracking-tight', theme.text)}>
            {formatPercent(summary.percentage, 0)}
          </span>
        </div>

        <Progress
          value={summary.percentage}
          className="mt-4"
          barClassName={theme.bar}
          label={`Progreso de ${project.name}`}
        />

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {project.status !== 'active' ? (
            <Badge tone={project.status === 'completed' ? 'success' : 'neutral'}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          ) : null}
          <TaskCountBadges summary={summary} />
          {summary.total === 0 ? <Badge>Sin tareas</Badge> : null}
        </div>

        <div className="mt-4 space-y-1 text-xs text-mist-500 dark:text-mist-400">
          {nextTask?.due_date ? (
            <p className="truncate">
              Próxima: <span className="text-mist-700 dark:text-mist-200">{nextTask.title}</span>
              <span className="tabular"> · {formatShortDate(nextTask.due_date)}</span>
            </p>
          ) : null}
          {project.target_date ? (
            <p className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Objetivo <span className="tabular">{formatDate(project.target_date)}</span>
            </p>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
