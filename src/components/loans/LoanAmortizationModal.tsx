'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Loan } from '@/types';
import { calculateEMI, calculateLoanPrepayment } from '@/lib/calculations';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useFinance } from '@/lib/context/FinanceContext';
import { downloadFile } from '@/lib/export-import';
import {
  Calculator,
  Sparkles,
  TrendingDown,
  Clock,
  Download,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface LoanAmortizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

export const LoanAmortizationModal: React.FC<LoanAmortizationModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const { settings } = useFinance();

  // Custom simulator states
  const [interestRateInput, setInterestRateInput] = useState<string>('');
  const [prepaymentAmountInput, setPrepaymentAmountInput] = useState<string>('50000');
  const [prepaymentMonthInput, setPrepaymentMonthInput] = useState<string>('3');

  // Initialize or fallback to loan rate
  const annualRate = useMemo(() => {
    const custom = parseFloat(interestRateInput);
    if (!isNaN(custom) && custom > 0) return custom;
    return loan?.interestRate && loan.interestRate > 0 ? loan.interestRate : 10.5; // fallback standard 10.5%
  }, [interestRateInput, loan?.interestRate]);

  const principal = loan?.outstandingAmount || 0;
  const tenureMonths = loan?.emisRemaining || 12;
  const prepaymentAmount = parseFloat(prepaymentAmountInput) || 0;
  const prepaymentMonth = parseInt(prepaymentMonthInput, 10) || 1;

  // Calculate Base EMI and Schedule
  const baseCalc = useMemo(() => {
    if (!loan || principal <= 0 || tenureMonths <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0, breakdown: [] };
    }
    return calculateEMI(principal, annualRate, tenureMonths);
  }, [loan, principal, annualRate, tenureMonths]);

  // Calculate Prepayment Simulation
  const prepaymentCalc = useMemo(() => {
    if (!loan || principal <= 0 || tenureMonths <= 0 || prepaymentAmount <= 0) {
      return {
        originalTotalInterest: baseCalc.totalInterest,
        newTotalInterest: baseCalc.totalInterest,
        interestSaved: 0,
        monthsReduced: 0,
        originalEmi: baseCalc.monthlyEmi,
      };
    }
    return calculateLoanPrepayment(principal, annualRate, tenureMonths, prepaymentAmount, prepaymentMonth);
  }, [loan, principal, annualRate, tenureMonths, prepaymentAmount, prepaymentMonth, baseCalc]);

  if (!loan) return null;

  const downloadAmortizationScheduleCSV = () => {
    const headers = ['Month', 'EMI', 'Principal', 'Interest', 'Remaining Balance'];
    const rows = baseCalc.breakdown.map((b) => [
      b.month,
      baseCalc.monthlyEmi,
      b.principal.toFixed(2),
      b.interest.toFixed(2),
      b.balance.toFixed(2),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `${loan.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_amortization.csv`, 'text/csv');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Amortization & Prepayment — ${loan.name}`}
      maxWidthClass="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={downloadAmortizationScheduleCSV}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Amortization CSV</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Loan Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Balance</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(principal, { symbol: settings.currencySymbol })}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Monthly EMI</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(loan.monthlyEmi, { symbol: settings.currencySymbol })}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Interest Rate</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={interestRateInput || annualRate}
                onChange={(e) => setInterestRateInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-black text-slate-900 dark:text-white"
              />
              <span className="text-xs font-bold text-slate-500">% p.a.</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Est. Interest</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(baseCalc.totalInterest, { symbol: settings.currencySymbol })}
            </span>
          </div>
        </div>

        {/* Prepayment Simulator Card */}
        <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-emerald-950/40 border border-indigo-200/80 dark:border-indigo-900/50 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Prepayment Simulator & Debt-Free Estimator
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Simulate how making a one-time extra payment reduces your total interest and cuts months off your loan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lump-Sum Prepayment Amount ({settings.currencySymbol || '₹'})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={prepaymentAmountInput}
                  onChange={(e) => setPrepaymentAmountInput(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[25000, 50000, 100000, 200000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setPrepaymentAmountInput(String(quick))}
                    className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500"
                  >
                    +{formatCurrency(quick, { symbol: settings.currencySymbol, compact: true })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Prepayment Month (Installment #)
              </label>
              <select
                value={prepaymentMonthInput}
                onChange={(e) => setPrepaymentMonthInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">Month 1 (Immediate Next EMI)</option>
                <option value="3">Month 3 (In 3 Months)</option>
                <option value="6">Month 6 (In 6 Months)</option>
                <option value="12">Month 12 (1 Year)</option>
              </select>
            </div>
          </div>

          {/* Simulation Results Banner */}
          {prepaymentAmount > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Interest Saved
                  </span>
                  <span className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                    {formatCurrency(prepaymentCalc.interestSaved, { symbol: settings.currencySymbol })}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                    Debt-Free Earlier
                  </span>
                  <span className="text-lg font-black text-indigo-800 dark:text-indigo-200">
                    {prepaymentCalc.monthsReduced} Months earlier
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amortization Schedule Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-sky-500" />
              <span>Upcoming Amortization Schedule (First {Math.min(baseCalc.breakdown.length, 24)} months)</span>
            </h5>
            <span className="text-[11px] text-slate-500">
              {tenureMonths} EMIs total
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold sticky top-0">
                <tr>
                  <th className="p-2.5">Month #</th>
                  <th className="p-2.5">EMI Installment</th>
                  <th className="p-2.5 text-emerald-600 dark:text-emerald-400">Principal Repaid</th>
                  <th className="p-2.5 text-amber-600 dark:text-amber-400">Interest Paid</th>
                  <th className="p-2.5 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {baseCalc.breakdown.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-slate-600 dark:text-slate-400">
                      Month {row.month}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(baseCalc.monthlyEmi, { symbol: settings.currencySymbol })}
                    </td>
                    <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.principal, { symbol: settings.currencySymbol })}
                    </td>
                    <td className="p-2.5 font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(row.interest, { symbol: settings.currencySymbol })}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(row.balance, { symbol: settings.currencySymbol })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
