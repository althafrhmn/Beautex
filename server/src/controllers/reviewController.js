import supabase from '../config/supabaseClient.js';

// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                customer:customer_id (full_name),
                salon:salon_id (name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ reviews: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a review (Customer)
export const createReview = async (req, res) => {
    try {
        const { booking_id, salon_id, rating, comment } = req.body;
        const customer_id = req.user.id;

        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                booking_id,
                customer_id,
                salon_id,
                rating,
                comment,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Review submitted for approval', review: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update review status (Admin - Approved/Rejected)
export const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: `Review ${status}`, review: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get approved reviews for homepage (Public)
export const getPublicReviews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                customer:customer_id (full_name)
            `)
            .eq('status', 'approved')
            .limit(6);

        if (error) throw error;

        res.status(200).json({ reviews: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
