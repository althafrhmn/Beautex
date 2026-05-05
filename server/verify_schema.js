import { supabaseAdmin } from './src/config/supabaseClient.js';

async function verify() {
    console.log("Checking profiles table schema...");
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(1);
    
    if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
    }

    if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        if (columns.includes('loyalty_points')) {
            console.log("✅ Success: 'loyalty_points' column is present.");
            console.log("Current value example:", data[0].loyalty_points);
        } else {
            console.error("❌ Error: 'loyalty_points' column is MISSING.");
        }
    } else {
        console.log("⚠️ No profiles found to check. Please ensure at least one profile exists.");
    }
}

verify();
