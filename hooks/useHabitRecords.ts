'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { HabitRecord } from '@/types/database';

interface UseHabitRecordsOptions {
  from?: string;
  to?: string;
}

interface SetRecordInput {
  habitId: string;
  date: string;
  completed: boolean;
  value?: number | null;
}

interface UseHabitRecordsResult {
  records: HabitRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setRecord: (input: SetRecordInput) => Promise<HabitRecord>;
  deleteRecord: (id: string) => Promise<void>;
}

export function useHabitRecords({ from, to }: UseHabitRecordsOptions = {}): UseHabitRecordsResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('habit_records')
      .select('id,user_id,habit_id,date,completed,value,created_at,updated_at')
      .order('date', { ascending: true });

    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    const { data, error: queryError } = await query;
    if (queryError) {
      setError(queryError.message);
    } else {
      setRecords(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase, from, to]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Marca o actualiza el registro de un hábito para un día. */
  const setRecord = useCallback(
    async ({ habitId, date, completed, value = null }: SetRecordInput) => {
      const { data, error: upsertError } = await supabase
        .from('habit_records')
        .upsert(
          { user_id: userId, habit_id: habitId, date, completed, value },
          { onConflict: 'user_id,habit_id,date' },
        )
        .select('id,user_id,habit_id,date,completed,value,created_at,updated_at')
        .single();

      if (upsertError) throw new Error(upsertError.message);

      setRecords((current) => {
        const without = current.filter(
          (record) => !(record.habit_id === habitId && record.date === date),
        );
        return [...without, data];
      });
      return data;
    },
    [supabase, userId],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('habit_records').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setRecords((current) => current.filter((record) => record.id !== id));
    },
    [supabase],
  );

  return { records, loading, error, refresh, setRecord, deleteRecord };
}
