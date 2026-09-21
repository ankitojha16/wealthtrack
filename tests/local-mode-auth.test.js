import test from 'node:test';
import assert from 'node:assert/strict';
import { hasSupabaseConfig, isLocalOnlyMode } from '../src/lib/supabase/client.ts';

test('Local-only mode is treated as valid app access without Supabase configuration', () => {
  assert.equal(hasSupabaseConfig(), false);
  assert.equal(isLocalOnlyMode(), true);
});
