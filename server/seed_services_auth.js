import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const services = [
    { name: "Executive Precision Cut", description: "Bespoke architectural haircut and styling.", price: 1200, duration_minutes: 45, category: "Hair", image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" },
    { name: "Gold Radiance Ritual", description: "Luminous skin treatment using 24K gold foil.", price: 4500, duration_minutes: 90, category: "Skin", image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800" },
    { name: "Himalayan Salt Therapy", description: "Deep tissue massage with heated pink salt stones.", price: 3500, duration_minutes: 75, category: "Massage", image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=800" },
    { name: "Diamond Micro-Derm", description: "Advanced resurfacing for mirror-smooth skin.", price: 3800, duration_minutes: 60, category: "Skin", image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=800" },
    { name: "Azure Oxygen Blast", description: "Pure oxygen serums for instant dermal plumping.", price: 5500, duration_minutes: 45, category: "Skin", image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800" },
    { name: "Silk Keratin Infusion", description: "Deep protein treatment for frizz-free silk hair.", price: 6500, duration_minutes: 150, category: "Hair", image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800" },
    { name: "Royal Bridal Alchemy", description: "Total wedding transformation with HD artistry.", price: 25000, duration_minutes: 300, category: "Other", image_url: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=800" },
    { name: "Architectural Nails", description: "Geometric precision and artistic expression for your hands.", price: 2200, duration_minutes: 60, category: "Nails", image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1200" }
];

async function seed() {
    console.log('Authenticating as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'nafuhnaf789@gmail.com',
        password: 'nafih789'
    });

    if (authError) {
        console.error('Auth error:', authError.message);
        return;
    }

    console.log('Successfully authenticated. Inserting services...');
    // Clear existing to avoid duplicates if necessary, or just insert
    // But since name isn't unique in schema (unless I missed it), I'll just insert
    for (const service of services) {
        const { error } = await supabase.from('services').insert([service]);
        if (error) {
            console.error(`Error inserting ${service.name}:`, error.message);
        } else {
            console.log(`Inserted ${service.name}`);
        }
    }
}

seed();
