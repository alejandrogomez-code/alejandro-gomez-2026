'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { WeightRecord } from '@/types/database';

interface UseWeightRecordsOptions {
  /** 'YYYY-MM-DD' inclusive. */
  from?: string;
  to?: string;
}

interface UseWeightRecordsResult {
  records: WeightRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveWeight: (date: string, weightKg: number) => Promise<WeightRecord>;
  deleteWeight: (id: string) => Promise<void>;
}

/** Registros de peso ordenados por fecha ascendente. */
export function useWeightRecords({
  from,
  to,
}: UseWeightRecordsOptions = {}): UseWeightRecordsResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('weight_records')
      .select('id,user_id,date,weight_kg,created_at')
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

  /** Inserta o actualiza el registro del día (constraint UNIQUE user_id + date). */
  const saveWeight = useCallback(
    async (date: string, weightKg: number) => {
      const { data, error: upsertError } = await supabase
        .from('weight_records')
        .upsert({ user_id: userId, date, weight_kg: weightKg }, { onConflict: 'user_id,date' })
        .select('id,user_id,date,weight_kg,created_at')
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

  const deleteWeight = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('weight_records').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setRecords((current) => current.filter((record) => record.id !== id));
    },
    [supabase],
  );

  return { records, loading, error, refresh, saveWeight, deleteWeight };
}
