import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getStaffByRole
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/staff/:role', protect, getStaffByRole);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;

