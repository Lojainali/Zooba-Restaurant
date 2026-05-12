import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  assignOrder,
  updatePaymentStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/assign', protect, authorize('admin', 'chef', 'waiter'), assignOrder);
router.put('/:id/payment', protect, authorize('admin', 'cashier'), updatePaymentStatus);

export default router;

