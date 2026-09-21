export * from './client';

export type SupabaseRecord = {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export const isSupabaseReady = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
