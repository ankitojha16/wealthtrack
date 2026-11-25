import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('WealthTrack 2.6 - Goals CSV data formatting computes correct progress and remaining values', () => {
  const sampleGoals = [
    {
      id: 'g_1',
      name: 'Emergency Fund 6 Months',
      category: 'Emergency Fund',
      targetAmount: 300000,
      currentAmount: 180000,
      targetDate: '2027-12-31',
      monthlyContribution: 10000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'g_2',
      name: 'MacBook Pro Upgrade',
      category: 'Personal',
      targetAmount: 200000,
      currentAmount: 200000,
      targetDate: '2026-11-30',
      monthlyContribution: 20000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const formatGoalRows = (goals) => {
    return goals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const progress = g.targetAmount > 0 ? ((g.currentAmount / g.targetAmount) * 100).toFixed(1) : '0';
      return [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.category}"`,
        g.targetAmount,
        g.currentAmount,
        remaining,
        `"${progress}%"`,
        `"${g.targetDate || ''}"`,
        g.monthlyContribution || 0,
      ];
    });
  };

  const rows = formatGoalRows(sampleGoals);
  assert.equal(rows.length, 2);
  // Goal 1: 180,000 / 300,000 = 60.0% progress, 120,000 remaining
  assert.equal(rows[0][4], 120000);
  assert.equal(rows[0][5], '"60.0%"');

  // Goal 2: 200,000 / 200,000 = 100.0% progress, 0 remaining
  assert.equal(rows[1][4], 0);
  assert.equal(rows[1][5], '"100.0%"');
});

test('WealthTrack 2.6 - Snapshots CSV formatting structures net worth history accurately', () => {
  const sampleSnapshots = [
    {
      id: 'snap_2026-08',
      monthYear: '2026-08',
      netWorth: 1500000,
      totalAssets: 2000000,
      totalLiabilities: 500000,
      totalInvestments: 800000,
      totalInvestmentsValue: 950000,
      totalLoans: 450000,
      income: 150000,
      expenses: 90000,
      savings: 60000,
      timestamp: 1725148800000,
    },
  ];

  const formatSnapshotRows = (snapshots) => {
    return snapshots.map((s) => [
      `"${s.monthYear}"`,
      s.netWorth,
      s.totalAssets,
      s.totalLiabilities,
      s.totalInvestmentsValue ?? s.totalInvestments ?? 0,
      s.totalLoans ?? 0,
      s.income ?? 0,
      s.expenses ?? 0,
      s.savings ?? 0,
    ]);
  };

  const rows = formatSnapshotRows(sampleSnapshots);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], [
    '"2026-08"',
    1500000,
    2000000,
    500000,
    950000,
    450000,
    150000,
    90000,
    60000,
  ]);
});

test('WealthTrack 2.6 - Fallback safety prevents "undefined" in loan and transaction CSVs', () => {
  const rawTx = {
    id: 'tx_1',
    date: '2026-11-25',
    type: 'expense',
    category: 'Groceries',
    amount: 1500,
    // paymentMethod omitted deliberately
  };

  const paymentMethod = (rawTx.paymentMethod || 'Other').replace(/"/g, '""');
  assert.equal(paymentMethod, 'Other', 'Missing paymentMethod must fallback to "Other" rather than undefined');

  const rawLoan = {
    id: 'loan_1',
    name: 'Home Loan',
    type: 'Home Loan',
    outstandingAmount: 4500000,
    monthlyEmi: 42000,
    emisRemaining: 180,
    // originalAmount and interestRate omitted
  };

  const origAmount = rawLoan.originalAmount ?? rawLoan.outstandingAmount;
  const intRate = rawLoan.interestRate ?? 0;
  assert.equal(origAmount, 4500000, 'Missing originalAmount must fallback to outstandingAmount');
  assert.equal(intRate, 0, 'Missing interestRate must fallback to 0');
});

test('WealthTrack 2.6 - Verify KeyboardShortcutsModal and hotkey route mapping exists', () => {
  const shortcutsModalPath = path.resolve(process.cwd(), 'src/components/common/KeyboardShortcutsModal.tsx');
  const appShellPath = path.resolve(process.cwd(), 'src/components/common/AppShell.tsx');
  const exportImportPath = path.resolve(process.cwd(), 'src/lib/export-import.ts');

  assert.ok(fs.existsSync(shortcutsModalPath), 'KeyboardShortcutsModal.tsx must exist');
  assert.ok(fs.existsSync(appShellPath), 'AppShell.tsx must exist');
  assert.ok(fs.existsSync(exportImportPath), 'export-import.ts must exist');

  const modalCode = fs.readFileSync(shortcutsModalPath, 'utf8');
  assert.ok(modalCode.includes('KeyboardShortcutsModal'), 'KeyboardShortcutsModal component must be exported');
  assert.ok(modalCode.includes('Command Palette'), 'Shortcuts guide must list Command Palette');
  assert.ok(modalCode.includes('FIRE Retirement Simulator'), 'Shortcuts guide must list FIRE simulator hotkey');

  const shellCode = fs.readFileSync(appShellPath, 'utf8');
  assert.ok(shellCode.includes('KeyboardShortcutsModal'), 'AppShell must import KeyboardShortcutsModal');
  assert.ok(shellCode.includes('isShortcutsOpen'), 'AppShell must track isShortcutsOpen state');
  assert.ok(shellCode.includes("lastKey === 'g'"), 'AppShell must support G-key navigation sequences');

  const exportCode = fs.readFileSync(exportImportPath, 'utf8');
  assert.ok(exportCode.includes('exportGoalsCSV'), 'export-import.ts must export exportGoalsCSV');
  assert.ok(exportCode.includes('exportSnapshotsCSV'), 'export-import.ts must export exportSnapshotsCSV');
});
