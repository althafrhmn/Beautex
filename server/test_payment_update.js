import { supabaseAdmin } from './src/config/supabaseClient.js';
import fs from 'fs';

async function testPaymentUpdate() {
    const booking_id = 'b45b31fe-ebef-4bcb-9094-aab1d5587930';
    
    console.log("Attempting to update payment for booking:", booking_id);
    const { data, error } = await supabaseAdmin
        .from('payments')
        .update({ 
            status: 'completed',
            transaction_id: `QR-SELF-TEST`,
            updated_at: new Date()
        })
        .eq('booking_id', booking_id)
        .select();

    if (error) {
        fs.writeFileSync('error_out.txt', JSON.stringify(error, null, 2));
        console.error("Update failed. Run 'type error_out.txt' to see details.");
    } else {
        console.log("Update succeeded:", data);
    }
}

testPaymentUpdate();
