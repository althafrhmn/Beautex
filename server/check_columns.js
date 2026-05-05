import { supabaseAdmin } from './src/config/supabaseClient.js';

async function check() {
    const { data } = await supabaseAdmin.from('profiles').select('*').limit(1);
    console.log("COLUMNS:");
    console.log(JSON.stringify(Object.keys(data[0] || {}), null, 2));
}

check();
