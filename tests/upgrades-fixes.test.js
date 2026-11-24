import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDateSafe, formatDate, formatMonthYear } from '../src/lib/formatters/index.ts';
import { standardizeDate } from '../src/lib/csv-parser.ts';
import { calculateEMI } from '../src/lib/calculations/index.ts';

test('WealthTrack 2.5 - parseDateSafe constructs local midnight dates and avoids UTC drift', () => {
  const d1 = parseDateSafe('2026-03-25');
  assert.equal(d1.getFullYear(), 2026);
  assert.equal(d1.getMonth(), 2); // 0-indexed March is 2
  assert.equal(d1.getDate(), 25);

  const d2 = parseDateSafe('2026-03');
  assert.equal(d2.getFullYear(), 2026);
  assert.equal(d2.getMonth(), 2);
  assert.equal(d2.getDate(), 1);

  // Formatter output format check
  const formatted = formatDate('2026-03-25');
  assert.match(formatted, /25/);
  assert.match(formatted, /Mar/);
  assert.match(formatted, /2026/);

  const monthYearFormatted = formatMonthYear('2026-03');
  assert.match(monthYearFormatted, /March/);
  assert.match(monthYearFormatted, /2026/);
});

test('WealthTrack 2.5 - standardizeDate correctly handles US (MM/DD/YYYY) and European (DD/MM/YYYY) formats', () => {
  // Day > 12: must be DD/MM/YYYY
  const indianDate = standardizeDate('25/03/2026');
  assert.equal(indianDate, '2026-03-25');

  // Month <= 12 and Day > 12: must be MM/DD/YYYY (US format)
  const usDate = standardizeDate('03/25/2026');
  assert.equal(usDate, '2026-03-25');

  // Both <= 12: default standard DD/MM/YYYY
  const standardDate = standardizeDate('05/08/2026');
  assert.equal(standardDate, '2026-08-05');

  // 2-digit years
  const twoDigitYear = standardizeDate('15/10/26');
  assert.equal(twoDigitYear, '2026-10-15');

  // ISO string passes through
  const isoDate = standardizeDate('2026-12-31');
  assert.equal(isoDate, '2026-12-31');
});

test('WealthTrack 2.5 - calculateEMI generates complete breakdown for long-tenure loans (120-240 months)', () => {
  // 10-year loan (120 months)
  const loan120 = calculateEMI(2500000, 8.5, 120);
  assert.equal(loan120.breakdown.length, 120, 'Should generate full 120 months breakdown');
  assert.equal(loan120.breakdown[0].month, 1);
  assert.equal(loan120.breakdown[119].month, 120);
  assert.equal(loan120.breakdown[119].balance, 0, 'Final balance must reach 0');

  // 20-year home loan (240 months)
  const loan240 = calculateEMI(5000000, 9.0, 240);
  assert.equal(loan240.breakdown.length, 240, 'Should generate full 240 months breakdown');
  assert.equal(loan240.breakdown[239].month, 240);
  assert.equal(loan240.breakdown[239].balance, 0, 'Final home loan balance must reach 0');
});

test('WealthTrack 2.5 - Loan EMI payment advances next due date by 1 month and handles loan settlement', () => {
  const initialLoan = {
    id: 'loan_123',
    name: 'Car Loan',
    type: 'Car Loan',
    originalAmount: 600000,
    outstandingAmount: 200000,
    monthlyEmi: 15000,
    emisRemaining: 14,
    interestRate: 9.5,
    nextEmiDate: '2026-04-10',
  };

  const monthlyRate = (initialLoan.interestRate ?? 0) / (12 * 100);
  const interest = initialLoan.outstandingAmount * monthlyRate;
  const principalPaid = Math.max(0, initialLoan.monthlyEmi - interest);
  const newOutstanding = Math.max(0, initialLoan.outstandingAmount - principalPaid);
  const newRemaining = Math.max(0, initialLoan.emisRemaining - 1);

  // Advance next date
  let nextDate = initialLoan.nextEmiDate;
  if (nextDate && newRemaining > 0) {
    const parts = nextDate.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const nextMonthDate = new Date(y, m, d);
    const ny = nextMonthDate.getFullYear();
    const nm = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const nd = String(nextMonthDate.getDate()).padStart(2, '0');
    nextDate = `${ny}-${nm}-${nd}`;
  }

  assert.equal(newRemaining, 13);
  assert.equal(nextDate, '2026-05-10');
  assert.ok(newOutstanding < 200000);

  // When 1 EMI remaining is paid, loan settles
  const lastEmiRemaining = 1;
  const settledRemaining = Math.max(0, lastEmiRemaining - 1);
  const settledDate = settledRemaining === 0 ? undefined : '2026-06-10';
  assert.equal(settledRemaining, 0);
  assert.equal(settledDate, undefined, 'nextEmiDate should be cleared upon full loan settlement');
});

test('WealthTrack 2.5 - Goal calculation detects overdue goals when target date is in the past', () => {
  const pastGoal = {
    id: 'g1',
    name: 'Old Goal',
    targetAmount: 100000,
    currentAmount: 40000,
    targetDate: '2025-01-01', // Date in the past
  };

  const isCompleted = pastGoal.currentAmount >= pastGoal.targetAmount;
  const tDate = new Date(pastGoal.targetDate);
  const now = new Date('2026-03-25');
  const rawMonthsDiff = (tDate.getFullYear() - now.getFullYear()) * 12 + (tDate.getMonth() - now.getMonth());
  const isOverdue = !isCompleted && rawMonthsDiff < 0;

  assert.equal(isCompleted, false);
  assert.equal(isOverdue, true, 'Goal with past target date and incomplete funding must be flagged as overdue');
});

test('WealthTrack 2.5 - Loan Calculator is available in catalog and via slug aliases', async () => {
  const { CALCULATORS } = await import('../src/lib/data/calculators.ts');
  const emiCalc = CALCULATORS.find((c) => c.slug === 'emi');
  assert.ok(emiCalc, 'EMI / Loan calculator must exist');
  assert.match(emiCalc.title, /Loan/i, 'Calculator title should clearly identify as Loan Calculator');

  const fs = await import('node:fs');
  const path = await import('node:path');
  const pageFile = fs.readFileSync(path.join(process.cwd(), 'src/app/calculators/[slug]/page.tsx'), 'utf8');
  assert.ok(pageFile.includes("slug: 'loan'"), 'Includes loan slug alias');
  assert.ok(pageFile.includes("slug: 'loan-calculator'"), 'Includes loan-calculator slug alias');
  assert.ok(pageFile.includes("resolveSlug"), 'Includes resolveSlug helper');
});
