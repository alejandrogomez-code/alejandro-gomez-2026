'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { StepRecord } from '@/types/database';

interface UseStepRecordsOptions {
  from?: string;
  to?: string;
}

interface UseStepRecordsResult {
  records: StepRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveSteps: (date: string, steps: number) => Promise<StepRecord>;
  deleteSteps: (id: string) => Promise<void>;
}

/** Registros de pasos ordenados por fecha ascendente. */
export function useStepRecords({ from, to }: UseStepRecordsOptions = {}): UseStepRecordsResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [records, setRecords] = useState<StepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('step_records')
      .select('id,user_id,date,steps,created_at,updated_at')
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

  const saveSteps = useCallback(
    async (date: string, steps: number) => {
      const { data, error: upsertError } = await supabase
        .from('step_records')
        .upsert({ user_id: userId, date, steps }, { onConflict: 'user_id,date' })
        .select('id,user_id,date,steps,created_at,updated_at')
        .single();

      if (upsertError) throw new Error(upsertError.message);

      setRecords((current) => {
        const without = current.filter((record) => record.date !== date);
        return [...without, data].sort((a, b) => a.date.localeCompare(b.date));
      });
      return data;
    },
    [supabase, userId],
  );

  const deleteSteps = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('step_records').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setRecords((current) => current.filter((record) => record.id !== id));
    },
    [supabase],
  );

  return { records, loading, error, refresh, saveSteps, deleteSteps };
}
