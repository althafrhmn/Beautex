/**
 * Cleanup Script — Deletes all dummy/test data
 * Run with: node cleanup_dummy_data.js
 *
 * What it deletes:
 *   - All staff users (profiles with role='staff') + their auth accounts
 *   - All customer users (profiles with role='customer') + their auth accounts
 *   - All salons/shops
 *   - All bookings, booking_services, payments, services, reviews
 *
 * What it PRESERVES:
 *   - Profiles with role='admin', 'manager', or 'receptionist'
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function deleteAuthUser(id) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) console.warn(`  ⚠ Could not delete auth user ${id}: ${error.message}`);
}

async function run() {
    console.log('\n========================================');
    console.log('   BeauteX — Dummy Data Cleanup Script  ');
    console.log('========================================\n');

    const confirm = await ask('⚠️  This will permanently delete all staff, customers, shops, bookings, services and reviews.\nType YES to continue: ');
    if (confirm.trim().toLowerCase() !== 'yes') {
        console.log('Aborted.');
        rl.close();
        return;
    }

    // ── 1. Delete bookings & related tables ────────────────────────────────
    console.log('\n[1/6] Deleting booking_services...');
    const { error: bsErr } = await supabase.from('booking_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (bsErr) console.warn('  ⚠', bsErr.message); else console.log('  ✓ Done');

    console.log('[2/6] Deleting payments...');
    const { error: payErr } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (payErr) console.warn('  ⚠', payErr.message); else console.log('  ✓ Done');

    console.log('[3/6] Deleting bookings...');
    const { error: bookErr } = await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (bookErr) console.warn('  ⚠', bookErr.message); else console.log('  ✓ Done');

    // ── 2. Delete reviews ───────────────────────────────────────────────────
    console.log('[4/6] Deleting reviews...');
    const { error: revErr } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (revErr) console.warn('  ⚠', revErr.message); else console.log('  ✓ Done');

    // ── 3. Delete services ──────────────────────────────────────────────────
    console.log('[5/6] Deleting services...');
    const { error: svcErr } = await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (svcErr) console.warn('  ⚠', svcErr.message); else console.log('  ✓ Done');

    // ── 4. Delete salons/shops ──────────────────────────────────────────────
    console.log('[6/6] Deleting salons/shops...');
    const { error: salErr } = await supabase.from('salons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (salErr) console.warn('  ⚠', salErr.message); else console.log('  ✓ Done');

    // ── 5. Delete staff users ───────────────────────────────────────────────
    console.log('\n[Staff] Fetching staff profiles...');
    const { data: staffList, error: staffFetchErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'staff');

    if (staffFetchErr) {
        console.warn('  ⚠ Could not fetch staff:', staffFetchErr.message);
    } else {
        console.log(`  Found ${staffList.length} staff member(s).`);
        for (const s of staffList) {
            console.log(`  Deleting staff: ${s.full_name} (${s.email})`);
            await supabase.from('profiles').delete().eq('id', s.id);
            await deleteAuthUser(s.id);
        }
        console.log('  ✓ All staff deleted');
    }

    // ── 6. Delete customer users ────────────────────────────────────────────
    console.log('\n[Customers] Fetching customer profiles...');
    const { data: customerList, error: custFetchErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'customer');

    if (custFetchErr) {
        console.warn('  ⚠ Could not fetch customers:', custFetchErr.message);
    } else {
        console.log(`  Found ${customerList.length} customer(s).`);
        for (const c of customerList) {
            console.log(`  Deleting customer: ${c.full_name} (${c.email})`);
            await supabase.from('profiles').delete().eq('id', c.id);
            await supabase.from('customers').delete().eq('id', c.id);
            await deleteAuthUser(c.id);
        }
        console.log('  ✓ All customers deleted');
    }

    console.log('\n========================================');
    console.log('   Cleanup complete!');
    console.log('   Admin accounts were preserved.');
    console.log('========================================\n');
    rl.close();
}

run().catch(err => {
    console.error('Fatal error:', err);
    rl.close();
    process.exit(1);
});
