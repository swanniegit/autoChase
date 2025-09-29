-- AutoChase Supabase schema (no RLS for simplicity in MVP)

create table if not exists ac_invoices (
  id uuid primary key,
  workspace_id text not null,
  client_name text not null,
  client_email text not null,
  invoice_number text not null,
  amount_cents int not null,
  currency text default 'ZAR',
  due_date date not null,
  paid boolean default false,
  payment_link text,
  created_at timestamptz default now()
);

create table if not exists ac_settings (
  workspace_id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists ac_outbox (
  id uuid primary key,
  workspace_id text not null,
  invoice_id uuid not null,
  when_at timestamptz not null,
  kind text not null,
  sent_at timestamptz,
  recipient text not null,
  subject text not null,
  body text not null
);

-- ITN logs for PayFast notifications
create table if not exists ac_itn_logs (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz default now(),
  ip text,
  signature_ok boolean,
  ip_ok boolean,
  postback_ok boolean,
  payment_status text,
  m_payment_id text,
  payload jsonb
);

alter table ac_itn_logs enable row level security;
-- Restrict reads to a specific email (update as needed)
drop policy if exists itn_read_all on ac_itn_logs;
create policy "itn_read_admin" on ac_itn_logs for select
  using ((auth.jwt() ->> 'email') = 'christo@yellowarcher.co.za');

-- Profiles map user -> workspace
create table if not exists ac_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace_id text not null
);

-- Enable RLS
alter table ac_invoices enable row level security;
alter table ac_settings enable row level security;
alter table ac_outbox enable row level security;
alter table ac_profiles enable row level security;

-- Policies: profiles (self only)
create policy "profiles_select_own" on ac_profiles for select using (user_id = auth.uid());
create policy "profiles_insert_own" on ac_profiles for insert with check (user_id = auth.uid());
create policy "profiles_update_own" on ac_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Helper condition: user must belong to workspace
-- We inline EXISTS(...) in each policy to avoid a separate function

-- Invoices policies
create policy "invoices_rw_by_workspace" on ac_invoices for all
  using (exists (select 1 from ac_profiles p where p.user_id = auth.uid() and p.workspace_id = ac_invoices.workspace_id))
  with check (exists (select 1 from ac_profiles p where p.user_id = auth.uid() and p.workspace_id = ac_invoices.workspace_id));

-- Settings policies
create policy "settings_rw_by_workspace" on ac_settings for all
  using (exists (select 1 from ac_profiles p where p.user_id = auth.uid() and p.workspace_id = ac_settings.workspace_id))
  with check (exists (select 1 from ac_profiles p where p.user_id = auth.uid() and p.workspace_id = ac_settings.workspace_id));

-- Outbox policies
create policy "outbox_rw_by_workspace" on ac_outbox for all
  using (exists (select 1 from ac_profiles p where p.user_id = auth.uid() and p.workspace_id = ac_outbox.workspace_id))
  with check (exists (select 1 from ac_profiles p where p.user_id = auth.uid() and p.workspace_id = ac_outbox.workspace_id));
