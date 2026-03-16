import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const email = 'nafuhnaf789@gmail.com';
    const password = 'nafih789';

    console.log(`[1] Authenticating as ${email}...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error(`[-] Login failed! Check if password was strictly created differently before:`, signInError.message);
      return;
    }

    console.log(`[+] Successfully authenticated. User ID: ${signInData.user.id}`);

    console.log(`[3] Promoting account to ADMIN role in profiles table...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', signInData.user.id);

    if (profileError) {
      console.error(`[-] Database error updating role:`, profileError.message);
    } else {
      console.log(`[+] User successfully promoted to Admin! You can log in now.`);
    }
  } catch (e) {
    console.error("Caught exception:", e);
  }
}

main();
