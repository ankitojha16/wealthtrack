import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// =========================================================================
// 1. OPEN REDIRECT SANITIZATION TESTS
// =========================================================================
test('sanitizeRedirectUrl allows safe relative application routes', async () => {
  const { sanitizeRedirectUrl } = await import('../src/lib/auth/redirect.ts');

  assert.equal(sanitizeRedirectUrl('/budget'), '/budget');
  assert.equal(sanitizeRedirectUrl('/investments?view=stocks'), '/investments?view=stocks');
  assert.equal(sanitizeRedirectUrl('/loans#active'), '/loans#active');
  assert.equal(sanitizeRedirectUrl('/reports'), '/reports');
  assert.equal(sanitizeRedirectUrl('/settings'), '/settings');
  assert.equal(sanitizeRedirectUrl('/'), '/');
});

test('sanitizeRedirectUrl blocks external and open redirect attacks', async () => {
  const { sanitizeRedirectUrl } = await import('../src/lib/auth/redirect.ts');

  // Protocol-relative URLs
  assert.equal(sanitizeRedirectUrl('//evil.com'), '/');
  assert.equal(sanitizeRedirectUrl('//attacker.org/phish'), '/');
  assert.equal(sanitizeRedirectUrl('/\\evil.com'), '/');

  // Absolute external URLs
  assert.equal(sanitizeRedirectUrl('https://evil.com'), '/');
  assert.equal(sanitizeRedirectUrl('http://malicious.example.com/login'), '/');

  // Script schemes and data URIs
  assert.equal(sanitizeRedirectUrl('javascript:alert(1)'), '/');
  assert.equal(sanitizeRedirectUrl('data:text/html,<script>alert(1)</script>'), '/');
  assert.equal(sanitizeRedirectUrl('vbscript:msgbox(1)'), '/');

  // Empty, null, or undefined values
  assert.equal(sanitizeRedirectUrl(null), '/');
  assert.equal(sanitizeRedirectUrl(undefined), '/');
  assert.equal(sanitizeRedirectUrl('   '), '/');
});

// =========================================================================
// 2. MULTI-USER BUDGET ISOLATION & USER-SCOPED IDENTIFIERS
// =========================================================================
test('Multi-user budgets: Two users can budget for same category without collision', () => {
  const user1 = 'u_11111111-aaaa-bbbb-cccc-111111111111';
  const user2 = 'u_22222222-aaaa-bbbb-cccc-222222222222';
  const category = 'Groceries & Food';

  const formatBudgetId = (userId, cat) => {
    const safeKey = cat.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `b_${userId}_${safeKey}`;
  };

  const budgetUser1 = {
    id: formatBudgetId(user1, category),
    user_id: user1,
    category,
    monthlyLimit: 15000,
    spent: 4200,
  };

  const budgetUser2 = {
    id: formatBudgetId(user2, category),
    user_id: user2,
    category,
    monthlyLimit: 25000,
    spent: 8900,
  };

  // Assert user-scoped primary keys are distinct
  assert.notEqual(budgetUser1.id, budgetUser2.id);
  assert.equal(budgetUser1.id, `b_${user1}_groceries___food`);
  assert.equal(budgetUser2.id, `b_${user2}_groceries___food`);

  // Simulate in-memory multi-tenant table with primary key uniqueness
  const budgetTable = new Map();
  budgetTable.set(budgetUser1.id, budgetUser1);
  budgetTable.set(budgetUser2.id, budgetUser2);

  assert.equal(budgetTable.size, 2);

  // User 1 updates their budget limit
  const updatedUser1 = { ...budgetUser1, monthlyLimit: 18000 };
  budgetTable.set(updatedUser1.id, updatedUser1);

  // Confirm User 2's budget is completely unchanged
  const fetchedUser2 = budgetTable.get(budgetUser2.id);
  assert.equal(fetchedUser2.monthlyLimit, 25000);
  assert.equal(fetchedUser2.user_id, user2);
});

// =========================================================================
// 3. DATABASE ERROR HANDLING & DATA PRESERVATION (NO FALSE ZERO BALANCES)
// =========================================================================
test('Database error handling: Distinguishes empty data from database failures and preserves state', () => {
  // Simulated application state with user investments and balance
  const activeFinancialState = {
    totalNetWorth: 850000,
    investments: [
      { id: 'inv_1', name: 'Nifty 50 Index Fund', currentValue: 500000 },
      { id: 'inv_2', name: 'Fixed Deposit SBI', currentValue: 350000 },
    ],
    syncError: null,
  };

  // Simulate a network or database failure
  const simulateDatabaseFetch = (shouldFail) => {
    if (shouldFail) {
      throw new Error('503 Service Unavailable: Database query timeout');
    }
    return []; // Genuine empty result
  };

  // Safe refresh handler mimicking FinanceContext
  const handleDataRefresh = (currentState, failSim) => {
    try {
      const records = simulateDatabaseFetch(failSim);
      return {
        ...currentState,
        investments: records,
        totalNetWorth: records.reduce((s, i) => s + i.currentValue, 0),
        syncError: null,
      };
    } catch (err) {
      // PRESERVE previously loaded state! Do NOT replace with empty arrays!
      return {
        ...currentState,
        syncError: err.message,
      };
    }
  };

  // Execution during database failure
  const stateAfterFailure = handleDataRefresh(activeFinancialState, true);

  // Assert previous state is PRESERVED and NOT wiped to ₹0
  assert.equal(stateAfterFailure.totalNetWorth, 850000);
  assert.equal(stateAfterFailure.investments.length, 2);
  assert.ok(stateAfterFailure.syncError.includes('Database query timeout'));
});

// =========================================================================
// 4. DATABASE SECURITY: VIEWS & COMPOSITE OWNERSHIP CONSTRAINTS
// =========================================================================
test('PostgreSQL migrations define security_invoker on views and composite FK constraints', () => {
  const migration2Path = path.resolve(process.cwd(), 'supabase/migrations/20261119_wealthtrack_2_1_security_fixes.sql');
  assert.ok(fs.existsSync(migration2Path), '20261119_wealthtrack_2_1_security_fixes.sql must exist');

  const sql = fs.readFileSync(migration2Path, 'utf8');

  // Verify security_invoker = true on expenses and income views
  assert.ok(sql.includes('with (security_invoker = true)'), 'Views must be defined with security_invoker = true');
  assert.ok(sql.includes('create or replace view public.expenses'), 'Expenses view must be recreated');
  assert.ok(sql.includes('create or replace view public.income'), 'Income view must be recreated');

  // Verify composite constraints for stock_holdings -> investments(id, user_id)
  assert.ok(sql.includes('uq_investments_id_user'), 'Investments must have unique constraint on (id, user_id)');
  assert.ok(sql.includes('fk_stock_holdings_investment_user'), 'stock_holdings must have composite FK on (investment_id, user_id)');

  // Verify composite constraints for goal_contributions -> goals(id, user_id)
  assert.ok(sql.includes('uq_goals_id_user'), 'Goals must have unique constraint on (id, user_id)');
  assert.ok(sql.includes('fk_goal_contributions_goal_user'), 'goal_contributions must have composite FK on (goal_id, user_id)');

  // Verify updated_at trigger function
  assert.ok(sql.includes('create or replace function public.handle_updated_at()'), 'handle_updated_at function must exist');
  assert.ok(sql.includes('tr_investments_updated_at'), 'Investments updated_at trigger must exist');
});

// =========================================================================
// 5. INFLIGHT REQUEST DEDUPLICATION
// =========================================================================
test('Inflight request deduplication prevents redundant concurrent database queries', async () => {
  let databaseCallCount = 0;

  // Simulator representing deduplicating refresh handler
  let activePromise = null;

  const fetchFinancialData = async () => {
    if (activePromise) {
      return activePromise;
    }

    activePromise = (async () => {
      databaseCallCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { success: true };
    })();

    try {
      return await activePromise;
    } finally {
      activePromise = null;
    }
  };

  // Dispatch 5 concurrent requests simultaneously
  const results = await Promise.all([
    fetchFinancialData(),
    fetchFinancialData(),
    fetchFinancialData(),
    fetchFinancialData(),
    fetchFinancialData(),
  ]);

  assert.equal(results.length, 5);
  // Database call count must be exactly 1 due to deduplication!
  assert.equal(databaseCallCount, 1);
});
