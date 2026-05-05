import { supabaseAdmin } from './src/config/supabaseClient.js';

async function testPaymentInsert() {
    const { data: booking } = await supabaseAdmin.from('bookings').select('id').limit(1).single();
    
    if (!booking) {
        console.log("No booking found to test with");
        return;
    }

    console.log("Testing payment insert with customer_id: null");
    const { data, error } = await supabaseAdmin
        .from('payments')
        .insert([{
            booking_id: booking.id,
            customer_id: null,
            amount: 100,
            payment_method: 'qr',
            status: 'pending',
            transaction_id: 'TEST-123'
        }])
        .select();

    if (error) {
        console.error("INSERT FAILED:", error.message);
    } else {
        console.log("INSERT SUCCEEDED:", data);
        
        // Clean up
        await supabaseAdmin.from('payments').delete().eq('transaction_id', 'TEST-123');
    }
}

testPaymentInsert();
