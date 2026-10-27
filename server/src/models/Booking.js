import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    // Snapshot of venue data at the time of booking to preserve history
    venueSnapshot: {
      name: { type: String, required: true },
      sport: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      hourlyPrice: { type: Number, required: true },
      image: { type: String },
    },
    // Booking date formatted as YYYY-MM-DD in Asia/Kolkata
    bookingDate: {
      type: String,
      required: [true, 'Booking date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format'],
    },
    // Time slot e.g. "06:00 - 07:00"
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    // Start hour integer (0 - 23)
    startHour: {
      type: Number,
      required: [true, 'Start hour is required'],
      min: 0,
      max: 23,
    },
    // End hour integer (1 - 24)
    endHour: {
      type: Number,
      required: [true, 'End hour is required'],
      min: 1,
      max: 24,
    },
    // Server-calculated authoritative price
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'PAY_AT_VENUE',
      enum: ['PAY_AT_VENUE'],
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'COMPLETED', 'VOID'],
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * CRITICAL DATABASE-LEVEL DOUBLE BOOKING PREVENTION:
 * Compound partial unique index on { venue, bookingDate, timeSlot }
 * ONLY for active bookings where status === 'CONFIRMED'.
 *
 * This ensures:
 * 1. Exactly one active booking per slot per venue on a given date.
 * 2. If two users try to book the same slot simultaneously, the 2nd request
 *    violates this unique index and throws MongoDB error 11000 (duplicate key).
 * 3. When a booking is cancelled (status -> 'CANCELLED'), the slot is released
 *    immediately without deleting booking audit history.
 * 4. Works cleanly on standalone MongoDB Community Server without replica sets!
 */
bookingSchema.index(
  { venue: 1, bookingDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'CONFIRMED' } }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingDate: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
