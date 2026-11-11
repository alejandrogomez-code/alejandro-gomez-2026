'use client';

import { useState } from 'react';
import { Check, Footprints, ListChecks, Scale, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { WeightForm } from '@/components/health/WeightForm';
import { StepsForm } from '@/components/health/StepsForm';
import { GoalForm } from '@/components/goals/GoalForm';
import { cn } from '@/lib/utils';
import { formatNumber, todayString } from '@/lib/calculations/dates';
import type { HabitDayState } from '@/lib/calculations/habits';
import type { Goal, GoalInsert, Habit } from '@/types/database';

type ActionKey = 'weight' | 'steps' | 'habit' | 'goal';

export interface QuickActionsProps {
  heightCm: number | null;
  dailyStepsGoal: number;
  todayHabits: { habit: Habit; state: HabitDayState }[];
  onSaveWeight: (date: string, weightKg: number) => Promise<unknown>;
  onSaveSteps: (date: string, steps: number) => Promise<unknown>;
  onToggleHabit: (habit: Habit, date: string, next: boolean) => Promise<unknown>;
  onCreateGoal: (values: Omit<GoalInsert, 'user_id'>) => Promise<Goal>;
}

const ACTIONS: { key: ActionKey; label: string; icon: typeof Scale; className: string }[] = [
  { key: 'weight', label: 'Peso', icon: Scale, className: 'bg-ocean-300 hover:bg-ocean-200' },
  { key: 'steps', label: 'Pasos', icon: Footprints, className: 'bg-clay-300 hover:bg-clay-200' },
  { key: 'habit', label: 'Hábito', icon: ListChecks, className: 'bg-plum-300 hover:bg-plum-200' },
  { key: 'goal', label: 'Objetivo', icon: Target, className: 'bg-amber-300 hover:bg-amber-200' },
];

/** Todo se registra desde el panel, sin navegar a otra pantalla. */
export function QuickActions({
  heightCm,
  dailyStepsGoal,
  todayHabits,
  onSaveWeight,
  onSaveSteps,
  onToggleHabit,
  onCreateGoal,
}: QuickActionsProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState<ActionKey | null>(null);
  const today = todayString();

  async function handleToggle(habit: Habit, next: boolean) {
    await onToggleHabit(habit, today, next);
    toast(next ? `${habit.name}: marcado como hecho` : `${habit.name}: desmarcado`);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => setOpen(action.key)}
              className={cn(
                'inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold text-brand-900 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-800',
                action.className,
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {action.label}
            </button>
          );
        })}
      </div>

      <Modal
        open={open === 'weight'}
        onClose={() => setOpen(null)}
        title="Registrar peso"
        description="Si ya cargaste el peso de ese día, se actualiza."
      >
        <WeightForm heightCm={heightCm} onSave={onSaveWeight} onSaved={() => setOpen(null)} />
      </Modal>

      <Modal
        open={open === 'steps'}
        onClose={() => setOpen(null)}
        title="Registrar pasos"
        description="Si ya cargaste los pasos de ese día, se actualizan."
      >
        <StepsForm
          dailyGoal={dailyStepsGoal}
          onSave={onSaveSteps}
          onSaved={() => setOpen(null)}
        />
      </Modal>

      <Modal
        open={open === 'habit'}
        onClose={() => setOpen(null)}
        title="Hábitos de hoy"
        description="Tocá un hábito para marcarlo o desmarcarlo."
      >
        {todayHabits.length === 0 ? (
          <EmptyState title="Hoy no hay hábitos previstos" />
        ) : (
          <ul className="space-y-2">
            {todayHabits.map(({ habit, state }) => (
              <li key={habit.id}>
                <button
                  type="button"
                  disabled={state.fromSteps}
                  aria-pressed={state.completed}
                  onClick={() => void handleToggle(habit, !state.completed)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                    state.completed
                      ? 'border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900'
                      : 'border-sand-200 text-sand-700 hover:bg-sand-50 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800/60',
                    state.fromSteps ? 'cursor-default opacity-80' : '',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                      state.completed
                        ? 'border-transparent bg-white/20'
                        : 'border-sand-300 dark:border-sand-600',
                    )}
                  >
                    {state.completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{habit.name}</span>
                  {state.fromSteps ? (
                    <span className="tabular shrink-0 text-xs opacity-70">
                      {state.value === null ? 'sin pasos' : formatNumber(state.value)}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal open={open === 'goal'} onClose={() => setOpen(null)} title="Nuevo objetivo">
        <GoalForm
          onCancel={() => setOpen(null)}
          onSubmit={async (values) => {
            await onCreateGoal(values);
            toast('Objetivo creado');
            setOpen(null);
          }}
        />
      </Modal>
    </>
  );
}

