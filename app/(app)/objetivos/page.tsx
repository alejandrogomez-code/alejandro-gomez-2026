'use client';

import { useMemo, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { buildHabitContext, calculateWeeklyCompletion } from '@/lib/calculations/habits';
import { isGoalActive } from '@/lib/calculations/goals';
import { addDays, startOfWeek, toDateString } from '@/lib/calculations/dates';
import type { Goal, GoalStatus } from '@/types/database';

type Filter = 'active' | 'completed' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'completed', label: 'Completados' },
  { value: 'all', label: 'Todos' },
];

export default function ObjetivosPage() {
  const { toast } = useToast();
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
  const { habits } = useHabits();

  const weekStart = startOfWeek(new Date());
  const from = toDateString(weekStart);
  const to = toDateString(addDays(weekStart, 6));
  const { records: habitRecords } = useHabitRecords({ from, to });
  const { records: stepRecords } = useStepRecords({ from, to });

  const [filter, setFilter] = useState<Filter>('active');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Goal | null>(null);

  const context = useMemo(
    () => buildHabitContext(habitRecords, stepRecords),
    [habitRecords, stepRecords],
  );

  const visibleGoals = goals.filter((goal) => {
    if (filter === 'active') return isGoalActive(goal);
    if (filter === 'completed') return goal.status === 'completed';
    return true;
  });

  function linkedHabitsFor(goal: Goal) {
    return habits.filter((habit) => habit.goal_id === goal.id);
  }

  function linkedCompletionFor(goal: Goal): number | null {
    const linked = linkedHabitsFor(goal).filter((habit) => habit.active);
    if (linked.length === 0) return null;
    const result = calculateWeeklyCompletion(linked, from, to, context);
    return result.expected === 0 ? null : result.percentage;
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditing(goal);
    setFormOpen(true);
  }

  async function handleStatusChange(goal: Goal, status: GoalStatus) {
    await updateGoal(goal.id, { status });
    toast('Estado actualizado');
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-mist-900 dark:text-mist-100">
            Objetivos
          </h1>
          <p className="mt-1 text-sm text-mist-500 dark:text-mist-400">
            Lo que querés lograr, con su progreso y su fecha.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo objetivo
        </Button>
      </header>

      <Tabs items={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filtrar objetivos" />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && visibleGoals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-8 w-8" aria-hidden="true" />}
          title="No hay objetivos todavía"
          description="Creá tu primer objetivo para empezar a seguir su progreso."
          action={<Button onClick={openCreate}>Registrar ahora</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              linkedHabits={linkedHabitsFor(goal)}
              linkedCompletion={linkedCompletionFor(goal)}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar objetivo' : 'Nuevo objetivo'}
      >
        <GoalForm
          goal={editing}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateGoal(editing.id, values);
              toast('Objetivo actualizado');
            } else {
              await createGoal(values);
              toast('Objetivo creado');
            }
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar objetivo"
        description={`Se va a eliminar "${pendingDelete?.name ?? ''}". Los hábitos asociados quedan sin objetivo.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteGoal(pendingDelete.id);
          setPendingDelete(null);
          toast('Objetivo eliminado');
        }}
      />
    </div>
  );
}
