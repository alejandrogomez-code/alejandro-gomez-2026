'use client';

import { useMemo, useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitStats } from '@/components/habits/HabitStats';
import { WeeklyHabitSummary } from '@/components/habits/WeeklyHabitSummary';
import {
  buildHabitContext,
  calculateHabitCompletion,
  calculateWeeklyCompletion,
  getHabitDayState,
} from '@/lib/calculations/habits';
import { addDays, startOfWeek, toDateString, todayString } from '@/lib/calculations/dates';
import type { Habit } from '@/types/database';

export default function HabitosPage() {
  const { toast } = useToast();
  const { habits, activeHabits, loading, error, createHabit, updateHabit, deleteHabit } = useHabits();
  const { goals } = useGoals();

  // 26 semanas para poder dibujar el histórico más largo.
  const historyFrom = useMemo(() => toDateString(addDays(startOfWeek(new Date()), -7 * 26)), []);
  const { records: habitRecords, setRecord } = useHabitRecords({ from: historyFrom });
  const { records: stepRecords } = useStepRecords({ from: historyFrom });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);

  const today = todayString();
  const weekStart = startOfWeek(new Date());
  const weekFrom = toDateString(weekStart);
  const weekTo = toDateString(addDays(weekStart, 6));

  const context = useMemo(
    () => buildHabitContext(habitRecords, stepRecords),
    [habitRecords, stepRecords],
  );

  const weeklyCompletion = useMemo(
    () => calculateWeeklyCompletion(activeHabits, weekFrom, weekTo, context),
    [activeHabits, weekFrom, weekTo, context],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleToggle(habit: Habit, next: boolean) {
    await setRecord({ habitId: habit.id, date: today, completed: next });
    toast(next ? `${habit.name}: marcado como hecho` : `${habit.name}: desmarcado`);
  }

  async function handleValue(habit: Habit, value: number) {
    const target = habit.target_value ?? 0;
    await setRecord({
      habitId: habit.id,
      date: today,
      completed: target > 0 ? value >= target : value > 0,
      value,
    });
    toast('Hábito actualizado');
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
            Hábitos
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Solo cuentan los días previstos por cada hábito.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo hábito
        </Button>
      </header>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState /> : null}

      {!loading && habits.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-8 w-8" aria-hidden="true" />}
          title="No hay hábitos todavía"
          description="Creá tu primer hábito para empezar a medir tu cumplimiento semanal."
          action={<Button onClick={openCreate}>Registrar ahora</Button>}
        />
      ) : null}

      {habits.length > 0 ? (
        <>
          <WeeklyHabitSummary
            completion={weeklyCompletion}
            description="Instancias cumplidas sobre instancias previstas."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => {
              const weekly = calculateHabitCompletion(habit, weekFrom, weekTo, context);
              const goal = goals.find((entry) => entry.id === habit.goal_id);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  state={getHabitDayState(habit, today, context)}
                  weeklyPercent={weekly.percentage}
                  weeklyLabel={`${weekly.completed}/${weekly.expected}`}
                  goalName={goal?.name ?? null}
                  onToggle={(target, next) => void handleToggle(target, next)}
                  onValueChange={(target, value) => void handleValue(target, value)}
                  onEdit={(target) => {
                    setEditing(target);
                    setFormOpen(true);
                  }}
                  onDelete={setPendingDelete}
                />
              );
            })}
          </div>

          <HabitStats
            habits={activeHabits}
            habitRecords={habitRecords}
            stepRecords={stepRecords}
          />
        </>
      ) : null}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar hábito' : 'Nuevo hábito'}
      >
        <HabitForm
          habit={editing}
          goals={goals}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateHabit(editing.id, values);
              toast('Hábito actualizado');
            } else {
              await createHabit(values);
              toast('Hábito creado');
            }
            setFormOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar hábito"
        description={`Se va a eliminar "${pendingDelete?.name ?? ''}" y todos sus registros.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteHabit(pendingDelete.id);
          setPendingDelete(null);
          toast('Hábito eliminado');
        }}
      />
    </div>
  );
}
