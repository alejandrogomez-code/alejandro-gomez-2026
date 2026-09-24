'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { useGoals } from '@/hooks/useGoals';
import { Card, CardContent, CardHeader, ListRow } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { WeightForm } from '@/components/health/WeightForm';
import { WeightChart } from '@/components/health/WeightChart';
import { HealthSummary } from '@/components/health/HealthSummary';
import { ACCENTS } from '@/lib/accents';
import { addDays, formatDate, formatNumber, toDateString } from '@/lib/calculations/dates';
import { calculateBMI, formatBMI } from '@/lib/calculations/bmi';
import type { WeightRecord } from '@/types/database';

type Period = '14' | '30' | '90' | '180' | 'all';

const PERIODS: { value: Period; label: string }[] = [
  { value: '14', label: '2 sem' },
  { value: '30', label: '1 mes' },
  { value: '90', label: '3 meses' },
  { value: '180', label: '6 meses' },
  { value: 'all', label: 'Todo' },
];

export default function PesoPage() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>('30');

  // Solo se consulta el período elegido.
  const from = useMemo(
    () => (period === 'all' ? undefined : toDateString(addDays(new Date(), -(Number(period) - 1)))),
    [period],
  );

  const { records, loading, error, saveWeight, deleteWeight } = useWeightRecords({ from });
  const { goals } = useGoals();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WeightRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WeightRecord | null>(null);

  // Si hay un objetivo cuantitativo en kg, se dibuja su línea de referencia.
  const weightGoal = goals.find(
    (goal) =>
      goal.type === 'quantitative' &&
      goal.target_value !== null &&
      (goal.unit ?? '').toLowerCase().includes('kg') &&
      goal.status !== 'cancelled',
  );

  const descending = [...records].reverse();

  /** Diferencia contra el registro anterior, para la píldora de cada fila. */
  function deltaFor(index: number): number | null {
    const previous = descending[index + 1];
    if (!previous) return null;
    return descending[index].weight_kg - previous.weight_kg;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-sand-900 dark:text-sand-100">
            Peso
          </h1>
          <p className="mt-0.5 text-sm text-sand-500 dark:text-sand-400">
            Un registro por día. Si cargás dos veces el mismo día, se actualiza.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar peso
        </Button>
      </header>

      {error ? <ErrorState message={error} /> : null}

      <HealthSummary
        records={records}
        heightCm={profile?.height_cm ?? null}
        initialWeightKg={profile?.initial_weight_kg ?? null}
      />

      <Card>
        <CardHeader
          title="Evolución"
          action={
            <Tabs items={PERIODS} value={period} onChange={setPeriod} ariaLabel="Período del gráfico" />
          }
        />
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : (
            <WeightChart records={records} targetWeight={weightGoal?.target_value ?? null} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Registros" description={`${records.length} en el período elegido`} />
        {descending.length === 0 ? (
          <EmptyState
            title="No hay registros todavía"
            description="Cargá tu peso para empezar el seguimiento."
            action={<Button onClick={() => setFormOpen(true)}>Registrar ahora</Button>}
          />
        ) : (
          descending.map((record, index) => {
            const bmi = calculateBMI(record.weight_kg, profile?.height_cm ?? null);
            const delta = deltaFor(index);
            return (
              <ListRow
                key={record.id}
                icon={<Scale className="h-4 w-4" />}
                iconClassName={ACCENTS.ocean.chip}
                title={`${formatNumber(record.weight_kg, 1)} kg`}
                meta={`${formatDate(record.date)} · IMC ${formatBMI(bmi)}`}
                actions={
                  <>
                    {delta === null ? null : (
                      <Badge tone={delta <= 0 ? 'brand' : 'clay'}>
                        {delta > 0 ? '+' : ''}
                        {formatNumber(delta, 1)} kg
                      </Badge>
                    )}
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

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Registrar peso">
        <WeightForm
          heightCm={profile?.height_cm ?? null}
          onSave={saveWeight}
          onSaved={() => setFormOpen(false)}
        />
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar registro">
        <WeightForm
          heightCm={profile?.height_cm ?? null}
          initialDate={editing?.date}
          initialWeight={editing ? String(editing.weight_kg) : ''}
          submitLabel="Guardar cambios"
          onSave={saveWeight}
          onSaved={() => setEditing(null)}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar registro"
        description={`Se va a eliminar el peso del ${pendingDelete ? formatDate(pendingDelete.date) : ''}.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteWeight(pendingDelete.id);
          setPendingDelete(null);
          toast('Registro eliminado');
        }}
      />
    </div>
  );
}
