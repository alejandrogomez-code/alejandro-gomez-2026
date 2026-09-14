'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { Habit, HabitInsert, HabitUpdate } from '@/types/database';

interface UseHabitsOptions {
  /** Si es true, trae solo los hábitos activos. */
  onlyActive?: boolean;
}

interface UseHabitsResult {
  habits: Habit[];
  activeHabits: Habit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createHabit: (values: Omit<HabitInsert, 'user_id'>) => Promise<Habit>;
  updateHabit: (id: string, values: HabitUpdate) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
}

export function useHabits({ onlyActive = false }: UseHabitsOptions = {}): UseHabitsResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('habits').select('*').order('created_at', { ascending: true });
    if (onlyActive) query = query.eq('active', true);

    const { data, error: queryError } = await query;
    if (queryError) {
      setError(queryError.message);
    } else {
      setHabits(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase, onlyActive]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createHabit = useCallback(
    async (values: Omit<HabitInsert, 'user_id'>) => {
      const { data, error: insertError } = await supabase
        .from('habits')
        .insert({ ...values, user_id: userId })
        .select('*')
        .single();

      if (insertError) throw new Error(insertError.message);
      setHabits((current) => [...current, data]);
      return data;
    },
    [supabase, userId],
  );

  const updateHabit = useCallback(
    async (id: string, values: HabitUpdate) => {
      const { data, error: updateError } = await supabase
        .from('habits')
        .update(values)
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) throw new Error(updateError.message);
      setHabits((current) => current.map((habit) => (habit.id === id ? data : habit)));
      return data;
    },
    [supabase],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('habits').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setHabits((current) => current.filter((habit) => habit.id !== id));
    },
    [supabase],
  );

  const activeHabits = useMemo(() => habits.filter((habit) => habit.active), [habits]);

  return { habits, activeHabits, loading, error, refresh, createHabit, updateHabit, deleteHabit };
}
