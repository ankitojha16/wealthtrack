export type LocalAuthUser = {
  id: string;
  email: string;
};

const LOCAL_AUTH_KEY = 'wealthtrack_local_auth_users';
const LOCAL_SESSION_KEY = 'wealthtrack_local_auth_session';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  return null;
}

function readUsers(): Record<string, { email: string; password: string; id: string }> {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(LOCAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, { email: string; password: string; id: string }>) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(LOCAL_AUTH_KEY, JSON.stringify(users));
}

export function validateSignupCredentials(
  email: string,
  password: string,
  confirmPassword: string = password
): { ok: boolean; message: string } {
  const normalizedEmail = email?.trim().toLowerCase() ?? '';

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters long.' };
  }

  if (!confirmPassword || confirmPassword.trim() === '') {
    return { ok: false, message: 'Please re-enter your password to confirm it.' };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: 'Passwords do not match. Please enter the same password again.' };
  }

  return { ok: true, message: '' };
}

export function signUpLocal(email: string, password: string, confirmPassword: string = password): LocalAuthUser | null {
  const validation = validateSignupCredentials(email, password, confirmPassword);
  if (!validation.ok) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users[normalizedEmail]) return null;

  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  users[normalizedEmail] = { email: normalizedEmail, password, id };
  writeUsers(users);

  const user: LocalAuthUser = { id, email: normalizedEmail };
  const storage = getStorage();
  if (storage) {
    storage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  }

  return user;
}

export function signInLocal(email: string, password: string): LocalAuthUser | null {
  if (!email || !password) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const user = users[normalizedEmail];
  if (!user || user.password !== password) return null;

  const sessionUser: LocalAuthUser = { id: user.id, email: user.email };
  const storage = getStorage();
  if (storage) {
    storage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
  }

  return sessionUser;
}

export function signOutLocal(): void {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(LOCAL_SESSION_KEY);
  }
}

export function getLocalSessionUser(): LocalAuthUser | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
