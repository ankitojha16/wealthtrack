# WealthTrack 2.1

> **Track Your Money. Understand Your Wealth.**  
> Founded by ANKIT KUMAR  
> **GitHub:** [https://github.com/ankitojha16/wealthtrack](https://github.com/ankitojha16/wealthtrack)  
> **Production:** [https://wealthtrack-gamma.vercel.app/](https://wealthtrack-gamma.vercel.app/)

WealthTrack is a personal finance management platform designed for tracking cash flow, category budgets, investments, financial goals, loans, assets, liabilities, and net worth. It is engineered with Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Supabase Auth, and PostgreSQL with Row-Level Security (RLS).

---

## Core Capabilities

- **Financial Dashboard & Health Score:** Real-time net worth calculation, liquid emergency fund runway, debt-to-income metrics, and algorithmic financial health grading (0–100).
- **Multi-Tenant Budget Planner:** Monthly spending limits per category with user-scoped primary keys to prevent multi-user collisions.
- **Investment Portfolio:** Manual tracking for SIPs, Lumpsum mutual funds, and fixed deposits with automated annualized CAGR/XIRR calculators.
- **Goals & Debt Management:** Goal milestone tracking with contribution history and comprehensive loan EMI amortization schedules.
- **Financial Calculators & Learning:** Interactive calculators for EMI, SIP, PPF (80C capped), SWP, and compound interest.
- **Offline & PWA Support:** Progressive Web App with client-side caching and offline local fallback.

---

## Architecture: Storage & Authentication Modes

WealthTrack supports dual operating modes depending on environment configuration:

### 1. Supabase Mode (Cloud Synchronized)
When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided:
- **Authentication Authority:** Supabase Auth (GoTrue) is the sole authority. User passwords are encrypted server-side using bcrypt over TLS. No passwords or password hashes are ever stored in client browser `localStorage`.
- **Verified Password Recovery:** Password resets are handled via secure, verified email recovery links dispatched to the user's verified address (`supabase.auth.resetPasswordForEmail`).
- **Database Isolation & Security:** All PostgreSQL tables have Row Level Security (`ROW LEVEL SECURITY ENABLED`). Access is restricted using `auth.uid() = user_id`.
- **Security Invoker Views:** Database views (`public.expenses`, `public.income`) enforce `WITH (security_invoker = true)` to ensure view queries respect the calling tenant's RLS policies.
- **Composite Ownership Constraints:** Child tables (`stock_holdings`, `goal_contributions`) utilize composite foreign keys `(investment_id, user_id)` and `(goal_id, user_id)` preventing cross-user entity attachment.

### 2. Local-Only Mode (Offline / Guest)
When Supabase environment variables are omitted:
- The app operates as an offline guest workspace (`isGuest: true`).
- Financial records are stored exclusively inside the browser's IndexedDB (`WealthTrackDB`) with fallback to scoped local storage.
- **Data Preservation Migration:** When a user with local data creates or logs into a Supabase account, their local records are safely migrated to the cloud without deleting or corrupting local offline records.

---

## Database Configuration & SQL Migrations

To configure the PostgreSQL database on Supabase:
1. Log in to the Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Apply the migrations in sequential order:
   - [`supabase/migrations/20260921_create_wealthtrack_schema.sql`](supabase/migrations/20260921_create_wealthtrack_schema.sql) (Base schema, tables, compound indexes, and RLS policies).
   - [`supabase/migrations/20261119_wealthtrack_2_1_security_fixes.sql`](supabase/migrations/20261119_wealthtrack_2_1_security_fixes.sql) (Security invoker views, composite ownership constraints, and `handle_updated_at` modification triggers).

---

## Environment Variables

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

## Development & Testing

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run automated test suites (34 tests covering Auth, RLS, Math, Budgets, Redirects)
npm test

# Type safety check
npx tsc --noEmit

# Lint check
npm run lint

# Production compilation
npm run build

# Start production server
npm start
```

---

## Privacy & Security Commitment

- **Zero Plaintext/Hash Client Storage:** Client `localStorage` is automatically purged of legacy user tables.
- **Open Redirect Protection:** All navigation flows validate destination paths using `sanitizeRedirectUrl` to reject external URL forwarding.
- **Fault-Tolerant State Hydration:** In the event of a network disruption or database failure, the app preserves previously loaded in-memory data rather than displaying false zero balances.

---

## License

© 2026 WealthTrack. All rights reserved.  
Founded by ANKIT KUMAR
