'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { calculateFIRE } from '@/lib/calculations';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

export default function FireSimulatorPage() {
  const { netWorth, monthlyExpenses, monthlySavings, settings } = useFinance();

  // Inputs initialized with real user data if present
  const [currentAge, setCurrentAge] = useState<number>(28);
  const [retirementAge, setRetirementAge] = useState<number>(45);
  const [currentNetWorthInput, setCurrentNetWorthInput] = useState<number>(Math.max(0, netWorth || 1000000));
  const [monthlyExpenseInput, setMonthlyExpenseInput] = useState<number>(Math.max(10000, monthlyExpenses || 50000));
  const [monthlySavingsInput, setMonthlySavingsInput] = useState<number>(Math.max(5000, monthlySavings || 35000));
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4);

  const fireData = useMemo(() => {
    return calculateFIRE(
      currentAge,
      retirementAge,
      currentNetWorthInput,
      monthlyExpenseInput,
      monthlySavingsInput,
      expectedReturn,
      inflationRate,
      safeWithdrawalRate
    );
  }, [
    currentAge,
    retirementAge,
    currentNetWorthInput,
    monthlyExpenseInput,
    monthlySavingsInput,
    expectedReturn,
    inflationRate,
    safeWithdrawalRate,
  ]);

  const fireYear = new Date().getFullYear() + fireData.yearsToFire;
  const fireAge = currentAge + fireData.yearsToFire;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Financial Tools</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Financial Independence, Retire Early</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            FIRE Simulator & Runway Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Simulate your path to financial freedom using the 4% safe withdrawal rule, real net worth projections, and inflation compounding.
          </p>
        </div>

        {fireData.canRetireNow && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-black block">You Are Financially Independent!</span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                Current Net Worth exceeds your target FIRE corpus.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target Numbers Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/80 dark:border-amber-900/50 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
            Target FIRE Number
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {formatCurrency(fireData.fireNumber, { symbol: settings.currencySymbol, compact: true })}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {formatCurrency(fireData.fireNumber, { symbol: settings.currencySymbol })}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-linear-to-br from-sky-500/10 to-indigo-500/10 border border-sky-200/80 dark:border-sky-900/50 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 dark:text-sky-400 block">
            Years to Financial Freedom
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {fireData.yearsToFire} Years
          </span>
          <span className="text-[11px] text-slate-500 block">
            Estimated Year: {fireYear} (Age {fireAge})
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Lean FIRE Target (75%)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            {formatCurrency(fireData.leanFireNumber, { symbol: settings.currencySymbol, compact: true })}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Essential lifestyle safety net
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Fat FIRE Target (150%)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            {formatCurrency(fireData.fatFireNumber, { symbol: settings.currencySymbol, compact: true })}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Luxury & frequent travel lifestyle
          </span>
        </div>
      </div>

      {/* Simulator Inputs & Configuration */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Retirement Assumptions & Profile Variables
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Age Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Age: <span className="text-sky-600 dark:text-sky-400">{currentAge}</span>
            </label>
            <input
              type="range"
              min="18"
              max="70"
              value={currentAge}
              onChange={(e) => setCurrentAge(parseInt(e.target.value, 10))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Retirement Age: <span className="text-sky-600 dark:text-sky-400">{retirementAge}</span>
            </label>
            <input
              type="range"
              min={currentAge}
              max="80"
              value={retirementAge}
              onChange={(e) => setRetirementAge(parseInt(e.target.value, 10))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Net Worth ({settings.currencySymbol || '₹'})
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              value={currentNetWorthInput}
              onChange={(e) => setCurrentNetWorthInput(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Living Expenses ({settings.currencySymbol || '₹'})
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              value={monthlyExpenseInput}
              onChange={(e) => setMonthlyExpenseInput(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Investment Savings ({settings.currencySymbol || '₹'})
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={monthlySavingsInput}
              onChange={(e) => setMonthlySavingsInput(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expected Investment Return (% p.a.): <span className="text-sky-600 dark:text-sky-400">{expectedReturn}%</span>
            </label>
            <input
              type="range"
              min="4"
              max="20"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expected Inflation Rate (% p.a.): <span className="text-sky-600 dark:text-sky-400">{inflationRate}%</span>
            </label>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Safe Withdrawal Rate (SWR %): <span className="text-sky-600 dark:text-sky-400">{safeWithdrawalRate}%</span>
            </label>
            <input
              type="range"
              min="2.5"
              max="5"
              step="0.25"
              value={safeWithdrawalRate}
              onChange={(e) => setSafeWithdrawalRate(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        </div>
      </div>

      {/* Trajectory Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Net Worth & Runway Trajectory (Age {currentAge} to 85)
          </h3>
          <span className="text-xs text-slate-500">
            Inflation-compounded projections
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold sticky top-0">
              <tr>
                <th className="p-3">Age</th>
                <th className="p-3">Year</th>
                <th className="p-3">Projected Net Worth</th>
                <th className="p-3">Annual Living Cost</th>
                <th className="p-3 text-right">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {fireData.trajectory.map((point) => (
                <tr
                  key={point.age}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                    point.age === fireAge ? 'bg-amber-50/60 dark:bg-amber-950/30' : ''
                  }`}
                >
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    Age {point.age}
                  </td>
                  <td className="p-3 text-slate-500">
                    {point.year}
                  </td>
                  <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(point.netWorth, { symbol: settings.currencySymbol })}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {formatCurrency(point.annualExpense, { symbol: settings.currencySymbol })}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      point.status === 'retired'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : point.status === 'financial_independence'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {point.status === 'retired'
                        ? 'Retired (Decumulation)'
                        : point.status === 'financial_independence'
                        ? 'FIRE Achieved'
                        : 'Accumulating'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
