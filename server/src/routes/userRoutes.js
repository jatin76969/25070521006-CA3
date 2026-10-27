import express from 'express';
import { updateProfile, getAdminStats } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);

export default router;
