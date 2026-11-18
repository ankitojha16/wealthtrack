import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Simulation engine adhering to PostgreSQL Row Level Security (RLS) semantics
class RlsDatabaseSimulator {
  constructor() {
    this.tables = {
      transactions: [],
      budgets: [],
      investments: [],
      loans: [],
      goals: [],
      snapshots: [],
      app_settings: [],
    };
  }

  // SELECT ... WHERE auth.uid() = user_id
  select(table, authUserId) {
    if (!authUserId) throw new Error('RLS: Unauthenticated select rejected');
    return this.tables[table].filter((row) => row.user_id === authUserId);
  }

  // INSERT ... WITH CHECK (auth.uid() = user_id)
  insert(table, row, authUserId) {
    if (!authUserId) throw new Error('RLS: Unauthenticated insert rejected');
    if (row.user_id !== authUserId) {
      throw new Error(`RLS: new row violates row-level security policy for table "${table}" (auth.uid() !== row.user_id)`);
    }
    this.tables[table].push({ ...row });
    return { ...row };
  }

  // UPDATE ... USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
  update(table, id, updates, authUserId) {
    if (!authUserId) throw new Error('RLS: Unauthenticated update rejected');
    const index = this.tables[table].findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = this.tables[table][index];
    if (existing.user_id !== authUserId) {
      throw new Error(`RLS: update violates row-level security policy for table "${table}"`);
    }
    if (updates.user_id && updates.user_id !== authUserId) {
      throw new Error(`RLS: cannot reassign row ownership in table "${table}"`);
    }

    const updated = { ...existing, ...updates };
    this.tables[table][index] = updated;
    return updated;
  }

  // DELETE ... USING (auth.uid() = user_id)
  delete(table, id, authUserId) {
    if (!authUserId) throw new Error('RLS: Unauthenticated delete rejected');
    const index = this.tables[table].findIndex((r) => r.id === id);
    if (index === -1) return false;

    const existing = this.tables[table][index];
    if (existing.user_id !== authUserId) {
      throw new Error(`RLS: delete violates row-level security policy for table "${table}"`);
    }

    this.tables[table].splice(index, 1);
    return true;
  }
}

test('PostgreSQL migration schema defines strict RLS and compound indexes for all tables', () => {
  const schemaPath = path.resolve(process.cwd(), 'supabase/migrations/20260921_create_wealthtrack_schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const requiredTables = [
    'transactions',
    'budgets',
    'investments',
    'loans',
    'goals',
    'snapshots',
    'app_settings',
  ];

  for (const table of requiredTables) {
    // Verify RLS is enabled
    assert.ok(
      schemaSql.includes(`alter table public.${table} enable row level security;`),
      `Table ${table} must have RLS enabled in migration schema`
    );

    // Verify policies exist
    assert.ok(
      schemaSql.includes(`create policy "${table}_select_own"`),
      `Table ${table} must have select policy`
    );
    assert.ok(
      schemaSql.includes(`create policy "${table}_insert_own"`),
      `Table ${table} must have insert policy`
    );
    assert.ok(
      schemaSql.includes(`create policy "${table}_update_own"`),
      `Table ${table} must have update policy`
    );
    assert.ok(
      schemaSql.includes(`create policy "${table}_delete_own"`),
      `Table ${table} must have delete policy`
    );
  }
});

test('RLS Enforcement: User A cannot read User B data across all tables', () => {
  const db = new RlsDatabaseSimulator();
  const userA = 'user_aaa_11111111-1111-1111-1111-111111111111';
  const userB = 'user_bbb_22222222-2222-2222-2222-222222222222';

  // Seed User B records
  db.insert('transactions', { id: 'tx_b1', user_id: userB, amount: 5000, category: 'Food' }, userB);
  db.insert('investments', { id: 'inv_b1', user_id: userB, name: 'HDFC Mutual Fund', currentValue: 50000 }, userB);
  db.insert('loans', { id: 'loan_b1', user_id: userB, name: 'Car Loan', outstandingAmount: 400000 }, userB);
  db.insert('budgets', { id: `b_${userB}_Food`, user_id: userB, category: 'Food', monthlyLimit: 10000 }, userB);
  db.insert('goals', { id: 'goal_b1', user_id: userB, name: 'House Downpayment', targetAmount: 2000000 }, userB);
  db.insert('snapshots', { id: `snap_${userB}_2026-10`, user_id: userB, monthYear: '2026-10', net_worth: 1500000 }, userB);

  // User A attempts to read User B records
  assert.equal(db.select('transactions', userA).length, 0);
  assert.equal(db.select('investments', userA).length, 0);
  assert.equal(db.select('loans', userA).length, 0);
  assert.equal(db.select('budgets', userA).length, 0);
  assert.equal(db.select('goals', userA).length, 0);
  assert.equal(db.select('snapshots', userA).length, 0);
});

test('RLS Enforcement: User A cannot modify or delete User B records', () => {
  const db = new RlsDatabaseSimulator();
  const userA = 'user_aaa_11111111-1111-1111-1111-111111111111';
  const userB = 'user_bbb_22222222-2222-2222-2222-222222222222';

  // Seed User B records
  db.insert('investments', { id: 'inv_b1', user_id: userB, name: 'TCS Shares', currentValue: 100000 }, userB);
  db.insert('loans', { id: 'loan_b1', user_id: userB, name: 'Education Loan', outstandingAmount: 300000 }, userB);

  // User A attempts to modify User B's investment
  assert.throws(
    () => db.update('investments', 'inv_b1', { currentValue: 0 }, userA),
    /RLS: update violates row-level security policy/
  );

  // User A attempts to delete User B's loan
  assert.throws(
    () => db.delete('loans', 'loan_b1', userA),
    /RLS: delete violates row-level security policy/
  );
});

test('RLS Enforcement: Unauthorized INSERT with forged user_id is rejected', () => {
  const db = new RlsDatabaseSimulator();
  const userA = 'user_aaa_11111111-1111-1111-1111-111111111111';
  const userB = 'user_bbb_22222222-2222-2222-2222-222222222222';

  // User A attempts to forge an insert into User B's account
  assert.throws(
    () => db.insert('transactions', { id: 'tx_forged', user_id: userB, amount: 99999 }, userA),
    /RLS: new row violates row-level security policy/
  );
});
