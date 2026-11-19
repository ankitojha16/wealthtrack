import { supabase } from './client';
import { getUpsertConflictTarget } from './upsertConfig';
import { prepareRecordPayload } from './payloadBuilder';

export type UserSession = { id: string; email?: string | null };

export async function getActiveUser(): Promise<UserSession | null> {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? null };
}

function toUserFriendlyAuthError(error: { message?: string; name?: string; status?: number; code?: string } | null | undefined, action: 'login' | 'signup' | 'reset') {
  const message = error?.message?.toLowerCase() ?? '';

  if (message.includes('invalid login credentials') || message.includes('invalid credentials') || message.includes('wrong password')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (message.includes('email not confirmed') || message.includes('user not confirmed') || error?.code === 'email_not_confirmed' || error?.code === 'user_not_found') {
    return 'Your email is not confirmed yet. Check your inbox for the confirmation link or request a new one.';
  }

  if (message.includes('too many requests') || message.includes('rate limit') || error?.status === 429) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  if (message.includes('network') || error?.name === 'TypeError') {
    return 'Network error. Please check your connection and try again.';
  }

  if (action === 'signup' && (message.includes('signup is disabled') || message.includes('signups not allowed'))) {
    return 'New signups are temporarily disabled. Please try again later.';
  }

  if (action === 'reset' && (message.includes('user not found') || message.includes('no user found'))) {
    return 'No account is associated with that email address.';
  }

  if (message.includes('password') && (message.includes('weak') || message.includes('validation'))) {
    return 'Password does not meet the platform requirements. Please choose a stronger password.';
  }

  return error?.message || 'Authentication failed. Please try again.';
}

export async function signInWithPassword(email: string, password: string): Promise<UserSession | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(toUserFriendlyAuthError(error, 'login'));
  }
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

export async function signUpWithEmail(email: string, password: string): Promise<UserSession | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw new Error(toUserFriendlyAuthError(error, 'signup'));
  }
  if (!data.session && data.user) {
    throw new Error('Please check your email to verify your account before logging in.');
  }
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function resetPasswordForEmail(email: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/settings`,
  });
  if (error) {
    throw new Error(toUserFriendlyAuthError(error, 'reset'));
  }
}

export type FetchResult<T> = {
  data: T[] | null;
  error: Error | null;
};

export async function listRecords<T>(table: string, userId: string): Promise<T[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    const errorMsg = `[supabase:${table}] query failed: ${error.message}`;
    console.error(errorMsg, error);
    throw new Error(errorMsg);
  }

  const rows = (data ?? []) as any[];
  if (table === 'snapshots') {
    return rows.map((r) => ({
      ...r,
      netWorth: r.netWorth ?? r.net_worth ?? 0,
      net_worth: r.net_worth ?? r.netWorth ?? 0,
    })) as T[];
  }

  return rows as T[];
}

export async function safeListRecords<T>(table: string, userId: string): Promise<FetchResult<T>> {
  try {
    const data = await listRecords<T>(table, userId);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function upsertRecord<T extends { id?: string; user_id?: string | null; key?: string; category?: string; monthYear?: string }>(
  table: string,
  row: T,
  userId: string
): Promise<T> {
  const payload: any = prepareRecordPayload(table, row, userId);

  if (!supabase) return payload as T;

  const conflictTarget = getUpsertConflictTarget(table);

  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: conflictTarget })
    .select()
    .single();

  if (error) {
    const message = `[supabase:${table}] upsert failed: ${error.message}`;
    console.error(message, { table, row: payload, error });
    throw new Error(error.message);
  }

  const result: any = data ?? payload;
  if (table === 'snapshots') {
    result.netWorth = result.netWorth ?? result.net_worth ?? 0;
  }

  return result as T;
}

export async function deleteRecord(table: string, id: string, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
  if (error) {
    const message = `[supabase:${table}] delete failed: ${error.message}`;
    console.error(message, { table, id, userId, error });
    throw new Error(message);
  }
}
