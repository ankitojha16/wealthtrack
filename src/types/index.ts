export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Housing'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Travel'
  | 'Other'
  | string;

export type IncomeCategory =
  | 'Salary'
  | 'Business'
  | 'Freelance'
  | 'Investments'
  | 'Rental'
  | 'Gifts'
  | 'Other'
  | string;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  // Legacy fields — kept for backward compat with stored data, but not shown in forms
  paymentMethod?: string;
  isRecurring?: boolean;
}

export interface CategoryBudget {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
}

export type InvestmentType =
  | 'SIP'
  | 'Lumpsum'
  | 'FD'
  | 'Stocks'
  // Legacy aliases — kept so existing stored records remain readable
  | 'Mutual Fund'
  | 'Fixed Deposit'
  | 'Recurring Deposit'
  | 'PPF'
  | 'EPF'
  | 'NPS'
  | 'Gold'
  | 'Bonds'
  | 'Other'
  | 'Fixed Deposit (FD)'
  | 'RD'
  | 'Cash'
  | 'Other Investment';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  lastUpdatedAt: string; // ISO date string or formatted date
  createdAt: number;

  // Optional — legacy fields kept for backward compat
  investmentDate?: string; // YYYY-MM-DD
  maturityDate?: string;
  interestRate?: number;
  notes?: string;

  // Stock-specific fields (for live API integration & holding management)
  symbol?: string;
  exchange?: string;
  quantity?: number;
  purchasePrice?: number;
  brokerage?: number;
  currentPrice?: number;
  priceSource?: 'manual' | 'api';
  apiProvider?: string;
  apiLastUpdated?: string;
  apiStatus?: 'success' | 'failed' | 'unavailable';
}

export type GoalCategory =
  | 'Emergency Fund'
  | 'Education'
  | 'Travel'
  | 'Vehicle'
  | 'Home'
  | 'Retirement'
  | 'Personal'
  | 'Custom'
  // Legacy aliases — kept for backward compat
  | 'Laptop/Electronics'
  | 'Wedding'
  | 'Laptop'
  | 'Custom Goal'
  | 'Personal Goal';

export interface GoalContribution {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  linkedInvestmentIds?: string[]; // IDs of investments linked to this goal
  contributionHistory?: GoalContribution[];
  // Legacy optional fields — kept for backward compat
  description?: string;
  essentialMonthlyExpenses?: number;
  targetMonths?: number;
  createdAt: number;
  updatedAt: number;
}

export type LoanType =
  | 'Personal Loan'
  | 'Home Loan'
  | 'Car Loan'
  | 'Education Loan'
  | 'Other';

export interface Loan {
  id: string;
  name: string;
  type: LoanType;
  outstandingAmount: number;
  monthlyEmi: number;
  emisRemaining: number;
  interestRate?: number; // annual percentage — optional
  createdAt: number;
  updatedAt: number;
  // Legacy fields — kept for backward compat
  originalAmount?: number;
  nextEmiDate?: string;
  notes?: string;
}

export type AssetCategory = 'Financial' | 'Physical';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subcategory: string;
  estimatedValue: number;
  notes?: string;
  lastUpdatedAt: string;
  createdAt: number;
}

export interface Liability {
  id: string;
  name: string;
  category: string;
  amount: number;
  monthlyPayment?: number;
  notes?: string;
  lastUpdatedAt: string;
  createdAt: number;
}

export interface MonthlySnapshot {
  id: string;
  monthYear: string; // YYYY-MM
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInvestments: number;
  totalInvestmentsValue: number;
  totalLoans: number;
  income: number;
  expenses: number;
  savings: number;
  timestamp: number;
}

export interface UserSettings {
  currency: string; // 'INR', 'USD', 'EUR', 'GBP'
  currencySymbol: string; // '₹', '$', '€', '£'
  numberFormat: 'indian' | 'international';
  theme: 'light' | 'dark' | 'system';
  accentColor: 'sky' | 'violet' | 'emerald' | 'rose';
  supportEmail: string;
}

export interface FinancialHealthBreakdown {
  score: number; // 0 - 100
  savingsScore: number; // 0 - 100
  debtScore: number; // 0 - 100
  emergencyFundScore: number; // 0 - 100
  goalsScore: number; // 0 - 100
  investmentScore: number; // 0 - 100
  netWorthScore: number; // 0 - 100
  factors: {
    type: 'positive' | 'warning' | 'neutral';
    message: string;
  }[];
  metrics: {
    savingsRate: number; // percentage
    emergencyFundMonths: number;
    debtToAssetRatio: number; // percentage
    emiToIncomeRatio: number; // percentage
    goalProgressAverage: number; // percentage
  };
}

export interface CalculatorMeta {
  slug: string;
  title: string;
  description: string;
  category: 'Investment' | 'Loan & Debt' | 'Savings' | 'General Finance' | 'Tax & Business';
  formula: string;
  formulaExplanation: string;
  example: string;
  faqs: { question: string; answer: string }[];
  relatedCalculators: string[]; // slugs
  relatedArticles: string[]; // slugs
}

export interface LearnArticle {
  slug: string;
  title: string;
  metaDescription: string;
  readingTime: string;
  category: string;
  publishedDate: string;
  updatedDate: string;
  summary: string;
  content: {
    heading: string;
    paragraphs: string[];
    bulletPoints?: string[];
  }[];
  faqs: { question: string; answer: string }[];
  relatedCalculators: string[];
  relatedArticles: string[];
}
