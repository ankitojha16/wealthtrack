/**
 * Validates and sanitizes a redirect destination URL to prevent open redirect vulnerabilities.
 * Ensures that the destination is strictly a safe, relative path within the application.
 */
export function sanitizeRedirectUrl(target: string | null | undefined, fallback: string = '/'): string {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Reject empty string or URLs with control characters
  if (!trimmed || /[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback;
  }

  // Must begin with a single '/' and not '//' or '/\' (which browsers treat as protocol-relative URLs)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Reject URLs containing javascript:, data:, vbscript:, or protocol schemes
  if (
    trimmed.toLowerCase().includes('javascript:') ||
    trimmed.toLowerCase().includes('data:') ||
    trimmed.toLowerCase().includes('vbscript:') ||
    /^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return fallback;
  }

  return trimmed;
}

export type LocalAuthUser = {
  id: string;
  email: string;
  isGuest?: boolean;
};

const LOCAL_AUTH_LEGACY_KEY = 'wealthtrack_local_auth_users';
const LOCAL_SESSION_KEY = 'wealthtrack_local_auth_session';
const LOCAL_MIGRATION_FLAG_KEY = 'wealthtrack_local_migration_completed';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    purgeInsecureStorage(window.localStorage);
    return window.localStorage;
  }

  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    purgeInsecureStorage(globalThis.localStorage);
    return globalThis.localStorage;
  }

  return null;
}

/**
 * Automatically purge any legacy plaintext or hashed password records from localStorage
 * to ensure user credentials are never retained on the client filesystem.
 */
export function purgeInsecureStorage(storage?: Storage): void {
  try {
    const s = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (s && s.getItem(LOCAL_AUTH_LEGACY_KEY)) {
      s.removeItem(LOCAL_AUTH_LEGACY_KEY);
    }
  } catch {
    // Ignore storage access errors in private browsing modes
  }
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

/**
 * Local-only guest/offline provisioning.
 * IMPORTANT: No passwords or password hashes are ever written to localStorage.
 * Supabase Auth is the sole authority for secure user identity.
 */
export function signUpLocal(
  email: string,
  password: string,
  confirmPassword: string = password,
  _favoriteFruit?: string
): LocalAuthUser | null {
  const validation = validateSignupCredentials(email, password, confirmPassword);
  if (!validation.ok) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const user: LocalAuthUser = { id, email: normalizedEmail, isGuest: true };
  const storage = getStorage();
  if (storage) {
    storage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  }

  return user;
}

export function resetLocalPassword(email: string, _favoriteFruit: string, newPassword: string): boolean {
  if (!email.trim() || newPassword.length < 8) return false;
  return true;
}

export function signInLocal(email: string, password: string): LocalAuthUser | null {
  if (!email || !password || password.length < 8) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const id = `local_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const sessionUser: LocalAuthUser = { id, email: normalizedEmail, isGuest: true };

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
    storage.removeItem(LOCAL_AUTH_LEGACY_KEY);
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

/**
 * Security audit helper: verifies that no client-side password stores exist.
 */
export function isCredentialStorageSecure(): boolean {
  const storage = getStorage();
  if (!storage) return true;
  return storage.getItem(LOCAL_AUTH_LEGACY_KEY) === null;
}

/**
 * Migration strategy helper:
 * Records migration completion status so existing local records are preserved
 * without duplicate uploads.
 */
export function isLocalMigrationCompleted(userId: string): boolean {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(`${LOCAL_MIGRATION_FLAG_KEY}_${userId}`) === 'true';
}

export function markLocalMigrationCompleted(userId: string): void {
  const storage = getStorage();
  if (storage) {
    storage.setItem(`${LOCAL_MIGRATION_FLAG_KEY}_${userId}`, 'true');
  }
}
