import express from 'express';
import { 
    getAllSalons, 
    getSalonById, 
    createSalon, 
    updateSalon, 
    deleteSalon,
    getSalonServices,
    assignSalonServices
} from '../controllers/salonController.js';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllSalons);
router.get('/:id', getSalonById);
router.get('/:id/services', getSalonServices);

// Admin Routes
router.post('/', requireAuth, restrictTo('admin'), createSalon);
router.put('/:id', requireAuth, restrictTo('admin'), updateSalon);
router.delete('/:id', requireAuth, restrictTo('admin'), deleteSalon);
router.put('/:id/services', requireAuth, restrictTo('admin', 'manager'), assignSalonServices);

export default router;
