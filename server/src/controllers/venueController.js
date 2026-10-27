import Venue from '../models/Venue.js';
import Booking from '../models/Booking.js';
import {
  getRolling14Days,
  getTodayKolkataString,
  isSlotInPast,
  formatSlotLabel,
} from '../utils/time.js';

/**
 * @desc Get all venues with filtering and sorting
 * @route GET /api/venues
 * @access Public
 */
export async function getVenues(req, res, next) {
  try {
    const { sport, city, minPrice, maxPrice, search, sort, includeInactive } = req.query;

    const query = {};

    // Filter by active status unless admin explicitly requests all
    if (!includeInactive) {
      query.isActive = true;
    }

    // Filter by sport
    if (sport && sport !== 'all') {
      query.sport = sport.toLowerCase();
    }

    // Filter by city
    if (city && city !== 'all') {
      query.city = city;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.hourlyPrice = {};
      if (minPrice) query.hourlyPrice.$gte = Number(minPrice);
      if (maxPrice) query.hourlyPrice.$lte = Number(maxPrice);
    }

    // Text search by name, city, or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { description: searchRegex },
        { sport: searchRegex },
      ];
    }

    // Build sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { hourlyPrice: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { hourlyPrice: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { name: 1 };
    }

    const venues = await Venue.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: venues.length,
      venues,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get single venue by ID
 * @route GET /api/venues/:id
 * @access Public
 */
export async function getVenueById(req, res, next) {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    res.status(200).json({
      success: true,
      venue,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get venue slot availability for a specific date (rolling 14-day window)
 * @route GET /api/venues/:id/availability
 * @access Public
 */
export async function getVenueAvailability(req, res, next) {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    const rollingDays = getRolling14Days();
    const todayStr = getTodayKolkataString();

    // Requested date or default to today
    const requestedDate = req.query.date || todayStr;

    // Check if requested date is within the rolling 14-day window
    const validDate = rollingDays.find((d) => d.date === requestedDate);
    if (!validDate && requestedDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot view or book slots for past dates.',
        rollingDays,
      });
    }

    // Find all active confirmed bookings for this venue on the requested date
    const activeBookings = await Booking.find({
      venue: venue._id,
      bookingDate: requestedDate,
      status: 'CONFIRMED',
    }).select('timeSlot startHour');

    const bookedSlotsSet = new Set(activeBookings.map((b) => b.timeSlot));

    // Generate slots according to venue opening and closing hours
    const openHour = venue.openingHour !== undefined ? venue.openingHour : 6;
    const closeHour = venue.closingHour !== undefined ? venue.closingHour : 23;

    const slots = [];
    for (let h = openHour; h < closeHour; h++) {
      const slotLabel = formatSlotLabel(h);
      const isBooked = bookedSlotsSet.has(slotLabel);
      const isPast = isSlotInPast(requestedDate, h);

      slots.push({
        startHour: h,
        endHour: h + 1,
        timeSlot: slotLabel,
        isBooked,
        isPast,
        isAvailable: !isBooked && !isPast,
      });
    }

    res.status(200).json({
      success: true,
      venueId: venue._id,
      venueName: venue.name,
      date: requestedDate,
      hourlyPrice: venue.hourlyPrice,
      rollingDays,
      slots,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Create new venue
 * @route POST /api/venues
 * @access Private (Admin only)
 */
export async function createVenue(req, res, next) {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Venue created successfully.',
      venue,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Update venue details
 * @route PUT /api/venues/:id
 * @access Private (Admin only)
 */
export async function updateVenue(req, res, next) {
  try {
    let venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Venue updated successfully.',
      venue,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Deactivate or delete venue
 * Preserves history: if venue has bookings, deactivates instead of deleting!
 * @route DELETE /api/venues/:id
 * @access Private (Admin only)
 */
export async function deleteVenue(req, res, next) {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    // Check if venue has any bookings
    const bookingsCount = await Booking.countDocuments({ venue: venue._id });

    if (bookingsCount > 0) {
      // Deactivate rather than delete to preserve booking history
      venue.isActive = false;
      await venue.save();

      return res.status(200).json({
        success: true,
        message: 'Venue has existing booking history. It was safely deactivated rather than deleted.',
        venue,
      });
    }

    // If no bookings exist, safe to delete completely
    await venue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Venue deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
}
