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

const diverseServices = [
    {
        name: "Gold Radiance Ritual",
        description: "A 24K gold-infused facial treatment that restores luminosity and firms the skin for an ethereal glow.",
        price: 4500,
        duration_minutes: 90,
        category: "Skin",
        image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Diamond Micro-Peel",
        description: "Advanced exfoliation using diamond-tipped precision to resurface skin and eliminate imperfections.",
        price: 3800,
        duration_minutes: 60,
        category: "Skin",
        image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Master Balayage Artistry",
        description: "Hand-painted sun-kissed highlights tailored to your hair's natural flow and skin tone.",
        price: 8500,
        duration_minutes: 180,
        category: "Hair",
        image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Keratin Liquid Silk Treatment",
        description: "Deep infusion of silk proteins to eliminate frizz and provide mirror-like shine for up to 4 months.",
        price: 6500,
        duration_minutes: 150,
        category: "Hair",
        image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Himalayan Stone Alchemy",
        description: "Direct thermotherapy using heated pink salt stones to melt away deep-seated muscular tension.",
        price: 3200,
        duration_minutes: 75,
        category: "Wellness",
        image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Royal Mughal Bridal Set",
        description: "A comprehensive wedding day transformation including high-definition makeup and traditional draping.",
        price: 25000,
        duration_minutes: 300,
        category: "Bridal",
        image_url: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Executive Precision Sculpt",
        description: "Premium grooming experience featuring hot towel shave and architectural beard design.",
        price: 1200,
        duration_minutes: 45,
        category: "Grooming",
        image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
        is_active: true
    },
    {
        name: "Oxygen Infusion Therapy",
        description: "Pure oxygen and specialized serums delivered deep into the dermis for instant plumping.",
        price: 5500,
        duration_minutes: 45,
        category: "Skin",
        image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
        is_active: true
    }
];

const diverseShops = [
    {
        name: "The Palace Sanctuary",
        address: "Imperial Towers, Altamount Road",
        city: "Mumbai",
        owner_name: "Vikram Mehta",
        phone: "+91 22 2351 0000",
        opening_time: "10:00 AM",
        closing_time: "09:00 PM",
        image_url: "https://images.unsplash.com/photo-1512690196152-730d4375338c?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Emerald Oasis",
        address: "Indiranagar 100 Feet Road",
        city: "Bangalore",
        owner_name: "Anita Rao",
        phone: "+91 80 4123 4567",
        opening_time: "09:00 AM",
        closing_time: "08:30 PM",
        image_url: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Azure Retreat",
        address: "Marine Drive Promenade",
        city: "Kochi",
        owner_name: "Faisal Rahman",
        phone: "+91 484 235 9999",
        opening_time: "08:00 AM",
        closing_time: "10:00 PM",
        image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Golden Hour Studio",
        address: "Civil Station Junction",
        city: "Kozhikode",
        owner_name: "Sarah Jacob",
        phone: "+91 495 244 8888",
        opening_time: "09:30 AM",
        closing_time: "08:00 PM",
        image_url: "https://images.unsplash.com/photo-1595475243692-3a387f34081c?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Verve Gentlemen's Lounge",
        address: "Bypass Road, Perintalmanna",
        city: "Malappuram",
        owner_name: "Sameer Ibrahim",
        phone: "+91 98470 55555",
        opening_time: "10:00 AM",
        closing_time: "10:00 PM",
        image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"
    }
];

async function seed() {
    console.log('--- Starting Comprehensive Seeding ---');

    // 1. Seed Services
    console.log('Seeding Services...');
    const { data: sData, error: sErr } = await supabase
        .from('services')
        .upsert(diverseServices, { onConflict: 'name' });
    
    if (sErr) console.error('Error seeding services:', sErr);
    else console.log('Services seeded successfully.');

    // 2. Seed Shops
    console.log('Seeding Shops...');
    const { data: hData, error: hErr } = await supabase
        .from('salons')
        .upsert(diverseShops, { onConflict: 'name' });
    
    if (hErr) console.error('Error seeding shops:', hErr);
    else console.log('Shops seeded successfully.');

    console.log('--- Seeding Completed ---');
}

seed();
