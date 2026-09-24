'use client';

import { useMemo, useState } from 'react';
import { Check, Footprints, Pencil, Plus, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useStepRecords } from '@/hooks/useStepRecords';
import { Card, CardContent, CardHeader, ListRow } from '@/components/ui/Card';
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
import { ACCENTS } from '@/lib/accents';
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

  // Se consulta siempre al menos 30 días para los promedios.
  const days = Math.max(Number(period), 30);
  const from = useMemo(() => toDateString(addDays(new Date(), -(days - 1))), [days]);

  const { records, loading, error, saveSteps, deleteSteps } = useStepRecords({ from });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StepRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StepRecord | null>(null);

  const dailyGoal = profile?.daily_steps_goal ?? 10000;
  const summary = summarizeSteps(records, dailyGoal);
  const goalReached = summary.todaySteps >= dailyGoal;
  const descending = [...records].reverse();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-sand-900 dark:text-sand-100">
            Pasos
          </h1>
          <p className="mt-0.5 text-sm text-sand-500 dark:text-sand-400">
            Objetivo diario: <span className="tabular">{formatNumber(dailyGoal)}</span> pasos
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar pasos
        </Button>
      </header>

      {error ? <ErrorState message={error} /> : null}

      <StatGrid>
        <StatCard
          label="Hoy"
          value={formatNumber(summary.todaySteps)}
          note={formatPercent(summary.todayPercent, 0)}
          detail={goalReached ? 'objetivo alcanzado' : `de ${formatNumber(dailyGoal)}`}
          progress={summary.todayPercent}
          accent={goalReached ? 'brand' : 'amber'}
        />
        <StatCard
          label="Promedio 7 días"
          value={formatNumber(summary.average7)}
          detail="pasos por día"
          accent="brand"
        />
        <StatCard
          label="Promedio 30 días"
          value={formatNumber(summary.average30)}
          detail="pasos por día"
          accent="brand"
        />
        <StatCard
          label="Mejor día"
          value={summary.bestDay ? formatNumber(summary.bestDay.steps) : '—'}
          note={summary.bestDay ? `${summary.goalDaysTotal} con objetivo` : undefined}
          detail={summary.bestDay ? formatDate(summary.bestDay.date) : 'Sin registros'}
          accent="brand"
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
        {descending.length === 0 ? (
          <EmptyState
            title="No hay registros todavía"
            description="Cargá los pasos de hoy para empezar."
            action={<Button onClick={() => setFormOpen(true)}>Registrar ahora</Button>}
          />
        ) : (
          descending.map((record) => {
            const percent = calculateStepCompletion(record.steps, dailyGoal);
            const reached = record.steps >= dailyGoal;
            return (
              <ListRow
                key={record.id}
                icon={<Footprints className="h-4 w-4" />}
                iconClassName={reached ? ACCENTS.brand.chip : ACCENTS.amber.chip}
                title={`${formatNumber(record.steps)} pasos`}
                meta={`${formatDate(record.date)} · ${formatPercent(percent)}`}
                actions={
                  <>
                    <Badge tone={reached ? 'brand' : 'amber'}>
                      {reached ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                      {formatPercent(percent, 0)}
                    </Badge>
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
                  </>
                }
              />
            );
          })
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Registrar pasos">
        <StepsForm dailyGoal={dailyGoal} onSave={saveSteps} onSaved={() => setFormOpen(false)} />
      </Modal>

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
