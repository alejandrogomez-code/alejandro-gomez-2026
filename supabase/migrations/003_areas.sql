-- Vida por áreas: Trabajo, Personal, Salud y Objetivos.
-- Agrega el área a objetivos y proyectos, y las tablas nuevas de tareas,
-- reuniones, vencimientos, lecturas, notas y revisión semanal.

-- Objetivos y proyectos con área ------------------------------------------
alter table public.goals add column if not exists area text not null default 'general';
alter table public.goals drop constraint if exists goals_area_check;
alter table public.goals add constraint goals_area_check
  check (area in ('trabajo', 'personal', 'salud', 'general'));

alter table public.projects add column if not exists area text not null default 'trabajo';
alter table public.projects drop constraint if exists projects_area_check;
alter table public.projects add constraint projects_area_check
  check (area in ('trabajo', 'personal'));

-- Recordatorios por mail ---------------------------------------------------
alter table public.profiles add column if not exists reminder_email text;
alter table public.profiles add column if not exists reminders_enabled boolean not null default true;

-- Reuniones -----------------------------------------------------------------
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  date date not null default current_date,
  attendees text,
  notes text,
  decisions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_title_check check (char_length(trim(title)) > 0)
);
create index if not exists meetings_user_date_idx on public.meetings (user_id, date desc);

-- Tareas sueltas (trabajo y personal) --------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area text not null default 'trabajo',
  title text not null,
  notes text,
  due_date date,
  done boolean not null default false,
  done_at timestamptz,
  meeting_id uuid references public.meetings (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_check check (char_length(trim(title)) > 0),
  constraint tasks_area_check check (area in ('trabajo', 'personal'))
);
create index if not exists tasks_user_area_idx on public.tasks (user_id, area, done);
create index if not exists tasks_user_due_idx on public.tasks (user_id, due_date);
create index if not exists tasks_meeting_idx on public.tasks (meeting_id);

-- Vencimientos y fechas importantes -----------------------------------------
create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area text not null default 'trabajo',
  kind text not null default 'vencimiento',
  title text not null,
  due_date date not null,
  recurrence text not null default 'none',
  remind_days integer not null default 3,
  notes text,
  done boolean not null default false,
  last_done date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deadlines_title_check check (char_length(trim(title)) > 0),
  constraint deadlines_area_check check (area in ('trabajo', 'personal')),
  constraint deadlines_kind_check check (kind in ('vencimiento', 'fecha')),
  constraint deadlines_recurrence_check check (recurrence in ('none', 'monthly', 'yearly')),
  constraint deadlines_remind_check check (remind_days between 0 and 60)
);
create index if not exists deadlines_user_due_idx on public.deadlines (user_id, due_date);

-- Lecturas ------------------------------------------------------------------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  author text,
  status text not null default 'pendiente',
  started_on date,
  finished_on date,
  rating integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_title_check check (char_length(trim(title)) > 0),
  constraint books_status_check check (status in ('pendiente', 'leyendo', 'leido')),
  constraint books_rating_check check (rating is null or rating between 1 and 5)
);
create index if not exists books_user_status_idx on public.books (user_id, status);

-- Notas ---------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area text not null default 'personal',
  title text,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_body_check check (char_length(trim(body)) > 0),
  constraint notes_area_check check (area in ('trabajo', 'personal', 'salud', 'general'))
);
create index if not exists notes_user_area_idx on public.notes (user_id, area, created_at desc);

-- Revisión semanal ------------------------------------------------------------
create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  highlights text,
  blockers text,
  next_focus text,
  mood integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reviews_unique_week unique (user_id, week_start),
  constraint weekly_reviews_mood_check check (mood is null or mood between 1 and 5)
);

-- Triggers y seguridad para las tablas nuevas --------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['meetings', 'tasks', 'deadlines', 'books', 'notes', 'weekly_reviews'] loop
    execute format('drop trigger if exists %1$s_set_updated_at on public.%1$s', t);
    execute format(
      'create trigger %1$s_set_updated_at before update on public.%1$s for each row execute function public.set_updated_at()',
      t
    );
    execute format('alter table public.%1$s enable row level security', t);
    execute format('drop policy if exists "%1$s_select_own" on public.%1$s', t);
    execute format('create policy "%1$s_select_own" on public.%1$s for select using (user_id = auth.uid())', t);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$s', t);
    execute format('create policy "%1$s_insert_own" on public.%1$s for insert with check (user_id = auth.uid())', t);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$s', t);
    execute format(
      'create policy "%1$s_update_own" on public.%1$s for update using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$s', t);
    execute format('create policy "%1$s_delete_own" on public.%1$s for delete using (user_id = auth.uid())', t);
  end loop;
end;
$$;

-- Datos iniciales ---------------------------------------------------------------
-- Clasifica los objetivos existentes y deja configurado el mail de avisos.
update public.goals set area = 'salud'
  where area = 'general' and (name ilike '%kg%' or name ilike '%peso%' or name ilike '%pasos%');
update public.goals set area = 'personal'
  where area = 'general' and name ilike '%libro%';
update public.profiles set reminder_email = 'alergomez88@gmail.com'
  where reminder_email is null;
