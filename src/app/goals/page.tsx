'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatPercent, formatDate, formatMonthYear } from '@/lib/formatters';
import { GoalModal } from '@/components/goals/GoalModal';
import { ContributeModal } from '@/components/goals/ContributeModal';
import { Goal } from '@/types';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export default function GoalsPage() {
  const {
    goals,
    settings,
    addGoal,
    editGoal,
    contributeToGoal,
    removeGoal,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeTarget, setContributeTarget] = useState<Goal | null>(null);

  // Aggregate metrics
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn dreams into structured monthly milestones. Track emergency funds, education, gadgets, and homes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Aggregate Progress Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Target</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalTarget, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {goals.length} active financial goals
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Saved</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalSaved, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalSaved, { symbol: settings.currencySymbol })} accumulated
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Remaining Balance</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(totalRemaining, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalRemaining, { symbol: settings.currencySymbol })} to reach 100%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Goal Success</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatPercent(overallProgress, 1)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {completedGoalsCount} of {goals.length} goals achieved
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No goals created yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Create a goal to calculate required monthly savings. Common goals include a 6-Month Emergency Fund, Laptop
            Upgrade, Car Down Payment, or Vacation.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            // Compute remaining months
            const tDate = new Date(goal.targetDate);
            const now = new Date();
            const monthsLeft = Math.max(1, (tDate.getFullYear() - now.getFullYear()) * 12 + (tDate.getMonth() - now.getMonth()));
            const reqMonthly = remaining > 0 ? Math.ceil(remaining / monthsLeft) : 0;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      {goal.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete goal "${goal.name}"?`)) {
                            removeGoal(goal.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{goal.name}</h3>

                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </div>

                {/* Progress bar and metrics */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {formatCurrency(goal.currentAmount, { symbol: settings.currencySymbol })}
                    </span>
                    <span className="text-slate-400">
                      / {formatCurrency(goal.targetAmount, { symbol: settings.currencySymbol })}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : percent > 60 ? 'bg-sky-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={isCompleted ? 'text-emerald-600 font-bold flex items-center gap-1' : 'text-slate-600 dark:text-slate-300'}>
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Goal Achieved!
                        </>
                      ) : (
                        `${formatPercent(percent, 0)} completed`
                      )}
                    </span>
                    <span className="text-slate-400">
                      Remaining: {formatCurrency(remaining, { symbol: settings.currencySymbol })}
                    </span>
                  </div>
                </div>

                {/* Target Timeline and Monthly Contribution */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" /> Target Date
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatMonthYear(goal.targetDate)}
                    </span>
                  </div>

                  {!isCompleted && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[11px]">Required Monthly</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {formatCurrency(reqMonthly, { symbol: settings.currencySymbol })}/mo
                      </span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setContributeTarget(goal)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Log Contribution</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal}
        onSave={async (data) => {
          if (editingGoal) {
            await editGoal({ ...editingGoal, ...data });
          } else {
            await addGoal(data);
          }
        }}
      />

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={!!contributeTarget}
        onClose={() => setContributeTarget(null)}
        goal={contributeTarget}
        onContribute={async (id, amt) => {
          await contributeToGoal(id, amt);
        }}
      />
    </div>
  );
}
