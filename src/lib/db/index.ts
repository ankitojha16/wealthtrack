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
} from '@/types';

const DB_NAME = 'WealthTrackDB';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  numberFormat: 'indian',
  theme: 'system',
  accentColor: 'sky',
  supportEmail: 'ankit.ojha1666@gmail.com',
};

// Database store names
export const STORES = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  INVESTMENTS: 'investments',
  GOALS: 'goals',
  LOANS: 'loans',
  ASSETS: 'assets',
  LIABILITIES: 'liabilities',
  SNAPSHOTS: 'snapshots',
  SETTINGS: 'settings',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported or running on server'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('category', 'category', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.BUDGETS)) {
        db.createObjectStore(STORES.BUDGETS, { keyPath: 'category' });
      }

      if (!db.objectStoreNames.contains(STORES.INVESTMENTS)) {
        const invStore = db.createObjectStore(STORES.INVESTMENTS, { keyPath: 'id' });
        invStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.GOALS)) {
        db.createObjectStore(STORES.GOALS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.LOANS)) {
        db.createObjectStore(STORES.LOANS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.LIABILITIES)) {
        db.createObjectStore(STORES.LIABILITIES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
        db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'monthYear' });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic IndexedDB CRUD helpers with LocalStorage fallback
async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // LocalStorage fallback
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`wt_${storeName}`);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }
}

async function putToStore<T extends { id?: string; category?: string; monthYear?: string; key?: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  } catch {
    if (typeof window !== 'undefined') {
      const current = await getAllFromStore<T>(storeName);
      const keyField = storeName === STORES.BUDGETS ? 'category' : storeName === STORES.SNAPSHOTS ? 'monthYear' : storeName === STORES.SETTINGS ? 'key' : 'id';
      const keyVal = (item as Record<string, unknown>)[keyField];
      const index = current.findIndex((x) => (x as Record<string, unknown>)[keyField] === keyVal);
      if (index >= 0) {
        current[index] = item;
      } else {
        current.push(item);
      }
      localStorage.setItem(`wt_${storeName}`, JSON.stringify(current));
    }
    return item;
  }
}

async function deleteFromStore(storeName: StoreName, key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    if (typeof window !== 'undefined') {
      const current = await getAllFromStore<Record<string, unknown>>(storeName);
      const keyField = storeName === STORES.BUDGETS ? 'category' : storeName === STORES.SNAPSHOTS ? 'monthYear' : storeName === STORES.SETTINGS ? 'key' : 'id';
      const filtered = current.filter((x) => x[keyField] !== key);
      localStorage.setItem(`wt_${storeName}`, JSON.stringify(filtered));
    }
  }
}

// ----------------- TRANSACTIONS -----------------
export const getTransactions = () => getAllFromStore<Transaction>(STORES.TRANSACTIONS);
export const saveTransaction = (tx: Transaction) => putToStore(STORES.TRANSACTIONS, tx);
export const deleteTransaction = (id: string) => deleteFromStore(STORES.TRANSACTIONS, id);

// ----------------- BUDGETS -----------------
export const getBudgets = () => getAllFromStore<CategoryBudget>(STORES.BUDGETS);
export const saveBudget = (budget: CategoryBudget) => putToStore(STORES.BUDGETS, budget);
export const deleteBudget = (category: string) => deleteFromStore(STORES.BUDGETS, category);

// ----------------- INVESTMENTS -----------------
export const getInvestments = () => getAllFromStore<Investment>(STORES.INVESTMENTS);
export const saveInvestment = (inv: Investment) => putToStore(STORES.INVESTMENTS, inv);
export const deleteInvestment = (id: string) => deleteFromStore(STORES.INVESTMENTS, id);

// ----------------- GOALS -----------------
export const getGoals = () => getAllFromStore<Goal>(STORES.GOALS);
export const saveGoal = (goal: Goal) => putToStore(STORES.GOALS, goal);
export const deleteGoal = (id: string) => deleteFromStore(STORES.GOALS, id);

// ----------------- LOANS -----------------
export const getLoans = () => getAllFromStore<Loan>(STORES.LOANS);
export const saveLoan = (loan: Loan) => putToStore(STORES.LOANS, loan);
export const deleteLoan = (id: string) => deleteFromStore(STORES.LOANS, id);

// ----------------- ASSETS -----------------
export const getAssets = () => getAllFromStore<Asset>(STORES.ASSETS);
export const saveAsset = (asset: Asset) => putToStore(STORES.ASSETS, asset);
export const deleteAsset = (id: string) => deleteFromStore(STORES.ASSETS, id);

// ----------------- LIABILITIES -----------------
export const getLiabilities = () => getAllFromStore<Liability>(STORES.LIABILITIES);
export const saveLiability = (liability: Liability) => putToStore(STORES.LIABILITIES, liability);
export const deleteLiability = (id: string) => deleteFromStore(STORES.LIABILITIES, id);

// ----------------- SNAPSHOTS -----------------
export const getSnapshots = () => getAllFromStore<MonthlySnapshot>(STORES.SNAPSHOTS);
export const saveSnapshot = (snapshot: MonthlySnapshot) => putToStore(STORES.SNAPSHOTS, snapshot);

// ----------------- SETTINGS -----------------
export async function getSettings(): Promise<UserSettings> {
  try {
    const list = await getAllFromStore<{ key: string; value: UserSettings }>(STORES.SETTINGS);
    const found = list.find((s) => s.key === 'app_settings');
    return found ? found.value : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await putToStore(STORES.SETTINGS, { key: 'app_settings', value: settings });
}

// ----------------- CLEAR ALL DATA -----------------
export async function clearAllData(): Promise<void> {
  try {
    const db = await openDB();
    const storeNames = Object.values(STORES);
    const tx = db.transaction(storeNames, 'readwrite');
    for (const storeName of storeNames) {
      tx.objectStore(storeName).clear();
    }
  } catch {
    // fallback
  }

  if (typeof window !== 'undefined') {
    for (const key of Object.values(STORES)) {
      localStorage.removeItem(`wt_${key}`);
    }
  }
}

// ----------------- EXPORT ALL DATA -----------------
export interface ExportPayload {
  version: number;
  exportedAt: string;
  appName: 'WealthTrack';
  founder: 'ANKIT KUMAR';
  data: {
    transactions: Transaction[];
    budgets: CategoryBudget[];
    investments: Investment[];
    goals: Goal[];
    loans: Loan[];
    assets: Asset[];
    liabilities: Liability[];
    snapshots: MonthlySnapshot[];
    settings: UserSettings;
  };
}

export async function exportAllData(): Promise<ExportPayload> {
  const [
    transactions,
    budgets,
    investments,
    goals,
    loans,
    assets,
    liabilities,
    snapshots,
    settings,
  ] = await Promise.all([
    getTransactions(),
    getBudgets(),
    getInvestments(),
    getGoals(),
    getLoans(),
    getAssets(),
    getLiabilities(),
    getSnapshots(),
    getSettings(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'WealthTrack',
    founder: 'ANKIT KUMAR',
    data: {
      transactions,
      budgets,
      investments,
      goals,
      loans,
      assets,
      liabilities,
      snapshots,
      settings,
    },
  };
}

// ----------------- IMPORT ALL DATA -----------------
export async function importAllData(payload: ExportPayload): Promise<boolean> {
  if (!payload || !payload.data) {
    throw new Error('Invalid backup file structure.');
  }

  await clearAllData();

  const { transactions, budgets, investments, goals, loans, assets, liabilities, snapshots, settings } = payload.data;

  if (Array.isArray(transactions)) {
    for (const tx of transactions) await saveTransaction(tx);
  }
  if (Array.isArray(budgets)) {
    for (const b of budgets) await saveBudget(b);
  }
  if (Array.isArray(investments)) {
    for (const inv of investments) await saveInvestment(inv);
  }
  if (Array.isArray(goals)) {
    for (const g of goals) await saveGoal(g);
  }
  if (Array.isArray(loans)) {
    for (const l of loans) await saveLoan(l);
  }
  if (Array.isArray(assets)) {
    for (const a of assets) await saveAsset(a);
  }
  if (Array.isArray(liabilities)) {
    for (const lib of liabilities) await saveLiability(lib);
  }
  if (Array.isArray(snapshots)) {
    for (const s of snapshots) await saveSnapshot(s);
  }
  if (settings) {
    await saveSettings(settings);
  }

  return true;
}
