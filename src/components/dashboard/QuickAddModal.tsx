'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { TransactionModal } from '@/components/budget/TransactionModal';
import { InvestmentModal } from '@/components/investments/InvestmentModal';
import { GoalModal } from '@/components/goals/GoalModal';
import { LoanModal } from '@/components/loans/LoanModal';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  TrendingDown,
  TrendingUp,
  LineChart,
  Target,
  CreditCard,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, addInvestment, addGoal, addLoan } = useFinance();
  const [activeForm, setActiveForm] = useState<'expense' | 'income' | 'investment' | 'goal' | 'loan' | null>(null);

  const handleSelect = (type: 'expense' | 'income' | 'investment' | 'goal' | 'loan') => {
    setActiveForm(type);
  };

  const closeAll = () => {
    setActiveForm(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !activeForm} onClose={onClose} title="Add Financial Record">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
          {/* Expense */}
          <button
            type="button"
            onClick={() => handleSelect('expense')}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Record Expense</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily spending & bills</p>
            </div>
          </button>

          {/* Income */}
          <button
            type="button"
            onClick={() => handleSelect('income')}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-900/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Record Income</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Salary, business & gigs</p>
            </div>
          </button>

          {/* Investment */}
          <button
            type="button"
            onClick={() => handleSelect('investment')}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-900/60 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Investment</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">SIP, Lumpsum, FD, Stocks</p>
            </div>
          </button>

          {/* Goal */}
          <button
            type="button"
            onClick={() => handleSelect('goal')}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-900/60 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Create Goal</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Emergency fund, gadgets & travel</p>
            </div>
          </button>

          {/* Loan */}
          <button
            type="button"
            onClick={() => handleSelect('loan')}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all group sm:col-span-2"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Track Loan / EMI</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Outstanding balance & remaining EMIs</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Sub-form Modals */}
      {activeForm === 'expense' && (
        <TransactionModal
          isOpen={true}
          onClose={closeAll}
          defaultType="expense"
          onSave={async (data) => {
            await addTransaction(data);
          }}
        />
      )}

      {activeForm === 'income' && (
        <TransactionModal
          isOpen={true}
          onClose={closeAll}
          defaultType="income"
          onSave={async (data) => {
            await addTransaction(data);
          }}
        />
      )}

      {activeForm === 'investment' && (
        <InvestmentModal
          isOpen={true}
          onClose={closeAll}
          onSave={async (data) => {
            await addInvestment(data);
          }}
        />
      )}

      {activeForm === 'goal' && (
        <GoalModal
          isOpen={true}
          onClose={closeAll}
          onSave={async (data) => {
            await addGoal(data);
          }}
        />
      )}

      {activeForm === 'loan' && (
        <LoanModal
          isOpen={true}
          onClose={closeAll}
          onSave={async (data) => {
            await addLoan(data);
          }}
        />
      )}
    </>
  );
};
