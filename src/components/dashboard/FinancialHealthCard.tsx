'use client';

import React from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const FinancialHealthCard: React.FC = () => {
  const { financialHealth } = useFinance();
  const {
    score,
    savingsScore,
    debtScore,
    emergencyFundScore,
    goalsScore,
    investmentScore,
    factors,
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

        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
        >
          <span>View Full Health Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
    </div>
  );
};
