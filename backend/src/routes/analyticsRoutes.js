import express from 'express';
import {
  getDailyAnalytics,
  getAnalyticsRange,
  getPerformanceSummary
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/daily', protect, authorize('admin'), getDailyAnalytics);
router.get('/range', protect, authorize('admin'), getAnalyticsRange);
router.get('/summary', protect, authorize('admin'), getPerformanceSummary);

export default router;

