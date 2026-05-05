import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function dumpOutput() {
  const { data: prof } = await supabaseAdmin.from('profiles').select('email, role, assigned_shop').eq('role', 'staff').order('created_at', { ascending: false }).limit(20);
  fs.writeFileSync('staff_debug.json', JSON.stringify(prof, null, 2));

  // Also dump bindings for the specific salon if assigned_shop is found
  if (prof && prof.length > 0 && prof[0].assigned_shop) {
    const { data: b } = await supabaseAdmin.from('bookings').select('id, salon_id, staff_id, status, total_price').eq('salon_id', prof[0].assigned_shop).order('created_at', { ascending: false }).limit(20);
    fs.writeFileSync('bookings_debug.json', JSON.stringify(b, null, 2));
  }
}

dumpOutput();
