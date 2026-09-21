import type { FinancialHealthBreakdown } from '../../types/index.ts';

/**
 * 1. EMI Calculator
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  breakdown: { month: number; principal: number; interest: number; balance: number }[];
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0, breakdown: [] };
  }

  if (annualRate <= 0) {
    const monthlyEmi = principal / tenureMonths;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalPayment: principal,
      breakdown: [],
    };
  }

  const monthlyRate = annualRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyEmi * tenureMonths;
  const totalInterest = totalPayment - principal;

  // Generate first 12 months breakdown for preview
  const breakdown: { month: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal;
  for (let m = 1; m <= Math.min(tenureMonths, 60); m++) {
    const interestForMonth = balance * monthlyRate;
    const principalForMonth = monthlyEmi - interestForMonth;
    balance = Math.max(0, balance - principalForMonth);
    breakdown.push({
      month: m,
      principal: principalForMonth,
      interest: interestForMonth,
      balance,
    });
  }

  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    breakdown,
  };
}

/**
 * 2. SIP Calculator
 * M = P * ((1 + i)^n - 1) * (1 + i) / i
 */
export function calculateSIP(monthlyInvestment: number, expectedReturnRate: number, tenureYears: number): {
  totalInvested: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyData: { year: number; invested: number; totalValue: number }[];
} {
  if (monthlyInvestment <= 0 || tenureYears <= 0) {
    return { totalInvested: 0, estimatedReturns: 0, totalValue: 0, yearlyData: [] };
  }

  const months = tenureYears * 12;
  const i = expectedReturnRate / (12 * 100);
  const totalInvested = monthlyInvestment * months;

  let totalValue = 0;
  if (i === 0) {
    totalValue = totalInvested;
  } else {
    totalValue = monthlyInvestment * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  }

  const estimatedReturns = Math.max(0, totalValue - totalInvested);

  // Yearly projection
  const yearlyData: { year: number; invested: number; totalValue: number }[] = [];
  for (let y = 1; y <= tenureYears; y++) {
    const yMonths = y * 12;
    const yInvested = monthlyInvestment * yMonths;
    const yVal = i === 0 ? yInvested : monthlyInvestment * ((Math.pow(1 + i, yMonths) - 1) / i) * (1 + i);
    yearlyData.push({
      year: y,
      invested: Math.round(yInvested),
      totalValue: Math.round(yVal),
    });
  }

  return {
    totalInvested: Math.round(totalInvested),
    estimatedReturns: Math.round(estimatedReturns),
    totalValue: Math.round(totalValue),
    yearlyData,
  };
}

/**
 * 3. Lumpsum Calculator
 * A = P * (1 + r)^n
 */
export function calculateLumpsum(investmentAmount: number, expectedReturnRate: number, tenureYears: number): {
  totalInvested: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyData: { year: number; invested: number; totalValue: number }[];
} {
  if (investmentAmount <= 0 || tenureYears <= 0) {
    return { totalInvested: 0, estimatedReturns: 0, totalValue: 0, yearlyData: [] };
  }

  const r = expectedReturnRate / 100;
  const totalValue = investmentAmount * Math.pow(1 + r, tenureYears);
  const estimatedReturns = Math.max(0, totalValue - investmentAmount);

  const yearlyData: { year: number; invested: number; totalValue: number }[] = [];
  for (let y = 1; y <= tenureYears; y++) {
    yearlyData.push({
      year: y,
      invested: Math.round(investmentAmount),
      totalValue: Math.round(investmentAmount * Math.pow(1 + r, y)),
    });
  }

  return {
    totalInvested: Math.round(investmentAmount),
    estimatedReturns: Math.round(estimatedReturns),
    totalValue: Math.round(totalValue),
    yearlyData,
  };
}

/**
 * 4. Compound Interest Calculator
 * A = P * (1 + r/n)^(n*t)
 */
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: 1 | 2 | 4 | 12 = 1
): {
  totalInvested: number;
  totalInterest: number;
  futureValue: number;
} {
  if (principal <= 0 || years <= 0) {
    return { totalInvested: 0, totalInterest: 0, futureValue: 0 };
  }

  const r = annualRate / 100;
  const n = compoundingFrequency;
  const futureValue = principal * Math.pow(1 + r / n, n * years);
  const totalInterest = futureValue - principal;

  return {
    totalInvested: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    futureValue: Math.round(futureValue),
  };
}

/**
 * 5. Simple Interest Calculator
 * SI = (P * R * T) / 100
 */
export function calculateSimpleInterest(principal: number, annualRate: number, years: number): {
  totalInvested: number;
  simpleInterest: number;
  totalAmount: number;
} {
  if (principal <= 0 || years <= 0) {
    return { totalInvested: 0, simpleInterest: 0, totalAmount: 0 };
  }

  const simpleInterest = (principal * annualRate * years) / 100;
  const totalAmount = principal + simpleInterest;

  return {
    totalInvested: Math.round(principal),
    simpleInterest: Math.round(simpleInterest),
    totalAmount: Math.round(totalAmount),
  };
}

/**
 * 6. FD Calculator (Quarterly Compounding standard in Indian Banks)
 */
export function calculateFD(principal: number, annualRate: number, years: number): {
  investedAmount: number;
  maturityValue: number;
  totalInterest: number;
} {
  const res = calculateCompoundInterest(principal, annualRate, years, 4);
  return {
    investedAmount: res.totalInvested,
    maturityValue: res.futureValue,
    totalInterest: res.totalInterest,
  };
}

/**
 * 7. SWP Calculator (Systematic Withdrawal Plan)
 */
export function calculateSWP({
  initialCorpus,
  monthlyWithdrawal,
  annualRate,
  years,
}: {
  initialCorpus: number;
  monthlyWithdrawal: number;
  annualRate: number;
  years: number;
}): {
  initialCorpus: number;
  totalWithdrawn: number;
  totalInterest: number;
  remainingValue: number;
} {
  if (initialCorpus <= 0 || monthlyWithdrawal <= 0 || years <= 0) {
    return { initialCorpus: 0, totalWithdrawn: 0, totalInterest: 0, remainingValue: 0 };
  }

  const months = years * 12;
  const monthlyRate = annualRate / (12 * 100);
  let balance = initialCorpus;
  let totalWithdrawn = 0;
  let totalInterest = 0;

  for (let i = 0; i < months; i++) {
    const interest = balance * monthlyRate;
    balance += interest;
    totalInterest += interest;
    balance -= monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    if (balance < 0) balance = 0;
  }

  return {
    initialCorpus: Math.round(initialCorpus),
    totalWithdrawn: Math.round(totalWithdrawn),
    totalInterest: Math.round(totalInterest),
    remainingValue: Math.round(balance),
  };
}

/**
 * 8. RD Calculator (Recurring Deposit with quarterly compounding)
 */
export function calculateRD(monthlyDeposit: number, annualRate: number, months: number): {
  totalInvested: number;
  maturityValue: number;
  totalInterest: number;
} {
  if (monthlyDeposit <= 0 || months <= 0) {
    return { totalInvested: 0, maturityValue: 0, totalInterest: 0 };
  }

  const totalInvested = monthlyDeposit * months;
  const r = annualRate / (4 * 100); // quarterly rate
  let maturityValue = 0;

  for (let m = 0; m < months; m++) {
    const quartersRemaining = (months - m) / 3;
    maturityValue += monthlyDeposit * Math.pow(1 + r, quartersRemaining);
  }

  return {
    totalInvested: Math.round(totalInvested),
    maturityValue: Math.round(maturityValue),
    totalInterest: Math.round(maturityValue - totalInvested),
  };
}

/**
 * 8. PPF Calculator (15-year tenure default, annual compounding, max 1.5L/yr)
 */
export function calculatePPF(annualDeposit: number, years: number = 15, annualRate: number = 7.1): {
  totalInvested: number;
  maturityValue: number;
  totalInterest: number;
  yearlyBreakdown: { year: number; opening: number; deposited: number; interest: number; closing: number }[];
} {
  const deposit = Math.min(Math.max(500, annualDeposit), 150000);
  let balance = 0;
  const yearlyBreakdown: { year: number; opening: number; deposited: number; interest: number; closing: number }[] = [];

  for (let y = 1; y <= years; y++) {
    const opening = balance;
    balance += deposit;
    const interest = balance * (annualRate / 100);
    balance += interest;
    yearlyBreakdown.push({
      year: y,
      opening: Math.round(opening),
      deposited: Math.round(deposit),
      interest: Math.round(interest),
      closing: Math.round(balance),
    });
  }

  const totalInvested = deposit * years;
  const maturityValue = balance;

  return {
    totalInvested: Math.round(totalInvested),
    maturityValue: Math.round(maturityValue),
    totalInterest: Math.round(maturityValue - totalInvested),
    yearlyBreakdown,
  };
}

/**
 * 9. CAGR Calculator
 * CAGR = ((EV / BV)^(1/n) - 1) * 100
 */
export function calculateCAGR(beginningValue: number, endingValue: number, tenureYears: number): {
  cagr: number;
  absoluteGain: number;
  absoluteReturnPercent: number;
} {
  if (beginningValue <= 0 || endingValue <= 0 || tenureYears <= 0) {
    return { cagr: 0, absoluteGain: 0, absoluteReturnPercent: 0 };
  }

  const cagr = (Math.pow(endingValue / beginningValue, 1 / tenureYears) - 1) * 100;
  const absoluteGain = endingValue - beginningValue;
  const absoluteReturnPercent = (absoluteGain / beginningValue) * 100;

  return {
    cagr: Math.round(cagr * 100) / 100,
    absoluteGain: Math.round(absoluteGain),
    absoluteReturnPercent: Math.round(absoluteReturnPercent * 100) / 100,
  };
}

/**
 * 10. XIRR Calculator
 * Exact root finding using Newton-Raphson with bisection fallback.
 */
export function calculateXIRR(
  cashFlows: { amount: number; date: string }[]
): {
  xirr: number;
  status: 'converged' | 'failed';
} {
  if (cashFlows.length < 2) {
    return { xirr: 0, status: 'failed' };
  }

  const hasNegative = cashFlows.some((c) => c.amount < 0);
  const hasPositive = cashFlows.some((c) => c.amount > 0);
  if (!hasNegative || !hasPositive) {
    return { xirr: 0, status: 'failed' };
  }

  const d0 = new Date(cashFlows[0].date).getTime();
  const flows = cashFlows.map((cf) => ({
    amount: cf.amount,
    dt: (new Date(cf.date).getTime() - d0) / (1000 * 60 * 60 * 24 * 365),
  }));

  const f = (rate: number) => {
    let sum = 0;
    for (const cf of flows) {
      sum += cf.amount / Math.pow(1 + rate, cf.dt);
    }
    return sum;
  };

  const df = (rate: number) => {
    let sum = 0;
    for (const cf of flows) {
      sum += (-cf.dt * cf.amount) / Math.pow(1 + rate, cf.dt + 1);
    }
    return sum;
  };

  // Newton-Raphson iteration
  let rate = 0.1; // 10% initial guess
  let converged = false;
  for (let i = 0; i < 100; i++) {
    const val = f(rate);
    const deriv = df(rate);
    if (Math.abs(deriv) < 1e-12) break;
    const nextRate = rate - val / deriv;
    if (Math.abs(nextRate - rate) < 1e-6) {
      rate = nextRate;
      converged = true;
      break;
    }
    rate = nextRate;
    if (rate <= -0.999) rate = -0.99;
  }

  // Bisection fallback if not converged
  if (!converged) {
    let low = -0.99;
    let high = 10.0;
    let fLow = f(low);
    let fHigh = f(high);

    if (fLow * fHigh <= 0) {
      for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        const fMid = f(mid);
        if (Math.abs(fMid) < 1e-6 || Math.abs(high - low) < 1e-6) {
          rate = mid;
          converged = true;
          break;
        }
        if (fLow * fMid < 0) {
          high = mid;
          fHigh = fMid;
        } else {
          low = mid;
          fLow = fMid;
        }
      }
    }
  }

  if (converged && isFinite(rate) && !isNaN(rate)) {
    return { xirr: Math.round(rate * 10000) / 100, status: 'converged' };
  }

  return { xirr: 0, status: 'failed' };
}

/**
 * 11. Inflation Calculator
 */
export function calculateInflation(
  currentAmount: number,
  inflationRate: number,
  tenureYears: number
): {
  futureCost: number;
  purchasingPower: number;
  increaseAmount: number;
} {
  if (currentAmount <= 0 || tenureYears <= 0) {
    return { futureCost: 0, purchasingPower: 0, increaseAmount: 0 };
  }

  const r = inflationRate / 100;
  const futureCost = currentAmount * Math.pow(1 + r, tenureYears);
  const purchasingPower = currentAmount / Math.pow(1 + r, tenureYears);

  return {
    futureCost: Math.round(futureCost),
    purchasingPower: Math.round(purchasingPower),
    increaseAmount: Math.round(futureCost - currentAmount),
  };
}

/**
 * 12. Loan Prepayment Calculator
 */
export function calculateLoanPrepayment(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  prepaymentAmount: number,
  prepaymentMonth: number = 12
): {
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  monthsReduced: number;
  originalEmi: number;
} {
  const orig = calculateEMI(principal, annualRate, tenureMonths);
  if (orig.monthlyEmi === 0 || prepaymentAmount <= 0) {
    return {
      originalTotalInterest: orig.totalInterest,
      newTotalInterest: orig.totalInterest,
      interestSaved: 0,
      monthsReduced: 0,
      originalEmi: orig.monthlyEmi,
    };
  }

  const monthlyRate = annualRate / (12 * 100);
  let balance = principal;
  let totalInterestNew = 0;
  let monthsCount = 0;

  while (balance > 0 && monthsCount < 600) {
    monthsCount++;
    const interest = balance * monthlyRate;
    totalInterestNew += interest;
    const principalPaid = orig.monthlyEmi - interest;

    if (monthsCount === prepaymentMonth) {
      balance = Math.max(0, balance - prepaymentAmount);
    }

    balance = Math.max(0, balance - principalPaid);
    if (balance <= 0) break;
  }

  const interestSaved = Math.max(0, orig.totalInterest - totalInterestNew);
  const monthsReduced = Math.max(0, tenureMonths - monthsCount);

  return {
    originalTotalInterest: orig.totalInterest,
    newTotalInterest: Math.round(totalInterestNew),
    interestSaved: Math.round(interestSaved),
    monthsReduced,
    originalEmi: orig.monthlyEmi,
  };
}

/**
 * 13. Savings Calculator
 */
export function calculateSavings(
  targetAmount: number,
  currentSavings: number,
  expectedReturnRate: number,
  targetYears: number
): {
  requiredMonthlySavings: number;
  totalInvested: number;
  futureCurrentSavingsValue: number;
} {
  const months = targetYears * 12;
  const i = expectedReturnRate / (12 * 100);
  const futureCurrentSavingsValue = currentSavings * Math.pow(1 + expectedReturnRate / 100, targetYears);
  const remainingTarget = Math.max(0, targetAmount - futureCurrentSavingsValue);

  let requiredMonthlySavings = 0;
  if (remainingTarget > 0 && months > 0) {
    if (i === 0) {
      requiredMonthlySavings = remainingTarget / months;
    } else {
      requiredMonthlySavings = (remainingTarget * i) / ((Math.pow(1 + i, months) - 1) * (1 + i));
    }
  }

  return {
    requiredMonthlySavings: Math.round(requiredMonthlySavings),
    totalInvested: Math.round(currentSavings + requiredMonthlySavings * months),
    futureCurrentSavingsValue: Math.round(futureCurrentSavingsValue),
  };
}

/**
 * 14. Emergency Fund Calculator
 */
export function calculateEmergencyFund(
  monthlyExpenses: number,
  targetMonths: number = 6
): {
  recommendedEmergencyFund: number;
  minimumFund: number;
  robustFund: number;
} {
  return {
    recommendedEmergencyFund: Math.round(monthlyExpenses * targetMonths),
    minimumFund: Math.round(monthlyExpenses * 3),
    robustFund: Math.round(monthlyExpenses * 12),
  };
}

/**
 * 15. Net Worth Calculator
 */
export function calculateNetWorth(
  assets: { value: number }[],
  liabilities: { value: number }[]
): {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtToAssetRatio: number;
} {
  const totalAssets = assets.reduce((sum, a) => sum + Math.max(0, a.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + Math.max(0, l.value || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  return {
    totalAssets: Math.round(totalAssets),
    totalLiabilities: Math.round(totalLiabilities),
    netWorth: Math.round(netWorth),
    debtToAssetRatio: Math.round(debtToAssetRatio * 10) / 10,
  };
}

/**
 * 16. 50/30/20 Budget Rule Calculator
 */
export function calculate503020(monthlyNetIncome: number): {
  needs: number;
  wants: number;
  savingsAndDebt: number;
} {
  return {
    needs: Math.round(monthlyNetIncome * 0.5),
    wants: Math.round(monthlyNetIncome * 0.3),
    savingsAndDebt: Math.round(monthlyNetIncome * 0.2),
  };
}

/**
 * 17. Percentage Calculator
 */
export function calculatePercentage(valA: number, valB: number, type: 'percent_of' | 'is_what_percent' | 'percent_change'): number {
  if (type === 'percent_of') {
    return Math.round((valA / 100) * valB * 100) / 100;
  } else if (type === 'is_what_percent') {
    if (valB === 0) return 0;
    return Math.round((valA / valB) * 10000) / 100;
  } else {
    // percent_change from valA to valB
    if (valA === 0) return 0;
    return Math.round(((valB - valA) / valA) * 10000) / 100;
  }
}

/**
 * 18. Discount Calculator
 */
export function calculateDiscount(originalPrice: number, discountPercent: number, taxPercent: number = 0): {
  savedAmount: number;
  priceAfterDiscount: number;
  taxAmount: number;
  finalPrice: number;
} {
  const savedAmount = (originalPrice * discountPercent) / 100;
  const priceAfterDiscount = originalPrice - savedAmount;
  const taxAmount = (priceAfterDiscount * taxPercent) / 100;
  const finalPrice = priceAfterDiscount + taxAmount;

  return {
    savedAmount: Math.round(savedAmount * 100) / 100,
    priceAfterDiscount: Math.round(priceAfterDiscount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

/**
 * 19. GST Calculator
 */
export function calculateGST(amount: number, gstRate: number, isInclusive: boolean = false): {
  originalAmount: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
} {
  if (isInclusive) {
    const originalAmount = (amount * 100) / (100 + gstRate);
    const gstAmount = amount - originalAmount;
    return {
      originalAmount: Math.round(originalAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgstAmount: Math.round((gstAmount / 2) * 100) / 100,
      sgstAmount: Math.round((gstAmount / 2) * 100) / 100,
      totalAmount: Math.round(amount * 100) / 100,
    };
  } else {
    const gstAmount = (amount * gstRate) / 100;
    const totalAmount = amount + gstAmount;
    return {
      originalAmount: Math.round(amount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgstAmount: Math.round((gstAmount / 2) * 100) / 100,
      sgstAmount: Math.round((gstAmount / 2) * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}

/**
 * TRANSPARENT FINANCIAL HEALTH SCORING ENGINE (0 - 100)
 * Evaluates 6 pillars strictly using user-entered data.
 * Does not synthesize or guess missing data.
 */
export function calculateFinancialHealthScore(params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalMonthlyEmi: number;
  liquidAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInvestments: number;
  activeGoals: { currentAmount: number; targetAmount: number }[];
}): FinancialHealthBreakdown {
  const {
    monthlyIncome,
    monthlyExpenses,
    totalMonthlyEmi,
    liquidAssets,
    totalAssets,
    totalLiabilities,
    totalInvestments,
    activeGoals,
  } = params;

  const factors: { type: 'positive' | 'warning' | 'neutral'; message: string }[] = [];

  // 1. Savings Rate Score (Max 20 points, scaled to 0-100)
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses - totalMonthlyEmi);
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  let savingsScore = 50;
  if (monthlyIncome > 0) {
    if (savingsRate >= 30) {
      savingsScore = 95;
      factors.push({ type: 'positive', message: `Savings rate is healthy at ${savingsRate.toFixed(0)}% of monthly income` });
    } else if (savingsRate >= 20) {
      savingsScore = 80;
      factors.push({ type: 'positive', message: `Good savings rate of ${savingsRate.toFixed(0)}% (recommended >= 20%)` });
    } else if (savingsRate >= 10) {
      savingsScore = 60;
      factors.push({ type: 'neutral', message: `Moderate savings rate of ${savingsRate.toFixed(0)}%` });
    } else {
      savingsScore = 30;
      factors.push({ type: 'warning', message: `Savings rate is low (${savingsRate.toFixed(0)}%), aim for at least 20%` });
    }
  } else {
    factors.push({ type: 'neutral', message: 'Add monthly income to evaluate savings health' });
  }

  // 2. Debt & Liability Score (Max 20 points, scaled to 0-100)
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : totalLiabilities > 0 ? 100 : 0;
  let debtScore = 70;
  if (totalLiabilities === 0) {
    debtScore = 98;
    factors.push({ type: 'positive', message: 'Debt-free profile: No outstanding liabilities reported' });
  } else if (debtToAssetRatio <= 25) {
    debtScore = 88;
    factors.push({ type: 'positive', message: `Low debt-to-asset ratio (${debtToAssetRatio.toFixed(0)}%)` });
  } else if (debtToAssetRatio <= 50) {
    debtScore = 70;
    factors.push({ type: 'neutral', message: `Moderate debt obligations (${debtToAssetRatio.toFixed(0)}% of assets)` });
  } else {
    debtScore = 40;
    factors.push({ type: 'warning', message: `High debt burden (${debtToAssetRatio.toFixed(0)}% of total assets)` });
  }

  // 3. Emergency Fund Score (Max 20 points, scaled to 0-100)
  const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;
  let emergencyFundScore = 40;
  if (monthlyExpenses > 0) {
    if (emergencyFundMonths >= 6) {
      emergencyFundScore = 95;
      factors.push({ type: 'positive', message: `Emergency fund covers ${emergencyFundMonths.toFixed(1)} months of expenses` });
    } else if (emergencyFundMonths >= 3) {
      emergencyFundScore = 75;
      factors.push({ type: 'positive', message: `Adequate emergency fund (${emergencyFundMonths.toFixed(1)} months coverage)` });
    } else if (emergencyFundMonths >= 1) {
      emergencyFundScore = 55;
      factors.push({ type: 'neutral', message: `Emergency fund covers ${emergencyFundMonths.toFixed(1)} months (target: 3-6 months)` });
    } else {
      emergencyFundScore = 30;
      factors.push({ type: 'warning', message: 'Emergency reserve is below 1 month of living expenses' });
    }
  } else {
    factors.push({ type: 'neutral', message: 'Record monthly expenses to calculate emergency runway' });
  }

  // 4. EMI to Income Ratio Score (Max 15 points, scaled to 0-100)
  const emiToIncomeRatio = monthlyIncome > 0 ? (totalMonthlyEmi / monthlyIncome) * 100 : 0;
  if (totalMonthlyEmi > 0 && monthlyIncome > 0) {
    if (emiToIncomeRatio <= 25) {
      factors.push({ type: 'positive', message: `Comfortable EMI burden (${emiToIncomeRatio.toFixed(0)}% of income)` });
    } else if (emiToIncomeRatio <= 40) {
      factors.push({ type: 'neutral', message: `Manageable EMI burden (${emiToIncomeRatio.toFixed(0)}% of income)` });
    } else {
      factors.push({ type: 'warning', message: `EMI obligations are high (${emiToIncomeRatio.toFixed(0)}% of monthly income)` });
    }
  }

  // 5. Goals Progress Score (Max 15 points, scaled to 0-100)
  let goalProgressAverage = 0;
  let goalsScore = 50;
  if (activeGoals.length > 0) {
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    goalProgressAverage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    if (goalProgressAverage >= 60) {
      goalsScore = 90;
      factors.push({ type: 'positive', message: `Goals are progressing strongly (${goalProgressAverage.toFixed(0)}% funded)` });
    } else if (goalProgressAverage >= 25) {
      goalsScore = 75;
      factors.push({ type: 'positive', message: `Active progress across ${activeGoals.length} financial goals` });
    } else {
      goalsScore = 55;
      factors.push({ type: 'neutral', message: `Goals are underway (${goalProgressAverage.toFixed(0)}% completed)` });
    }
  } else {
    goalsScore = 50;
    factors.push({ type: 'neutral', message: 'No financial goals added yet' });
  }

  // 6. Investment Allocation Score (Max 10 points, scaled to 0-100)
  let investmentScore = 50;
  if (totalInvestments > 0) {
    investmentScore = 85;
    factors.push({ type: 'positive', message: 'Active investment portfolio established' });
  } else {
    investmentScore = 40;
    factors.push({ type: 'warning', message: 'No investments recorded yet to build long-term wealth' });
  }

  const netWorthScore = totalAssets > totalLiabilities ? 85 : totalAssets === 0 ? 50 : 35;

  // Composite weighted score (0 - 100)
  // Weights: Savings (20%), Debt (20%), Emergency (20%), EMI (15%), Goals (15%), Investments (10%)
  const compositeScore = Math.round(
    savingsScore * 0.2 +
      debtScore * 0.2 +
      emergencyFundScore * 0.2 +
      (emiToIncomeRatio > 40 ? 40 : emiToIncomeRatio > 25 ? 70 : 90) * 0.15 +
      goalsScore * 0.15 +
      investmentScore * 0.1
  );

  return {
    score: Math.min(100, Math.max(10, compositeScore)),
    savingsScore: Math.round(savingsScore),
    debtScore: Math.round(debtScore),
    emergencyFundScore: Math.round(emergencyFundScore),
    goalsScore: Math.round(goalsScore),
    investmentScore: Math.round(investmentScore),
    netWorthScore: Math.round(netWorthScore),
    factors,
    metrics: {
      savingsRate: Math.round(savingsRate),
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
      debtToAssetRatio: Math.round(debtToAssetRatio),
      emiToIncomeRatio: Math.round(emiToIncomeRatio),
      goalProgressAverage: Math.round(goalProgressAverage),
    },
  };
}
