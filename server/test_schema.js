import { supabaseAdmin } from './src/config/supabaseClient.js';

async function check() {
  const { data, error } = await supabaseAdmin.from('salons').select('id').limit(1);
  console.log('Salons ID type:', typeof data?.[0]?.id, data?.[0]?.id);
  
  const { data: p, error: pe } = await supabaseAdmin.from('profiles').select('assigned_shop').limit(1);
  console.log('Profiles assigned_shop type:', typeof p?.[0]?.assigned_shop, p?.[0]?.assigned_shop);
}

check();
