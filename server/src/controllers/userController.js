import User from '../models/User.js';
import Venue from '../models/Venue.js';
import Booking from '../models/Booking.js';

/**
 * @desc Update user profile (name, phone). Email remains strictly read-only.
 * @route PUT /api/users/profile
 * @access Private
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.name = name.trim();
    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    // Note: user.email is NEVER updated from profile edit

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get Admin Dashboard Statistics
 * @route GET /api/users/admin/stats
 * @access Private (Admin only)
 */
export async function getAdminStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalVenues = await Venue.countDocuments();
    const activeVenues = await Venue.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'CONFIRMED' });
    const cancelledBookings = await Booking.countDocuments({ status: 'CANCELLED' });

    // Aggregate total revenue for confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVenues,
        activeVenues,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
}
