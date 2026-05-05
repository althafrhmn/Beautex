import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function repairUser() {
  const email = 'althafrahman960@gmail.com';
  console.log('Repairing user:', email);
  
  // 1. Get the current active profile
  const { data: profile, error: pErr } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (pErr || !profile) return console.error('Active profile not found.');

  const activeId = profile.id;
  console.log('Active Profile ID:', activeId);

  // 2. Point ALL bookings with this email (or old customer_ids) to this active ID
  const { data: bookings, error: bErr } = await supabaseAdmin
    .from('bookings')
    .select('id, total_price, status, points_used')
    .ilike('guest_email', email);

  if (bErr) return console.error('Bookings error:', bErr);

  let totalEarned = 0;
  let totalUsed = 0;

  for (const b of bookings) {
      // Transfer ownership
      await supabaseAdmin.from('bookings').update({ customer_id: activeId }).eq('id', b.id);
      
      if (['confirmed', 'completed'].includes(b.status)) {
          totalEarned += Math.floor((b.total_price || 0) / 100);
          totalUsed += (b.points_used || 0);
      }
  }

  // Calculate true balance
  // Make sure it doesn't drop below 0
  const finalPoints = Math.max(0, totalEarned - totalUsed);
  
  console.log(`Total Earned: ${totalEarned}, Total Used: ${totalUsed}, Final True Balance: ${finalPoints}`);

  // 3. Update the profile
  await supabaseAdmin.from('profiles').update({ loyalty_points: finalPoints }).eq('id', activeId);

  console.log('Repair complete!');
}

repairUser();
