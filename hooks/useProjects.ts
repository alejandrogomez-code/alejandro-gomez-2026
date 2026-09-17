'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserId } from '@/components/providers/profile-provider';
import type { Project, ProjectInsert, ProjectTask, TaskStatus } from '@/types/database';

/** Campos de tarea que alcanzan para listados y resúmenes. */
export type TaskBrief = Pick<
  ProjectTask,
  'id' | 'project_id' | 'stage_id' | 'title' | 'status' | 'due_date' | 'created_at'
>;

const TASK_BRIEF_COLUMNS = 'id,project_id,stage_id,title,status,due_date,created_at';

interface UseProjectsResult {
  projects: Project[];
  tasks: TaskBrief[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (values: Omit<ProjectInsert, 'user_id'>) => Promise<Project>;
  setTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
}

/** Lista de proyectos con un resumen liviano de todas sus tareas. */
export function useProjects(): UseProjectsResult {
  const supabase = useMemo(() => createClient(), []);
  const userId = useUserId();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [projectsResult, tasksResult] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('project_tasks').select(TASK_BRIEF_COLUMNS),
    ]);

    const queryError = projectsResult.error ?? tasksResult.error;
    if (queryError) {
      setError(queryError.message);
    } else {
      setProjects(projectsResult.data ?? []);
      setTasks(tasksResult.data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createProject = useCallback(
    async (values: Omit<ProjectInsert, 'user_id'>) => {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({ ...values, user_id: userId })
        .select('*')
        .single();

      if (insertError) throw new Error(insertError.message);
      setProjects((current) => [data, ...current]);
      return data;
    },
    [supabase, userId],
  );

  const setTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      const { error: updateError } = await supabase
        .from('project_tasks')
        .update({ status })
        .eq('id', taskId);
      if (updateError) throw new Error(updateError.message);
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, status } : task)),
      );
    },
    [supabase],
  );

  return { projects, tasks, loading, error, refresh, createProject, setTaskStatus };
}
