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
        </div>
      </div>


    </div>
  );
}
