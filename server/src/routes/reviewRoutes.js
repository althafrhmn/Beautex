import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createReview } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', requireAuth, createReview);

export default router;
