import supabase, { supabaseAdmin } from '../config/supabaseClient.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
// Verify QR Payment (Customer)
// Marks the booking as "confirmed" and payment as "completed" after user scans QR
export const verifyQrPayment = async (req, res) => {
    try {
        const { booking_id } = req.body;
        
        if (!booking_id) {
            return res.status(400).json({ error: 'booking_id is required' });
        }

        // 1. Update Booking status to "confirmed" using admin client (bypass RLS for guest bookings)
        const { data: booking, error: bookingErr } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'confirmed', updated_at: new Date() })
            .eq('id', booking_id)
            .select()
            .single();

        if (bookingErr) throw bookingErr;

        // 2. Mark the Payment record as "completed"
        await supabaseAdmin
            .from('payments')
            .update({ 
                status: 'completed',
                transaction_id: `QR-SELF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                updated_at: new Date()
            })
            .eq('booking_id', booking_id);

        // 3. Process loyalty points (only on full payment)
        if (booking.customer_id && booking.total_price !== undefined && booking.payment_type === 'full') {
            await processLoyaltyPoints(booking.customer_id, booking.total_price, booking.points_used || 0);
        }

        res.status(200).json({ message: 'Payment confirmed.', booking });
    } catch (error) {
        console.error('QR Verification Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', booking_id } = req.body;

        if (!amount || !booking_id) {
            return res.status(400).json({ error: 'Amount and Booking ID are required' });
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency,
            receipt: `rcpt_${booking_id.substring(0, 10)}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ error: 'Could not create Razorpay order' });
    }
};

// Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            booking_id 
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // 1. Update Booking status to "confirmed"
        const { error: bookingErr } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', booking_id);

        if (bookingErr) throw bookingErr;

        // 2. Clear previous pending payments and create a "completed" record
        await supabaseAdmin
            .from('payments')
            .update({ 
                status: 'completed', 
                transaction_id: razorpay_payment_id,
                updated_at: new Date()
            })
            .eq('booking_id', booking_id);

        // 3. Fetch the updated booking with details to return to frontend
        const { data: booking, error: finalError } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                salons (name, address, city),
                booking_services (
                    services (name, price)
                )
            `)
            .eq('id', booking_id)
            .single();

        if (finalError) throw finalError;

        // 4. Process loyalty points (only on full payment)
        if (booking.customer_id && booking.total_price !== undefined && booking.payment_type === 'full') {
            await processLoyaltyPoints(booking.customer_id, booking.total_price, booking.points_used || 0);
        }

        res.status(200).json({ 
            message: 'Payment verified successfully',
            booking 
        });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper: Process Loyalty Points
const processLoyaltyPoints = async (customer_id, total_amount, points_used = 0) => {
    if (!customer_id) return;
    const pointsToAward = Math.floor(total_amount / 100);
    
    if (pointsToAward <= 0 && points_used <= 0) return;

    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('loyalty_points')
            .eq('id', customer_id)
            .single();
            
        const currentPoints = profile?.loyalty_points || 0;
        const newPoints = Math.max(0, currentPoints - points_used) + pointsToAward;
        
        await supabaseAdmin
            .from('profiles')
            .update({ loyalty_points: newPoints })
            .eq('id', customer_id);
            
        console.log(`Customer ${customer_id}: Deducted ${points_used}, Awarded ${pointsToAward}. New total: ${newPoints}.`);
    } catch (err) {
        console.error('Error processing loyalty points:', err.message);
    }
};
