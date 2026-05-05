import express from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, getPendingAnnouncements, updateAnnouncementStatus } from '../controllers/announcementController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAnnouncements);
router.get('/pending', requireAuth, restrictTo('admin'), getPendingAnnouncements);

// Protected routes (Staff/Manager/Admin)
router.post('/', requireAuth, restrictTo('manager', 'admin', 'staff'), createAnnouncement);
router.patch('/:id/status', requireAuth, restrictTo('admin'), updateAnnouncementStatus);
router.delete('/:id', requireAuth, restrictTo('manager', 'admin'), deleteAnnouncement);

export default router;
