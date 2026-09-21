import test from 'node:test';
import assert from 'node:assert/strict';

test('signup validation catches mismatched confirmation password', async () => {
  const { validateSignupCredentials } = await import('../src/lib/auth/localAuth.ts');

  const result = validateSignupCredentials('demo@example.com', 'SecurePass1!', 'SecurePass2!');

  assert.equal(result.ok, false);
  assert.match(result.message || '', /match/i);
});

test('signup validation accepts matching password and confirmation', async () => {
  const { validateSignupCredentials } = await import('../src/lib/auth/localAuth.ts');

  const result = validateSignupCredentials('demo@example.com', 'SecurePass1!', 'SecurePass1!');

  assert.equal(result.ok, true);
  assert.equal(result.message, '');
});
