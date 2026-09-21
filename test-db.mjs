import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log("Inserting investment...");
  const { data, error } = await supabase.from('investments').insert([
    {
      id: 'test-inv-1',
      user_id: '12345678-1234-1234-1234-123456789012',
      type: 'SIP',
      name: 'Test SIP',
      investedAmount: 1000,
      currentValue: 1000,
      investmentDate: '2026-01-01',
      createdAt: Date.now(),
      lastUpdatedAt: new Date().toISOString()
    }
  ]).select();
  console.log("Result:", data, error?.message);
}
test();
