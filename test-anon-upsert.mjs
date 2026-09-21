import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log("Upserting with anon key...");
  const { data, error } = await supabase.from('investments').upsert([
    {
      id: 'test-inv-1',
      user_id: '12345678-1234-1234-1234-123456789012',
      type: 'SIP'
    }
  ]).select();
  console.log("Result:", data, error?.message, error?.details, error?.hint, error?.code);
}
test();
