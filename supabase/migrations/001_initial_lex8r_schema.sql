-- ============================================================
-- LEX₈R TRADING OS
-- Initial production database schema
--
-- Target: PostgreSQL / Supabase
-- This file is intentionally local and reviewable.
-- It does NOT execute against a remote database.
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- ENUMS
-- ============================================================

create type account_type as enum (
  'Prop',
  'Personal'
);

create type account_status as enum (
  'ACTIVE',
  'EVALUATION',
  'FUNDED',
  'PAUSED',
  'PASSED',
  'FAILED'
);

create type trade_direction as enum (
  'LONG',
  'SHORT'
);

create type trade_status as enum (
  'WIN',
  'LOSS',
  'BREAKEVEN'
);

create type trade_lifecycle as enum (
  'OPEN',
  'CLOSED',
  'CANCELLED'
);

create type trade_source as enum (
  'MANUAL',
  'MT5',
  'IMPORT',
  'API'
);

create type integration_provider as enum (
  'MT5',
  'TradingView',
  'LEX8R_API'
);

create type integration_status as enum (
  'CONNECTED',
  'DISCONNECTED',
  'ERROR'
);


-- ============================================================
-- PROFILES
--
-- Authentication identity belongs to Supabase Auth.
-- This table stores LEX₈R application-level profile data.
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  country text,
  timezone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- USER PREFERENCES
-- ============================================================

create table user_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,

  theme text not null default 'dark'
    check (theme in ('dark', 'light', 'system')),

  default_account_id uuid,
  default_instrument text,
  default_risk_percent numeric(8,4),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- ACCOUNTS
-- ============================================================

create table accounts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  name text not null,
  firm text not null,

  external_account_id text,
  broker text,
  platform text,

  type account_type not null,
  status account_status not null default 'ACTIVE',

  starting_balance numeric(18,2) not null,
  currency text not null default 'USD',

  daily_loss_limit numeric(18,2) not null default 0,
  max_drawdown numeric(18,2) not null default 0,
  risk_per_trade numeric(8,4) not null default 1,
  profit_target numeric(18,2) not null default 0,
  profit_split numeric(8,4) not null default 100,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint accounts_starting_balance_non_negative
    check (starting_balance >= 0),

  constraint accounts_daily_loss_limit_non_negative
    check (daily_loss_limit >= 0),

  constraint accounts_max_drawdown_non_negative
    check (max_drawdown >= 0),

  constraint accounts_risk_per_trade_non_negative
    check (risk_per_trade >= 0),

  constraint accounts_profit_target_non_negative
    check (profit_target >= 0),

  constraint accounts_profit_split_valid
    check (profit_split >= 0 and profit_split <= 100),

  constraint accounts_id_user_id_unique
    unique (id, user_id)
);


-- Add the preference foreign key after accounts exists.
alter table user_preferences
  add constraint user_preferences_default_account_fk
  foreign key (default_account_id)
  references accounts(id)
  on delete set null;


-- ============================================================
-- TRADES
-- ============================================================

create table trades (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid not null,

  external_id text,

  instrument text not null,
  direction trade_direction not null,

  opened_at timestamptz,
  closed_at timestamptz,

  entry numeric(18,6) not null,
  stop_loss numeric(18,6),
  take_profit numeric(18,6),

  risk_percent numeric(8,4) not null default 0,
  result_r numeric(18,6) not null default 0,
  pnl numeric(18,2) not null default 0,

  session text,
  setup text,

  lifecycle trade_lifecycle not null default 'CLOSED',
  status trade_status,

  notes text,

  source trade_source not null default 'MANUAL',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


alter table trades
  add constraint trades_account_owner_fk
  foreign key (account_id, user_id)
  references accounts(id, user_id)
  on delete cascade;


-- ============================================================
-- TRADE CONFLUENCE
-- ============================================================

create table trade_confluence (
  trade_id uuid primary key references trades(id) on delete cascade,

  liquidity_sweep boolean not null default false,
  poi boolean not null default false,
  mss boolean not null default false,
  displacement boolean not null default false,
  htf_alignment boolean not null default false,
  volume_confirmation boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================

create table journal_entries (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  account_id uuid references accounts(id) on delete set null,
  trade_id uuid references trades(id) on delete set null,

  title text not null,
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- INTEGRATIONS
-- ============================================================

create table integrations (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid,

  provider integration_provider not null,
  status integration_status not null default 'DISCONNECTED',

  external_account_id text,
  metadata jsonb not null default '{}'::jsonb,

  connected_at timestamptz,
  last_sync_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


alter table integrations
  add constraint integrations_account_owner_fk
  foreign key (account_id, user_id)
  references accounts(id, user_id)
  on delete set null;


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  type text not null,
  title text not null,
  message text not null,

  read boolean not null default false,

  created_at timestamptz not null default now()
);


-- ============================================================
-- ACTIVITY EVENTS
-- ============================================================

create table activity_events (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  action text not null,
  entity_type text not null,
  entity_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index accounts_user_id_idx
  on accounts(user_id);

create index trades_user_id_idx
  on trades(user_id);

create index trades_account_id_idx
  on trades(account_id);

create index trades_opened_at_idx
  on trades(opened_at);

create index trades_instrument_idx
  on trades(instrument);

create index trades_source_idx
  on trades(source);

create index trades_external_id_idx
  on trades(external_id);

create index journal_entries_user_id_idx
  on journal_entries(user_id);

create index journal_entries_trade_id_idx
  on journal_entries(trade_id);

create index integrations_user_id_idx
  on integrations(user_id);

create index integrations_account_id_idx
  on integrations(account_id);

create index notifications_user_id_idx
  on notifications(user_id);

create index activity_events_user_id_idx
  on activity_events(user_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table accounts enable row level security;
alter table trades enable row level security;
alter table trade_confluence enable row level security;
alter table journal_entries enable row level security;
alter table integrations enable row level security;
alter table notifications enable row level security;
alter table activity_events enable row level security;


-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy "Users can view their own profile"
  on profiles
  for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- ============================================================
-- PREFERENCES POLICIES
-- ============================================================

create policy "Users can view their own preferences"
  on user_preferences
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own preferences"
  on user_preferences
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own preferences"
  on user_preferences
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- ACCOUNT POLICIES
-- ============================================================

create policy "Users can view their own accounts"
  on accounts
  for select
  using (user_id = auth.uid());

create policy "Users can create their own accounts"
  on accounts
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own accounts"
  on accounts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own accounts"
  on accounts
  for delete
  using (user_id = auth.uid());


-- ============================================================
-- TRADE POLICIES
-- ============================================================

create policy "Users can view their own trades"
  on trades
  for select
  using (user_id = auth.uid());

create policy "Users can create their own trades"
  on trades
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own trades"
  on trades
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own trades"
  on trades
  for delete
  using (user_id = auth.uid());


-- ============================================================
-- TRADE CONFLUENCE POLICIES
--
-- Ownership is verified through the related trade.
-- ============================================================

create policy "Users can view their trade confluence"
  on trade_confluence
  for select
  using (
    exists (
      select 1
      from trades
      where trades.id = trade_confluence.trade_id
        and trades.user_id = auth.uid()
    )
  );

create policy "Users can create their trade confluence"
  on trade_confluence
  for insert
  with check (
    exists (
      select 1
      from trades
      where trades.id = trade_confluence.trade_id
        and trades.user_id = auth.uid()
    )
  );

create policy "Users can update their trade confluence"
  on trade_confluence
  for update
  using (
    exists (
      select 1
      from trades
      where trades.id = trade_confluence.trade_id
        and trades.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from trades
      where trades.id = trade_confluence.trade_id
        and trades.user_id = auth.uid()
    )
  );

create policy "Users can delete their trade confluence"
  on trade_confluence
  for delete
  using (
    exists (
      select 1
      from trades
      where trades.id = trade_confluence.trade_id
        and trades.user_id = auth.uid()
    )
  );


-- ============================================================
-- JOURNAL POLICIES
-- ============================================================

create policy "Users can view their own journal entries"
  on journal_entries
  for select
  using (user_id = auth.uid());

create policy "Users can create their own journal entries"
  on journal_entries
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own journal entries"
  on journal_entries
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own journal entries"
  on journal_entries
  for delete
  using (user_id = auth.uid());


-- ============================================================
-- INTEGRATION POLICIES
-- ============================================================

create policy "Users can view their own integrations"
  on integrations
  for select
  using (user_id = auth.uid());

create policy "Users can create their own integrations"
  on integrations
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own integrations"
  on integrations
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own integrations"
  on integrations
  for delete
  using (user_id = auth.uid());


-- ============================================================
-- NOTIFICATION POLICIES
-- ============================================================

create policy "Users can view their own notifications"
  on notifications
  for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ============================================================
-- ACTIVITY POLICIES
-- ============================================================

create policy "Users can view their own activity"
  on activity_events
  for select
  using (user_id = auth.uid());


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_updated_at
before update on profiles
for each row
execute function set_updated_at();

create trigger user_preferences_updated_at
before update on user_preferences
for each row
execute function set_updated_at();

create trigger accounts_updated_at
before update on accounts
for each row
execute function set_updated_at();

create trigger trades_updated_at
before update on trades
for each row
execute function set_updated_at();

create trigger trade_confluence_updated_at
before update on trade_confluence
for each row
execute function set_updated_at();

create trigger journal_entries_updated_at
before update on journal_entries
for each row
execute function set_updated_at();

create trigger integrations_updated_at
before update on integrations
for each row
execute function set_updated_at();
