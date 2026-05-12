import express from 'express';
import {
  createReservation,
  getReservations,
  getReservation,
  updateReservationStatus,
  cancelReservation
} from '../controllers/reservationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/', protect, getReservations);
router.get('/:id', protect, getReservation);
router.put('/:id/status', protect, updateReservationStatus);
router.delete('/:id', protect, cancelReservation);

export default router;

