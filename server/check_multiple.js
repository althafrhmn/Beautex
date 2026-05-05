import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMultiple() {
  const email = 'althafrahman960@gmail.com';
  console.log('Fetching profiles for:', email);
  
  const { data: profs } = await supabaseAdmin.from('profiles').select('id, email, loyalty_points').eq('email', email);
  console.log('Profiles:', profs);
}

checkMultiple();
