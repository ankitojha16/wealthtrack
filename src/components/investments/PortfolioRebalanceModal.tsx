'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Investment } from '@/types';
import {
  calculatePortfolioRebalance,
  AssetAllocationMap,
} from '@/lib/calculations';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  PieChart,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface PortfolioRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  investments: Investment[];
}

type ModelProfile = 'aggressive' | 'balanced' | 'conservative' | 'custom';

const MODEL_PRESETS: Record<Exclude<ModelProfile, 'custom'>, AssetAllocationMap> = {
  aggressive: { equity: 80, debt: 15, gold: 5, cash: 0 },
  balanced: { equity: 60, debt: 30, gold: 10, cash: 0 },
  conservative: { equity: 30, debt: 60, gold: 10, cash: 0 },
};

export const PortfolioRebalanceModal: React.FC<PortfolioRebalanceModalProps> = ({
  isOpen,
  onClose,
  investments,
}) => {
  const { settings } = useFinance();
  const [profile, setProfile] = useState<ModelProfile>('balanced');
  const [customTargets, setCustomTargets] = useState<AssetAllocationMap>({
    equity: 50,
    debt: 30,
    gold: 15,
    cash: 5,
  });

  // Classify current investments
  const currentHoldings: AssetAllocationMap = useMemo(() => {
    let equity = 0;
    let debt = 0;
    let gold = 0;
    let cash = 0;

    investments.forEach((inv) => {
      const type = inv.type.toLowerCase();
      const val = inv.currentValue || 0;

      if (type.includes('stock') || type.includes('sip') || type.includes('lump') || type.includes('mutual')) {
        equity += val;
      } else if (type.includes('fd') || type.includes('fixed') || type.includes('rd') || type.includes('bond') || type.includes('ppf') || type.includes('epf') || type.includes('nps')) {
        debt += val;
      } else if (type.includes('gold')) {
        gold += val;
      } else {
        cash += val;
      }
    });

    return { equity, debt, gold, cash };
  }, [investments]);

  const activeTargets: AssetAllocationMap = profile === 'custom' ? customTargets : MODEL_PRESETS[profile];

  const targetSum = activeTargets.equity + activeTargets.debt + activeTargets.gold + activeTargets.cash;
  const isTargetSumValid = targetSum === 100;

  const rebalanceData = useMemo(() => {
    return calculatePortfolioRebalance(currentHoldings, activeTargets);
  }, [currentHoldings, activeTargets]);

  const handleCustomChange = (key: keyof AssetAllocationMap, val: string) => {
    const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setCustomTargets((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Allocation & Portfolio Rebalancer"
      maxWidthClass="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-500">
            Total Portfolio: {formatCurrency(rebalanceData.totalValue, { symbol: settings.currencySymbol })}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Model Presets Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Target Strategy & Risk Model
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'aggressive', title: 'Aggressive (80/20)', desc: '80% Eq • 15% Debt • 5% Gold' },
              { id: 'balanced', title: 'Balanced (60/40)', desc: '60% Eq • 30% Debt • 10% Gold' },
              { id: 'conservative', title: 'Conservative', desc: '30% Eq • 60% Debt • 10% Gold' },
              { id: 'custom', title: 'Custom Model', desc: 'Define your own allocations' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setProfile(m.id as ModelProfile)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  profile === m.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className={`text-xs font-black ${
                  profile === m.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {m.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {m.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Allocation Sliders if custom */}
        {profile === 'custom' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Customize Target Percentages (Total must equal 100%)
              </span>
              <span className={`text-xs font-black ${isTargetSumValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                Total: {targetSum}% {isTargetSumValid ? '✓' : '(Must be 100%)'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['equity', 'debt', 'gold', 'cash'] as const).map((key) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 capitalize mb-1">
                    {key} %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customTargets[key]}
                    onChange={(e) => handleCustomChange(key, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Callout Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          rebalanceData.isRebalanceNeeded
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            {rebalanceData.isRebalanceNeeded ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-black">
                {rebalanceData.isRebalanceNeeded
                  ? `Portfolio Drift Detected (${rebalanceData.maxDriftPct}% max deviation)`
                  : 'Portfolio is in Equilibrium'}
              </h4>
              <p className="text-[11px] opacity-80 mt-0.5">
                {rebalanceData.isRebalanceNeeded
                  ? 'Your current asset weightings have drifted from target. Execute the suggested rebalancing trades below.'
                  : 'Asset allocations are within safe tolerance bounds (under 5% drift). No urgent rebalancing needed.'}
              </p>
            </div>
          </div>
        </div>

        {/* Rebalancing Trades & Allocation Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-sky-500" />
            Asset Class Breakdown & Recommended Trades
          </h4>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">Asset Class</th>
                  <th className="p-3">Current Value</th>
                  <th className="p-3">Current %</th>
                  <th className="p-3">Target %</th>
                  <th className="p-3">Drift %</th>
                  <th className="p-3 text-right">Action Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {rebalanceData.trades.map((trade) => {
                  const isBuy = trade.action === 'buy';
                  const isSell = trade.action === 'sell';

                  return (
                    <tr key={trade.assetClass} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {trade.label}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {formatCurrency(trade.currentAmount, { symbol: settings.currencySymbol })}
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        {trade.currentPct}%
                      </td>
                      <td className="p-3 font-semibold text-sky-600 dark:text-sky-400">
                        {trade.targetPct}%
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          Math.abs(trade.driftPct) >= 5
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'text-slate-500'
                        }`}>
                          {trade.driftPct > 0 ? `+${trade.driftPct}%` : `${trade.driftPct}%`}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isBuy ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg">
                            Buy +{formatCurrency(trade.actionAmount, { symbol: settings.currencySymbol })}
                          </span>
                        ) : isSell ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg">
                            Sell -{formatCurrency(trade.actionAmount, { symbol: settings.currencySymbol })}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-[11px]">Hold (Target Met)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
