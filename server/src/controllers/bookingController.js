import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import {
  getRolling14Days,
  getTodayKolkataString,
  isSlotInPast,
  formatSlotLabel,
} from '../utils/time.js';

// Generates a human-friendly unique booking reference e.g. PA-20261027-F7K2
function generateBookingReference(dateStr) {
  const cleanDate = dateStr.replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PA-${cleanDate}-${randomSuffix}`;
}

/**
 * @desc Create a new booking
 * @route POST /api/bookings
 * @access Private
 */
export async function createBooking(req, res, next) {
  try {
    const { venueId, bookingDate, startHour } = req.body;

    if (!venueId || !bookingDate || startHour === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide venueId, bookingDate, and startHour.',
      });
    }

    const hour = parseInt(startHour, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start hour provided.',
      });
    }

    // 1. Fetch Venue from database
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'The selected venue does not exist.',
      });
    }

    if (!venue.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This venue is currently inactive and not accepting bookings.',
      });
    }

    // 2. Validate Opening Hours
    const openHour = venue.openingHour !== undefined ? venue.openingHour : 6;
    const closeHour = venue.closingHour !== undefined ? venue.closingHour : 23;
    if (hour < openHour || hour >= closeHour) {
      return res.status(400).json({
        success: false,
        message: `This venue is only open between ${openHour}:00 and ${closeHour}:00.`,
      });
    }

    // 3. Validate Date within rolling 14-day window
    const todayStr = getTodayKolkataString();
    if (bookingDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book a slot for a past date.',
      });
    }

    const rollingDays = getRolling14Days();
    const isWithin14Days = rollingDays.some((d) => d.date === bookingDate);
    if (!isWithin14Days) {
      return res.status(400).json({
        success: false,
        message: 'Bookings are only permitted within a rolling 14-day window.',
      });
    }

    // 4. Validate that slot has not already passed
    if (isSlotInPast(bookingDate, hour)) {
      return res.status(400).json({
        success: false,
        message: 'This slot has already elapsed and cannot be booked.',
      });
    }

    const timeSlot = formatSlotLabel(hour);

    // 5. Pre-check: Check if slot is already actively booked
    const existing = await Booking.findOne({
      venue: venue._id,
      bookingDate,
      timeSlot,
      status: 'CONFIRMED',
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose an alternate slot.',
      });
    }

    // 6. Generate Unique Reference and Snapshot
    const bookingReference = generateBookingReference(bookingDate);
    const venueSnapshot = {
      name: venue.name,
      sport: venue.sport,
      city: venue.city,
      address: venue.address,
      hourlyPrice: venue.hourlyPrice,
      image: venue.images && venue.images.length > 0 ? venue.images[0] : '',
    };

    // 7. Authoritative price from database
    const authoritativePrice = venue.hourlyPrice;

    // 8. Create Booking in MongoDB
    // Note: If two concurrent requests reach this point, MongoDB's unique index
    // { venue: 1, bookingDate: 1, timeSlot: 1 } with partialFilterExpression { status: 'CONFIRMED' }
    // will atomically allow only ONE to succeed, and reject the second with duplicate key error (11000).
    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      venue: venue._id,
      venueSnapshot,
      bookingDate,
      timeSlot,
      startHour: hour,
      endHour: hour + 1,
      price: authoritativePrice,
      paymentMethod: 'PAY_AT_VENUE',
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
    });

    // 9. Real-time availability broadcast via Socket.IO
    // Emit only public metadata, NO private user info
    const io = req.app.get('io');
    if (io) {
      io.emit('slot_status_changed', {
        venueId: String(venue._id),
        bookingDate,
        timeSlot,
        status: 'BOOKED',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully! Pay at the venue on arrival.',
      booking,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get all bookings of the currently logged-in user
 * @route GET /api/bookings/my-bookings
 * @access Private
 */
export async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('venue', 'name sport city address images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get single booking by ID (ownership protected)
 * @route GET /api/bookings/:id
 * @access Private
 */
export async function getBookingById(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue', 'name sport city address images')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Ownership check: regular user can only view their own booking
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Cancel a booking (ownership protected, slot release)
 * @route PATCH /api/bookings/:id/cancel
 * @access Private
 */
export async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Ownership check
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking.',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    // Validate that slot has not already started
    if (isSlotInPast(booking.bookingDate, booking.startHour)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already started or elapsed.',
      });
    }

    // Update status to CANCELLED to free up the partial unique index
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    await booking.save();

    // Broadcast slot release via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('slot_status_changed', {
        venueId: String(booking.venue),
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: 'AVAILABLE',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. The slot is now released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get all bookings across the platform (Admin only)
 * @route GET /api/bookings/admin/all
 * @access Private (Admin only)
 */
export async function getAllBookings(req, res, next) {
  try {
    const { date, venueId, status } = req.query;
    const query = {};

    if (date) query.bookingDate = date;
    if (venueId && venueId !== 'all') query.venue = venueId;
    if (status && status !== 'all') query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('venue', 'name city sport')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}
