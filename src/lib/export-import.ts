import { ExportPayload, exportAllData, importAllData } from './db';
import { Transaction, Investment, Loan } from '@/types';

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export complete JSON backup
 */
export async function downloadJSONBackup() {
  const payload = await exportAllData();
  const jsonStr = JSON.stringify(payload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `wealthtrack-backup-${dateStr}.json`, 'application/json');
}

/**
 * Export Transactions as CSV
 */
export function exportTransactionsCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description', 'Recurring'];
  const rows = transactions.map((t) => [
    `"${t.date}"`,
    `"${t.type}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    t.amount,
    `"${t.paymentMethod}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.isRecurring ? 'Yes' : 'No',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csv, `wealthtrack-transactions-${dateStr}.csv`, 'text/csv');
}

/**
 * Export Investments as CSV
 */
export function exportInvestmentsCSV(investments: Investment[]) {
  const headers = ['Name', 'Type', 'Invested Amount', 'Current Value', 'Gain/Loss', 'Return %', 'Last Updated', 'Notes'];
  const rows = investments.map((inv) => {
    const gain = inv.currentValue - inv.investedAmount;
    const ret = inv.investedAmount > 0 ? ((gain / inv.investedAmount) * 100).toFixed(2) : '0';
    return [
      `"${inv.name.replace(/"/g, '""')}"`,
      `"${inv.type}"`,
      inv.investedAmount,
      inv.currentValue,
      gain,
      `"${ret}%"`,
      `"${inv.lastUpdatedAt || ''}"`,
      `"${(inv.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csv, `wealthtrack-investments-${dateStr}.csv`, 'text/csv');
}

/**
 * Export Loans as CSV
 */
export function exportLoansCSV(loans: Loan[]) {
  const headers = ['Loan Name', 'Type', 'Original Amount', 'Outstanding Balance', 'Monthly EMI', 'EMIs Remaining', 'Interest Rate %', 'Next EMI Date'];
  const rows = loans.map((l) => [
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.type}"`,
    l.originalAmount,
    l.outstandingAmount,
    l.monthlyEmi,
    l.emisRemaining,
    l.interestRate,
    `"${l.nextEmiDate || ''}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csv, `wealthtrack-loans-${dateStr}.csv`, 'text/csv');
}

/**
 * Read and validate uploaded JSON backup file
 */
export function readUploadedJSON(file: File): Promise<ExportPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.data || typeof parsed.data !== 'object') {
          throw new Error('Invalid backup file: Missing "data" section.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Invalid JSON file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
