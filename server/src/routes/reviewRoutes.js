import express from 'express';
import { 
    getAllReviews, 
    createReview, 
    updateReviewStatus,
    getPublicReviews
} from '../controllers/reviewController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/public', getPublicReviews);

// Protected Routes
router.post('/', requireAuth, createReview);

// Admin Routes
router.get('/admin/all', requireAuth, restrictTo('admin'), getAllReviews);
router.patch('/:id/status', requireAuth, restrictTo('admin'), updateReviewStatus);

export default router;
