process.env.NODE_ENV = 'test';

import http from 'http';
import { io as ClientSocket } from 'socket.io-client';
import dotenv from 'dotenv';
import { app, server } from '../src/server.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Venue from '../src/models/Venue.js';
import Booking from '../src/models/Booking.js';
import { getRolling14Days } from '../src/utils/time.js';

dotenv.config();

function makeRequest(baseUrl, method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      const setCookie = res.headers['set-cookie'];
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(data); } catch (e) { parsed = { raw: data }; }
        resolve({
          status: res.statusCode,
          cookie: setCookie ? setCookie[0].split(';')[0] : null,
          body: parsed,
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runSocketVerification() {
  console.log('\n======================================================');
  console.log('TESTING REAL-TIME SOCKET.IO CROSS-BROWSER SYNC');
  console.log('======================================================\n');

  await connectDB();

  const port = 8089;
  await new Promise((resolve) => server.listen(port, resolve));
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Running on ${baseUrl}`);

  try {
    // 1. Create User
    const email = `socket_tester_${Date.now()}@example.com`;
    const signup = await makeRequest(baseUrl, 'POST', '/api/auth/register', {
      name: 'Socket User',
      email,
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    const userCookie = signup.cookie;

    // 2. Fetch a test venue
    const venue = await Venue.findOne({ isActive: true });
    if (!venue) throw new Error('No active venue found in DB');

    const rollingDays = getRolling14Days();
    const testDate = rollingDays[5].date;
    const testSlotHour = 17;
    const testSlotLabel = '17:00 - 18:00';

    // 3. Connect 2 Client Sockets (Simulating Browser 1 and Browser 2)
    const client1 = ClientSocket(baseUrl, { transports: ['websocket'] });
    const client2 = ClientSocket(baseUrl, { transports: ['websocket'] });

    await Promise.all([
      new Promise((res) => client1.on('connect', res)),
      new Promise((res) => client2.on('connect', res)),
    ]);
    console.log('  [PASS] Browser 1 & Browser 2 connected via WebSockets');

    // 4. Test Booking Broadcast: Browser 1 books, Browser 2 must receive event
    const bookingEventPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout waiting for booking socket event')), 4000);
      client2.on('slot_status_changed', (payload) => {
        if (payload.venueId === String(venue._id) && payload.bookingDate === testDate && payload.timeSlot === testSlotLabel) {
          clearTimeout(timer);
          resolve(payload);
        }
      });
    });

    const bookRes = await makeRequest(
      baseUrl,
      'POST',
      '/api/bookings',
      {
        venueId: venue._id,
        bookingDate: testDate,
        startHour: testSlotHour,
      },
      userCookie
    );

    if (bookRes.status !== 201) {
      throw new Error(`Booking failed: ${JSON.stringify(bookRes.body)}`);
    }

    const broadcastPayload = await bookingEventPromise;
    console.log('  [PASS] Browser 2 received live slot_status_changed event on booking:');
    console.log(`         Venue: ${broadcastPayload.venueId}, Date: ${broadcastPayload.bookingDate}, Slot: ${broadcastPayload.timeSlot}, Status: ${broadcastPayload.status}`);

    if (broadcastPayload.user || broadcastPayload.email) {
      throw new Error('SECURITY VIOLATION: Private user details leaked in socket broadcast event!');
    }
    console.log('  [PASS] Privacy Verified: No private user details were broadcast in socket event');

    // 5. Test Cancellation Broadcast: Browser 1 cancels, Browser 2 must receive event
    const cancelEventPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout waiting for cancellation socket event')), 4000);
      client2.on('slot_status_changed', (payload) => {
        if (
          payload.venueId === String(venue._id) &&
          payload.bookingDate === testDate &&
          payload.timeSlot === testSlotLabel &&
          payload.status === 'AVAILABLE'
        ) {
          clearTimeout(timer);
          resolve(payload);
        }
      });
    });

    const cancelRes = await makeRequest(
      baseUrl,
      'PATCH',
      `/api/bookings/${bookRes.body.booking._id}/cancel`,
      { reason: 'Testing cancellation broadcast' },
      userCookie
    );

    if (cancelRes.status !== 200) {
      throw new Error(`Cancellation failed: ${JSON.stringify(cancelRes.body)}`);
    }

    const cancelPayload = await cancelEventPromise;
    console.log('  [PASS] Browser 2 received live slot_status_changed event on cancellation:');
    console.log(`         Slot ${cancelPayload.timeSlot} released and marked AVAILABLE in real-time across sessions!`);

    client1.disconnect();
    client2.disconnect();
    server.close();

    console.log('\n======================================================');
    console.log('REAL-TIME SOCKET VERIFICATION PASSED COMPLETELY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Socket Test Error:', err);
    server.close();
    process.exit(1);
  }
}

runSocketVerification();
