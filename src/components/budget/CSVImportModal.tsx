'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/common/Modal';
import { Transaction } from '@/types';
import { parseTransactionsCSV, CSVParseResult, downloadFile } from '@/lib/export-import';
import { formatCurrency } from '@/lib/formatters';
import { useFinance } from '@/lib/context/FinanceContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2,
} from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { addTransactionsBulk, settings } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const resetState = () => {
    setFileName('');
    setParseResult(null);
    setIsProcessing(false);
    setImportStatus('idle');
    setImportedCount(0);
    setErrorMessage('');
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please select a valid CSV (.csv) file.');
      return;
    }

    setFileName(file.name);
    setErrorMessage('');
    setImportStatus('idle');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseTransactionsCSV(text);
        if (result.transactions.length === 0 && result.errors.length > 0) {
          setErrorMessage(result.errors[0] || 'Unable to parse valid transactions from this file.');
          setParseResult(null);
        } else {
          setParseResult(result);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse CSV file.');
        setParseResult(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.transactions.length === 0) return;

    try {
      setIsProcessing(true);
      setErrorMessage('');
      const imported = await addTransactionsBulk(parseResult.transactions);
      setImportedCount(imported.length);
      setImportStatus('success');
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import transactions. Please try again.');
      setImportStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const sample = [
      'Date,Type,Category,Amount,Payment Method,Description',
      `${today},expense,Food,450.00,UPI,Dinner with friends`,
      `${today},expense,Transport,120.00,Metro Card,Daily commute`,
      `${today},income,Salary,85000.00,Bank Transfer,Monthly tech salary`,
      `${today},expense,Shopping,1499.00,Credit Card,Books & Stationery`,
    ].join('\n');
    downloadFile(sample, 'wealthtrack_sample_transactions.csv', 'text/csv');
  };

  const totalIncomeCount = parseResult?.transactions.filter((t) => t.type === 'income').length || 0;
  const totalExpenseCount = parseResult?.transactions.filter((t) => t.type === 'expense').length || 0;
  const totalAmount = parseResult?.transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Transactions via CSV"
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={downloadSampleCSV}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {importStatus === 'success' ? 'Done' : 'Cancel'}
            </button>

            {importStatus !== 'success' && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!parseResult || parseResult.transactions.length === 0 || isProcessing}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-500/20 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Import {parseResult?.transactions.length || 0} Transactions</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {importStatus === 'success' ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Import Successful!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Successfully imported <strong className="text-emerald-600 dark:text-emerald-400">{importedCount} transactions</strong> into your budget records.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetState}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Import another CSV file
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40'
                  : 'border-slate-300 dark:border-slate-700 hover:border-sky-500/60 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {fileName ? fileName : 'Click to browse or drag & drop bank or expense CSV'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Supports columns for Date, Type (Income/Expense), Category, Amount, and Description.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Parse Summary */}
            {parseResult && parseResult.transactions.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Total Rows</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {parseResult.transactions.length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                    <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Income</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      {totalIncomeCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-center border border-rose-200/50 dark:border-rose-800/50">
                    <span className="block text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Expenses</span>
                    <span className="text-sm font-black text-rose-700 dark:text-rose-300">
                      {totalExpenseCount}
                    </span>
                  </div>
                </div>

                {parseResult.errors.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {parseResult.errors.length} row(s) had invalid amounts and were skipped.
                    </span>
                  </div>
                )}

                {/* Preview Table */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Preview (First {Math.min(parseResult.transactions.length, 5)} transactions)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Net Flow: {formatCurrency(totalAmount, { symbol: settings.currencySymbol })}
                    </span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Description</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {parseResult.transactions.slice(0, 5).map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-2 text-slate-500 whitespace-nowrap">{tx.date}</td>
                            <td className="p-2 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[10px] ${
                                  tx.type === 'income'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                }`}
                              >
                                {tx.type === 'income' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">{tx.category}</td>
                            <td className="p-2 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{tx.description}</td>
                            <td className={`p-2 text-right font-bold whitespace-nowrap ${
                              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}
                              {formatCurrency(tx.amount, { symbol: settings.currencySymbol })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
