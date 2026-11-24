'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Transaction,
  CategoryBudget,
  Investment,
  Goal,
  Loan,
  Asset,
  Liability,
  MonthlySnapshot,
  UserSettings,
  FinancialHealthBreakdown,
} from '@/types';
import * as db from '@/lib/db';
import { calculateFinancialHealthScore } from '@/lib/calculations';
import { getCurrentDateString, getCurrentMonthYearString, setDefaultCurrencySettings } from '@/lib/formatters';
import { supabase, hasSupabaseConfig } from '@/lib/supabase/client';
import {
  createGuestSession,
  getLocalSessionUser,
  resetLocalPassword,
  signInLocal,
  signOutLocal,
  signUpLocal,
  isLocalMigrationCompleted,
  markLocalMigrationCompleted,
} from '@/lib/auth/localAuth';
import {
  getActiveUser,
  listRecords,
  upsertRecord,
  deleteRecord,
  signInWithPassword,
  signUpWithEmail as repoSignUpWithEmail,
  resetPasswordForEmail as repoResetPasswordForEmail,
  signOut,
} from '@/lib/supabase/repository';
import { generateSampleDataset } from '@/lib/data/sampleData';

type AuthUser = { id: string; email?: string | null; isGuest?: boolean };

interface FinanceContextType {
  loading: boolean;
  syncError: string | null;
  retrySync: () => Promise<void>;
  continueAsGuest: (withSampleData?: boolean) => Promise<boolean>;
  loadSampleData: () => Promise<void>;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  investments: Investment[];
  goals: Goal[];
  loans: Loan[];
  assets: Asset[];
  liabilities: Liability[];
  snapshots: MonthlySnapshot[];
  settings: UserSettings;
  user: AuthUser | null;
  authReady: boolean;

  // Computed properties
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalInvested: number;
  totalInvestmentValue: number;
  totalInvestmentGain: number;
  investmentReturnPercent: number;
  totalLoansOutstanding: number;
  totalMonthlyEmi: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  financialHealth: FinancialHealthBreakdown;

  // CRUD actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  addTransactionsBulk: (txList: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<Transaction[]>;
  editTransaction: (tx: Transaction) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<void>;

  saveCategoryBudget: (category: string, monthlyLimit: number) => Promise<void>;

  addInvestment: (inv: Omit<Investment, 'id' | 'createdAt' | 'lastUpdatedAt'>) => Promise<Investment>;
  editInvestment: (inv: Investment) => Promise<Investment>;
  updateInvestmentCurrentValue: (id: string, currentValue: number) => Promise<void>;
  removeInvestment: (id: string) => Promise<void>;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  editGoal: (goal: Goal) => Promise<Goal>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Loan>;
  editLoan: (loan: Loan) => Promise<Loan>;
  payLoanEmi: (id: string) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;

  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'lastUpdatedAt'>) => Promise<Asset>;
  editAsset: (asset: Asset) => Promise<Asset>;
  removeAsset: (id: string) => Promise<void>;

  addLiability: (liability: Omit<Liability, 'id' | 'createdAt' | 'lastUpdatedAt'>) => Promise<Liability>;
  editLiability: (liability: Liability) => Promise<Liability>;
  removeLiability: (id: string) => Promise<void>;

  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
  recordCurrentSnapshot: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser | null>;
  signUpWithEmail: (email: string, password: string, favoriteFruit?: string) => Promise<AuthUser | null>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  resetPasswordWithFruit: (email: string, favoriteFruit: string, newPassword: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [settings, setSettings] = useState<UserSettings>(db.DEFAULT_SETTINGS);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const refreshingPromiseRef = React.useRef<Promise<void> | null>(null);
  const lastLoadedUserIdRef = React.useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (settings?.currencySymbol || settings?.numberFormat) {
      setDefaultCurrencySettings(settings.currencySymbol, settings.numberFormat);
    }
  }, [settings?.currencySymbol, settings?.numberFormat]);

  const refreshData = useCallback(async () => {
    if (refreshingPromiseRef.current) {
      return refreshingPromiseRef.current;
    }

    const task = (async () => {
      try {
        let activeUser: AuthUser | null = null;

        if (hasSupabaseConfig() && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            activeUser = { id: session.user.id, email: session.user.email ?? null, isGuest: false };
          } else {
            const fetched = await getActiveUser();
            if (fetched) {
              activeUser = { id: fetched.id, email: fetched.email ?? null, isGuest: false };
            } else {
              const local = getLocalSessionUser();
              activeUser = local ? { id: local.id, email: local.email ?? null, isGuest: Boolean(local.isGuest) } : null;
            }
          }
        } else {
          const local = getLocalSessionUser();
          activeUser = local ? { id: local.id, email: local.email ?? null, isGuest: Boolean(local.isGuest) } : null;
        }

        const isUserCloudSync = Boolean(hasSupabaseConfig() && activeUser?.id && !activeUser?.isGuest);
        const userId = isUserCloudSync ? activeUser!.id : null;

        const [
          loadedTx,
          loadedBudgets,
          loadedInv,
          loadedGoals,
          loadedLoans,
          loadedAssets,
          loadedLiabilities,
          loadedSnapshots,
          loadedSettings,
        ] = await Promise.all([
          userId ? listRecords<Transaction>('transactions', userId) : db.getTransactions(),
          userId ? listRecords<CategoryBudget>('budgets', userId) : db.getBudgets(),
          userId ? listRecords<Investment>('investments', userId) : db.getInvestments(),
          userId ? listRecords<Goal>('goals', userId) : db.getGoals(),
          userId ? listRecords<Loan>('loans', userId) : db.getLoans(),
          userId ? listRecords<Asset>('assets', userId) : db.getAssets(),
          userId ? listRecords<Liability>('liabilities', userId) : db.getLiabilities(),
          userId ? listRecords<MonthlySnapshot>('snapshots', userId) : db.getSnapshots(),
          userId
            ? listRecords<{ key: string; value: UserSettings }>('app_settings', userId).then((rows) => {
                const row = rows.find((s) => s.key === 'app_settings');
                return row ? row.value : db.DEFAULT_SETTINGS;
              })
            : db.getSettings(),
        ]);

        // Priority 1: Preserve local financial records and migrate to cloud on first Supabase login
        if (userId && !isLocalMigrationCompleted(userId) && (loadedTx?.length === 0 && loadedInv?.length === 0)) {
          try {
            const localTxs = await db.getTransactions();
            const localBudgets = await db.getBudgets();
            const localInvs = await db.getInvestments();
            const localGoals = await db.getGoals();
            const localLoans = await db.getLoans();
            const localAssets = await db.getAssets();
            const localLiabilities = await db.getLiabilities();

            for (const tx of localTxs) {
              await upsertRecord('transactions', { ...tx, user_id: userId }, userId).catch(() => {});
            }
            for (const b of localBudgets) {
              await upsertRecord('budgets', { ...b, user_id: userId }, userId).catch(() => {});
            }
            for (const inv of localInvs) {
              await upsertRecord('investments', { ...inv, user_id: userId }, userId).catch(() => {});
            }
            for (const g of localGoals) {
              await upsertRecord('goals', { ...g, user_id: userId }, userId).catch(() => {});
            }
            for (const l of localLoans) {
              await upsertRecord('loans', { ...l, user_id: userId }, userId).catch(() => {});
            }
            for (const a of localAssets) {
              await upsertRecord('assets', { ...a, user_id: userId }, userId).catch(() => {});
            }
            for (const li of localLiabilities) {
              await upsertRecord('liabilities', { ...li, user_id: userId }, userId).catch(() => {});
            }
            markLocalMigrationCompleted(userId);
          } catch (migrationErr) {
            console.warn('[migration] Non-blocking local record migration notice:', migrationErr);
          }
        }

        setUser(activeUser);
        setTransactions(loadedTx || []);
        setBudgets(loadedBudgets || []);
        setInvestments(loadedInv || []);
        setGoals(loadedGoals || []);
        setLoans(loadedLoans || []);
        setAssets(loadedAssets || []);
        setLiabilities(loadedLiabilities || []);
        setSnapshots(loadedSnapshots || []);
        setSettings(loadedSettings || db.DEFAULT_SETTINGS);
        setSyncError(null);
        lastLoadedUserIdRef.current = userId;
      } catch (err: any) {
        console.error('Error loading WealthTrack data:', err);
        // Priority 4: Preserve previously loaded data on failure!
        // Never convert database failures into false zeros or empty states.
        setSyncError(err?.message || 'Database connection issue. Showing previously cached financial data.');
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    })();

    refreshingPromiseRef.current = task;
    try {
      await task;
    } finally {
      refreshingPromiseRef.current = null;
    }
  }, []);

  const retrySync = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session) => {
      const newUserId = session?.user?.id ?? null;
      // Priority 5: Deduplicate initial authentication refreshes
      if (lastLoadedUserIdRef.current === newUserId && authReady) {
        return;
      }
      const newUser = session?.user ? { id: session.user.id, email: session.user.email ?? null } : null;
      setUser(newUser);
      await refreshData();
    });

    return () => subscription.unsubscribe();
  }, [refreshData, authReady]);

  // Handle dark/light theme class on document element
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const accentMap = {
      default: '#0ea5e9',
      green: '#10b981',
      blue: '#0ea5e9',
      purple: '#8b5cf6',
      orange: '#f59e0b',
      sky: '#0ea5e9',
      violet: '#8b5cf6',
      emerald: '#10b981',
      rose: '#f43f5e',
    } as const;

    const applyTheme = () => {
      const accentKey = settings.accentColor && accentMap[settings.accentColor as keyof typeof accentMap]
        ? settings.accentColor
        : 'default';
      const shouldUseDark = settings.theme === 'dark'
        ? true
        : settings.theme === 'light'
          ? false
          : media.matches;

      root.classList.toggle('dark', shouldUseDark);
      root.style.setProperty('--wealthtrack-accent', accentMap[accentKey as keyof typeof accentMap]);
      root.style.setProperty('--wealthtrack-accent-soft', `${accentMap[accentKey as keyof typeof accentMap]}22`);
    };

    applyTheme();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', applyTheme);
      return () => media.removeEventListener('change', applyTheme);
    }

    media.addListener(applyTheme);
    return () => media.removeListener(applyTheme);
  }, [settings.theme, settings.accentColor]);

  // Current Month calculations
  const currentMonthYear = getCurrentMonthYearString(); // e.g. "2026-09"

  const { monthlyIncome, monthlyExpenses, monthlySavings } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      if (t.date.startsWith(currentMonthYear)) {
        if (t.type === 'income') income += t.amount || 0;
        else if (t.type === 'expense') expenses += t.amount || 0;
      }
    }
    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlySavings: income - expenses,
    };
  }, [transactions, currentMonthYear]);

  // Investments calculations
  const { totalInvested, totalInvestmentValue, totalInvestmentGain, investmentReturnPercent } = useMemo(() => {
    let invested = 0;
    let currVal = 0;
    for (const i of investments) {
      invested += i.investedAmount || 0;
      currVal += i.currentValue || 0;
    }
    const gain = currVal - invested;
    const returnPct = invested > 0 ? (gain / invested) * 100 : 0;
    return {
      totalInvested: invested,
      totalInvestmentValue: currVal,
      totalInvestmentGain: gain,
      investmentReturnPercent: returnPct,
    };
  }, [investments]);

  // Loans calculations
  const { totalLoansOutstanding, totalMonthlyEmi } = useMemo(() => {
    let outstanding = 0;
    let emi = 0;
    for (const l of loans) {
      outstanding += l.outstandingAmount || 0;
      emi += l.monthlyEmi || 0;
    }
    return {
      totalLoansOutstanding: outstanding,
      totalMonthlyEmi: emi,
    };
  }, [loans]);

  // Assets & Liabilities calculations
  const { totalAssets, totalLiabilities, netWorth, liquidAssets } = useMemo(() => {
    let explicitAssets = 0;
    let liquid = 0;
    for (const a of assets) {
      explicitAssets += a.estimatedValue || 0;
      if (
        a.category === 'Financial' &&
        ['Bank', 'Cash', 'Savings'].some(
          (k) => a.name.toLowerCase().includes(k.toLowerCase()) || a.subcategory.toLowerCase().includes(k.toLowerCase())
        )
      ) {
        liquid += a.estimatedValue || 0;
      }
    }
    for (const i of investments) {
      if (['Cash', 'FD', 'RD', 'Fixed Deposit', 'Recurring Deposit', 'Fixed Deposit (FD)', 'Recurring Deposit (RD)'].includes(i.type)) {
        liquid += i.currentValue || 0;
      }
    }

    let explicitLiabilities = 0;
    for (const l of liabilities) {
      explicitLiabilities += l.amount || 0;
    }

    const tAssets = explicitAssets + totalInvestmentValue;
    const tLiabilities = explicitLiabilities + totalLoansOutstanding;
    return {
      totalAssets: tAssets,
      totalLiabilities: tLiabilities,
      netWorth: tAssets - tLiabilities,
      liquidAssets: liquid,
    };
  }, [assets, investments, liabilities, totalInvestmentValue, totalLoansOutstanding]);

  // Financial Health Score
  const financialHealth = useMemo(() => {
    return calculateFinancialHealthScore({
      monthlyIncome,
      monthlyExpenses,
      totalMonthlyEmi,
      liquidAssets: liquidAssets > 0 ? liquidAssets : totalAssets * 0.2, // fallback approximation if not categorized
      totalAssets,
      totalLiabilities,
      totalInvestments: totalInvestmentValue,
      activeGoals: goals.map((g) => ({ currentAmount: g.currentAmount, targetAmount: g.targetAmount })),
    });
  }, [monthlyIncome, monthlyExpenses, totalMonthlyEmi, liquidAssets, totalAssets, totalLiabilities, totalInvestmentValue, goals]);

  // Cloud sync is only active when Supabase is configured AND the user has a real account session (not guest)
  const isCloudSync = Boolean(hasSupabaseConfig() && user?.id && !user?.isGuest);

  // Snapshot recording
  const recordCurrentSnapshot = useCallback(async () => {
    const snapshot: MonthlySnapshot = {
      id: user?.id ? `snap_${user.id}_${currentMonthYear}` : `snap_${currentMonthYear}`,
      monthYear: currentMonthYear,
      netWorth,
      totalAssets,
      totalLiabilities,
      totalInvestments: totalInvested,
      totalInvestmentsValue: totalInvestmentValue,
      totalLoans: totalLoansOutstanding,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      savings: monthlySavings,
      timestamp: Date.now(),
    };

    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<MonthlySnapshot & { user_id: string }>('snapshots', { ...snapshot, user_id: user.id }, user.id);
      setSnapshots((prev) => {
        const index = prev.findIndex((s) => s.id === saved.id || s.monthYear === saved.monthYear);
        if (index >= 0) {
          const next = [...prev];
          next[index] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      return;
    }

    await db.saveSnapshot(snapshot);
    const updated = await db.getSnapshots();
    setSnapshots(updated);
  }, [currentMonthYear, netWorth, totalAssets, totalLiabilities, totalInvested, totalInvestmentValue, totalLoansOutstanding, monthlyIncome, monthlyExpenses, monthlySavings, user?.id, isCloudSync]);

  // ---------------- CRUD HANDLERS ----------------
  const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newTx: Transaction = {
      ...txData,
      id: `tx_${now}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Transaction & { user_id: string }>('transactions', { ...newTx, user_id: user.id }, user.id);
      setTransactions((prev) => [saved, ...prev]);
      return saved;
    }

    await db.saveTransaction(newTx);
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, [isCloudSync, user?.id]);

  const addTransactionsBulk = useCallback(async (txList: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Transaction[]> => {
    if (!txList.length) return [];
    const now = Date.now();
    const createdList: Transaction[] = txList.map((txData, idx) => ({
      ...txData,
      id: `tx_${now}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now + idx,
      updatedAt: now + idx,
    }));

    if (isCloudSync && user?.id) {
      const results: Transaction[] = [];
      for (const item of createdList) {
        const saved = await upsertRecord<Transaction & { user_id: string }>('transactions', { ...item, user_id: user.id }, user.id);
        results.push(saved);
      }
      setTransactions((prev) => [...results, ...prev]);
      return results;
    }

    for (const item of createdList) {
      await db.saveTransaction(item);
    }
    setTransactions((prev) => [...createdList, ...prev]);
    return createdList;
  }, [isCloudSync, user?.id]);

  const editTransaction = useCallback(async (tx: Transaction) => {
    const updated: Transaction = { ...tx, updatedAt: Date.now() };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Transaction & { user_id: string }>('transactions', { ...updated, user_id: user.id }, user.id);
      setTransactions((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      return saved;
    }
    await db.saveTransaction(updated);
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  }, [isCloudSync, user?.id]);

  const removeTransaction = useCallback(async (id: string) => {
    if (isCloudSync && user?.id) {
      await deleteRecord('transactions', id, user.id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    await db.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [isCloudSync, user?.id]);

  const saveCategoryBudget = useCallback(async (category: string, monthlyLimit: number) => {
    const safeKey = category.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const budgetId = user?.id ? `b_${user.id}_${safeKey}` : `b_local_${safeKey}`;
    const budget: CategoryBudget = {
      id: budgetId,
      category,
      monthlyLimit,
      spent: 0,
    };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<CategoryBudget & { user_id: string }>('budgets', { ...budget, user_id: user.id }, user.id);
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.category.toLowerCase() === category.toLowerCase());
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      return;
    }
    await db.saveBudget(budget);
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category.toLowerCase() === category.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = budget;
        return next;
      }
      return [...prev, budget];
    });
  }, [isCloudSync, user?.id]);

  const addInvestment = useCallback(async (invData: Omit<Investment, 'id' | 'createdAt' | 'lastUpdatedAt'>) => {
    const now = Date.now();
    const newInv: Investment = {
      ...invData,
      id: `inv_${now}_${Math.random().toString(36).substring(2, 7)}`,
      lastUpdatedAt: getCurrentDateString(),
      createdAt: now,
    };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Investment & { user_id: string }>('investments', { ...newInv, user_id: user.id }, user.id);
      setInvestments((prev) => [saved, ...prev]);
      return saved;
    }
    await db.saveInvestment(newInv);
    setInvestments((prev) => [newInv, ...prev]);
    return newInv;
  }, [isCloudSync, user?.id]);

  const editInvestment = useCallback(async (inv: Investment) => {
    const updated: Investment = { ...inv, lastUpdatedAt: getCurrentDateString() };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Investment & { user_id: string }>('investments', { ...updated, user_id: user.id }, user.id);
      setInvestments((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      return saved;
    }
    await db.saveInvestment(updated);
    setInvestments((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  }, [isCloudSync, user?.id]);

  const updateInvestmentCurrentValue = useCallback(async (id: string, currentValue: number) => {
    const target = investments.find((i) => i.id === id);
    if (!target) return;
    const updated: Investment = {
      ...target,
      currentValue,
      lastUpdatedAt: getCurrentDateString(),
    };
    if (isCloudSync && user?.id) {
      await upsertRecord<Investment & { user_id: string }>('investments', { ...updated, user_id: user.id }, user.id);
      setInvestments((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return;
    }
    await db.saveInvestment(updated);
    setInvestments((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }, [investments, isCloudSync, user?.id]);

  const removeInvestment = useCallback(async (id: string) => {
    if (isCloudSync && user?.id) {
      await deleteRecord('investments', id, user.id);
      setInvestments((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    await db.deleteInvestment(id);
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  }, [isCloudSync, user?.id]);

  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${now}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Goal & { user_id: string }>('goals', { ...newGoal, user_id: user.id }, user.id);
      setGoals((prev) => [saved, ...prev]);
      return saved;
    }
    await db.saveGoal(newGoal);
    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  }, [isCloudSync, user?.id]);

  const editGoal = useCallback(async (goal: Goal) => {
    const updated: Goal = { ...goal, updatedAt: Date.now() };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Goal & { user_id: string }>('goals', { ...updated, user_id: user.id }, user.id);
      setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
      return saved;
    }
    await db.saveGoal(updated);
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    return updated;
  }, [isCloudSync, user?.id]);

  const contributeToGoal = useCallback(async (id: string, amount: number) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;
    const updated: Goal = {
      ...target,
      currentAmount: Math.min(target.targetAmount, target.currentAmount + amount),
      updatedAt: Date.now(),
    };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Goal & { user_id: string }>('goals', { ...updated, user_id: user.id }, user.id);
      setGoals((prev) => prev.map((g) => (g.id === id ? saved : g)));
      return;
    }
    await db.saveGoal(updated);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
  }, [goals, isCloudSync, user?.id]);

  const removeGoal = useCallback(async (id: string) => {
    if (isCloudSync && user?.id) {
      await deleteRecord('goals', id, user.id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      return;
    }
    await db.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, [isCloudSync, user?.id]);

  const addLoan = useCallback(async (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newLoan: Loan = {
      ...loanData,
      id: `loan_${now}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Loan & { user_id: string }>('loans', { ...newLoan, user_id: user.id }, user.id);
      setLoans((prev) => [saved, ...prev]);
      return saved;
    }
    await db.saveLoan(newLoan);
    setLoans((prev) => [newLoan, ...prev]);
    return newLoan;
  }, [isCloudSync, user?.id]);

  const editLoan = useCallback(async (loan: Loan) => {
    const updated: Loan = { ...loan, updatedAt: Date.now() };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Loan & { user_id: string }>('loans', { ...updated, user_id: user.id }, user.id);
      setLoans((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
      return saved;
    }
    await db.saveLoan(updated);
    setLoans((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    return updated;
  }, [isCloudSync, user?.id]);

  const payLoanEmi = useCallback(async (id: string) => {
    const target = loans.find((l) => l.id === id);
    if (!target || target.outstandingAmount <= 0 || target.emisRemaining <= 0) return;
    const monthlyRate = (target.interestRate ?? 0) / (12 * 100);
    const interest = target.outstandingAmount * monthlyRate;
    const principalPaid = Math.max(0, target.monthlyEmi - interest);
    const newOutstanding = Math.max(0, target.outstandingAmount - principalPaid);
    const newRemaining = Math.max(0, target.emisRemaining - 1);

    // Advance next EMI date by 1 month if present and installments remain
    let nextDate = target.nextEmiDate;
    if (nextDate && newRemaining > 0) {
      const parts = nextDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const nextMonthDate = new Date(y, m, d); // In JS Date constructor, month index m is next month
        const ny = nextMonthDate.getFullYear();
        const nm = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
        const nd = String(nextMonthDate.getDate()).padStart(2, '0');
        nextDate = `${ny}-${nm}-${nd}`;
      }
    } else if (newRemaining === 0) {
      nextDate = undefined;
    }

    const updated: Loan = {
      ...target,
      outstandingAmount: Math.round(newOutstanding),
      emisRemaining: newRemaining,
      nextEmiDate: nextDate,
      updatedAt: Date.now(),
    };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Loan & { user_id: string }>('loans', { ...updated, user_id: user.id }, user.id);
      setLoans((prev) => prev.map((l) => (l.id === id ? saved : l)));
      return;
    }
    await db.saveLoan(updated);
    setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }, [loans, isCloudSync, user?.id]);

  const removeLoan = useCallback(async (id: string) => {
    if (isCloudSync && user?.id) {
      await deleteRecord('loans', id, user.id);
      setLoans((prev) => prev.filter((l) => l.id !== id));
      return;
    }
    await db.deleteLoan(id);
    setLoans((prev) => prev.filter((l) => l.id !== id));
  }, [isCloudSync, user?.id]);

  const addAsset = useCallback(async (assetData: Omit<Asset, 'id' | 'createdAt' | 'lastUpdatedAt'>) => {
    const now = Date.now();
    const newAsset: Asset = {
      ...assetData,
      id: `asset_${now}_${Math.random().toString(36).substring(2, 7)}`,
      lastUpdatedAt: getCurrentDateString(),
      createdAt: now,
    };

    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Asset & { user_id: string }>('assets', { ...newAsset, user_id: user.id }, user.id);
      setAssets((prev) => [saved, ...prev]);
      return saved;
    }

    await db.saveAsset(newAsset);
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  }, [isCloudSync, user?.id]);

  const editAsset = useCallback(async (asset: Asset) => {
    const updated: Asset = { ...asset, lastUpdatedAt: getCurrentDateString() };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Asset & { user_id: string }>('assets', { ...updated, user_id: user.id }, user.id);
      setAssets((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
      return saved;
    }
    await db.saveAsset(updated);
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    return updated;
  }, [isCloudSync, user?.id]);

  const removeAsset = useCallback(async (id: string) => {
    if (isCloudSync && user?.id) {
      await deleteRecord('assets', id, user.id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    await db.deleteAsset(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, [isCloudSync, user?.id]);

  const addLiability = useCallback(async (liabData: Omit<Liability, 'id' | 'createdAt' | 'lastUpdatedAt'>) => {
    const now = Date.now();
    const newLiab: Liability = {
      ...liabData,
      id: `liab_${now}_${Math.random().toString(36).substring(2, 7)}`,
      lastUpdatedAt: getCurrentDateString(),
      createdAt: now,
    };

    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Liability & { user_id: string }>('liabilities', { ...newLiab, user_id: user.id }, user.id);
      setLiabilities((prev) => [saved, ...prev]);
      return saved;
    }

    await db.saveLiability(newLiab);
    setLiabilities((prev) => [newLiab, ...prev]);
    return newLiab;
  }, [isCloudSync, user?.id]);

  const editLiability = useCallback(async (liability: Liability) => {
    const updated: Liability = { ...liability, lastUpdatedAt: getCurrentDateString() };
    if (isCloudSync && user?.id) {
      const saved = await upsertRecord<Liability & { user_id: string }>('liabilities', { ...updated, user_id: user.id }, user.id);
      setLiabilities((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
      return saved;
    }
    await db.saveLiability(updated);
    setLiabilities((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    return updated;
  }, [isCloudSync, user?.id]);

  const removeLiability = useCallback(async (id: string) => {
    if (isCloudSync && user?.id) {
      await deleteRecord('liabilities', id, user.id);
      setLiabilities((prev) => prev.filter((l) => l.id !== id));
      return;
    }
    await db.deleteLiability(id);
    setLiabilities((prev) => prev.filter((l) => l.id !== id));
  }, [isCloudSync, user?.id]);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated: UserSettings = { ...settings, ...newSettings };
    if (isCloudSync && user?.id) {
      await upsertRecord<{ key: string; value: UserSettings; user_id: string }>('app_settings', {
        key: 'app_settings',
        value: updated,
        user_id: user.id,
      }, user.id);
      setSettings(updated);
      return;
    }
    await db.saveSettings(updated);
    setSettings(updated);
  }, [settings, isCloudSync, user?.id]);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthUser | null> => {
    if (!hasSupabaseConfig()) {
      const localUser = signInLocal(email, password);
      if (!localUser) return null;
      const normalized: AuthUser = { id: localUser.id, email: localUser.email ?? null };
      setUser(normalized);
      await refreshData();
      return normalized;
    }

    const userRecord = await signInWithPassword(email, password);
    if (!userRecord) return null;
    const normalized: AuthUser = { id: userRecord.id, email: userRecord.email ?? null };
    setUser(normalized);
    await refreshData();
    return normalized;
  }, [refreshData]);

  const signUpWithEmail = useCallback(async (email: string, password: string, favoriteFruit?: string): Promise<AuthUser | null> => {
    if (!hasSupabaseConfig()) {
      const localUser = signUpLocal(email, password, password, favoriteFruit);
      if (!localUser) return null;
      const normalized: AuthUser = { id: localUser.id, email: localUser.email ?? null };
      setUser(normalized);
      await refreshData();
      return normalized;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, favoriteFruit }),
      });
      if (response.ok) {
        const userRecord = await signInWithPassword(email, password);
        if (userRecord) {
          const normalized: AuthUser = { id: userRecord.id, email: userRecord.email ?? null };
          setUser(normalized);
          await refreshData();
          return normalized;
        }
      } else {
        const errJson = await response.json().catch(() => null);
        if (errJson?.error) {
          throw new Error(errJson.error);
        }
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch failed')) {
        throw err;
      }
      // Fallback to client-side Supabase auth signup
    }

    const userRecord = await repoSignUpWithEmail(email, password);
    if (!userRecord) return null;
    const normalized: AuthUser = { id: userRecord.id, email: userRecord.email ?? null };
    setUser(normalized);
    await refreshData();
    return normalized;
  }, [refreshData]);

  const loadSampleDataInternal = useCallback(async (targetUser: AuthUser | null) => {
    const sample = generateSampleDataset();
    const isUserCloudSync = Boolean(hasSupabaseConfig() && targetUser?.id && !targetUser?.isGuest);
    const userId = isUserCloudSync ? targetUser!.id : null;

    if (userId) {
      for (const t of sample.transactions) {
        await upsertRecord('transactions', { ...t, user_id: userId }, userId).catch(() => {});
      }
      for (const b of sample.budgets) {
        const safeKey = b.category.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        await upsertRecord('budgets', { id: `b_${userId}_${safeKey}`, user_id: userId, category: b.category, monthlyLimit: b.monthlyLimit }, userId).catch(() => {});
      }
      for (const inv of sample.investments) {
        await upsertRecord('investments', { ...inv, user_id: userId }, userId).catch(() => {});
      }
      for (const g of sample.goals) {
        await upsertRecord('goals', { ...g, user_id: userId }, userId).catch(() => {});
      }
      for (const l of sample.loans) {
        await upsertRecord('loans', { ...l, user_id: userId }, userId).catch(() => {});
      }
      for (const a of sample.assets) {
        await upsertRecord('assets', { ...a, user_id: userId }, userId).catch(() => {});
      }
      for (const s of sample.snapshots) {
        await upsertRecord('snapshots', { ...s, user_id: userId }, userId).catch(() => {});
      }
    } else {
      await db.clearAllData();
      for (const t of sample.transactions) {
        await db.saveTransaction(t);
      }
      for (const b of sample.budgets) {
        await db.saveBudget(b);
      }
      for (const inv of sample.investments) {
        await db.saveInvestment(inv);
      }
      for (const g of sample.goals) {
        await db.saveGoal(g);
      }
      for (const l of sample.loans) {
        await db.saveLoan(l);
      }
      for (const a of sample.assets) {
        await db.saveAsset(a);
      }
      for (const s of sample.snapshots) {
        await db.saveSnapshot(s);
      }
    }
    await refreshData();
  }, [refreshData]);

  const loadSampleData = useCallback(async (): Promise<void> => {
    await loadSampleDataInternal(user);
  }, [loadSampleDataInternal, user]);

  const continueAsGuest = useCallback(async (withSampleData?: boolean): Promise<boolean> => {
    const guest = createGuestSession();
    const normalized: AuthUser = { id: guest.id, email: guest.email, isGuest: true };
    setUser(normalized);
    if (withSampleData) {
      await loadSampleDataInternal(normalized);
    } else {
      await refreshData();
    }
    return true;
  }, [loadSampleDataInternal, refreshData]);

  const resetPasswordForEmail = useCallback(async (email: string): Promise<void> => {
    if (!hasSupabaseConfig()) {
      throw new Error('Supabase Auth is not configured for email recovery.');
    }
    await repoResetPasswordForEmail(email);
  }, []);

  const resetPasswordWithFruit = useCallback(async (email: string, favoriteFruit: string, newPassword: string) => {
    if (!hasSupabaseConfig()) {
      const reset = resetLocalPassword(email, favoriteFruit, newPassword);
      if (!reset) throw new Error('The email or favorite fruit did not match.');
      const localUser = signInLocal(email, newPassword);
      if (!localUser) throw new Error('Password changed, but automatic sign-in failed. Please log in.');
      setUser({ id: localUser.id, email: localUser.email });
      await refreshData();
      return;
    }

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, favoriteFruit, newPassword }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to reset password.');

    const userRecord = await signInWithPassword(email, newPassword);
    if (!userRecord) throw new Error('Password changed, but automatic sign-in failed. Please log in.');
    setUser({ id: userRecord.id, email: userRecord.email ?? null });
    await refreshData();
  }, [refreshData]);

  const signOutUser = useCallback(async () => {
    signOutLocal();
    if (hasSupabaseConfig() && supabase) {
      await signOut().catch(() => {});
    }
    setUser(null);
    setTransactions([]);
    setBudgets([]);
    setInvestments([]);
    setGoals([]);
    setLoans([]);
    setAssets([]);
    setLiabilities([]);
    setSnapshots([]);
    await refreshData();
  }, [refreshData]);

  const contextValue = useMemo(
    () => ({
      loading,
      syncError,
      retrySync,
      continueAsGuest,
      loadSampleData,
      transactions,
      budgets,
      investments,
      goals,
      loans,
      assets,
      liabilities,
      snapshots,
      settings,
      user,
      authReady,
      totalAssets,
      totalLiabilities,
      netWorth,
      totalInvested,
      totalInvestmentValue,
      totalInvestmentGain,
      investmentReturnPercent,
      totalLoansOutstanding,
      totalMonthlyEmi,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      financialHealth,
      addTransaction,
      addTransactionsBulk,
      editTransaction,
      removeTransaction,
      saveCategoryBudget,
      addInvestment,
      editInvestment,
      updateInvestmentCurrentValue,
      removeInvestment,
      addGoal,
      editGoal,
      contributeToGoal,
      removeGoal,
      addLoan,
      editLoan,
      payLoanEmi,
      removeLoan,
      addAsset,
      editAsset,
      removeAsset,
      addLiability,
      editLiability,
      removeLiability,
      updateSettings,
      refreshData,
      recordCurrentSnapshot,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
      resetPasswordWithFruit,
      signOutUser,
    }),
    [
      loading,
      syncError,
      retrySync,
      continueAsGuest,
      loadSampleData,
      transactions,
      budgets,
      investments,
      goals,
      loans,
      assets,
      liabilities,
      snapshots,
      settings,
      user,
      authReady,
      totalAssets,
      totalLiabilities,
      netWorth,
      totalInvested,
      totalInvestmentValue,
      totalInvestmentGain,
      investmentReturnPercent,
      totalLoansOutstanding,
      totalMonthlyEmi,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      financialHealth,
      addTransaction,
      addTransactionsBulk,
      editTransaction,
      removeTransaction,
      saveCategoryBudget,
      addInvestment,
      editInvestment,
      updateInvestmentCurrentValue,
      removeInvestment,
      addGoal,
      editGoal,
      contributeToGoal,
      removeGoal,
      addLoan,
      editLoan,
      payLoanEmi,
      removeLoan,
      addAsset,
      editAsset,
      removeAsset,
      addLiability,
      editLiability,
      removeLiability,
      updateSettings,
      refreshData,
      recordCurrentSnapshot,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
      resetPasswordWithFruit,
      signOutUser,
    ]
  );

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
