import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log("Checking tables with anon key...");
  let res;
  res = await supabase.from('transactions').select('*').limit(1);
  console.log("Transactions:", res.error?.message || "OK");
  
  res = await supabase.from('goals').select('*').limit(1);
  console.log("Goals:", res.error?.message || "OK");
  
  res = await supabase.from('loans').select('*').limit(1);
  console.log("Loans:", res.error?.message || "OK");
  
  res = await supabase.from('investments').select('*').limit(1);
  console.log("Investments:", res.error?.message || "OK");
}
test();
