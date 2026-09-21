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

  // Expense distribution data for Donut
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

  // Net worth trend data from authentic snapshots
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

  const hasAnyData =
    transactions.length > 0 ||
    investments.length > 0 ||
    goals.length > 0 ||
    loans.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Greeting & Header */}
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

        {/* Quick Action Shortcuts */}
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

      {/* 4 Financial Overview Cards */}
      <OverviewCards />

      {/* Financial Health Section */}
      <FinancialHealthCard />

      {/* Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Net Worth Trend Chart */}
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

        {/* Expense Category Breakdown Chart */}
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

      {/* Assets vs Liabilities & Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assets vs Liabilities Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Solvency Ratio</h3>
            <span className="text-xs font-semibold text-slate-500">Assets vs Debts</span>
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

        {/* Active Goals Quick View */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Goals in Progress</h3>
              <Link href="/goals" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                View All ({goals.length})
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="py-6 text-center">
                <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-3">No financial goals added yet</p>
                <button
                  type="button"
                  onClick={() => setModalState({ type: 'goal' })}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
                >
                  + Add First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {goals.slice(0, 3).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{goal.name}</span>
                        <span className="font-semibold text-slate-500">
                          {formatPercent(progress, 0)} ({formatCurrency(goal.currentAmount, { symbol: settings.currencySymbol, compact: true })})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {goals.length > 0 && (
            <Link
              href="/goals"
              className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline mt-4"
            >
              <span>Manage & Contribute to Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Loan Obligations Quick View */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Loans</h3>
              <Link href="/loans" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                View All ({loans.length})
              </Link>
            </div>

            {loans.length === 0 ? (
              <div className="py-6 text-center">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-3">No active loans or debt recorded</p>
                <button
                  type="button"
                  onClick={() => setModalState({ type: 'loan' })}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                >
                  + Add Loan / EMI
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Monthly EMI Burden</span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(totalMonthlyEmi, { symbol: settings.currencySymbol })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Outstanding</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totalLoansOutstanding, { symbol: settings.currencySymbol, compact: true })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {loans.slice(0, 2).map((l) => (
                    <div key={l.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{l.name}</span>
                        <span className="text-[10px] text-amber-600 font-semibold">{l.emisRemaining} EMIs left</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(l.monthlyEmi, { symbol: settings.currencySymbol })}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loans.length > 0 && (
            <Link
              href="/loans"
              className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline mt-4"
            >
              <span>View Full Loan Amortization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <RecentActivity
        onEditTransaction={(tx) => setModalState({ type: tx.type, initialData: tx })}
        onOpenAdd={() => setModalState({ type: 'expense' })}
      />

      {/* Contextual Modals */}
      {modalState.type === 'expense' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          defaultType="expense"
          initialData={modalState.initialData}
          onSave={async (data) => {
            if (modalState.initialData) {
              await editTransaction({ ...modalState.initialData, ...data });
            } else {
              await addTransaction(data);
            }
          }}
        />
      )}

      {modalState.type === 'income' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          defaultType="income"
          initialData={modalState.initialData}
          onSave={async (data) => {
            if (modalState.initialData) {
              await editTransaction({ ...modalState.initialData, ...data });
            } else {
              await addTransaction(data);
            }
          }}
        />
      )}

      {modalState.type === 'investment' && (
        <InvestmentModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          onSave={async (data) => {
            await addInvestment(data);
          }}
        />
      )}

      {modalState.type === 'goal' && (
        <GoalModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          onSave={async (data) => {
            await addGoal(data);
          }}
        />
      )}

      {modalState.type === 'loan' && (
        <LoanModal
          isOpen={true}
          onClose={() => setModalState({ type: null })}
          onSave={async (data) => {
            await addLoan(data);
          }}
        />
      )}
    </div>
  );
}
