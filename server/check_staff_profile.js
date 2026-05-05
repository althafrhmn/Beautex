import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: prof } = await supabaseAdmin.from('profiles').select('*').eq('role', 'staff').order('created_at', { ascending: false }).limit(5);
  console.log('Recent staff profiles:', prof);
}

check();
