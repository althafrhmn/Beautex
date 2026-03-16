import express from 'express';
import { 
    getAllPayments, 
    createPayment, 
    updatePaymentStatus 
} from '../controllers/paymentController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Admin Routes
router.get('/admin/all', restrictTo('admin'), getAllPayments);
router.patch('/:id/status', restrictTo('admin'), updatePaymentStatus);

// Create Payment (Used by system or admin)
router.post('/', createPayment);

export default router;
