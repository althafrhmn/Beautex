import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGuestBookings() {
  const email = 'nafihp23@gmail.com';
  console.log('Fetching guest bookings for:', email);
  
  const { data: bookings } = await supabaseAdmin.from('bookings').select('id, guest_email, customer_id, total_price, points_used, status').ilike('guest_email', email);
  console.log('Bookings with guest_email:', JSON.stringify(bookings, null, 2));

  // let's also check all bookings unconditionally to see if any point to customer_id
  const { data: cBookings } = await supabaseAdmin.from('bookings').select('id, guest_email, customer_id').order('created_at', { ascending: false }).limit(20);
  // count total
  console.log('Total recent bookings sample:', cBookings);
}

checkGuestBookings();
