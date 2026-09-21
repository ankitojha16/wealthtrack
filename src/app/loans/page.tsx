'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import { LoanModal } from '@/components/loans/LoanModal';
import { Loan } from '@/types';
import {
  CreditCard,
  Plus,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';

export default function LoansPage() {
  const {
    loans,
    totalLoansOutstanding,
    totalMonthlyEmi,
    settings,
    addLoan,
    editLoan,
    payLoanEmi,
    removeLoan,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Aggregate metrics
  const totalEmisRemainingCount = loans.reduce((sum, l) => sum + l.emisRemaining, 0);
  const totalEstimatedRemainingAmount = loans.reduce((sum, l) => sum + l.monthlyEmi * l.emisRemaining, 0);
  const totalOriginalSanctioned = loans.reduce((sum, l) => sum + (l.originalAmount ?? 0), 0);
  const totalRepaidAmount = Math.max(0, totalOriginalSanctioned - totalLoansOutstanding);
  const overallRepaidPercent = totalOriginalSanctioned > 0 ? (totalRepaidAmount / totalOriginalSanctioned) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Loan & Debt Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor debt obligations, monthly EMI impact, and exact pending installments until debt freedom.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingLoan(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Loan Record</span>
        </button>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Outstanding</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalLoansOutstanding, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalLoansOutstanding, { symbol: settings.currencySymbol })} remaining debt
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Monthly EMI Burden</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalMonthlyEmi, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalMonthlyEmi, { symbol: settings.currencySymbol })}/month across {loans.length} loans
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total EMIs Pending</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalEmisRemainingCount}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Estimated ~{formatCurrency(totalEstimatedRemainingAmount, { symbol: settings.currencySymbol, compact: true })} total cash outflow
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Repaid Progress</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatPercent(overallRepaidPercent, 1)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalRepaidAmount, { symbol: settings.currencySymbol, compact: true })} paid off
          </span>
        </div>
      </div>

      {/* Loans List / Empty State */}
      {loans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No loan data</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Add a loan to track outstanding balance, interest obligations, and see how many EMIs are left until debt freedom.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingLoan(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Loan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => {
            const original = loan.originalAmount ?? 0;
            const repaidAmount = Math.max(0, original - loan.outstandingAmount);
            const repaidPercent = original > 0 ? (repaidAmount / original) * 100 : 0;
            const estimatedPayable = loan.monthlyEmi * loan.emisRemaining;

            return (
              <div
                key={loan.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      {loan.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLoan(loan);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit loan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove loan "${loan.name}"?`)) {
                            removeLoan(loan.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete loan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{loan.name}</h3>

                  {loan.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{loan.notes}</p>
                  )}
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Outstanding</span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(loan.outstandingAmount, { symbol: settings.currencySymbol })}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Monthly EMI</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(loan.monthlyEmi, { symbol: settings.currencySymbol })}
                    </span>
                  </div>
                </div>

                {/* Mandatory EMIs Remaining Badge */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                        {loan.emisRemaining} EMIs remaining
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">
                        Est. total: {formatCurrency(estimatedPayable, { symbol: settings.currencySymbol })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => payLoanEmi(loan.id)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-sm"
                    title="Record that you paid this month's installment"
                  >
                    Paid EMI
                  </button>
                </div>

                {/* Repayment Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Repaid Progress</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPercent(repaidPercent, 1)} repaid
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, repaidPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Next EMI Date and Interest */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <span>Rate: {(loan.interestRate ?? 0) > 0 ? `${loan.interestRate}% p.a.` : 'Not set'}</span>
                  {loan.nextEmiDate ? (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      Next: {formatDate(loan.nextEmiDate)}
                    </span>
                  ) : (
                    <span>Next: Active</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loan Modal */}
      <LoanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLoan(null);
        }}
        initialData={editingLoan}
        onSave={async (data) => {
          if (editingLoan) {
            await editLoan({ ...editingLoan, ...data });
          } else {
            await addLoan(data);
          }
        }}
      />
    </div>
  );
}
