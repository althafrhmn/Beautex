import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function fixOwner() {
  const email = 'althafrahman961@gmail.com';
  const password = 'Radha@123'; // Setting a fresh known password
  const salonName = 'Radha';

  console.log(`--- Fixing Owner Account: ${email} ---`);

  try {
    // 1. Find the salon ID
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('id, name')
      .ilike('name', `%${salonName}%`)
      .single();

    if (salonError || !salon) {
        console.error('Error finding salon:', salonError?.message || 'Salon not found');
        return;
    }
    console.log(`Found Salon: ${salon.name} (${salon.id})`);

    // 2. Find Auth User
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    let userId;
    if (user) {
      console.log(`Found existing Auth user: ${user.id}`);
      userId = user.id;
      
      // Update Auth Password and metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { role: 'manager', full_name: 'Radha Owner' },
        email_confirm: true
      });
      if (updateError) throw updateError;
      console.log('Successfully updated Auth password.');
    } else {
      console.log('User not found in Auth. Creating new...');
      const { data: newData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'manager', full_name: 'Radha Owner' }
      });
      if (createError) throw createError;
      userId = newData.user.id;
      console.log(`Created new Auth user: ${userId}`);
    }

    // 3. Sync Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        role: 'manager',
        full_name: 'Radha Owner',
        assigned_shop: salon.id
      });

    if (profileError) throw profileError;
    console.log('Successfully synced Profile table.');

    // 4. Update Salon owner_email
    await supabaseAdmin.from('salons').update({ owner_email: email }).eq('id', salon.id);
    
    console.log('\n--- SUCCESS ---');
    console.log(`Credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('----------------');

  } catch (err) {
    console.error('Operation failed:', err.message);
  }
}

fixOwner();
