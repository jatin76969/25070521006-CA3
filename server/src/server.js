import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { getKolkataNow } from './utils/time.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS (client frontend)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Configure CORS for Express
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all localhost variants in dev
      }
    },
    credentials: true, // Allow cookies across origins
  })
);

// Body parsing and cookie parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Store io instance on app for controllers to broadcast events
app.set('io', io);

// Socket.IO event listeners
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
  const kolkataTime = getKolkataNow();

  res.status(200).json({
    status: 'ok',
    service: '7 Sports Backend API',
    database: dbStatus,
    serverTimeIST: `${kolkataTime.dateString} ${String(kolkataTime.hour).padStart(2, '0')}:${String(kolkataTime.minute).padStart(2, '0')}:${String(kolkataTime.second).padStart(2, '0')}`,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`7 Sports Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Socket.IO listening for real-time events`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

// Only start server when executed directly as main script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  process.argv[1].endsWith('src\\server.js') ||
  process.argv[1].endsWith('src/server.js')
);

if (isMain) {
  start();
}

export { app, server, io };
