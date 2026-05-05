import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get all active services (Public) — optionally filtered by salon
export const getAllServices = async (req, res) => {
    try {
        const { salon_id } = req.query;

        if (salon_id) {
            // Fetch services linked to this specific salon via salon_services
            const { data, error } = await supabaseAdmin
                .from('salon_services')
                .select(`
                    service_id,
                    price,
                    services (
                        id,
                        name,
                        description,
                        duration_minutes,
                        category,
                        image_url
                    )
                `)
                .eq('salon_id', salon_id);

            if (error) throw error;

            // Flatten: use the salon-specific price, include original service id
            const services = (data || []).map(row => ({
                ...row.services,
                original_id: row.services?.id,
                id: row.service_id,
                price: row.price   // shop-specific price overrides global
            }));

            return res.status(200).json({ services });
        }

        // No filter — return all services (admin use)
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('category', { ascending: true });

        if (error) throw error;
        res.status(200).json({ services: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single service (Public)
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.status(200).json({ service: data });
    } catch (error) {
        res.status(404).json({ error: 'Service not found' });
    }
};

// Create a new service (Admin only)
export const createService = async (req, res) => {
    try {
        const { name, description, price, duration_minutes, category, image_url } = req.body;

        const { data, error } = await supabaseAdmin
            .from('services')
            .insert([{
                name,
                description,
                price,
                duration_minutes,
                category,
                image_url
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Service created successfully', service: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a service (Admin only)
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('services')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Service updated successfully', service: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete (Soft delete) a service (Admin only)
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // We use soft delete by setting is_active to false
        const { data, error } = await supabaseAdmin
            .from('services')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Service deleted (deactivated) successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
