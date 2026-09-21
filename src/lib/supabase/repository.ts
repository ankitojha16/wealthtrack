import { supabase } from './client';
import { getUpsertConflictTarget } from './upsertConfig';

export type UserSession = { id: string; email?: string | null };

export async function getActiveUser(): Promise<UserSession | null> {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? null };
}

export async function signInWithPassword(email: string, password: string): Promise<UserSession | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

export async function signUpWithEmail(email: string, password: string): Promise<UserSession | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) return null;
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
    throw new Error(error.message || 'Unable to send password reset email.');
  }
}

export async function listRecords<T>(table: string, userId: string): Promise<T[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`[supabase:${table}] list error`, error);
    return [];
  }

  return (data ?? []) as T[];
}

export async function upsertRecord<T extends { id?: string; user_id?: string | null; key?: string }>(table: string, row: T, userId: string): Promise<T> {
  if (!supabase) return row;

  const payload = { ...row, user_id: userId } as T & { user_id: string; id?: string; key?: string };

  if (!payload.id && table !== 'app_settings') {
    const identity = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    payload.id = identity;
  }

  if (table === 'app_settings' && !payload.id && payload.key) {
    payload.id = `${payload.key}:${userId}`;
  }

  const conflictTarget = getUpsertConflictTarget(table);

  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: conflictTarget })
    .select()
    .single();

  if (error) {
    const message = `[supabase:${table}] upsert failed: ${error.message}`;
    console.error(message, { table, row: payload, error });
    if (typeof window !== 'undefined') {
      alert(`Database Error: ${error.message}`);
    }
    throw new Error(error.message);
  }

  return (data ?? payload) as T;
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
