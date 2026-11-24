'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Target,
  PiggyBank,
  Sparkles,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/common/Modal';
import { formatPercent, formatCurrency } from '@/lib/formatters';

export const FinancialHealthCard: React.FC = () => {
  const { financialHealth, monthlyIncome, monthlyExpenses, settings } = useFinance();
  const [showDrilldown, setShowDrilldown] = useState(false);
  const {
    score,
    savingsScore,
    debtScore,
    emergencyFundScore,
    goalsScore,
    investmentScore,
    factors,
    metrics,
  } = financialHealth;

  const getScoreColor = (val: number) => {
    if (val >= 75) return 'text-emerald-500 stroke-emerald-500';
    if (val >= 50) return 'text-sky-500 stroke-sky-500';
    return 'text-amber-500 stroke-amber-500';
  };

  const getBadgeColor = (val: number) => {
    if (val >= 75) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (val >= 50) return 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  const pillars = [
    {
      title: 'Savings Rate',
      score: savingsScore,
      metricLabel: `${formatPercent(metrics?.savingsRate || 0, 1)} savings rate`,
      benchmark:
        monthlyIncome > 0
          ? `Target: > 25% (~${formatCurrency(monthlyIncome * 0.25, { symbol: settings.currencySymbol, compact: true })}/mo)`
          : 'Target: > 25% of net income',
      icon: PiggyBank,
      actionHref: '/budget',
      actionLabel: 'Adjust Budget',
      recommendation:
        savingsScore < 70
          ? 'Reduce discretionary expenses like dining and shopping to boost savings above 25%.'
          : 'Great savings habit! Keep channeling excess monthly savings into investments.',
    },
    {
      title: 'Debt Exposure',
      score: debtScore,
      metricLabel: `${formatPercent(metrics?.emiToIncomeRatio || 0, 1)} EMI/Income ratio`,
      benchmark: 'Target: EMI under 30% of income',
      icon: CreditCard,
      actionHref: '/loans',
      actionLabel: 'Manage Loans',
      recommendation:
        debtScore < 70
          ? 'Consider prepaying high-interest personal or car loans to reduce monthly EMI burden.'
          : 'Your debt obligations are well within safe thresholds.',
    },
    {
      title: 'Emergency Fund',
      score: emergencyFundScore,
      metricLabel: `${(metrics?.emergencyFundMonths || 0).toFixed(1)} months of expenses`,
      benchmark:
        monthlyExpenses > 0
          ? `Target: 3-6 mos (~${formatCurrency(monthlyExpenses * 6, { symbol: settings.currencySymbol, compact: true })})`
          : 'Target: 3 to 6 months of mandatory expenses',
      icon: ShieldCheck,
      actionHref: '/goals',
      actionLabel: 'Fund Emergency Goal',
      recommendation:
        emergencyFundScore < 70
          ? 'Build at least 3-6 months of liquid emergency funds in high-yield savings or liquid funds.'
          : 'Solid emergency safety cushion established.',
    },
    {
      title: 'Goal Velocity',
      score: goalsScore,
      metricLabel: `${formatPercent(metrics?.goalProgressAverage || 0, 0)} goal progress`,
      benchmark: 'Target: On-track contributions towards targets',
      icon: Target,
      actionHref: '/goals',
      actionLabel: 'View Goals',
      recommendation:
        goalsScore < 70
          ? 'Allocate dedicated monthly transfers towards your target milestones.'
          : 'High velocity! Your long-term goals are progressing on schedule.',
    },
    {
      title: 'Investments & Growth',
      score: investmentScore,
      metricLabel: 'Active Portfolio',
      benchmark: 'Target: Diversified equity, debt & assets',
      icon: TrendingUp,
      actionHref: '/investments',
      actionLabel: 'Portfolio Analytics',
      recommendation:
        investmentScore < 70
          ? 'Start systematic investment plans (SIPs) in index funds or mutual funds to outpace inflation.'
          : 'Healthy investment portfolio contributing positively to net worth expansion.',
    },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Financial Health Score</h3>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
              Objective Algorithmic Index
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated transparently from your entered income, expenses, debts, investments, and goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDrilldown(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/40 text-xs font-bold text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Drilldown & Plan</span>
          </button>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          >
            <span>View Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
        {/* Main Circular Metric */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={`${(score / 100) * 264} 264`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Out of 100</span>
            </div>
          </div>
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(score)}`}>
            {score >= 80 ? 'Excellent Health' : score >= 65 ? 'Good Progress' : score >= 50 ? 'Moderate Health' : 'Needs Attention'}
          </span>
        </div>

        {/* 5 Pillar Component Scores */}
        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Savings</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{savingsScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Debt Health</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{debtScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Emergency Fund</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{emergencyFundScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Goal Velocity</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{goalsScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1 lg:col-span-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Investments</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{investmentScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100</span>
          </div>
        </div>

        {/* What Is Affecting Your Score? Checklist */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            What is affecting your score?
          </h4>

          <div className="space-y-2.5 text-xs">
            {factors.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                {f.type === 'positive' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : f.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                    •
                  </span>
                )}
                <span className={f.type === 'warning' ? 'text-amber-700 dark:text-amber-300 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                  {f.message}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 italic">
            * Informational methodology based solely on entered records. Not financial advice.
          </div>
        </div>
      </div>

      {/* Financial Health Drilldown Modal */}
      <Modal
        isOpen={showDrilldown}
        onClose={() => setShowDrilldown(false)}
        title="Financial Health Diagnostic & Improvement Plan"
        maxWidthClass="max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-500">
              Score updates dynamically as transactions and balances are logged.
            </span>
            <button
              type="button"
              onClick={() => setShowDrilldown(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header Score Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white ${
                score >= 75 ? 'bg-emerald-600' : score >= 50 ? 'bg-sky-600' : 'bg-amber-600'
              }`}>
                {score}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Composite Financial Health Index
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {score >= 80 ? 'Optimal financial resilience and disciplined capital allocation.' : score >= 65 ? 'Stable trajectory with minor optimization opportunities.' : 'Action required on liquidity and debt service coverage.'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeColor(score)}`}>
              {score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Moderate' : 'Action Needed'}
            </span>
          </div>

          {/* 5 Pillars Drilldown Cards */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              5 Pillar Diagnostic Breakdown
            </h5>

            <div className="space-y-2.5">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {p.title}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {p.metricLabel} • {p.benchmark}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${
                          p.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : p.score >= 50 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {p.score} / 100
                        </span>
                        <Link
                          href={p.actionHref}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all"
                        >
                          {p.actionLabel}
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.score >= 75 ? 'bg-emerald-500' : p.score >= 50 ? 'bg-sky-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${p.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5 pt-0.5">
                      <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <span>{p.recommendation}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
