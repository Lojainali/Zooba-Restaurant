import express from 'express';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  updateStock,
  getLowStockAlerts,
  generateRestockRequest
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getInventoryItems);
router.get('/alerts/low-stock', protect, authorize('admin'), getLowStockAlerts);
router.get('/:id', protect, getInventoryItem);
router.post('/', protect, authorize('admin'), createInventoryItem);
router.put('/:id', protect, authorize('admin'), updateInventoryItem);
router.put('/:id/stock', protect, authorize('admin'), updateStock);
router.post('/:id/restock-request', protect, authorize('admin'), generateRestockRequest);

export default router;

