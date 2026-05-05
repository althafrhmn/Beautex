import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAdmin() {
    const email = 'althafrahman960@gmail.com';
    const password = 'Beautex123';
    const fullName = 'Althaf Rahman';

    console.log(`Setting up Admin account for ${email}...`);

    try {
        // 1. Check if user already exists in auth
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        let userId;

        if (existingUser) {
            console.log('User already exists in Auth. Updating password and role...');
            userId = existingUser.id;
            
            // Update password
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: password,
                user_metadata: { full_name: fullName, role: 'admin' }
            });
            if (updateError) throw updateError;
        } else {
            console.log('Creating new Auth user...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: { full_name: fullName, role: 'admin' }
            });
            if (createError) throw createError;
            userId = newUser.user.id;
        }

        // 2. Upsert Profile to ensure it has 'admin' role
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,
                email: email,
                role: 'admin'
            });

        if (profileError) throw profileError;

        console.log('SUCCESS: Admin account setup complete!');
        console.log(`Email: ${email}`);
        console.log('Login: http://localhost:5173/admin/login');

    } catch (error) {
        console.error('FAILED to setup admin:', error.message);
    }
}

setupAdmin();
