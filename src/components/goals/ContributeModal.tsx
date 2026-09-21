'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Goal } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onContribute: (id: string, amount: number) => Promise<void>;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  goal,
  onContribute,
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!goal) return null;

  const numAmount = parseFloat(amount) || 0;
  const newTotal = goal.currentAmount + numAmount;
  const remaining = Math.max(0, goal.targetAmount - newTotal);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || numAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await onContribute(goal.id, numAmount);
      setAmount('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contribution to Goal"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById('contribute-form') as HTMLFormElement;
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
            {isSubmitting ? 'Saving...' : 'Add Contribution'}
          </button>
        </div>
      }
    >
      <form id="contribute-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">{goal.category}</span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{goal.name}</h4>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Current: {formatCurrency(goal.currentAmount)}</span>
            <span>Target: {formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Contribution Amount (₹)
          </label>
          <input
            type="number"
            step="any"
            min="1"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`e.g. ${goal.monthlyContribution || 5000}`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {numAmount > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-500">New Saved Balance</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(newTotal)}</span>
          </div>
        )}
      </form>
    </Modal>
  );
};
