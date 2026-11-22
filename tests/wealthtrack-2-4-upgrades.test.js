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
  calculatePortfolioRebalance,
  calculateTaxRegimes,
  calculateFIRE,
} from '../src/lib/calculations/index.ts';

test('WealthTrack 2.4 - Portfolio Rebalancing accurately detects drift and generates trade actions', () => {
  const currentHoldings = {
    equity: 700000, // 70%
    debt: 100000,   // 10%
    gold: 150000,   // 15%
    cash: 50000,    // 5%
  };
  const total = 1000000;

  const targetPercentages = {
    equity: 50,     // 50% target
    debt: 30,       // 30% target
    gold: 10,       // 10% target
    cash: 10,       // 10% target
  };

  const result = calculatePortfolioRebalance(currentHoldings, targetPercentages);

  assert.equal(result.totalValue, total, 'Total value should equal sum of holdings');
  assert.equal(result.isRebalanceNeeded, true, 'Rebalancing should be needed since equity drift is 20%');
  assert.equal(result.maxDriftPct, 20, 'Max drift should be 20%');

  // Verify equity trade: sell 2,00,000 to drop to 50%
  const eqTrade = result.trades.find((t) => t.assetClass === 'equity');
  assert.ok(eqTrade);
  assert.equal(eqTrade.action, 'sell');
  assert.equal(eqTrade.actionAmount, 200000);

  // Verify debt trade: buy 2,00,000 to rise to 30%
  const debtTrade = result.trades.find((t) => t.assetClass === 'debt');
  assert.ok(debtTrade);
  assert.equal(debtTrade.action, 'buy');
  assert.equal(debtTrade.actionAmount, 200000);

  // Verify gold trade: sell 50,000 to drop to 10%
  const goldTrade = result.trades.find((t) => t.assetClass === 'gold');
  assert.ok(goldTrade);
  assert.equal(goldTrade.action, 'sell');
  assert.equal(goldTrade.actionAmount, 50000);
});

test('WealthTrack 2.4 - Tax Regime Engine computes Old vs New Tax Regimes with 87A and deductions', () => {
  // Scenario 1: Income of 7.5 Lakhs (Taxable in New Regime <= 7L with 75k std deduction -> 0 tax due to 87A rebate)
  const lowIncomeResult = calculateTaxRegimes(750000);
  assert.equal(lowIncomeResult.newRegime.totalTax, 0, 'New regime tax on 7.5L should be 0 due to 87A rebate');
  assert.equal(lowIncomeResult.recommendedRegime, 'new');

  // Scenario 2: High Deductions vs New Regime on 15 Lakhs
  // 15L Gross, 1.5L 80C, 25k 80D, 2L Home Loan Interest
  const highDedResult = calculateTaxRegimes(1500000, {
    section80C: 150000,
    section80D: 25000,
    homeLoanInterest24b: 200000,
  });

  assert.ok(highDedResult.oldRegime.totalTax > 0, 'Old regime has tax');
  assert.ok(highDedResult.newRegime.totalTax > 0, 'New regime has tax');
  assert.ok(highDedResult.taxSavings >= 0, 'Tax savings should be calculated');
  assert.ok(['new', 'old'].includes(highDedResult.recommendedRegime));
});

test('WealthTrack 2.4 - FIRE Simulator calculates accurate corpus, years to FIRE, and trajectory', () => {
  const currentAge = 30;
  const retirementAge = 50;
  const currentNetWorth = 2000000; // 20 Lakhs
  const monthlyExpenses = 50000;   // 50k / month
  const monthlySavings = 40000;    // 40k / month
  const expectedReturn = 12;       // 12% p.a.
  const inflation = 6;             // 6% p.a.
  const swr = 4;                   // 4%

  const result = calculateFIRE(
    currentAge,
    retirementAge,
    currentNetWorth,
    monthlyExpenses,
    monthlySavings,
    expectedReturn,
    inflation,
    swr
  );

  assert.ok(result.fireNumber > 20000000, 'FIRE number should account for 20 years of inflation');
  assert.equal(result.leanFireNumber, Math.round(result.fireNumber * 0.75));
  assert.equal(result.fatFireNumber, Math.round(result.fireNumber * 1.5));
  assert.ok(result.trajectory.length > 50, 'Trajectory should model until age 85');
  assert.equal(result.trajectory[0].age, 30);
  assert.equal(result.trajectory[0].netWorth, 2000000);
});

test('WealthTrack 2.4 - Verify all upgraded UI components and routes exist', () => {
  const rebalanceModalPath = path.join(rootDir, 'src/components/investments/PortfolioRebalanceModal.tsx');
  const subsManagerPath = path.join(rootDir, 'src/components/budget/SubscriptionsManager.tsx');
  const taxCompPath = path.join(rootDir, 'src/components/reports/TaxRegimeComparator.tsx');
  const fireSimPagePath = path.join(rootDir, 'src/app/tools/fire-simulator/page.tsx');

  assert.ok(fs.existsSync(rebalanceModalPath), 'PortfolioRebalanceModal.tsx must exist');
  assert.ok(fs.existsSync(subsManagerPath), 'SubscriptionsManager.tsx must exist');
  assert.ok(fs.existsSync(taxCompPath), 'TaxRegimeComparator.tsx must exist');
  assert.ok(fs.existsSync(fireSimPagePath), 'fire-simulator/page.tsx must exist');

  // Verify investments page contains rebalance trigger
  const invCode = fs.readFileSync(path.join(rootDir, 'src/app/investments/page.tsx'), 'utf-8');
  assert.ok(invCode.includes('PortfolioRebalanceModal'), 'Investments page must import PortfolioRebalanceModal');
  assert.ok(invCode.includes('Rebalance Portfolio'), 'Investments page must render Rebalance Portfolio button');

  // Verify budget page contains subscriptions trigger
  const budgetCode = fs.readFileSync(path.join(rootDir, 'src/app/budget/page.tsx'), 'utf-8');
  assert.ok(budgetCode.includes('SubscriptionsManager'), 'Budget page must import SubscriptionsManager');
  assert.ok(budgetCode.includes('Subscriptions & Bills'), 'Budget page must render Subscriptions & Bills button');

  // Verify reports page contains Tax Optimizer tab
  const reportsCode = fs.readFileSync(path.join(rootDir, 'src/app/reports/page.tsx'), 'utf-8');
  assert.ok(reportsCode.includes('TaxRegimeComparator'), 'Reports page must import TaxRegimeComparator');
  assert.ok(reportsCode.includes('Tax Optimizer'), 'Reports page must render Tax Optimizer tab');

  // Verify tools page contains FIRE simulator card
  const toolsCode = fs.readFileSync(path.join(rootDir, 'src/app/tools/page.tsx'), 'utf-8');
  assert.ok(toolsCode.includes('fire-simulator'), 'Tools page must link to fire-simulator');
});
