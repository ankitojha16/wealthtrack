'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Goal } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(initialData.targetAmount.toString());
      setCurrentAmount(initialData.currentAmount.toString());
      setTargetDate(initialData.targetDate);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Default target date 1 year from now
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setTargetDate(d.toISOString().split('T')[0]);
    }
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const numTarget = parseFloat(targetAmount) || 0;
  const numCurrent = parseFloat(currentAmount) || 0;
  const remaining = Math.max(0, numTarget - numCurrent);
  const progressPercent = numTarget > 0 ? Math.min(100, (numCurrent / numTarget) * 100) : 0;

  // Auto-calculate required monthly contribution
  let monthsUntilTarget = 12;
  if (targetDate) {
    const tDate = new Date(targetDate);
    const now = new Date();
    monthsUntilTarget = Math.max(1, (tDate.getFullYear() - now.getFullYear()) * 12 + (tDate.getMonth() - now.getMonth()));
  }
  const requiredMonthly = remaining > 0 ? Math.ceil(remaining / monthsUntilTarget) : 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }

    if (!targetDate) {
      setError('Please choose a target date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        name: name.trim(),
        category: 'Custom',
        targetAmount: numTarget,
        currentAmount: numCurrent,
        targetDate,
        monthlyContribution: requiredMonthly,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save goal record', error);
      setError(error instanceof Error ? error.message : 'Unable to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Goal' : 'Create Goal'}
      maxWidthClass="max-w-md"
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
              const form = document.getElementById('goal-form') as HTMLFormElement;
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
            {isSubmitting ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      }
    >
      <form id="goal-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Goal Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Goal Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund or Europe Trip"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 300000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Saved (₹)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Target Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Live Progress Preview */}
        {numTarget > 0 && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{formatPercent(progressPercent, 1)}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>Remaining: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(remaining)}</strong></span>
              {requiredMonthly > 0 && (
                <span>Need monthly: <strong className="text-sky-600 dark:text-sky-400">~{formatCurrency(requiredMonthly)}</strong></span>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
