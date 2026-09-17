import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { plural, type TaskSummary } from '@/lib/calculations/projects';

/** Conteo por estado. Los estados sin tareas no se muestran. */
export function TaskCountBadges({ summary }: { summary: TaskSummary }) {
  return (
    <>
      {summary.pending > 0 ? (
        <Badge tone="honey">{plural(summary.pending, 'pendiente', 'pendientes')}</Badge>
      ) : null}
      {summary.inProgress > 0 ? <Badge tone="ocean">{summary.inProgress} en proceso</Badge> : null}
      {summary.completed > 0 ? (
        <Badge tone="success">{plural(summary.completed, 'completa', 'completas')}</Badge>
      ) : null}
      {summary.overdue > 0 ? (
        <Badge tone="danger">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {plural(summary.overdue, 'vencida', 'vencidas')}
        </Badge>
      ) : null}
    </>
  );
}
