import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get all salons (Public)
export const getAllSalons = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.status(200).json({ 
            salons: data || [],
            shops: data || [] // Add fallback for frontend compatibility
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single salon (Public)
export const getSalonById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.status(200).json({ salon: data });
    } catch (error) {
        res.status(404).json({ error: 'Salon not found' });
    }
};

// Create a salon (Admin)
export const createSalon = async (req, res) => {
    try {
        const { name, location, city, phone, owner_name, opening_time, closing_time, hours, image_url, tags } = req.body;

        const hoursStr = (opening_time && closing_time)
            ? `${opening_time} - ${closing_time}`
            : (hours || '09:00 - 21:00');

        const { data, error } = await supabase
            .from('salons')
            .insert([{ 
                name, 
                address: location,
                city: city || 'Global',
                phone,
                owner_name: owner_name || null,
                hours: hoursStr,
                image_url,
                tags: tags || []
            }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ message: 'Shop created', salon: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a salon (Admin)
export const updateSalon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Map frontend field names to DB column names
        if (updates.location !== undefined) {
            updates.address = updates.location;
            delete updates.location;
        }
        if (updates.opening_time !== undefined || updates.closing_time !== undefined) {
            // Fetch current hours to fill in whichever side wasn't changed
            const { data: current } = await supabase.from('salons').select('hours').eq('id', id).single();
            const [curOpen, curClose] = (current?.hours || ' - ').split(' - ');
            updates.hours = `${updates.opening_time ?? curOpen ?? ''} - ${updates.closing_time ?? curClose ?? ''}`;
            delete updates.opening_time;
            delete updates.closing_time;
        }
        // owner_name is now a real DB column — keep it in updates

        const { data, error } = await supabase
            .from('salons')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.status(200).json({ message: 'Shop updated', salon: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a salon (Admin)
export const deleteSalon = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('salons')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Shop deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get services assigned to a salon
export const getSalonServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('salon_services')
            .select('service_id, services(id, name, category, price, duration_minutes)')
            .eq('salon_id', id);

        if (error) throw error;

        const services = (data || []).map(row => row.services).filter(Boolean);
        res.status(200).json({ services });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign services to a salon (replaces existing assignment)
export const assignSalonServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceIds } = req.body; // array of service UUIDs

        // Delete all current assignments for this salon
        await supabaseAdmin
            .from('salon_services')
            .delete()
            .eq('salon_id', id);

        // Insert new assignments (skip if empty)
        if (serviceIds && serviceIds.length > 0) {
            const rows = serviceIds.map(service_id => ({ salon_id: id, service_id }));
            const { error } = await supabaseAdmin
                .from('salon_services')
                .insert(rows);
            if (error) throw error;
        }

        res.status(200).json({ message: 'Services updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
