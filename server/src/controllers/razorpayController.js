import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance with credentials from .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * 1. POST /create-order
 * Creates a new Razorpay order for the specified amount.
 */
export const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).send("Error creating order");
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * 2. POST /verify-payment
 * Verifies the payment signature using Crypto HMAC SHA256.
 * This ensures the payment signal from the frontend is authentic.
 */
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Step 1: Concatenate order_id and payment_id with "|"
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        // Step 2: Create HMAC SHA256 hash using the secret key
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Step 3: Compare generated signature with the signature received from Razorpay
        if (razorpay_signature === expectedSignature) {
            return res.status(200).json({ 
                message: "Payment verified successfully", 
                signatureIsValid: true 
            });
        } else {
            return res.status(400).json({ 
                message: "Invalid payment signature", 
                signatureIsValid: false 
            });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * 3. GET /payment-status/:paymentId
 * Fetches the status and additional details for a specific payment.
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await razorpay.payments.fetch(paymentId);

        if (!payment) {
            return res.status(404).json({ message: "Payment records not found" });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Payment Status Error:", error);
        res.status(500).json({ error: error.message });
    }
};
