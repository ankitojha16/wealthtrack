import test from 'node:test';
import assert from 'node:assert/strict';

test('Savings rate calculates accurately and handles zero income gracefully', () => {
  const calculateSavingsRate = (income, savings) => (income > 0 ? (savings / income) * 100 : 0);

  // Normal scenario
  assert.equal(calculateSavingsRate(100000, 30000), 30);
  assert.equal(calculateSavingsRate(50000, 10000), 20);

  // Zero income scenario
  assert.equal(calculateSavingsRate(0, 0), 0);
  assert.equal(calculateSavingsRate(0, -5000), 0);
});

test('Budget utilization triggers warning at 80% and overspent above 100%', () => {
  const evaluateBudgetStatus = (expenses, limit) => {
    if (limit <= 0) return 'no_limit';
    const percent = (expenses / limit) * 100;
    if (percent > 100) return 'overspent';
    if (percent >= 80) return 'warning';
    return 'healthy';
  };

  assert.equal(evaluateBudgetStatus(25000, 50000), 'healthy');
  assert.equal(evaluateBudgetStatus(41000, 50000), 'warning'); // 82%
  assert.equal(evaluateBudgetStatus(52000, 50000), 'overspent'); // 104%
  assert.equal(evaluateBudgetStatus(10000, 0), 'no_limit');
});

test('Net Worth and Solvency accurately distinguish positive from negative equity', () => {
  const computeSolvency = (assets, liabilities) => {
    const netWorth = assets - liabilities;
    const debtToAsset = assets > 0 ? (liabilities / assets) * 100 : liabilities > 0 ? 100 : 0;
    return { netWorth, debtToAsset };
  };

  const healthy = computeSolvency(1500000, 300000);
  assert.equal(healthy.netWorth, 1200000);
  assert.equal(healthy.debtToAsset, 20);

  const insolvent = computeSolvency(200000, 500000);
  assert.equal(insolvent.netWorth, -300000);
  assert.equal(insolvent.debtToAsset, 250);
});
