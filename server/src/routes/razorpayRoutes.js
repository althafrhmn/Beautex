import express from 'express';
import { createOrder, verifyPayment, getPaymentStatus } from '../controllers/razorpayController.js';

const router = express.Router();

/**
 * Endpoint for order creation.
 * Returns a unique razorpay_order_id.
 */
router.post('/create-order', createOrder);

/**
 * Endpoint for payment verification.
 * Compares our generated signature with Razorpay's.
 */
router.post('/verify-payment', verifyPayment);

/**
 * Endpoint for checking payment details.
 * Useful for confirming the final transaction status.
 */
router.get('/payment-status/:paymentId', getPaymentStatus);

export default router;
