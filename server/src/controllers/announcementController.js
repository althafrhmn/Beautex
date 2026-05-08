import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get active announcements
export const getAnnouncements = async (req, res) => {
    try {
        const { salon_id, type } = req.query;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        let query = supabase
            .from('announcements')
            .select(`
                *,
                salons (name, city, image_url)
            `)
            .eq('is_active', true)
            .eq('status', 'approved')
            .or(`end_date.is.null,end_date.gte.${today}`); // Hide expired posts

        if (salon_id) {
            query = query.eq('salon_id', salon_id);
        }

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
                end_date: end_date || null,
                status: 'approved' // Direct Posting: No admin approval needed
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

// Submit a job application — stores resume as base64 in DB (no storage bucket needed)
export const submitJobApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { applicant_name, applicant_email, applicant_phone, resume_base64, resume_filename } = req.body;

        if (!applicant_name || !applicant_email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }
        if (!resume_base64 || !resume_filename) {
            return res.status(400).json({ error: 'Resume (PDF) is required to apply.' });
        }

        // Validate email format on server too
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(applicant_email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        const { data, error } = await supabaseAdmin
            .from('job_applications')
            .insert([{
                announcement_id: id,
                applicant_name,
                applicant_email,
                applicant_phone: applicant_phone || null,
                resume_url: resume_filename,        // store filename as label
                resume_base64: resume_base64        // store actual file data
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Application submitted successfully!', application: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Download resume for a specific application (Staff/Manager only)
export const getResumeDownload = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const { data, error } = await supabaseAdmin
            .from('job_applications')
            .select('resume_base64, resume_url, applicant_name')
            .eq('id', applicationId)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Application not found.' });
        if (!data.resume_base64) return res.status(404).json({ error: 'No resume on file for this applicant.' });

        const buffer = Buffer.from(data.resume_base64, 'base64');
        const filename = data.resume_url || `${data.applicant_name}_resume.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all applications for a job post (Staff/Manager only) — excludes base64 for performance
export const getJobApplications = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('job_applications')
            .select('id, announcement_id, applicant_name, applicant_email, applicant_phone, resume_url, created_at')
            .eq('announcement_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ applications: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
