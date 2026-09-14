'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { Goal, GoalInsert, GoalUpdate } from '@/types/database';

interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGoal: (values: Omit<GoalInsert, 'user_id'>) => Promise<Goal>;
  updateGoal: (id: string, values: GoalUpdate) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
}

export function useGoals(): UseGoalsResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setGoals(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createGoal = useCallback(
    async (values: Omit<GoalInsert, 'user_id'>) => {
      const { data, error: insertError } = await supabase
        .from('goals')
        .insert({ ...values, user_id: userId })
        .select('*')
        .single();

      if (insertError) throw new Error(insertError.message);
      setGoals((current) => [data, ...current]);
      return data;
    },
    [supabase, userId],
  );

  const updateGoal = useCallback(
    async (id: string, values: GoalUpdate) => {
      const { data, error: updateError } = await supabase
        .from('goals')
        .update(values)
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) throw new Error(updateError.message);
      setGoals((current) => current.map((goal) => (goal.id === id ? data : goal)));
      return data;
    },
    [supabase],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('goals').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setGoals((current) => current.filter((goal) => goal.id !== id));
    },
    [supabase],
  );

  return { goals, loading, error, refresh, createGoal, updateGoal, deleteGoal };
}
