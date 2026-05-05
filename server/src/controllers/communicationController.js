import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Send a new message or request (Shop Owner or Admin)
export const sendMessage = async (req, res) => {
    try {
        const { receiver_id, salon_id, category, subject, content } = req.body;
        const sender_id = req.user.id;

        const { data, error } = await supabaseAdmin
            .from('communications')
            .insert([{
                sender_id,
                receiver_id: receiver_id || null, // null = for all admins
                salon_id: salon_id || null,
                category: category || 'General Support',
                subject,
                content
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Communication dispatched successfully', communication: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get personal inbox/outbox for current user
export const getMyCommunications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = supabaseAdmin
            .from('communications')
            .select(`
                *,
                sender:sender_id(id, full_name, email, role, avatar_url),
                receiver:receiver_id(id, full_name, email, role, avatar_url),
                salon:salon_id(id, name, address)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId},receiver_id.is.null`)
            .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json({ communications: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update communication status (Admin or Receiver)
export const updateCommunicationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, is_read } = req.body;

    try {
        const updates = {};
        if (status !== undefined) updates.status = status;
        if (is_read !== undefined) updates.is_read = is_read;
        updates.updated_at = new Date();

        const { data, error } = await supabaseAdmin
            .from('communications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Communication updated', communication: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all communications (Platform Admin only)
export const getAllCommunications = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('communications')
            .select(`
                *,
                sender:sender_id(id, full_name, email, role, avatar_url),
                receiver:receiver_id(id, full_name, email, role, avatar_url),
                salon:salon_id(id, name, address)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ communications: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
