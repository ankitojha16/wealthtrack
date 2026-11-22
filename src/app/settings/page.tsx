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
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { ACCENT_COLOR_OPTIONS } from '@/lib/data/categories';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    transactions,
    investments,
    loans,
    refreshData,
    user,
    signOutUser,
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
          Configure preferences, export backups, restore data, and manage your account.
        </p>
      </div>

      {/* Account Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-500" />
          Account & Authentication
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Signed-in Account</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {user?.email || 'Guest / Local Session'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              {user ? 'Data isolated and secured with Supabase Row Level Security' : 'Data stored locally in browser'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => signOutUser()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-600/30 transition-all"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-sky-500" />
          General Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ACCENT_COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateSettings({ accentColor: option.value })}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2 text-[11px] font-bold transition-all ${
                    settings.accentColor === option.value
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${option.swatch}`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Currency & Number Format */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Primary Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'INR', symbol: '₹', label: 'INR (₹)' },
                { code: 'USD', symbol: '$', label: 'USD ($)' },
                { code: 'EUR', symbol: '€', label: 'EUR (€)' },
                { code: 'GBP', symbol: '£', label: 'GBP (£)' },
                { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ)' },
                { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
                { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
                { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
                { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
              ].map((curr) => {
                const isSelected = (settings.currencySymbol === curr.symbol) || (settings.currency === curr.code);
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => updateSettings({ currency: curr.code, currencySymbol: curr.symbol })}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>{curr.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Number & Scale System
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => updateSettings({ numberFormat: 'indian' })}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                  settings.numberFormat === 'indian'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Indian System (Lakhs & Crores)</span>
                  {settings.numberFormat === 'indian' && <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-md font-bold">Active</span>}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  e.g., {settings.currencySymbol || '₹'}10,00,000 (10 Lakhs) • {settings.currencySymbol || '₹'}1,50,000
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ numberFormat: 'international' })}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                  settings.numberFormat === 'international'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>International System (Millions & Billions)</span>
                  {settings.numberFormat === 'international' && <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded-md font-bold">Active</span>}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  e.g., {settings.currencySymbol || '$'}1,000,000 (1 Million) • {settings.currencySymbol || '$'}150,000
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          Data Export & Backup
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Save your financial data as a JSON snapshot or download separate CSV spreadsheets for accounting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            type="button"
            onClick={() => downloadJSONBackup()}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <Download className="w-4 h-4 text-sky-500" />
            <span>JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => exportTransactionsCSV(transactions)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Transactions CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportInvestmentsCSV(investments)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
            <span>Investments CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportLoansCSV(loans)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span>Loans CSV</span>
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Upload className="w-4 h-4 text-purple-500" />
          Restore From Backup
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Restore previous data by selecting a valid WealthTrack JSON backup file.
        </p>

        {importStatus && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>{importError}</span>
          </div>
        )}

        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-all">
          <Upload className="w-4 h-4" />
          <span>Upload Backup JSON</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Permanently remove all records stored in your browser&apos;s local cache.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-all"
        >
          Clear Local Data
        </button>
      </div>

      {/* Confirm Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
              Clear All Local Data?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action cannot be undone. To confirm, please type <strong className="text-slate-900 dark:text-white">DELETE</strong> below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 transition-all"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
