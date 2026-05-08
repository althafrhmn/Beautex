import express from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, getPendingAnnouncements, updateAnnouncementStatus, submitJobApplication, getJobApplications, getResumeDownload } from '../controllers/announcementController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAnnouncements);
router.get('/pending', requireAuth, restrictTo('admin'), getPendingAnnouncements);
router.post('/:id/apply', submitJobApplication); // Anyone can apply for a job

// Protected routes (Staff/Manager/Admin)
router.post('/', requireAuth, restrictTo('manager', 'admin', 'staff'), createAnnouncement);
router.get('/:id/applications', requireAuth, restrictTo('manager', 'admin', 'staff'), getJobApplications);
router.get('/resume/:applicationId', requireAuth, restrictTo('manager', 'admin', 'staff'), getResumeDownload);
router.patch('/:id/status', requireAuth, restrictTo('admin'), updateAnnouncementStatus);
router.delete('/:id', requireAuth, restrictTo('manager', 'admin'), deleteAnnouncement);

export default router;
