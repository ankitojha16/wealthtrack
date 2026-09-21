'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Investment, InvestmentType } from '@/types';
import { INVESTMENT_TYPES } from '@/lib/data/categories';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { calculateFD, calculateXIRR } from '@/lib/calculations';
import { searchStocks, fetchStockQuote, StockSearchResult } from '@/lib/stocks';
import { TrendingUp, TrendingDown, Search, Sparkles } from 'lucide-react';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: Omit<Investment, 'id' | 'createdAt' | 'lastUpdatedAt'>) => Promise<void>;
  initialData?: Investment | null;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [type, setType] = useState<InvestmentType>('SIP');
  
  // Generic / SIP / Lumpsum / FD
  const [amount, setAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [startMonthYear, setStartMonthYear] = useState('');
  const [totalYears, setTotalYears] = useState('');
  const [interestRate, setInterestRate] = useState('');
  
  // Stocks
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ name: string; symbol: string; exchange: string; } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'success' | 'unavailable'>('idle');
  const [apiProvider, setApiProvider] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type as InvestmentType);
      
      if (initialData.type === 'Stocks') {
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
        setAmount(initialData.investedAmount.toString());
        setCurrentValue(initialData.currentValue.toString());
        setStartMonthYear(initialData.investmentDate ? initialData.investmentDate.slice(0, 7) : ''); // YYYY-MM
        
        if (initialData.investmentDate && initialData.maturityDate) {
           const y1 = parseInt(initialData.investmentDate.split('-')[0]);
           const y2 = parseInt(initialData.maturityDate.split('-')[0]);
           setTotalYears((y2 - y1).toString());
        } else {
           setTotalYears('');
        }
        
        setInterestRate(initialData.interestRate?.toString() || '');
      }
    } else {
      resetFields();
    }
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const resetFields = () => {
    setType('SIP');
    setAmount('');
    setCurrentValue('');
    setStartMonthYear('');
    setTotalYears('');
    setInterestRate('');
    
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStock(null);
    setQuantity('');
    setPurchasePrice('');
    setCurrentPrice('');
    setQuoteStatus('idle');
  };

  // Stock search effect
  useEffect(() => {
    if (type !== 'Stocks' || !searchQuery || searchQuery.trim().length < 1) {
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
  }, [searchQuery, type]);

  const handleSelectStock = async (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setSearchResults([]);
    setSearchQuery('');
    setQuoteStatus('loading');
    
    const quote = await fetchStockQuote(stock.symbol, stock.exchange);
    if (quote.status === 'success' && quote.price > 0) {
      setCurrentPrice(quote.price.toString());
      setQuoteStatus('success');
      if (quote.provider) setApiProvider(quote.provider);
      if (!purchasePrice) setPurchasePrice(quote.price.toString());
    } else {
      setCurrentPrice('');
      setQuoteStatus('unavailable');
    }
  };

  const calculateXIRRValue = () => {
    if (!startMonthYear || !totalYears || Number(totalYears) <= 0 || Number(amount) <= 0 || Number(currentValue) <= 0) return null;
    
    const [year, month] = startMonthYear.split('-');
    const start = new Date(Number(year), Number(month) - 1, 1);
    
    if (type === 'SIP') {
      const months = Math.floor(Number(totalYears) * 12);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      
      const flows = Array.from({ length: months }, (_, i) => ({
        amount: -Number(amount),
        date: new Date(start.getFullYear(), start.getMonth() + i, 1).toISOString().slice(0, 10),
      }));
      flows.push({ amount: Number(currentValue), date: end.toISOString().slice(0, 10) });
      
      const result = calculateXIRR(flows);
      return result.status === 'converged' ? result.xirr : null;
    }
    
    if (type === 'Lumpsum') {
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + Number(totalYears));
      const result = calculateXIRR([
        { amount: -Number(amount), date: start.toISOString().slice(0, 10) },
        { amount: Number(currentValue), date: end.toISOString().slice(0, 10) },
      ]);
      return result.status === 'converged' ? result.xirr : null;
    }
    return null;
  };

  const xirr = calculateXIRRValue();

  const validateAndBuildInvestment = (): Omit<Investment, 'id' | 'createdAt' | 'lastUpdatedAt'> => {
    if (type === 'Stocks') {
      if (!selectedStock) throw new Error('Please search and select a stock company or symbol.');
      if (Number(quantity) <= 0) throw new Error('Quantity must be greater than zero.');
      if (Number(purchasePrice) <= 0) throw new Error('Purchase price must be greater than zero.');
      
      const totalInvested = Number(quantity) * Number(purchasePrice);
      const cv = Number(currentPrice) > 0 ? Number(quantity) * Number(currentPrice) : totalInvested;
      
      return {
        name: selectedStock.name,
        type: 'Stocks',
        symbol: selectedStock.symbol,
        exchange: selectedStock.exchange,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        investedAmount: Math.round(totalInvested),
        currentValue: Math.round(cv),
        investmentDate: new Date().toISOString().slice(0, 10),
        currentPrice: Number(currentPrice) > 0 ? Number(currentPrice) : undefined,
        priceSource: quoteStatus === 'success' ? 'api' : 'manual',
        apiProvider: quoteStatus === 'success' ? apiProvider : undefined,
        apiLastUpdated: quoteStatus === 'success' ? new Date().toISOString() : undefined,
        apiStatus: quoteStatus === 'success' ? 'success' : 'unavailable',
      };
    }

    if (Number(amount) <= 0) throw new Error('Please enter a valid investment amount.');
    
    let investmentDate: string | undefined;
    let matDate: string | undefined;
    
    if (type === 'SIP' || type === 'Lumpsum') {
      if (!startMonthYear) throw new Error('Please choose a start month and year.');
      if (Number(totalYears) <= 0) throw new Error('Please enter total years for investment.');
      if (Number(currentValue) < 0) throw new Error('Current value must be non-negative.');
      
      investmentDate = `${startMonthYear}-01`;
      const end = new Date(investmentDate);
      end.setFullYear(end.getFullYear() + Number(totalYears));
      matDate = end.toISOString().slice(0, 10);
    }
    
    if (type === 'FD') {
      if (Number(totalYears) <= 0) throw new Error('Please enter total years for FD.');
      if (Number(interestRate) < 0) throw new Error('Please enter a valid interest rate.');
      
      investmentDate = new Date().toISOString().slice(0, 10);
      const end = new Date(investmentDate);
      end.setFullYear(end.getFullYear() + Number(totalYears));
      matDate = end.toISOString().slice(0, 10);
    }

    let actualInvested = Number(amount);
    let actualCurrent = Number(currentValue || amount);

    if (type === 'SIP') {
      actualInvested = Number(amount) * (Number(totalYears) * 12);
    } else if (type === 'FD') {
      const fd = calculateFD(Number(amount), Number(interestRate), Number(totalYears));
      actualCurrent = fd.maturityValue;
    }

    return {
      name: `${type} Investment`,
      type,
      investedAmount: actualInvested,
      currentValue: actualCurrent,
      priceSource: 'manual',
      investmentDate,
      maturityDate: matDate,
      interestRate: type === 'FD' ? Number(interestRate) : undefined,
    };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');
      const payload = validateAndBuildInvestment();
      await onSave(payload);
      onClose();
    } catch (error: any) {
      setError(error?.message || 'Unable to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Investment' : 'Add Investment'}
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
              const form = document.getElementById('unified-investment-form') as HTMLFormElement;
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
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </button>
        </div>
      }
    >
      <form id="unified-investment-form" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Investment Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as InvestmentType);
              setError('');
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
          >
            {INVESTMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {type === 'SIP' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SIP Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Started Month & Year <span className="text-rose-500">*</span></label>
                <input type="month" required value={startMonthYear} onChange={(e) => setStartMonthYear(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Years <span className="text-rose-500">*</span></label>
                <input type="number" step="0.5" min="0.5" required value={totalYears} onChange={(e) => setTotalYears(e.target.value)} placeholder="5" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="0" required value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="300000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            {xirr !== null && (
              <div className="p-3.5 rounded-xl border border-sky-200/80 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20">
                <div className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Calculated XIRR</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{xirr.toFixed(2)}%</div>
              </div>
            )}
          </>
        )}

        {type === 'Lumpsum' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Investment Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Started Month & Year <span className="text-rose-500">*</span></label>
                <input type="month" required value={startMonthYear} onChange={(e) => setStartMonthYear(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Years <span className="text-rose-500">*</span></label>
                <input type="number" step="0.5" min="0.5" required value={totalYears} onChange={(e) => setTotalYears(e.target.value)} placeholder="5" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="0" required value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="60000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            {xirr !== null && (
              <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Calculated XIRR</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{xirr.toFixed(2)}%</div>
              </div>
            )}
          </>
        )}

        {type === 'FD' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interest Rate (%) <span className="text-rose-500">*</span></label>
                <input type="number" step="any" min="0.1" required value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="7.5" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Years <span className="text-rose-500">*</span></label>
                <input type="number" step="0.5" min="0.5" required value={totalYears} onChange={(e) => setTotalYears(e.target.value)} placeholder="1" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
            {Number(amount) > 0 && Number(interestRate) > 0 && Number(totalYears) > 0 && (
              <div className="p-3.5 rounded-xl border border-sky-200/80 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20 text-xs">
                <div className="text-slate-500 dark:text-slate-400">Maturity Value</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrency(calculateFD(Number(amount), Number(interestRate), Number(totalYears)).maturityValue)}
                </div>
              </div>
            )}
          </>
        )}

        {type === 'Stocks' && (
          <>
            {!selectedStock ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Search Name / Symbol <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. HDFC Bank, Reliance..." className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                    {searchResults.map((item) => (
                      <button key={`${item.symbol}-${item.exchange}`} type="button" onClick={() => handleSelectStock(item)} className="w-full p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.name}</span>
                          <span className="text-[11px] text-slate-400">{item.symbol} • {item.exchange}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && <p className="text-[11px] text-slate-400 mt-1 animate-pulse">Searching matching stocks...</p>}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedStock.name}</h4>
                  <div className="text-[11px] text-slate-500">{selectedStock.symbol} • {selectedStock.exchange}</div>
                </div>
                {!initialData && (
                  <button type="button" onClick={() => setSelectedStock(null)} className="text-xs font-bold text-sky-600 dark:text-sky-400">Change</button>
                )}
              </div>
            )}

            {selectedStock && (
              <>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-[11px]">
                  {quoteStatus === 'success' ? (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-600 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Live price available</span>
                      <span className="font-bold">₹{Number(currentPrice || 0).toLocaleString()}</span>
                    </div>
                  ) : quoteStatus === 'loading' ? (
                    <span className="text-sky-600 animate-pulse">Fetching live market price...</span>
                  ) : (
                    <span className="text-amber-600">Market price unavailable. Add manually.</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Price (₹) <span className="text-rose-500">*</span></label>
                    <input type="number" step="any" min="0.01" required value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="1650.50" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qty <span className="text-rose-500">*</span></label>
                    <input type="number" step="any" min="0.001" required value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="25" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </form>
    </Modal>
  );
};
