import express from 'express';
import { requireAuth, restrictTo } from '../middleware/authMiddleware.js';
import {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Protected routes (Staff/Admin)
router.use(requireAuth);
router.post('/', restrictTo('admin', 'manager', 'staff'), createProduct);
router.put('/:id', restrictTo('admin', 'manager', 'staff'), updateProduct);
router.delete('/:id', restrictTo('admin', 'manager', 'staff'), deleteProduct);

export default router;
