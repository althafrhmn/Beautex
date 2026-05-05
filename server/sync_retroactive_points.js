import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncGuestBookings() {
  console.log('Fetching all decoupled guest bookings...');
  const { data: bookings, error: bError } = await supabaseAdmin
    .from('bookings')
    .select('id, guest_email, customer_id, total_price, points_used, status')
    .is('customer_id', null)
    .not('guest_email', 'is', null);

  if (bError) return console.error('Error fetching bookings:', bError);

  console.log(`Found ${bookings.length} unassigned guest bookings.`);

  for (const b of bookings) {
    if (!b.guest_email) continue;
    const email = b.guest_email.toLowerCase().trim();

    // Find profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, loyalty_points')
      .eq('email', email)
      .maybeSingle();

    if (profile) {
      console.log(`Linking booking ${b.id} to ${email}`);
      // 1. Assign booking to customer
      await supabaseAdmin.from('bookings').update({ customer_id: profile.id }).eq('id', b.id);

      // 2. Add retroactive loyalty points if completed/confirmed
      if (['confirmed', 'completed'].includes(b.status)) {
         const pointsToAward = Math.floor((b.total_price || 0) / 100);
         const newPoints = (profile.loyalty_points || 0) + pointsToAward;
         
         await supabaseAdmin.from('profiles').update({ loyalty_points: newPoints }).eq('id', profile.id);
         console.log(`=> Awarded ${pointsToAward} points to ${email}. Total is now ${newPoints}.`);
      }
    }
  }

  // Double check nafihp23@gmail.com
  const { data: nProfile } = await supabaseAdmin.from('profiles').select('*').eq('email', 'nafihp23@gmail.com').maybeSingle();
  console.log('\\nFinal profile for nafihp23@gmail.com:', nProfile);
  
}

syncGuestBookings();
