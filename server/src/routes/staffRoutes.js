import express from 'express';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';
import {
    getAllStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffProfile,
    updateStaffProfile,
    getStaffBookings,
    updateStaffBookingStatus,
    getStaffDashboardStats
} from '../controllers/staffController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// === Admin-only staff management routes ===
router.get('/all', restrictTo('admin', 'manager'), getAllStaff);
router.post('/create', restrictTo('admin', 'manager'), createStaff);
router.put('/:id', restrictTo('admin', 'manager'), updateStaff);
router.delete('/:id', restrictTo('admin', 'manager'), deleteStaff);

// === Staff self-service routes ===
router.get('/me/profile', restrictTo('staff'), getStaffProfile);
router.put('/me/profile', restrictTo('staff'), updateStaffProfile);
router.get('/me/bookings', restrictTo('staff'), getStaffBookings);
router.patch('/me/bookings/:id/status', restrictTo('staff'), updateStaffBookingStatus);
router.get('/me/dashboard', restrictTo('staff'), getStaffDashboardStats);

export default router;
