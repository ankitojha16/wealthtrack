-- WealthTrack Supabase schema
-- This migration matches the application data model used by:
-- - src/types/index.ts
-- - src/lib/context/FinanceContext.tsx
-- - src/lib/supabase/repository.ts
--
-- Important: the app stores string-based ids in most tables (for example tx_..., inv_..., goal_...),
-- so the primary keys below are text rather than UUIDs. The user_id field is always the authenticated
-- Supabase user and is enforced by Row Level Security.

create extension if not exists pgcrypto;

-- =========================
--    TRANSACTIONS
-- =========================
create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  description text not null default '',
  date date not null,
  "paymentMethod" text,
  "isRecurring" boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("updatedAt" / 1000.0)) stored
);

create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_transactions_date on public.transactions (date desc);
create index if not exists idx_transactions_type on public.transactions (type);

alter table public.transactions enable row level security;

grant select, insert, update, delete on public.transactions to authenticated;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- Compatibility views: the app stores all financial movements in a single transactions table with a
-- type column, but downstream reporting often needs the expense and income subsets exposed as views.
create or replace view public.expenses as
select *
from public.transactions
where type = 'expense';

create or replace view public.income as
select *
from public.transactions
where type = 'income';

grant select on public.expenses to authenticated;
grant select on public.income to authenticated;

-- =========================
--    BUDGETS
-- =========================
create table if not exists public.budgets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  "monthlyLimit" numeric(12,2) not null default 0,
  spent numeric(12,2) not null default 0,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("updatedAt" / 1000.0)) stored,
  unique (user_id, category)
);

create index if not exists idx_budgets_user_id on public.budgets (user_id);

alter table public.budgets enable row level security;

grant select, insert, update, delete on public.budgets to authenticated;

create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);

create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- =========================
--    INVESTMENTS
-- =========================
create table if not exists public.investments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  "investedAmount" numeric(12,2) not null default 0,
  "currentValue" numeric(12,2) not null default 0,
  "lastUpdatedAt" text not null default '',
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "investmentDate" text,
  "maturityDate" text,
  "interestRate" numeric(8,2),
  notes text,
  symbol text,
  exchange text,
  quantity numeric(12,4),
  "purchasePrice" numeric(12,2),
  brokerage numeric(12,2),
  "currentPrice" numeric(12,2),
  "priceSource" text check ("priceSource" in ('manual', 'api')),
  "apiProvider" text,
  "apiLastUpdated" text,
  "apiStatus" text check ("apiStatus" in ('success', 'failed', 'unavailable')),
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored
);

create index if not exists idx_investments_user_id on public.investments (user_id);
create index if not exists idx_investments_type on public.investments (type);

alter table public.investments enable row level security;

grant select, insert, update, delete on public.investments to authenticated;

create policy "investments_select_own" on public.investments
  for select using (auth.uid() = user_id);

create policy "investments_insert_own" on public.investments
  for insert with check (auth.uid() = user_id);

create policy "investments_update_own" on public.investments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "investments_delete_own" on public.investments
  for delete using (auth.uid() = user_id);

-- =========================
--    STOCK HOLDINGS
--    Supplemental table for live stock positions; not the source of truth for user holdings.
--    The app stores stock-related metadata on the investment row, but this table makes the
--    holding structure explicit and queryable.
-- =========================
create table if not exists public.stock_holdings (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_id text not null references public.investments(id) on delete cascade,
  symbol text not null,
  exchange text not null default 'NSE',
  quantity numeric(12,4) not null default 0,
  "averageCost" numeric(12,2) not null default 0,
  "currentPrice" numeric(12,2) not null default 0,
  "lastUpdatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("lastUpdatedAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("lastUpdatedAt" / 1000.0)) stored,
  unique (user_id, investment_id)
);

create index if not exists idx_stock_holdings_user_id on public.stock_holdings (user_id);
create index if not exists idx_stock_holdings_symbol on public.stock_holdings (symbol);

alter table public.stock_holdings enable row level security;

grant select, insert, update, delete on public.stock_holdings to authenticated;

create policy "stock_holdings_select_own" on public.stock_holdings
  for select using (auth.uid() = user_id);

create policy "stock_holdings_insert_own" on public.stock_holdings
  for insert with check (auth.uid() = user_id);

create policy "stock_holdings_update_own" on public.stock_holdings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "stock_holdings_delete_own" on public.stock_holdings
  for delete using (auth.uid() = user_id);

-- =========================
--    GOALS
-- =========================
create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  "targetAmount" numeric(12,2) not null default 0,
  "currentAmount" numeric(12,2) not null default 0,
  "targetDate" text not null default '',
  "monthlyContribution" numeric(12,2) not null default 0,
  "linkedInvestmentIds" jsonb not null default '[]'::jsonb,
  "contributionHistory" jsonb not null default '[]'::jsonb,
  description text,
  "essentialMonthlyExpenses" numeric(12,2),
  "targetMonths" integer,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("updatedAt" / 1000.0)) stored
);

create index if not exists idx_goals_user_id on public.goals (user_id);
create index if not exists idx_goals_target_date on public.goals ("targetDate");

alter table public.goals enable row level security;

grant select, insert, update, delete on public.goals to authenticated;

create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);

create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

-- =========================
--    GOAL CONTRIBUTIONS
--    Explicit contribution ledger supported by GoalContribution metadata in the app model.
-- =========================
create table if not exists public.goal_contributions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id text not null references public.goals(id) on delete cascade,
  date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  notes text,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("updatedAt" / 1000.0)) stored
);

create index if not exists idx_goal_contributions_user_id on public.goal_contributions (user_id);
create index if not exists idx_goal_contributions_goal_id on public.goal_contributions (goal_id);

alter table public.goal_contributions enable row level security;

grant select, insert, update, delete on public.goal_contributions to authenticated;

create policy "goal_contributions_select_own" on public.goal_contributions
  for select using (auth.uid() = user_id);

create policy "goal_contributions_insert_own" on public.goal_contributions
  for insert with check (auth.uid() = user_id);

create policy "goal_contributions_update_own" on public.goal_contributions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goal_contributions_delete_own" on public.goal_contributions
  for delete using (auth.uid() = user_id);

-- =========================
--    LOANS
-- =========================
create table if not exists public.loans (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  "outstandingAmount" numeric(12,2) not null default 0,
  "monthlyEmi" numeric(12,2) not null default 0,
  "emisRemaining" integer not null default 0,
  "interestRate" numeric(8,2),
  "originalAmount" numeric(12,2),
  "nextEmiDate" text,
  notes text,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("updatedAt" / 1000.0)) stored
);

create index if not exists idx_loans_user_id on public.loans (user_id);

alter table public.loans enable row level security;

grant select, insert, update, delete on public.loans to authenticated;

create policy "loans_select_own" on public.loans
  for select using (auth.uid() = user_id);

create policy "loans_insert_own" on public.loans
  for insert with check (auth.uid() = user_id);

create policy "loans_update_own" on public.loans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "loans_delete_own" on public.loans
  for delete using (auth.uid() = user_id);

-- =========================
--    ASSETS
-- =========================
create table if not exists public.assets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Financial', 'Physical')),
  subcategory text not null,
  "estimatedValue" numeric(12,2) not null default 0,
  notes text,
  "lastUpdatedAt" text not null default '',
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored
);

create index if not exists idx_assets_user_id on public.assets (user_id);

alter table public.assets enable row level security;

grant select, insert, update, delete on public.assets to authenticated;

create policy "assets_select_own" on public.assets
  for select using (auth.uid() = user_id);

create policy "assets_insert_own" on public.assets
  for insert with check (auth.uid() = user_id);

create policy "assets_update_own" on public.assets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "assets_delete_own" on public.assets
  for delete using (auth.uid() = user_id);

-- =========================
--    LIABILITIES
-- =========================
create table if not exists public.liabilities (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  amount numeric(12,2) not null default 0,
  "monthlyPayment" numeric(12,2),
  notes text,
  "lastUpdatedAt" text not null default '',
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored
);

create index if not exists idx_liabilities_user_id on public.liabilities (user_id);

alter table public.liabilities enable row level security;

grant select, insert, update, delete on public.liabilities to authenticated;

create policy "liabilities_select_own" on public.liabilities
  for select using (auth.uid() = user_id);

create policy "liabilities_insert_own" on public.liabilities
  for insert with check (auth.uid() = user_id);

create policy "liabilities_update_own" on public.liabilities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "liabilities_delete_own" on public.liabilities
  for delete using (auth.uid() = user_id);

-- =========================
--    SNAPSHOTS
-- =========================
create table if not exists public.snapshots (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  "monthYear" text not null,
  net_worth numeric(12,2) not null default 0,
  "totalAssets" numeric(12,2) not null default 0,
  "totalLiabilities" numeric(12,2) not null default 0,
  "totalInvestments" numeric(12,2) not null default 0,
  "totalInvestmentsValue" numeric(12,2) not null default 0,
  "totalLoans" numeric(12,2) not null default 0,
  income numeric(12,2) not null default 0,
  expenses numeric(12,2) not null default 0,
  savings numeric(12,2) not null default 0,
  timestamp bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp(timestamp / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp(timestamp / 1000.0)) stored,
  unique (user_id, "monthYear")
);

create index if not exists idx_snapshots_user_id on public.snapshots (user_id);
create index if not exists idx_snapshots_month_year on public.snapshots ("monthYear");

alter table public.snapshots enable row level security;

grant select, insert, update, delete on public.snapshots to authenticated;

create policy "snapshots_select_own" on public.snapshots
  for select using (auth.uid() = user_id);

create policy "snapshots_insert_own" on public.snapshots
  for insert with check (auth.uid() = user_id);

create policy "snapshots_update_own" on public.snapshots
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "snapshots_delete_own" on public.snapshots
  for delete using (auth.uid() = user_id);

-- =========================
--    APP SETTINGS
-- =========================
create table if not exists public.app_settings (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  "updatedAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz generated always as (to_timestamp("createdAt" / 1000.0)) stored,
  updated_at timestamptz generated always as (to_timestamp("updatedAt" / 1000.0)) stored,
  unique (user_id, key)
);

create index if not exists idx_app_settings_user_id on public.app_settings (user_id);

alter table public.app_settings enable row level security;

grant select, insert, update, delete on public.app_settings to authenticated;

create policy "app_settings_select_own" on public.app_settings
  for select using (auth.uid() = user_id);

create policy "app_settings_insert_own" on public.app_settings
  for insert with check (auth.uid() = user_id);

create policy "app_settings_update_own" on public.app_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "app_settings_delete_own" on public.app_settings
  for delete using (auth.uid() = user_id);

-- Note: no guest/anonymous policies are defined. Guest and offline usage continues through IndexedDB/localStorage,
-- while authenticated users use Supabase with strict per-user access control.
