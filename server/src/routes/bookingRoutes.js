import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// User authenticated routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

export default router;
