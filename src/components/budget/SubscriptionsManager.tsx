'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { Modal } from '@/components/common/Modal';
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/data/categories';
import {
  Repeat,
  Calendar,
  AlertCircle,
  Plus,
  CheckCircle2,
  Trash2,
  Tv,
  Wifi,
  Zap,
  Home,
  Shield,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

interface SubscriptionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionsManager: React.FC<SubscriptionsManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions, monthlyIncome, addTransaction, editTransaction, removeTransaction, settings } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCategory, setSubCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0].name);
  const [billingDay, setBillingDay] = useState('1');

  // Filter or detect recurring transactions
  const subscriptionList = useMemo(() => {
    // Map by lowercase description to find distinct recurring series
    const seriesMap = new Map<string, { latestTx: Transaction; count: number }>();

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const descLower = (t.description || t.category).toLowerCase().trim();
        const isExplicit = Boolean(t.isRecurring);
        const hasKeyword = /netflix|spotify|prime|youtube|hotstar|gym|wifi|broadband|rent|electricity|water|gas|insurance|icloud|google|adobe|patreon|sip|duolingo/i.test(descLower);

        if (isExplicit || hasKeyword) {
          const key = descLower;
          const existing = seriesMap.get(key);
          if (!existing || new Date(t.date).getTime() > new Date(existing.latestTx.date).getTime()) {
            seriesMap.set(key, { latestTx: t, count: (existing?.count || 0) + 1 });
          } else {
            existing.count += 1;
          }
        }
      });

    return Array.from(seriesMap.values()).map(({ latestTx, count }) => latestTx);
  }, [transactions]);

  const totalMonthlyBurn = subscriptionList.reduce((sum, s) => sum + s.amount, 0);
  const totalAnnualCost = totalMonthlyBurn * 12;
  const recurringIncomePercent = monthlyIncome > 0 ? (totalMonthlyBurn / monthlyIncome) * 100 : 0;

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(subAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const today = new Date();
    const day = parseInt(billingDay, 10) || 1;
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(Math.min(28, day)).padStart(2, '0')}`;

    await addTransaction({
      type: 'expense',
      amount: amountNum,
      category: subCategory,
      description: subName.trim(),
      date: dateStr,
      isRecurring: true,
      paymentMethod: 'UPI / Auto-Debit',
    });

    setSubName('');
    setSubAmount('');
    setIsAddOpen(false);
  };

  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('netflix') || n.includes('prime') || n.includes('youtube') || n.includes('tv') || n.includes('hotstar')) {
      return <Tv className="w-4 h-4 text-rose-500" />;
    }
    if (n.includes('wifi') || n.includes('broadband') || n.includes('internet') || n.includes('fiber')) {
      return <Wifi className="w-4 h-4 text-sky-500" />;
    }
    if (n.includes('rent') || n.includes('maintenance')) {
      return <Home className="w-4 h-4 text-indigo-500" />;
    }
    if (n.includes('gym') || n.includes('fitness')) {
      return <Dumbbell className="w-4 h-4 text-amber-500" />;
    }
    if (n.includes('electricity') || n.includes('power') || n.includes('gas') || n.includes('utility')) {
      return <Zap className="w-4 h-4 text-yellow-500" />;
    }
    if (n.includes('insurance') || n.includes('health') || n.includes('policy')) {
      return <Shield className="w-4 h-4 text-emerald-500" />;
    }
    return <Repeat className="w-4 h-4 text-purple-500" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recurring Bills & Subscriptions Manager"
      maxWidthClass="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-500">
            {subscriptionList.length} recurring commitment(s) monitored.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
              Monthly Recurring Burn
            </span>
            <span className="text-xl font-black text-rose-700 dark:text-rose-200 mt-0.5 block">
              {formatCurrency(totalMonthlyBurn, { symbol: settings.currencySymbol })}
            </span>
            <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1 block">
              {formatPercent(recurringIncomePercent, 1)} of monthly income
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Annual Commitment
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {formatCurrency(totalAnnualCost, { symbol: settings.currencySymbol })}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Across 12 months
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/60 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">
                Active Subscriptions
              </span>
              <span className="text-xl font-black text-sky-700 dark:text-sky-200 mt-0.5 block">
                {subscriptionList.length} services
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recurring Bill</span>
            </button>
          </div>
        </div>

        {/* Add Subscription Form Modal / Popover */}
        {isAddOpen && (
          <form
            onSubmit={handleCreateSubscription}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-500" />
                Add New Recurring Subscription or Bill
              </h4>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Bill Name
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Netflix, Gym, Fiber WiFi"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Cost ({settings.currencySymbol || '₹'})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  placeholder="e.g. 649"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Day of Month
                </label>
                <select
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}th of month
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-all"
              >
                Save Subscription
              </button>
            </div>
          </form>
        )}

        {/* Subscriptions List */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-sky-500" />
            Detected Active Subscriptions & Recurring Bills
          </h4>

          {subscriptionList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 space-y-2">
              <p>No active recurring subscriptions detected.</p>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
              >
                + Add your first subscription (Netflix, WiFi, Gym, etc.)
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {subscriptionList.map((sub) => {
                const billingDate = sub.date ? new Date(sub.date).getDate() : 1;

                return (
                  <div
                    key={sub.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getServiceIcon(sub.description || sub.category)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {sub.description || sub.category}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {sub.category} • Billed on the {billingDate}th of each month
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {formatCurrency(sub.amount, { symbol: settings.currencySymbol })}
                          <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatCurrency(sub.amount * 12, { symbol: settings.currencySymbol })} /yr
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTransaction(sub.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove subscription series"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
