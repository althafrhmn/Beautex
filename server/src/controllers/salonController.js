import supabase from '../config/supabaseClient.js';

// Get all salons (Public)
export const getAllSalons = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.status(200).json({ salons: data || [] });
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
        const { name, location, phone, hours, image_url, tags } = req.body;
        const { data, error } = await supabase
            .from('salons')
            .insert([{ 
                name, 
                address: location,
                city: 'Global',
                phone, 
                hours: hours || '10:00 AM - 08:00 PM',
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
        if (updates.location) {
            updates.address = updates.location;
            delete updates.location;
        }
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
