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

const services = [
    { name: "Gold Radiance Ritual", description: "Luminous skin treatment using 24K gold foil.", price: 4500, duration_minutes: 90, category: "Skin", image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800" },
    { name: "Master Balayage Art", description: "Bespoke hand-painted highlights by master artists.", price: 8500, duration_minutes: 180, category: "Hair", image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800" },
    { name: "Diamond Micro-Derm", description: "Advanced resurfacing for mirror-smooth skin.", price: 3800, duration_minutes: 60, category: "Skin", image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=800" },
    { name: "Silk Keratin Infusion", description: "Deep protein treatment for frizz-free silk hair.", price: 6500, duration_minutes: 150, category: "Hair", image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800" },
    { name: "Himalayan Alchemy", description: "Direct thermotherapy with heated pink salt stones.", price: 3200, duration_minutes: 75, category: "Massage", image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=800" },
    { name: "Royal Mughal Bridal", description: "Total wedding transformation with HD artistry.", price: 25000, duration_minutes: 300, category: "Bridal", image_url: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=800" },
    { name: "Executive Precision", description: "Master grooming with hot towel and architecture.", price: 1200, duration_minutes: 45, category: "Grooming", image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
    { name: "Azure Oxygen Blast", description: "Pure oxygen serums for instant dermal plumping.", price: 5500, duration_minutes: 45, category: "Skin", image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800" }
];

const salons = [
    { name: "The Palace Sanctuary", address: "Altamount Road", city: "Mumbai", owner_name: "Vikram Mehta", phone: "+91 22 2351 0000", opening_time: "10:00 AM", closing_time: "09:00 PM", image_url: "https://images.unsplash.com/photo-1512690196152-730d4375338c?auto=format&fit=crop&q=80&w=800" },
    { name: "Emerald Oasis", address: "Indiranagar", city: "Bangalore", owner_name: "Anita Rao", phone: "+91 80 4123 4567", opening_time: "09:00 AM", closing_time: "08:30 PM", image_url: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800" },
    { name: "Azure Retreat", address: "Marine Drive", city: "Kochi", owner_name: "Faisal Rahman", phone: "+91 484 235 9999", opening_time: "08:00 AM", closing_time: "10:00 PM", image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" },
    { name: "Golden Hour Studio", address: "Civil Station", city: "Calicut", owner_name: "Sarah Jacob", phone: "+91 495 244 8888", opening_time: "09:30 AM", closing_time: "08:00 PM", image_url: "https://images.unsplash.com/photo-1595475243692-3a387f34081c?auto=format&fit=crop&q=80&w=800" },
    { name: "Verve Gentlemen", address: "Bypass Road", city: "Perintalmanna", owner_name: "Sameer Ibrahim", phone: "+91 98470 55555", opening_time: "10:00 AM", closing_time: "10:00 PM", image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
    { name: "Zenith Beauty Hub", address: "Central Mall", city: "Trivandrum", owner_name: "Lakshmi Nair", phone: "+91 471 255 1111", opening_time: "10:00 AM", closing_time: "09:00 PM", image_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800" }
];

async function seed() {
    console.log('Clearing old mocked data...');
    // We don't delete real data, just insert new ones and ignore if they exist
    for (const s of services) {
        const { error } = await supabase.from('services').insert([s]);
        if (error) console.log(`Service [${s.name}] skipped or error: ${error.message}`);
        else console.log(`Service [${s.name}] added.`);
    }
    for (const h of salons) {
        const { error } = await supabase.from('salons').insert([h]);
        if (error) console.log(`Salon [${h.name}] skipped or error: ${error.message}`);
        else console.log(`Salon [${h.name}] added.`);
    }
}

seed();
