'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buildHabitContext, calculateDayCompletion } from '@/lib/calculations/habits';
import { todayString } from '@/lib/calculations/dates';

export interface SidebarCounters {
  /** Hábitos previstos para hoy que todavía no están cumplidos. */
  pendingHabitsToday: number;
  /** Objetivos en estado pendiente o en progreso. */
  activeGoals: number;
  /** true si todavía no se cargaron los pasos de hoy. */
  stepsMissingToday: boolean;
}

const EMPTY: SidebarCounters = {
  pendingHabitsToday: 0,
  activeGoals: 0,
  stepsMissingToday: false,
};

/**
 * Contadores del menú lateral. Consulta solo el día de hoy, así el costo
 * es mínimo aunque se monte en todas las pantallas.
 */
export function useSidebarCounters(): SidebarCounters {
  const supabase = useMemo(() => createClient(), []);
  const [counters, setCounters] = useState<SidebarCounters>(EMPTY);
  const today = todayString();

  const load = useCallback(async () => {
    const [habitsResult, recordsResult, stepsResult, goalsResult] = await Promise.all([
      supabase.from('habits').select('*').eq('active', true),
      supabase
        .from('habit_records')
        .select('id,user_id,habit_id,date,completed,value,created_at,updated_at')
        .eq('date', today),
      supabase
        .from('step_records')
        .select('id,user_id,date,steps,created_at,updated_at')
        .eq('date', today),
      supabase
        .from('goals')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']),
    ]);

    const habits = habitsResult.data ?? [];
    const context = buildHabitContext(recordsResult.data ?? [], stepsResult.data ?? []);
    const day = calculateDayCompletion(habits, today, context);

    setCounters({
      pendingHabitsToday: Math.max(0, day.expected - day.completed),
      activeGoals: goalsResult.count ?? 0,
      stepsMissingToday: (stepsResult.data ?? []).length === 0,
    });
  }, [supabase, today]);

  useEffect(() => {
    void load();
  }, [load]);

  return counters;
}
