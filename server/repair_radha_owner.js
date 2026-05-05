import { supabaseAdmin } from './src/config/supabaseClient.js';

async function repairRadha() {
    const email = 'althafrahman961@gmail.com';
    const password = 'Radha@123';
    const salonId = '1effd55b-ad0e-4972-9aa4-33bd3e49b93c';

    console.log(`--- Repairing Owner: ${email} for Salon ${salonId} ---`);

    try {
        // 1. Sync Auth User
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        let authId = users.find(u => u.email === email)?.id;

        if (authId) {
            console.log(`Found existing user: ${authId}. Updating password...`);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authId, {
                password: password,
                user_metadata: { role: 'staff', full_name: 'Radha Owner' }
            });
            if (updateError) throw updateError;
        } else {
            console.log(`User not found. Creating new auth user...`);
            const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'staff', full_name: 'Radha Owner' }
            });
            if (createError) throw createError;
            authId = authData?.user?.id;
        }

        // 2. Sync Profile
        if (authId) {
            console.log(`Syncing Profile for role 'staff'...`);
            const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
                id: authId,
                email: email,
                role: 'staff',
                full_name: 'Radha Owner',
                assigned_shop: salonId,
                manager_pin: '1234'
            });
            if (profileError) throw profileError;

            // 3. Sync Salon
            console.log(`Updating Salon owner_email...`);
            const { error: salonError } = await supabaseAdmin.from('salons').update({
                owner_email: email
            }).eq('id', salonId);
            if (salonError) throw salonError;
        }

        console.log(`--- REPAIR COMPLETE ---`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error(`ERROR:`, error.message);
    }
}

repairRadha();
