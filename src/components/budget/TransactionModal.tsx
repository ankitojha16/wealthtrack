'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Transaction, TransactionType } from '@/types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/lib/data/categories';
import { getCurrentDateString } from '@/lib/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDateString());
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDescription(initialData.description || '');
      setDate(initialData.date);
    } else {
      setType(defaultType);
      setAmount('');
      setCategory(defaultType === 'expense' ? DEFAULT_EXPENSE_CATEGORIES[0].name : DEFAULT_INCOME_CATEGORIES[0].name);
      setDescription('');
      setDate(getCurrentDateString());
    }
    setError('');
    setIsSubmitting(false);
  }, [initialData, defaultType, isOpen]);

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        type,
        amount: numAmount,
        category,
        description: description.trim(),
        date,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save transaction record', error);
      setError('Unable to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Add Income'}
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
              const form = document.getElementById('transaction-form') as HTMLFormElement;
              if (form) {
                if (form.checkValidity()) {
                  handleSubmit();
                } else {
                  form.reportValidity();
                }
              }
            }}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Type Toggle */}
        {!initialData && (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory(DEFAULT_EXPENSE_CATEGORIES[0].name);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory(DEFAULT_INCOME_CATEGORIES[0].name);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            min="0.01"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1500"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {type === 'expense' ? 'Category' : 'Source'}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Description — Optional */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'expense' ? 'What was this for?' : 'e.g. Monthly salary'}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};
