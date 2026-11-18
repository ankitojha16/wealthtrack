import test from 'node:test';
import assert from 'node:assert/strict';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? String(store.get(key)) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

test('Passwords and password hashes are never stored in client localStorage', async () => {
  globalThis.localStorage = createMemoryStorage();
  const { signUpLocal, isCredentialStorageSecure } = await import('../src/lib/auth/localAuth.ts');

  const rawPassword = 'MySecretPassword123!';
  const user = signUpLocal('secure_test@example.com', rawPassword);
  assert.ok(user);

  // Check raw storage to ensure NEITHER plaintext password nor hashes are stored
  const rawUsers = globalThis.localStorage.getItem('wealthtrack_local_auth_users');
  assert.equal(rawUsers, null, 'User password store must not exist in localStorage');
  assert.equal(isCredentialStorageSecure(), true);

  // Check session storage to ensure password is not present
  const session = globalThis.localStorage.getItem('wealthtrack_local_auth_session');
  assert.ok(session);
  assert.ok(!session.includes(rawPassword), 'Session must not contain user password');
});
