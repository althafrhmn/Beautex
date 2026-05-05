import { supabaseAdmin } from './src/config/supabaseClient.js';

async function testInsert() {
    try {
        const { data: salon } = await supabaseAdmin.from('salons').select('id').limit(1).single();
        console.log('Salon ID:', salon.id);
        
        const { data, error } = await supabaseAdmin
            .from('products')
            .insert([{ 
                salon_id: salon.id, 
                name: 'Test Product', 
                description: 'Test', 
                price: 100, 
                stock_quantity: 2, 
                category: 'HAIR CARE', 
                image_url: 'http://example.com/img.jpg' 
            }])
            .select()
            .single();
            
        if (error) {
            console.error('Insert Error:', error);
        } else {
            console.log('Insert Success:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

testInsert();
