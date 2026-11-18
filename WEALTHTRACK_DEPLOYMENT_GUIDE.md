# WealthTrack 2.0 — Production Deployment & DevOps Guide

**Target Platform:** Vercel  
**Database Backend:** Supabase PostgreSQL  
**Repository Accounts:** GitHub & Vercel (`ankitojha16`), Supabase (`a.kumarankit750@gmail.com`)  
**Deployment Status:** **READY FOR DEPLOYMENT**

---

## 1. Environment Variables Configuration

In your Vercel Project Dashboard (`Settings -> Environment Variables`), ensure the following variables are configured across Production and Preview scopes:

| Variable | Description | Scope | Mandatory |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://[project-ref].supabase.co`) | Client & Server | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project JWT Anonymous Key | Client & Server | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Server-side Operations Key | Server Only (Secret) | Optional |
| `NEXT_PUBLIC_TEJ_API_KEY` | External Indian stock market quotes provider | Client & Server | Optional |

> [!IMPORTANT]
> **Key Verification:** Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the authentic Supabase JWT anon key (starts with `eyJ...`), matching `SUPABASE_ANON_KEY`.

---

## 2. Supabase Database Migration Steps

1. Log into your Supabase Dashboard at [supabase.com](https://supabase.com) using `a.kumarankit750@gmail.com`.
2. Select your WealthTrack project.
3. Navigate to **SQL Editor** -> **New Query**.
4. Open the migration file: `supabase/migrations/20260921_create_wealthtrack_schema.sql`.
5. Copy the SQL script and run it. This provisions:
   - Tables: `profiles`, `transactions`, `budgets`, `investments`, `loans`, `goals`, `snapshots`, `app_settings`
   - Row Level Security (RLS) policies for all tables
   - Multi-tenant compound indexes:
     - `idx_transactions_user_date`
     - `idx_budgets_user_category`
     - `idx_snapshots_user_month`
     - `idx_investments_user`
     - `idx_loans_user`
     - `idx_goals_user`

---

## 3. Supabase Auth URL Configuration

1. In Supabase Dashboard, navigate to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your production Vercel domain:
   ```
   https://wealthtrack.vercel.app
   ```
3. In **Redirect URLs**, add:
   ```
   https://wealthtrack.vercel.app/**
   http://localhost:3000/**
   ```
4. Save changes.

---

## 4. Vercel Deployment Instructions

1. Push the repository to GitHub:
   ```bash
   git push origin main
   ```
2. In Vercel (`ankitojha16`), import the repository or trigger a redeployment.
3. **Build Settings:**
   - **Framework Preset:** Next.js
   - **Build Command:** `next build` (or `npm run build`)
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Confirm build logs:
   - All 63 static pages compile successfully.
   - Zero ESLint errors or typecheck failures.

---

## 5. Post-Deployment Smoke Test Checklist

- [ ] Visit `https://your-domain.vercel.app/auth` and test account creation with email + password.
- [ ] Verify automatic session login and redirect to `/dashboard`.
- [ ] Add an Expense and Income transaction; verify they appear in the ledger immediately.
- [ ] Navigate to `/budget` and configure a monthly spending limit for "Food".
- [ ] Verify that category spending percentage calculates against the active month.
- [ ] Click "Export CSV" to verify transaction ledger downloads properly.
- [ ] Test Dark / Light theme toggle in `/settings`.
- [ ] Click "Logout" and confirm session and financial state are wiped clean.
