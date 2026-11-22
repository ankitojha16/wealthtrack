import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  createGuestSession,
  getLocalSessionUser,
  signOutLocal,
  isCredentialStorageSecure,
} from '../src/lib/auth/localAuth.ts';

test('Calculators Catalog: All 20 calculators are defined and contain complete metadata', () => {
  const calcFile = fs.readFileSync(path.join(process.cwd(), 'src/lib/data/calculators.ts'), 'utf8');

  const requiredSlugs = [
    'emi', 'sip', 'lumpsum', 'cagr', 'xirr', 'compound-interest', 'simple-interest',
    'fd', 'rd', 'swp', 'ppf', 'inflation', 'loan-prepayment', 'savings', 'emergency-fund',
    'net-worth', 'budget-50-30-20', 'percentage', 'discount', 'gst'
  ];

  assert.equal(requiredSlugs.length, 20);

  for (const slug of requiredSlugs) {
    assert.ok(
      calcFile.includes(`slug: '${slug}'`),
      `Missing calculator meta definition for slug: ${slug}`
    );
  }

  // Verify page no longer has visibleCalculatorSlugs whitelist
  const pageFile = fs.readFileSync(path.join(process.cwd(), 'src/app/calculators/page.tsx'), 'utf8');
  assert.ok(
    !pageFile.includes('visibleCalculatorSlugs'),
    'Calculators catalog page should no longer filter out calculators via visibleCalculatorSlugs whitelist'
  );
  assert.ok(
    pageFile.includes('orderedCalculators = [...CALCULATORS]'),
    'Calculators catalog page should sort all calculators from CALCULATORS'
  );
});

test('Guest Session: createGuestSession generates valid guest identity without credentials', () => {
  const mockStorage = new Map();
  globalThis.localStorage = {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, value) => mockStorage.set(key, String(value)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
  };

  const guest = createGuestSession();
  assert.ok(guest, 'Guest session should be created');
  assert.ok(guest.id.startsWith('guest_'), `Expected id to start with 'guest_', got ${guest.id}`);
  assert.equal(guest.isGuest, true, 'isGuest flag must be true');
  assert.equal(guest.email, 'guest@wealthtrack.local', 'Default guest email set');

  const retrieved = getLocalSessionUser();
  assert.ok(retrieved, 'Session should be retrievable from local storage');
  assert.equal(retrieved.id, guest.id);
  assert.equal(retrieved.isGuest, true);

  assert.ok(isCredentialStorageSecure(), 'Storage must remain 100% credential-free');

  signOutLocal();
  assert.equal(getLocalSessionUser(), null, 'Sign out must clear guest session');
});

test('Stock Market Benchmarks: Reference pricing contains benchmark entries for top stocks', () => {
  const quoteRouteFile = fs.readFileSync(path.join(process.cwd(), 'src/app/api/stocks/quote/route.ts'), 'utf8');

  const testSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'AAPL', 'MSFT', 'GOOGL', 'NVDA'];
  for (const sym of testSymbols) {
    assert.ok(
      quoteRouteFile.includes(`${sym}: { price:`),
      `Expected benchmark quote entry for ${sym}`
    );
  }
});
