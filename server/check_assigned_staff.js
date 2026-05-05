import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const staffId = '62b3888e-4438-4e36-9f67-0ea5bbafb725';
  
  const { data: b } = await supabaseAdmin.from('bookings').select('id, staff_id, guest_email').eq('staff_id', staffId);
  const { data: b2 } = await supabaseAdmin.from('bookings').select('id, staff_id, guest_email').order('created_at', { ascending: false }).limit(5);

  console.log('Bookings explicitly assigned to this staff:', b);
  console.log('Recent 5 bookings ever created:', b2);
}

check();
