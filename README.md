# WealthTrack

> **Track Your Money. Understand Your Wealth.**  
> Founded by ANKIT KUMAR

WealthTrack is a personal finance app for tracking budgets, investments, goals, loans, assets, liabilities, and net worth. It is built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard and reports:** Review cash flow, net worth, assets, liabilities, and financial health.
- **Budgeting:** Record income and expenses, set category limits, and review spending.
- **Investments:** Track manually entered balances and returns for supported investment types.
- **Goals and loans:** Track goal contributions, loan balances, and EMI progress.
- **Calculators and learning:** Use financial calculators and browse personal-finance articles.
- **Export and import:** Back up financial records using the tools in Settings.
- **Offline support:** The installable PWA uses a service worker to cache parts of the app.

## Data storage and authentication

The app supports two modes:

- **Supabase mode:** When a Supabase URL and anon key are configured, users can sign up and sign in, and authenticated financial records sync to Supabase.
- **Local-only mode:** Without Supabase configuration, accounts and financial records are stored in the browser. They are not synced across devices.

Local-only accounts and Supabase accounts are separate. A local-only account is not migrated when Supabase is configured later.

### Configure Supabase

1. Create a Supabase project and apply [`supabase/migrations/20260921_create_wealthtrack_schema.sql`](supabase/migrations/20260921_create_wealthtrack_schema.sql) to its database.
2. Set these environment variables for the app:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
   ```

   The service-role key is required by server-side signup and password recovery routes. Keep it secret: do not prefix it with `NEXT_PUBLIC_` or commit it to source control.
3. Configure the same variables in your hosting provider and redeploy after changing them.

For local development, create `.env.local` in the project root and add the variables there. If Supabase variables are omitted, the app runs in local-only mode.

## Getting started

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests and production build

```bash
npm test
npm run build
npm start
```

`npm start` serves the production build created by `npm run build`.

## Deployment

The project is configured for Vercel. Connect the GitHub repository to the Vercel project, configure the production environment variables above, and deploy the `main` branch. Keep secrets in Vercel’s Environment Variables settings, not in Git.

## Tech stack

- Next.js App Router and React
- TypeScript and Tailwind CSS
- Supabase Auth and Postgres for synced accounts; browser storage for local-only mode
- Node.js native test runner (`node:test`)

## License

© 2026 WealthTrack. All rights reserved.  
Founded by ANKIT KUMAR
