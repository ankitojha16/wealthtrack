import test from 'node:test';
import assert from 'node:assert/strict';

test('Monthly budget calculation isolates transactions by month', () => {
  const transactions = [
    { id: '1', date: '2026-08-15', type: 'expense', category: 'Food', amount: 3000 },
    { id: '2', date: '2026-08-20', type: 'expense', category: 'Transport', amount: 1500 },
    { id: '3', date: '2026-09-01', type: 'expense', category: 'Food', amount: 2000 },
    { id: '4', date: '2026-09-10', type: 'expense', category: 'Shopping', amount: 5000 },
    { id: '5', date: '2026-09-15', type: 'income', category: 'Salary', amount: 50000 },
  ];

  const targetMonth = '2026-09';
  const monthTransactions = transactions.filter((t) => t.date.startsWith(targetMonth));

  const expenseByCategory = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const totalSpent = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);

  // August's 3000 Food and 1500 Transport must NOT be counted in September's budget
  assert.equal(expenseByCategory['Food'], 2000);
  assert.equal(expenseByCategory['Transport'], undefined);
  assert.equal(expenseByCategory['Shopping'], 5000);
  assert.equal(totalSpent, 7000); // 2000 + 5000
});
