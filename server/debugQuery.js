import { getReminderTemplate } from './src/utils/emailTemplates.js';
import supabase, { supabaseAdmin } from './src/config/supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const debugQuery = async () => {
    const todayStr = '2026-05-06';
    const startTimeWindow = '14:45';
    const endTimeWindow = '15:15';

    console.log(`Searching for slots between ${startTimeWindow} and ${endTimeWindow} on ${todayStr}`);

    let query = supabaseAdmin
        .from('bookings')
        .select('*, salons(name)')
        .eq('booking_date', todayStr)
        .eq('status', 'confirmed')
        .gte('start_time', startTimeWindow)
        .lte('start_time', endTimeWindow);
    
    const { data: allUpcoming, error } = await query;
    console.log("Query result:", allUpcoming);
    if (error) console.error("Error:", error);
    process.exit();
};

debugQuery();
