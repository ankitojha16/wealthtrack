import type { Transaction } from '../types/index.ts';

/**
 * Parse CSV line handling quotes and escaped quotes
 */
export function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

/**
 * Standardize date strings to YYYY-MM-DD
 */
export function standardizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  const cleaned = raw.trim().replace(/^"|"$/g, '');

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // MM/DD/YYYY
  const mdyMatch = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

export interface CSVParseResult {
  transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
  errors: string[];
  totalRows: number;
}

/**
 * Robust CSV Transaction Parser
 */
export function parseTransactionsCSV(csvText: string): CSVParseResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return {
      transactions: [],
      errors: ['The CSV file is empty or does not contain data rows.'],
      totalRows: 0,
    };
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect column indices
  const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('time'));
  const typeIdx = headers.findIndex((h) => h.includes('type') || h === 'crdr' || h === 'drcr');
  const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('tag'));
  let amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('spent') || h.includes('total') || h.includes('sum') || h.includes('cost') || h.includes('inr'));
  const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('narration') || h.includes('note') || h.includes('remark') || h.includes('title') || h.includes('detail'));
  const paymentIdx = headers.findIndex((h) => h.includes('payment') || h.includes('mode') || h.includes('account') || h.includes('method'));

  // Smart defaults if headers couldn't be matched exactly
  if (amountIdx === -1 && rawHeaders.length >= 2) {
    // Look for first column that has numeric values in data rows
    for (let col = 0; col < rawHeaders.length; col++) {
      const sample = parseCSVLine(lines[1])[col]?.replace(/[^0-9.]/g, '');
      if (sample && !isNaN(Number(sample))) {
        amountIdx = col;
        break;
      }
    }
  }

  if (amountIdx === -1) {
    return {
      transactions: [],
      errors: ['Could not find an "Amount" column in the CSV.'],
      totalRows: lines.length - 1,
    };
  }

  const transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCSVLine(lines[i]);
    if (rawCols.length === 0 || rawCols.every((c) => !c)) continue;

    const rawAmountStr = rawCols[amountIdx] || '0';
    // Remove currency symbols, commas, quotes
    const cleanedAmount = rawAmountStr.replace(/[^0-9.-]/g, '');
    let amount = parseFloat(cleanedAmount);

    if (isNaN(amount) || amount === 0) {
      errors.push(`Row ${i + 1}: Invalid or zero amount "${rawCols[amountIdx]}".`);
      continue;
    }

    // Determine type
    let type: 'income' | 'expense' = 'expense';
    if (typeIdx !== -1 && rawCols[typeIdx]) {
      const rawType = rawCols[typeIdx].toLowerCase();
      if (rawType.includes('inc') || rawType === 'cr' || rawType === 'credit') {
        type = 'income';
      } else {
        type = 'expense';
      }
    } else if (amount < 0) {
      type = 'expense';
      amount = Math.abs(amount);
    }

    // If amount was parsed as negative, make positive
    amount = Math.abs(amount);

    const date = dateIdx !== -1 && rawCols[dateIdx] ? standardizeDate(rawCols[dateIdx]) : new Date().toISOString().split('T')[0];
    const category = categoryIdx !== -1 && rawCols[categoryIdx] ? rawCols[categoryIdx].replace(/^"|"$/g, '').trim() : (type === 'income' ? 'Salary' : 'Other');
    const description = descIdx !== -1 && rawCols[descIdx] ? rawCols[descIdx].replace(/^"|"$/g, '').trim() : `${type === 'income' ? 'Income' : 'Expense'} - ${category}`;
    const paymentMethod = paymentIdx !== -1 && rawCols[paymentIdx] ? rawCols[paymentIdx].replace(/^"|"$/g, '').trim() : 'Bank Transfer';

    transactions.push({
      type,
      amount,
      category,
      description,
      date,
      paymentMethod,
      isRecurring: false,
    });
  }

  return {
    transactions,
    errors,
    totalRows: lines.length - 1,
  };
}
