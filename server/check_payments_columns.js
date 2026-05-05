import { supabaseAdmin } from './src/config/supabaseClient.js';

async function checkPaymentsTable() {
    console.log("Checking payments table columns...");
    
    // We can query the information_schema to get the exact columns
    const { data, error } = await supabaseAdmin.rpc('get_table_columns_v2', { table_name: 'payments' });
    
    // If we don't have an RPC for columns, let's just do a select limit 1
    const { data: payData, error: payErr } = await supabaseAdmin.from('payments').select('*').limit(1);
    
    if (payErr) {
        console.error("Error fetching from payments table:", payErr.message);
    } else {
        if (payData && payData.length > 0) {
            console.log("Columns in payments table:");
            console.log(Object.keys(payData[0]));
        } else {
            console.log("Payments table exists but is empty. We can't see columns via select * if it's empty in this JS environment easily, so let's insert a dummy row and rollback, or just try to select specific columns.");
            
            // Try to select known columns
            let cols = ['id', 'booking_id', 'customer_id', 'user_id', 'amount', 'status'];
            for (let col of cols) {
                const { error: colErr } = await supabaseAdmin.from('payments').select(col).limit(1);
                if (colErr) {
                    console.log(`Column ${col}: DOES NOT EXIST`);
                } else {
                    console.log(`Column ${col}: EXISTS`);
                }
            }
        }
    }
}

checkPaymentsTable();
