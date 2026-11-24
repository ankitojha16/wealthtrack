import test from 'node:test';
import assert from 'node:assert/strict';

test('Password strength scoring evaluates security requirements accurately', () => {
  const calculateStrength = (pass) => {
    const checks = {
      length: pass.length >= 8,
      hasNumber: /\d/.test(pass),
      hasUpper: /[A-Z]/.test(pass),
      hasSpecial: /[^A-Za-z0-9]/.test(pass),
    };
    return [
      checks.length,
      checks.hasNumber,
      checks.hasUpper,
      checks.hasSpecial,
    ].filter(Boolean).length;
  };

  // Weak password (< 8 chars, no upper, no number, no special)
  assert.equal(calculateStrength('short'), 0);

  // 8 chars only
  assert.equal(calculateStrength('alllowercase'), 1);

  // 8 chars + number
  assert.equal(calculateStrength('lowercase123'), 2);

  // 8 chars + number + uppercase
  assert.equal(calculateStrength('Lowercase123'), 3);

  // 8 chars + number + uppercase + special symbol
  assert.equal(calculateStrength('SecurePass123!'), 4);
});

test('generateSampleDataset produces complete, mathematically consistent financial profile', async () => {
  const { generateSampleDataset } = await import('../src/lib/data/sampleData.ts');

  const dataset = generateSampleDataset();

  // Assert all entities exist
  assert.ok(Array.isArray(dataset.transactions), 'transactions must be an array');
  assert.ok(Array.isArray(dataset.budgets), 'budgets must be an array');
  assert.ok(Array.isArray(dataset.investments), 'investments must be an array');
  assert.ok(Array.isArray(dataset.goals), 'goals must be an array');
  assert.ok(Array.isArray(dataset.loans), 'loans must be an array');
  assert.ok(Array.isArray(dataset.assets), 'assets must be an array');
  assert.ok(Array.isArray(dataset.snapshots), 'snapshots must be an array');

  // Verify non-empty populations
  assert.ok(dataset.transactions.length >= 10, 'must have at least 10 sample transactions');
  assert.ok(dataset.budgets.length >= 5, 'must have at least 5 category budgets');
  assert.ok(dataset.investments.length >= 4, 'must have diversified investments (SIP, PPF, Gold, FD)');
  assert.ok(dataset.goals.length >= 3, 'must have sample financial goals');
  assert.ok(dataset.loans.length >= 1, 'must have at least 1 active loan');
  assert.ok(dataset.assets.length >= 2, 'must have liquid & retirement assets');
  assert.equal(dataset.snapshots.length, 6, 'must have 6 months of historical trend snapshots');

  // Verify financial integrity
  const totalIncome = dataset.transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = dataset.transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  assert.ok(totalIncome > totalExpense, 'Sample profile must show positive net monthly savings');

  const totalInvested = dataset.investments.reduce((s, i) => s + i.investedAmount, 0);
  const totalCurrent = dataset.investments.reduce((s, i) => s + i.currentValue, 0);
  assert.ok(totalCurrent >= totalInvested, 'Sample investments must reflect positive portfolio growth');

  // Verify snapshot trend continuity
  for (let i = 1; i < dataset.snapshots.length; i++) {
    const prev = dataset.snapshots[i - 1];
    const curr = dataset.snapshots[i];
    assert.ok(curr.netWorth > prev.netWorth, 'Historical net worth snapshots must demonstrate upward progression');
  }
});

test('validateSignupCredentials strictly enforces email and password rules', async () => {
  const { validateSignupCredentials } = await import('../src/lib/auth/localAuth.ts');

  // Missing email
  assert.equal(validateSignupCredentials('', 'Password123!', 'Password123!').ok, false);

  // Invalid email without @
  assert.equal(validateSignupCredentials('notanemail', 'Password123!', 'Password123!').ok, false);

  // Short password (< 8 chars)
  assert.equal(validateSignupCredentials('user@test.com', 'Pass1!', 'Pass1!').ok, false);

  // Missing confirmation
  assert.equal(validateSignupCredentials('user@test.com', 'Password123!', '').ok, false);

  // Mismatched confirmation
  assert.equal(validateSignupCredentials('user@test.com', 'Password123!', 'Mismatch123!').ok, false);

  // Valid credentials
  const valid = validateSignupCredentials('user@test.com', 'Password123!', 'Password123!');
  assert.equal(valid.ok, true);
  assert.equal(valid.message, '');
});
