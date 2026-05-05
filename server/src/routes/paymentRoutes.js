import express from 'express';
import { 
    getAllPayments, 
    createPayment, 
    updatePaymentStatus,
    verifyQrPayment,
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../controllers/paymentController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Razorpay Integration (Open for Guests/Customers)
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);

// QR Payment Verification (Customer)
router.post('/verify-qr', verifyQrPayment);

router.use(requireAuth);

// Admin Routes
router.get('/admin/all', restrictTo('admin'), getAllPayments);
router.patch('/:id/status', restrictTo('admin'), updatePaymentStatus);

// Create Payment (Used by system or admin)
router.post('/', createPayment);

export default router;
