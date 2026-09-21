'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/data/categories';
import { TransactionModal } from '@/components/budget/TransactionModal';
import { DonutChart } from '@/components/charts/DonutChart';
import { Transaction } from '@/types';
import {
  PieChart,
  Plus,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export default function BudgetPage() {
  const {
    transactions,
    budgets,
    saveCategoryBudget,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    settings,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useFinance();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txDefaultType, setTxDefaultType] = useState<'expense' | 'income'>('expense');

  // Budget limit modal
  const [budgetLimitModal, setBudgetLimitModal] = useState<{ isOpen: boolean; category: string; currentLimit: number }>({
    isOpen: false,
    category: '',
    currentLimit: 0,
  });
  const [newLimitInput, setNewLimitInput] = useState('');

  // Calculate spending per category
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  // Calculate budget totals
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.monthlyLimit || 0), 0);
  const totalSpentAgainstBudget = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);
  const totalRemainingBudget = Math.max(0, totalBudgetLimit - totalSpentAgainstBudget);
  const overallSpendingPercent = totalBudgetLimit > 0 ? (totalSpentAgainstBudget / totalBudgetLimit) * 100 : 0;

  // Filtered transactions
  const filteredTransactions = transactions
    .filter((t) => {
      const matchType = filterType === 'all' || t.type === filterType;
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;
      const query = search.toLowerCase();
      const matchSearch =
        !search ||
        t.category.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        ((t.paymentMethod || '').toLowerCase().includes(query));
      return matchType && matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

  // Prepare Donut chart segments
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

  const donutSegments = Object.entries(expenseByCategory).map(([label, value]) => ({
    label,
    value,
    color: categoryColors[label] || '#0284c7',
  }));

  const handleOpenLimitModal = (category: string) => {
    const existing = budgets.find((b) => b.category === category);
    const limit = existing ? existing.monthlyLimit : 0;
    setBudgetLimitModal({ isOpen: true, category, currentLimit: limit });
    setNewLimitInput(limit > 0 ? limit.toString() : '');
  };

  const handleSaveBudgetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(newLimitInput);
    if (!isNaN(limit) && limit >= 0) {
      await saveCategoryBudget(budgetLimitModal.category, limit);
      setBudgetLimitModal({ isOpen: false, category: '', currentLimit: 0 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Budget & Expense Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor monthly cash flow, configure category spending caps, and prevent overspending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setTxDefaultType('expense');
              setIsTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setTxDefaultType('income');
              setIsTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Monthly Budget Summary Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Monthly Income</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(monthlyIncome, { symbol: settings.currencySymbol })}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Budget Set</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalBudgetLimit > 0 ? formatCurrency(totalBudgetLimit, { symbol: settings.currencySymbol }) : 'Not Set'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Spent</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalSpentAgainstBudget, { symbol: settings.currencySymbol })}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Remaining Budget</span>
            <span className={`text-xl sm:text-2xl font-black ${totalRemainingBudget > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
              {formatCurrency(totalRemainingBudget, { symbol: settings.currencySymbol })}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        {totalBudgetLimit > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">
                Budget Utilized: {formatPercent(overallSpendingPercent, 1)}
              </span>
              <span className={overallSpendingPercent > 100 ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-slate-500'}>
                {overallSpendingPercent > 100 && <AlertTriangle className="w-3.5 h-3.5" />}
                {formatCurrency(totalSpentAgainstBudget, { symbol: settings.currencySymbol })} / {formatCurrency(totalBudgetLimit, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallSpendingPercent > 100 ? 'bg-rose-600' : overallSpendingPercent > 80 ? 'bg-amber-500' : 'bg-sky-500'
                }`}
                style={{ width: `${Math.min(100, overallSpendingPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Budgets Grid & Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Budget Limits (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Budget Limits</h3>
              <p className="text-xs text-slate-500">Set spending thresholds for each category</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEFAULT_EXPENSE_CATEGORIES.map((cat) => {
              const spent = expenseByCategory[cat.name] || 0;
              const budgetObj = budgets.find((b) => b.category === cat.name);
              const limit = budgetObj?.monthlyLimit || 0;
              const remaining = limit > 0 ? Math.max(0, limit - spent) : 0;
              const percent = limit > 0 ? (spent / limit) * 100 : 0;
              const isOver = limit > 0 && spent > limit;

              return (
                <div
                  key={cat.name}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenLimitModal(cat.name)}
                      className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      {limit > 0 ? 'Edit Limit' : 'Set Limit'}
                    </button>
                  </div>

                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">
                      Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(spent, { symbol: settings.currencySymbol })}</strong>
                    </span>
                    <span className="text-slate-500">
                      Limit: {limit > 0 ? formatCurrency(limit, { symbol: settings.currencySymbol }) : 'None'}
                    </span>
                  </div>

                  {limit > 0 ? (
                    <div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-rose-600' : percent > 85 ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span className={isOver ? 'text-rose-600 font-bold' : ''}>
                          {isOver ? `Over by ${formatCurrency(spent - limit, { symbol: settings.currencySymbol })}` : `${formatPercent(percent, 0)} used`}
                        </span>
                        <span>Remaining: {formatCurrency(remaining, { symbol: settings.currencySymbol })}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No budget cap assigned</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Spending Breakdown</h3>
            <p className="text-xs text-slate-500">Visual category distribution</p>
          </div>

          <DonutChart
            data={donutSegments}
            currencySymbol={settings.currencySymbol}
            emptyMessage="No expenses recorded to calculate distribution."
          />
        </div>
      </div>

      {/* Transaction History with Filter / Search / Sort */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Transactions</h3>
            <p className="text-xs text-slate-500">Manage, filter, and inspect your full ledger</p>
          </div>

          {/* Search, Filter, Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type selector */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterType === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterType === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterType === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              >
                Income
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="date_desc">Latest Date First</option>
              <option value="date_asc">Oldest Date First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Search bar */}
        <div className="py-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category, payment method, or notes..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-500">No transactions match your search and filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isExpense
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </span>
                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-medium">
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                        {tx.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px] sm:max-w-md">{tx.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-black ${
                        isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount, { symbol: settings.currencySymbol })}
                    </span>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTx(tx);
                          setIsTxModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this transaction?')) {
                            removeTransaction(tx.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        initialData={editingTx}
        defaultType={txDefaultType}
        onSave={async (data) => {
          if (editingTx) {
            await editTransaction({ ...editingTx, ...data });
          } else {
            await addTransaction(data);
          }
        }}
      />

      {/* Set Category Budget Limit Modal */}
      <Modal
        isOpen={budgetLimitModal.isOpen}
        onClose={() => setBudgetLimitModal({ isOpen: false, category: '', currentLimit: 0 })}
        title={`Set Budget Limit: ${budgetLimitModal.category}`}
      >
        <form onSubmit={handleSaveBudgetLimit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Limit Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              autoFocus
              value={newLimitInput}
              onChange={(e) => setNewLimitInput(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setBudgetLimitModal({ isOpen: false, category: '', currentLimit: 0 })}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30"
            >
              Save Limit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
