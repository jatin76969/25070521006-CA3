import express from 'express';
import {
  getVenues,
  getVenueById,
  getVenueAvailability,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getVenues);
router.get('/:id', getVenueById);
router.get('/:id/availability', getVenueAvailability);

// Admin-protected routes
router.post('/', protect, authorize('admin'), createVenue);
router.put('/:id', protect, authorize('admin'), updateVenue);
router.delete('/:id', protect, authorize('admin'), deleteVenue);

export default router;
