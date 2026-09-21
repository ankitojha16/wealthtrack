'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Investment } from '@/types';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  LineChart,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Edit2,
  Trash2,
  TrendingUp,
  Tag,
  Building2,
} from 'lucide-react';

interface InvestmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
  onEdit: (inv: Investment) => void;
  onUpdateValue: (inv: Investment) => void;
  onDelete: (id: string) => void;
}

export const InvestmentDetailsModal: React.FC<InvestmentDetailsModalProps> = ({
  isOpen,
  onClose,
  investment,
  onEdit,
  onUpdateValue,
  onDelete,
}) => {
  const { settings } = useFinance();

  if (!investment) return null;

  const isStock = investment.type === 'Stocks';
  const gain = investment.currentValue - investment.investedAmount;
  const returnPercent = investment.investedAmount > 0 ? (gain / investment.investedAmount) * 100 : 0;
  const isPositive = gain >= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Investment Details"
      maxWidthClass="max-w-lg"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onUpdateValue(investment);
            }}
            className="flex-1 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Value</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(investment);
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
            title="Edit details"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm(`Remove investment "${investment.name}"?`)) {
                onClose();
                onDelete(investment.id);
              }
            }}
            className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold"
            title="Delete holding"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Title Header */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {investment.type}
              </span>
              {isStock && investment.exchange && (
                <span className="text-[10px] font-bold text-slate-400">
                  {investment.exchange}
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{investment.name}</h3>
            {isStock && investment.symbol && (
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 block">
                {investment.symbol}
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Current Value</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(investment.currentValue, { symbol: settings.currencySymbol })}
            </span>
          </div>
        </div>

        {/* Valuation Source Badge */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {isStock && investment.priceSource === 'api' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                  Live value powered by {investment.apiProvider || 'Stock API'}
                </span>
              </>
            ) : (
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                User-entered valuation
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            Last updated: {formatDate(investment.lastUpdatedAt)}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Invested</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatCurrency(investment.investedAmount, { symbol: settings.currencySymbol })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Absolute Gain / Loss</span>
            <span className={`text-base font-bold mt-0.5 block ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {isPositive ? '+' : ''}
              {formatCurrency(gain, { symbol: settings.currencySymbol })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Return</span>
            <span className={`text-base font-bold mt-0.5 block ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {isPositive ? '+' : ''}
              {formatPercent(returnPercent, 2)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Investment Date</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {investment.investmentDate ? formatDate(investment.investmentDate) : 'Not set'}
            </span>
          </div>
        </div>

        {/* Stock Specific Fields (if holding is stock) */}
        {isStock && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Stock Holding Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 text-[10px] block">Quantity</span>
                <span className="font-bold text-slate-900 dark:text-white">{investment.quantity || 0} Shares</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Avg. Buy Price</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(investment.purchasePrice || 0, { symbol: settings.currencySymbol })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Current API Price</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {investment.currentPrice
                    ? formatCurrency(investment.currentPrice, { symbol: settings.currencySymbol })
                    : 'Current price unavailable'}
                </span>
              </div>
              {investment.brokerage && investment.brokerage > 0 && (
                <div>
                  <span className="text-slate-400 text-[10px] block">Brokerage Paid</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(investment.brokerage, { symbol: settings.currencySymbol })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maturity date & notes */}
        {(investment.maturityDate || investment.notes) && (
          <div className="space-y-2 text-xs text-slate-500">
            {investment.maturityDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Maturity: {formatDate(investment.maturityDate)}</span>
              </div>
            )}
            {investment.notes && (
              <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl italic">
                Notes: {investment.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
