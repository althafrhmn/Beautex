import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get active announcements
export const getAnnouncements = async (req, res) => {
    try {
        const { salon_id, type } = req.query;
        let query = supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'approved')
            .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);

        if (salon_id) {
            query = query.eq('salon_id', salon_id);
        }
        // If no salon_id, we fetch all approved banners (global + shop-specific) 
        // to display on the HomePage carousel/banner section.

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ announcements: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new announcement (Manager/Admin)
export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, type, salon_id, image_url, link_url, end_date } = req.body;

        const { data, error } = await supabaseAdmin
            .from('announcements')
            .insert([{
                title,
                content,
                type,
                salon_id: salon_id || null,
                image_url,
                link_url,
                end_date: end_date || null
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Announcement submitted for approval', announcement: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get pending announcements (Admin only)
export const getPendingAnnouncements = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('announcements')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json({ announcements: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update announcement status (Admin only)
export const updateAnnouncementStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        const { data, error } = await supabaseAdmin
            .from('announcements')
            .update({ status, rejection_reason: rejection_reason || null })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: `Announcement ${status}`, announcement: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
