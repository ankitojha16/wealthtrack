export interface CategoryDef {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryDef[] = [
  { name: 'Food', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { name: 'Transport', type: 'expense', icon: 'Car', color: '#06b6d4' },
  { name: 'Housing', type: 'expense', icon: 'Home', color: '#3b82f6' },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#8b5cf6' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#a855f7' },
  { name: 'Bills', type: 'expense', icon: 'FileText', color: '#ef4444' },
  { name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: '#14b8a6' },
  { name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryDef[] = [
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { name: 'Business', type: 'income', icon: 'Building', color: '#059669' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#0d9488' },
  { name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#2563eb' },
  { name: 'Rental', type: 'income', icon: 'Key', color: '#7c3aed' },
  { name: 'Gifts', type: 'income', icon: 'Gift', color: '#db2777' },
  { name: 'Other', type: 'income', icon: 'DollarSign', color: '#64748b' },
];

export const MANUAL_INVESTMENT_TYPES = [
  'Mutual Fund',
  'Fixed Deposit',
  'Recurring Deposit',
  'PPF',
  'EPF',
  'NPS',
  'Gold',
  'Bonds',
  'Other',
] as const;

export const INVESTMENT_TYPES = [...MANUAL_INVESTMENT_TYPES, 'Stocks'] as const;

export const GOAL_TYPES = [
  'Emergency Fund',
  'Education',
  'Travel',
  'Vehicle',
  'Home',
  'Retirement',
  'Personal',
  'Custom',
] as const;

export const LOAN_TYPES = [
  'Personal Loan',
  'Home Loan',
  'Car Loan',
  'Education Loan',
  'Other',
] as const;
