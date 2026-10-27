import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Venue from '../models/Venue.js';

dotenv.config();

const SEED_VENUES = [
  {
    name: 'Orange City Turf & Box Cricket Arena',
    sport: 'cricket',
    city: 'Nagpur',
    address: 'Plot 42, Civil Lines, Opposite High Court Ground, Nagpur, Maharashtra 440001',
    hourlyPrice: 1200,
    openingHour: 6,
    closingHour: 23,
    surfaceType: '30mm FIFA Certified Artificial AstroTurf with High-grade Nets',
    amenities: ['Floodlights (500 LUX)', 'High-speed Bowling Machine', 'Dressing Room', 'Covered Dugout', 'Drinking Water', 'Ample Parking'],
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Premier box cricket venue in the heart of Nagpur. Features top-quality turf, rebound perimeter netting, high-lux shadow-free LED floodlights, and professional digital scoreboard equipment. Perfect for 6v6 to 8v8 box cricket matches.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Deccan Thunder 7v7 Football Arena',
    sport: 'football',
    city: 'Pune',
    address: 'Survey No. 88, Near Balewadi Stadium, Baner-Mahalunge Road, Pune, Maharashtra 411045',
    hourlyPrice: 1600,
    openingHour: 6,
    closingHour: 24,
    surfaceType: '50mm Monofilament Synthetic Turf with Rubber Infill',
    amenities: ['FIFA Quality Pro Turf', 'Ultra-bright Floodlights', 'Bibs & Match Balls', 'Shower & Locker Facilities', 'Spectator Bleachers', 'Cafeteria'],
    images: [
      'https://images.unsplash.com/photo-1529900244929-8f6479f4c392?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Pune’s top-rated football arena equipped with shock-pad artificial turf imported from Europe. Perfect for high-intensity 7-a-side and 5-a-side friendlies, corporate tournaments, and weekend bootcamps.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Marine Drive Smash Badminton Academy',
    sport: 'badminton',
    city: 'Mumbai',
    address: '78 Marine Lines West, Near Brabourne Stadium, Mumbai, Maharashtra 400020',
    hourlyPrice: 850,
    openingHour: 6,
    closingHour: 22,
    surfaceType: 'BWF Certified Teak Wood Flooring with Anti-glare PVC Mat',
    amenities: ['Air Conditioned Court', 'BWF Standard Lighting', 'Yonex Racket Rental', 'Changing Rooms', 'Physio Room', 'Filtered Water Dispenser'],
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Experience professional-grade indoor badminton with shock-absorbing teakwood subfloors that protect player joints. Fully climate-controlled arena with optimal ceiling clearance and shadowless downlighting.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Bandra Hoops Downtown Basketball Court',
    sport: 'basketball',
    city: 'Mumbai',
    address: 'Carter Road Promenade, Bandra West, Mumbai, Maharashtra 400050',
    hourlyPrice: 1100,
    openingHour: 6,
    closingHour: 23,
    surfaceType: 'FIBA Approved Acrylic Hardcourt with Glass Backboards',
    amenities: ['Breakaway Spring Hoops', 'LED Floodlights', 'Sea Breeze Pavilion', 'Restrooms', 'Equipment Storage', 'First Aid Station'],
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Iconic seaside outdoor basketball court located along the Bandra coastline. Features FIBA regulation dimensions, tempered glass backboards, and shock-absorbent multi-layer acrylic coating for maximum grip and ball bounce.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Kothrud Strikers Cricket Hub',
    sport: 'cricket',
    city: 'Pune',
    address: 'Lane 4, Dahanukar Colony, Near Cummins College, Kothrud, Pune, Maharashtra 411038',
    hourlyPrice: 950,
    openingHour: 6,
    closingHour: 23,
    surfaceType: 'All-Weather Green Turf with Heavy Duty Rebound Netting',
    amenities: ['Floodlights', 'Cricket Gear Available', 'Seating Dugouts', 'Beverage Vending', 'Bike & Car Parking'],
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'A beloved sports destination in Kothrud for students and working professionals. Features wide turf dimensions for full-swing box cricket, speed guns, and pristine LED night illumination.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Futala Lake Super Turf',
    sport: 'football',
    city: 'Nagpur',
    address: 'Near Futala Lake Promenade, Amravati Road, Nagpur, Maharashtra 440010',
    hourlyPrice: 1300,
    openingHour: 6,
    closingHour: 23,
    surfaceType: 'Premium Monofilament All-Weather Artificial Turf',
    amenities: ['Night Floodlighting', 'Scoreboard', 'Water Station', 'Separate Restrooms', 'Spectator Area', 'Secure Parking'],
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529900244929-8f6479f4c392?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Spacious football turf overlooking the scenic Futala Lake. Great wind circulation, top-tier turf condition, and high safety netting all around. Ideal for 5-a-side and 6-a-side matches.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Koregaon Park Shuttle Point',
    sport: 'badminton',
    city: 'Pune',
    address: 'North Main Road, Between Lane 5 & 6, Koregaon Park, Pune, Maharashtra 411001',
    hourlyPrice: 750,
    openingHour: 6,
    closingHour: 22,
    surfaceType: 'Triple-Cushioned Synthetic Vinyl Badminton Mats',
    amenities: ['Non-marking Shoes Rental', 'Locker Room', 'Cold & Warm Water', 'Stringing Machine', 'Coaching Available'],
    images: [
      'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Quiet, premium indoor badminton facility in Koregaon Park. Engineered for low acoustic reverberation and zero draft, offering true shuttle trajectory and optimal grip for fast rallies.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Dharampeth Slam Dunk Arena',
    sport: 'basketball',
    city: 'Nagpur',
    address: 'West High Court Road, Near Coffee House, Dharampeth, Nagpur, Maharashtra 440010',
    hourlyPrice: 900,
    openingHour: 6,
    closingHour: 22,
    surfaceType: 'Polyurethane Interlocking Outdoor Sports Tiles',
    amenities: ['Adjustable Height Hoops', 'Night Lights', 'Benches', 'Water Cooler', 'Washrooms'],
    images: [
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Nagpur’s favorite urban basketball hotspot. The weather-resistant interlocking tile floor provides excellent traction in all conditions while reducing impact on knees and ankles.',
    isActive: true,
    isFictionalDemo: true,
  },
  {
    name: 'Andheri West Champions Turf',
    sport: 'cricket',
    city: 'Mumbai',
    address: 'Link Road, Behind Infinity Mall, Andheri West, Mumbai, Maharashtra 400053',
    hourlyPrice: 1500,
    openingHour: 6,
    closingHour: 24,
    surfaceType: 'Heavy Density Multipurpose Box Cricket Turf',
    amenities: ['24x7 Floodlights', 'Air Conditioned Waiting Lounge', 'Live Streaming Setup', 'Cafeteria', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Popular Mumbai sports hub frequented by collegiate teams and corporate leagues. Features extra height safety netting, ball tracking camera mounts, and 24-hour round-the-clock booking slots.',
    isActive: true,
    isFictionalDemo: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/7sports';

  try {
    console.log(`[Seed] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Inserting/updating fictional demo venues (preserving users and bookings)...');

    let inserted = 0;
    let updated = 0;

    for (const venueData of SEED_VENUES) {
      const existing = await Venue.findOne({ name: venueData.name });
      if (existing) {
        // Update details without touching _id to preserve any booking references
        await Venue.updateOne({ _id: existing._id }, { $set: venueData });
        updated++;
      } else {
        await Venue.create(venueData);
        inserted++;
      }
    }

    console.log(`[Seed] Completed! New venues inserted: ${inserted}, Existing venues updated: ${updated}`);
    console.log(`[Seed] Total active venues now in DB: ${await Venue.countDocuments({ isActive: true })}`);
    console.log('[Seed] Note: Existing user accounts and booking history were preserved safely.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seed();
