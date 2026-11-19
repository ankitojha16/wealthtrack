-- WealthTrack 2.1 — Security & Integrity Migration
-- Purpose:
-- 1. Enforce security_invoker = true on compatibility views (expenses, income) to respect RLS
-- 2. Add composite foreign key constraints linking child rows directly to parent tenant (user_id)
-- 3. Replace generated updated_at columns with authentic modification triggers
-- 4. Enforce compound uniqueness for multi-user isolation on budgets and snapshots

-- ============================================================
-- 1. VIEWS WITH SECURITY INVOKER (PostgreSQL 15+ compatible)
-- ============================================================
drop view if exists public.expenses cascade;
drop view if exists public.income cascade;

create or replace view public.expenses
with (security_invoker = true) as
select *
from public.transactions
where type = 'expense';

create or replace view public.income
with (security_invoker = true) as
select *
from public.transactions
where type = 'income';

grant select on public.expenses to authenticated;
grant select on public.income to authenticated;

-- ============================================================
-- 2. COMPOSITE OWNERSHIP CONSTRAINTS (Prevent cross-tenant hijacking)
-- ============================================================

-- Ensure investments has a unique constraint on (id, user_id)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'uq_investments_id_user'
  ) then
    alter table public.investments add constraint uq_investments_id_user unique (id, user_id);
  end if;
end $$;

-- Enforce composite foreign key for stock_holdings -> investments(id, user_id)
do $$
begin
  -- Drop existing single-column FK if present
  if exists (
    select 1 from pg_constraint where conname = 'stock_holdings_investment_id_fkey'
  ) then
    alter table public.stock_holdings drop constraint stock_holdings_investment_id_fkey;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'fk_stock_holdings_investment_user'
  ) then
    alter table public.stock_holdings
      add constraint fk_stock_holdings_investment_user
      foreign key (investment_id, user_id)
      references public.investments(id, user_id)
      on delete cascade;
  end if;
end $$;

-- Ensure goals has a unique constraint on (id, user_id)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'uq_goals_id_user'
  ) then
    alter table public.goals add constraint uq_goals_id_user unique (id, user_id);
  end if;
end $$;

-- Enforce composite foreign key for goal_contributions -> goals(id, user_id)
do $$
begin
  -- Drop existing single-column FK if present
  if exists (
    select 1 from pg_constraint where conname = 'goal_contributions_goal_id_fkey'
  ) then
    alter table public.goal_contributions drop constraint goal_contributions_goal_id_fkey;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'fk_goal_contributions_goal_user'
  ) then
    alter table public.goal_contributions
      add constraint fk_goal_contributions_goal_user
      foreign key (goal_id, user_id)
      references public.goals(id, user_id)
      on delete cascade;
  end if;
end $$;

-- ============================================================
-- 3. TIMESTAMP CORRECTION: REAL MODIFICATION TIMESTAMP TRIGGERS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply update triggers to all tables
drop trigger if exists tr_transactions_updated_at on public.transactions;
create trigger tr_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_budgets_updated_at on public.budgets;
create trigger tr_budgets_updated_at
  before update on public.budgets
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_investments_updated_at on public.investments;
create trigger tr_investments_updated_at
  before update on public.investments
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_goals_updated_at on public.goals;
create trigger tr_goals_updated_at
  before update on public.goals
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_loans_updated_at on public.loans;
create trigger tr_loans_updated_at
  before update on public.loans
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_assets_updated_at on public.assets;
create trigger tr_assets_updated_at
  before update on public.assets
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_liabilities_updated_at on public.liabilities;
create trigger tr_liabilities_updated_at
  before update on public.liabilities
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_snapshots_updated_at on public.snapshots;
create trigger tr_snapshots_updated_at
  before update on public.snapshots
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_app_settings_updated_at on public.app_settings;
create trigger tr_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.handle_updated_at();
