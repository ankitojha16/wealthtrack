import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import utilities
import {
  parseTransactionsCSV,
} from '../src/lib/csv-parser.ts';

import {
  formatCurrency,
  setDefaultCurrencySettings,
} from '../src/lib/formatters/index.ts';

import {
  calculateEMI,
  calculateLoanPrepayment,
} from '../src/lib/calculations/index.ts';

test('WealthTrack 2.3 - CSV Parser accurately parses CSV formats and handles dirty data', () => {
  const sampleCSV = `Date,Type,Category,Amount,Payment Method,Description
2026-11-01,expense,Food,"₹450.00",UPI,"Dinner with, friends"
05/11/2026,income,Salary,"$85,000",Bank Transfer,Monthly salary
2026-11-10,expense,Shopping,"1,499.50",Credit Card,Books & stationery
2026-11-12,expense,Transit,-350,Metro,Commute to office
invalid-row-skipped
`;

  const result = parseTransactionsCSV(sampleCSV);
  assert.equal(result.transactions.length, 4, 'Should parse 4 valid transactions');
  assert.ok(result.errors.length >= 1, 'Should record error for invalid row');

  // Transaction 1
  assert.equal(result.transactions[0].date, '2026-11-01');
  assert.equal(result.transactions[0].type, 'expense');
  assert.equal(result.transactions[0].amount, 450);
  assert.equal(result.transactions[0].category, 'Food');
  assert.equal(result.transactions[0].description, 'Dinner with, friends');

  // Transaction 2 (Date format DD/MM/YYYY standardized)
  assert.equal(result.transactions[1].date, '2026-11-05');
  assert.equal(result.transactions[1].type, 'income');
  assert.equal(result.transactions[1].amount, 85000);

  // Transaction 3 (Number with commas)
  assert.equal(result.transactions[2].amount, 1499.5);

  // Transaction 4 (Negative expense amount auto-standardized to positive)
  assert.equal(result.transactions[3].amount, 350);
  assert.equal(result.transactions[3].type, 'expense');
});

test('WealthTrack 2.3 - Multi-currency & Number Formatting supports Indian and International systems', () => {
  // Test INR with Indian Lakhs/Crores
  setDefaultCurrencySettings('₹', 'indian');
  const inrFormatted = formatCurrency(1500000);
  assert.equal(inrFormatted, '₹15,00,000');

  const inrCompact = formatCurrency(1500000, { compact: true });
  assert.equal(inrCompact, '₹15L');

  const inrCrore = formatCurrency(25000000, { compact: true });
  assert.equal(inrCrore, '₹2.5Cr');

  // Test USD with International Millions
  setDefaultCurrencySettings('$', 'international');
  const usdFormatted = formatCurrency(1500000);
  assert.equal(usdFormatted, '$1,500,000');

  const usdCompact = formatCurrency(1500000, { compact: true });
  assert.equal(usdCompact, '$1.5M');

  // Test EUR
  setDefaultCurrencySettings('€', 'international');
  const eurFormatted = formatCurrency(75000);
  assert.equal(eurFormatted, '€75,000');

  // Test AED
  setDefaultCurrencySettings('د.إ', 'international');
  const aedFormatted = formatCurrency(12000);
  assert.equal(aedFormatted, 'د.إ12,000');

  // Reset back to INR default
  setDefaultCurrencySettings('₹', 'indian');
});

test('WealthTrack 2.3 - Loan Prepayment Math produces accurate savings and tenure reduction', () => {
  const principal = 1000000; // 10 Lakhs
  const annualRate = 9; // 9% p.a.
  const tenureMonths = 120; // 10 years (120 months)
  const prepaymentAmount = 100000; // 1 Lakh prepayment
  const prepaymentMonth = 6;

  const baseEmi = calculateEMI(principal, annualRate, tenureMonths);
  assert.ok(baseEmi.monthlyEmi > 12000 && baseEmi.monthlyEmi < 13000, 'Monthly EMI in expected range');
  assert.ok(baseEmi.totalInterest > 400000, 'Total interest > 4 Lakhs');

  const sim = calculateLoanPrepayment(principal, annualRate, tenureMonths, prepaymentAmount, prepaymentMonth);
  assert.ok(sim.interestSaved > 80000, `Interest saved should be significant (was ${sim.interestSaved})`);
  assert.ok(sim.monthsReduced >= 14, `Tenure should be reduced by at least 14 months (was ${sim.monthsReduced})`);
  assert.ok(sim.newTotalInterest < sim.originalTotalInterest, 'New interest must be less than original');
});

test('WealthTrack 2.3 - Verify new UI components and integrations exist', () => {
  const csvModalPath = path.join(rootDir, 'src/components/budget/CSVImportModal.tsx');
  const onboardingPath = path.join(rootDir, 'src/components/dashboard/OnboardingChecklist.tsx');
  const loanModalPath = path.join(rootDir, 'src/components/loans/LoanAmortizationModal.tsx');

  assert.ok(fs.existsSync(csvModalPath), 'CSVImportModal.tsx must exist');
  assert.ok(fs.existsSync(onboardingPath), 'OnboardingChecklist.tsx must exist');
  assert.ok(fs.existsSync(loanModalPath), 'LoanAmortizationModal.tsx must exist');

  // Verify settings page contains currency choices
  const settingsCode = fs.readFileSync(path.join(rootDir, 'src/app/settings/page.tsx'), 'utf-8');
  assert.ok(settingsCode.includes('Primary Currency'), 'Settings page must have Primary Currency selector');
  assert.ok(settingsCode.includes('Number & Scale System'), 'Settings page must have Number Format selector');

  // Verify budget page contains CSV import trigger
  const budgetCode = fs.readFileSync(path.join(rootDir, 'src/app/budget/page.tsx'), 'utf-8');
  assert.ok(budgetCode.includes('CSVImportModal'), 'Budget page must import CSVImportModal');
  assert.ok(budgetCode.includes('Import CSV'), 'Budget page must render Import CSV button');

  // Verify loans page contains amortization trigger
  const loansCode = fs.readFileSync(path.join(rootDir, 'src/app/loans/page.tsx'), 'utf-8');
  assert.ok(loansCode.includes('LoanAmortizationModal'), 'Loans page must import LoanAmortizationModal');
  assert.ok(loansCode.includes('Amortization & Prepayment'), 'Loans page must render Amortization & Prepayment button');

  // Verify dashboard contains OnboardingChecklist
  const dashboardCode = fs.readFileSync(path.join(rootDir, 'src/app/page.tsx'), 'utf-8');
  assert.ok(dashboardCode.includes('OnboardingChecklist'), 'Dashboard must render OnboardingChecklist');

  // Verify FinancialHealthCard contains drilldown
  const healthCode = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/FinancialHealthCard.tsx'), 'utf-8');
  assert.ok(healthCode.includes('Drilldown & Plan'), 'FinancialHealthCard must have Drilldown & Plan button');
  assert.ok(healthCode.includes('5 Pillar Diagnostic Breakdown'), 'FinancialHealthCard must have 5 pillar diagnostic');
});
