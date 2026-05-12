import express from 'express';
import {
  getDeliveryOrders,
  assignDeliveryDriver,
  updateDeliveryStatus,
  trackDelivery
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDeliveryOrders);
router.get('/track/:orderId', protect, trackDelivery);
router.put('/:id/assign', protect, authorize('admin'), assignDeliveryDriver);
router.put('/:id/status', protect, authorize('delivery_driver', 'admin'), updateDeliveryStatus);

export default router;

