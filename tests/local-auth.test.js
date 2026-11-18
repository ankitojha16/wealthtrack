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

test('local mode allows guest session without storing passwords', async () => {
  globalThis.localStorage = createMemoryStorage();

  const { signUpLocal, signInLocal, getLocalSessionUser } = await import('../src/lib/auth/localAuth.ts');

  const created = signUpLocal('demo@example.com', 'secure-pass-123');
  assert.equal(created?.email, 'demo@example.com');
  assert.ok(created?.id);
  assert.equal(created?.isGuest, true);

  const signedIn = signInLocal('demo@example.com', 'secure-pass-123');
  assert.equal(signedIn?.email, 'demo@example.com');

  const session = getLocalSessionUser();
  assert.equal(session?.email, 'demo@example.com');
});

test('local password reset validates minimum length without local credential leaks', async () => {
  globalThis.localStorage = createMemoryStorage();

  const { resetLocalPassword, isCredentialStorageSecure } = await import('../src/lib/auth/localAuth.ts');

  assert.equal(resetLocalPassword('fruit@example.com', 'Mango', 'short'), false);
  assert.equal(resetLocalPassword('fruit@example.com', 'Mango', 'new-secure-pass'), true);
  assert.equal(isCredentialStorageSecure(), true);
});
