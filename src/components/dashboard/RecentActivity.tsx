'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Search, ArrowUpRight, ArrowDownRight, Trash2, Edit2, Wallet } from 'lucide-react';
import { Transaction } from '@/types';
import Link from 'next/link';

interface RecentActivityProps {
  onEditTransaction?: (tx: Transaction) => void;
  onOpenAdd?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ onEditTransaction, onOpenAdd }) => {
  const { transactions, removeTransaction, settings } = useFinance();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = transactions.filter((t) => {
    const matchType = filterType === 'all' || t.type === filterType;
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      t.category.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      ((t.paymentMethod || '').toLowerCase().includes(query));
    return matchType && matchSearch;
  });

  const recentItems = filtered.slice(0, 8);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your latest income and expenses</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filter Pills */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${filterType === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${filterType === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${filterType === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Income
            </button>
          </div>

          <Link
            href="/budget"
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 ml-1"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Search Input if items exist */}
      {transactions.length > 0 && (
        <div className="py-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category, note, or payment method..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      )}

      {/* Transactions List / Empty State */}
      {recentItems.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {search ? 'No matching transactions' : 'No transactions recorded yet'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            {search
              ? 'Try changing your search terms or filter selection.'
              : 'Add your first income or expense to start building your personal budget and analytics.'}
          </p>
          {onOpenAdd && (
            <button
              type="button"
              onClick={onOpenAdd}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all"
            >
              + Record First Transaction
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentItems.map((tx) => {
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
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
                          <span className="truncate max-w-[140px] sm:max-w-xs">{tx.description}</span>
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

                  {/* Actions on hover */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    {onEditTransaction && (
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this transaction?')) {
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
  );
};
