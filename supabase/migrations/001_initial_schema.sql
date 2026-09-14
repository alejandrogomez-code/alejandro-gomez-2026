-- =============================================================================
-- 001_initial_schema.sql
-- Esquema inicial: profiles, goals, habits, weight_records, step_records,
-- habit_records + Row Level Security + triggers.
-- Ejecutar completo desde Supabase -> SQL Editor.
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- FUNCIONES AUXILIARES
-- =============================================================================

-- Mantiene updated_at en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- PROFILES
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  height_cm numeric(5, 1),
  initial_weight_kg numeric(6, 2),
  daily_steps_goal integer not null default 10000,
  theme text not null default 'system',
  font_size text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_theme_check check (theme in ('light', 'dark', 'system')),
  constraint profiles_font_size_check check (font_size in ('small', 'normal', 'large')),
  constraint profiles_height_check check (height_cm is null or (height_cm > 0 and height_cm < 300)),
  constraint profiles_initial_weight_check check (initial_weight_kg is null or (initial_weight_kg > 0 and initial_weight_kg < 700)),
  constraint profiles_steps_goal_check check (daily_steps_goal > 0)
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- GOALS
-- =============================================================================

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'quantitative',
  start_date date not null default current_date,
  target_date date,
  initial_value numeric(12, 2),
  target_value numeric(12, 2),
  current_value numeric(12, 2),
  unit text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_name_check check (char_length(trim(name)) > 0),
  constraint goals_type_check check (type in ('quantitative', 'completion', 'date')),
  constraint goals_status_check check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  constraint goals_dates_check check (target_date is null or target_date >= start_date)
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_user_status_idx on public.goals (user_id, status);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- =============================================================================
-- HABITS
-- =============================================================================

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'check',
  target_value numeric(12, 2),
  unit text,
  frequency_type text not null default 'daily',
  weekdays integer[] not null default '{}',
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  -- Si es true y el hábito mide pasos, el cumplimiento se lee de step_records
  -- y el usuario no tiene que cargar el dato dos veces.
  use_step_records boolean not null default false,
  goal_id uuid references public.goals (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habits_name_check check (char_length(trim(name)) > 0),
  constraint habits_type_check check (type in ('check', 'quantitative')),
  constraint habits_frequency_check check (frequency_type in ('daily', 'weekly_days', 'custom')),
  constraint habits_dates_check check (end_date is null or end_date >= start_date),
  constraint habits_weekdays_check check (
    frequency_type = 'daily'
    or (array_length(weekdays, 1) is not null and weekdays <@ array[0, 1, 2, 3, 4, 5, 6])
  ),
  constraint habits_target_check check (type <> 'quantitative' or target_value is not null)
);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habits_user_active_idx on public.habits (user_id, active);
create index if not exists habits_goal_id_idx on public.habits (goal_id);

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- =============================================================================
-- WEIGHT_RECORDS
-- =============================================================================

create table if not exists public.weight_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null default current_date,
  weight_kg numeric(6, 2) not null,
  created_at timestamptz not null default now(),
  constraint weight_records_value_check check (weight_kg > 0 and weight_kg < 700),
  constraint weight_records_unique_day unique (user_id, date)
);

create index if not exists weight_records_user_date_idx on public.weight_records (user_id, date desc);

-- =============================================================================
-- STEP_RECORDS
-- =============================================================================

create table if not exists public.step_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null default current_date,
  steps integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint step_records_value_check check (steps >= 0 and steps < 300000),
  constraint step_records_unique_day unique (user_id, date)
);

create index if not exists step_records_user_date_idx on public.step_records (user_id, date desc);

drop trigger if exists step_records_set_updated_at on public.step_records;
create trigger step_records_set_updated_at
  before update on public.step_records
  for each row execute function public.set_updated_at();

-- =============================================================================
-- HABIT_RECORDS
-- =============================================================================

create table if not exists public.habit_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default false,
  value numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habit_records_unique_day unique (user_id, habit_id, date)
);

create index if not exists habit_records_user_date_idx on public.habit_records (user_id, date desc);
create index if not exists habit_records_habit_date_idx on public.habit_records (habit_id, date desc);

drop trigger if exists habit_records_set_updated_at on public.habit_records;
create trigger habit_records_set_updated_at
  before update on public.habit_records
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.habits enable row level security;
alter table public.weight_records enable row level security;
alter table public.step_records enable row level security;
alter table public.habit_records enable row level security;

-- PROFILES: la identidad es la propia fila (id = auth.uid()).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (id = auth.uid());

-- GOALS
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals
  for select using (user_id = auth.uid());

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals
  for insert with check (user_id = auth.uid());

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals
  for delete using (user_id = auth.uid());

-- HABITS
drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own" on public.habits
  for select using (user_id = auth.uid());

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own" on public.habits
  for insert with check (user_id = auth.uid());

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own" on public.habits
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own" on public.habits
  for delete using (user_id = auth.uid());

-- WEIGHT_RECORDS
drop policy if exists "weight_records_select_own" on public.weight_records;
create policy "weight_records_select_own" on public.weight_records
  for select using (user_id = auth.uid());

drop policy if exists "weight_records_insert_own" on public.weight_records;
create policy "weight_records_insert_own" on public.weight_records
  for insert with check (user_id = auth.uid());

drop policy if exists "weight_records_update_own" on public.weight_records;
create policy "weight_records_update_own" on public.weight_records
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "weight_records_delete_own" on public.weight_records;
create policy "weight_records_delete_own" on public.weight_records
  for delete using (user_id = auth.uid());

-- STEP_RECORDS
drop policy if exists "step_records_select_own" on public.step_records;
create policy "step_records_select_own" on public.step_records
  for select using (user_id = auth.uid());

drop policy if exists "step_records_insert_own" on public.step_records;
create policy "step_records_insert_own" on public.step_records
  for insert with check (user_id = auth.uid());

drop policy if exists "step_records_update_own" on public.step_records;
create policy "step_records_update_own" on public.step_records
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "step_records_delete_own" on public.step_records;
create policy "step_records_delete_own" on public.step_records
  for delete using (user_id = auth.uid());

-- HABIT_RECORDS
drop policy if exists "habit_records_select_own" on public.habit_records;
create policy "habit_records_select_own" on public.habit_records
  for select using (user_id = auth.uid());

drop policy if exists "habit_records_insert_own" on public.habit_records;
create policy "habit_records_insert_own" on public.habit_records
  for insert with check (user_id = auth.uid());

drop policy if exists "habit_records_update_own" on public.habit_records;
create policy "habit_records_update_own" on public.habit_records
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "habit_records_delete_own" on public.habit_records;
create policy "habit_records_delete_own" on public.habit_records
  for delete using (user_id = auth.uid());

-- =============================================================================
-- TRIGGER: crear profile automáticamente al crear el usuario en auth.users
-- height_cm / initial_weight_kg quedan en null y se completan en el onboarding.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: si el usuario ya existía antes de correr esta migración.
insert into public.profiles (id)
select u.id from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
