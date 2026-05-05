import { supabaseAdmin } from './src/config/supabaseClient.js';
import fs from 'fs';

async function diagnose() {
    let output = "";
    const log = (msg) => { output += msg + "\n"; };

    log("=== BOOKING DIAGNOSTICS ===\n");

    // 1. Get recent bookings
    const { data: recentBookings, error: bErr } = await supabaseAdmin
        .from('bookings')
        .select('id, booking_number, customer_id, salon_id, status, payment_method, booking_date, start_time, total_price, guest_name, guest_email, guest_phone, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (bErr) {
        log("Error fetching bookings: " + bErr.message);
        fs.writeFileSync('diagnose_output.txt', output);
        return;
    }

    log(`Found ${recentBookings.length} recent bookings:\n`);
    for (const b of recentBookings) {
        log(`--- Booking: ${b.booking_number} ---`);
        log(`  ID:            ${b.id}`);
        log(`  Status:        ${b.status}`);
        log(`  Customer ID:   ${b.customer_id || 'NULL (NOT LINKED TO USER!)'}`);
        log(`  Salon ID:      ${b.salon_id}`);
        log(`  Guest Name:    ${b.guest_name || 'N/A'}`);
        log(`  Guest Email:   ${b.guest_email || 'N/A'}`);
        log(`  Guest Phone:   ${b.guest_phone || 'N/A'}`);
        log(`  Payment:       ${b.payment_method} | Rs.${b.total_price}`);
        log(`  Date:          ${b.booking_date} @ ${b.start_time}`);
        log(`  Created:       ${b.created_at}`);

        // Check if there's a payment record
        const { data: payments } = await supabaseAdmin
            .from('payments')
            .select('id, status, transaction_id')
            .eq('booking_id', b.id);
        
        if (payments && payments.length > 0) {
            for (const p of payments) {
                log(`  Payment Rec:   Status=${p.status}, TxnID=${p.transaction_id}`);
            }
        } else {
            log(`  Payment Rec:   NONE FOUND!`);
        }
        log('');
    }

    // 2. Get salon names for context
    const salonIds = [...new Set(recentBookings.map(b => b.salon_id).filter(Boolean))];
    if (salonIds.length > 0) {
        const { data: salons } = await supabaseAdmin
            .from('salons')
            .select('id, name')
            .in('id', salonIds);
        log("\nSalons involved:");
        (salons || []).forEach(s => log(`  ${s.id} = ${s.name}`));
    }

    // 3. Check customer profiles
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role, loyalty_points')
        .eq('role', 'customer')
        .limit(10);
    
    log("\nCustomer Profiles:");
    (profiles || []).forEach(p => {
        log(`  ${p.full_name} (${p.email}) | Points: ${p.loyalty_points} | ID: ${p.id}`);
    });

    log("\n=== DIAGNOSIS COMPLETE ===");
    
    fs.writeFileSync('diagnose_output.txt', output);
    console.log("Output written to diagnose_output.txt");
}

diagnose();
