'use client';

import React from 'react';
import Link from 'next/link';
import { PieChart, CreditCard, ShieldCheck, Activity, ArrowRight, Sparkles } from 'lucide-react';

export default function ToolsCatalogPage() {
  const tools = [
    {
      slug: 'budget-planner',
      title: 'Budget Planner Tool',
      description: 'Interactive monthly budget design using the 50/30/20 rule and category allocations.',
      icon: PieChart,
      href: '/budget',
      color: '#3b82f6',
    },
    {
      slug: 'loan-planner',
      title: 'Loan & Debt Planner Tool',
      description: 'Model loan amortizations, prepayment savings, and track exactly how many EMIs remain.',
      icon: CreditCard,
      href: '/loans',
      color: '#f59e0b',
    },
    {
      slug: 'net-worth',
      title: 'Personal Net Worth Auditor',
      description: 'Audit total assets against liabilities to visualize your solvency and balance sheet health.',
      icon: ShieldCheck,
      href: '/reports',
      color: '#10b981',
    },
    {
      slug: 'financial-health',
      title: 'Financial Health Diagnostic Tool',
      description: 'Comprehensive 6-pillar objective audit measuring savings rate, emergency reserve, and debt burden.',
      icon: Activity,
      href: '/reports',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-600 dark:text-sky-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Specialized Financial Planning</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          WealthTrack Financial Tools
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Professional suite of privacy-first personal finance utilities designed for real-world budgeting, debt elimination, and wealth building.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={t.href}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: t.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
