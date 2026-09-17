'use client';

import { Pencil, Scale, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useMemo, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { useGoals } from '@/hooks/useGoals';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { WeightForm } from '@/components/health/WeightForm';
import { WeightChart } from '@/components/health/WeightChart';
import { HealthSummary } from '@/components/health/HealthSummary';
import { addDays, formatDate, formatNumber, toDateString } from '@/lib/calculations/dates';
import { calculateBMI, formatBMI } from '@/lib/calculations/bmi';
import type { WeightRecord } from '@/types/database';

type Period = '14' | '30' | '90' | '180' | 'all';

const PERIODS: { value: Period; label: string }[] = [
  { value: '14', label: '2 semanas' },
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Scale}
        accent="ocean"
        title="Peso"
        description={<>Un registro por día. Si cargás dos veces el mismo día, se actualiza.</>}
      />

      <Card>
        <CardHeader title="Registrar peso" />
        <CardContent>
          <WeightForm heightCm={profile?.height_cm ?? null} onSave={saveWeight} />
        </CardContent>
      </Card>

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
        <CardContent className="p-0">
          {descending.length === 0 ? (
            <EmptyState
              title="No hay registros todavía"
              description="Cargá tu peso arriba para empezar el seguimiento."
            />
          ) : (
            <ul className="divide-y divide-mist-100 dark:divide-mist-800">
              {descending.map((record) => {
                const bmi = calculateBMI(record.weight_kg, profile?.height_cm ?? null);
                return (
                  <li
                    key={record.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="tabular text-sm font-medium text-mist-900 dark:text-mist-100">
                        {formatNumber(record.weight_kg, 1)} kg
                      </p>
                      <p className="tabular text-xs text-mist-500 dark:text-mist-400">
                        {formatDate(record.date)} · IMC {formatBMI(bmi)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
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
