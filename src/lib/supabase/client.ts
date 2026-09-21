import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const isSupabaseAuthEnabled =
  process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === 'true' ||
  process.env.ENABLE_SUPABASE_AUTH === 'true' ||
  Boolean(supabaseUrl && supabaseAnonKey);

export const supabase =
  isSupabaseAuthEnabled && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const hasSupabaseConfig = () => Boolean(supabase);
export const isLocalOnlyMode = () => !hasSupabaseConfig();
