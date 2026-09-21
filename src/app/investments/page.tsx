'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';
import { InvestmentModal } from '@/components/investments/InvestmentModal';
import { StockModal } from '@/components/investments/StockModal';
import { ValueUpdateModal } from '@/components/investments/ValueUpdateModal';
import { InvestmentDetailsModal } from '@/components/investments/InvestmentDetailsModal';
import { DonutChart } from '@/components/charts/DonutChart';
import { Investment, InvestmentType } from '@/types';
import { INVESTMENT_TYPES } from '@/lib/data/categories';
import { fetchStockQuote } from '@/lib/stocks';
import {
  TrendingUp,
  Plus,
  Search,
  LineChart,
  Clock,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function InvestmentsPage() {
  const {
    investments,
    totalInvested,
    totalInvestmentValue,
    totalInvestmentGain,
    investmentReturnPercent,
    settings,
    addInvestment,
    editInvestment,
    updateInvestmentCurrentValue,
    removeInvestment,
  } = useFinance();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [updateValTarget, setUpdateValTarget] = useState<Investment | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Investment | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isRefreshingStocks, setIsRefreshingStocks] = useState(false);

  const filtered = investments.filter((inv) => {
    const matchType = filterType === 'all' || inv.type === filterType;
    const query = search.toLowerCase();
    const matchSearch =
      !search ||
      inv.name.toLowerCase().includes(query) ||
      inv.type.toLowerCase().includes(query) ||
      (inv.symbol && inv.symbol.toLowerCase().includes(query)) ||
      (inv.notes && inv.notes.toLowerCase().includes(query));
    return matchType && matchSearch;
  });

  // Calculate valuations by category
  const stocksInvestments = investments.filter((i) => i.type === 'Stocks');
  const stocksValuation = stocksInvestments.reduce((sum, i) => sum + i.currentValue, 0);

  const mfInvestments = investments.filter((i) => i.type === 'Mutual Fund');
  const mfValuation = mfInvestments.reduce((sum, i) => sum + i.currentValue, 0);

  const fdInvestments = investments.filter(
    (i) => i.type === 'Fixed Deposit' || i.type === 'Fixed Deposit (FD)' || i.type === 'FD'
  );
  const fdValuation = fdInvestments.reduce((sum, i) => sum + i.currentValue, 0);

  const goldInvestments = investments.filter((i) => i.type === 'Gold');
  const goldValuation = goldInvestments.reduce((sum, i) => sum + i.currentValue, 0);

  // Category distribution for Donut Chart — normalize legacy aliases
  const invByType: Record<string, number> = {};
  investments.forEach((inv) => {
    let cleanType = inv.type;
    if (cleanType === 'FD' || cleanType === 'Fixed Deposit (FD)') cleanType = 'Fixed Deposit';
    if (cleanType === 'RD' || cleanType === 'Recurring Deposit (RD)') cleanType = 'Recurring Deposit';
    if (cleanType === 'Other Investment') cleanType = 'Other';
    invByType[cleanType] = (invByType[cleanType] || 0) + inv.currentValue;
  });

  const typeColors: Record<string, string> = {
    'Mutual Fund': '#0284c7',
    'Fixed Deposit': '#10b981',
    'Recurring Deposit': '#059669',
    PPF: '#8b5cf6',
    EPF: '#a855f7',
    NPS: '#f59e0b',
    Gold: '#eab308',
    Bonds: '#6366f1',
    Stocks: '#06b6d4',
    Other: '#ec4899',
    // Legacy aliases for old stored data
    'Fixed Deposit (FD)': '#10b981',
    'Recurring Deposit (RD)': '#059669',
  };

  const donutSegments = Object.entries(invByType).map(([label, value]) => ({
    label,
    value,
    color: typeColors[label] || '#0284c7',
  }));

  // Manual stock price refresh handler
  const handleRefreshStockPrices = async () => {
    if (isRefreshingStocks || stocksInvestments.length === 0) return;
    setIsRefreshingStocks(true);

    try {
      for (const stock of stocksInvestments) {
        if (stock.symbol) {
          const quote = await fetchStockQuote(stock.symbol, stock.exchange || 'NSE');
          if (quote.status === 'success' && quote.price > 0 && stock.quantity) {
            const newCurrentVal = Math.round(stock.quantity * quote.price);
            await editInvestment({
              ...stock,
              currentPrice: quote.price,
              currentValue: newCurrentVal,
              apiLastUpdated: new Date().toISOString(),
              apiStatus: 'success',
            });
          }
        }
      }
    } finally {
      setIsRefreshingStocks(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Investment Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic portfolio manager supporting both manual valuations and API-powered stock tracking.
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingInvestment(null);
              setIsManualModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingInvestment(null);
              setIsStockModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700 shadow-sm transition-all"
          >
            <LineChart className="w-4 h-4 text-sky-400" />
            <span>Add Stock</span>
          </button>

          {stocksInvestments.length > 0 && (
            <button
              type="button"
              onClick={handleRefreshStockPrices}
              disabled={isRefreshingStocks}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm disabled:opacity-50"
              title="Refresh stock quotes via API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStocks ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Stocks</span>
            </button>
          )}
        </div>
      </div>

      {/* Portfolio Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Invested</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalInvested, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalInvested, { symbol: settings.currencySymbol })} cost basis
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Current Value</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(totalInvestmentValue, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatCurrency(totalInvestmentValue, { symbol: settings.currencySymbol })} total valuation
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Gain / Loss</span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${totalInvestmentGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {totalInvestmentGain >= 0 ? '+' : ''}
            {formatCurrency(totalInvestmentGain, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {totalInvestmentGain >= 0 ? '+' : ''}{formatCurrency(totalInvestmentGain, { symbol: settings.currencySymbol })}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Overall Return</span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${investmentReturnPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {investmentReturnPercent >= 0 ? '+' : ''}
            {formatPercent(investmentReturnPercent, 2)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Across {investments.length} holdings</span>
        </div>
      </div>

      {/* Distinct Valuation Category Cards (Prompt Section 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Stocks Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Stocks</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="API-ready" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(stocksValuation, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
            Live value
          </span>
        </div>

        {/* Mutual Funds Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Mutual Funds</span>
            <span className="w-2 h-2 rounded-full bg-sky-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(mfValuation, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 block">
            User-updated value
          </span>
        </div>

        {/* FD Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Fixed Deposits</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(fdValuation, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 block">
            User-entered value
          </span>
        </div>

        {/* Gold Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gold & Commodities</span>
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(goldValuation, { symbol: settings.currencySymbol, compact: true })}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 block">
            User-entered value
          </span>
        </div>
      </div>

      {/* Holdings Ledger & Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Holdings List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls: Search and Filter Pills */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search holdings, ticker symbols, notes..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Instruments ({investments.length})</option>
              {INVESTMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Holdings List / Empty State */}
          {investments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto mb-3">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No investments yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Add your first investment to see your investment dashboard. Track Fixed Deposits, Mutual Funds, Stocks,
                PPF, Gold, and Retirement corpus.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Investment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white border border-slate-700 shadow-sm"
                >
                  <LineChart className="w-4 h-4 text-sky-400" />
                  <span>Add Stock</span>
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No holdings found matching &quot;{search}&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => {
                const isStock = inv.type === 'Stocks';
                const gain = inv.currentValue - inv.investedAmount;
                const returnPercent = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
                const isPositive = gain >= 0;

                return (
                  <div
                    key={inv.id}
                    onClick={() => setDetailsTarget(inv)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-800 transition-all space-y-3 cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: typeColors[inv.type] || '#0284c7' }}
                        >
                          {inv.type}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                            {inv.name}
                          </h4>
                          {isStock && inv.symbol && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {inv.symbol} • {inv.exchange || 'NSE'} • {inv.quantity || 0} Shares
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setUpdateValTarget(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 transition-colors"
                          title="Update current value"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Update Value</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isStock) {
                              setEditingInvestment(inv);
                              setIsStockModalOpen(true);
                            } else {
                              setEditingInvestment(inv);
                              setIsManualModalOpen(true);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove investment "${inv.name}"?`)) {
                              removeInvestment(inv.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete holding"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Numbers Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Invested</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(inv.investedAmount, { symbol: settings.currencySymbol })}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Current Value</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(inv.currentValue, { symbol: settings.currencySymbol })}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Gain / Loss</span>
                        <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}
                          {formatCurrency(gain, { symbol: settings.currencySymbol })}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Return</span>
                        <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}
                          {formatPercent(returnPercent, 2)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Source Indicator */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated: {formatDate(inv.lastUpdatedAt)}</span>
                      </div>

                      {/* Explicit valuation source */}
                      {isStock && inv.priceSource === 'api' ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                          <Sparkles className="w-3 h-3" />
                          Live price · TejHQ
                        </span>
                      ) : isStock ? (
                        <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">
                          Price unavailable · manually updated
                        </span>
                      ) : (
                        <span className="font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Value entered by you
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Portfolio Distribution (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between self-start space-y-4">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Portfolio Distribution</h3>
            <p className="text-xs text-slate-500">Asset allocation across instruments</p>
          </div>

          <DonutChart
            data={donutSegments}
            currencySymbol={settings.currencySymbol}
            emptyMessage="No investments added yet to compute distribution."
          />
        </div>
      </div>

      {/* Manual Investment Modal */}
      <InvestmentModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingInvestment(null);
        }}
        initialData={editingInvestment}
        onSave={async (data) => {
          if (editingInvestment) {
            await editInvestment({ ...editingInvestment, ...data });
          } else {
            await addInvestment(data);
          }
        }}
      />

      {/* Stock Investment Modal */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setEditingInvestment(null);
        }}
        initialData={editingInvestment}
        onSave={async (data) => {
          if (editingInvestment) {
            await editInvestment({ ...editingInvestment, ...data });
          } else {
            await addInvestment(data);
          }
        }}
      />

      {/* Fast Value Update Modal */}
      <ValueUpdateModal
        isOpen={!!updateValTarget}
        onClose={() => setUpdateValTarget(null)}
        investment={updateValTarget}
        onUpdate={async (id, val) => {
          await updateInvestmentCurrentValue(id, val);
        }}
      />

      {/* Detailed Investment View Modal */}
      <InvestmentDetailsModal
        isOpen={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        investment={detailsTarget}
        onEdit={(inv) => {
          setEditingInvestment(inv);
          if (inv.type === 'Stocks') {
            setIsStockModalOpen(true);
          } else {
            setIsManualModalOpen(true);
          }
        }}
        onUpdateValue={(inv) => setUpdateValTarget(inv)}
        onDelete={(id) => removeInvestment(id)}
      />
    </div>
  );
}
