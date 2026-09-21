'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Investment } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface ValueUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
  onUpdate: (id: string, currentValue: number) => Promise<void>;
}

export const ValueUpdateModal: React.FC<ValueUpdateModalProps> = ({
  isOpen,
  onClose,
  investment,
  onUpdate,
}) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (investment) {
      setValue(investment.currentValue.toString());
    }
  }, [investment, isOpen]);

  if (!investment) return null;

  const numCurrent = parseFloat(value) || 0;
  const gain = numCurrent - investment.investedAmount;
  const returnPercent = investment.investedAmount > 0 ? (gain / investment.investedAmount) * 100 : 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (isNaN(numCurrent) || numCurrent < 0) return;

    try {
      setIsSubmitting(true);
      await onUpdate(investment.id, numCurrent);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Investment Value"
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
              const form = document.getElementById('value-update-form') as HTMLFormElement;
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
            {isSubmitting ? 'Saving...' : 'Save Update'}
          </button>
        </div>
      }
    >
      <form id="value-update-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-xs text-slate-500 block">{investment.type}</span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{investment.name}</h4>
          <span className="text-xs text-slate-500">
            Invested Amount: {formatCurrency(investment.investedAmount)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            New Current Value (₹)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">New Gain / Loss</span>
            <span className={`font-bold ${gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {gain >= 0 ? '+' : ''}
              {formatCurrency(gain)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">New Return</span>
            <span className={`font-bold ${returnPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {formatPercent(returnPercent, 2, true)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          This will update the valuation timestamp to today. Values are entered and maintained solely by you.
        </p>
      </form>
    </Modal>
  );
};
