'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export const DATA_CHANGED_EVENT = 'vida:data-changed';

/** Avisa a las listas abiertas que una tabla cambió. */
export function notifyDataChanged(table: string) {
  window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { table } }));
}
export type TableName = keyof Tables;
type RowOf<T extends TableName> = Tables[T]['Row'];
type InsertOf<T extends TableName> = Omit<Tables[T]['Insert'], 'user_id'>;
type UpdateOf<T extends TableName> = Tables[T]['Update'];

export interface UseRowsOptions {
  /** Filtros de igualdad, por ejemplo `{ area: 'trabajo' }`. */
  eq?: Record<string, string | boolean | number>;
  /** Orden de la consulta, en prioridad. */
  order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
}

export interface UseRowsResult<T extends TableName> {
  rows: RowOf<T>[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (values: InsertOf<T>) => Promise<RowOf<T>>;
  update: (id: string, values: UpdateOf<T>) => Promise<RowOf<T>>;
  remove: (id: string) => Promise<void>;
}

/**
 * Lectura y escritura genérica de una tabla propia del usuario. La seguridad
 * la ponen las reglas RLS: cada consulta solo ve las filas del usuario.
 */
export function useRows<T extends TableName>(table: T, options: UseRowsOptions = {}): UseRowsResult<T> {
  const client = useMemo(() => createClient(), []);
  // El cliente tipado no acepta nombres de tabla genéricos; las firmas públicas
  // del hook sí quedan tipadas por tabla.
  const supabase = client as any;
  const userId = useUserId();
  const [rows, setRows] = useState<RowOf<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(options);

  const refresh = useCallback(async () => {
    const parsed = JSON.parse(key) as UseRowsOptions;
    let query = supabase.from(table).select('*');
    for (const [column, value] of Object.entries(parsed.eq ?? {})) query = query.eq(column, value);
    for (const order of parsed.order ?? [{ column: 'created_at', ascending: false }]) {
      query = query.order(order.column, { ascending: order.ascending ?? true, nullsFirst: order.nullsFirst ?? false });
    }
    const { data, error: queryError } = await query;
    if (queryError) setError(queryError.message);
    else {
      setRows((data ?? []) as RowOf<T>[]);
      setError(null);
    }
    setLoading(false);
  }, [supabase, table, key]);

  useEffect(() => {
    void refresh();
    // El botón "+" global avisa cuando carga algo, para refrescar las listas abiertas.
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (!detail?.table || detail.table === table) void refresh();
    };
    window.addEventListener(DATA_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handleChange);
  }, [refresh, table]);

  const create = useCallback(
    async (values: InsertOf<T>) => {
      const { data, error: insertError } = await supabase
        .from(table)
        .insert({ ...values, user_id: userId })
        .select('*')
        .single();
      if (insertError) throw new Error(insertError.message);
      setRows((current) => [data as RowOf<T>, ...current]);
      return data as RowOf<T>;
    },
    [supabase, table, userId],
  );

  const update = useCallback(
    async (id: string, values: UpdateOf<T>) => {
      const { data, error: updateError } = await supabase
        .from(table)
        .update(values)
        .eq('id', id)
        .select('*')
        .single();
      if (updateError) throw new Error(updateError.message);
      setRows((current) =>
        current.map((row) => ((row as { id: string }).id === id ? (data as RowOf<T>) : row)),
      );
      return data as RowOf<T>;
    },
    [supabase, table],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setRows((current) => current.filter((row) => (row as { id: string }).id !== id));
    },
    [supabase, table],
  );

  return { rows, loading, error, refresh, create, update, remove };
}
