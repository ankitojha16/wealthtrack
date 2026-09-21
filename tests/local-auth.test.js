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

test('local auth allows signup and sign in without Supabase configuration', async () => {
  globalThis.localStorage = createMemoryStorage();

  const { signUpLocal, signInLocal, getLocalSessionUser } = await import('../src/lib/auth/localAuth.ts');

  const created = signUpLocal('demo@example.com', 'secure-pass-123');
  assert.equal(created.email, 'demo@example.com');
  assert.ok(created.id);

  const signedIn = signInLocal('demo@example.com', 'secure-pass-123');
  assert.equal(signedIn.email, 'demo@example.com');

  const session = getLocalSessionUser();
  assert.equal(session?.email, 'demo@example.com');
});
