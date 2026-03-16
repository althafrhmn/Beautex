import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key in client .env file');
}

// Validation: Supabase keys are JWTs and must start with eyJ
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
    console.error('CRITICAL: Your VITE_SUPABASE_ANON_KEY format is invalid. It should start with "eyJ...". Please check your Supabase API settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
