'use client';

import { useMemo, useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useStepRecords } from '@/hooks/useStepRecords';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { StepsForm } from '@/components/health/StepsForm';
import { StepsChart } from '@/components/health/StepsChart';
import { StatCard, StatGrid } from '@/components/dashboard/DashboardStats';
import { summarizeSteps, calculateStepCompletion } from '@/lib/calculations/steps';
import { addDays, formatDate, formatNumber, formatPercent, toDateString } from '@/lib/calculations/dates';
import type { StepRecord } from '@/types/database';

type Period = '7' | '30' | '90';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7', label: '7 días' },
  { value: '30', label: '30 días' },
  { value: '90', label: '3 meses' },
];

export default function PasosPage() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>('7');

  // Se consulta siempre al menos 30 días para promedios, o el período elegido.
  const days = Math.max(Number(period), 30);
  const from = useMemo(() => toDateString(addDays(new Date(), -(days - 1))), [days]);

  const { records, loading, error, saveSteps, deleteSteps } = useStepRecords({ from });
  const [editing, setEditing] = useState<StepRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StepRecord | null>(null);

  const dailyGoal = profile?.daily_steps_goal ?? 10000;
  const summary = summarizeSteps(records, dailyGoal);
  const goalReached = summary.todaySteps >= dailyGoal;
  const descending = [...records].reverse();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Pasos
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Objetivo diario: <span className="tabular">{formatNumber(dailyGoal)}</span> pasos.
        </p>
      </header>

      <Card>
        <CardHeader title="Registrar pasos" />
        <CardContent>
          <StepsForm dailyGoal={dailyGoal} onSave={saveSteps} />
        </CardContent>
      </Card>

      {error ? <ErrorState message={error} /> : null}

      <StatGrid>
        <StatCard
          label="Pasos de hoy"
          value={formatNumber(summary.todaySteps)}
          detail={
            <span className="flex items-center gap-2">
              <span className="tabular">
                {formatNumber(summary.todaySteps)} / {formatNumber(dailyGoal)} ·{' '}
                {formatPercent(summary.todayPercent)}
              </span>
              {goalReached ? (
                <Badge tone="success">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Alcanzado
                </Badge>
              ) : null}
            </span>
          }
          progress={summary.todayPercent}
          accent="sage"
        />
        <StatCard
          label="Promedio 7 días"
          value={formatNumber(summary.average7)}
          unit="pasos"
          accent="sage"
        />
        <StatCard
          label="Promedio 30 días"
          value={formatNumber(summary.average30)}
          unit="pasos"
          accent="sage"
        />
        <StatCard
          label="Mejor día"
          value={summary.bestDay ? formatNumber(summary.bestDay.steps) : '—'}
          detail={
            summary.bestDay
              ? `${formatDate(summary.bestDay.date)} · ${summary.goalDaysTotal} días con objetivo`
              : 'Sin registros'
          }
          accent="sage"
        />
      </StatGrid>

      <Card>
        <CardHeader
          title="Evolución"
          description={`${summary.goalDays7} de los últimos 7 días alcanzaron el objetivo`}
          action={
            <Tabs items={PERIODS} value={period} onChange={setPeriod} ariaLabel="Período del gráfico" />
          }
        />
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : (
            <StepsChart records={records} dailyGoal={dailyGoal} days={Number(period)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Registros" description={`Últimos ${days} días`} />
        <CardContent className="p-0">
          {descending.length === 0 ? (
            <EmptyState
              title="No hay registros todavía"
              description="Cargá los pasos de hoy para empezar."
            />
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {descending.map((record) => {
                const percent = calculateStepCompletion(record.steps, dailyGoal);
                return (
                  <li key={record.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="tabular text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {formatNumber(record.steps)} pasos
                      </p>
                      <p className="tabular text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(record.date)} · {formatPercent(percent)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {record.steps >= dailyGoal ? <Badge tone="success">Objetivo</Badge> : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar registro del ${formatDate(record.date)}`}
                        onClick={() => setEditing(record)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar registro del ${formatDate(record.date)}`}
                        onClick={() => setPendingDelete(record)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar registro">
        <StepsForm
          dailyGoal={dailyGoal}
          initialDate={editing?.date}
          initialSteps={editing ? String(editing.steps) : ''}
          submitLabel="Guardar cambios"
          onSave={saveSteps}
          onSaved={() => setEditing(null)}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar registro"
        description={`Se van a eliminar los pasos del ${pendingDelete ? formatDate(pendingDelete.date) : ''}.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteSteps(pendingDelete.id);
          setPendingDelete(null);
          toast('Registro eliminado');
        }}
      />
    </div>
  );
}
