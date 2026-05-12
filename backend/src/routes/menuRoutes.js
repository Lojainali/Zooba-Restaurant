import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getDailyOffers
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/offers/daily', getDailyOffers);
router.get('/:id', getMenuItem);
router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

export default router;

