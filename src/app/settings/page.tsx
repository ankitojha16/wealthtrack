'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  downloadJSONBackup,
  exportTransactionsCSV,
  exportInvestmentsCSV,
  exportLoansCSV,
  readUploadedJSON,
} from '@/lib/export-import';
import { importAllData, clearAllData } from '@/lib/db';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  Moon,
  Sun,
  Coins,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    transactions,
    investments,
    loans,
    refreshData,
  } = useFinance();

  const [importStatus, setImportStatus] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError('');
      setImportStatus('Validating backup payload...');
      const payload = await readUploadedJSON(file);
      await importAllData(payload);
      await refreshData();
      setImportStatus('Data successfully restored from backup!');
    } catch (err: any) {
      setImportError(err.message || 'Failed to import backup file.');
      setImportStatus('');
    }
  };

  const handleConfirmClear = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE exactly to confirm.');
      return;
    }

    await clearAllData();
    await refreshData();
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    alert('All local data has been permanently cleared.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Data Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure preferences, export backups, restore data, and control your device-local storage.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-sky-500" />
          General Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Currency & Symbol
            </label>
            <select
              value={settings.currency}
              onChange={(e) => {
                const cur = e.target.value;
                const symbols: Record<string, string> = {
                  INR: '₹',
                  USD: '$',
                  EUR: '€',
                  GBP: '£',
                };
                updateSettings({ currency: cur, currencySymbol: symbols[cur] || '₹' });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="INR">Indian Rupee (INR - ₹)</option>
              <option value="USD">US Dollar (USD - $)</option>
              <option value="EUR">Euro (EUR - €)</option>
              <option value="GBP">British Pound (GBP - £)</option>
            </select>
            <span className="text-[10px] text-slate-400 block mt-1">
              Current symbol: <strong className="text-sky-600">{settings.currencySymbol}</strong>
            </span>
          </div>

          {/* Number Format */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Numbering System
            </label>
            <select
              value={settings.numberFormat}
              onChange={(e) => updateSettings({ numberFormat: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="indian">Indian System (e.g. ₹1,00,000 / Lakhs / Crores)</option>
              <option value="international">International System (e.g. $100,000 / Millions / Billions)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Visual Theme
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === 'light'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'system' })}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === 'system'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {(['sky', 'violet', 'emerald', 'rose'] as const).map((accent) => (
                <button
                  key={accent}
                  type="button"
                  onClick={() => updateSettings({ accentColor: accent })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    settings.accentColor === accent
                      ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 rounded-full ${
                    accent === 'sky' ? 'bg-sky-500' :
                    accent === 'violet' ? 'bg-violet-500' :
                    accent === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  {accent.charAt(0).toUpperCase() + accent.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Data Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-500" />
            Export My Data
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download your financial records anytime. No vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            type="button"
            onClick={downloadJSONBackup}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-left transition-all group"
          >
            <Download className="w-4 h-4 text-sky-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Full JSON Backup</span>
            <span className="text-[10px] text-slate-400">Complete database snapshot</span>
          </button>

          <button
            type="button"
            onClick={() => exportTransactionsCSV(transactions)}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-left transition-all group"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Transactions CSV</span>
            <span className="text-[10px] text-slate-400">Ledger spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={() => exportInvestmentsCSV(investments)}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-left transition-all group"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Investments CSV</span>
            <span className="text-[10px] text-slate-400">Holdings & returns</span>
          </button>

          <button
            type="button"
            onClick={() => exportLoansCSV(loans)}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-left transition-all group"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Loans CSV</span>
            <span className="text-[10px] text-slate-400">EMIs and debt schedule</span>
          </button>
        </div>
      </div>

      {/* Import Data Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-500" />
            Import & Restore Data
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Restore your previously exported WealthTrack JSON backup file.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{importError}</span>
          </div>
        )}

        <label className="block p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-400 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Click to select JSON backup file</span>
          <span className="text-[11px] text-slate-400">File format: wealthtrack-backup-*.json</span>
          <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="p-6 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone: Clear All Local Data
          </h2>
          <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
            Permanently wipe all transactions, investments, goals, loans, and settings stored in your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-rose-600/30 transition-all"
        >
          Clear All Data
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold">Are you absolutely sure?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action cannot be undone. All your locally recorded incomes, expenses, budgets, investments, and loan
              records will be deleted immediately.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type <strong className="text-rose-600 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                autoFocus
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-950 text-rose-600 focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-40"
              >
                Permanently Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
