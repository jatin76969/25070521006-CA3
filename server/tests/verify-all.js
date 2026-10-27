/**
 * Automated Verification Script for 7 Sports
 * Tests: Auth, Role Permissions, 14-Day Slots, Double Booking Prevention Race Condition,
 * Cancellation & Slot Release, and Ownership Security.
 */

import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from '../src/server.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Venue from '../src/models/Venue.js';
import Booking from '../src/models/Booking.js';
import { getRolling14Days } from '../src/utils/time.js';

dotenv.config();

let server;
let baseUrl;

// Helper to make HTTP requests with cookie support
function makeRequest(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        const setCookie = res.headers['set-cookie'];
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = { raw: data };
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            cookie: setCookie ? setCookie[0].split(';')[0] : null,
            body: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('STARTING 7 SPORTS AUTOMATED SYSTEM VERIFICATION SUITE');
  console.log('======================================================\n');

  await connectDB();

  // Start temporary HTTP test server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('\n1. Testing Health Check Endpoint:');
    const health = await makeRequest('GET', '/api/health');
    assert(health.status === 200, 'Health endpoint responds with 200 OK');
    assert(health.body.database === 'connected', 'Database reported as connected');

    // 2. Authentication: Regular User Registration
    console.log('\n2. Testing Public Signup & Security:');
    const userEmail = `player_${Date.now()}@example.com`;
    const signupRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Rohan Sharma',
      email: userEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+91 91234 56789',
      role: 'admin', // Malicious attempt to signup as admin
    });

    assert(signupRes.status === 201, 'Signup creates regular user successfully (201)');
    assert(signupRes.body.user.role === 'user', 'SECURITY: Public signup forces role="user", ignores "admin" injection');
    assert(signupRes.cookie && (signupRes.cookie.includes('7sports_token') || signupRes.cookie.includes('playarena_token')), 'HttpOnly cookie set upon registration');

    const userCookie = signupRes.cookie;

    // 3. User Login
    console.log('\n3. Testing Login & Session Retrieval:');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: userEmail,
      password: 'Password@123',
    });
    assert(loginRes.status === 200, 'User login succeeds with correct credentials');

    // 4. Get Current User (/api/auth/me)
    const meRes = await makeRequest('GET', '/api/auth/me', null, userCookie);
    assert(meRes.status === 200, 'GET /api/auth/me returns authenticated user details');
    assert(meRes.body.user.email === userEmail, 'Current user email matches session');

    // 5. Admin Authentication
    console.log('\n4. Testing Admin Role & Authorization:');
    const adminLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: process.env.ADMIN_EMAIL || 'admin@7sports.com',
      password: 'Admin@12345',
    });
    assert(adminLoginRes.status === 200, 'Admin logs in successfully');
    assert(adminLoginRes.body.user.role === 'admin', 'Admin user has role="admin"');
    const adminCookie = adminLoginRes.cookie;

    // 6. Test Forbidden Access
    console.log('\n5. Testing Role-Based API Protection:');
    const forbiddenVenueCreate = await makeRequest(
      'POST',
      '/api/venues',
      { name: 'Illegal Venue' },
      userCookie
    );
    assert(forbiddenVenueCreate.status === 403, 'Regular user cannot create venue (403 Forbidden)');

    const forbiddenAdminStats = await makeRequest('GET', '/api/users/admin/stats', null, userCookie);
    assert(forbiddenAdminStats.status === 403, 'Regular user cannot view admin stats (403 Forbidden)');

    const allowedAdminStats = await makeRequest('GET', '/api/users/admin/stats', null, adminCookie);
    assert(allowedAdminStats.status === 200, 'Admin user can access /api/users/admin/stats (200 OK)');
    assert(allowedAdminStats.body.stats.totalVenues > 0, 'Admin stats report positive total venues');

    // 7. Venue Listing & Filters
    console.log('\n6. Testing Venue Exploration & Filters:');
    const allVenues = await makeRequest('GET', '/api/venues');
    assert(allVenues.status === 200, 'Public venue exploration returns 200 OK');
    assert(allVenues.body.count >= 8, 'At least 8 venues seeded across Nagpur, Pune, Mumbai');

    const puneVenues = await makeRequest('GET', '/api/venues?city=Pune');
    assert(puneVenues.body.venues.every((v) => v.city === 'Pune'), 'City filter correctly filters by Pune');

    const cricketVenues = await makeRequest('GET', '/api/venues?sport=cricket');
    assert(cricketVenues.body.venues.every((v) => v.sport === 'cricket'), 'Sport filter correctly filters by cricket');

    const sortedPrice = await makeRequest('GET', '/api/venues?sort=price_asc');
    let isSorted = true;
    for (let i = 0; i < sortedPrice.body.venues.length - 1; i++) {
      if (sortedPrice.body.venues[i].hourlyPrice > sortedPrice.body.venues[i + 1].hourlyPrice) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Sort by price_asc sorts venues in ascending price order');

    // 8. 14-Day Rolling Window & Slot Availability
    console.log('\n7. Testing 14-Day Rolling Slots & Past Slot Protection:');
    const testVenue = allVenues.body.venues[0];
    const availabilityRes = await makeRequest('GET', `/api/venues/${testVenue._id}/availability`);
    assert(availabilityRes.status === 200, 'Venue availability returns 200 OK');
    assert(availabilityRes.body.rollingDays.length === 14, 'Availability generates rolling 14-day window');
    assert(availabilityRes.body.slots.length > 0, 'Hourly slots generated between opening and closing hours');

    // Target a future date in the window (day 3) to test booking
    const futureDate = availabilityRes.body.rollingDays[3].date;
    const futureDayAvail = await makeRequest('GET', `/api/venues/${testVenue._id}/availability?date=${futureDate}`);
    const availableSlot = futureDayAvail.body.slots.find((s) => s.isAvailable) || futureDayAvail.body.slots[0];
    const testSlotHour = availableSlot.startHour;

    // Clean up any existing booking for this specific test slot to guarantee clean test state
    await Booking.deleteMany({ venue: testVenue._id, bookingDate: futureDate, startHour: testSlotHour });

    // 9. Booking Creation
    console.log('\n8. Testing Booking Creation & Authoritative Price:');
    const bookRes = await makeRequest(
      'POST',
      '/api/bookings',
      {
        venueId: testVenue._id,
        bookingDate: futureDate,
        startHour: testSlotHour,
      },
      userCookie
    );
    assert(bookRes.status === 201, 'User successfully books available slot (201 Created)');
    assert(bookRes.body.booking?.bookingReference.startsWith('PA-'), 'Generates unique booking reference (PA-...)');
    assert(bookRes.body.booking?.price === testVenue.hourlyPrice, 'Server sets authoritative price from DB');
    assert(bookRes.body.booking?.paymentMethod === 'PAY_AT_VENUE', 'Payment method marked as PAY_AT_VENUE');
    const createdBooking = bookRes.body.booking;

    // 10. CRITICAL DOUBLE-BOOKING CONCURRENCY RACE CONDITION TEST
    console.log('\n9. Testing Database-Level Double Booking Prevention:');
    // Create second user
    const secondUserEmail = `second_player_${Date.now()}@example.com`;
    const user2Signup = await makeRequest('POST', '/api/auth/register', {
      name: 'Amit Patel',
      email: secondUserEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    const user2Cookie = user2Signup.cookie;

    // Simulate two simultaneous requests hitting the same slot (day 4)
    const raceDate = availabilityRes.body.rollingDays[4].date;
    const raceHour = 19;
    await Booking.deleteMany({ venue: testVenue._id, bookingDate: raceDate, startHour: raceHour });

    const [resA, resB] = await Promise.all([
      makeRequest(
        'POST',
        '/api/bookings',
        { venueId: testVenue._id, bookingDate: raceDate, startHour: raceHour },
        userCookie
      ),
      makeRequest(
        'POST',
        '/api/bookings',
        { venueId: testVenue._id, bookingDate: raceDate, startHour: raceHour },
        user2Cookie
      ),
    ]);

    const oneSucceeded = (resA.status === 201 && resB.status === 409) || (resA.status === 409 && resB.status === 201);
    assert(
      oneSucceeded,
      `CONCURRENCY TEST: Exactly 1 request succeeded (201) and 1 received 409 Conflict! (Statuses: A=${resA.status}, B=${resB.status})`
    );

    // 11. Cancellation & Slot Release
    console.log('\n10. Testing Cancellation & Slot Release:');
    const cancelRes = await makeRequest(
      'PATCH',
      `/api/bookings/${createdBooking._id}/cancel`,
      { reason: 'Change of schedule' },
      userCookie
    );
    assert(cancelRes.status === 200, 'User can cancel their own upcoming booking (200 OK)');
    assert(cancelRes.body.booking.status === 'CANCELLED', 'Booking status updated to CANCELLED in DB');

    // Slot should now be available again! User 2 should be able to book it now
    const rebookRes = await makeRequest(
      'POST',
      '/api/bookings',
      {
        venueId: testVenue._id,
        bookingDate: futureDate,
        startHour: testSlotHour,
      },
      user2Cookie
    );
    assert(
      rebookRes.status === 201,
      'Slot released! Another user can now book the cancelled slot without conflicts'
    );

    // 12. Ownership Security
    console.log('\n11. Testing Ownership & Data Privacy:');
    // User 1 tries to view User 2's new booking
    const privateBookingId = rebookRes.body.booking._id;
    const trespassRes = await makeRequest('GET', `/api/bookings/${privateBookingId}`, null, userCookie);
    assert(trespassRes.status === 403, 'User A cannot view User B’s private booking (403 Forbidden)');

    // User 1 tries to cancel User 2's booking
    const trespassCancel = await makeRequest(
      'PATCH',
      `/api/bookings/${privateBookingId}/cancel`,
      {},
      userCookie
    );
    assert(trespassCancel.status === 403, 'User A cannot cancel User B’s booking (403 Forbidden)');

    // User 2 views their own bookings
    const myBookingsRes = await makeRequest('GET', '/api/bookings/my-bookings', null, user2Cookie);
    assert(myBookingsRes.status === 200, 'User can view their own booking history');
    assert(
      myBookingsRes.body.bookings.some((b) => b._id === privateBookingId),
      'User bookings list contains their booked slots'
    );

    // 13. Profile Update (Email is Read-Only)
    console.log('\n12. Testing Profile Update (Email Protection):');
    const updateProfileRes = await makeRequest(
      'PUT',
      '/api/users/profile',
      { name: 'Rohan Updated', email: 'hacked@example.com', phone: '+91 99999 88888' },
      userCookie
    );
    assert(updateProfileRes.status === 200, 'Profile name and phone updated successfully');
    assert(updateProfileRes.body.user.name === 'Rohan Updated', 'Name changed to Rohan Updated');
    assert(updateProfileRes.body.user.email === userEmail, 'Email remains strictly read-only and unchanged');

    console.log('\n======================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
