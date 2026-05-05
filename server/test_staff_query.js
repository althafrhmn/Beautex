import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuery() {
  const email = 'althafrahman961@gmail.com';
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, assigned_shop')
    .eq('email', email)
    .single();

  console.log('Profile:', profile);

  if (!profile?.assigned_shop) return console.log('No shop assigned');

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
        id, booking_number, booking_date, start_time, end_time, status, total_price, guest_email, staff_id,
        customer:customer_id(id, full_name, phone_number, email),
        staff(id, full_name),
        booking_services(services(id, name, price, duration_minutes))
    `)
    .eq('salon_id', profile.assigned_shop)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Query Error:', error);
  } else {
    console.log('Results Count:', data.length);
    if (data.length > 0) {
      console.log('Sample result:', JSON.stringify(data[0], null, 2));
    }
  }
}

testQuery();
