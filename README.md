# WealthTrack 2.5

> **Track Your Money. Understand Your Wealth.**  
> Founded by **ANKIT KUMAR**  
> **GitHub:** [https://github.com/ankitojha16/wealthtrack](https://github.com/ankitojha16/wealthtrack)  
> **Production:** [https://wealthtrack-gamma.vercel.app/](https://wealthtrack-gamma.vercel.app/)

WealthTrack is an all-in-one personal finance platform designed for tracking cash flow, category budgets, investments, financial goals, loans, assets, liabilities, and net worth. It is built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, **Supabase Auth**, and **PostgreSQL with Row-Level Security (RLS)**.

---

## 🌟 What's New in WealthTrack 2.5

- **Fixed First Login / Sign-in Experience:**
  - Auto-confirmed registration eliminates the unverified email deadlock, allowing new users to sign up and immediately access their dashboard.
  - Interactive password strength meter with dynamic visual scoring and real-time criteria verification (length, numbers, uppercase, special characters).
  - Show / hide password toggles on both password and confirmation fields.
  - "Remember Email" support persisted locally on the client.
- **1-Click Demo with Pre-populated Portfolio:**
  - Instant access with rich, realistic financial starter data (equity index funds, PPF, gold SGBs, high-yield FDs, goals, auto loan schedules, and 6-month net worth trend curves).
  - First-time user welcome card on the dashboard and in Settings.
- **Portfolio Rebalancer & Asset Allocation:** Target vs. actual allocation matrix with automatic rebalancing buy/sell recommendations.
- **Subscriptions & Recurring Bills:** Monthly recurring obligations tracker with frequency calculations and annual burn rates.
- **FIRE Simulator:** Comprehensive financial independence simulator computing Lean FIRE, Standard FIRE, and Fat FIRE milestone dates.
- **Dual Tax Regime Engine:** Side-by-side comparison of Indian Old vs. New Tax Regimes (with Section 87A rebate and standard deductions).
- **Loan Amortization & Prepayment Simulator:** Interactive prepayment schedules calculating total interest saved and tenure reduction.
- **CSV Statement Importer:** Flexible CSV parser mapping debit/credit bank statements directly into categorized transactions.
- **20 Financial Calculators:** Complete catalog of personal finance, investment, and loan calculators.

---

## 🚀 Core Capabilities

1. **Balance Sheet & Net Worth:**
   - Real-time aggregation of total assets, debts, and liquid reserves.
   - Historical monthly snapshots for visual net worth progression.
2. **Algorithmic Financial Health Score (0–100):**
   - Autonomous grading based on savings rate, emergency runway, debt service ratio, and investment diversification.
3. **Multi-Tenant Budget Planner:**
   - Monthly category spending limits with user-scoped primary keys to prevent multi-user database collisions.
4. **Investment Portfolio Tracker:**
   - Manual tracking for SIPs, Lumpsum mutual funds, equities, PPF, gold, and fixed deposits with CAGR/XIRR calculators.
5. **Goal Milestones & Debt Amortization:**
   - Target milestones with contribution tracking and loan repayment schedules.
6. **Privacy & Offline First (PWA):**
   - Progressive Web App with client-side caching and offline IndexedDB fallback.

---

## 🔐 Architecture: Storage & Authentication Modes

WealthTrack supports dual operating modes depending on environment configuration:

### 1. Supabase Mode (Cloud Synchronized)
When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided:
- **Authentication Authority:** Supabase Auth (GoTrue) is the sole authority. User passwords are encrypted server-side using bcrypt over TLS. No passwords or password hashes are ever stored in client `localStorage`.
- **Verified Password Recovery:** Password resets are handled via secure email recovery links dispatched to the user's verified address.
- **Database Isolation & Security:** All PostgreSQL tables have Row Level Security enabled (`ROW LEVEL SECURITY ENABLED`). Access is restricted using `auth.uid() = user_id`.
- **Security Invoker Views:** Database views (`public.expenses`, `public.income`) enforce `WITH (security_invoker = true)` to respect RLS policies.
- **Composite Ownership Constraints:** Child tables (`stock_holdings`, `goal_contributions`) utilize composite foreign keys `(investment_id, user_id)` and `(goal_id, user_id)` preventing cross-tenant attachment.

### 2. Local-Only Mode (Offline / Guest)
When Supabase environment variables are omitted or when choosing Guest Demo:
- The app operates as an offline guest workspace (`isGuest: true`).
- Financial records are stored exclusively inside the browser's IndexedDB (`WealthTrackDB`) with fallback to scoped local storage.
- **Data Preservation Migration:** When a user with local data creates or logs into a Supabase account, their local records are safely migrated to the cloud without deleting or corrupting local offline records.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **UI Library:** [React 18](https://react.dev/) & [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) & [PostgreSQL](https://www.postgresql.org/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Local Database:** IndexedDB with localStorage fallback
- **Testing:** Node.js native test runner (`node:test`, `node:assert/strict`)

---

## ⚙️ Environment Variables

Configure the following variables in `.env.local` for local development or within the Vercel project settings:

```dotenv
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ccxeejvnrwfqgkegqqnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Stock Market Data (Optional)
TEJHQ_API_KEY=tej_live_...
TEJHQ_BASE_URL=https://api.tejhq.dev
```

> [!WARNING]
> Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Never prefix it with `NEXT_PUBLIC_` and never expose it in client-side bundles.

---

## 🧪 Development & Verification

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run automated test suites (48 tests covering Auth, RLS, Math, Budgets, Redirects)
npm test

# Type safety check
npx tsc --noEmit

# Lint check
npm run lint

# Production compilation (Builds all 64 static & dynamic routes)
npm run build

# Start production server
npm start
```

---

## 🛡️ Privacy & Security Highlights

- **Zero Plaintext/Hash Client Storage:** Client `localStorage` is automatically purged of legacy user tables.
- **Open Redirect Protection:** All navigation flows validate destination paths using `sanitizeRedirectUrl` to reject external URL forwarding.
- **Fault-Tolerant State Hydration:** In the event of a network disruption or database failure, the app preserves previously loaded in-memory data rather than displaying false zero balances.

---

## 📄 License

© 2026 WealthTrack. All rights reserved.  
Founded by **ANKIT KUMAR**
