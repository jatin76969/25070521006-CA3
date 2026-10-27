# 7 Sports — Sports Turf & Court Booking System

> **College Second-Year Engineering Project**  
> Full-Stack Web Application built with React (Vite), Express.js, MongoDB (Mongoose), and Socket.IO for real-time slot synchronization.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Folder Structure & Viva Walkthrough](#project-folder-structure--viva-walkthrough)
5. [Prerequisites & Windows Setup](#prerequisites--windows-setup)
6. [Environment Variables Setup](#environment-variables-setup)
7. [Step-by-Step Running Instructions](#step-by-step-running-instructions)
8. [Connecting with MongoDB Compass](#connecting-with-mongodb-compass)
9. [Database Seed & Administrator Setup](#database-seed--administrator-setup)
10. [Architecture & Technical Design (For Viva)](#architecture--technical-design-for-viva)
    - [How Double-Booking Prevention Works](#how-double-booking-prevention-works)
    - [How Real-Time Sync Works with Socket.IO](#how-real-time-sync-works-with-socketio)
    - [Cookie Authentication & Security](#cookie-authentication--security)
    - [Asia/Kolkata Rolling 14-Day Date Engine](#asiakolkata-rolling-14-day-date-engine)
11. [API Routes Reference](#api-routes-reference)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Project Overview

**7 Sports** solves the everyday problem sports enthusiasts face when trying to reserve turf grounds, box cricket arenas, and indoor badminton courts. Instead of making phone calls or arriving at the ground only to discover a conflicting match in progress, 7 Sports provides:
- Live slot availability across a **rolling 14-day calendar window**.
- Instant slot reservation with a unique **Booking Reference ID** (e.g. `PA-20261027-F7K2`).
- A **"Pay at Venue"** workflow explicitly tailored for college demonstration without requiring real credit cards or paid payment gateways.
- Real-time updates pushed to all connected users via **WebSockets (Socket.IO)** whenever a ground is booked or cancelled.
- **Strict database-level concurrency locking** guaranteeing that two users clicking the same slot at the exact same millisecond will result in exactly one successful booking and a friendly conflict response for the second.

---

## 2. Key Features

- **Home Page**: Hero showcase ("*Your Game. Your Ground. Your Time.*"), quick search by city, venue, and sport category, featured grounds loaded from MongoDB, and an interactive 3-step walkthrough.
- **Authentication**: Split-screen responsive sign-up and login with password visibility toggle, client-side validation, password hashing with bcrypt, and secure session management via `HttpOnly` cookies.
- **Explore Venues**: Search, city filters (Nagpur, Pune, Mumbai), sport categories (Cricket, Football, Badminton, Basketball), and price sorting (Low to High, High to Low). Seeded grounds are transparently tagged as fictional demo venues.
- **Venue Details & Dynamic Slot Picker**: Multi-photo gallery, detailed address, court dimensions, surface type, amenities list, and an interactive 14-day date picker. Past dates and elapsed hours for today are disabled automatically.
- **Booking Review & Confirmation**: Shows full price breakdown, clarifies the "Pay at Venue" policy, generates a printable receipt modal, and prevents repeated double-clicks.
- **My Bookings Dashboard**: Filter by All, Upcoming, Past, or Cancelled. Allows one-click cancellation before slot start time, freeing the slot for other players instantly.
- **Player Profile**: Displays member join date and account info; allows updating name and phone while protecting the verified email address as read-only.
- **Admin Dashboard**: Role-protected console with metrics (total users, active grounds, total bookings, revenue), full venue CRUD with safe deactivation (preserves historical bookings), and a global bookings audit table with date filters.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 (JavaScript) + Vite | Fast, responsive single-page application |
| **Routing** | React Router v7 | Client-side routing with protected routes |
| **Icons & UI** | Lucide React + Custom CSS | Clean sport-themed components, no heavy UI bloat |
| **Backend** | Node.js + Express.js | REST API server with MVC architecture |
| **Database** | MongoDB Community Server + Mongoose | Local document database, standalone instance |
| **WebSockets**| Socket.IO | Real-time cross-browser slot synchronization |
| **Security** | bcryptjs + jsonwebtoken + cookie-parser | Encrypted passwords, signed JWTs in HttpOnly cookies |
| **Rate Limiter**| express-rate-limit | Brute-force protection on authentication endpoints |

---

## 4. Project Folder Structure & Viva Walkthrough

When presenting this project in your viva, open this structure to explain the clean separation of concerns:

```
7Sports/
├── client/                     # Frontend React application (Vite)
│   ├── public/                 # Static assets and icons
│   ├── src/
│   │   ├── api/                # API client functions (fetch with credentials)
│   │   │   ├── client.js       # Base HTTP wrapper for /api requests
│   │   │   ├── auth.js         # Register, Login, Logout, getMe
│   │   │   ├── venues.js       # Venue queries and admin CRUD
│   │   │   ├── bookings.js     # Booking creation, my-bookings, cancel
│   │   │   └── users.js        # Profile updates and admin statistics
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Top navigation with auth badge and mobile drawer
│   │   │   ├── Footer.jsx      # Multi-column sports footer with college note
│   │   │   ├── VenueCard.jsx   # Venue card with image fallback and demo tags
│   │   │   ├── BookingModal.jsx# Review, confirmation, and print view
│   │   │   ├── CancelModal.jsx # Cancellation confirmation dialog
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/            # React Context state providers
│   │   │   ├── AuthContext.jsx # User state, login/logout, role checking
│   │   │   ├── ToastContext.jsx# Non-blocking notification toasts
│   │   │   └── SocketContext.jsx # WebSocket client with auto-reconnection
│   │   ├── pages/              # Linked route views
│   │   │   ├── Home.jsx        # Landing hero, search bar, categories, steps
│   │   │   ├── Explore.jsx     # Search filters, sorting, venue catalog
│   │   │   ├── VenueDetail.jsx # Gallery, 14-day date picker, live slots
│   │   │   ├── Login.jsx       # Split-screen player login
│   │   │   ├── Signup.jsx      # Split-screen registration
│   │   │   ├── MyBookings.jsx  # Player booking history & receipts
│   │   │   ├── Profile.jsx     # Editable name/phone, locked email
│   │   │   ├── AdminDashboard.jsx # Analytics, venue manager, booking audit
│   │   │   └── NotFound.jsx    # 404 error page
│   │   ├── App.jsx             # Route definitions & protected route guards
│   │   ├── index.css           # Complete responsive theme & print stylesheet
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js          # Proxies /api and /socket.io to backend port 5000
│
├── server/                     # Backend Node.js REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose MongoDB connection & error reporting
│   │   ├── controllers/        # Business logic controllers
│   │   │   ├── authController.js   # User registration, login, cookies
│   │   │   ├── venueController.js  # Venues listing, 14-day slot availability
│   │   │   ├── bookingController.js# Concurrency locking, book, cancel
│   │   │   └── userController.js   # Profile and admin dashboard stats
│   │   ├── middleware/         # Express middlewares
│   │   │   ├── auth.js         # JWT verification & role authorization
│   │   │   ├── rateLimiter.js  # Rate limits for login/signup
│   │   │   └── errorHandler.js # Handles duplicate keys (11000) & validation
│   │   ├── models/             # Mongoose database schemas
│   │   │   ├── User.js         # User model with bcrypt pre-save hashing
│   │   │   ├── Venue.js        # Sports grounds, amenities, operating hours
│   │   │   └── Booking.js      # Booking model with compound partial unique index
│   │   ├── routes/             # Express API endpoint declarations
│   │   │   ├── authRoutes.js
│   │   │   ├── venueRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── scripts/            # CLI utilities
│   │   │   ├── seed.js         # Idempotent seed: 9 fictional venues in MH
│   │   │   └── createAdmin.js  # Secure admin account generator
│   │   ├── utils/
│   │   │   └── time.js         # Asia/Kolkata date calculations & 14-day generator
│   │   └── server.js           # Express app, HTTP server, and Socket.IO engine
│   ├── tests/                  # Automated verification test suites
│   │   ├── verify-all.js       # 37-test suite for Auth, Race Conditions, RBAC
│   │   └── verify-socket-realtime.js # Real-time multi-browser socket test
│   ├── .env.example            # Environment configuration template
│   └── package.json
│
├── .gitignore                  # Ignores node_modules, .env, dist, and logs
└── README.md                   # This project guide
```

---

## 5. Prerequisites & Windows Setup

Ensure you have the following installed on your Windows machine:
1. **Node.js (v18 or higher)**: Check with `node -v` in PowerShell.
2. **MongoDB Community Server**:
   - The Windows MongoDB service runs locally on port `27017`.
   - Verify it is running by typing in PowerShell:
     ```powershell
     Get-Service -Name MongoDB
     ```
   - If stopped, start it with:
     ```powershell
     Start-Service -Name MongoDB
     ```
3. **MongoDB Compass** (optional GUI): Used to visually inspect collections and documents.

---

## 6. Environment Variables Setup

The server uses a `.env` file for configuration. A pre-configured `.env` is already created for you in the `server` directory.

If you ever need to recreate it, copy `server/.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/7sports
CLIENT_URL=http://localhost:5173
JWT_SECRET=7sports_college_demo_jwt_secret_key_2026_sports
JWT_EXPIRES_IN=7d
COOKIE_NAME=7sports_token
```

---

## 7. Step-by-Step Running Instructions

Open **two separate PowerShell terminals** in VS Code or Windows Terminal.

### Terminal 1: Backend Server (Node.js + Express)
```powershell
# Navigate to the server folder
cd server

# Install dependencies (only needed once)
npm install

# Seed fictional demonstration venues across Nagpur, Pune, and Mumbai
npm run seed

# Create or verify the Administrator account
npm run create-admin

# Start the backend in development watch mode
npm run dev
```
> The backend server will start on: **`http://localhost:5000`**  
> Health check URL: **`http://localhost:5000/api/health`**

---

### Terminal 2: Frontend Client (React + Vite)
```powershell
# Navigate to the client folder
cd client

# Install dependencies (only needed once)
npm install

# Start the Vite development server
npm run dev
```
> The frontend client will start on: **`http://localhost:5173`**  
> Open your browser and navigate to: **`http://localhost:5173`**

---

## 8. Connecting with MongoDB Compass

To inspect the live database with MongoDB Compass:
1. Open **MongoDB Compass**.
2. In the **New Connection** field, enter:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left navigation bar, click the **`7sports`** database. You will see three collections:
   - `users`: Stores player and administrator records with hashed passwords.
   - `venues`: Stores grounds across Nagpur, Pune, and Mumbai with operating hours, amenities, and hourly rates.
   - `bookings`: Stores slot reservations with status (`CONFIRMED` or `CANCELLED`) and the compound unique index.

---

## 9. Database Seed & Administrator Setup

### Idempotent Seed Command
```powershell
cd server
npm run seed
```
- Populates 9 demonstration venues across **Nagpur, Pune, and Mumbai** covering Cricket, Football, Badminton, and Basketball.
- Safe and **idempotent**: it updates venue info without wiping existing user accounts or active booking history.

### Administrator Setup Command
Public sign-up is strictly locked to create regular player accounts only. To create an administrator:
```powershell
cd server
npm run create-admin
```
**Default Admin Credentials:**
- **Email**: `admin@7sports.com`
- **Password**: `Admin@12345`
- **Role**: `admin`

Log in at `http://localhost:5173/login` using these credentials to access the **Admin Console** at `http://localhost:5173/admin`.

---

## 10. Architecture & Technical Design (For Viva)

### How Double-Booking Prevention Works
*Viva Question: "How do you ensure two users don't book the same court at the same time?"*

1. **Database-Level Partial Unique Index**:  
   We do not rely solely on frontend button disabling. In `server/src/models/Booking.js`, we define:
   ```javascript
   bookingSchema.index(
     { venue: 1, bookingDate: 1, timeSlot: 1 },
     { unique: true, partialFilterExpression: { status: 'CONFIRMED' } }
   );
   ```
2. **Atomic Ingestion**:  
   When two users hit "Confirm" at the same instant, MongoDB attempts to write both documents. The first document is inserted with status `'CONFIRMED'`. The second document immediately triggers a **MongoDB Duplicate Key Error (`E11000`)**.
3. **Graceful Conflict Handling**:  
   The centralized error handler catches error `11000` and returns an HTTP `409 Conflict` status with the message:
   `"This time slot was just booked by another user. Please select an alternate slot."`
4. **Slot Release on Cancellation**:  
   Because the unique index only applies where `status: 'CONFIRMED'`, when a booking is cancelled (`status: 'CANCELLED'`), the unique constraint is released immediately. Other players can book that slot without needing to delete past audit history.
5. **Standalone Compatible**:  
   This design works on a normal standalone MongoDB Community Server without requiring replica set transactions or change streams.

### How Real-Time Sync Works with Socket.IO
*Viva Question: "How does the second browser know a slot was booked without refreshing?"*

1. When a booking or cancellation is saved in MongoDB, the backend emits a Socket.IO event:
   ```javascript
   io.emit('slot_status_changed', {
     venueId: booking.venue,
     bookingDate: booking.bookingDate,
     timeSlot: booking.timeSlot,
     status: 'BOOKED' // or 'AVAILABLE'
   });
   ```
2. In `client/src/pages/VenueDetail.jsx`, the client listens for this event:
   - If the user is currently looking at the same venue and date, the slot button turns grey (`Booked`) or green (`Available`) in real-time.
   - If the user had that specific slot selected in their sidebar, a warning toast alerts them and clears their selection.
3. **Data Privacy**: No user details, names, or emails are broadcast over WebSockets—only the venue ID, date, and slot status.
4. **Auto-Reconnection**: If the network hiccups, `SocketContext.jsx` automatically re-fetches the latest slots from the REST API upon reconnection.

### Cookie Authentication & Security
- Uses signed JWTs stored in `HttpOnly` cookies.
- **Why `HttpOnly`?** JavaScript running in the browser cannot read `HttpOnly` cookies via `document.cookie`, preventing Cross-Site Scripting (XSS) token theft.
- **Credentials Allowed**: All `fetch()` requests use `credentials: 'include'` and CORS has an explicit origin whitelist (`http://localhost:5173`).
- Passwords are never stored in plain text; they are hashed with `bcryptjs` using a salt work factor of 10.

### Asia/Kolkata Rolling 14-Day Date Engine
- The date picker uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` to ensure dates and hours match Indian Standard Time (IST, UTC+5:30) regardless of the host machine's timezone.
- The 14-day window dynamically calculates today + 13 upcoming days, so dates never become obsolete.
- Slots for today that have already passed (e.g., 07:00 when the current time is 15:00) are marked `isPast: true` and cannot be booked.

---

## 11. API Routes Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register player account (always role: `'user'`)
- `POST /api/auth/login` — Sign in with email & password, sets HttpOnly cookie
- `POST /api/auth/logout` — Clears authentication cookie
- `GET  /api/auth/me` — Fetches current logged-in user profile

### Venues (`/api/venues`)
- `GET    /api/venues` — List venues with filters (`city`, `sport`, `search`, `sort`)
- `GET    /api/venues/:id` — Get single venue details
- `GET    /api/venues/:id/availability?date=YYYY-MM-DD` — 14-day rolling slot availability
- `POST   /api/venues` — Create venue *(Admin only)*
- `PUT    /api/venues/:id` — Update venue *(Admin only)*
- `DELETE /api/venues/:id` — Safely deactivate or delete venue *(Admin only)*

### Bookings (`/api/bookings`)
- `POST  /api/bookings` — Create slot booking with double-booking prevention *(Authenticated)*
- `GET   /api/bookings/my-bookings` — List authenticated user's bookings *(Authenticated)*
- `GET   /api/bookings/:id` — Get single booking details *(Ownership checked)*
- `PATCH /api/bookings/:id/cancel` — Cancel booking and release slot *(Ownership checked)*
- `GET   /api/bookings/admin/all` — Global bookings audit *(Admin only)*

### Users & Admin (`/api/users`)
- `PUT /api/users/profile` — Update name and phone (email is read-only) *(Authenticated)*
- `GET /api/users/admin/stats` — Platform metrics & revenue *(Admin only)*

### Health Check (`/api/health`)
- `GET /api/health` — Reports service status, database connectivity, and IST server time.

---

## 12. Troubleshooting Guide

### 1. MongoDB Connection Error (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause**: The local MongoDB service is not running.
- **Solution**: Open PowerShell as Administrator and run:
  ```powershell
  Start-Service -Name MongoDB
  ```
  Then verify with:
  ```powershell
  Get-Service -Name MongoDB
  ```

### 2. Port Occupied (`EADDRINUSE: port 5000` or `port 5173`)
- **Cause**: A previous Node or Vite process did not exit cleanly.
- **Solution**: Find and terminate the process on port 5000:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
  Or change the port in `server/.env` to `PORT=5001`.

### 3. Running Automated Tests
To run the automated verification test suite verifying Auth, Role permissions, Race conditions, Cancellation, and Socket.IO real-time sync:
```powershell
cd server
npm test
```
All tests should report `PASSED`.

---

## Summary for Viva Presentation

| Question | Answer |
| :--- | :--- |
| **Project Title** | 7 Sports — Sports Turf & Court Booking System |
| **Architecture** | Client-Server Architecture (REST API + WebSocket Sidecar) |
| **Frontend** | React 19, Vite, React Router v7, Plain CSS Tokens |
| **Backend** | Node.js, Express.js, Mongoose ODM, Socket.IO |
| **Database** | MongoDB Community Server (standalone local instance on port 27017) |
| **Timezone** | Standardized on `Asia/Kolkata` (IST) across rolling 14-day windows |
| **Payment Model** | Pay-at-venue (Academic college demo; no real cards stored or billed) |
| **Concurrency** | Partial Compound Unique Index `{ venue, bookingDate, timeSlot }` where `status: 'CONFIRMED'` |
| **Real-time Engine** | Socket.IO broadcasting `slot_status_changed` across active sessions |
