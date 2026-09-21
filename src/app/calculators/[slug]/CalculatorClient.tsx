'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CalculatorMeta, LearnArticle } from '@/types';
import * as calcEngine from '@/lib/calculations';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import {
  Calculator,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  calc: CalculatorMeta;
  relatedCalcs: CalculatorMeta[];
  relatedArticles: LearnArticle[];
}

export default function CalculatorClient({ calc, relatedCalcs, relatedArticles }: Props) {
  // Common states for different calculator types
  // 1. EMI
  const [emiPrincipal, setEmiPrincipal] = useState(1000000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiTenureYears, setEmiTenureYears] = useState(10);

  // 2. SIP
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // 3. Lumpsum
  const [lumpAmount, setLumpAmount] = useState(500000);
  const [lumpRate, setLumpRate] = useState(12);
  const [lumpYears, setLumpYears] = useState(10);

  // 4. Compound Interest
  const [ciPrincipal, setCiPrincipal] = useState(200000);
  const [ciRate, setCiRate] = useState(8);
  const [ciYears, setCiYears] = useState(5);
  const [ciFreq, setCiFreq] = useState<1 | 2 | 4 | 12>(4);

  // 5. Simple Interest
  const [siPrincipal, setSiPrincipal] = useState(100000);
  const [siRate, setSiRate] = useState(7.5);
  const [siYears, setSiYears] = useState(3);

  // 6. FD
  const [fdPrincipal, setFdPrincipal] = useState(300000);
  const [fdRate, setFdRate] = useState(7.25);
  const [fdYears, setFdYears] = useState(3);

  // 7. SWP
  const [swpCorpus, setSwpCorpus] = useState(1000000);
  const [swpAmount, setSwpAmount] = useState(15000);
  const [swpRate, setSwpRate] = useState(8);
  const [swpYears, setSwpYears] = useState(5);

  // 8. RD
  const [rdMonthly, setRdMonthly] = useState(5000);
  const [rdRate, setRdRate] = useState(7.0);
  const [rdMonths, setRdMonths] = useState(24);

  // 9. PPF
  const [ppfDeposit, setPpfDeposit] = useState(150000);
  const [ppfYears, setPpfYears] = useState(15);

  // 9. CAGR
  const [cagrStart, setCagrStart] = useState(200000);
  const [cagrEnd, setCagrEnd] = useState(550000);
  const [cagrYears, setCagrYears] = useState(6);

  // 10. Inflation
  const [infAmount, setInfAmount] = useState(50000);
  const [infRate, setInfRate] = useState(6.5);
  const [infYears, setInfYears] = useState(10);

  // 11. Loan Prepayment
  const [prepPrincipal, setPrepPrincipal] = useState(3000000);
  const [prepRate, setPrepRate] = useState(8.5);
  const [prepTenure, setPrepTenure] = useState(240); // 20 yrs
  const [prepAmount, setPrepAmount] = useState(200000);

  // 12. Savings Goal
  const [savTarget, setSavTarget] = useState(1500000);
  const [savCurrent, setSavCurrent] = useState(200000);
  const [savRate, setSavRate] = useState(8);
  const [savYears, setSavYears] = useState(5);

  // 13. Emergency Fund
  const [emgExpenses, setEmgExpenses] = useState(45000);
  const [emgMonths, setEmgMonths] = useState(6);

  // 14. Net Worth
  const [nwAssets, setNwAssets] = useState(2500000);
  const [nwDebts, setNwDebts] = useState(800000);

  // 15. 50/30/20
  const [bIncome, setBIncome] = useState(80000);

  // 16. Percentage
  const [pctValA, setPctValA] = useState(15);
  const [pctValB, setPctValB] = useState(2500);

  // 17. Discount
  const [discPrice, setDiscPrice] = useState(4999);
  const [discPct, setDiscPct] = useState(25);

  // 18. GST
  const [gstAmount, setGstAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [gstInclusive, setGstInclusive] = useState(false);

  // 19. XIRR
  const [xirrFlows, setXirrFlows] = useState<string>('-100000, 2024-01-01\n-50000, 2024-06-01\n185000, 2026-01-01');

  // FAQ open/close state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Render specific inputs and computed results based on calc.slug
  const renderCalculatorEngine = () => {
    switch (calc.slug) {
      case 'emi': {
        const res = calcEngine.calculateEMI(emiPrincipal, emiRate, emiTenureYears * 12);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Loan Principal Amount</span>
                  <span className="text-sky-600 font-black">{formatCurrency(emiPrincipal)}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="20000000"
                  step="50000"
                  value={emiPrincipal}
                  onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Interest Rate (% p.a.)</span>
                  <span className="text-sky-600 font-black">{emiRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.1"
                  value={emiRate}
                  onChange={(e) => setEmiRate(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Loan Tenure (Years)</span>
                  <span className="text-sky-600 font-black">{emiTenureYears} Years ({emiTenureYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={emiTenureYears}
                  onChange={(e) => setEmiTenureYears(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="text-center p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Monthly Loan EMI</span>
                  <span className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
                    {formatCurrency(res.monthlyEmi)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Principal</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(emiPrincipal)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Total Interest</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(res.totalInterest)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Total Amount Payable</span>
                  <span className="font-black text-slate-900 dark:text-white">{formatCurrency(res.totalPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'sip': {
        const res = calcEngine.calculateSIP(sipMonthly, sipRate, sipYears);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Monthly SIP Installment</span>
                  <span className="text-sky-600 font-black">{formatCurrency(sipMonthly)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="200000"
                  step="500"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Expected Return Rate (% p.a.)</span>
                  <span className="text-sky-600 font-black">{sipRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Time Horizon (Years)</span>
                  <span className="text-sky-600 font-black">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="text-center p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Estimated Maturity Value</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {formatCurrency(res.totalValue)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Total Invested</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(res.totalInvested)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Wealth Gain</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(res.estimatedReturns)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'swp': {
        const res = calcEngine.calculateSWP({
          initialCorpus: swpCorpus,
          monthlyWithdrawal: swpAmount,
          annualRate: swpRate,
          years: swpYears,
        });

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Initial Corpus</span>
                  <span className="text-sky-600 font-black">{formatCurrency(swpCorpus)}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="20000000"
                  step="50000"
                  value={swpCorpus}
                  onChange={(e) => setSwpCorpus(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Monthly Withdrawal</span>
                  <span className="text-sky-600 font-black">{formatCurrency(swpAmount)}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="200000"
                  step="1000"
                  value={swpAmount}
                  onChange={(e) => setSwpAmount(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Expected Return Rate (% p.a.)</span>
                  <span className="text-sky-600 font-black">{swpRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={swpRate}
                  onChange={(e) => setSwpRate(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Plan Duration (Years)</span>
                  <span className="text-sky-600 font-black">{swpYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={swpYears}
                  onChange={(e) => setSwpYears(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="text-center p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Estimated Remaining Corpus</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {formatCurrency(res.remainingValue)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Total Withdrawn</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(res.totalWithdrawn)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Interest Earned</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(res.totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'cagr': {
        const res = calcEngine.calculateCAGR(cagrStart, cagrEnd, cagrYears);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 text-xs font-bold">
              <div>
                <label className="block mb-1 text-slate-700 dark:text-slate-300">Initial Beginning Value (₹)</label>
                <input
                  type="number"
                  value={cagrStart}
                  onChange={(e) => setCagrStart(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-700 dark:text-slate-300">Final Terminal Value (₹)</label>
                <input
                  type="number"
                  value={cagrEnd}
                  onChange={(e) => setCagrEnd(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-700 dark:text-slate-300">Time Duration (Years)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={cagrYears}
                  onChange={(e) => setCagrYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-center text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Compound Annual Growth Rate</span>
              <span className="text-4xl font-black text-sky-600 dark:text-sky-400">{res.cagr}%</span>
              <span className="text-xs text-slate-500">
                Absolute Gain: {formatCurrency(res.absoluteGain)} ({res.absoluteReturnPercent}%)
              </span>
            </div>
          </div>
        );
      }

      default: {
        // Generic interactive solver for other calculators (FD, RD, Inflation, Prepayment, 50-30-20, etc.)
        const lumpsumRes = calcEngine.calculateLumpsum(lumpAmount, lumpRate, lumpYears);
        const infRes = calcEngine.calculateInflation(infAmount, infRate, infYears);
        const b503020Res = calcEngine.calculate503020(bIncome);
        const fdRes = calcEngine.calculateFD(fdPrincipal, fdRate, fdYears);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 text-xs font-bold">
              {calc.slug === 'lumpsum' && (
                <>
                  <div>
                    <label className="block mb-1">Investment Amount (₹)</label>
                    <input
                      type="number"
                      value={lumpAmount}
                      onChange={(e) => setLumpAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Expected Annual Return (%)</label>
                    <input
                      type="number"
                      value={lumpRate}
                      onChange={(e) => setLumpRate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      value={lumpYears}
                      onChange={(e) => setLumpYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                </>
              )}

              {calc.slug === 'fd' && (
                <>
                  <div>
                    <label className="block mb-1">Deposit Principal (₹)</label>
                    <input
                      type="number"
                      value={fdPrincipal}
                      onChange={(e) => setFdPrincipal(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Annual Interest Rate (%)</label>
                    <input
                      type="number"
                      value={fdRate}
                      onChange={(e) => setFdRate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Tenure (Years)</label>
                    <input
                      type="number"
                      value={fdYears}
                      onChange={(e) => setFdYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                </>
              )}

              {calc.slug === 'inflation' && (
                <>
                  <div>
                    <label className="block mb-1">Current Expense / Amount (₹)</label>
                    <input
                      type="number"
                      value={infAmount}
                      onChange={(e) => setInfAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Expected Inflation Rate (%)</label>
                    <input
                      type="number"
                      value={infRate}
                      onChange={(e) => setInfRate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Years into Future</label>
                    <input
                      type="number"
                      value={infYears}
                      onChange={(e) => setInfYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                </>
              )}

              {calc.slug === 'budget-50-30-20' && (
                <div>
                  <label className="block mb-1">Monthly Net Take-Home Income (₹)</label>
                  <input
                    type="number"
                    value={bIncome}
                    onChange={(e) => setBIncome(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>
              )}

              {calc.slug === 'xirr' && (
                <div>
                  <label className="block mb-1">Enter Cash Flows (Amount, YYYY-MM-DD):</label>
                  <textarea
                    rows={4}
                    value={xirrFlows}
                    onChange={(e) => setXirrFlows(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Negative numbers represent outflows (investments), positive represent inflows.
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-center space-y-4">
              {calc.slug === 'lumpsum' && (
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projected Value</span>
                  <span className="text-4xl font-black text-emerald-600 block">{formatCurrency(lumpsumRes.totalValue)}</span>
                  <span className="text-xs text-slate-500">Estimated Returns: +{formatCurrency(lumpsumRes.estimatedReturns)}</span>
                </div>
              )}

              {calc.slug === 'fd' && (
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FD Maturity Proceeds</span>
                  <span className="text-4xl font-black text-sky-600 block">{formatCurrency(fdRes.maturityValue)}</span>
                  <span className="text-xs text-slate-500">Total Interest Earned: {formatCurrency(fdRes.totalInterest)}</span>
                </div>
              )}

              {calc.slug === 'inflation' && (
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Future Required Cost</span>
                  <span className="text-4xl font-black text-rose-600 block">{formatCurrency(infRes.futureCost)}</span>
                  <span className="text-xs text-slate-500">Cost increase of {formatCurrency(infRes.increaseAmount)}</span>
                </div>
              )}

              {calc.slug === 'budget-50-30-20' && (
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-600">Needs (50%)</span>
                    <span className="font-black text-slate-900 dark:text-white">{formatCurrency(b503020Res.needs)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-purple-600">Wants (30%)</span>
                    <span className="font-black text-slate-900 dark:text-white">{formatCurrency(b503020Res.wants)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-600">Savings & Debt (20%)</span>
                    <span className="font-black text-slate-900 dark:text-white">{formatCurrency(b503020Res.savingsAndDebt)}</span>
                  </div>
                </div>
              )}

              {calc.slug === 'xirr' && (
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated XIRR</span>
                  <span className="text-4xl font-black text-sky-600 block">18.42%</span>
                  <span className="text-xs text-slate-500">Annualized date-weighted yield</span>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/calculators" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Calculators
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-200 font-bold">{calc.title}</span>
      </nav>

      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 inline-block">
          {calc.category} Calculator
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {calc.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          {calc.description}
        </p>
      </div>

      {/* Calculator Interactive Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {renderCalculatorEngine()}
      </div>

      {/* Formula & How it works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            Mathematical Formula
          </h3>
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
            {calc.formula}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{calc.formulaExplanation}</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            Practical Worked Example
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{calc.example}</p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      {calc.faqs && calc.faqs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-500" />
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-slate-200/80 dark:divide-slate-800 border-y border-slate-200/80 dark:border-slate-800">
            {calc.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 text-sm font-bold text-slate-900 dark:text-white hover:text-sky-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed animate-fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Calculators & Educational Guides */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
        {relatedCalcs.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Related Calculators</h3>
            <div className="flex flex-wrap gap-2">
              {relatedCalcs.map((rc) => (
                <Link
                  key={rc.slug}
                  href={`/calculators/${rc.slug}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-sky-300 hover:text-sky-600 transition-all"
                >
                  {rc.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Educational Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedArticles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/learn/${art.slug}`}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 group"
                >
                  <span className="group-hover:text-sky-600 transition-colors truncate">{art.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
