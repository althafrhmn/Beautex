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
        const { 
            name, location, city, phone, owner_name, 
            opening_time, closing_time, hours, image_url, tags,
            off_days, holidays, manager_pin, owner_email, owner_password 
        } = req.body;

        const hoursStr = (opening_time && closing_time)
            ? `${opening_time} - ${closing_time}`
            : (hours || '09:00 - 21:00');

        const { data, error } = await supabaseAdmin
            .from('salons')
            .insert([{ 
                name, 
                address: location,
                city: city || 'Global',
                phone,
                owner_name: owner_name || null,
                hours: hoursStr,
                image_url,
                tags: tags || [],
                off_days: off_days || [],
                holidays: holidays || [],
                google_maps_url: req.body.google_maps_url || null,
                manager_pin: manager_pin || '1234',
                owner_email: owner_email || null
            }])
            .select()
            .single();
        if (error) throw error;
        const newSalon = data;

        // Provision or Sync Owner Account if Email provided
        if (owner_email) {
            // 1. Try to find if user already exists in Auth
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            let authId = users?.find(u => u.email === owner_email)?.id;

            if (authId) {
                // Update existing auth user
                await supabaseAdmin.auth.admin.updateUserById(authId, {
                    user_metadata: { full_name: owner_name || 'Shop Owner', role: 'staff' }
                });
            } else {
                // Create new auth user
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: owner_email,
                    password: owner_password || 'Owner@123',
                    email_confirm: true,
                    user_metadata: { full_name: owner_name || 'Shop Owner', role: 'staff' }
                });
                authId = authData?.user?.id;
            }

            if (authId) {
                // Upsert Profile
                await supabaseAdmin.from('profiles').upsert({
                    id: authId,
                    full_name: owner_name || 'Shop Owner',
                    role: 'staff',
                    assigned_shop: newSalon.id,
                    manager_pin: manager_pin || '1234'
                });
            }
        }

        res.status(201).json({ message: 'Shop created and owner provisioned', salon: data });
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

        const updatedSalonData = { ...updates };
        delete updatedSalonData.owner_password; // Password is for auth, not salon table

        let { data, error } = await supabaseAdmin
            .from('salons')
            .update(updatedSalonData)
            .eq('id', id)
            .select()
            .single();

        if (error && error.message.includes('column')) {
            // Safety: if new holiday columns are missing in DB, retry without them
            const safe = { ...updatedSalonData };
            delete safe.off_days;
            delete safe.holidays;
            const retry = await supabaseAdmin.from('salons').update(safe).eq('id', id).select().single();
            data = retry.data;
            error = retry.error;
        }

        if (error) throw error;
        const updatedSalon = data;

        // Sync or Provision Owner Account if Email provided
        if (updates.owner_email) {
            // 1. Find Auth User ID
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            let authId = users?.find(u => u.email === updates.owner_email)?.id;

            if (authId) {
                // Sync Auth credentials (Role and Password if provided)
                const authUpdates = {
                    user_metadata: { role: 'staff' }
                };
                if (updates.owner_password) {
                    authUpdates.password = updates.owner_password;
                }
                await supabaseAdmin.auth.admin.updateUserById(authId, authUpdates);
            } else {
                // Provision new if missing
                const { data: authData } = await supabaseAdmin.auth.admin.createUser({
                    email: updates.owner_email,
                    password: updates.owner_password || 'Owner@123',
                    email_confirm: true,
                    user_metadata: { full_name: updates.owner_name || 'Shop Owner', role: 'staff' }
                });
                authId = authData?.user?.id;
            }

            if (authId) {
                // Final Sync with Profiles table
                await supabaseAdmin.from('profiles').upsert({
                    id: authId,
                    full_name: updates.owner_name || 'Shop Owner',
                    role: 'staff',
                    assigned_shop: id,
                    manager_pin: updates.manager_pin || '1234'
                });
            }
        }

        res.status(200).json({ message: 'Shop updated and owner synced', salon: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a salon (Admin)
export const deleteSalon = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
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
            .select('service_id, price, services(id, name, category, price, duration_minutes)')
            .eq('salon_id', id);

        if (error) throw error;

        // Map it so the custom price is returned
        const services = (data || []).map(row => {
            if (!row.services) return null;
            return {
                ...row.services,
                default_price: row.services.price, // original price
                price: row.price || row.services.price, // override with custom if exists
                is_custom_price: !!row.price
            };
        }).filter(Boolean);

        res.status(200).json({ services });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign services to a salon (replaces existing assignment)
export const assignSalonServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { services } = req.body; // array of { service_id, price } objects

        // Delete all current assignments for this salon
        await supabaseAdmin
            .from('salon_services')
            .delete()
            .eq('salon_id', id);

        // Insert new assignments (skip if empty)
        if (services && services.length > 0) {
            const rows = services.map(s => ({ 
                salon_id: id, 
                service_id: s.service_id,
                price: s.price || null
            }));
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
