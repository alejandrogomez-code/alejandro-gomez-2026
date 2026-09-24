-- =============================================================================
-- 002_projects.sql
-- Proyectos, etapas y tareas + Row Level Security.
-- Ejecutar completo desde Supabase -> SQL Editor, después de 001.
-- Es idempotente: se puede volver a correr sin romper nada.
-- =============================================================================

-- =============================================================================
-- PROJECTS
-- =============================================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  color text not null default 'brand',
  start_date date not null default current_date,
  target_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_check check (char_length(trim(name)) > 0),
  constraint projects_color_check check (color in ('brand', 'ocean', 'amber', 'plum', 'clay')),
  constraint projects_status_check check (status in ('active', 'paused', 'completed', 'archived')),
  constraint projects_dates_check check (target_date is null or target_date >= start_date)
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_user_status_idx on public.projects (user_id, status);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =============================================================================
-- PROJECT_STAGES
-- =============================================================================

create table if not exists public.project_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_stages_name_check check (char_length(trim(name)) > 0),
  constraint project_stages_position_check check (position >= 0)
);

create index if not exists project_stages_project_idx on public.project_stages (project_id, position);
create index if not exists project_stages_user_id_idx on public.project_stages (user_id);

drop trigger if exists project_stages_set_updated_at on public.project_stages;
create trigger project_stages_set_updated_at
  before update on public.project_stages
  for each row execute function public.set_updated_at();

-- =============================================================================
-- PROJECT_TASKS
-- =============================================================================

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  stage_id uuid not null references public.project_stages (id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_tasks_title_check check (char_length(trim(title)) > 0),
  constraint project_tasks_status_check check (status in ('pending', 'in_progress', 'completed'))
);

create index if not exists project_tasks_project_idx on public.project_tasks (project_id);
create index if not exists project_tasks_stage_idx on public.project_tasks (stage_id);
create index if not exists project_tasks_user_due_idx on public.project_tasks (user_id, due_date);

drop trigger if exists project_tasks_set_updated_at on public.project_tasks;
create trigger project_tasks_set_updated_at
  before update on public.project_tasks
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.projects enable row level security;
alter table public.project_stages enable row level security;
alter table public.project_tasks enable row level security;

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
  for select using (user_id = auth.uid());

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (user_id = auth.uid());

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (user_id = auth.uid());

drop policy if exists "project_stages_select_own" on public.project_stages;
create policy "project_stages_select_own" on public.project_stages
  for select using (user_id = auth.uid());

drop policy if exists "project_stages_insert_own" on public.project_stages;
create policy "project_stages_insert_own" on public.project_stages
  for insert with check (user_id = auth.uid());

drop policy if exists "project_stages_update_own" on public.project_stages;
create policy "project_stages_update_own" on public.project_stages
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "project_stages_delete_own" on public.project_stages;
create policy "project_stages_delete_own" on public.project_stages
  for delete using (user_id = auth.uid());

drop policy if exists "project_tasks_select_own" on public.project_tasks;
create policy "project_tasks_select_own" on public.project_tasks
  for select using (user_id = auth.uid());

drop policy if exists "project_tasks_insert_own" on public.project_tasks;
create policy "project_tasks_insert_own" on public.project_tasks
  for insert with check (user_id = auth.uid());

drop policy if exists "project_tasks_update_own" on public.project_tasks;
create policy "project_tasks_update_own" on public.project_tasks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "project_tasks_delete_own" on public.project_tasks;
create policy "project_tasks_delete_own" on public.project_tasks
  for delete using (user_id = auth.uid());
