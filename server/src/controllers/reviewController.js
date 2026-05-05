import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

export const createReview = async (req, res) => {
    try {
        const { booking_id, salon_id, rating } = req.body;
        const customer_id = req.user.id; // from requireAuth middleware

        if (!booking_id || !salon_id || !rating) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // 1. Verify that the booking belongs to this user and is confirmed/completed
        const { data: booking, error: bError } = await supabaseAdmin
            .from('bookings')
            .select('status, customer_id, guest_email')
            .eq('id', booking_id)
            .single();

        if (bError || !booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const isOwner = booking.customer_id === customer_id || 
                       (booking.customer_id === null && booking.guest_email === req.user.email);
                       
        if (!isOwner) {
            return res.status(403).json({ error: 'You are not authorized to review this booking' });
        }

        if (booking.status !== 'confirmed' && booking.status !== 'completed') {
            return res.status(400).json({ error: 'Only completed bookings can be reviewed' });
        }

        // 2. Insert the review (unique constraint on booking_id prevents duplicates automatically)
        const { data: review, error: rError } = await supabaseAdmin
            .from('reviews')
            .insert([{
                booking_id,
                salon_id,
                customer_id,
                rating
            }])
            .select()
            .single();

        if (rError) {
            if (rError.code === '23505') { // postgres unique violation code
                return res.status(400).json({ error: 'You have already reviewed this booking' });
            }
            throw rError;
        }

        res.status(201).json({ message: 'Rating submitted successfully', review });
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ error: error.message });
    }
};
