import express from 'express';
import { register, login, logout, getMe, requestOtp, verifyOtp, requestGuestOtp, verifyGuestOtp } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/guest-otp', requestGuestOtp);
router.post('/verify-guest-otp', verifyGuestOtp);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;
