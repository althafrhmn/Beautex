import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deepAnalyze() {
  // 1. Get some salons to see their IDs and Names
  const { data: salons } = await supabaseAdmin.from('salons').select('id, name').limit(10);
  
  // 2. Map of salon names to IDs
  const salonMap = {};
  if (salons) {
    salons.forEach(s => {
      salonMap[s.name] = s.id;
    });
  }

  // 3. Get all staff profiles
  const { data: staff } = await supabaseAdmin.from('profiles').select('id, email, role, assigned_shop').eq('role', 'staff');
  
  // 4. Find staff with name-based assigned_shop
  const inconsistentStaff = staff?.filter(s => s.assigned_shop && s.assigned_shop.length > 0 && !s.assigned_shop.includes('-')) || [];

  // 5. Check bookings for each salon
  const bookingSummary = {};
  if (salons) {
    for (const s of salons) {
       const { count } = await supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('salon_id', s.id);
       bookingSummary[s.name] = { id: s.id, bookingCount: count };
    }
  }

  const report = {
    salonMap,
    staffCount: staff?.length || 0,
    inconsistentStaffCount: inconsistentStaff.length,
    inconsistentStaffEmails: inconsistentStaff.map(s => s.email),
    bookingSummary
  };

  fs.writeFileSync('deep_analysis.json', JSON.stringify(report, null, 2));
}

deepAnalyze();
