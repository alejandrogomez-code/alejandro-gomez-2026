'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type {
  Project,
  ProjectStage,
  ProjectTask,
  ProjectTaskInsert,
  ProjectTaskUpdate,
  ProjectUpdate,
} from '@/types/database';

type NewTask = Omit<ProjectTaskInsert, 'user_id' | 'project_id'>;

interface UseProjectResult {
  project: Project | null;
  stages: ProjectStage[];
  tasks: ProjectTask[];
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refresh: () => Promise<void>;
  updateProject: (values: ProjectUpdate) => Promise<Project>;
  deleteProject: () => Promise<void>;
  createStages: (names: string[]) => Promise<void>;
  renameStage: (id: string, name: string) => Promise<void>;
  moveStage: (id: string, direction: -1 | 1) => Promise<void>;
  deleteStage: (id: string) => Promise<void>;
  createTask: (values: NewTask) => Promise<ProjectTask>;
  updateTask: (id: string, values: ProjectTaskUpdate) => Promise<ProjectTask>;
  deleteTask: (id: string) => Promise<void>;
}

/** Un proyecto con sus etapas (ordenadas) y todas sus tareas. */
export function useProject(projectId: string): UseProjectResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [projectResult, stagesResult, tasksResult] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).maybeSingle(),
      supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase.from('project_tasks').select('*').eq('project_id', projectId),
    ]);

    const queryError = projectResult.error ?? stagesResult.error ?? tasksResult.error;
    if (queryError) {
      setError(queryError.message);
    } else {
      setProject(projectResult.data);
      setNotFound(projectResult.data === null);
      setStages(stagesResult.data ?? []);
      setTasks(tasksResult.data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase, projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateProject = useCallback(
    async (values: ProjectUpdate) => {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(values)
        .eq('id', projectId)
        .select('*')
        .single();
      if (updateError) throw new Error(updateError.message);
      setProject(data);
      return data;
    },
    [supabase, projectId],
  );

  const deleteProject = useCallback(async () => {
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', projectId);
    if (deleteError) throw new Error(deleteError.message);
  }, [supabase, projectId]);

  const createStages = useCallback(
    async (names: string[]) => {
      const start = stages.reduce((max, stage) => Math.max(max, stage.position + 1), 0);
      const rows = names.map((name, index) => ({
        user_id: userId,
        project_id: projectId,
        name: name.trim(),
        position: start + index,
      }));
      const { data, error: insertError } = await supabase
        .from('project_stages')
        .insert(rows)
        .select('*');
      if (insertError) throw new Error(insertError.message);
      setStages((current) => [...current, ...(data ?? [])]);
    },
    [supabase, userId, projectId, stages],
  );

  const renameStage = useCallback(
    async (id: string, name: string) => {
      const { data, error: updateError } = await supabase
        .from('project_stages')
        .update({ name: name.trim() })
        .eq('id', id)
        .select('*')
        .single();
      if (updateError) throw new Error(updateError.message);
      setStages((current) => current.map((stage) => (stage.id === id ? data : stage)));
    },
    [supabase],
  );

  /** Intercambia la posición con la etapa vecina. */
  const moveStage = useCallback(
    async (id: string, direction: -1 | 1) => {
      const index = stages.findIndex((stage) => stage.id === id);
      const neighbor = stages[index + direction];
      if (index < 0 || !neighbor) return;

      // Se renumeran todas para que las posiciones queden consecutivas.
      const reordered = [...stages];
      reordered[index] = neighbor;
      reordered[index + direction] = stages[index];
      const renumbered = reordered.map((stage, position) => ({ ...stage, position }));
      setStages(renumbered);

      const changed = renumbered.filter(
        (stage) => stages.find((original) => original.id === stage.id)?.position !== stage.position,
      );
      const results = await Promise.all(
        changed.map((stage) =>
          supabase.from('project_stages').update({ position: stage.position }).eq('id', stage.id),
        ),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) {
        setStages(stages);
        throw new Error(failed.error.message);
      }
    },
    [supabase, stages],
  );

  const deleteStage = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('project_stages').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setStages((current) => current.filter((stage) => stage.id !== id));
      setTasks((current) => current.filter((task) => task.stage_id !== id));
    },
    [supabase],
  );

  const createTask = useCallback(
    async (values: NewTask) => {
      const { data, error: insertError } = await supabase
        .from('project_tasks')
        .insert({ ...values, user_id: userId, project_id: projectId })
        .select('*')
        .single();
      if (insertError) throw new Error(insertError.message);
      setTasks((current) => [...current, data]);
      return data;
    },
    [supabase, userId, projectId],
  );

  const updateTask = useCallback(
    async (id: string, values: ProjectTaskUpdate) => {
      const { data, error: updateError } = await supabase
        .from('project_tasks')
        .update(values)
        .eq('id', id)
        .select('*')
        .single();
      if (updateError) throw new Error(updateError.message);
      setTasks((current) => current.map((task) => (task.id === id ? data : task)));
      return data;
    },
    [supabase],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('project_tasks').delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);
      setTasks((current) => current.filter((task) => task.id !== id));
    },
    [supabase],
  );

  return {
    project,
    stages,
    tasks,
    loading,
    error,
    notFound,
    refresh,
    updateProject,
    deleteProject,
    createStages,
    renameStage,
    moveStage,
    deleteStage,
    createTask,
    updateTask,
    deleteTask,
  };
}
