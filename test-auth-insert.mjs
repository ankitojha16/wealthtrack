import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log("Signing up test user...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test@test.com',
    password: 'Password123!',
  });
  
  if (authError) {
    console.log("Signup error:", authError.message);
    return;
  }
  
  const user = authData.user;
  console.log("User created:", user.id);
  
  console.log("Trying to insert investment...");
  const { data, error } = await supabase.from('investments').upsert([
    {
      id: 'test-inv-2',
      user_id: user.id,
      type: 'SIP',
      name: 'Test SIP',
      investedAmount: 1000,
      currentValue: 1000,
      createdAt: Date.now(),
      lastUpdatedAt: new Date().toISOString()
    }
  ]).select();
  console.log("Result:", data, error?.message, error?.code);
}
test();
