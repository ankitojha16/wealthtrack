'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Wallet,
  PieChart,
  TrendingUp,
  Target,
  CreditCard,
  FileBarChart2,
  Calculator,
  BookOpen,
  Settings,
  PlusCircle,
  Moon,
  Sun,
  Sparkles,
  Flame,
  ArrowRight,
  X,
  Coins,
  Download,
  FileSpreadsheet,
  Keyboard,
  Repeat,
} from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { downloadJSONBackup, exportTransactionsCSV, exportGoalsCSV } from '@/lib/export-import';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd?: () => void;
  onOpenShortcuts?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenQuickAdd,
  onOpenShortcuts,
}) => {
  const router = useRouter();
  const { settings, updateSettings, loadSampleData, transactions, goals } = useFinance();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Navigation
    { id: 'nav-dash', category: 'Navigation', title: 'Dashboard & Balance Sheet', subtitle: 'View net worth, assets & recent transactions', icon: Wallet, action: () => router.push('/') },
    { id: 'nav-budget', category: 'Navigation', title: 'Budget Planner & Categories', subtitle: 'Manage monthly budget caps and spending', icon: PieChart, action: () => router.push('/budget') },
    { id: 'nav-inv', category: 'Navigation', title: 'Investments & Portfolio', subtitle: 'Mutual funds, equities, PPF and gold', icon: TrendingUp, action: () => router.push('/investments') },
    { id: 'nav-goals', category: 'Navigation', title: 'Financial Goals Tracker', subtitle: 'Target emergency fund, vacations and home purchase', icon: Target, action: () => router.push('/goals') },
    { id: 'nav-loans', category: 'Navigation', title: 'Loans & EMI Amortization', subtitle: 'Track loan repayments, EMIs and prepayments', icon: CreditCard, action: () => router.push('/loans') },
    { id: 'nav-reports', category: 'Navigation', title: 'Reports & Analytics', subtitle: 'Printable financial report and historical trends', icon: FileBarChart2, action: () => router.push('/reports') },
    { id: 'nav-calc', category: 'Navigation', title: 'All 20 Financial Calculators', subtitle: 'Browse EMI, SIP, CAGR, SWP, and tax calculators', icon: Calculator, action: () => router.push('/calculators') },
    { id: 'nav-fire', category: 'Navigation', title: 'FIRE Simulator (Retire Early)', subtitle: 'Simulate financial independence and safe withdrawal rate', icon: Flame, action: () => router.push('/tools/fire-simulator') },
    { id: 'nav-learn', category: 'Navigation', title: 'Financial Knowledge Hub', subtitle: 'Articles on SIP, CAGR, XIRR, and 50/30/20 rule', icon: BookOpen, action: () => router.push('/learn') },
    { id: 'nav-settings', category: 'Navigation', title: 'Settings & Data Backup', subtitle: 'Manage account, currencies, and JSON backup', icon: Settings, action: () => router.push('/settings') },

    // Calculators
    { id: 'calc-sip', category: 'Calculators', title: 'SIP Calculator', subtitle: 'Compute future wealth from monthly mutual fund SIPs', icon: Calculator, action: () => router.push('/calculators/sip') },
    { id: 'calc-emi', category: 'Calculators', title: 'Loan EMI Calculator', subtitle: 'Calculate monthly installment and amortization table', icon: Calculator, action: () => router.push('/calculators/emi') },
    { id: 'calc-loan', category: 'Calculators', title: 'Dedicated Loan & Prepayment Calculator', subtitle: 'Presets for Home/Auto/Personal loans with prepayment savings', icon: CreditCard, action: () => router.push('/calculators/loan') },
    { id: 'calc-ppf', category: 'Calculators', title: 'PPF Calculator', subtitle: '15-year public provident fund compounding projection', icon: Calculator, action: () => router.push('/calculators/ppf') },
    { id: 'calc-cagr', category: 'Calculators', title: 'CAGR Calculator', subtitle: 'Compound Annual Growth Rate for investments', icon: Calculator, action: () => router.push('/calculators/cagr') },
    { id: 'calc-swp', category: 'Calculators', title: 'SWP Calculator', subtitle: 'Systematic Withdrawal Plan for monthly cashflow', icon: Calculator, action: () => router.push('/calculators/swp') },

    // Navigation Additions
    { id: 'nav-subs', category: 'Navigation', title: 'Subscriptions & Recurring Burn', subtitle: 'Auto-detect and manage recurring services (Netflix, Rent, SIP)', icon: Repeat, action: () => router.push('/budget') },

    // Actions
    {
      id: 'act-add',
      category: 'Actions',
      title: 'Quick Add Transaction / Asset',
      subtitle: 'Log income, expense, investment or loan',
      icon: PlusCircle,
      action: () => {
        onClose();
        if (onOpenQuickAdd) onOpenQuickAdd();
      },
    },
    {
      id: 'act-shortcuts',
      category: 'Actions',
      title: 'Keyboard Shortcuts Guide (?)',
      subtitle: 'Browse all keyboard shortcuts and navigation hotkeys',
      icon: Keyboard,
      action: () => {
        onClose();
        if (onOpenShortcuts) onOpenShortcuts();
      },
    },
    {
      id: 'act-export-json',
      category: 'Actions',
      title: 'Download JSON Backup',
      subtitle: 'Export complete snapshot of all financial records',
      icon: Download,
      action: () => {
        onClose();
        downloadJSONBackup();
      },
    },
    {
      id: 'act-export-tx',
      category: 'Actions',
      title: 'Export Transactions (CSV)',
      subtitle: 'Download all recorded transactions as spreadsheet',
      icon: FileSpreadsheet,
      action: () => {
        onClose();
        exportTransactionsCSV(transactions);
      },
    },
    {
      id: 'act-export-goals',
      category: 'Actions',
      title: 'Export Financial Goals (CSV)',
      subtitle: 'Download target goals and current progress as spreadsheet',
      icon: Target,
      action: () => {
        onClose();
        exportGoalsCSV(goals);
      },
    },
    {
      id: 'act-theme',
      category: 'Actions',
      title: settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle theme preference',
      icon: settings.theme === 'dark' ? Sun : Moon,
      action: () => {
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
      },
    },
    {
      id: 'act-sample',
      category: 'Actions',
      title: 'Load Sample Portfolio',
      subtitle: 'Pre-populate realistic demo assets, goals, and snapshots',
      icon: Sparkles,
      action: async () => {
        onClose();
        await loadSampleData();
      },
    },
    {
      id: 'act-currency-inr',
      category: 'Actions',
      title: 'Switch Currency to INR (₹)',
      subtitle: 'Indian Rupees with Lakhs/Crores numbering format',
      icon: Coins,
      action: () => {
        updateSettings({ currency: 'INR', currencySymbol: '₹', numberFormat: 'indian' });
      },
    },
    {
      id: 'act-currency-usd',
      category: 'Actions',
      title: 'Switch Currency to USD ($)',
      subtitle: 'US Dollars with Millions numbering format',
      icon: Coins,
      action: () => {
        updateSettings({ currency: 'USD', currencySymbol: '$', numberFormat: 'international' });
      },
    },
    {
      id: 'act-currency-eur',
      category: 'Actions',
      title: 'Switch Currency to EUR (€)',
      subtitle: 'Euros with International numbering format',
      icon: Coins,
      action: () => {
        updateSettings({ currency: 'EUR', currencySymbol: '€', numberFormat: 'international' });
      },
    },
    {
      id: 'act-currency-gbp',
      category: 'Actions',
      title: 'Switch Currency to GBP (£)',
      subtitle: 'British Pounds Sterling with International numbering format',
      icon: Coins,
      action: () => {
        updateSettings({ currency: 'GBP', currencySymbol: '£', numberFormat: 'international' });
      },
    },
  ];

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, calculators, tools, or quick actions..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100 ring-1 ring-sky-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{item.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-black tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-sky-600 dark:text-sky-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-bold text-sky-600 dark:text-sky-400">WealthTrack Quick Search</span>
        </div>
      </div>
    </div>
  );
};
