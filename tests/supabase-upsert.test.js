import test from 'node:test';
import assert from 'node:assert/strict';
import { getUpsertConflictTarget } from '../src/lib/supabase/upsertConfig.ts';
import { MANUAL_INVESTMENT_TYPES } from '../src/lib/data/categories.ts';

test('Supabase upsert uses the table primary key as the conflict target', () => {
  assert.equal(getUpsertConflictTarget('transactions'), 'id');
  assert.equal(getUpsertConflictTarget('investments'), 'id');
  assert.equal(getUpsertConflictTarget('app_settings'), 'id');
});

test('Manual investment options exclude stock entries and keep only supported non-stock investment types', () => {
  assert.deepEqual(MANUAL_INVESTMENT_TYPES, [
    'Mutual Fund',
    'Fixed Deposit',
    'Recurring Deposit',
    'PPF',
    'EPF',
    'NPS',
    'Gold',
    'Bonds',
    'Other',
  ]);
  assert.ok(!MANUAL_INVESTMENT_TYPES.includes('Stocks'));
});
