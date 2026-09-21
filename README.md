# WealthTrack

> **Track Your Money. Understand Your Wealth.**  
> *Founded by ANKIT KUMAR*

WealthTrack is a production-ready, privacy-focused personal finance web application built with Next.js App Router, React 18, TypeScript, and Tailwind CSS. It is architected from first principles to be **100% API-free**, requiring zero live market feeds, banking scrapers, or external tracking services.

---

## 🌟 Core Philosophy

- **Zero API Dependency:** No stock APIs, mutual fund APIs, banking aggregators, or crypto scrapers. All investment valuations and balance sheet figures are maintained directly and timestamped by you.
- **100% Privacy & Local Storage:** All records reside inside your browser’s IndexedDB (with graceful fallback). Your net worth, salaries, and debts are never sent to external servers.
- **No Fake Data or Hallucinated History:** WealthTrack never generates artificial historical trends. Empty states guide the user cleanly until real ledger entries build authentic trends.
- **Progressive Web App (PWA):** Equipped with a service worker (`/sw.js`) and manifest (`/manifest.json`) for installation on desktop and mobile with full offline functionality.

---

## 🚀 Key Features

### 1. Financial Overview Dashboard
- Dynamic time-aware greeting (*Good morning / afternoon / evening 👋*).
- 4 Primary Balance Sheet Cards: **Total Assets**, **Total Liabilities**, **Net Worth**, and **Monthly Savings**.
- Algorithmic **Financial Health Score (0-100)** with individual component scores (Savings, Debt, Emergency Fund, Goals, Investments) and transparent factors checklist (*WHAT IS AFFECTING YOUR SCORE?*).
- Quick Actions shortcut bar to record Expenses, Incomes, Investments, Goals, or Loans in seconds.
- Interactive SVG Net Worth trend chart and Expense distribution donut chart.

### 2. Budget & Expense Tracker (`/budget`)
- Monthly income and expense budget manager.
- Category spending thresholds (Food, Transport, Housing, Education, Shopping, Entertainment, Bills, Healthcare, Travel, Other + Custom Categories).
- Category progress bars highlighting utilized limits, remaining amounts, and over-budget warnings.
- Full ledger with search, filtering by type/category/payment method, and sorting.
- Double-submission guard preventing accidental duplicate clicks.

### 3. Manual Investments Portfolio (`/investments`)
- Supports: Mutual Funds, FD, RD, PPF, EPF, NPS, Gold, Bonds, Cash, and Other Investments.
- Cost basis tracking vs Current Value.
- Computes absolute gain/loss and annualized return percentages.
- Mandatory transparent labeling on every asset: *"Investment values are entered and updated by you. Last updated: [date]"*.
- Rapid "Update Current Value" modal with today's timestamp.

### 4. Financial Goals (`/goals`)
- Goal categories: Emergency Fund, Education, Laptop, Vehicle, Travel, Home, Personal Goal, Custom Goal.
- Computes remaining target, required monthly contribution, and progress percentages.
- Direct "Log Contribution" action.

### 5. Loans & Debt Manager (`/loans`)
- Explicitly answers: **"How many EMIs are left?"**
- Tracks Personal Loans, Home Loans, Car Loans, Education Loans, and Credit Cards.
- Shows total outstanding debt, monthly EMI obligations, total pending installments, estimated total remaining payable cash outflow, and repayment percentage.
- "Paid EMI" one-click action to advance remaining EMIs.

### 6. Master Financial Reports (`/reports`)
- Consolidated Master Balance Sheet.
- 8 Useful Visual Visualizations: Net Worth Trend, Assets vs Liabilities, Investment Distribution, Category Expenses, Solvency Ratio, and Goal Velocity.
- Monthly Cash Flow Statement with Month-over-Month variance analysis (e.g. comparing August vs September).
- Dedicated Financial Health Diagnostic Audit with informational observations.

### 7. Financial Calculators Hub (`/calculators`)
19 dedicated financial calculators with live sliders, instant charts/tables, mathematical formulas, worked examples, and Schema.org `FAQPage` JSON-LD:
1. EMI Calculator
2. SIP Calculator
3. Lumpsum Calculator
4. Compound Interest Calculator
5. Simple Interest Calculator
6. Fixed Deposit (FD) Calculator
7. Recurring Deposit (RD) Calculator
8. Public Provident Fund (PPF) Calculator
9. CAGR Calculator
10. XIRR Calculator (Newton-Raphson numerical solver)
11. Inflation Calculator
12. Loan Prepayment Calculator
13. Savings Goal Calculator
14. Emergency Fund Calculator
15. Net Worth Calculator
16. 50/30/20 Budget Calculator
17. Percentage Calculator
18. Discount Calculator
19. GST Calculator

### 8. Learn Knowledge Center (`/learn`)
14 high-value, SEO-optimized educational articles with structured headings, practical takeaways, FAQs, and Schema.org `Article` structured data:
- What is SIP?
- What is CAGR?
- What is XIRR?
- What is Compound Interest?
- What is Inflation?
- What is an Emergency Fund?
- What is Net Worth?
- What is EMI?
- Principal vs Interest
- FD vs RD
- SIP vs Lumpsum
- How to Calculate Savings Rate
- How to Calculate Net Worth
- How to Calculate EMI

### 9. Privacy, Data & Settings (`/settings`)
- Multiple currency support: INR (`₹`), USD (`$`), EUR (`€`), GBP (`£`).
- Indian numbering system (`₹1,00,000`, Lakhs, Crores) and International numbering system.
- Light / Dark / System theme switch.
- Export Data: Full JSON database snapshot and CSV spreadsheets for transactions, investments, and loans.
- Import Data: Backup restoration with schema validation.
- Permanent Wipe: Danger zone with required `DELETE` keyword confirmation.
- Direct Feedback: Structured feedback modal routed to configured `SUPPORT_EMAIL`.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark/Light mode via CSS variables & class strategy)
- **Icons:** Lucide React
- **Storage:** Client-side IndexedDB with transactional safety and LocalStorage fallback
- **PWA:** Web App Manifest + Service Worker with offline caching
- **Testing:** Node.js native test runner (`node:test`)

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Math & Financial Unit Tests
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

### 5. Start Production Server
```bash
npm start
```

---

## 📄 License & Attribution

© 2026 WealthTrack. All rights reserved.  
**Founded by ANKIT KUMAR**
