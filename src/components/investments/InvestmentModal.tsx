'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Investment, InvestmentType } from '@/types';
import { MANUAL_INVESTMENT_TYPES } from '@/lib/data/categories';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { calculateFD, calculateSIP, calculateLumpsum, calculateXIRR } from '@/lib/calculations';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Fund');
  const [mutualMode, setMutualMode] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [amount, setAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [provider, setProvider] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [startDate, setStartDate] = useState('');
  const [investmentYears, setInvestmentYears] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setType(initialData.type === 'Stocks' ? 'Mutual Fund' : initialData.type);
      setMutualMode(initialData.notes?.toLowerCase().includes('lumpsum') ? 'Lumpsum' : 'SIP');
      setAmount(initialData.investedAmount.toString());
      setCurrentValue(initialData.currentValue.toString());
      setProvider(initialData.notes || '');
      setFrequency('Monthly');
      setStartDate(initialData.investmentDate || '');
      setInvestmentYears(initialData.maturityDate ? String(Math.max(1, Math.round((new Date(initialData.maturityDate).getTime() - new Date(initialData.investmentDate ?? initialData.lastUpdatedAt).getTime()) / (1000 * 60 * 60 * 24 * 365)))) : '');
      setMaturityDate(initialData.maturityDate || '');
      setInterestRate(initialData.interestRate?.toString() || '');
      setQuantity(initialData.quantity?.toString() || '');
      setPurchaseDate(initialData.investmentDate || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setType('Mutual Fund');
      setMutualMode('SIP');
      setAmount('');
      setCurrentValue('');
      setProvider('');
      setFrequency('Monthly');
      setStartDate('');
      setInvestmentYears('');
      setMaturityDate('');
      setInterestRate('');
      setQuantity('');
      setPurchaseDate('');
      setNotes('');
    }
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const numAmount = parseFloat(amount) || 0;
  const numCurrent = parseFloat(currentValue) || 0;
  const gain = numCurrent - numAmount;
  const returnPercent = numAmount > 0 ? (gain / numAmount) * 100 : 0;
  const isPositive = gain >= 0;

  const xirrPreview = (() => {
    if (!startDate || !investmentYears) return null;

    if (type === 'Mutual Fund' && mutualMode === 'SIP' && Number(amount) > 0) {
      const months = Math.max(1, Number(investmentYears) * 12);
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      const flows = Array.from({ length: months }, (_, index) => ({
        amount: -Number(amount),
        date: new Date(start.getFullYear(), start.getMonth() + index, 1).toISOString().slice(0, 10),
      }));
      if (Number(currentValue) > 0) {
        flows.push({ amount: Number(currentValue), date: end.toISOString().slice(0, 10) });
      }
      const result = calculateXIRR(flows);
      return {
        label: 'SIP XIRR',
        value: `${result.xirr.toFixed(2)}%`,
        description: result.status === 'converged' ? 'Annualized return based on actual cash flows' : 'Need a valid cash-flow setup',
      };
    }

    if (type === 'Mutual Fund' && mutualMode === 'Lumpsum' && Number(amount) > 0) {
      const durationMonths = Math.max(1, Number(investmentYears) * 12);
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + durationMonths);
      const result = calculateXIRR([
        { amount: -Number(amount), date: start.toISOString().slice(0, 10) },
        ...(Number(currentValue) > 0 ? [{ amount: Number(currentValue), date: end.toISOString().slice(0, 10) }] : []),
      ]);
      return {
        label: 'Lumpsum XIRR',
        value: `${result.xirr.toFixed(2)}%`,
        description: result.status === 'converged' ? 'Annualized return from the actual start and current value' : 'Need start and current values to estimate XIRR',
      };
    }

    if ((type === 'Fixed Deposit' || type === 'Recurring Deposit') && Number(amount) > 0 && Number(interestRate) >= 0 && Number(investmentYears) > 0) {
      const fd = calculateFD(Number(amount), Number(interestRate || 0), Number(investmentYears));
      return {
        label: 'FD maturity',
        value: `₹${formatCurrency(fd.maturityValue)}`,
        description: `${formatCurrency(fd.totalInterest)} interest over ${investmentYears} years`,
      };
    }

    return null;
  })();

  const validateAndBuildInvestment = () => {
    if (!name.trim()) {
      throw new Error('Please provide an investment name.');
    }

    if (type === 'Mutual Fund') {
      if (mutualMode === 'SIP') {
        if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid SIP amount.');
        if (!startDate) throw new Error('Please choose a start date.');
      } else {
        if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid invested amount.');
        if (!startDate) throw new Error('Please choose the investment date.');
      }
    }

    if (type === 'Fixed Deposit' || type === 'Recurring Deposit') {
      if (!provider.trim()) throw new Error('Please enter the bank or provider name.');
      if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid amount.');
      if (!startDate) throw new Error('Please choose the start date.');
      if (!maturityDate) throw new Error('Please choose the maturity date.');
    }

    if (type === 'PPF' || type === 'EPF' || type === 'NPS') {
      if (!provider.trim()) throw new Error('Please enter the provider or account name.');
      if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid amount.');
    }

    if (type === 'Gold') {
      if (!name.trim()) throw new Error('Please provide a gold name or description.');
      if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid purchase amount.');
    }

    if (type === 'Bonds') {
      if (!name.trim()) throw new Error('Please provide the bond name.');
      if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid invested amount.');
      if (!purchaseDate) throw new Error('Please pick the purchase date.');
    }

    if (type === 'Other') {
      if (!name.trim()) throw new Error('Please provide an investment name.');
      if (!amount || Number(amount) <= 0) throw new Error('Please enter a valid invested amount.');
    }

    if (numCurrent < 0) {
      throw new Error('Current value must be zero or greater.');
    }

    const payload: Omit<Investment, 'id' | 'createdAt' | 'lastUpdatedAt'> = {
      name: name.trim(),
      type,
      investedAmount: Number(amount || 0),
      currentValue: Number(currentValue || amount || 0),
      priceSource: 'manual',
      investmentDate: startDate || purchaseDate || undefined,
      maturityDate: maturityDate || undefined,
      interestRate: interestRate ? Number(interestRate) : undefined,
      notes: notes || (type === 'Mutual Fund' ? `Mode: ${mutualMode}; Frequency: ${frequency}` : provider || undefined),
      quantity: quantity ? Number(quantity) : undefined,
    };

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');
      const payload = validateAndBuildInvestment();
      await onSave(payload);
      onClose();
    } catch (error: any) {
      console.error('Failed to save investment record', error);
      setError(error?.message || 'Unable to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMutualFundFields = () => (
    <>
      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMutualMode('SIP')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mutualMode === 'SIP' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          SIP
        </button>
        <button
          type="button"
          onClick={() => setMutualMode('Lumpsum')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mutualMode === 'Lumpsum' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Lumpsum
        </button>
      </div>

      {mutualMode === 'SIP' ? (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fund Name <span className="text-rose-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Axis Bluechip" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SIP Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date <span className="text-rose-500">*</span></label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Years</label>
              <input type="number" step="0.1" min="1" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} placeholder="5" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹)</label>
            <input type="number" step="any" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fund Name <span className="text-rose-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Midcap" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invested Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Years</label>
              <input type="number" step="0.1" min="1" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} placeholder="5" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Investment Date <span className="text-rose-500">*</span></label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹)</label>
              <input type="number" step="any" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderGenericFields = () => {
    const commonLabel = type === 'Gold' ? 'Gold Name / Description' : type === 'Bonds' ? 'Bond Name' : type === 'PPF' || type === 'EPF' || type === 'NPS' ? 'Provider / Account Name' : 'Investment Name';

    return (
      <>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{commonLabel} <span className="text-rose-500">*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'Gold' ? 'e.g. 22k Gold Holdings' : type === 'Bonds' ? 'e.g. RBI Bond' : 'e.g. PPF Account'} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
        </div>

        {type === 'Fixed Deposit' || type === 'Recurring Deposit' ? (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{type === 'Fixed Deposit' ? 'Bank / Provider Name' : 'Bank / Provider Name'} <span className="text-rose-500">*</span></label>
              <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. SBI" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{type === 'Fixed Deposit' ? 'Principal Amount' : 'Monthly Deposit'} (₹) <span className="text-rose-500">*</span></label>
                <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={type === 'Fixed Deposit' ? '50000' : '5000'} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interest Rate (%)</label>
                <input type="number" step="any" min="0" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="7.25" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Years</label>
              <input type="number" step="0.1" min="1" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} placeholder="5" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date <span className="text-rose-500">*</span></label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Maturity Date <span className="text-rose-500">*</span></label>
                <input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
          </>
        ) : null}

        {type === 'PPF' || type === 'EPF' || type === 'NPS' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{type === 'PPF' ? 'Amount Invested' : 'Current Value'} (₹) <span className="text-rose-500">*</span></label>
                <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹)</label>
                <input type="number" step="any" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
          </>
        ) : null}

        {type === 'Gold' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity (optional)</label>
                <input type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Amount (₹) <span className="text-rose-500">*</span></label>
                <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
          </>
        ) : null}

        {type === 'Bonds' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invested Amount (₹) <span className="text-rose-500">*</span></label>
                <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Date <span className="text-rose-500">*</span></label>
                <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Maturity Date (optional)</label>
              <input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
          </>
        ) : null}

        {type === 'Other' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invested Amount (₹) <span className="text-rose-500">*</span></label>
              <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹)</label>
              <input type="number" step="any" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
            </div>
          </div>
        ) : null}

        {type !== 'Mutual Fund' && type !== 'Fixed Deposit' && type !== 'Recurring Deposit' && type !== 'PPF' && type !== 'EPF' && type !== 'NPS' && type !== 'Gold' && type !== 'Bonds' && type !== 'Other' ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Value (₹) <span className="text-rose-500">*</span></label>
            <input type="number" step="any" min="0" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
          </div>
        ) : null}

        {(type === 'Mutual Fund' || type === 'PPF' || type === 'EPF' || type === 'NPS' || type === 'Other') && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Additional notes <span className="font-normal text-slate-400">optional</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional details" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm" />
          </div>
        )}
      </>
    );
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
            type="submit"
            form="investment-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </button>
        </div>
      }
    >
      <form id="investment-form" onSubmit={handleSubmit} className="space-y-4">
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
              const nextType = e.target.value as InvestmentType;
              setType(nextType);
              if (nextType !== 'Mutual Fund') {
                setMutualMode('SIP');
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          >
            {MANUAL_INVESTMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {type === 'Mutual Fund' ? renderMutualFundFields() : renderGenericFields()}

        {xirrPreview && (
          <div className="p-3.5 rounded-xl border border-sky-200/80 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-sky-600 dark:text-sky-400">{xirrPreview.label}</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{xirrPreview.value}</div>
              </div>
              <div className="text-right text-[11px] text-slate-600 dark:text-slate-300">
                {xirrPreview.description}
              </div>
            </div>
          </div>
        )}

        {Number(amount || 0) > 0 && Number(currentValue || 0) >= 0 && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isPositive
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
              : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
          }`}>
            <div className="flex items-center gap-1.5">
              {isPositive ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Investment Value</span>
                <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(gain)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Return</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatPercent(returnPercent, 2, true)}
              </span>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
