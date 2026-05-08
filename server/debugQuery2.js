import supabase, { supabaseAdmin } from './src/config/supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const debugQuery2 = async () => {
    const todayStr = '2026-05-06';
    const startTimeWindow = '14:50';
    const endTimeWindow = '15:00';

    console.log(`Searching for slots between ${startTimeWindow} and ${endTimeWindow} on ${todayStr}`);

    let query = supabaseAdmin
        .from('bookings')
        .select('*, salons(name)')
        .eq('booking_date', todayStr)
        .eq('status', 'confirmed')
        .gte('start_time', startTimeWindow)
        .lte('start_time', endTimeWindow);
    
    const { data: allUpcoming, error } = await query;
    console.log("Query result length:", allUpcoming?.length);
    console.log("Data:", allUpcoming?.map(b => b.start_time));
    process.exit();
};

debugQuery2();
