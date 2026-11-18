import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareRecordPayload } from '../src/lib/supabase/payloadBuilder.ts';

test('Snapshots map netWorth to net_worth and back seamlessly', async () => {
  const userId = 'user-test-snapshot';
  const row = {
    monthYear: '2026-10',
    netWorth: 250000,
    totalAssets: 300000,
    totalLiabilities: 50000,
  };

  const saved = prepareRecordPayload('snapshots', row, userId);
  assert.equal(saved.netWorth, 250000);
  assert.equal(saved.net_worth, 250000);
  assert.equal(saved.user_id, userId);
  assert.equal(saved.id, `snap_${userId}_2026-10`);
});
