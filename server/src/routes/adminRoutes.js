import express from 'express';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';
import {
    getAdminStats,
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getAllStaff,
    getAdminAnalytics,
    getAllAdmins,
    createAdminUser,
    deleteAdmin,
    getAllManagers
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth);
router.use(restrictTo('admin', 'manager', 'receptionist'));

router.get('/stats', getAdminStats);
router.get('/customers', getAllCustomers);
router.post('/customers', createCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);
router.get('/staff', getAllStaff);
router.get('/analytics', getAdminAnalytics);

// Admin Management
router.get('/users', getAllAdmins);
router.post('/users', createAdminUser);
router.delete('/users/:id', deleteAdmin);
router.get('/managers', getAllManagers);

export default router;
