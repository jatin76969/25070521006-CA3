import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a venue name'],
      trim: true,
      maxlength: [100, 'Venue name cannot exceed 100 characters'],
    },
    sport: {
      type: String,
      required: [true, 'Please specify the primary sport'],
      enum: ['cricket', 'football', 'badminton', 'basketball'],
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      enum: ['Nagpur', 'Pune', 'Mumbai'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide the physical address'],
      trim: true,
    },
    hourlyPrice: {
      type: Number,
      required: [true, 'Please provide the hourly price in INR'],
      min: [100, 'Price must be at least ₹100 per hour'],
    },
    openingHour: {
      type: Number,
      default: 6, // 06:00 AM
      min: 0,
      max: 23,
    },
    closingHour: {
      type: Number,
      default: 23, // 11:00 PM
      min: 1,
      max: 24,
    },
    amenities: {
      type: [String],
      default: ['Floodlights', 'Changing Rooms', 'Drinking Water', 'Parking'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Venue must have at least one image',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    surfaceType: {
      type: String,
      default: 'Synthetic Turf',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFictionalDemo: {
      type: Boolean,
      default: true, // Marked as demonstration data for college project
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance searching and filtering
venueSchema.index({ city: 1, sport: 1, isActive: 1 });
venueSchema.index({ hourlyPrice: 1 });
venueSchema.index({ name: 'text', description: 'text' });

const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
