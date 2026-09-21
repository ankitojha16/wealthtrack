'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Investment } from '@/types';
import { getCurrentDateString, formatCurrency, formatPercent } from '@/lib/formatters';
import { searchStocks, fetchStockQuote, StockSearchResult } from '@/lib/stocks';
import { Search, TrendingUp, AlertCircle, Info, Sparkles, Building2 } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stockData: Omit<Investment, 'id' | 'createdAt' | 'lastUpdatedAt'>) => Promise<void>;
  initialData?: Investment | null;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedStock, setSelectedStock] = useState<{
    name: string;
    symbol: string;
    exchange: string;
  } | null>(null);

  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate] = useState(getCurrentDateString());

  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'success' | 'unavailable'>('idle');
  const [apiProvider, setApiProvider] = useState('Stock Market API');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && initialData.type === 'Stocks') {
      setSelectedStock({
        name: initialData.name,
        symbol: initialData.symbol || initialData.name,
        exchange: initialData.exchange || 'NSE',
      });
      setQuantity(initialData.quantity?.toString() || '');
      setPurchasePrice(initialData.purchasePrice?.toString() || '');
      setCurrentPrice(initialData.currentPrice?.toString() || '');
      setQuoteStatus(initialData.apiStatus === 'success' ? 'success' : 'idle');
    } else {
      setSelectedStock(null);
      setSearchQuery('');
      setSearchResults([]);
      setQuantity('');
      setPurchasePrice('');
      setCurrentPrice('');
      setQuoteStatus('idle');
    }
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  // Handle stock search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch quote when stock is selected
  const handleSelectStock = async (stock: StockSearchResult) => {
    setSelectedStock({
      name: stock.name,
      symbol: stock.symbol,
      exchange: stock.exchange,
    });
    setSearchResults([]);
    setSearchQuery('');

    setQuoteStatus('loading');
    const quote = await fetchStockQuote(stock.symbol, stock.exchange);
    if (quote.status === 'success' && quote.price > 0) {
      setCurrentPrice(quote.price.toString());
      setQuoteStatus('success');
      if (quote.provider) setApiProvider(quote.provider);
      if (!purchasePrice) {
        setPurchasePrice(quote.price.toString());
      }
    } else {
      setCurrentPrice('');
      setQuoteStatus('unavailable');
    }
  };

  const numQty = parseFloat(quantity) || 0;
  const numBuyPrice = parseFloat(purchasePrice) || 0;
  const numCurrentPrice = parseFloat(currentPrice) || 0;

  const totalInvested = numQty * numBuyPrice;
  const currentValue = numCurrentPrice > 0 ? numQty * numCurrentPrice : totalInvested;
  const profitLoss = currentValue - totalInvested;
  const returnPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedStock) {
      setError('Please search and select a stock company or symbol.');
      return;
    }

    if (numQty <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (numBuyPrice <= 0) {
      setError('Purchase price must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        name: selectedStock.name,
        type: 'Stocks',
        symbol: selectedStock.symbol,
        exchange: selectedStock.exchange,
        quantity: numQty,
        purchasePrice: numBuyPrice,
        investedAmount: Math.round(totalInvested),
        currentValue: Math.round(currentValue),
        investmentDate: purchaseDate,
        currentPrice: numCurrentPrice > 0 ? numCurrentPrice : undefined,
        priceSource: quoteStatus === 'success' ? 'api' : 'manual',
        apiProvider: quoteStatus === 'success' ? apiProvider : undefined,
        apiLastUpdated: quoteStatus === 'success' ? new Date().toISOString() : undefined,
        apiStatus: quoteStatus === 'success' ? 'success' : 'unavailable',
      });
      onClose();
    } catch (error) {
      console.error('Failed to save stock position', error);
      setError('Unable to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Stock Position' : 'Add Stock Investment'}
      maxWidthClass="max-w-lg"
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
            type="submit"
            form="stock-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Stock' : 'Add Stock'}
          </button>
        </div>
      }
    >
      <form id="stock-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Stock Search Box (if none selected yet or editing) */}
        {!selectedStock ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Search Company or Symbol <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. HDFC Bank, Reliance, TCS, INFY..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Instant Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                {searchResults.map((item) => (
                  <button
                    key={`${item.symbol}-${item.exchange}`}
                    type="button"
                    onClick={() => handleSelectStock(item)}
                    className="w-full p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.symbol} • {item.exchange}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <p className="text-[11px] text-slate-400 mt-1 animate-pulse">Searching matching stocks...</p>
            )}
          </div>
        ) : (
          /* Selected Stock Badge */
          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
                {selectedStock.symbol.substring(0, 2)}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedStock.name}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-sky-600 dark:text-sky-400">{selectedStock.symbol}</span>
                  <span>•</span>
                  <span>{selectedStock.exchange}</span>
                </div>
              </div>
            </div>

            {!initialData && (
              <button
                type="button"
                onClick={() => setSelectedStock(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Change
              </button>
            )}
          </div>
        )}

        {/* Live Status indicator */}
        {selectedStock && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300">
            {quoteStatus === 'success' ? (
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live price available
                </span>
                <span className="font-bold text-slate-900 dark:text-white">₹{Number(currentPrice || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            ) : quoteStatus === 'loading' ? (
              <span className="text-sky-600 animate-pulse font-semibold">Fetching live market price...</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Market price unavailable. You can still add the stock manually.
              </span>
            )}
          </div>
        )}

        {/* Quantity and Purchase Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity (Shares) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 25"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Purchase Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g. 1650.50"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        {numQty > 0 && numBuyPrice > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Invested</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalInvested)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Current Valuation</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(currentValue)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[11px]">Profit / Loss</span>
                <span className={`font-bold text-sm ${profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {profitLoss >= 0 ? '+' : ''}
                  {formatCurrency(profitLoss)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Return</span>
                <span className={`font-bold text-sm ${returnPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {returnPercent >= 0 ? '+' : ''}
                  {formatPercent(returnPercent, 2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
