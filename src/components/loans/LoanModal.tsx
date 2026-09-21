'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Loan, LoanType } from '@/types';
import { LOAN_TYPES } from '@/lib/data/categories';
import { formatCurrency } from '@/lib/formatters';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Loan | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<LoanType>('Personal Loan');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [emisRemaining, setEmisRemaining] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numOutstanding = parseFloat(outstandingAmount) || 0;
  const numEmi = parseFloat(monthlyEmi) || 0;
  const numRemaining = parseInt(emisRemaining, 10) || 0;
  const totalRemainingPayable = numEmi * numRemaining;
  const effectiveOutstanding = numOutstanding > 0 ? numOutstanding : totalRemainingPayable;
  const displayedRemaining = numEmi > 0 && numRemaining > 0 ? totalRemainingPayable : 0;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setOutstandingAmount(initialData.outstandingAmount.toString());
      setMonthlyEmi(initialData.monthlyEmi.toString());
      setEmisRemaining(initialData.emisRemaining.toString());
      setInterestRate(initialData.interestRate?.toString() || '');
    } else {
      setName('');
      setType('Personal Loan');
      setOutstandingAmount('');
      setMonthlyEmi('');
      setEmisRemaining('');
      setInterestRate('');
    }
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (numEmi <= 0 || numRemaining <= 0) return;

    const nextValue = String(totalRemainingPayable);
    const isEmptyOrSame = !outstandingAmount || Number(outstandingAmount) <= 0 || Number(outstandingAmount) === totalRemainingPayable;

    if (isEmptyOrSame && outstandingAmount !== nextValue) {
      setOutstandingAmount(nextValue);
    }
  }, [numEmi, numRemaining, outstandingAmount, totalRemainingPayable]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setError('Please provide a loan name.');
      return;
    }

    if (isNaN(numOutstanding) || numOutstanding < 0) {
      setError('Please enter a valid outstanding balance.');
      return;
    }

    if (isNaN(numEmi) || numEmi <= 0) {
      setError('Monthly EMI must be greater than zero.');
      return;
    }

    if (isNaN(numRemaining) || numRemaining < 0) {
      setError('EMIs remaining must be 0 or more.');
      return;
    }

    const numRate = parseFloat(interestRate);

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        name: name.trim(),
        type,
        outstandingAmount: effectiveOutstanding,
        monthlyEmi: numEmi,
        emisRemaining: numRemaining,
        interestRate: isNaN(numRate) ? undefined : numRate,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save loan record', error);
      setError(error instanceof Error ? error.message : 'Unable to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Loan' : 'Add Loan'}
      maxWidthClass="max-w-sm"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById('loan-form') as HTMLFormElement;
              if (form) {
                if (form.checkValidity()) {
                  handleSubmit();
                } else {
                  form.reportValidity();
                }
              }
            }}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Loan' : 'Add Loan'}
          </button>
        </div>
      }
    >
      <form id="loan-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Name and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Loan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HDFC Home Loan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Loan Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LoanType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Outstanding Balance (₹) <span className="font-normal text-slate-400">optional</span>
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={outstandingAmount}
            onChange={(e) => setOutstandingAmount(e.target.value)}
            placeholder={numRemaining > 0 ? String(totalRemainingPayable) : 'e.g. 285000'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-1">
          If you enter EMI and remaining months, the remaining amount is auto-filled for you.
        </p>

        {/* EMI and EMIs Remaining */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly EMI (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={monthlyEmi}
              onChange={(e) => setMonthlyEmi(e.target.value)}
              placeholder="e.g. 12000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 p-3">
            <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              How many EMIs are remaining? <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={emisRemaining}
              onChange={(e) => setEmisRemaining(e.target.value)}
              placeholder="e.g. 24"
              className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Live Calculation */}
        {numEmi > 0 && numRemaining > 0 && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Remaining Amount</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(displayedRemaining)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Approx. Payoff</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {numRemaining} months
              </span>
            </div>
          </div>
        )}

        {/* Interest Rate — Optional */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Interest Rate (% p.a.) <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="number"
            step="any"
            min="0"
            max="100"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 9.5"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};
