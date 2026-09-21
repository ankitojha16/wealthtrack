'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatPercent, formatDate, formatMonthYear, getCurrentMonthYearString } from '@/lib/formatters';
import { LineTrendChart } from '@/components/charts/LineTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarComparisonChart } from '@/components/charts/BarComparisonChart';
import {
  FileBarChart2,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  Landmark,
  CreditCard,
  Target,
} from 'lucide-react';

export default function ReportsPage() {
  const {
    transactions,
    investments,
    loans,
    goals,
    snapshots,
    totalAssets,
    totalLiabilities,
    netWorth,
    totalInvested,
    totalInvestmentValue,
    totalInvestmentGain,
    totalLoansOutstanding,
    totalMonthlyEmi,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    financialHealth,
    settings,
    recordCurrentSnapshot,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'health'>('overview');

  // Month selector for Monthly report
  const currentMonthYear = getCurrentMonthYearString();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthYear);
  const [comparisonMonth, setComparisonMonth] = useState<string>('');

  // Available unique months from transactions & snapshots
  const monthsSet = new Set<string>();
  monthsSet.add(currentMonthYear);
  transactions.forEach((t) => monthsSet.add(t.date.substring(0, 7)));
  snapshots.forEach((s) => monthsSet.add(s.monthYear));
  const availableMonths = Array.from(monthsSet).sort().reverse();

  // Selected month calculations
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const selectedIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const selectedExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = selectedIncome - selectedExpenses - totalMonthlyEmi;

  // Comparison month calculations if selected
  const compTransactions = comparisonMonth ? transactions.filter((t) => t.date.startsWith(comparisonMonth)) : [];
  const compIncome = compTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const compExpenses = compTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const compNetCashFlow = compIncome - compExpenses - totalMonthlyEmi;

  // Authentic Snapshots for trend chart
  const trendData = snapshots.map((s) => ({
    label: s.monthYear,
    value: s.netWorth,
  }));

  // Investment distribution data
  const invByType: Record<string, number> = {};
  investments.forEach((inv) => {
    invByType[inv.type] = (invByType[inv.type] || 0) + inv.currentValue;
  });
  const invSegments = Object.entries(invByType).map(([label, value]) => ({
    label,
    value,
    color: '#0284c7',
  }));

  // Expense distribution data
  const expByCategory: Record<string, number> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expByCategory[t.category] = (expByCategory[t.category] || 0) + t.amount;
    });
  const expSegments = Object.entries(expByCategory).map(([label, value]) => ({
    label,
    value,
    color: '#f43f5e',
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Reports & Audits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic analysis of your personal balance sheet, month-over-month cash flow, and financial health score.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Financial Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Monthly & Comparison
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'health'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Health Score Audit
        </button>
      </div>

      {/* ----------------- TAB 1: OVERVIEW ----------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Complete Financial Overview Grid (as required by Section 16) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Master Balance Sheet</h3>
                <p className="text-xs text-slate-500">Live consolidated position of all assets, liabilities, and cash flow</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg">
                Net Worth: {formatCurrency(netWorth, { symbol: settings.currencySymbol })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Assets</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(totalAssets, { symbol: settings.currencySymbol, compact: true })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">User-entered</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Liabilities</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(totalLiabilities, { symbol: settings.currencySymbol, compact: true })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">All debts & loans</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Net Worth</span>
                <span className="text-xl font-black text-sky-600 dark:text-sky-400">
                  {formatCurrency(netWorth, { symbol: settings.currencySymbol, compact: true })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Assets - Liabilities</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Investments</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(totalInvestmentValue, { symbol: settings.currencySymbol, compact: true })}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                  +{formatCurrency(totalInvestmentGain, { symbol: settings.currencySymbol, compact: true })} gain
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Loans</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(totalLoansOutstanding, { symbol: settings.currencySymbol, compact: true })}
                </span>
                <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">
                  {formatCurrency(totalMonthlyEmi, { symbol: settings.currencySymbol })}/mo EMI
                </span>
              </div>
            </div>
          </div>

          {/* Report Charts (Section 17) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Net Worth Trend */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Net Worth Trend</h3>
                  <p className="text-xs text-slate-500">Real snapshots over time (no synthesized history)</p>
                </div>
                <button
                  type="button"
                  onClick={() => recordCurrentSnapshot()}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  + Record Snapshot
                </button>
              </div>

              <LineTrendChart
                data={trendData}
                currencySymbol={settings.currencySymbol}
                onRecordSnapshot={() => recordCurrentSnapshot()}
              />
            </div>

            {/* 2. Assets vs Liabilities */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Assets vs Liabilities</h3>
                <p className="text-xs text-slate-500">Solvency & Debt Exposure</p>
              </div>

              <BarComparisonChart
                currencySymbol={settings.currencySymbol}
                items={[
                  { label: 'Total Assets', value: totalAssets, color: '#0284c7' },
                  { label: 'Total Liabilities', value: totalLiabilities, color: '#f43f5e' },
                ]}
              />

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Debt-to-Asset Ratio</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {totalAssets > 0 ? `${((totalLiabilities / totalAssets) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>

            {/* 3. Investment Distribution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Investment Distribution</h3>
                <p className="text-xs text-slate-500">Asset classes breakdown</p>
              </div>

              <DonutChart
                data={invSegments}
                currencySymbol={settings.currencySymbol}
                emptyMessage="No investments added yet."
              />
            </div>

            {/* 4. Expense Distribution */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Expense Distribution</h3>
                <p className="text-xs text-slate-500">Spending by category for {formatMonthYear(selectedMonth)}</p>
              </div>

              <DonutChart
                data={expSegments}
                currencySymbol={settings.currencySymbol}
                emptyMessage="No expenses recorded for this period."
              />
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: MONTHLY REPORT & COMPARISON (Section 18) ----------------- */}
      {activeTab === 'monthly' && (
        <div className="space-y-8 animate-fade-in">
          {/* Period Selector Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Selected Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthYear(m)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Compare Against:</span>
              <select
                value={comparisonMonth}
                onChange={(e) => setComparisonMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="">None (Single Month)</option>
                {availableMonths
                  .filter((m) => m !== selectedMonth)
                  .map((m) => (
                    <option key={m} value={m}>
                      {formatMonthYear(m)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Month Cash Flow Statement */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {formatMonthYear(selectedMonth)} Financial Statement
              </h3>
              <p className="text-xs text-slate-500">Comprehensive monthly cash flow and obligations breakdown</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">Total Income</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedIncome, { symbol: settings.currencySymbol })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">Living Expenses</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedExpenses, { symbol: settings.currencySymbol })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">Loan EMIs</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalMonthlyEmi, { symbol: settings.currencySymbol })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block">Net Free Cash Flow</span>
                <span className={`text-2xl font-black ${netCashFlow >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}
                  {formatCurrency(netCashFlow, { symbol: settings.currencySymbol })}
                </span>
              </div>
            </div>
          </div>

          {/* Month-over-Month Comparison Table (if comparisonMonth is chosen) */}
          {comparisonMonth ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Period Comparison: {formatMonthYear(comparisonMonth)} vs {formatMonthYear(selectedMonth)}
                </h3>
                <p className="text-xs text-slate-500">Tracking variance across your cash flows</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Metric</th>
                      <th className="p-3.5">{formatMonthYear(comparisonMonth)}</th>
                      <th className="p-3.5">{formatMonthYear(selectedMonth)}</th>
                      <th className="p-3.5">Net Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3.5 font-bold">Income</td>
                      <td className="p-3.5">{formatCurrency(compIncome, { symbol: settings.currencySymbol })}</td>
                      <td className="p-3.5 font-semibold text-emerald-600">{formatCurrency(selectedIncome, { symbol: settings.currencySymbol })}</td>
                      <td className="p-3.5 font-bold">
                        {selectedIncome >= compIncome ? '+' : ''}
                        {formatCurrency(selectedIncome - compIncome, { symbol: settings.currencySymbol })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold">Expenses</td>
                      <td className="p-3.5">{formatCurrency(compExpenses, { symbol: settings.currencySymbol })}</td>
                      <td className="p-3.5 font-semibold text-rose-600">{formatCurrency(selectedExpenses, { symbol: settings.currencySymbol })}</td>
                      <td className="p-3.5 font-bold">
                        {selectedExpenses - compExpenses > 0 ? '+' : ''}
                        {formatCurrency(selectedExpenses - compExpenses, { symbol: settings.currencySymbol })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold">Net Cash Flow</td>
                      <td className="p-3.5">{formatCurrency(compNetCashFlow, { symbol: settings.currencySymbol })}</td>
                      <td className="p-3.5 font-semibold text-sky-600">{formatCurrency(netCashFlow, { symbol: settings.currencySymbol })}</td>
                      <td className="p-3.5 font-bold">
                        {netCashFlow - compNetCashFlow >= 0 ? '+' : ''}
                        {formatCurrency(netCashFlow - compNetCashFlow, { symbol: settings.currencySymbol })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center py-8">
              <p className="text-xs text-slate-500">
                Tip: Select a comparison month above to see a detailed month-over-month variance analysis!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: FINANCIAL HEALTH REPORT (Section 19) ----------------- */}
      {activeTab === 'health' && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Health Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Comprehensive Diagnostic
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Financial Health & Resilience Audit
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithmically scored across 6 objective financial pillars using your entered balance sheet.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-950/60 rounded-2xl border border-sky-100 dark:border-sky-900">
                <div className="text-3xl font-black text-sky-600 dark:text-sky-400">
                  {financialHealth.score}
                </div>
                <div className="text-[11px] leading-tight text-slate-500">
                  <div>Health Index</div>
                  <strong className="text-slate-900 dark:text-white">Out of 100</strong>
                </div>
              </div>
            </div>

            {/* 6 Pillar Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pillar 1: Savings Rate */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">1. Savings Rate</span>
                  <span className="font-bold text-sky-600">{financialHealth.savingsScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${financialHealth.savingsScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Current savings rate: <strong>{financialHealth.metrics.savingsRate}%</strong> (Target &gt; 20-30%)
                </p>
              </div>

              {/* Pillar 2: Debt Health */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">2. Debt-to-Asset Health</span>
                  <span className="font-bold text-sky-600">{financialHealth.debtScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${financialHealth.debtScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Liabilities are <strong>{financialHealth.metrics.debtToAssetRatio}%</strong> of total assets
                </p>
              </div>

              {/* Pillar 3: Emergency Fund */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">3. Emergency Reserve</span>
                  <span className="font-bold text-sky-600">{financialHealth.emergencyFundScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${financialHealth.emergencyFundScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Buffer covers <strong>{financialHealth.metrics.emergencyFundMonths} months</strong> of expenses
                </p>
              </div>

              {/* Pillar 4: EMI Burden */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">4. EMI-to-Income Burden</span>
                  <span className="font-bold text-sky-600">
                    {financialHealth.metrics.emiToIncomeRatio > 40 ? '30/100' : '85/100'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${financialHealth.metrics.emiToIncomeRatio > 40 ? 30 : 85}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Monthly EMIs consume <strong>{financialHealth.metrics.emiToIncomeRatio}%</strong> of income
                </p>
              </div>

              {/* Pillar 5: Goal Progress */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">5. Goals Velocity</span>
                  <span className="font-bold text-sky-600">{financialHealth.goalsScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${financialHealth.goalsScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Average milestone completion: <strong>{financialHealth.metrics.goalProgressAverage}%</strong>
                </p>
              </div>

              {/* Pillar 6: Investments */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">6. Investment Allocation</span>
                  <span className="font-bold text-sky-600">{financialHealth.investmentScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${financialHealth.investmentScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Portfolio value: <strong>{formatCurrency(totalInvestmentValue, { symbol: settings.currencySymbol, compact: true })}</strong>
                </p>
              </div>
            </div>

            {/* Informational Recommendations (Section 19) */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-500" />
                Informational Recommendations & Observations
              </h4>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {financialHealth.metrics.emiToIncomeRatio > 35 && (
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Your entered EMI obligations represent {financialHealth.metrics.emiToIncomeRatio}% of your entered
                      monthly income. Financial planners generally recommend keeping debt servicing below 35-40%.
                    </span>
                  </p>
                )}

                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Your liquid assets currently cover approximately {financialHealth.metrics.emergencyFundMonths} months of
                    your entered monthly expenses.
                  </span>
                </p>

                {goals.length > 0 && (
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>
                      Across your {goals.length} active financial goals, an average of {financialHealth.metrics.goalProgressAverage}%
                      of the targeted capital has been accumulated.
                    </span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 italic">
                * Legal Disclaimer: WealthTrack is a personal finance tracking tool. Observations and scores are derived
                algorithmically from user-entered figures and must not be construed as registered financial or investment
                advice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
