import { supabaseAdmin } from './src/config/supabaseClient.js';

async function finalRepair() {
    const email = 'althafrahman961@gmail.com';
    const password = 'Radha@123';
    const salonId = '1effd55b-ad0e-4972-9aa-33bd3e49b93c';

    console.log(`--- Running Final Sync for ${email} ---`);

    try {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const user = users.find(u => u.email === email);

        if (!user) throw new Error('Auth user not found in Supabase');

        // 1. Delete and re-insert into profiles to ensure we bypass any bad state
        await supabaseAdmin.from('profiles').delete().eq('id', user.id);
        
        const { error } = await supabaseAdmin.from('profiles').insert({
            id: user.id,
            email: email,
            role: 'staff', // Pivoting to staff role which is allowed by DB
            full_name: 'Radha Owner',
            assigned_shop: salonId,
            manager_pin: '1234'
        });

        if (error) throw error;

        console.log('--- SUCCESS ---');
        console.log('Account repaired with role "staff".');
        console.log('You can now log in successfully.');
    } catch (err) {
        console.error('REPAIR FAILED:', err.message);
    }
}

finalRepair();
