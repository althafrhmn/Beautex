import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPoints() {
  const { data, error } = await supabaseAdmin.from('profiles').select('id, email, full_name, role, loyalty_points');
  if (error) {
    console.error('Error fetching:', error);
  } else {
    for(const d of data) {
         console.log(d.email, 'Points:', d.loyalty_points);
    }
  }
}

checkPoints();
