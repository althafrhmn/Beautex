import express from 'express';
import { sendMessage, getMyCommunications, updateCommunicationStatus, getAllCommunications } from '../controllers/communicationController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Generic messaging endpoints
router.post('/', requireAuth, sendMessage);
router.get('/my', requireAuth, getMyCommunications);
router.put('/:id', requireAuth, updateCommunicationStatus);

// 2. Admin-only overview
router.get('/all', requireAuth, restrictTo('admin'), getAllCommunications);

export default router;
