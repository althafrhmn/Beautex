import express from 'express';
import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} from '../controllers/serviceController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected Admin Routes
router.post('/', requireAuth, restrictTo('admin'), createService);
router.put('/:id', requireAuth, restrictTo('admin'), updateService);
router.delete('/:id', requireAuth, restrictTo('admin'), deleteService);

export default router;
