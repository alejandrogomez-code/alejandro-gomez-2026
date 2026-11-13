-- Economía y Finanzas: ingresos y egresos, deudas e inversiones.

-- Cotización del dólar que usa la app para pasar todo a pesos --------------
alter table public.profiles add column if not exists usd_rate numeric(14, 2);

-- Deudas ----------------------------------------------------------------------
create table if not exists public.finance_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  creditor text,
  kind text not null default 'prestamo',
  currency text not null default 'ARS',
  original_amount numeric(14, 2),
  balance numeric(14, 2) not null default 0,
  rate_annual numeric(7, 2),
  monthly_payment numeric(14, 2),
  installments_left integer,
  due_day integer,
  status text not null default 'activa',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_debts_name_check check (char_length(trim(name)) > 0),
  constraint finance_debts_kind_check check (kind in ('tarjeta', 'prestamo', 'personal', 'hipoteca', 'otro')),
  constraint finance_debts_currency_check check (currency in ('ARS', 'USD')),
  constraint finance_debts_balance_check check (balance >= 0),
  constraint finance_debts_rate_check check (rate_annual is null or rate_annual >= 0),
  constraint finance_debts_payment_check check (monthly_payment is null or monthly_payment >= 0),
  constraint finance_debts_installments_check check (installments_left is null or installments_left >= 0),
  constraint finance_debts_due_day_check check (due_day is null or due_day between 1 and 31),
  constraint finance_debts_status_check check (status in ('activa', 'cancelada'))
);
create index if not exists finance_debts_user_idx on public.finance_debts (user_id, status);

-- Ingresos y egresos ------------------------------------------------------------
create table if not exists public.finance_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null default 'egreso',
  category text not null default 'Otros',
  description text,
  amount numeric(14, 2) not null,
  currency text not null default 'ARS',
  date date not null default current_date,
  recurring boolean not null default false,
  debt_id uuid references public.finance_debts (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_movements_kind_check check (kind in ('ingreso', 'egreso')),
  constraint finance_movements_amount_check check (amount > 0),
  constraint finance_movements_currency_check check (currency in ('ARS', 'USD'))
);
create index if not exists finance_movements_user_date_idx on public.finance_movements (user_id, date desc);
create index if not exists finance_movements_debt_idx on public.finance_movements (debt_id);

-- Inversiones -----------------------------------------------------------------
create table if not exists public.finance_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind text not null default 'otro',
  currency text not null default 'ARS',
  amount numeric(14, 2) not null default 0,
  current_value numeric(14, 2),
  rate_annual numeric(7, 2),
  start_date date not null default current_date,
  maturity_date date,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_investments_name_check check (char_length(trim(name)) > 0),
  constraint finance_investments_kind_check check (
    kind in ('plazo_fijo', 'fci', 'dolares', 'acciones', 'cedears', 'bonos', 'cripto', 'otro')
  ),
  constraint finance_investments_currency_check check (currency in ('ARS', 'USD')),
  constraint finance_investments_amount_check check (amount >= 0)
);
create index if not exists finance_investments_user_idx on public.finance_investments (user_id, active);

-- Triggers y seguridad ----------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['finance_debts', 'finance_movements', 'finance_investments'] loop
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
