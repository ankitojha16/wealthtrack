'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { FinancialHealthCard } from '@/components/dashboard/FinancialHealthCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LineTrendChart } from '@/components/charts/LineTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarComparisonChart } from '@/components/charts/BarComparisonChart';
import { TransactionModal } from '@/components/budget/TransactionModal';
import { InvestmentModal } from '@/components/investments/InvestmentModal';
import { GoalModal } from '@/components/goals/GoalModal';
import { LoanModal } from '@/components/loans/LoanModal';
import { Transaction } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import {
  TrendingDown,
  TrendingUp,
  LineChart,
  Target,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  PiggyBank,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    loading,
    transactions,
    investments,
    goals,
    loans,
    snapshots,
    totalAssets,
    totalLiabilities,
    netWorth,
    totalInvestmentValue,
    totalLoansOutstanding,
    totalMonthlyEmi,
    settings,
    addTransaction,
    editTransaction,
    addInvestment,
    addGoal,
    addLoan,
    recordCurrentSnapshot,
  } = useFinance();

  const [greeting, setGreeting] = useState('Good morning 👋');
  const [modalState, setModalState] = useState<{
    type: 'expense' | 'income' | 'investment' | 'goal' | 'loan' | null;
    initialData?: any;
  }>({ type: null });

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning 👋');
    else if (hours < 17) setGreeting('Good afternoon 👋');
    else setGreeting('Good evening 👋');
  }, []);

  const currentMonthExpenses = transactions.filter((t) => t.type === 'expense');
  const expenseByCategory: Record<string, number> = {};
  currentMonthExpenses.forEach((t) => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });

  const categoryColors: Record<string, string> = {
    Food: '#f97316',
    Transport: '#06b6d4',
    Housing: '#3b82f6',
    Education: '#8b5cf6',
    Shopping: '#ec4899',
    Entertainment: '#a855f7',
    Bills: '#ef4444',
    Healthcare: '#10b981',
    Travel: '#14b8a6',
    Other: '#64748b',
  };

  const expenseSegments = Object.entries(expenseByCategory).map(([label, value]) => ({
    label,
    value,
    color: categoryColors[label] || '#0284c7',
  }));

  const trendData = snapshots.map((s) => ({
    label: s.monthYear,
    value: s.netWorth,
  }));

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading WealthTrack...</span>
        </div>
      </div>
    );
  }

  const hasAnyData = transactions.length > 0 || investments.length > 0 || goals.length > 0 || loans.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-sky-600 dark:text-sky-400 block">{greeting}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time balance sheet and wealth analytics calculated entirely on your device.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setModalState({ type: 'expense' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100/70 transition-all shrink-0"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>+ Expense</span>
          </button>
          <button
            type="button"
            onClick={() => setModalState({ type: 'income' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100/70 transition-all shrink-0"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ Income</span>
          </button>
          <button
            type="button"
            onClick={() => setModalState({ type: 'investment' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-900/60 hover:bg-sky-100/70 transition-all shrink-0"
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>+ Investment</span>
          </button>
          <button
            type="button"
            onClick={() => setModalState({ type: 'goal' })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-900/60 hover:bg-purple-100/70 transition-all shrink-0"
          >
            <Target className="w-3.5 h-3.5" />
            <span>+ Goal</span>
          </button>
        </div>
      </div>

      <OverviewCards />
      <FinancialHealthCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Net Worth Trend</h3>
              <p className="text-xs text-slate-500">Historical snapshots recorded from your entered data</p>
            </div>
            <button
              type="button"
              onClick={() => recordCurrentSnapshot()}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              + Save Snapshot
            </button>
          </div>

          <LineTrendChart
            data={trendData}
            currencySymbol={settings.currencySymbol}
            onRecordSnapshot={() => recordCurrentSnapshot()}
          />
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Expense Distribution</h3>
              <p className="text-xs text-slate-500">Where your money goes across categories</p>
            </div>
            <Link href="/budget" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              Manage Budget
            </Link>
          </div>

          <DonutChart
            data={expenseSegments}
            currencySymbol={settings.currencySymbol}
            emptyMessage="No expense transactions recorded this month yet."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Assets vs Liabilities</h3>
              <p className="text-xs text-slate-500">Balance sheet snapshot</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <PiggyBank className="w-3.5 h-3.5" /> Assets
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {formatCurrency(totalAssets, { symbol: settings.currencySymbol, compact: true })}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                <CreditCard className="w-3.5 h-3.5" /> Liabilities
              </div>
              <div className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">
                {formatCurrency(totalLiabilities, { symbol: settings.currencySymbol, compact: true })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-xs text-slate-500">Latest transactions, investments, goals and loans</p>
            </div>
            <Link href="/reports" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              View Reports
            </Link>
          </div>
          <RecentActivity />
        </div>
      </div>

      {hasAnyData && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Wealth Pulse</h3>
              <p className="text-xs text-slate-500">Net worth, investment returns, and debt load</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Net Worth</div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(netWorth, { symbol: settings.currencySymbol, compact: true })}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Investments</div>
              <div className="mt-2 text-2xl font-black text-sky-600 dark:text-sky-400">
                {formatCurrency(totalInvestmentValue, { symbol: settings.currencySymbol, compact: true })}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Loans</div>
              <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(totalLoansOutstanding, { symbol: settings.currencySymbol, compact: true })}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'expense' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          defaultType="expense"
          onSave={async (data) => { await addTransaction(data); }}
        />
      )}

      {modalState.type === 'income' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          defaultType="income"
          onSave={async (data) => { await addTransaction(data); }}
        />
      )}

      {modalState.type === 'investment' && (
        <InvestmentModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          onSave={async (data) => { await addInvestment(data); }}
        />
      )}

      {modalState.type === 'goal' && (
        <GoalModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          onSave={async (data) => { await addGoal(data); }}
        />
      )}

      {modalState.type === 'loan' && (
        <LoanModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          onSave={async (data) => { await addLoan(data); }}
        />
      )}
    </div>
  );
}
