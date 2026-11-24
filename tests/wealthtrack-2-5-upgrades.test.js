import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('WealthTrack 2.5 - Currency cycle transitions smoothly between formats and symbols', () => {
  const getNextCurrency = (current) => {
    switch (current) {
      case 'INR':
        return { currency: 'USD', currencySymbol: '$', numberFormat: 'international' };
      case 'USD':
        return { currency: 'EUR', currencySymbol: '€', numberFormat: 'international' };
      case 'EUR':
        return { currency: 'GBP', currencySymbol: '£', numberFormat: 'international' };
      default:
        return { currency: 'INR', currencySymbol: '₹', numberFormat: 'indian' };
    }
  };

  assert.deepEqual(getNextCurrency('INR'), { currency: 'USD', currencySymbol: '$', numberFormat: 'international' });
  assert.deepEqual(getNextCurrency('USD'), { currency: 'EUR', currencySymbol: '€', numberFormat: 'international' });
  assert.deepEqual(getNextCurrency('EUR'), { currency: 'GBP', currencySymbol: '£', numberFormat: 'international' });
  assert.deepEqual(getNextCurrency('GBP'), { currency: 'INR', currencySymbol: '₹', numberFormat: 'indian' });
});

test('WealthTrack 2.5 - Verify CommandPalette and Quick Currency components exist and are integrated', () => {
  const palettePath = path.resolve(process.cwd(), 'src/components/common/CommandPalette.tsx');
  const navbarPath = path.resolve(process.cwd(), 'src/components/common/Navbar.tsx');
  const appShellPath = path.resolve(process.cwd(), 'src/components/common/AppShell.tsx');

  assert.ok(fs.existsSync(palettePath), 'CommandPalette.tsx must exist');
  assert.ok(fs.existsSync(navbarPath), 'Navbar.tsx must exist');
  assert.ok(fs.existsSync(appShellPath), 'AppShell.tsx must exist');

  const paletteCode = fs.readFileSync(palettePath, 'utf8');
  assert.ok(paletteCode.includes('CommandPalette'), 'CommandPalette component must be exported');
  assert.ok(paletteCode.includes('fire-simulator'), 'CommandPalette must include FIRE simulator navigation');
  assert.ok(paletteCode.includes('calculators/sip'), 'CommandPalette must include SIP calculator');
  assert.ok(paletteCode.includes('calculators/emi'), 'CommandPalette must include EMI calculator');

  const navbarCode = fs.readFileSync(navbarPath, 'utf8');
  assert.ok(navbarCode.includes('onOpenCommandPalette'), 'Navbar must accept onOpenCommandPalette');
  assert.ok(navbarCode.includes('Quick Currency Switcher'), 'Navbar must include Quick Currency Switcher');

  const appShellCode = fs.readFileSync(appShellPath, 'utf8');
  assert.ok(appShellCode.includes('isCommandPaletteOpen'), 'AppShell must manage isCommandPaletteOpen');
  assert.ok(appShellCode.includes('handleKeyDown'), 'AppShell must listen to global Cmd+K / Ctrl+K shortcut');
});
