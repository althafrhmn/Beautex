import express from 'express';
import {
    createBooking,
    getUserBookings,
    getAllBookings,
    getStaffBookings,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    assignStaff
} from '../controllers/bookingController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly accessible for guests to book a slot
router.post('/', createBooking);

router.use(requireAuth);

// Customer Routes
router.get('/my-bookings', getUserBookings);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/reschedule', rescheduleBooking);


// Admin Routes
router.get('/all', restrictTo('admin'), getAllBookings);
router.patch('/:id/assign', restrictTo('admin'), assignStaff);

// Staff Routes
router.get('/staff-bookings', restrictTo('staff', 'admin'), getStaffBookings);
router.patch('/:id/status', restrictTo('staff', 'admin'), updateBookingStatus);

export default router;
