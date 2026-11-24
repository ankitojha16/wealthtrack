import type {
  Transaction,
  CategoryBudget,
  Investment,
  Goal,
  Loan,
  Asset,
  MonthlySnapshot,
} from '../../types/index.ts';

export function generateSampleDataset(): {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  investments: Investment[];
  goals: Goal[];
  loans: Loan[];
  assets: Asset[];
  snapshots: MonthlySnapshot[];
} {
  const now = Date.now();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentMonthYear = `${currentYear}-${currentMonth}`;

  // Helper for generating relative dates in current month
  const dayDate = (day: number) => {
    const d = String(Math.min(28, Math.max(1, day))).padStart(2, '0');
    return `${currentMonthYear}-${d}`;
  };

  const transactions: Transaction[] = [
    {
      id: `sample_tx_1`,
      type: 'income',
      amount: 145000,
      category: 'Salary',
      description: 'Monthly corporate salary credit',
      date: dayDate(1),
      createdAt: now - 86400000 * 20,
      updatedAt: now - 86400000 * 20,
    },
    {
      id: `sample_tx_2`,
      type: 'income',
      amount: 18500,
      category: 'Freelance',
      description: 'Consulting milestone payout',
      date: dayDate(12),
      createdAt: now - 86400000 * 10,
      updatedAt: now - 86400000 * 10,
    },
    {
      id: `sample_tx_3`,
      type: 'income',
      amount: 3200,
      category: 'Investments',
      description: 'Quarterly dividend payout',
      date: dayDate(20),
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
    },
    {
      id: `sample_tx_4`,
      type: 'expense',
      amount: 32000,
      category: 'Housing',
      description: 'Apartment rent & society maintenance',
      date: dayDate(2),
      createdAt: now - 86400000 * 19,
      updatedAt: now - 86400000 * 19,
    },
    {
      id: `sample_tx_5`,
      type: 'expense',
      amount: 14200,
      category: 'Food',
      description: 'Monthly supermarket & grocery bulk purchase',
      date: dayDate(5),
      createdAt: now - 86400000 * 16,
      updatedAt: now - 86400000 * 16,
    },
    {
      id: `sample_tx_6`,
      type: 'expense',
      amount: 4800,
      category: 'Food',
      description: 'Weekend dining out & cafe visits',
      date: dayDate(11),
      createdAt: now - 86400000 * 11,
      updatedAt: now - 86400000 * 11,
    },
    {
      id: `sample_tx_7`,
      type: 'expense',
      amount: 6500,
      category: 'Bills',
      description: 'Electricity, fiber broadband, & mobile recharge',
      date: dayDate(7),
      createdAt: now - 86400000 * 14,
      updatedAt: now - 86400000 * 14,
    },
    {
      id: `sample_tx_8`,
      type: 'expense',
      amount: 5200,
      category: 'Transport',
      description: 'Vehicle fuel and metro transit card',
      date: dayDate(9),
      createdAt: now - 86400000 * 12,
      updatedAt: now - 86400000 * 12,
    },
    {
      id: `sample_tx_9`,
      type: 'expense',
      amount: 7800,
      category: 'Shopping',
      description: 'Clothing and home essentials',
      date: dayDate(15),
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000 * 7,
    },
    {
      id: `sample_tx_10`,
      type: 'expense',
      amount: 3500,
      category: 'Entertainment',
      description: 'Streaming services & weekend cinema tickets',
      date: dayDate(18),
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 4,
    },
    {
      id: `sample_tx_11`,
      type: 'expense',
      amount: 4200,
      category: 'Healthcare',
      description: 'Pharmacy & routine wellness checkup',
      date: dayDate(22),
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    },
  ];

  const budgets: CategoryBudget[] = [
    { id: 'sample_b_housing', category: 'Housing', monthlyLimit: 35000, spent: 32000 },
    { id: 'sample_b_food', category: 'Food', monthlyLimit: 22000, spent: 19000 },
    { id: 'sample_b_bills', category: 'Bills', monthlyLimit: 8000, spent: 6500 },
    { id: 'sample_b_transport', category: 'Transport', monthlyLimit: 7500, spent: 5200 },
    { id: 'sample_b_shopping', category: 'Shopping', monthlyLimit: 12000, spent: 7800 },
    { id: 'sample_b_entertainment', category: 'Entertainment', monthlyLimit: 5000, spent: 3500 },
    { id: 'sample_b_healthcare', category: 'Healthcare', monthlyLimit: 6000, spent: 4200 },
  ];

  const investments: Investment[] = [
    {
      id: 'sample_inv_1',
      name: 'UTI Nifty 50 Index Fund Direct Growth',
      type: 'SIP',
      investedAmount: 240000,
      currentValue: 312000,
      lastUpdatedAt: new Date(now - 86400000).toISOString(),
      createdAt: now - 86400000 * 180,
      notes: 'Core passive equity index fund (Nifty 50)',
    },
    {
      id: 'sample_inv_2',
      name: 'Parag Parikh Flexi Cap Fund Direct',
      type: 'SIP',
      investedAmount: 180000,
      currentValue: 248000,
      lastUpdatedAt: new Date(now - 86400000 * 2).toISOString(),
      createdAt: now - 86400000 * 150,
      notes: 'Diversified multi-cap mutual fund',
    },
    {
      id: 'sample_inv_3',
      name: 'Public Provident Fund (SBI)',
      type: 'PPF',
      investedAmount: 350000,
      currentValue: 418000,
      lastUpdatedAt: new Date(now - 86400000 * 5).toISOString(),
      createdAt: now - 86400000 * 365,
      notes: 'Sovereign risk-free long-term compounding',
    },
    {
      id: 'sample_inv_4',
      name: 'Sovereign Gold Bonds (SGB 2026)',
      type: 'Gold',
      investedAmount: 125000,
      currentValue: 182000,
      lastUpdatedAt: new Date(now - 86400000 * 3).toISOString(),
      createdAt: now - 86400000 * 240,
      notes: 'Gold hedge with 2.5% p.a. sovereign interest',
    },
    {
      id: 'sample_inv_5',
      name: 'HDFC High-Yield Fixed Deposit',
      type: 'FD',
      investedAmount: 200000,
      currentValue: 224000,
      lastUpdatedAt: new Date(now - 86400000 * 4).toISOString(),
      createdAt: now - 86400000 * 200,
      notes: '7.4% p.a. liquid emergency buffer',
    },
  ];

  const goals: Goal[] = [
    {
      id: 'sample_goal_1',
      name: '6-Month Emergency Fund',
      category: 'Emergency Fund',
      targetAmount: 450000,
      currentAmount: 360000,
      targetDate: `${currentYear + 1}-03-31`,
      monthlyContribution: 15000,
      createdAt: now - 86400000 * 120,
      updatedAt: now - 86400000 * 2,
    },
    {
      id: 'sample_goal_2',
      name: 'Dream Home Downpayment',
      category: 'Home',
      targetAmount: 2000000,
      currentAmount: 950000,
      targetDate: `${currentYear + 3}-12-31`,
      monthlyContribution: 30000,
      createdAt: now - 86400000 * 150,
      updatedAt: now - 86400000 * 5,
    },
    {
      id: 'sample_goal_3',
      name: 'Japan & Alps Autumn Vacation',
      category: 'Travel',
      targetAmount: 300000,
      currentAmount: 195000,
      targetDate: `${currentYear + 1}-10-15`,
      monthlyContribution: 10000,
      createdAt: now - 86400000 * 90,
      updatedAt: now - 86400000 * 1,
    },
  ];

  const loans: Loan[] = [
    {
      id: 'sample_loan_1',
      name: 'Electric Car Loan (Tata EV)',
      type: 'Car Loan',
      outstandingAmount: 640000,
      monthlyEmi: 19560,
      emisRemaining: 42,
      interestRate: 8.65,
      createdAt: now - 86400000 * 300,
      updatedAt: now - 86400000 * 10,
    },
  ];

  const assets: Asset[] = [
    {
      id: 'sample_asset_1',
      name: 'High-Yield Savings Balance',
      category: 'Financial',
      subcategory: 'Bank Accounts',
      estimatedValue: 135000,
      lastUpdatedAt: new Date(now - 86400000).toISOString(),
      createdAt: now - 86400000 * 180,
    },
    {
      id: 'sample_asset_2',
      name: 'EPF (Employee Provident Fund)',
      category: 'Financial',
      subcategory: 'Retirement',
      estimatedValue: 480000,
      lastUpdatedAt: new Date(now - 86400000 * 30).toISOString(),
      createdAt: now - 86400000 * 365,
    },
  ];

  // 6 months historical snapshots for net worth trend curve
  const snapshots: MonthlySnapshot[] = [];
  const baseNetWorth = 1680000;
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentDate.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const label = `${yr}-${mo}`;
    const growth = (5 - i) * 62000;
    const netWorth = baseNetWorth + growth;

    snapshots.push({
      id: `sample_snap_${label}`,
      monthYear: label,
      netWorth,
      totalAssets: netWorth + 640000,
      totalLiabilities: 640000 - (5 - i) * 15000,
      totalInvestments: 1095000,
      totalInvestmentsValue: 1384000,
      totalLoans: 640000 - (5 - i) * 15000,
      income: 166700,
      expenses: 78200,
      savings: 88500,
      timestamp: new Date(yr, d.getMonth(), 28).getTime(),
    });
  }

  return {
    transactions,
    budgets,
    investments,
    goals,
    loans,
    assets,
    snapshots,
  };
}
