import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function dump() {
  const { data: bookings } = await supabaseAdmin.from('bookings').select('id, guest_email, customer_id, total_price, status').order('created_at', { ascending: false }).limit(20);
  fs.writeFileSync('output.json', JSON.stringify(bookings, null, 2));
}

dump();
