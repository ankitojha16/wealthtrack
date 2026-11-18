# Changelog — WealthTrack

All notable changes to the WealthTrack personal finance platform are documented in this file.

---

## [2.0.0] — Production Transformation & Product Upgrade (November 2026)

### Added
- **Multi-Tenant Scoped Primary Keys:**
  - Scoped budget primary keys to `b_${userId}_${category}` to eliminate duplicate key collision errors between users.
  - Scoped snapshot primary keys to `snap_${userId}_${monthYear}` to eliminate collision errors on monthly net worth records.
  - Scoped app settings primary keys to `${key}:${userId}`.
- **Smart Reminders & Insights Banner:**
  - Added real-time data-driven alerts on the Dashboard for upcoming EMI obligations, budget utilization warnings (>80%), and monthly net worth snapshot reminders.
- **Ledger Controls & Timeframe Filtering:**
  - Added "Selected Month" vs "All Time" period toggle on the `/budget` transaction ledger.
  - Added one-click CSV export button for transactions directly on the budget page.
- **Auth Redirects & Navigation Guards:**
  - Added deep route redirection (`?redirect=...`) support with `<Suspense>` handling in `src/app/auth/page.tsx` and `src/components/auth/AuthScreen.tsx`.
  - Added protected route verification guard in `AppShell.tsx` for `/dashboard`, `/budget`, `/investments`, `/goals`, `/loans`, `/reports`, and `/settings`.
- **User Authentication Header State:**
  - Added user email display and quick "Sign Out" button to both desktop `Navbar.tsx` and mobile `MobileNav.tsx`.
- **Cryptographic Local Password Hashing:**
  - Replaced plaintext localStorage password storage with salted SHA-256 Web Crypto hashing in `localAuth.ts`.
- **Settings Data Management Suite:**
  - Restored full account information view, JSON backup download, CSV exports for transactions/investments/loans, backup file restore, and two-step permanent data reset modal.
- **Automated Regression Test Suite:**
  - Added `tests/smart-insights.test.js` (budget status, savings rates, solvency).
  - Added `tests/financial-health-engine.test.js` (6-pillar score evaluation and edge cases).
  - Added `tests/database-isolation.test.js` (multi-tenant key scoping).
  - Added `tests/snapshot-schema.test.js` (`net_worth` <-> `netWorth` bidirectional mapping).
  - Added `tests/budget-calculations.test.js` (month-isolated category spending).
  - Added `tests/auth-hash.test.js` (cryptographic password hashing).

### Fixed
- **P0 Supabase Anon Key Mismatch:** Aligned `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project JWT token and added fallback key resolution in `client.ts`.
- **P0 Schema Mismatch:** Fixed `net_worth` (Postgres snake_case) vs `netWorth` (TypeScript camelCase) discrepancy with bidirectional normalization.
- **P1 Lifetime Transaction Summation:** Corrected `/budget` category spending calculations to filter strictly by the active month instead of summing all historical transactions.
- **P1 Initial Mount Waterfall:** Added `refreshingPromiseRef` mutex lock in `FinanceContext.tsx`, reducing concurrent initial mount queries from 27 down to 1 coordinated batch.
- **P1 State Leakage on Sign Out:** Added explicit in-memory data wiping in `signOutUser()`.
- **P1 Savings Formula Standardization:** Standardized monthly savings across all components to canonical formula: `Monthly Savings = Monthly Income - Monthly Expenses`.
- **P2 Stock Quote Waterfall:** Parallelized sequential stock price fetching loop using `Promise.allSettled`.
- **P2 Form Submissions:** Wrapped modal inputs in HTML `<form>` wrappers across Transaction, Goal, Loan, and Investment modals for seamless Enter-key submissions.
- **P2 Code Duplication:** Re-exported `src/app/page.tsx` from `src/app/dashboard/page.tsx`, removing 320 lines of redundant duplicate code.

### Changed
- Database migration script `20260921_create_wealthtrack_schema.sql` updated with compound performance indexes (`idx_transactions_user_date`, `idx_budgets_user_category`, `idx_snapshots_user_month`, etc.).
- Overview card label updated to reflect canonical savings formula (`Income - Expense`).
- All 24 automated tests passing in 137ms.
- 63 / 63 production pages compiled cleanly with zero TypeScript errors and zero ESLint warnings.
