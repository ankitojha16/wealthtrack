'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  TrendingUp,
  CreditCard,
  Target,
  PieChart,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingChecklistProps {
  onOpenModal: (type: 'income' | 'expense' | 'investment' | 'goal') => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ onOpenModal }) => {
  const { transactions, budgets, investments, goals, loadSampleData } = useFinance();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('wealthtrack_hide_onboarding') === 'true';
    setIsDismissed(dismissed);
  }, []);

  const hasIncome = transactions.some((t) => t.type === 'income');
  const hasExpense = transactions.some((t) => t.type === 'expense');
  const hasBudget = budgets.length > 0;
  const hasInvestment = investments.length > 0;
  const hasGoal = goals.length > 0;

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      await loadSampleData();
    } finally {
      setIsLoadingSample(false);
    }
  };

  const steps = [
    {
      id: 'income',
      title: 'Record Primary Income',
      desc: 'Log salary or business earnings to calculate savings rate.',
      done: hasIncome,
      action: () => onOpenModal('income'),
      actionLabel: 'Add Income',
      icon: Wallet,
    },
    {
      id: 'expense',
      title: 'Log First Expense',
      desc: 'Add daily purchases or import transactions via CSV.',
      done: hasExpense,
      action: () => onOpenModal('expense'),
      actionLabel: 'Add Expense',
      icon: CreditCard,
    },
    {
      id: 'budget',
      title: 'Set Monthly Category Budget',
      desc: 'Cap spending limits on food, transport, or shopping.',
      done: hasBudget,
      href: '/budget',
      actionLabel: 'Set Caps',
      icon: PieChart,
    },
    {
      id: 'investment',
      title: 'Track Investments / Stocks',
      desc: 'Monitor mutual funds, stocks, PPF, or gold portfolio.',
      done: hasInvestment,
      action: () => onOpenModal('investment'),
      actionLabel: 'Add Asset',
      icon: TrendingUp,
    },
    {
      id: 'goal',
      title: 'Create a Financial Goal',
      desc: 'Target an emergency fund, home purchase, or vacation.',
      done: hasGoal,
      action: () => onOpenModal('goal'),
      actionLabel: 'Create Goal',
      icon: Target,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const percent = Math.round((completedCount / steps.length) * 100);

  // If already dismissed or all 5 steps complete and previously collapsed
  if (isDismissed && completedCount === steps.length) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('wealthtrack_hide_onboarding', 'true');
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-sky-200/80 dark:border-sky-900/50 shadow-sm relative overflow-hidden transition-all">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Getting Started with WealthTrack</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                {completedCount}/{steps.length} Complete ({percent}%)
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Complete these setup steps to activate your autonomous financial health score and projections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {completedCount < steps.length && (
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-xs hover:bg-sky-50 dark:hover:bg-slate-800 transition"
              title="Pre-populate realistic sample portfolio to preview all charts and calculations"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>{isLoadingSample ? 'Loading sample...' : 'Load Sample Portfolio'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Dismiss checklist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
        <div
          className="bg-linear-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  step.done
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      step.done
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <h4 className={`text-xs font-bold leading-snug ${
                    step.done ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-80' : 'text-slate-900 dark:text-white'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {step.done ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : step.href ? (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      <span>{step.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={step.action}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      <span>{step.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
