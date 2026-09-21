'use client';

import React from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import { Landmark, AlertCircle, ShieldCheck, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export const OverviewCards: React.FC = () => {
  const { totalAssets, totalLiabilities, netWorth, monthlySavings, settings } = useFinance();
  const sym = settings.currencySymbol;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Assets */}
      <Link
        href="/reports"
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Assets
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
            <Landmark className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(totalAssets, { symbol: sym, compact: true })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>{formatCurrency(totalAssets, { symbol: sym })}</span>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">User-entered</span>
        </div>
      </Link>

      {/* 2. Total Liabilities */}
      <Link
        href="/loans"
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Liabilities
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
          {formatCurrency(totalLiabilities, { symbol: sym, compact: true })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>{formatCurrency(totalLiabilities, { symbol: sym })}</span>
          <span className="text-[11px] text-rose-500 font-medium">Debts & EMIs</span>
        </div>
      </Link>

      {/* 3. Net Worth */}
      <Link
        href="/reports"
        className="p-5 rounded-2xl bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-900 dark:to-sky-950/20 border border-sky-200/80 dark:border-sky-900/60 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            Net Worth
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-300 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(netWorth, { symbol: sym, compact: true })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>Assets - Liabilities</span>
          <span className={`text-[11px] font-bold ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {netWorth >= 0 ? '+' : ''}{formatCurrency(netWorth, { symbol: sym })}
          </span>
        </div>
      </Link>

      {/* 4. Monthly Savings */}
      <Link
        href="/budget"
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Savings
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${monthlySavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
          {formatCurrency(monthlySavings, { symbol: sym, compact: true })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>Income - Expense - EMI</span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {monthlySavings >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
            {formatCurrency(monthlySavings, { symbol: sym })}
          </span>
        </div>
      </Link>
    </div>
  );
};
