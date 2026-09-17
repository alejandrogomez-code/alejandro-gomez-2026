'use client';

import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useMemo, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useHabits } from '@/hooks/useHabits';
import { useHabitRecords } from '@/hooks/useHabitRecords';
import { useStepRecords } from '@/hooks/useStepRecords';
import { HabitCalendar } from '@/components/habits/HabitCalendar';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { endOfMonth, startOfMonth, toDateString, todayString } from '@/lib/calculations/dates';
import type { Habit } from '@/types/database';

export default function CalendarioPage() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayString());

  // Solo se consulta el mes visible.
  const from = useMemo(() => toDateString(startOfMonth(month)), [month]);
  const to = useMemo(() => toDateString(endOfMonth(month)), [month]);

  const { activeHabits, loading: habitsLoading, error } = useHabits({ onlyActive: true });
  const { records: habitRecords, setRecord, loading: recordsLoading } = useHabitRecords({ from, to });
  const { records: stepRecords, loading: stepsLoading } = useStepRecords({ from, to });

  async function handleToggle(habit: Habit, date: string, next: boolean) {
    await setRecord({ habitId: habit.id, date, completed: next });
    toast(next ? `${habit.name}: marcado como hecho` : `${habit.name}: desmarcado`);
  }

  const loading = habitsLoading || recordsLoading || stepsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        accent="plum"
        title="Calendario"
        description={<>Elegí un día para ver el detalle y marcar hábitos.</>}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? (
        <LoadingState />
      ) : (
        <HabitCalendar
          month={month}
          onMonthChange={setMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          habits={activeHabits}
          habitRecords={habitRecords}
          stepRecords={stepRecords}
          dailyStepsGoal={profile?.daily_steps_goal ?? 10000}
          onToggleHabit={(habit, date, next) => void handleToggle(habit, date, next)}
        />
      )}
    </div>
  );
}
