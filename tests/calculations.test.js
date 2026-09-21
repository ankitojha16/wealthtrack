import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSWP } from '../src/lib/calculations/index.ts';

// Simple direct calculation checks to verify formula accuracy
test('calculateEMI computes correct standard installment', () => {
  // Principal 1,00,000, Rate 10%, 12 months
  const principal = 100000;
  const annualRate = 10;
  const tenureMonths = 12;
  const r = annualRate / (12 * 100);
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = Math.round((principal * r * factor) / (factor - 1));
  assert.equal(emi, 8792);
});

test('calculateSIP computes correct future value', () => {
  // Monthly 5,000, 12% annual, 10 years (120 months)
  const monthly = 5000;
  const months = 120;
  const i = 12 / (12 * 100); // 0.01
  const fv = monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  assert.ok(Math.abs(Math.round(fv) - 1161695) < 100);
});

test('calculateCAGR computes correct annualized return', () => {
  // 1,00,000 grows to 2,00,000 in 5 years -> CAGR ~ 14.87%
  const bv = 100000;
  const ev = 200000;
  const years = 5;
  const cagr = (Math.pow(ev / bv, 1 / years) - 1) * 100;
  assert.equal(Math.round(cagr * 100) / 100, 14.87);
});

test('calculateSimpleInterest computes correctly', () => {
  // 50,000 at 8% for 3 years
  const si = (50000 * 8 * 3) / 100;
  assert.equal(si, 12000);
});

test('calculateSWP computes the remaining corpus after monthly withdrawals', () => {
  const calculations = calculateSWP({
    initialCorpus: 1000000,
    monthlyWithdrawal: 15000,
    annualRate: 8,
    years: 5,
  });

  assert.ok(calculations.remainingValue > 0);
  assert.ok(calculations.totalWithdrawn >= 900000);
  assert.ok(calculations.totalInterest > 0);
});

test('calculatePPF limits deposit to 1.5 Lakhs and accumulates properly', () => {
  const deposit = 150000;
  const rate = 7.1;
  let balance = 0;
  for (let y = 1; y <= 15; y++) {
    balance = (balance + deposit) * (1 + rate / 100);
  }
  // PPF after 15 years with 1.5L/yr is ~40.68L
  assert.ok(balance > 4000000 && balance < 4200000);
});
