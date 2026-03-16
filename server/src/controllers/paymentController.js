import supabase from '../config/supabaseClient.js';

// Get all payments (Admin)
export const getAllPayments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                customer:customer_id (full_name, email),
                booking:booking_id (booking_number)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ payments: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a payment (Internal/Admin)
export const createPayment = async (req, res) => {
    try {
        const { booking_id, customer_id, amount, payment_method, status, transaction_id } = req.body;
        
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                booking_id,
                customer_id,
                amount,
                payment_method,
                status: status || 'pending',
                transaction_id: transaction_id || `TRX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Payment recorded', payment: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update payment status (Admin)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('payments')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Payment status updated', payment: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
