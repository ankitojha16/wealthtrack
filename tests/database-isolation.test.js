import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareRecordPayload } from '../src/lib/supabase/payloadBuilder.ts';

test('Budget IDs are user-scoped to prevent primary key collision across users', async () => {
  const userA = 'user_11111111-1111-1111-1111-111111111111';
  const userB = 'user_22222222-2222-2222-2222-222222222222';

  const budgetA = prepareRecordPayload('budgets', { category: 'Food', monthlyLimit: 5000 }, userA);
  const budgetB = prepareRecordPayload('budgets', { category: 'Food', monthlyLimit: 7000 }, userB);

  assert.equal(budgetA.id, `b_${userA}_Food`);
  assert.equal(budgetB.id, `b_${userB}_Food`);
  assert.notEqual(budgetA.id, budgetB.id);
});

test('Snapshot IDs are user-scoped to prevent primary key collision across users', async () => {
  const userA = 'user_11111111-1111-1111-1111-111111111111';
  const userB = 'user_22222222-2222-2222-2222-222222222222';
  const month = '2026-09';

  const snapA = prepareRecordPayload('snapshots', { monthYear: month, netWorth: 100000 }, userA);
  const snapB = prepareRecordPayload('snapshots', { monthYear: month, netWorth: 200000 }, userB);

  assert.equal(snapA.id, `snap_${userA}_${month}`);
  assert.equal(snapB.id, `snap_${userB}_${month}`);
  assert.notEqual(snapA.id, snapB.id);
});
