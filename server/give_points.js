import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
  const email = 'althafrahman960@gmail.com';
  // Just set it to 106 because the user requested it.
  await supabaseAdmin.from('profiles').update({ loyalty_points: 106 }).eq('email', email);
  console.log('Done!');
}

fix();
