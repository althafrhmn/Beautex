import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: prof } = await supabaseAdmin.from('profiles').select('email, loyalty_points').eq('email', 'althafrahman960@gmail.com').single();
  console.log('Profile:', prof);
}

check();
