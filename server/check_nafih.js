import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findNafihBookings() {
  const email = '%nafih%';
  const { data: b } = await supabaseAdmin.from('bookings').select('id, guest_email, customer_id, total_price, status').ilike('guest_email', email);
  console.log('Bookings with nafih in guest_email:', b);
}

findNafihBookings();
