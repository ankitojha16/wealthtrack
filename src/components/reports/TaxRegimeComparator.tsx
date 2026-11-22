'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { calculateTaxRegimes } from '@/lib/calculations';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import {
  Landmark,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  TrendingDown,
  Scale,
} from 'lucide-react';

export const TaxRegimeComparator: React.FC = () => {
  const { transactions, investments, loans, settings } = useFinance();

  // Auto-detect deductions from existing investments and loans
  const detected80C = useMemo(() => {
    return investments
      .filter((inv) => {
        const t = inv.type.toLowerCase();
        return t.includes('ppf') || t.includes('epf') || t.includes('elss');
      })
      .reduce((sum, inv) => sum + (inv.investedAmount || 0), 0);
  }, [investments]);

  const detectedHomeLoanInterest = useMemo(() => {
    return loans
      .filter((l) => l.type === 'Home Loan')
      .reduce((sum, l) => {
        // Approximate annual interest from loan outstanding * rate
        const rate = (l.interestRate || 8.5) / 100;
        return sum + Math.round(l.outstandingAmount * rate);
      }, 0);
  }, [loans]);

  // Compute annualized income from transactions
  const detectedAnnualIncome = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // If transactions are present, extrapolate to 12 months or minimum 12L
    return Math.max(800000, totalIncome > 0 ? totalIncome * 2 : 1200000);
  }, [transactions]);

  // State inputs
  const [annualIncomeInput, setAnnualIncomeInput] = useState<string>(String(detectedAnnualIncome));
  const [ded80CInput, setDed80CInput] = useState<string>(String(Math.min(150000, detected80C || 150000)));
  const [ded80DInput, setDed80DInput] = useState<string>('25000');
  const [ded24bInput, setDed24bInput] = useState<string>(String(Math.min(200000, detectedHomeLoanInterest || 0)));
  const [otherDedInput, setOtherDedInput] = useState<string>('0');

  const income = parseFloat(annualIncomeInput) || 0;
  const ded80C = parseFloat(ded80CInput) || 0;
  const ded80D = parseFloat(ded80DInput) || 0;
  const ded24b = parseFloat(ded24bInput) || 0;
  const otherDed = parseFloat(otherDedInput) || 0;

  const comparison = useMemo(() => {
    return calculateTaxRegimes(income, {
      section80C: ded80C,
      section80D: ded80D,
      homeLoanInterest24b: ded24b,
      otherDeductions: otherDed,
    });
  }, [income, ded80C, ded80D, ded24b, otherDed]);

  const { oldRegime, newRegime, recommendedRegime, taxSavings } = comparison;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-sky-200/80 dark:border-sky-900/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 text-xs font-bold mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Income Tax India • FY 2024-25 & FY 2025-26</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Old vs New Tax Regime Comparator
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Compare both tax regimes side by side with standard deductions, 80C, 80D, home loan interest, and Section 87A rebates.
          </p>
        </div>

        {/* Verdict Badge */}
        <div className={`p-4 rounded-2xl border text-center shrink-0 ${
          recommendedRegime === 'new'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : recommendedRegime === 'old'
            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
            Recommended Choice
          </span>
          <span className="text-base font-black block mt-0.5">
            {recommendedRegime === 'new'
              ? 'New Tax Regime'
              : recommendedRegime === 'old'
              ? 'Old Tax Regime'
              : 'Both Equal'}
          </span>
          {taxSavings > 0 && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Saves {formatCurrency(taxSavings, { symbol: settings.currencySymbol })}
            </span>
          )}
        </div>
      </div>

      {/* Input Adjustments */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sky-500" />
          Salary & Available Exemptions (Auto-Extracted from Portfolios)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gross Annual Income ({settings.currencySymbol || '₹'})
            </label>
            <input
              type="number"
              min="100000"
              step="50000"
              value={annualIncomeInput}
              onChange={(e) => setAnnualIncomeInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Section 80C (PPF, EPF, ELSS)
            </label>
            <input
              type="number"
              min="0"
              max="150000"
              step="5000"
              value={ded80CInput}
              onChange={(e) => setDed80CInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Section 80D (Health Insurance)
            </label>
            <input
              type="number"
              min="0"
              max="100000"
              step="5000"
              value={ded80DInput}
              onChange={(e) => setDed80DInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Section 24b (Home Loan Interest)
            </label>
            <input
              type="number"
              min="0"
              max="200000"
              step="10000"
              value={ded24bInput}
              onChange={(e) => setDed24bInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Other Deductions (HRA, NPS)
            </label>
            <input
              type="number"
              min="0"
              step="10000"
              value={otherDedInput}
              onChange={(e) => setOtherDedInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-xs"
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old Regime Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          recommendedRegime === 'old'
            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Old Tax Regime</h3>
              <p className="text-[11px] text-slate-500">With full exemptions & itemized deductions</p>
            </div>
            {recommendedRegime === 'old' && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-bold">
                Recommended
              </span>
            )}
          </div>

          <div className="space-y-3 pt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Gross Income</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(oldRegime.grossIncome, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Standard Deduction</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -{formatCurrency(oldRegime.standardDeduction, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Exemptions (80C, 80D, 24b)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -{formatCurrency(oldRegime.exemptionsAndDeductions, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 font-bold">
              <span className="text-slate-700 dark:text-slate-300">Net Taxable Income</span>
              <span className="text-slate-900 dark:text-white">
                {formatCurrency(oldRegime.taxableIncome, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Tax Before Cess</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(oldRegime.taxBeforeCess, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Section 87A Rebate</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {oldRegime.rebate87A > 0 ? `-${formatCurrency(oldRegime.rebate87A, { symbol: settings.currencySymbol })}` : 'Nil'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Health & Education Cess (4%)</span>
              <span className="text-slate-700 dark:text-slate-300">
                {formatCurrency(oldRegime.cess, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-black">
              <span className="text-slate-900 dark:text-white">Total Tax Payable</span>
              <span className="text-rose-600 dark:text-rose-400">
                {formatCurrency(oldRegime.totalTax, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Effective Tax Rate</span>
              <span>{oldRegime.effectiveRate}%</span>
            </div>
          </div>
        </div>

        {/* New Regime Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          recommendedRegime === 'new'
            ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">New Tax Regime</h3>
              <p className="text-[11px] text-slate-500">Simplified slabs with ₹75k standard deduction</p>
            </div>
            {recommendedRegime === 'new' && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                Recommended
              </span>
            )}
          </div>

          <div className="space-y-3 pt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Gross Income</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(newRegime.grossIncome, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Standard Deduction (Enhanced)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -{formatCurrency(newRegime.standardDeduction, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Exemptions (80C, 80D, 24b)</span>
              <span className="text-slate-400 italic">
                Not Applicable
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 font-bold">
              <span className="text-slate-700 dark:text-slate-300">Net Taxable Income</span>
              <span className="text-slate-900 dark:text-white">
                {formatCurrency(newRegime.taxableIncome, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Tax Before Cess</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(newRegime.taxBeforeCess, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Section 87A Rebate (up to 7L taxable)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {newRegime.rebate87A > 0 ? `-${formatCurrency(newRegime.rebate87A, { symbol: settings.currencySymbol })}` : 'Nil'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Health & Education Cess (4%)</span>
              <span className="text-slate-700 dark:text-slate-300">
                {formatCurrency(newRegime.cess, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-black">
              <span className="text-slate-900 dark:text-white">Total Tax Payable</span>
              <span className="text-rose-600 dark:text-rose-400">
                {formatCurrency(newRegime.totalTax, { symbol: settings.currencySymbol })}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Effective Tax Rate</span>
              <span>{newRegime.effectiveRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
