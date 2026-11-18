import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialHealthScore } from '../src/lib/calculations/index.ts';

test('Financial health score correctly rates strong financial profiles (80+)', () => {
  const scoreResult = calculateFinancialHealthScore({
    monthlyIncome: 120000,
    monthlyExpenses: 40000,
    totalMonthlyEmi: 15000,
    liquidAssets: 300000,
    totalAssets: 2500000,
    totalLiabilities: 300000,
    totalInvestments: 1200000,
    activeGoals: [
      { currentAmount: 300000, targetAmount: 500000 },
      { currentAmount: 100000, targetAmount: 200000 },
    ],
  });

  assert.ok(scoreResult.score >= 80, `Expected score >= 80, got ${scoreResult.score}`);
  assert.equal(scoreResult.savingsScore >= 80, true);
  assert.equal(scoreResult.debtScore >= 80, true);
  assert.equal(scoreResult.emergencyFundScore >= 75, true);
  assert.ok(scoreResult.factors.some((f) => f.type === 'positive'));
});

test('Financial health score warns on high debt and insufficient emergency fund', () => {
  const weakResult = calculateFinancialHealthScore({
    monthlyIncome: 50000,
    monthlyExpenses: 45000,
    totalMonthlyEmi: 25000, // 50% EMI burden
    liquidAssets: 10000, // < 1 month emergency fund
    totalAssets: 300000,
    totalLiabilities: 600000, // Insolvent: Liabilities > Assets
    totalInvestments: 0,
    activeGoals: [],
  });

  assert.ok(weakResult.score < 60, `Expected score < 60, got ${weakResult.score}`);
  assert.ok(weakResult.factors.some((f) => f.type === 'warning'));
});

test('Financial health score handles zero-data empty profile gracefully', () => {
  const emptyResult = calculateFinancialHealthScore({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalMonthlyEmi: 0,
    liquidAssets: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalInvestments: 0,
    activeGoals: [],
  });

  assert.ok(emptyResult.score >= 10 && emptyResult.score <= 100);
  assert.equal(typeof emptyResult.score, 'number');
  assert.ok(emptyResult.factors.length > 0);
});
