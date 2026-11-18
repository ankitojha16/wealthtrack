# WealthTrack 2.0 — Production Bug Register & Remediation Log

This register documents all identified defects, security vulnerabilities, calculation anomalies, and architectural deficiencies discovered during the audit, along with their verified solutions.

---

## Bug Index Summary

- **Total Issues Logged:** 18
- **Critical (P0):** 4
- **High (P1):** 7
- **Medium (P2):** 7
- **Resolved:** 18 (100%)
- **Pending:** 0

---

## Detailed Issue Register

### Issue 1: Supabase Anonymous Key Mismatch
- **ID:** `BUG-01`
- **Module:** Authentication & Client SDK
- **Severity:** **P0 (Critical)**
- **Root Cause:** `.env.local` configured `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a non-JWT publishable string (`sb_publishable_...`) while `SUPABASE_ANON_KEY` contained the authentic Supabase JWT anon key. When initialized in the browser, Supabase Auth returned invalid JWT signature errors.
- **Evidence & Affected Files:** `.env.local`, `src/lib/supabase/client.ts`
- **Steps to Reproduce:**
  1. Initialize app with `.env.local`.
  2. Attempt to sign up or sign in via Supabase.
  3. Network requests fail with HTTP 400/401 JWT signature rejection.
- **Solution:** Aligned `NEXT_PUBLIC_SUPABASE_ANON_KEY` to use the valid project JWT token and implemented `resolveSupabaseAnonKey()` in `client.ts` for automatic fallback resolution.
- **Status:** **RESOLVED**

---

### Issue 2: Multi-Tenant Primary Key Collision on `budgets`
- **ID:** `BUG-02`
- **Module:** Database & RLS
- **Severity:** **P0 (Critical)**
- **Root Cause:** Primary key in table `budgets` was generated as `b_${category}` (e.g. `b_Food`). When a second authenticated user configured a budget for "Food", PostgreSQL rejected the insert with: `duplicate key value violates unique constraint "budgets_pkey"` because RLS prevented updating another tenant's row.
- **Evidence & Affected Files:** `src/lib/supabase/repository.ts`, `src/lib/supabase/payloadBuilder.ts`, `src/lib/context/FinanceContext.tsx`
- **Steps to Reproduce:**
  1. User A creates budget for "Food".
  2. User B creates budget for "Food".
  3. User B receives a fatal database constraint violation.
- **Solution:** Scoped IDs deterministically by user: `b_${userId}_${category}` in `prepareRecordPayload` and `FinanceContext.tsx`.
- **Status:** **RESOLVED**

---

### Issue 3: Multi-Tenant Primary Key Collision on `snapshots`
- **ID:** `BUG-03`
- **Module:** Database & RLS
- **Severity:** **P0 (Critical)**
- **Root Cause:** Monthly snapshots used `snap_${monthYear}` (e.g. `snap_2026-10`) as primary key, colliding whenever multiple users saved snapshots in the same month.
- **Evidence & Affected Files:** `src/lib/supabase/repository.ts`, `src/lib/supabase/payloadBuilder.ts`, `src/lib/context/FinanceContext.tsx`
- **Steps to Reproduce:**
  1. User A records a monthly net worth snapshot for `2026-10`.
  2. User B records a monthly net worth snapshot for `2026-10`.
  3. Postgres rejects User B's insert with unique constraint violation.
- **Solution:** Scoped snapshot IDs deterministically by user: `snap_${userId}_${monthYear}`.
- **Status:** **RESOLVED**

---

### Issue 4: Schema Discrepancy on `net_worth` vs `netWorth`
- **ID:** `BUG-04`
- **Module:** Data Schema & Visual Analytics
- **Severity:** **P0 (Critical)**
- **Root Cause:** PostgreSQL schema defined `net_worth` (snake_case), while frontend models expected `netWorth` (camelCase). Historical trend charts received `undefined` and plotted zero values.
- **Evidence & Affected Files:** `src/lib/supabase/repository.ts`, `src/lib/supabase/payloadBuilder.ts`, `supabase/migrations/20260921_create_wealthtrack_schema.sql`
- **Steps to Reproduce:**
  1. Query historical snapshots from Supabase.
  2. Inspect snapshot payload in `FinanceContext`.
  3. `netWorth` is `undefined`, causing trend charts to render flat lines.
- **Solution:** Implemented bidirectional normalization in `prepareRecordPayload` and `listRecords`, ensuring both `netWorth` and `net_worth` are populated seamlessly.
- **Status:** **RESOLVED**

---

### Issue 5: Missing Route Guarding on Protected Pages
- **ID:** `BUG-05`
- **Module:** Security & Navigation
- **Severity:** **P1 (High)**
- **Root Cause:** Routes (`/`, `/dashboard`, `/budget`, `/investments`, `/goals`, `/loans`, `/reports`, `/settings`) lacked session verification guards in `AppShell.tsx`.
- **Evidence & Affected Files:** `src/components/common/AppShell.tsx`
- **Steps to Reproduce:**
  1. Open incognito window without active session.
  2. Navigate directly to `/budget`.
  3. Page loaded unauthenticated.
- **Solution:** Added route protection check in `AppShell` with smooth redirect to `/auth?redirect=[destination]`.
- **Status:** **RESOLVED**

---

### Issue 6: Plaintext Password Storage in Local Fallback Auth
- **ID:** `BUG-06`
- **Module:** Security
- **Severity:** **P1 (High)**
- **Root Cause:** Local fallback authentication stored user credentials in `localStorage` with raw plaintext passwords.
- **Evidence & Affected Files:** `src/lib/auth/localAuth.ts`, `tests/auth-hash.test.js`
- **Steps to Reproduce:**
  1. Register local account.
  2. Open DevTools -> Application -> Local Storage.
  3. User's password was visible in plain text.
- **Solution:** Upgraded storage to cryptographic salted SHA-256 password hashing using the Web Crypto API, with backward compatibility for existing records.
- **Status:** **RESOLVED**

---

### Issue 7: Lifetime Transaction Summation on Budget Page
- **ID:** `BUG-07`
- **Module:** Financial Calculation
- **Severity:** **P1 (High)**
- **Root Cause:** Category spending totals on `/budget` calculated expenses across all lifetime transactions instead of the active month.
- **Evidence & Affected Files:** `src/app/budget/page.tsx`, `tests/budget-calculations.test.js`
- **Steps to Reproduce:**
  1. Create expense in January.
  2. Switch to March budget view.
  3. January expense was counted against March's budget limit.
- **Solution:** Filtered category spending strictly by `selectedMonth` (`t.date.startsWith(selectedMonth)`).
- **Status:** **RESOLVED**

---

### Issue 8: In-Memory State Leakage on User Logout
- **ID:** `BUG-08`
- **Module:** Privacy & Session Management
- **Severity:** **P1 (High)**
- **Root Cause:** Logging out cleared the Supabase session token but left React context state populated with the previous user's transactions and net worth.
- **Evidence & Affected Files:** `src/lib/context/FinanceContext.tsx`
- **Steps to Reproduce:**
  1. User A logs out.
  2. User B signs in on same browser.
  3. User A's balances briefly flashed before User B's records loaded.
- **Solution:** Reset all state arrays to empty models (`transactions: []`, `investments: []`, `loans: []`, `budgets: []`) inside `signOutUser()`.
- **Status:** **RESOLVED**

---

### Issue 9: Initial Mount Query Waterfall
- **ID:** `BUG-09`
- **Module:** Performance & Latency
- **Severity:** **P1 (High)**
- **Root Cause:** Simultaneous uncoordinated calls to `refreshData()` on component mount generated up to 27 parallel requests.
- **Evidence & Affected Files:** `src/lib/context/FinanceContext.tsx`
- **Steps to Reproduce:**
  1. Open Network DevTools.
  2. Refresh dashboard.
  3. Multiple identical table queries fired concurrently.
- **Solution:** Implemented `refreshingPromiseRef` deduplication lock in `FinanceContext`, consolidating initial loads into 1 coordinated fetch batch.
- **Status:** **RESOLVED**

---

### Issue 10: Sequential Stock Quote Refresh Waterfall
- **ID:** `BUG-10`
- **Module:** Performance
- **Severity:** **P2 (Medium)**
- **Root Cause:** `handleRefreshStockPrices` iterated through stock holdings sequentially in a `for` loop, causing linear delay.
- **Evidence & Affected Files:** `src/app/investments/page.tsx`
- **Steps to Reproduce:**
  1. Add 10 stock holdings.
  2. Click "Refresh Prices".
  3. Network requests queued sequentially.
- **Solution:** Parallelized quote fetching using `Promise.allSettled`.
- **Status:** **RESOLVED**

---

### Issue 11: Missing Settings Data Management Suite
- **ID:** `BUG-11`
- **Module:** Features & Data Portability
- **Severity:** **P1 (High)**
- **Root Cause:** Settings page lacked account profile details, JSON backup export, CSV exports for transactions/investments/loans, and data reset modal.
- **Evidence & Affected Files:** `src/app/settings/page.tsx`
- **Steps to Reproduce:**
  1. Navigate to `/settings`.
  2. Data management controls were absent.
- **Solution:** Restored full Data Management UI with JSON backup, CSV download triggers, JSON file restore, and two-step confirmation modal for data deletion.
- **Status:** **RESOLVED**

---

### Issue 12: Missing Enter-Key Form Submissions Across Modals
- **ID:** `BUG-12`
- **Module:** UX & Form Usability
- **Severity:** **P2 (Medium)**
- **Root Cause:** Modal dialogs for Transactions, Goals, Loans, and Investments used `div` wrappers without form `onSubmit` handlers. Pressing Enter did nothing.
- **Evidence & Affected Files:** `TransactionModal.tsx`, `GoalModal.tsx`, `LoanModal.tsx`, `InvestmentModal.tsx`
- **Steps to Reproduce:**
  1. Open Transaction Modal.
  2. Type amount and press Enter on keyboard.
  3. Modal remained open without saving.
- **Solution:** Wrapped modal bodies in `<form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>`.
- **Status:** **RESOLVED**

---

### Issue 13: Redundant Duplicate Dashboard Route
- **ID:** `BUG-13`
- **Module:** Architecture & Maintainability
- **Severity:** **P2 (Medium)**
- **Root Cause:** `src/app/dashboard/page.tsx` was a 320-line copy-paste clone of `src/app/page.tsx`.
- **Evidence & Affected Files:** `src/app/dashboard/page.tsx`
- **Steps to Reproduce:**
  1. Edit widget on `app/page.tsx`.
  2. `/dashboard` remained unchanged, creating dual-maintenance drift.
- **Solution:** Re-exported `src/app/page.tsx` directly from `src/app/dashboard/page.tsx`.
- **Status:** **RESOLVED**

---

### Issue 14: Unauthenticated Header State & Missing User Controls
- **ID:** `BUG-14`
- **Module:** Navigation & Identity
- **Severity:** **P1 (High)**
- **Root Cause:** Navigation bar showed static links without indicating authenticated status or providing a logout button.
- **Evidence & Affected Files:** `src/components/common/Navbar.tsx`, `src/components/common/MobileNav.tsx`
- **Steps to Reproduce:**
  1. Sign in as user.
  2. Header offered no visual confirmation of user email or sign-out trigger.
- **Solution:** Added dynamic user email badge and Sign Out button to desktop header and mobile drawer.
- **Status:** **RESOLVED**

---

### Issue 15: Monthly Savings Formula Discrepancy
- **ID:** `BUG-15`
- **Module:** Financial Calculation
- **Severity:** **P1 (High)**
- **Root Cause:** Monthly savings was computed differently between Dashboard and Reports.
- **Evidence & Affected Files:** `src/lib/context/FinanceContext.tsx`, `OverviewCards.tsx`, `tests/calculations.test.js`
- **Steps to Reproduce:**
  1. Compare savings metrics between dashboard and reports.
  2. Discrepancy in edge cases where EMI was subtracted twice.
- **Solution:** Enforced canonical formula: `Monthly Savings = Monthly Income - Monthly Expenses`.
- **Status:** **RESOLVED**

---

### Issue 16: Missing Compound Database Indexes
- **ID:** `BUG-16`
- **Module:** Database Performance
- **Severity:** **P2 (Medium)**
- **Root Cause:** PostgreSQL lacked compound indexes on `(user_id, date)` and `(user_id, category)`.
- **Evidence & Affected Files:** `supabase/migrations/20260921_create_wealthtrack_schema.sql`
- **Steps to Reproduce:**
  1. Query transactions filtered by user and month.
  2. Postgres performed sequential table scan.
- **Solution:** Added `idx_transactions_user_date`, `idx_budgets_user_category`, and `idx_snapshots_user_month`.
- **Status:** **RESOLVED**

---

### Issue 17: Post-Login Destination Redirection
- **ID:** `BUG-17`
- **Module:** Authentication & Navigation
- **Severity:** **P2 (Medium)**
- **Root Cause:** Auth screen redirected hardcoded to `/` even when the user arrived from a deep protected URL like `/budget` or `/loans`.
- **Evidence & Affected Files:** `src/components/auth/AuthScreen.tsx`, `src/app/auth/page.tsx`
- **Steps to Reproduce:**
  1. Visit `/budget` unauthenticated.
  2. Redirected to `/auth?redirect=%2Fbudget`.
  3. After login, routed to `/` instead of `/budget`.
- **Solution:** Extracted `searchParams.get('redirect')` inside `Suspense` and routed user directly to requested destination.
- **Status:** **RESOLVED**

---

### Issue 18: Missing Ledger Timeframe & Transaction Filter Controls
- **ID:** `BUG-18`
- **Module:** UI / Budget
- **Severity:** **P2 (Medium)**
- **Root Cause:** Budget page did not offer a way to toggle between current month transactions and all-time ledger, or download transaction CSV directly.
- **Evidence & Affected Files:** `src/app/budget/page.tsx`
- **Steps to Reproduce:**
  1. On budget page, user wanted to see historical transactions across all months.
  2. Filter was constrained without timeframe toggle or instant CSV export.
- **Solution:** Added "Selected Month" vs "All Time" period toggle and one-click CSV export button.
- **Status:** **RESOLVED**
